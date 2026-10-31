/* 双语金句素材库 —— 唯一数据源
 * 浏览器直接 <script> 引入即可用（file:// 也能跑），无需构建。
 * 结构：window.PHRASES（meta / bands / items 三部分）
 * 字段说明见 README.md「数据结构」一节。
 */
window.PHRASES = {
  "meta": {
    "title": "双语金句素材库",
    "titleEn": "Phrase Deck",
    "description": "36 条中英双语短句，按 10 个话题带整理，每条附语法拆解与内容钩子。",
    "version": "1.0.0",
    "license": "MIT"
  },
  "bands": [
    {
      "code": "A",
      "name": "边界感",
      "note": "人人都自称受害者，不涉及性别对立，最安全的高流量带",
      "form": "A 图文卡片",
      "risk": "低"
    },
    {
      "code": "B",
      "name": "情绪价值",
      "note": "「他给不了情绪价值」最好引用，也最容易被反驳",
      "form": "B 慢速朗读",
      "risk": "中"
    },
    {
      "code": "C",
      "name": "恋爱与止损",
      "note": "评论区天然分两派：清醒派 vs 深情派",
      "form": "A 图文卡片",
      "risk": "中"
    },
    {
      "code": "D",
      "name": "婚姻与隐形劳动",
      "note": "「家务不算活」「丧偶式育儿」共鸣极强，也最容易吵起来",
      "form": "D 录屏讲解",
      "risk": "中"
    },
    {
      "code": "E",
      "name": "原生家庭",
      "note": "催婚、偏心、讲条件的爱——情绪最浓，也最容易被判卖惨",
      "form": "B 慢速朗读",
      "risk": "谨慎"
    },
    {
      "code": "F",
      "name": "成年人友情",
      "note": "「朋友做减法」几乎零风险、高转发",
      "form": "A 图文卡片",
      "risk": "低"
    },
    {
      "code": "G",
      "name": "冷暴力与沟通",
      "note": "讨论量常年最高，因为几乎每个人都经历过",
      "form": "C 手写特写",
      "risk": "低"
    },
    {
      "code": "H",
      "name": "孤独与独处",
      "note": "大城市独居人群的基本盘，安全、适合做收藏",
      "form": "A 图文卡片",
      "risk": "低"
    },
    {
      "code": "I",
      "name": "职场人际",
      "note": "「累不算业绩」「向上管理」——打工人的日常燃料",
      "form": "D 录屏讲解",
      "risk": "低"
    },
    {
      "code": "J",
      "name": "年龄与自我价值",
      "note": "女性成长赛道涨粉最快，但广告主敏感",
      "form": "B 慢速朗读",
      "risk": "中"
    }
  ],
  "items": [
    {
      "id": "A1",
      "band": "A",
      "form": "A",
      "en": "You are not rude for saying no. You are just out of practice.",
      "zh": "拒绝不等于没礼貌，你只是太久没说过了。",
      "key": "① be rude for doing 表原因；② out of practice 表示「久不练习、生疏」；③ not…just… 先摘罪名再给新解释",
      "hook": "拒绝一次就失去的关系，本来就不该留"
    },
    {
      "id": "A2",
      "band": "A",
      "form": "A",
      "en": "You do not have to explain yourself to everyone who asks.",
      "zh": "不是每个提问的人，都配得到一个解释。",
      "key": "① have to 表必要；② everyone who asks 定语从句；③ explain yourself 反身代词，表示「为自己辩解」",
      "hook": "你不需要向所有人交代"
    },
    {
      "id": "A3",
      "band": "A",
      "form": "B",
      "en": "People who get angry when you set a boundary are the reason you needed one.",
      "zh": "你设边界时最生气的那个人，正是你需要这条边界的原因。",
      "key": "① people who… 定语从句作主语；② set a boundary 固定搭配；③ the reason you needed one 省略 that 的定语从句",
      "hook": "谁最反对你设边界，谁就最需要它"
    },
    {
      "id": "A4",
      "band": "A",
      "form": "A",
      "en": "A boundary is information, not a punishment.",
      "zh": "边界是一种信息，不是一种惩罚。",
      "key": "① 两个名词对比，中间用逗号断句；② not 放后半句，语气更轻；③ information 在这里是「表明态度」，不是「资料」",
      "hook": "设边界，不是为了让谁难受"
    },
    {
      "id": "B1",
      "band": "B",
      "form": "B",
      "en": "People don't leave because you were difficult. They leave because nothing they felt ever landed.",
      "zh": "他离开不是因为难相处，是因为他的感受从没被接住。",
      "key": "① not because…because… 双原因对比；② land 本义「着陆」，这里指话被对方接住；③ nothing they felt 定语从句省略 that",
      "hook": "人不是被吵走的，是被晾走的"
    },
    {
      "id": "B2",
      "band": "B",
      "form": "A",
      "en": "Being listened to is not the same as being agreed with.",
      "zh": "被听见，和被同意，是两件事。",
      "key": "① 动名词被动式作主语 being listened to；② be not the same as 固定对比句式；③ agree with sb 的介词不能丢",
      "hook": "我要的不是你同意我"
    },
    {
      "id": "B3",
      "band": "B",
      "form": "C",
      "en": "Comfort is not a favor. It is the baseline.",
      "zh": "安慰不是恩赐，是及格线。",
      "key": "① favor 是「额外」，baseline 是「底线」；② 两个短句用句号断开，节奏更硬；③ baseline 是关系类高频词",
      "hook": "安慰不是加分项，是及格线"
    },
    {
      "id": "C1",
      "band": "C",
      "form": "A",
      "en": "You can love someone and still be wrong about them.",
      "zh": "你可以很爱一个人，同时完全看错他。",
      "key": "① and still 表让步中的转折；② be wrong about sb 比 misjudge 更口语；③ 两个谓语并列，说明「爱」和「判断」是两套系统",
      "hook": "爱和看错，可以同时成立"
    },
    {
      "id": "C2",
      "band": "C",
      "form": "B",
      "en": "Love that requires you to shrink is not love. It is a cost.",
      "zh": "需要你把自己缩小的爱，不是爱，是代价。",
      "key": "① love that requires you to… 定语从句；② shrink 表示「缩小自己」，比 change 更准；③ it is a cost 用名词收尾，力量更强",
      "hook": "让你越变越小的，不是爱"
    },
    {
      "id": "C3",
      "band": "C",
      "form": "D",
      "en": "Waiting for someone to change is not patience. It is a plan that has never worked.",
      "zh": "等一个人改变不是耐心，是一个从没成功过的计划。",
      "key": "① wait for sb to do；② patience 是性格，plan 是行为，定性不同；③ that has never worked 现在完成时的定语从句",
      "hook": "你不是有耐心，你是在赌"
    },
    {
      "id": "C4",
      "band": "C",
      "form": "C",
      "en": "The right person does not make you audition.",
      "zh": "对的人不会让你一直试镜。",
      "key": "① make sb do 使役结构；② audition 作动词，表示「争取被选中」；③ 借用演艺行业的词，画面感强",
      "hook": "你不是在谈恋爱，你是在试镜"
    },
    {
      "id": "D1",
      "band": "D",
      "form": "D",
      "en": "The heaviest work in a home is the part nobody sees you doing.",
      "zh": "家里最重的活，是没人看见你在做的那部分。",
      "key": "① the part nobody sees you doing 定语从句；② see sb doing 感官动词 + doing；③ heaviest 形容工作，不用 hardest",
      "hook": "家务不算活，那什么算"
    },
    {
      "id": "D2",
      "band": "D",
      "form": "D",
      "en": "\u201cI'll help\u201d is still a sentence in which you are the owner.",
      "zh": "「我帮你」这句话里，责任人还是你。",
      "key": "① in which 引导定语从句；② owner 表示「责任人」，是关系类关键词；③ 用口语短句开头，容易抓住前 3 秒",
      "hook": "「我帮你」这三个字的问题在哪"
    },
    {
      "id": "D3",
      "band": "D",
      "form": "B",
      "en": "A family runs on someone's memory.",
      "zh": "一个家，是靠某个人的记忆力运转的。",
      "key": "① run on 表示「依靠…运转」；② someone's memory 指「记得所有事的那个人」；③ 一句话说清「隐形劳动」",
      "hook": "家里总有一个什么都记得的人"
    },
    {
      "id": "E1",
      "band": "E",
      "form": "A",
      "en": "You can understand your parents and still choose a different life.",
      "zh": "你可以理解父母，同时选择不一样的人生。",
      "key": "① and still 表让步转折；② choose a different life 比 disobey 温和但更坚定；③ understand 和 choose 并列，说明二者不冲突",
      "hook": "理解他们，和成为他们，是两件事"
    },
    {
      "id": "E2",
      "band": "E",
      "form": "C",
      "en": "Some love comes with an invoice.",
      "zh": "有些爱，是带着账单来的。",
      "key": "① come with 表示「附带」；② invoice 账单，暗示「迟早要还」；③ 名词收尾，留白给评论区",
      "hook": "有些爱，是要还的"
    },
    {
      "id": "E3",
      "band": "E",
      "form": "B",
      "en": "You are not a bad child for having a life they cannot see.",
      "zh": "你有了他们看不懂的生活，不代表你是坏孩子。",
      "key": "① be adj for doing 表原因；② a life they cannot see 定语从句；③ bad child 用最朴素的词，戳最深的地方",
      "hook": "不是你不孝，是他们看不到"
    },
    {
      "id": "E4",
      "band": "E",
      "form": "A",
      "en": "Healing is not the same as forgiving.",
      "zh": "愈合，和原谅，不是同一件事。",
      "key": "① 动名词并列作主语；② be not the same as 对比句式；③ healing 是「自己好了」，forgiving 是「对别人放手」",
      "hook": "你可以不原谅，也可以好起来"
    },
    {
      "id": "F1",
      "band": "F",
      "form": "A",
      "en": "Some friends are not lost. They just stopped being updated.",
      "zh": "有些朋友不是走散了，只是没再更新。",
      "key": "① stop doing 表停止；② be updated 被动，表示「不再同步」；③ 把关系比作系统更新，画面感强",
      "hook": "有些朋友不是丢了"
    },
    {
      "id": "F2",
      "band": "F",
      "form": "C",
      "en": "Friendship that only survives when you do all the work is not friendship. It is maintenance.",
      "zh": "只靠你一个人维护的关系不叫友谊，叫保养。",
      "key": "① friendship that… 定语从句；② survive 表示「维持下去」；③ maintenance 保养，带一点讽刺",
      "hook": "你不在维护友谊，你在保养"
    },
    {
      "id": "F3",
      "band": "F",
      "form": "B",
      "en": "You are allowed to outgrow people without a fight.",
      "zh": "你可以悄悄成长到和别人不同频，不需要一场争吵。",
      "key": "① be allowed to 表「你有权」；② outgrow 超越，比 leave behind 温和；③ without a fight 收尾补刀",
      "hook": "散场不需要理由"
    },
    {
      "id": "G1",
      "band": "G",
      "form": "B",
      "en": "Silence is an answer. It is just the one you didn't want.",
      "zh": "沉默也是答案，只是不是你想听的那个。",
      "key": "① the one 代替 the answer；② 定语从句省略 that；③ 后半句是天然的 3 秒钩子",
      "hook": "沉默也是答案"
    },
    {
      "id": "G2",
      "band": "G",
      "form": "D",
      "en": "Explaining yourself to someone who has decided is a second job.",
      "zh": "向一个已经下结论的人解释自己，是第二份工作。",
      "key": "① 动名词短语作主语；② someone who has decided 定语从句；③ a second job 是隐喻，把情绪劳动具体化",
      "hook": "解释不是沟通，是第二份工"
    },
    {
      "id": "G3",
      "band": "G",
      "form": "A",
      "en": "The opposite of love is not hate. It is being unbothered.",
      "zh": "爱的反面不是恨，是无所谓。",
      "key": "① the opposite of 固定搭配；② being unbothered 动名词作表语；③ unbothered 比 indifferent 更口语",
      "hook": "爱的反面不是恨"
    },
    {
      "id": "G4",
      "band": "G",
      "form": "C",
      "en": "You cannot fix a conversation that only one person is having.",
      "zh": "一个人说话的对话，修不好。",
      "key": "① fix a conversation 搭配；② that only one person is having 定语从句；③ 用「一个人的对话」把冷暴力说清楚",
      "hook": "一个人修不好的东西"
    },
    {
      "id": "H1",
      "band": "H",
      "form": "A",
      "en": "Being alone and being lonely are two different problems.",
      "zh": "独处和孤独，是两个不同的问题。",
      "key": "① 动名词作主语；② alone 是客观状态，lonely 是主观感受；③ 对称句式，天然适合截图",
      "hook": "独处和孤独，不是一回事"
    },
    {
      "id": "H2",
      "band": "H",
      "form": "B",
      "en": "Solitude is where you find out what you actually think.",
      "zh": "独处的时候，才听得到你真正在想什么。",
      "key": "① where 引导表语从句；② find out 表示「弄清楚」；③ actually 放在 think 前，强调「不是你听来的想法」",
      "hook": "你有多久没听过自己的想法"
    },
    {
      "id": "H3",
      "band": "H",
      "form": "C",
      "en": "You are not too much. You were just in the wrong room.",
      "zh": "你不是太满，你只是待错了房间。",
      "key": "① too much 口语里表示「太过分、太强烈」；② in the wrong room 隐喻「环境不对」；③ 两个短句，第二句给出口",
      "hook": "你不是太过分，你是待错地方"
    },
    {
      "id": "I1",
      "band": "I",
      "form": "D",
      "en": "Nobody owes you a promotion for being tired.",
      "zh": "累不是筹码，没有人欠你一个升职。",
      "key": "① owe sb sth 双宾语；② for doing 表理由；③ 冲击力来自「把抱怨翻译成交易」",
      "hook": "累，不是业绩"
    },
    {
      "id": "I2",
      "band": "I",
      "form": "D",
      "en": "Being good at your job and being liked at your job are two different skills.",
      "zh": "活干得好，和让人喜欢你，是两种不同的技能。",
      "key": "① 两个动名词并列作主语；② are 与 and 连接的双主语一致；③ 把「人缘」定义成技能，是可执行的洞见",
      "hook": "干得好，不等于混得好"
    },
    {
      "id": "I3",
      "band": "I",
      "form": "B",
      "en": "You can say no to a meeting and still be professional.",
      "zh": "拒绝一个会，不等于不专业。",
      "key": "① say no to sth；② and still 表让步；③ professional 是职场类最高频的形容词",
      "hook": "不去那个会，你会不会被穿小鞋"
    },
    {
      "id": "I4",
      "band": "I",
      "form": "A",
      "en": "Your job is not your identity. It is your income.",
      "zh": "工作是你的收入，不是你的身份。",
      "key": "① identity 与 income 对照；② 两句都用 it is，结构对称；③ 一句话把「打工人的自我价值」讲完",
      "hook": "工作不是你的身份"
    },
    {
      "id": "J1",
      "band": "J",
      "form": "B",
      "en": "The years you think you wasted are the ones that taught you what you wanted.",
      "zh": "你以为浪费掉的那几年，恰好告诉你你想要什么。",
      "key": "① the ones that 定语从句；② waste 与 teach 对比；③ 两个定语从句嵌套，适合做长句拆解",
      "hook": "那几年没有白过"
    },
    {
      "id": "J2",
      "band": "J",
      "form": "A",
      "en": "Being needed is not the same as being loved.",
      "zh": "被需要，不等于被爱。",
      "key": "① 被动动名词并列；② be not the same as；③ 「被需要」和「被爱」的区别，是关系类最锋利的切口",
      "hook": "被需要，不是被爱"
    },
    {
      "id": "J3",
      "band": "J",
      "form": "C",
      "en": "You do not have to be impressive to be worth staying for.",
      "zh": "你不必很厉害，才值得被留下。",
      "key": "① have to 表必要；② be worth doing 值得；③ stay for 后面省略宾语，指向「为你留下」",
      "hook": "你不需要很厉害才配被爱"
    },
    {
      "id": "J4",
      "band": "J",
      "form": "B",
      "en": "Nothing you learned at 25 is wasted at 35.",
      "zh": "25 岁学的东西，35 岁没有一样是白学的。",
      "key": "① nothing you learned 定语从句；② 两个年龄对比，句式极简；③ wasted 用被动，强调「被浪费」",
      "hook": "35 岁才明白，25 岁没白学"
    }
  ]
};
