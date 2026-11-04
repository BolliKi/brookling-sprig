#!/usr/bin/env node
/**
 * 预生成禾禾的固定台词音频，并写入 src/configs/voice-manifest.json。
 *
 * 用法：
 *   npm run voice:generate                     # 默认只生成 CRISP_GIRL
 *   npm run voice:generate -- --preset=all     # 生成三套童声
 *   npm run voice:generate -- --force          # 强制重录
 *   npm run voice:generate -- --dry-run        # 只统计台词，不调用 TTS
 *
 * 依赖 Node 22.6+（原生 TypeScript 类型擦除）与 uv/uvx（edge-tts）。
 * 音频写入 public/voice/<preset-slug>/，清单写入 src/configs/voice-manifest.json。
 */

import { createHash } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { BELL_SPEECH, INITIAL_DIALOGUE } from '../src/configs/companion-seeds.ts'
import { EMOTION_STATES } from '../src/configs/emotions.ts'
import { analyzeUserInput } from '../src/libs/intent/analyze-user-input.ts'
import { cleanSpeechText } from '../src/libs/speech/clean-speech-text.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VOICE_ROOT = join(ROOT, 'public', 'voice')
const MANIFEST_PATH = join(ROOT, 'src', 'configs', 'voice-manifest.json')

const EMOTIONS = ['IDLE', 'HAPPY', 'SHY', 'SLEEPY']

/**
 * 三套童声的生成参数。
 * Edge TTS 的 pitch 单位是 Hz，rate 是百分比；这里按情绪做近似映射，
 * 与 voice-presets.ts 中运行时 TTS 的音调/语速方向保持一致。
 */
const PRESET_PLANS = {
  CRISP_GIRL: {
    slug: 'crisp-girl',
    voice: 'zh-CN-XiaoyiNeural',
    basePitchHz: 15,
    baseRatePercent: 2,
    emotions: {
      IDLE: { pitchHz: 15, ratePercent: 2 },
      HAPPY: { pitchHz: 18, ratePercent: 8 },
      SHY: { pitchHz: 10, ratePercent: -6 },
      SLEEPY: { pitchHz: 5, ratePercent: -12 }
    }
  },
  SWEET_TODDLER: {
    slug: 'sweet-toddler',
    voice: 'zh-CN-XiaoxiaoNeural',
    basePitchHz: 35,
    baseRatePercent: -4,
    emotions: {
      IDLE: { pitchHz: 35, ratePercent: -4 },
      HAPPY: { pitchHz: 38, ratePercent: 2 },
      SHY: { pitchHz: 32, ratePercent: -10 },
      SLEEPY: { pitchHz: 28, ratePercent: -16 }
    }
  },
  LIVELY_YOUTH: {
    slug: 'lively-youth',
    voice: 'zh-CN-YunxiaNeural',
    basePitchHz: 0,
    baseRatePercent: 6,
    emotions: {
      IDLE: { pitchHz: 0, ratePercent: 6 },
      HAPPY: { pitchHz: 3, ratePercent: 12 },
      SHY: { pitchHz: -2, ratePercent: -2 },
      SLEEPY: { pitchHz: -4, ratePercent: -8 }
    }
  }
}

const DEFAULT_PRESET = 'CRISP_GIRL'

/** 用真实意图识别器取样固定回复；新增意图时在这里补一条触发词即可。 */
const INTENT_PROBES = [
  '举起双手',
  '跳支舞',
  '跳一下',
  '摸摸头',
  '藏尾巴',
  '对手指',
  '打哈欠',
  '点头打盹',
  '理毛',
  '看风景',
  '好累',
  '难过',
  '太好了',
  '晚安',
  '夸夸你',
  '亲亲'
]

const FALLBACK_INTENT_TAGS = new Set(['心情感知 · 愉悦交流', '心情感知 · 静心倾听'])

function parseArgs(argv) {
  const force = argv.includes('--force')
  const dryRun = argv.includes('--dry-run')
  const presetArg = argv.find((arg) => arg.startsWith('--preset='))?.split('=')[1]
  const selectedPresets =
    presetArg === 'all'
      ? Object.keys(PRESET_PLANS)
      : [presetArg || DEFAULT_PRESET]

  const unknownPreset = selectedPresets.find((key) => !PRESET_PLANS[key])
  if (unknownPreset) {
    console.error(`未知童声预设：${unknownPreset}`)
    console.error(`可选值：${Object.keys(PRESET_PLANS).join(', ')}, all`)
    process.exit(1)
  }

  return { force, dryRun, selectedPresets }
}

function addCorpus(corpus, text, emotion, kind, source) {
  if (!text || !emotion || !EMOTIONS.includes(emotion)) return
  const key = `${emotion}\u0000${text}`
  if (!corpus.has(key)) {
    corpus.set(key, { text, emotion, kind, source })
    return
  }

  const existing = corpus.get(key)
  if (!existing.source.includes(source)) {
    existing.source = `${existing.source} | ${source}`
  }
}

function buildCorpus() {
  const corpus = new Map()

  for (const state of Object.values(EMOTION_STATES)) {
    for (const variant of state.variants) {
      variant.speeches.forEach((text, index) => {
        addCorpus(corpus, text, state.id, 'emotion', `${state.id}/${variant.id}#${index}`)
      })
    }
  }

  for (const probe of INTENT_PROBES) {
    const result = analyzeUserInput(probe)
    if (FALLBACK_INTENT_TAGS.has(result.intentTag)) continue
    addCorpus(corpus, result.customReply, result.targetState, 'intent', `intent:${probe}`)
  }

  for (const emotion of EMOTIONS) {
    addCorpus(corpus, BELL_SPEECH, emotion, 'bell', 'bell:风铎')
  }

  for (const message of INITIAL_DIALOGUE) {
    if (message.role !== 'companion' || !message.emotion) continue
    addCorpus(corpus, message.text, message.emotion, 'seed', `seed:${message.id}`)
  }

  return [...corpus.values()]
}

