// data.js —— 10 个主题的诗词数据

// 侧边栏主题配置
window.THEMES = [
  { id: "flower",  name: "花" },
  { id: "spring",  name: "春" },
  { id: "autumn",  name: "秋" },
  { id: "moon",    name: "月" },
  { id: "mountain",name: "山" },
  { id: "water",   name: "水" },
  { id: "wind",    name: "风" },
  { id: "bird",    name: "鸟" },
  { id: "number",  name: "数字" },
  { id: "color",   name: "颜色" }
];

// 关键字高亮字符
// 包含：8 个主题字 + 数字相关 + 颜色相关
window.HIGHLIGHT_CHARS = [
  "花", "春", "秋", "月", "山", "水", "风", "鸟",
  "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "百", "千", "万",
  "红", "绿", "蓝", "青", "碧", "白", "黑", "翠"
];

// 按主题分组的诗词
window.POEMS = {
  // ========= 主题：花 =========
  flower: [
    {
      id: "flower-1",
      theme: "花",
      sentence: "醉袖迎风受落花",
      dynasty: "元",
      author: "刘因",
      title: "山家"
    },
    {
      id: "flower-2",
      theme: "花",
      sentence: "九日龙山饮，黄花笑逐臣",
      dynasty: "唐",
      author: "李白",
      title: "九日龙山饮"
    },
    {
      id: "flower-3",
      theme: "花",
      sentence: "九日重阳节，开门有菊花",
      dynasty: "唐",
      author: "王勃",
      title: "九日"
    },
    {
      id: "flower-4",
      theme: "花",
      sentence: "夜来风雨声，花落知多少",
      dynasty: "唐",
      author: "孟浩然",
      title: "春晓"
    },
    {
      id: "flower-5",
      theme: "花",
      sentence: "解落三秋叶，能开二月花",
      dynasty: "唐",
      author: "李峤",
      title: "风"
    },
    {
      id: "flower-6",
      theme: "花",
      sentence: "亭台六七座，八九十枝花",
      dynasty: "宋",
      author: "邵雍",
      title: "一去二三里"
    },
    {
      id: "flower-7",
      theme: "花",
      sentence: "春去花还在，人来鸟不惊",
      dynasty: "唐",
      author: "王维",
      title: "画"
    },
    {
      id: "flower-8",
      theme: "花",
      sentence: "桃花潭水深千尺，不及汪伦送我情",
      dynasty: "唐",
      author: "李白",
      title: "赠汪伦"
    },
    {
      id: "flower-9",
      theme: "花",
      sentence: "小荷才露尖尖角，早有蜻蜓立上头",
      dynasty: "宋",
      author: "杨万里",
      title: "小池"
    },
    {
      id: "flower-10",
      theme: "花",
      sentence: "墙角数枝梅，凌寒独自开",
      dynasty: "宋",
      author: "王安石",
      title: "咏梅"
    },
    {
      id: "flower-11",
      theme: "花",
      sentence: "待到重阳日，还来就菊花",
      dynasty: "唐",
      author: "孟浩然",
      title: "过故人庄"
    },
    {
      id: "flower-12",
      theme: "花",
      sentence: "竹外桃花三两枝，春江水暖鸭先知",
      dynasty: "宋",
      author: "苏轼",
      title: "惠崇春江晚景"
    },
    {
      id: "flower-13",
      theme: "花",
      sentence: "人闲桂花落，夜静春山空",
      dynasty: "唐",
      author: "王维",
      title: "鸟鸣涧"
    },
    {
      id: "flower-14",
      theme: "花",
      sentence: "接天莲叶无穷碧，映日荷花别样红",
      dynasty: "宋",
      author: "杨万里",
      title: "晓出净慈寺送林子方"
    },
    {
      id: "flower-15",
      theme: "花",
      sentence: "牧童遥指杏花村，借问酒家何处有",
      dynasty: "唐",
      author: "杜牧",
      title: "清明"
    },
    {
      id: "flower-16",
      theme: "花",
      sentence: "江南好，风景旧曾谙；日出江花红胜火",
      dynasty: "唐",
      author: "白居易",
      title: "忆江南"
    },
    {
      id: "flower-17",
      theme: "花",
      sentence: "迟日江山丽，春风花草香",
      dynasty: "唐",
      author: "杜甫",
      title: "绝句二首·其一"
    },
    {
      id: "flower-18",
      theme: "花",
      sentence: "桃花一簇开无主，可爱深红爱浅红",
      dynasty: "唐",
      author: "杜甫",
      title: "江畔独步寻花·其五"
    }
  ],

  // ========= 主题：春 =========
  spring: [
    {
      id: "spring-1",
      theme: "春",
      sentence: "春眠不觉晓，处处闻啼鸟。",
      dynasty: "唐",
      author: "孟浩然",
      title: "春晓"
    },
    {
      id: "spring-2",
      theme: "春",
      sentence: "好雨知时节，当春乃发生。",
      dynasty: "唐",
      author: "杜甫",
      title: "春夜喜雨"
    },
    {
      id: "spring-3",
      theme: "春",
      sentence: "春去花还在，人来鸟不惊。",
      dynasty: "唐",
      author: "王维",
      title: "画"
    },
    {
      id: "spring-4",
      theme: "春",
      sentence: "春种一粒粟，秋收万颗子。",
      dynasty: "唐",
      author: "李绅",
      title: "悯农"
    },
    {
      id: "spring-5",
      theme: "春",
      sentence: "红豆生南国，春来发几枝。",
      dynasty: "唐",
      author: "王维",
      title: "相思"
    },
    {
      id: "spring-6",
      theme: "春",
      sentence: "春草明年绿，王孙归不归？",
      dynasty: "唐",
      author: "王维",
      title: "送别"
    },
    {
      id: "spring-7",
      theme: "春",
      sentence: "谁言寸草心，报得三春晖。",
      dynasty: "唐",
      author: "孟郊",
      title: "游子吟"
    },
    {
      id: "spring-8",
      theme: "春",
      sentence: "等闲识得东风面，万紫千红总是春。",
      dynasty: "宋",
      author: "朱熹",
      title: "春日"
    },
    {
      id: "spring-9",
      theme: "春",
      sentence: "春色满园关不住，一枝红杏出墙来。",
      dynasty: "宋",
      author: "叶绍翁",
      title: "游园不值"
    },
    {
      id: "spring-10",
      theme: "春",
      sentence: "竹外桃花三两枝，春江水暖鸭先知。",
      dynasty: "宋",
      author: "苏轼",
      title: "惠崇春江晚景"
    },
    {
      id: "spring-11",
      theme: "春",
      sentence: "爆竹声中一岁除，春风送暖入屠苏。",
      dynasty: "宋",
      author: "王安石",
      title: "元日"
    },
    {
      id: "spring-12",
      theme: "春",
      sentence: "迟日江山丽，春风花草香。",
      dynasty: "唐",
      author: "杜甫",
      title: "绝句二首·其一"
    },
    {
      id: "spring-13",
      theme: "春",
      sentence: "野火烧不尽，春风吹又生。",
      dynasty: "唐",
      author: "白居易",
      title: "赋得古原草送别"
    },
    {
      id: "spring-14",
      theme: "春",
      sentence: "人闲桂花落，夜静春山空。",
      dynasty: "唐",
      author: "王维",
      title: "鸟鸣涧"
    }
  ],

  // ========= 主题：秋 =========
  autumn: [
    {
      id: "autumn-1",
      theme: "秋",
      sentence: "空山新雨后，天气晚来秋。",
      dynasty: "唐",
      author: "王维",
      title: "山居秋暝"
    },
    {
      id: "autumn-2",
      theme: "秋",
      sentence: "春种一粒粟，秋收万颗子。",
      dynasty: "唐",
      author: "李绅",
      title: "悯农·其一"
    },
    {
      id: "autumn-3",
      theme: "秋",
      sentence: "洛阳城里见秋风，欲作家书意万重。",
      dynasty: "唐",
      author: "张籍",
      title: "秋思"
    },
    {
      id: "autumn-4",
      theme: "秋",
      sentence: "窗含西岭千秋雪，门泊东吴万里船。",
      dynasty: "唐",
      author: "杜甫",
      title: "绝句"
    },
    {
      id: "autumn-5",
      theme: "秋",
      sentence: "何当金络脑，快走踏清秋。",
      dynasty: "唐",
      author: "李贺",
      title: "马诗"
    },
    {
      id: "autumn-6",
      theme: "秋",
      sentence: "解落三秋叶，能开二月花。",
      dynasty: "唐",
      author: "李峤",
      title: "风"
    },
    {
      id: "autumn-7",
      theme: "秋",
      sentence: "树树皆秋色，山山唯落晖。",
      dynasty: "唐",
      author: "王绩",
      title: "野望"
    },
    {
      id: "autumn-8",
      theme: "秋",
      sentence: "银烛秋光冷画屏，轻罗小扇扑流萤。",
      dynasty: "唐",
      author: "杜牧",
      title: "秋夕"
    }
  ],

  // ========= 主题：月 =========
  moon: [
    {
      id: "moon-1",
      theme: "月",
      sentence: "床前明月光，疑是地上霜。",
      dynasty: "唐",
      author: "李白",
      title: "静夜思"
    },
    {
      id: "moon-2",
      theme: "月",
      sentence: "举头望明月，低头思故乡。",
      dynasty: "唐",
      author: "李白",
      title: "静夜思"
    },
    {
      id: "moon-3",
      theme: "月",
      sentence: "小时不识月，呼作白玉盘。",
      dynasty: "唐",
      author: "李白",
      title: "古朗月行"
    },
    {
      id: "moon-4",
      theme: "月",
      sentence: "湖光秋月两相和，潭面无风镜未磨。",
      dynasty: "唐",
      author: "刘禹锡",
      title: "望洞庭"
    },
    {
      id: "moon-5",
      theme: "月",
      sentence: "明月松间照，清泉石上流。",
      dynasty: "唐",
      author: "王维",
      title: "山居秋暝"
    },
    {
      id: "moon-6",
      theme: "月",
      sentence: "月出惊山鸟，时鸣春涧中。",
      dynasty: "唐",
      author: "王维",
      title: "鸟鸣涧"
    },
    {
      id: "moon-7",
      theme: "月",
      sentence: "秦时明月汉时关，万里长征人未还。",
      dynasty: "唐",
      author: "王昌龄",
      title: "出塞"
    },
    {
      id: "moon-8",
      theme: "月",
      sentence: "春风又绿江南岸，明月何时照我还？",
      dynasty: "宋",
      author: "王安石",
      title: "泊船瓜洲"
    },
    {
      id: "moon-9",
      theme: "月",
      sentence: "明月别枝惊鹊，清风半夜鸣蝉。",
      dynasty: "宋",
      author: "辛弃疾",
      title: "西江月·夜行黄沙道中"
    }
  ],

  // ========= 主题：山 =========
  mountain: [
    {
      id: "mountain-1",
      theme: "山",
      sentence: "白日依山尽，黄河入海流。",
      dynasty: "唐",
      author: "王之涣",
      title: "登鹳雀楼"
    },
    {
      id: "mountain-2",
      theme: "山",
      sentence: "空山不见人，但闻人语响。",
      dynasty: "唐",
      author: "王维",
      title: "鹿柴"
    },
    {
      id: "mountain-3",
      theme: "山",
      sentence: "远看山有色，近听水无声。",
      dynasty: "唐",
      author: "王维",
      title: "画"
    },
    {
      id: "mountain-4",
      theme: "山",
      sentence: "相看两不厌，只有敬亭山。",
      dynasty: "唐",
      author: "李白",
      title: "独坐敬亭山"
    },
    {
      id: "mountain-5",
      theme: "山",
      sentence: "千山鸟飞绝，万径人踪灭。",
      dynasty: "唐",
      author: "柳宗元",
      title: "江雪"
    },
    {
      id: "mountain-6",
      theme: "山",
      sentence: "山重水复疑无路，柳暗花明又一村。",
      dynasty: "宋",
      author: "陆游",
      title: "游山西村"
    },
    {
      id: "mountain-7",
      theme: "山",
      sentence: "两岸青山相对出，孤帆一片日边来。",
      dynasty: "唐",
      author: "李白",
      title: "望天门山"
    },
    {
      id: "mountain-8",
      theme: "山",
      sentence: "西塞山前白鹭飞，桃花流水鳜鱼肥。",
      dynasty: "唐",
      author: "张志和",
      title: "渔歌子"
    },
    {
      id: "mountain-9",
      theme: "山",
      sentence: "空山新雨后，天气晚来秋。",
      dynasty: "唐",
      author: "王维",
      title: "山居秋暝"
    },
    {
      id: "mountain-10",
      theme: "山",
      sentence: "山外青山楼外楼，西湖歌舞几时休？",
      dynasty: "宋",
      author: "林升",
      title: "题临安邸"
    },
    {
      id: "mountain-11",
      theme: "山",
      sentence: "黄河远上白云间，一片孤城万仞山。",
      dynasty: "唐",
      author: "王之涣",
      title: "凉州词二首·其一"
    }
  ],

  // ========= 主题：水 =========
  water: [
    {
      id: "water-1",
      theme: "水",
      sentence: "白毛浮绿水，红掌拨清波。",
      dynasty: "唐",
      author: "骆宾王",
      title: "咏鹅"
    },
    {
      id: "water-2",
      theme: "水",
      sentence: "远看山有色，近听水无声。",
      dynasty: "唐",
      author: "王维",
      title: "画"
    },
    {
      id: "water-3",
      theme: "水",
      sentence: "桃花潭水深千尺，不及汪伦送我情。",
      dynasty: "唐",
      author: "李白",
      title: "赠汪伦"
    },
    {
      id: "water-4",
      theme: "水",
      sentence: "泉眼无声惜细流，树阴照水爱晴柔。",
      dynasty: "宋",
      author: "杨万里",
      title: "小池"
    },
    {
      id: "water-5",
      theme: "水",
      sentence: "小娃撑小艇，偷采白莲回。",
      dynasty: "唐",
      author: "白居易",
      title: "池上"
    },
    {
      id: "water-6",
      theme: "水",
      sentence: "竹外桃花三两枝，春江水暖鸭先知。",
      dynasty: "宋",
      author: "苏轼",
      title: "惠崇春江晚景"
    },
    {
      id: "water-7",
      theme: "水",
      sentence: "日出江花红胜火，春来江水绿如蓝。",
      dynasty: "唐",
      author: "白居易",
      title: "忆江南"
    },
    {
      id: "water-8",
      theme: "水",
      sentence: "西塞山前白鹭飞，桃花流水鳜鱼肥。",
      dynasty: "唐",
      author: "张志和",
      title: "渔歌子"
    },
    {
      id: "water-9",
      theme: "水",
      sentence: "水光潋滟晴方好，山色空蒙雨亦奇。",
      dynasty: "宋",
      author: "苏轼",
      title: "饮湖上初晴后雨"
    },
    {
      id: "water-10",
      theme: "水",
      sentence: "一道残阳铺水中，半江瑟瑟半江红。",
      dynasty: "唐",
      author: "白居易",
      title: "暮江吟"
    },
    {
      id: "water-11",
      theme: "水",
      sentence: "遥望洞庭山水翠，白银盘里一青螺。",
      dynasty: "唐",
      author: "刘禹锡",
      title: "望洞庭"
    },
    {
      id: "water-12",
      theme: "水",
      sentence: "孤帆远影碧空尽，唯见长江天际流。",
      dynasty: "唐",
      author: "李白",
      title: "黄鹤楼送孟浩然之广陵"
    },
    {
      id: "water-13",
      theme: "水",
      sentence: "朝辞白帝彩云间，千里江陵一日还。",
      dynasty: "唐",
      author: "李白",
      title: "早发白帝城"
    },
    {
      id: "water-14",
      theme: "水",
      sentence: "天街夜色凉如水，卧看牵牛织女星。",
      dynasty: "唐",
      author: "杜牧",
      title: "秋夕"
    },
    {
      id: "water-15",
      theme: "水",
      sentence: "江上往来人，但爱鲈鱼美。",
      dynasty: "宋",
      author: "范仲淹",
      title: "江上渔者"
    }
  ],

  // ========= 主题：风 =========
  wind: [
    {
      id: "wind-1",
      theme: "风",
      sentence: "风吹草低见牛羊。",
      dynasty: "北朝",
      author: "佚名",
      title: "敕勒歌"
    },
    {
      id: "wind-2",
      theme: "风",
      sentence: "夜来风雨声，花落知多少。",
      dynasty: "唐",
      author: "孟浩然",
      title: "春晓"
    },
    {
      id: "wind-3",
      theme: "风",
      sentence: "野火烧不尽，春风吹又生。",
      dynasty: "唐",
      author: "白居易",
      title: "赋得古原草送别"
    },
    {
      id: "wind-4",
      theme: "风",
      sentence: "不知细叶谁裁出，二月春风似剪刀。",
      dynasty: "唐",
      author: "贺知章",
      title: "咏柳"
    },
    {
      id: "wind-5",
      theme: "风",
      sentence: "儿童散学归来早，忙趁东风放纸鸢。",
      dynasty: "清",
      author: "高鼎",
      title: "村居"
    },
    {
      id: "wind-6",
      theme: "风",
      sentence: "迟日江山丽，春风花草香。",
      dynasty: "唐",
      author: "杜甫",
      title: "绝句"
    },
    {
      id: "wind-7",
      theme: "风",
      sentence: "爆竹声中一岁除，春风送暖入屠苏。",
      dynasty: "宋",
      author: "王安石",
      title: "元日"
    },
    {
      id: "wind-8",
      theme: "风",
      sentence: "湖光秋月两相和，潭面无风镜未磨。",
      dynasty: "唐",
      author: "刘禹锡",
      title: "望洞庭"
    },
    {
      id: "wind-9",
      theme: "风",
      sentence: "等闲识得东风面，万紫千红总是春。",
      dynasty: "宋",
      author: "朱熹",
      title: "春日"
    }
  ],

  // ========= 主题：鸟 =========
  bird: [
    {
      id: "bird-1",
      theme: "鸟",
      sentence: "日暮鸟雀稀，稚子呼牛归。",
      dynasty: "唐",
      author: "丘为",
      title: "泛若耶溪（节选）"
    },
    {
      id: "bird-2",
      theme: "鸟",
      sentence: "春眠不觉晓，处处闻啼鸟。",
      dynasty: "唐",
      author: "孟浩然",
      title: "春晓"
    },
    {
      id: "bird-3",
      theme: "鸟",
      sentence: "千山鸟飞绝，万径人踪灭。",
      dynasty: "唐",
      author: "柳宗元",
      title: "江雪"
    },
    {
      id: "bird-4",
      theme: "鸟",
      sentence: "春去花还在，人来鸟不惊。",
      dynasty: "唐",
      author: "王维",
      title: "画"
    },
    {
      id: "bird-5",
      theme: "鸟",
      sentence: "月出惊山鸟，时鸣春涧中。",
      dynasty: "唐",
      author: "王维",
      title: "鸟鸣涧"
    },
    {
      id: "bird-6",
      theme: "鸟",
      sentence: "众鸟高飞尽，孤云独去闲。",
      dynasty: "唐",
      author: "李白",
      title: "独坐敬亭山"
    }
  ],

  // ========= 主题：数字 =========
  number: [
    {
      id: "number-1",
      theme: "数字",
      sentence: "一去二三里，烟村四五家。",
      dynasty: "宋",
      author: "邵雍",
      title: "山村咏怀"
    },
    {
      id: "number-2",
      theme: "数字",
      sentence: "亭台六七座，八九十枝花。",
      dynasty: "宋",
      author: "邵雍",
      title: "山村咏怀"
    },
    {
      id: "number-3",
      theme: "数字",
      sentence: "解落三秋叶，能开二月花。",
      dynasty: "唐",
      author: "李峤",
      title: "风"
    },
    {
      id: "number-4",
      theme: "数字",
      sentence: "过江千尺浪，入竹万竿斜。",
      dynasty: "唐",
      author: "李峤",
      title: "风"
    },
    {
      id: "number-5",
      theme: "数字",
      sentence: "欲穷千里目，更上一层楼。",
      dynasty: "唐",
      author: "王之涣",
      title: "登鹳雀楼"
    },
    {
      id: "number-6",
      theme: "数字",
      sentence: "两个黄鹂鸣翠柳，一行白鹭上青天。",
      dynasty: "唐",
      author: "杜甫",
      title: "绝句"
    },
    {
      id: "number-7",
      theme: "数字",
      sentence: "一片两片三四片，五六七八九十片。",
      dynasty: "清",
      author: "郑板桥",
      title: "咏雪诗"
    },
    {
      id: "number-8",
      theme: "数字",
      sentence: "千片万片无数片，飞入芦花总不见。",
      dynasty: "清",
      author: "郑板桥",
      title: "咏雪诗"
    },
    {
      id: "number-9",
      theme: "数字",
      sentence: "一岁一枯荣，野火烧不尽。",
      dynasty: "唐",
      author: "白居易",
      title: "赋得古原草送别"
    },
    {
      id: "number-10",
      theme: "数字",
      sentence: "碧玉妆成一树高，万条垂下绿丝绦。",
      dynasty: "唐",
      author: "贺知章",
      title: "咏柳"
    },
    {
      id: "number-11",
      theme: "数字",
      sentence: "二月春风似剪刀，不知细叶谁裁出。",
      dynasty: "唐",
      author: "贺知章",
      title: "咏柳"
    },
    {
      id: "number-12",
      theme: "数字",
      sentence: "离离原上草，一岁一枯荣。",
      dynasty: "唐",
      author: "白居易",
      title: "赋得古原草送别"
    },
    {
      id: "number-13",
      theme: "数字",
      sentence: "幼女才六岁，未知巧与拙。",
      dynasty: "唐",
      author: "施肩吾",
      title: "幼女词"
    },
    {
      id: "number-14",
      theme: "数字",
      sentence: "九日龙山饮，黄花笑逐臣。",
      dynasty: "唐",
      author: "李白",
      title: "九日龙山饮"
    },
    {
      id: "number-15",
      theme: "数字",
      sentence: "九日重阳节，开门有菊花。",
      dynasty: "唐",
      author: "王勃",
      title: "九日"
    },
    {
      id: "number-16",
      theme: "数字",
      sentence: "故乡今夜思千里，霜鬓明朝又一年。",
      dynasty: "唐",
      author: "高适",
      title: "除夜作"
    },
    {
      id: "number-17",
      theme: "数字",
      sentence: "洛阳城里见秋风，欲作家书意万重。",
      dynasty: "唐",
      author: "张籍",
      title: "秋思"
    }
  ],

  // ========= 主题：颜色 =========
  color: [
    {
      id: "color-1",
      theme: "颜色",
      sentence: "红豆生南国，春来发几枝。",
      dynasty: "唐",
      author: "王维",
      title: "相思"
    },
    {
      id: "color-2",
      theme: "颜色",
      sentence: "春色满园关不住，一枝红杏出墙来。",
      dynasty: "宋",
      author: "叶绍翁",
      title: "游园不值"
    },
    {
      id: "color-3",
      theme: "颜色",
      sentence: "接天莲叶无穷碧，映日荷花别样红。",
      dynasty: "宋",
      author: "杨万里",
      title: "晓出净慈寺送林子方"
    },
    {
      id: "color-4",
      theme: "颜色",
      sentence: "桃花一簇开无主，可爱深红爱浅红？",
      dynasty: "唐",
      author: "杜甫",
      title: "江畔独步寻花·其五"
    },
    {
      id: "color-5",
      theme: "颜色",
      sentence: "白日依山尽，黄河入海流。",
      dynasty: "唐",
      author: "王之涣",
      title: "登鹳雀楼"
    },
    {
      id: "color-6",
      theme: "颜色",
      sentence: "白毛浮绿水，红掌拨清波。",
      dynasty: "唐",
      author: "骆宾王",
      title: "咏鹅"
    },
    {
      id: "color-7",
      theme: "颜色",
      sentence: "两个黄鹂鸣翠柳，一行白鹭上青天。",
      dynasty: "唐",
      author: "杜甫",
      title: "绝句"
    },
    {
      id: "color-8",
      theme: "颜色",
      sentence: "小时不识月，呼作白玉盘。",
      dynasty: "唐",
      author: "李白",
      title: "古朗月行"
    },
    {
      id: "color-9",
      theme: "颜色",
      sentence: "朝辞白帝彩云间，千里江陵一日还。",
      dynasty: "唐",
      author: "李白",
      title: "早发白帝城"
    },
    {
      id: "color-10",
      theme: "颜色",
      sentence: "梅子金黄杏子肥，麦花雪白菜花稀。",
      dynasty: "宋",
      author: "范成大",
      title: "四时田园杂兴·其二十五"
    },
    {
      id: "color-11",
      theme: "颜色",
      sentence: "青青园中葵，朝露待日晞。",
      dynasty: "汉",
      author: "佚名",
      title: "长歌行"
    },
    {
      id: "color-12",
      theme: "颜色",
      sentence: "人生自古谁无死？留取丹心照汗青。",
      dynasty: "宋",
      author: "文天祥",
      title: "过零丁洋"
    },
    {
      id: "color-13",
      theme: "颜色",
      sentence: "春风又绿江南岸，明月何时照我还？",
      dynasty: "宋",
      author: "王安石",
      title: "泊船瓜洲"
    },
    {
      id: "color-14",
      theme: "颜色",
      sentence: "碧玉妆成一树高，万条垂下绿丝绦。",
      dynasty: "唐",
      author: "贺知章",
      title: "咏柳"
    },
    {
      id: "color-15",
      theme: "颜色",
      sentence: "绿遍山原白满川，子规声里雨如烟。",
      dynasty: "宋",
      author: "翁卷",
      title: "乡村四月"
    },
    {
      id: "color-16",
      theme: "颜色",
      sentence: "知否，知否？应是绿肥红瘦。",
      dynasty: "宋",
      author: "李清照",
      title: "如梦令·昨夜雨疏风骤"
    },
    {
      id: "color-17",
      theme: "颜色",
      sentence: "日出江花红胜火，春来江水绿如蓝。",
      dynasty: "唐",
      author: "白居易",
      title: "忆江南·江南好"
    },
    {
      id: "color-18",
      theme: "颜色",
      sentence: "黄河远上白云间，一片孤城万仞山。",
      dynasty: "唐",
      author: "王之涣",
      title: "凉州词"
    },
    {
      id: "color-19",
      theme: "颜色",
      sentence: "故人西辞黄鹤楼，烟花三月下扬州。",
      dynasty: "唐",
      author: "李白",
      title: "黄鹤楼送孟浩然之广陵"
    },
    {
      id: "color-20",
      theme: "颜色",
      sentence: "日照香炉生紫烟，遥看瀑布挂前川。",
      dynasty: "唐",
      author: "李白",
      title: "望庐山瀑布"
    },
    {
      id: "color-21",
      theme: "颜色",
      sentence: "遥望洞庭山水翠，白银盘里一青螺。",
      dynasty: "唐",
      author: "刘禹锡",
      title: "望洞庭"
    }
  ]
};
