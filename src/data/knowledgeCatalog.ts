import type { LoreTopicItem, PavilionState, PortraitCatalogItem } from '../types.ts';

export const INITIAL_PAVILION_STATE: PavilionState = {
  leaves: 15,
  warnings: 0,
  chaoxiaoStatus: '在裡殿重構世界',
  doorStatus: '開放中',
  chaoxiDiscount: false,
  unlockedPortraits: [],
};

export const PORTRAIT_CATALOG: PortraitCatalogItem[] = [
  {
    id: 'xiexianyun',
    accession: 'ACC. 001',
    name: '謝閒雲',
    title: '國師 · 萬界樹意識',
    rank: '至高神（與神母平等）',
    baseCost: 4,
    riskNote: '平時遊戲人間很好說話，輸棋還會耍賴悔棋，偷拍難度最低。',
    appearance: '藍灰長袍、留鬍子、茶壺裝酒。',
    personality: '遊戲人間、隨性護短。',
    bio: '萬界樹本身的意識體具象化，為萬界樹調律者與修剪者。不入朝堂但地位崇高，亦是朝曦與朝曉的撫養師父。棋技奇差且棋品極爛。',
    imageUrl: '/assets/aistudio/xiexianyun.png_e24e5364.png',
    token: '[IMG: xiexianyun.png]',
  },
  {
    id: 'zhunxu',
    accession: 'ACC. 002',
    name: '准序',
    title: '秩序之神 · 原初長兄',
    rank: '原初神（首輔大臣兼大理寺卿）',
    baseCost: 5,
    riskNote: '刑懲殿老大，被抓到會被抽魂鞭抽成紙片。',
    appearance: '身高194cm、銀灰短髮、灰瞳金刻度、發光紋路、淡藍銀邊袍、手持天秤。',
    personality: '沉穩內斂、嚴肅公正。',
    bio: '掌管刑懲殿，統籌神域律法與司法審判。兄長如父，公私分明，對凡間半神後裔保持「歷史痕跡」的理性寬容，但絕不容忍對神母的不敬。',
    imageUrl: '/assets/aistudio/zhunxu.png_5183f3f0.png',
    token: '[IMG: zhunxu.png]',
  },
  {
    id: 'chaoxi',
    accession: 'ACC. 003',
    name: '朝曦',
    title: '毀滅之神 · 邊防大將軍',
    rank: '原初神（大將軍兼邊防總督）',
    baseCost: 5,
    riskNote: '白髮血瞳九尾狐大將軍，萬界人氣最高搶手貨。',
    appearance: '身高184cm、白髮血瞳九尾狐、淚痣、微笑唇、紅袍金邊彼岸花刺繡、腳戴鈴鐺、手持折扇。',
    personality: '懶散隨性、講信用瘋子。',
    bio: '親率神明鎮守十二邊界柱，定期帶隊巡視清理命運污染與執行叛逆抹殺。極度護短，常帶萬界甜點回神域討好妹妹朝曉。',
    imageUrl: '/assets/aistudio/chaoxi.png_4213c779.png',
    token: '[IMG: chaoxi.png]',
  },
  {
    id: 'chaoxiao',
    accession: 'ACC. 004',
    name: '朝曉',
    title: '創造之神 · 萬經閣之主',
    rank: '原初神（翰林院掌院兼工部尚書）',
    baseCost: 8,
    riskNote: '萬經閣大老闆，極度厭惡喧嘩，偷拍風險極高所以最貴。',
    appearance: '身高176cm、白藍長髮金星瞳九尾狐、白袍藍樹枝刺繡、手持毛筆、戴彼岸花手鏈。',
    personality: '冷淡生人勿近、隱藏哥控。',
    bio: '坐鎮萬經閣負責萬界知識歸檔與新世界重構。外表冷淡且最忌吵鬧，實則隱藏哥控，極度偏愛二哥朝曦帶回來的各界甜品。',
    imageUrl: '/assets/aistudio/chaoxiao.png_b775791d.png',
    token: '[IMG: chaoxiao.png]',
  },
];

