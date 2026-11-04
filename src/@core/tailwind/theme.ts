/**
 * @core 设计令牌：暖玉宣纸、浓墨、朱砂金与中文排版栈。
 * 「田野温馨」控制层补充稻田色板：米浆、稻草、禾苗、田土与灶火。
 * tailwind.config.ts 只负责装配，具体令牌由核心层维护。
 */
export const coreTheme = {
  colors: {
    paper: {
      DEFAULT: '#FFFDF9',
      cream: '#FDFAF3',
      muted: '#F5EBE1',
      deep: '#F6F1E6',
      hover: '#FDF3E7'
    },
    ink: {
      DEFAULT: '#18110C',
      soft: '#5C3A21',
      night: '#1E242B'
    },
    gold: {
      DEFAULT: '#D4A359',
      deep: '#C85A17'
    },
    persimmon: '#EA7A2E',
    field: {
      rice: '#FAF3E2',
      'rice-deep': '#F1E4C9',
      dew: '#FFFBF0',
      straw: '#D9A653',
      'straw-deep': '#B07C31',
      'straw-soft': '#EEDCB4',
      sprout: '#789150',
      'sprout-deep': '#4F6538',
      'sprout-mist': '#E5EBD3',
      soil: '#7B5B41',
      'soil-deep': '#4A3423',
      hearth: '#C4653A',
      'hearth-deep': '#A34E27'
    }
  },
  fontFamily: {
    sans: [
      '"PingFang SC"',
      '"Hiragino Sans GB"',
      '"Microsoft YaHei"',
      '"Noto Sans SC"',
      'system-ui',
      'sans-serif'
    ],
    song: ['"Songti SC"', '"Noto Serif SC"', '"STSong"', 'serif'],
    kai: ['"Kaiti SC"', '"STKaiti"', '"KaiTi"', '"Noto Serif SC"', 'serif'],
    talisman: ['"STXingkai"', '"Xingkai SC"', '"STKaiti"', '"Kaiti SC"', '"KaiTi"', 'serif']
  }
}
