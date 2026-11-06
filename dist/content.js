// Original historical game writing. Character lines are fictional dialogue, not quotations.
// Historical anchors use public-domain Ming Shi; this is not a full-book adaptation.
export const SOURCES = [
  {title:'《明史》卷一 · 太祖一',url:'https://zh.wikisource.org/wiki/明史/卷1'},
  {title:'《明史》卷二 · 太祖二',url:'https://zh.wikisource.org/wiki/明史/卷2'},
  {title:'《明史》卷五 · 成祖一',url:'https://zh.wikisource.org/wiki/明史/卷5'},
  {title:'《明史》卷一百十三 · 后妃',url:'https://zh.wikisource.org/wiki/明史/卷113'},
  {title:'《明史》卷一百二十五 · 徐达、常遇春',url:'https://zh.wikisource.org/wiki/明史/卷125'},
  {title:'《明史》卷一百二十八 · 刘基',url:'https://zh.wikisource.org/wiki/明史/卷128'},
  {title:'《明史》卷一百四十五 · 姚广孝',url:'https://zh.wikisource.org/wiki/明史/卷145'},
  {title:'《明史》卷三百零四 · 郑和',url:'https://zh.wikisource.org/wiki/明史/卷304'},
  {title:'《明史》卷一百七十 · 于谦',url:'https://zh.wikisource.org/wiki/明史/卷170'},
  {title:'《明史》卷二百十二 · 戚继光',url:'https://zh.wikisource.org/wiki/明史/卷212'},
  {title:'《明史》卷二百二十六 · 海瑞',url:'https://zh.wikisource.org/wiki/明史/卷226'},
  {title:'《明史》卷二百十三 · 张居正',url:'https://zh.wikisource.org/wiki/明史/卷213'},
  {title:'《明史》卷二十四 · 崇祯末年',url:'https://zh.wikisource.org/wiki/明史/卷24'}
];
export const CHARACTERS = [
  {id:'zhu_yuanzhang',name:'朱元璋',role:'从布衣到开国之主',years:'元末 · 洪武',trait:'坚忍 / 决断',bio:'出身贫寒，在元末乱世中崛起，最终建立明朝。记得饥饿的人，也要学会如何安置天下。',color:'#9c4939',hat:'emperor',skill:{stat:'army',amount:6},quote:'这一仗要赢。赢以后，田也要有人种。'},
  {id:'ma_huanghou',name:'马皇后',role:'灯火可亲的劝谏者',years:'元末 · 洪武',trait:'宽厚 / 有识',bio:'朱元璋的妻子，明朝开国皇后。史籍记载她关心民生、劝谏君主；宫墙之内，也记挂宫墙之外。',color:'#c97960',hat:'lady',skill:{stat:'people',amount:6},quote:'先给孩子一碗热饭，再问他从哪里来。'},
  {id:'xu_da',name:'徐达',role:'沉稳的开国名将',years:'元末 · 洪武',trait:'稳健 / 善战',bio:'朱元璋麾下的重要将领，参与开国战争与北伐。游戏中的他重视阵势、补给和有纪律的胜利。',color:'#536b63',hat:'general',skill:{stat:'army',amount:6},quote:'阵脚稳住，才轮得到刀锋向前。'},
  {id:'liu_ji',name:'刘基',role:'看见局势的谋士',years:'元末 · 洪武',trait:'审势 / 筹谋',bio:'字伯温，参与朱元璋的军政筹划。谋略来自观察和判断，而不是无所不知的神通。',color:'#676b59',hat:'scholar',skill:{stat:'prestige',amount:6},quote:'别只看眼前这一城，要看下一季的粮。'},
  {id:'zhu_yunwen',name:'朱允炆',role:'风暴中的建文帝',years:'建文',trait:'理想 / 两难',bio:'继承朱元璋帝位，推行削藩，随后卷入靖难之役。南京失守后的下落存在争议，游戏不作确定结论。',color:'#a5794c',hat:'emperor',skill:{stat:'people',amount:6},quote:'一纸诏令很轻，落在人身上却很重。'},
  {id:'zhu_di',name:'朱棣',role:'燕王与永乐帝',years:'洪武 · 永乐',trait:'雄心 / 果决',bio:'从燕王到明朝皇帝，经历靖难战争；在位时开展远航、营建与军事行动，功业总伴随代价。',color:'#786240',hat:'emperor',skill:{stat:'army',amount:6},quote:'路既选了，就要看清它通向哪里。'},
  {id:'yao_guangxiao',name:'姚广孝',role:'棋局之外的谋士',years:'洪武 · 永乐',trait:'冷静 / 奇谋',bio:'僧人、谋士，参与朱棣的靖难谋划。棋盘可以重摆，现实里的每一步却有人承担。',color:'#626b70',hat:'scholar',skill:{stat:'prestige',amount:6},quote:'走别人没走过的路，也得备好回程的粮。'},
  {id:'zheng_he',name:'郑和',role:'把地平线向外推的人',years:'永乐 · 宣德',trait:'远见 / 统筹',bio:'奉命率船队下西洋，组织跨海航行与对外交涉。远方既有新见闻，也有风浪和复杂的局势。',color:'#487b7b',hat:'sailor',skill:{stat:'grain',amount:6},quote:'带船出去，还要把一船的人带回来。'},
  {id:'yu_qian',name:'于谦',role:'守住京师的那个人',years:'宣德 · 景泰',trait:'担当 / 坚定',bio:'土木之变后组织北京防御，反对南迁。危局中，他把国家安危放在个人进退之前。',color:'#487280',hat:'scholar',skill:{stat:'people',amount:6},quote:'城门后面不是数字，是一户一户的人家。'},
  {id:'qi_jiguang',name:'戚继光',role:'把散沙练成阵列',years:'嘉靖 · 万历',trait:'实干 / 协同',bio:'抗倭将领，重视练兵、军纪和队伍配合；曾在东南沿海作战，后参与北方边防。',color:'#65815e',hat:'general',skill:{stat:'army',amount:6},quote:'每个人站稳自己的位置，才能护住身后的人。'},
  {id:'hai_rui',name:'海瑞',role:'账本前不肯低头的人',years:'嘉靖 · 万历',trait:'清直 / 执着',bio:'历任地方官与朝官，以清廉、直言知名。游戏以查账和民生支线呈现他的坚持与现实阻力。',color:'#5c7070',hat:'scholar',skill:{stat:'people',amount:6},quote:'这笔数差了一文，落到百姓头上就不止一文。'},
  {id:'zhang_juzheng',name:'张居正',role:'与时间赛跑的改革者',years:'隆庆 · 万历',trait:'务实 / 改革',bio:'万历初年的首辅，推动考成、财政整顿与边防事务。让制度运转，比写出一道命令更难。',color:'#8b6651',hat:'scholar',skill:{stat:'grain',amount:6},quote:'今天补上一处漏洞，明天就少一处风雨。'}
];
const effect = (people,grain,army,prestige) => ({people,grain,army,prestige});
const choice = (label,detail,values,tag) => ({label,detail,effects:effect(...values),tag});
export const CHAPTERS = [
  {
    id:'poyang',title:'布衣山河',subtitle:'江湖风起，一碗饭到一个天下',year:'1363',place:'鄱阳湖',lead:'zhu_yuanzhang',companions:['ma_huanghou','xu_da','liu_ji'],
    intro:'湖面像一张未写完的地图。陈友谅的船队压来，营中的炊烟却越来越淡。你要替朱元璋作出决定：先守住什么，才能谈天下？',
    history:'1363 年，朱元璋与陈友谅在鄱阳湖展开大战，朱元璋最终获胜。1368 年，他在应天建立明朝。游戏中的救援、调粮与布阵是原创情境；你的分数不代表真实人物的历史功过。',
    source:SOURCES[0],mission:{title:'鄱阳破浪',desc:'观察对手意图，交替守御与进击。湖面风急，保住士气再寻找破局机会。',enemyName:'陈友谅水师',terrain:'lake',enemyHP:74},
    events:[
      {title:'营门外的饥民',speaker:'ma_huanghou',text:'粮车刚进营，岸边就聚来一群逃难的人。军需官催着封仓，一个孩子却一直望着那口冒热气的锅。',choices:[
        choice('先开粥棚','把军粮分出一部分，安置沿岸百姓。',[12,-10,0,3],'仁心'),
        choice('以工换粮','招募修船和运粮人手，粮食按工分配。',[4,-5,6,4],'谋略'),
        choice('封仓备战','优先保证前线补给，战后再救济。',[-7,9,5,0],'胆识')
      ]},
      {title:'大船与小舟',speaker:'xu_da',text:'敌船高大，正面压得人喘不过气。你的将领把三份作战草图摊开：厚阵、快舟，或一支主动出击的前锋。',choices:[
        choice('稳住阵脚','修补主力船只，让伤员与后队先安全靠岸。',[5,-6,8,0],'仁心'),
        choice('拆分舟队','以小舟机动配合主力，留出侧翼调动空间。',[0,-4,7,6],'谋略'),
        choice('前锋抢位','用更大的消耗抢占关键水面。',[0,-9,12,3],'胆识')
      ]},
      {title:'胜负之外',speaker:'liu_ji',text:'前方来报，附近乡村尚有无人收割的稻田。全军追击能扩大优势，留人护田却可能让敌军多喘一口气。',choices:[
        choice('留兵护田','先让流民回来，把下一季的生计留下。',[10,7,-5,1],'仁心'),
        choice('分路推进','主力追击，轻队守住粮道与渡口。',[2,3,3,5],'谋略'),
        choice('乘势进击','集中兵力把握战机，以战果凝聚队伍。',[-5,-4,8,8],'胆识')
      ]}
    ]
  },
  {
    id:'jingnan',title:'风起北平',subtitle:'一封诏书，改变无数人的归途',year:'1399',place:'北平 · 南京',lead:'zhu_di',companions:['yao_guangxiao'],
    intro:'洪武已远，削藩的诏令传遍各地。北平城里的马蹄声越来越密。你进入朱棣阵营，面对一场没有轻松答案的宗室战争。',
    history:'靖难之役发生于 1399—1402 年，朱棣最终进入南京并即位。建文帝朱允炆此后的下落存在争议。这里的路线选择和会面台词为架空演绎，不补写未经证实的历史结论。',
    source:SOURCES[2],mission:{title:'城下抉择',desc:'保持补给，利用防守积攒反击机会。战局可以取胜，民心的损失却不会自动消失。',enemyName:'南军防线',terrain:'city',enemyHP:80},
    events:[
      {title:'城中灯火',speaker:'zhu_di',text:'起兵的消息传开，城中商铺半数关门。将士请你立刻征集物资，父老则担心冬天再无余粮。',choices:[
        choice('以价收购','给商户粮票与银钱，压低强征带来的恐慌。',[10,-8,2,3],'仁心'),
        choice('分户核粮','核查库存，给每户保留口粮后再征集。',[3,6,2,2],'谋略'),
        choice('急征军需','优先补齐出征物资，承受城中的不满。',[-9,12,5,-2],'胆识')
      ]},
      {title:'地图上的空隙',speaker:'yao_guangxiao',text:'正面城防严密，侧面道路却需要更多向导和粮草。快一步能争取主动，慢一步能避免队伍被拉得太长。',choices:[
        choice('休整待报','照料伤兵，等侦骑补齐道路消息。',[6,-3,4,1],'仁心'),
        choice('试探侧路','派轻队确认道路，保留主力选择。',[0,-5,6,8],'谋略'),
        choice('长驱推进','冒补给吃紧的风险，以速度迫使对手应变。',[-3,-10,12,6],'胆识')
      ]},
      {title:'一城之后',speaker:'zhu_di',text:'城门已经松动，营中有人请赏，有人催着再进。新的难题来自胜利：如何约束掌握兵器的人？',choices:[
        choice('立下军纪','保护居民和粮仓，惩处扰民者。',[12,0,-3,4],'仁心'),
        choice('先安置后调兵','清点物资，留下维持秩序的队伍。',[4,5,-2,6],'谋略'),
        choice('厚赏前锋','集中资源奖励战功，争取继续推进。',[-6,-6,11,7],'胆识')
      ]}
    ]
  },
  {
    id:'voyage',title:'向海而行',subtitle:'故乡在身后，星辰在前方',year:'1405',place:'刘家港 · 西洋航路',lead:'zheng_he',companions:['zhu_di'],
    intro:'船帆展开，码头上的送行人渐渐变成小点。郑和的船队即将驶向陌生的港口。你掌管的是航线和补给，也是每一名水手回家的希望。',
    history:'1405 年，郑和奉命率船队出海，首次远航于 1407 年返航。此后明朝多次派遣船队远航，活动包括外交、贸易与军事行动。本关航线与风浪事件为玩法简化，不是精确航海复原。',
    source:SOURCES[7],mission:{title:'风浪归航',desc:'保留补给，观察风浪的节奏。在航行挑战中，进击代表抢占航机，守御代表稳住船队。',enemyName:'远海风浪',terrain:'sea',enemyHP:78},
    events:[
      {title:'最后一舱',speaker:'zheng_he',text:'出港前只剩一舱位置。礼物能打开陌生港口的大门，淡水和药材能让船员安心，更多货物则能支持远航开销。',choices:[
        choice('淡水与药材','多带一份保障，少留一份交易空间。',[10,-6,4,0],'仁心'),
        choice('分舱配置','重新清点各船，均衡备用物资与礼物。',[3,4,2,4],'谋略'),
        choice('满载远航礼物','投入更多物资，争取对外交涉的声望。',[0,-9,2,12],'胆识')
      ]},
      {title:'陌生港口',speaker:'zheng_he',text:'岸上的来人说着不同的语言。有人愿意交换补给，也有人对这支庞大船队保持戒备。先开口的那一句，会决定接下来的路。',choices:[
        choice('先释善意','让通事解释来意，约束船员，不扰居民。',[8,-3,0,8],'仁心'),
        choice('谈清交换','核对货物与补给数量，争取双方可接受的条件。',[2,9,0,3],'谋略'),
        choice('展示船队实力','用阵势保障交涉，但会加深部分人的戒心。',[-6,2,8,6],'胆识')
      ]},
      {title:'风向将变',speaker:'zheng_he',text:'观星人说风向正在变化，瞭望手又看到一处未记下的海岸。船队可以继续探看，也可以为回程早留几日余地。',choices:[
        choice('安排返航','优先保证船员归期，将见闻完整带回。',[10,4,-2,1],'仁心'),
        choice('派舟勘察','主队休整，小队沿岸探查后限期返回。',[2,-3,3,8],'谋略'),
        choice('继续向远方','投入更多补给，争取发现新的航路。',[-3,-10,4,12],'胆识')
      ]}
    ]
  },
  {
    id:'beijing',title:'此城不退',subtitle:'守住的，是万家灯火',year:'1449',place:'北京',lead:'yu_qian',companions:[],
    intro:'土木败讯抵京，街巷里尽是仓促的脚步。有人主张南迁，有人已经收拾行装。于谦站在地图前，先问的是：城里还有多少粮，多少人？',
    history:'1449 年土木之变后，明英宗被俘。于谦反对南迁，组织调兵、粮运与北京防御，明军随后击退进攻。1457 年夺门之变后于谦遇害，后获平反。本关结局只描述此次玩家守城表现。',
    source:SOURCES[8],mission:{title:'京师九门',desc:'稳守能够积攒反击机会。留意对手下一轮动作，别让一时的进攻耗尽防线。',enemyName:'瓦剌攻势',terrain:'wall',enemyHP:90},
    events:[
      {title:'去还是守',speaker:'yu_qian',text:'朝堂上的争论持续到天黑。百姓等一个决定，将士等一道命令。每多犹疑一刻，城里就多一分不安。',choices:[
        choice('先安民心','公布守城与救济安排，让百姓知道可以做什么。',[12,-6,2,3],'仁心'),
        choice('调兵分防','按城门位置与兵力分派防务，统一号令。',[3,-5,8,5],'谋略'),
        choice('整军誓守','集中队伍于关键地段，以行动压住恐慌。',[2,-7,12,2],'胆识')
      ]},
      {title:'通州的粮',speaker:'yu_qian',text:'一批粮食还在城外，车马与护卫都不够。敌情未明，怎样运回粮草，又不让运输队独自面对危险？',choices:[
        choice('结队护送','拨出护卫，连同沿途居民一起接入城内。',[10,5,-6,1],'仁心'),
        choice('分批快运','按距离安排接力，先运近仓，再转远仓。',[1,12,-3,4],'谋略'),
        choice('重兵接应','派精兵主动清理运输路线，承担更大消耗。',[0,5,6,-3],'胆识')
      ]},
      {title:'城门前夜',speaker:'yu_qian',text:'铁匠最后敲响几下锤子，守军把热汤递给同袍。明日的主攻方向尚不确定，你手上只剩一支预备队。',choices:[
        choice('轮换疲兵','让守了一夜的人睡一会儿，保持长期士气。',[8,-4,5,1],'仁心'),
        choice('留守中枢','让预备队机动待命，随敌情支援城门。',[2,-3,8,5],'谋略'),
        choice('前出设伏','选择一处要道布置反击，争取先挫锋芒。',[-2,-6,12,3],'胆识')
      ]}
    ]
  },
  {
    id:'coast',title:'山海同袍',subtitle:'不是一个英雄，是一支站在一起的队伍',year:'1561',place:'浙江 · 台州',lead:'qi_jiguang',companions:[],
    intro:'海风越过田埂，村口的木牌上又添了求援消息。戚继光的队伍里，有昨天还在种田的人。你要让他们学会配合，也要给他们一个值得守护的理由。',
    history:'1561 年，戚继光在台州一带作战，取得多次胜利；随后赴福建继续抗倭。他重视练兵、军纪与兵种配合。本关的站位与招式是简化玩法，不等同于真实战术教程。',
    source:SOURCES[9],mission:{title:'台州合阵',desc:'观察进攻与防御的克制关系，轮换行动让队伍保持节奏。协作比连续强攻更稳。',enemyName:'沿海寇势',terrain:'coast',enemyHP:94},
    events:[
      {title:'新兵的手',speaker:'qi_jiguang',text:'新兵握枪的手还带着农活留下的裂口。军官催着加快操练，但有人已因疲劳站不稳。战期迫近，如何分配这几天？',choices:[
        choice('先养后练','给新兵足够休息与热饭，再安排操练。',[10,-7,5,0],'仁心'),
        choice('分组轮训','按体能与熟练度分组，让老兵带新兵。',[3,-4,9,3],'谋略'),
        choice('集中强化','压缩休整，换取短期的阵列熟练度。',[-7,-5,14,2],'胆识')
      ]},
      {title:'村路与近道',speaker:'qi_jiguang',text:'直达战场的近道穿过田地，绕行则要多费半日。还有一批居民尚未撤离，队伍的前进与百姓的后退挤在同一条路上。',choices:[
        choice('护送居民','先护送村民离开危险地带，再追上主队。',[12,-5,-3,5],'仁心'),
        choice('分出向导','用当地向导疏导两路，让撤离和行军并行。',[5,-4,5,5],'谋略'),
        choice('抢先控路','精锐先行控制路口，后队承担额外运输压力。',[0,-8,11,3],'胆识')
      ]},
      {title:'阵里的位置',speaker:'qi_jiguang',text:'演练中，有人急着争先，有人只顾身旁的朋友。阵列一乱，后排就失去掩护。你该怎样让这支队伍真正成为同袍？',choices:[
        choice('结伴互保','让老兵陪着新兵复盘，让每人都被看见。',[9,-3,5,2],'仁心'),
        choice('明确分工','反复练习各位置的配合，奖励整队完成任务。',[3,-4,10,4],'谋略'),
        choice('严立军纪','用严格考核迫使队伍执行号令。',[-5,0,11,6],'胆识')
      ]}
    ]
  },
  {
    id:'reform',title:'万历灯下',subtitle:'山河要修补，账也要一页页算',year:'1572',place:'北京 · 六部',lead:'zhang_juzheng',companions:['hai_rui'],
    intro:'长夜里，一摞账册比一座城还难攻。张居正开始主持朝政，远处是边防军饷，近处是积欠与灾民。你手里的每一道批示，都要有人去落实。',
    history:'张居正于 1572 年成为首辅，至 1582 年去世，推动考成与财政等改革。海瑞支线是同一时代的议题并置，不表示两人共同参与游戏中的会谈。此后明朝经历多重危机，1644 年北京失守、崇祯帝身亡；本作六段故事并未覆盖全部明史，也不能把明亡归于单一人物或一次决策。',
    source:SOURCES[11],mission:{title:'积弊之局',desc:'把持久治理看作一场攻守战。进击推进改革，守御积蓄余力；保住民生才有持续执行的空间。',enemyName:'积欠与阻力',terrain:'capital',enemyHP:88},
    events:[
      {title:'催征与灾年',speaker:'zhang_juzheng',text:'账册上的欠额触目惊心，地方却报来水旱消息。一味催收能让数字好看，一味拖延又会让军饷失去着落。',choices:[
        choice('灾区缓征','核实灾情后缓征，先维持百姓生计。',[12,-9,0,4],'仁心'),
        choice('分类清欠','区分灾欠、拖欠与侵吞，先查最有把握的账。',[3,10,0,5],'谋略'),
        choice('限期追缴','统一期限，加快充实国库，同时承担民间压力。',[-10,14,3,0],'胆识')
      ]},
      {title:'送来的漂亮账本',speaker:'hai_rui',text:'这是一段同时代的查账支线。地方报表整齐得无可挑剔，农户收据却对不上。补齐证据需要时间，直接问责则可能让线索消失。',choices:[
        choice('走访农户','先让受影响的人把事情说清，保护证人。',[11,-4,0,4],'仁心'),
        choice('交叉核账','把仓册、收据和报表逐项比对，锁定差额。',[2,7,0,8],'谋略'),
        choice('立即停职查办','先阻止继续经手，再组织复核。',[-3,3,2,10],'胆识')
      ]},
      {title:'天亮以前',speaker:'zhang_juzheng',text:'最后一笔预算尚未落定。边关要军饷，河道要修缮，地方要救济。没有一份安排能让所有人满意，只能决定先承担哪一种压力。',choices:[
        choice('救济与修渠','把眼前的人与下一季收成放在前面。',[12,4,-6,1],'仁心'),
        choice('分期执行','把项目拆成可检查的期限，保留应急余款。',[4,5,3,5],'谋略'),
        choice('先固边防','优先补军饷与城防，以稳定外部局势。',[-4,-7,13,5],'胆识')
      ]}
    ]
  }
];