function signed(value, unit) {
  return `${value >= 0 ? '+' : ''}${value}${unit}`
}

function hashClip(presetKey, item, params) {
  return createHash('sha1')
    .update(
      `${presetKey}|${item.emotion}|${params.pitchHz}|${params.ratePercent}|${item.text}`
    )
    .digest('hex')
    .slice(0, 12)
}

function mp3DurationSeconds(filePath) {
  // edge-tts 固定输出 24kHz / 48kbps CBR MP3；清单时长只作口型兜底，
  // 运行时仍以 audio.duration 的真实值为准。
  try {
    return Number(((statSync(filePath).size * 8) / 48000).toFixed(3))
  } catch {
    return 0
  }
}

function runEdgeTts(text, plan, params, outFile) {
  return new Promise((resolvePromise) => {
    const child = spawn(
      'uvx',
      [
        'edge-tts',
        '--voice',
        plan.voice,
        `--rate=${signed(params.ratePercent, '%')}`,
        `--pitch=${signed(params.pitchHz, 'Hz')}`,
        '--text',
        text,
        '--write-media',
        outFile
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] }
    )

    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('error', (error) => {
      resolvePromise({ code: -1, stderr: String(error) })
    })
    child.on('close', (code) => {
      resolvePromise({ code: code ?? -1, stderr: stderr.trim() })
    })
  })
}

async function synthesizeWithRetry(text, plan, params, outFile) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const result = await runEdgeTts(text, plan, params, outFile)

    if (
      result.code === 0 &&
      existsSync(outFile) &&
      statSync(outFile).size > 0
    ) {
      return true
    }

    if (existsSync(outFile)) {
      try {
        unlinkSync(outFile)
      } catch {
        // 忽略清理失败，下一次写文件会覆盖
      }
    }

    if (attempt < 3) {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 700 * attempt))
    } else {
      console.error(`  生成失败：${result.stderr || `退出码 ${result.code}`}`)
    }
  }

  return false
}

function readExistingManifest() {
  if (!existsSync(MANIFEST_PATH)) return null
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  } catch {
    return null
  }
}

async function main() {
  const { force, dryRun, selectedPresets } = parseArgs(process.argv.slice(2))
  const corpus = buildCorpus()

  const kindCounts = corpus.reduce((counts, item) => {
    counts[item.kind] = (counts[item.kind] || 0) + 1
    return counts
  }, {})

  console.log(
    `固定台词 ${corpus.length} 条（动作 ${kindCounts.emotion || 0} / 意图 ${
      kindCounts.intent || 0
    } / 风铎 ${kindCounts.bell || 0} / 初始 ${kindCounts.seed || 0}）`
  )
  console.log(`目标童声：${selectedPresets.join(', ')}${dryRun ? '（dry-run）' : ''}`)

  if (dryRun) {
    for (const item of corpus) {
      console.log(`  [${item.emotion}] ${item.text.slice(0, 28)}…  ← ${item.source}`)
    }
    return
  }

  const probe = spawnSync('uvx', ['--version'], { encoding: 'utf8' })
  if (probe.error) {
    console.error('未找到 uvx。请先安装 uv（macOS: brew install uv），或改用 edge-tts。')
    process.exit(1)
  }

  const existingManifest = readExistingManifest()
  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    presets: existingManifest?.presets || {}
  }

  let processed = 0
  let generated = 0
  let skipped = 0
  let failures = 0
  const total = corpus.length * selectedPresets.length

  for (const presetKey of selectedPresets) {
    const plan = PRESET_PLANS[presetKey]
    const outDir = join(VOICE_ROOT, plan.slug)
    mkdirSync(outDir, { recursive: true })

    const entries = {}

    for (const item of corpus) {
      processed += 1
      const params = plan.emotions[item.emotion]
      const fileName = `${item.emotion.toLowerCase()}-${hashClip(
        presetKey,
        item,
        params
      )}.mp3`
      const absoluteFile = join(outDir, fileName)
      const publicFile = `/voice/${plan.slug}/${fileName}`
      const speechText = cleanSpeechText(item.text)

      if (!force && existsSync(absoluteFile) && statSync(absoluteFile).size > 0) {
        skipped += 1
      } else {
        generated += 1
        const ok = await synthesizeWithRetry(speechText, plan, params, absoluteFile)
        if (!ok) {
          failures += 1
          console.error(`  [${processed}/${total}] ${presetKey} ${item.emotion} 失败`)
          continue
        }
      }

      if (!entries[item.emotion]) entries[item.emotion] = {}
      entries[item.emotion][item.text] = {
        file: publicFile,
        duration: mp3DurationSeconds(absoluteFile),
        kind: item.kind,
        source: item.source
      }

      console.log(
        `  [${processed}/${total}] ${presetKey} ${item.emotion} ${fileName} ${mp3DurationSeconds(
          absoluteFile
        ).toFixed(2)}s`
      )
    }

    manifest.presets[presetKey] = {
      voice: plan.voice,
      pitchHz: plan.basePitchHz,
      ratePercent: plan.baseRatePercent,
      entries
    }
  }

  if (failures > 0) {
    console.error(`\n有 ${failures} 条音频生成失败，清单未写入；修复后可重新运行（已完成的会跳过）。`)
    process.exit(1)
  }

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(
    `\n完成：新生成 ${generated} 条，复用 ${skipped} 条，清单写入 ${MANIFEST_PATH}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
