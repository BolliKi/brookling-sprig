import type { EmotionKey, EmotionStateConfig } from '@/types/companion'

// 宋韵四时情绪状态：每种状态 3 套专属动作变体与不重复台词库
export const EMOTION_STATES: Record<EmotionKey, EmotionStateConfig> = {
  IDLE: {
    id: 'IDLE',
    code: '状态一 · 待机呼吸',
    shortCode: '状态一',
    label: '待机呼吸',
    themeKey: 'CELADON_MIST',
    breathDuration: '3.8s',
    defaultRevertSec: 0,
    badgeClass: 'text-field-soil-deep bg-field-sprout-mist/90 border-field-sprout-deep/30',
    sceneStory: '天青微雨初霁，远山云雾缭绕，临水回廊清风徐来，青铜风铎偶有清音。',
    description: '禾禾踩着三瓣山竹小猫爪立于水榭青石阶前，随呼吸轻摇大尾、侧首眺望或抬爪理毛。',
    variants: [
      {
        id: 'IDLE_BREATH',
        name: '轻摇大尾 · 呼吸律动',
        speeches: [
          '水榭回廊的微风带着青荷的香气，禾禾正踩着软乎乎的山竹小猫爪陪你赏景呢。',
          '远处的乌篷小舟划过平湖烟水，只要站在你身旁，禾禾心里就觉得格外安宁。',
          '听着檐下青铜风铎的轻响，禾禾的大尾巴也跟着慢悠悠地晃动起来啦。'
        ]
      },
      {
        id: 'IDLE_LOOK_AROUND',
        name: '侧首眺望 · 聆听山水',
        speeches: [
          '咦？远山古亭那边飞过一行白鹭，禾禾歪着脑袋竖起长耳朵看了好久呢。',
          '禾禾左边看看墨竹疏影，右边瞧瞧湖面青莲，每一处风景都想指给你看。',
          '山间的云雾又漫上来了，禾禾好奇地探出小脑袋，替你听听风里的声音。'
        ]
      },
      {
        id: 'IDLE_GROOM_PAW',
        name: '抬爪理毛 · 晃动肉垫',
        speeches: [
          '禾禾抬起左前爪蹭了蹭圆润的脸颊，把绒毛理得蓬松顺滑，随时准备被你摸摸头。',
          '你看你看，禾禾举起一只小猫爪晃了晃粉红肉垫，是在向你打招呼呀。',
          '趁着阳光温润，禾禾乖巧地舔了舔小爪爪，把头顶的小雏菊也照料得精神奕奕。'
        ]
      }
    ]
  },
  HAPPY: {
    id: 'HAPPY',
    code: '状态二 · 开心雀跃',
    shortCode: '状态二',
    label: '开心雀跃',
    themeKey: 'JADE_LANDSCAPE',
    breathDuration: '1.5s',
    defaultRevertSec: 4,
    badgeClass: 'text-field-soil-deep bg-field-straw-soft/90 border-field-straw-deep/35',
    sceneStory: '千里江山石绿映日，晴光洒满雕花挂落与湖面青莲，水榭间满是欢欣生机。',
    description: '禾禾双眼弯成新月，或高举双爪亮出粉肉垫，或踏歌摇尾起舞，或凌空欢跳。',
    variants: [
      {
        id: 'HAPPY_RAISE_PAWS',
        name: '高举双爪 · 亮出肉垫',
        speeches: [
          '我乖乖把两只软乎乎的小爪爪举高高啦，晃着粉肉垫给你看～',
          '嘿嘿，听出来你心情超好呀～禾禾也把两只小猫爪高高举起为你欢呼！',
          '双爪举高高！禾禾踩着小猫后腿一颠一颠地踢踏，满眼都是开心的笑意。'
        ]
      },
      {
        id: 'HAPPY_DANCE_SPIN',
        name: '欢欣踏歌 · 摇尾起舞',
        speeches: [
          '太好啦！禾禾在水榭回廊上左摇右摆跳起了小猫舞，大尾巴摇得像拨浪鼓一样！',
          '听到你的夸奖，禾禾忍不住迈着山竹小猫爪轻快地交替踏步，连围巾都跟着飞扬起来。',
          '今天真是好日子，禾禾挥舞着两只小前爪原地转圈跳舞，把快乐都分给你！'
        ]
      },
      {
        id: 'HAPPY_STAR_JUMP',
        name: '凌空雀跃 · 迎风欢跳',
        speeches: [
          '好耶！禾禾开心地从青石板上蹦了起来，头顶的小雏菊都差点碰到屋檐下的风铎啦！',
          '被你喜欢的感觉就像暖阳照进水榭，禾禾欢快地连蹦带跳，元气满满！',
          '看禾禾的凌空一跃！两只后腿充满弹性地蹦跳，心里甜滋滋的。'
        ]
      }
    ]
  },
  SHY: {
    id: 'SHY',
    code: '状态三 · 委屈害羞',
    shortCode: '状态三',
    label: '委屈害羞',
    themeKey: 'DUSK_PAVILION',
    breathDuration: '2.2s',
    defaultRevertSec: 4,
    badgeClass: 'text-field-hearth-deep bg-[#F7E0D2] border-field-hearth/30',
    sceneStory: '暮山紫霞漫染天际，落日余晖映照朱漆廊柱，晚风拂过水面泛起胭脂色涟漪。',
    description: '禾禾脸颊浮现晚霞般的绯红，或拢爪掩面，或侧身藏尾偷瞄，或低头对指扭捏。',
    variants: [
      {
        id: 'SHY_COVER_CHEEK',
        name: '拢爪掩面 · 垂耳绯红',
        speeches: [
          '呜……突然被你这么温柔地摸摸头，禾禾的脸颊都像天边的晚霞一样红透啦。',
          '禾禾不好意思地把两只小前爪拢在发烫的脸蛋旁，长耳朵也羞怯地垂了下来。',
          '你这么近地看着禾禾，禾禾害羞得把山竹小猫爪往里扣了扣，心跳都变快了。'
        ]
      },
      {
        id: 'SHY_HIDE_TAIL',
        name: '侧身藏尾 · 偷瞄一眼',
        speeches: [
          '别笑话禾禾嘛……禾禾悄悄把身子偏过去一点，用大尾巴遮住自己，只敢偷偷瞄你一眼。',
          '唔，被你说中心事啦，禾禾侧过小脑袋躲在柿染围巾后面，耳朵尖都红了。',
          '禾禾把琥珀色的大尾巴卷到身前，害羞地眨巴着大眼睛，想要你再哄哄我。'
        ]
      },
      {
        id: 'SHY_FIDGET_PAWS',
        name: '对指扭捏 · 低头含羞',
        speeches: [
          '禾禾低下头让小雏菊垂在额前，两只粉肉垫小前爪在肚皮前轻轻对指碰了碰。',
          '刚睡醒就被你逗，禾禾委屈又害羞地并拢两只后脚爪，小声嘟囔着向你撒娇。',
          '只要你再多夸禾禾一句，禾禾就不害羞地低着头对小爪爪啦。'
        ]
      }
    ]
  },
  SLEEPY: {
    id: 'SLEEPY',
    code: '状态四 · 犯困打瞌睡',
    shortCode: '状态四',
    label: '犯困打瞌睡',
    themeKey: 'PINE_MOONLIGHT',
    breathDuration: '5.4s',
    defaultRevertSec: 5,
    badgeClass: 'text-[#4A4459] bg-[#E7E2EA] border-[#8B7F96]/35',
    sceneStory: '松烟寒潭映明月，远山静谧如墨，回廊宫灯透出温润烛光，湖面升起流萤清辉。',
    description: '禾禾双目轻阖，或吹出晶莹睡眠泡泡，或小鸡啄米般点头打盹，或伸懒腰打哈欠。',
    variants: [
      {
        id: 'SLEEPY_BUBBLE',
        name: '鼻息泡泡 · 垂耳酣眠',
        speeches: [
          '呼噜……月光洒在临水回廊上好安静呀，禾禾闭着眼睛吹出了圆圆的睡眠泡泡，晚安好梦。',
          '听着湖面传来的轻柔水声，禾禾放松小猫腿站在水榭里安心打起了小呼噜。',
          '夜色温柔，水榭的宫灯已经点亮，禾禾伴着你的呼吸声慢慢进入甜甜的梦乡啦。'
        ]
      },
      {
        id: 'SLEEPY_HEAD_NOD',
        name: '小鸡啄米 · 点头打盹',
        speeches: [
          '唔……眼皮越来越沉了，禾禾的小脑袋一点一点地打着瞌睡，还想再多陪你一会儿呢。',
          '禾禾迷迷糊糊地点了点头，差点晃了一下，连忙稳住山竹小猫爪继续眯着眼打盹。',
          '晚风吹得人暖洋洋的，禾禾耷拉着长耳朵，脑袋随着呼吸一沉一抬地犯困啦。'
        ]
      },
      {
        id: 'SLEEPY_STRETCH_YAWN',
        name: '舒展猫爪 · 哈欠连连',
        speeches: [
          '哈啊——禾禾高高伸了一个大大的小猫懒腰，张开小嘴打了个软绵绵的哈欠。',
          '伸展一下软乎乎的四肢，禾禾揉了揉困倦的眼睛，准备在古亭水榭里睡个好觉啦。',
          '打完这个长长的哈欠，全身都变得轻飘飘的，祝你今夜也有一个清朗的好梦。'
        ]
      }
    ]
  }
};
