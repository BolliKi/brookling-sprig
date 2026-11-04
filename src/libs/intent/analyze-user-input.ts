import type { UserIntentResult } from '@/types/companion'

// 本地心情倾诉与动作指令语义识别引擎：识别用户情绪与 12 种动作指令并生成可视化反馈
export function analyzeUserInput(rawText: string): UserIntentResult {
  const text = rawText.trim();

  // ==========================================
  // 一、明确动作指令识别（12 种专属动作精准匹配）
  // ==========================================

  // 1. 动作指令：举起双手 / 亮肉垫 / 击掌
  if (/(举起|双手|举手|举高|肉垫|小爪爪|亮出|击掌|抱抱我)/.test(text)) {
    return {
      targetState: 'HAPPY',
      preferredVariantIndex: 0, // HAPPY_RAISE_PAWS
      customReply: '收到指令啦！我乖乖把两只软乎乎的小爪爪举高高，亮出粉红肉垫给你看～',
      intentTag: '动作指令 · 高举双爪',
      affectionDelta: 8,
      energyDelta: 4
    };
  }

  // 2. 动作指令：跳舞 / 转圈 / 踏歌 / 摇尾起舞
  if (/(跳舞|起舞|转圈|踏歌|扭一扭|跳支舞|摇尾)/.test(text)) {
    return {
      targetState: 'HAPPY',
      preferredVariantIndex: 1, // HAPPY_DANCE_SPIN
      customReply: '这就为你跳支舞！禾禾踩着三瓣山竹小猫爪欢快踏步，大尾巴也跟着节奏摇起来啦～',
      intentTag: '动作指令 · 踏歌起舞',
      affectionDelta: 9,
      energyDelta: 5
    };
  }

  // 3. 动作指令：蹦跳 / 跳高 / 凌空跃起
  if (/(跳一下|蹦高|蹦跳|跳起来|凌空|蹦一蹦)/.test(text)) {
    return {
      targetState: 'HAPPY',
      preferredVariantIndex: 2, // HAPPY_STAR_JUMP
      customReply: '看禾禾凌空一跃！两只小猫后腿用力蹦起，头顶的小雏菊都迎着水榭清风飞扬起来啦！',
      intentTag: '动作指令 · 凌空欢跳',
      affectionDelta: 8,
      energyDelta: 6
    };
  }

  // 4. 动作指令：捂脸 / 摸摸头 / 害羞掩面
  if (/(捂脸|掩面|摸摸头|摸头|捏脸|揉揉脸)/.test(text)) {
    return {
      targetState: 'SHY',
      preferredVariantIndex: 0, // SHY_COVER_CHEEK
      customReply: '呜……被你这么温柔地对待，禾禾害羞得用两只小猫爪捂住发烫的脸颊，耳朵也垂下来啦。',
      intentTag: '动作指令 · 拢爪掩面',
      affectionDelta: 7,
      energyDelta: -1
    };
  }

  // 5. 动作指令：藏尾巴 / 躲起来 / 偷瞄
  if (/(藏尾|躲起来|偷看|偷瞄|抱尾巴|藏起来)/.test(text)) {
    return {
      targetState: 'SHY',
      preferredVariantIndex: 1, // SHY_HIDE_TAIL
      customReply: '禾禾不好意思地把身子侧过去，把琥珀色大尾巴卷到身前，只敢露出圆眼睛偷偷瞄你一眼。',
      intentTag: '动作指令 · 侧身偷瞄',
      affectionDelta: 7,
      energyDelta: -1
    };
  }

  // 6. 动作指令：对手指 / 扭捏 / 低头撒娇
  if (/(对指|手指|扭捏|低头|撒娇|认错)/.test(text)) {
    return {
      targetState: 'SHY',
      preferredVariantIndex: 2, // SHY_FIDGET_PAWS
      customReply: '禾禾乖乖低下小脑袋，两只粉肉垫前爪在暖杏色肚皮前轻轻对指碰了碰，小声向你撒娇。',
      intentTag: '动作指令 · 对指撒娇',
      affectionDelta: 7,
      energyDelta: -1
    };
  }

  // 7. 动作指令：伸懒腰 / 打哈欠
  if (/(哈欠|懒腰|伸展|舒展)/.test(text)) {
    return {
      targetState: 'SLEEPY',
      preferredVariantIndex: 2, // SLEEPY_STRETCH_YAWN
      customReply: '哈啊——禾禾听话地把两只小猫爪高高伸展开，结结实实打了一个软绵绵的大哈欠。',
      intentTag: '动作指令 · 舒展哈欠',
      affectionDelta: 5,
      energyDelta: 10
    };
  }

  // 8. 动作指令：点头打盹 / 小鸡啄米
  if (/(点头|啄米|打盹|眯一会)/.test(text)) {
    return {
      targetState: 'SLEEPY',
      preferredVariantIndex: 1, // SLEEPY_HEAD_NOD
      customReply: '唔……禾禾闭上眼睛，小脑袋像小鸡啄米一样一点一点地打着盹，努力撑着眼皮陪你呢。',
      intentTag: '动作指令 · 点头打盹',
      affectionDelta: 5,
      energyDelta: 10
    };
  }

  // 9. 动作指令：理毛 / 洗脸 / 舔爪子
  if (/(理毛|洗脸|舔爪|擦脸|梳毛)/.test(text)) {
    return {
      targetState: 'IDLE',
      preferredVariantIndex: 2, // IDLE_GROOM_PAW
      customReply: '禾禾乖巧地抬起左前爪蹭了蹭圆脸蛋，把全身绒毛理得蓬松顺滑，干干净净地陪着你。',
      intentTag: '动作指令 · 抬爪理毛',
      affectionDelta: 5,
      energyDelta: 2
    };
  }

  // 10. 动作指令：眺望山水 / 歪头听风 / 看风景
  if (/(风景|远山|看哪|眺望|小船|白鹭|歪头|听风)/.test(text)) {
    return {
      targetState: 'IDLE',
      preferredVariantIndex: 1, // IDLE_LOOK_AROUND
      customReply: '禾禾歪着小脑袋竖起长耳朵，陪你一起眺望平湖上的乌篷船与远山云雾，风声真好听呀。',
      intentTag: '动作指令 · 侧首眺望',
      affectionDelta: 5,
      energyDelta: 2
    };
  }

  // ==========================================
  // 二、用户个人心情倾诉识别（共情回应 + 触发对应抚慰动作）
  // ==========================================

  // 1. 用户表达疲惫、加班、心累、压力大
  if (/(好累|心累|加班|压力|疲惫|忙了一天|辛苦|烦躁|头疼|喘不过气)/.test(text)) {
    return {
      targetState: 'HAPPY',
      preferredVariantIndex: 0, // 高举双爪亮出粉肉垫安慰用户
      customReply: '听出来你今天奔波得好辛苦呀……快坐到水榭回廊下歇一歇，禾禾把软乎乎的粉肉垫举高高给你捏捏解乏！',
      intentTag: '心情感知 · 疲惫抚慰',
      affectionDelta: 9,
      energyDelta: 6
    };
  }

  // 2. 用户表达难过、委屈、伤心、孤单、受挫折
  if (/(难过|伤心|委屈|想哭|不开心|郁闷|孤单|寂寞|被骂|失败|失落|没人理)/.test(text)) {
    return {
      targetState: 'SHY',
      preferredVariantIndex: 2, // 对指扭捏温柔陪伴
      customReply: '抱抱你，看到你难过，禾禾心里也跟着酸酸的……禾禾会一直守在回廊边陪着你，把所有的温柔都留给你。',
      intentTag: '心情感知 · 温柔共情',
      affectionDelta: 10,
      energyDelta: 4
    };
  }

  // 3. 用户表达开心、报喜、激动、好心情
  if (/(好好|好呀|太好了|真好|我好开心|高兴|哈哈|耶|升职|过了|中奖|好消息|超爽|顺利)/.test(text)) {
    return {
      targetState: 'HAPPY',
      preferredVariantIndex: 1, // 欢欣踏歌起舞庆祝
      customReply: '哇！感受到你满满的喜悦啦～禾禾也替你开心得原地跳起小猫舞，快来和禾禾分享这份好心情吧！',
      intentTag: '心情感知 · 同喜同乐',
      affectionDelta: 9,
      energyDelta: 6
    };
  }

  // 4. 用户表达犯困、失眠、晚安、想睡觉
  if (/(睡|晚安|困|休息|夜深|打瞌睡|闭眼|好梦|午休|失眠|熬夜)/.test(text)) {
    return {
      targetState: 'SLEEPY',
      preferredVariantIndex: 0, // 鼻息泡泡酣眠伴睡
      customReply: '呼噜……既然困了就放下心事歇息吧，禾禾吹着圆圆的鼻息泡泡守在床边，伴你入一个山水清朗的好梦。',
      intentTag: '心情感知 · 伴睡安神',
      affectionDelta: 6,
      energyDelta: 14
    };
  }

  // 5. 用户夸奖或调情喜爱禾禾
  if (/(棒|厉害|夸|好看|聪明|真乖|喜欢|爱|漂亮|可爱|贴贴|糯米|团子|优秀|宝贝|亲亲)/.test(text)) {
    const isShyPraise = /(亲亲|宝贝|脸红|嫁|抱紧)/.test(text);
    return {
      targetState: isShyPraise ? 'SHY' : 'HAPPY',
      preferredVariantIndex: null,
      customReply: isShyPraise
        ? '呀……你突然说这么亲昵的话，禾禾害羞得耳朵尖都变成晚霞色啦，只敢捂着脸偷偷看你。'
        : '嘿嘿，被你夸奖的感觉比春天的阳光还要暖和，禾禾开心地连蹦带跳，尾巴摇个不停！',
      intentTag: isShyPraise ? '心情感知 · 害羞心动' : '心情感知 · 欣喜获赞',
      affectionDelta: 8,
      energyDelta: 5
    };
  }

  // 6. 通用日常话语（结合标点语气判断）
  const isExclamatory = /[！!~～]/.test(text);
  const fallbackState = isExclamatory ? 'HAPPY' : 'IDLE';
  return {
    targetState: fallbackState,
    preferredVariantIndex: null,
    customReply: isExclamatory
      ? `听到你充满元气地说「${rawText.slice(0, 14)}」，禾禾也开心地竖起长耳朵，把粉肉垫小爪爪举起来回应你啦！`
      : `嗯嗯，禾禾正站在水榭青石阶前认真听你说「${rawText.slice(0, 14)}」呢，轻轻晃着大尾巴陪你聊天。`,
    intentTag: isExclamatory ? '心情感知 · 愉悦交流' : '心情感知 · 静心倾听',
    affectionDelta: 4,
    energyDelta: 2
  };
}