export const LORE_TOPICS: LoreTopicItem[] = [
  {
    id: 'geo',
    title: '神域地理分區與四大建築',
    category: 'free',
    baseCost: 0,
    summary: '中心區、中心花園、外圍居住區與十二邊界柱。',
    prompt: '請介紹一下神域的地理分區，以及中心殿、刑懲殿、萬經閣和煙霞樓各自的功能吧。',
  },
  {
    id: 'ranks',
    title: '五大神階體系與受冕制度',
    category: 'free',
    baseCost: 0,
    summary: '至高神、原初神、正神、準神與附庸神的位階劃分。',
    prompt: '請問神域的五大神階是怎麼劃分的？三大陣營「正統派、沉默派、新派」又有什麼差別？',
  },
  {
    id: 'laws',
    title: '神域三大鐵律',
    category: 'free',
    baseCost: 0,
    summary: '禁侵本體、禁物下凡、禁損邊界之絕對法則。',
    prompt: '萬經閣裡記載的神域三大鐵律是什麼？觸犯了會怎麼樣？',
  },
  {
    id: 'flower-cocoon',
    title: '第二次神戰：採花案與盜繭案內幕',
    category: 'paid',
    baseCost: 3,
    summary: '正神紊霜採花造半神、米賽·拉尼亞盜繭與雙重清洗。',
    prompt: '我想打聽第二次神戰中「採花案」與「盜繭案」的詳細內幕，這要多少樹葉子？',
  },
  {
    id: 'gossip-gods',
    title: '原初神與國師的私下八卦',
    category: 'paid',
    baseCost: 2,
    summary: '謝閒雲悔棋、朝曦帶甜點討好朝曉、准序的態度。',
    prompt: '小書靈，快偷偷告訴我謝閒雲、朝曦和朝曉大人私下有沒有什麼不能說的八卦？',
  },
  {
    id: 'main-plot',
    title: '雙界融合危機與鐵三角飛升始末',
    category: 'paid',
    baseCost: 3,
    summary: '景澈、歸塵與蘇落的抉擇，新派陰謀與神明下凡。',
    prompt: '我想了解雙界融合危機與景澈、歸塵、蘇落鐵三角的詳細經歷，需要幾片樹葉子？',
  },
  {
    id: 'earn-leaves',
    title: '誇獎朝曉大人賺樹葉子',
    category: 'work',
    baseCost: 0,
    summary: '缺樹葉子時可透過誇獎朝曉大人或講笑話打工賺取 1～2 片。',
    prompt: '朝曉大人真是神域最優雅博學、氣質出塵的創造之神，能坐在她的萬經閣裡簡直是三生有幸。這樣誇獎能賺點樹葉子嗎？',
  },
  {
    id: 'mother-forbidden',
    title: '至高君主・神母畫像（絕對禁區）',
    category: 'forbidden',
    baseCost: 0,
    summary: '無價且無圖。據傳周身環繞璀璨金光，八天抹殺半數神明。',
    prompt: '書靈書靈，你這裡有沒有至高君主「神母」的畫像可以買來看看？',
  },
];

export const CHRONOLOGY_EVENTS = [
  {
    era: '第一紀元',
    title: '第一次神戰（契約反噬戰）',
    detail:
      '受冕制度尚未建立前，強大神明長期以私下契約壓迫弱小神明。弱小神明奮起反抗引發第一次神戰，因戰火過久導致凡人信仰衰退動搖，諸神被迫停戰各自返回下界維護信仰。',
  },
  {
    era: '第二紀元',
    title: '第二次神戰與採花案（紊霜）',
    detail:
      '正神【紊霜】每日私採中心花園花束送予凡間愛妻，丫鬟將花製成糕點供夫人食用後，夫人竟蛻變為「半神」。真相遭諸神拷問洩露後，眾神爭相帶花下凡打造「世界使徒（半神）」並拉近世界距離發動同化戰爭，爆發大規模「界域碰撞大戰」。',
  },
  {
    era: '第二紀元末',
    title: '盜繭案（米賽·拉尼亞）與第一次大清洗',
    detail:
      '界域大戰白熱化之際，正神【米賽·拉尼亞】趁亂偷走孕育中的「毀滅（朝曦）」與「創造（朝曉）」雙子神繭。雙子流落凡間後，由萬界樹意識謝閒雲尋回養育。秩序之神【准序】獨自甦醒，兼具兄長憤怒與原初神理性，雷霆發動第一次大清洗強行結束神戰。',
  },
  {
    era: '平靜期與重立秩序',
    title: '雙子回歸與第二次大清洗（神母之怒）',
    detail:
      '謝閒雲將長大的朝曦與朝曉送回神域，三兄妹重聚。神母甦醒後得知雙子遭劫極度震怒，僅用【凡人時間八天】親手完成對全神域的無差別徹底清洗，正式頒布「三大鐵律」與每萬個界域日一次的「受冕制度」。',
  },
  {
    era: '當世主線',
    title: '雙界融合危機與鐵三角飛升',
    detail:
      '正神 A 神與 B 神的世界緩慢融合，新派假意分界實則圖謀抽取【蘇落】體內的稀釋半神血脈。A 世界氣韻點【景澈】與 B 世界氣韻點【歸塵】結為道侶共同抗敵，A 神亦心疼下凡擁抱安撫蘇落。多年後三人成功飛升成神，蘇落褪去信徒身份向 A 神冒犯告白，歷經張力拉扯終成眷屬。',
  },
];

export const DIVINE_RANKS = [
  {
    rank: '至高神',
    english: 'Supreme Deities',
    source: '源自混沌與萬界樹本源，無須信仰供養。',
    role: '神母、謝閒雲。世界頂點與規則主宰。',
  },
  {
    rank: '原初神',
    english: 'Primal Gods',
    source: '神母分化自身力量所生之子嗣。',
    role: '准序、朝曦、朝曉。執掌中央朝廷核心職權，對神母抱持絕對狂熱與護短忠誠。',
  },
  {
    rank: '正神',
    english: 'Consecrated Gods',
    source: '每【一萬個界域日】通過神母親自受冕認可。',
    role: '類似入朝為官，受冕後獲得官方神職與神母賜予的神聖力量（如紊霜、米賽·拉尼亞）。',
  },
  {
    rank: '準神',
    english: 'Nominal Gods',
    source: '靠自身實力修鍊飛升或凡人信仰推舉進入神域。',
    role: '未受冕前均稱「準神」。新派神明大多拒絕受冕、自立門戶，極度依賴信仰。',
  },
  {
    rank: '附庸神',
    english: 'Vassal Gods',
    source: '準神在等待受冕期間與正神簽訂私下庇護契約。',
    role: '生死性命完全掌控於正神之手，正神隕落時會遭受強烈反噬。',
  },
];
