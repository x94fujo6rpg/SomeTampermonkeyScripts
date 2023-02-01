// ==UserScript==
// @name         AzurLaneSD 名稱可讀化
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/azurlanesd_renamer.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/azurlanesd_renamer.user.js
// @version      0.03
// @description  附加可讀的名稱
// @author       x94fujo6
// @match		 https://pelom777.github.io/AzurLaneSD/*
// @match		 http://pelom777.github.io/AzurLaneSD/*
// @match		 https://pelom.gitee.io/azurlanesd/*
// @match		 http://pelom.gitee.io/azurlanesd/*
// @match		 https://alsd.pelom.cn/*
// @match		 http://alsd.pelom.cn/*
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
	let css_name = {};

	window.onload = () => {
		console.log("script start");
		main();
	};

	function sleep(ms = 0) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async function main(retry = 10) {
		let list = document.querySelectorAll("#skeletonList option");
		if (!list.length) {
			retry--;
			console.log(`list is empty... retry:${retry}`);
			setTimeout(() => main(retry), 500);
			return;
		} else {
			let ob;
			await addCss();
			await sleep(1500);
			console.log("start add readable name");
			replacer();
			await sleep(1000);
			ob = new MutationObserver(() => replacer());
			ob.observe(document.querySelector("#skeletonList"), { childList: true });
		}
	}

	function replacer() {
		let list = document.querySelectorAll("#skeletonList option"),
			reg = /([^_\s]{1,})_([^_\s]{1,})/,
			len = list.length;
		for (let i = 0; i < len; i++) {
			setTimeout(async () => {
				let e = list[i],
					name = e.innerText.trim(),
					_css;
				if (name.length) {
					let key = await SHA(name);
					_css = css_name[key];
					if (_css) {
						e.className = _css;
					} else {
						let match = name.match(reg);
						if (match) {
							key = await SHA(match[1]);
							_css = css_name[key];
							if (_css) {
								e.className = _css;
							}
						}
					}
				}
			});
		}
	}

	async function addCss() {
		let new_css = [],
			s = document.createElement("style");
		Object.keys(hash_name_data).forEach(key => {
			let t = `
				.ship_${key}::before{
					content: "[${hash_name_data[key]}] ";
					color: orangered;
				}
			`;
			new_css.push(t);
			css_name[key] = `ship_${key}`;
		});
		s.innerHTML = new_css.join("\n");
		document.head.appendChild(s);
	}

	async function SHA(t = "") {
		const n = (new TextEncoder).encode(t),
			r = await crypto.subtle.digest("SHA-1", n);
		return Array.from(new Uint8Array(r)).map(t => t.toString(16).padStart(2, "0")).join("").slice(0, 5);
	}

	const hash_name_data = {
		"11756": "尼科洛索·達雷科",
		"11812": "扶桑·META",
		"13222": "長門",
		"14445": "格奈森瑙(META)",
		"15850": "福煦",
		"17115": "列星頓",
		"17320": "確捷",
		"17526": "扶桑",
		"17737": "華盛頓",
		"18104": "伊卡洛斯",
		"18597": "雷鳴",
		"21605": "螢火蟲",
		"25009": "哈曼改",
		"27239": "松風",
		"27529": "凱旋",
		"27930": "Z2",
		"29049": "榛名",
		"32969": "亞利桑那",
		"33521": "阿拉巴馬",
		"34083": "巴爾的摩(μ兵裝)",
		"34329": "托里拆利",
		"35255": "久遠",
		"36360": "滿潮",
		"37719": "霧島",
		"39641": "最上",
		"41553": "秋月律子",
		"42231": "火槍手",
		"44306": "U-556",
		"45699": "賓夕法尼亞",
		"46265": "昆西",
		"46591": "絆愛·SuperGamer",
		"46767": "風雲",
		"48581": "柯尼斯堡",
		"48613": "土佐",
		"50441": "絆愛·Elegant",
		"57429": "阿卡司塔改",
		"60539": "奧利克",
		"61643": "U-37",
		"61905": "露露緹耶",
		"63327": "惡毒(μ兵裝)",
		"65143": "龍騎兵",
		"65711": "大鬥犬",
		"68041": "初霜",
		"70130": "信濃",
		"72231": "博格改",
		"73583": "加賀",
		"73836": "川內",
		"74340": "加古",
		"74466": "Z23",
		"78178": "小光輝",
		"79029": "阿賈克斯",
		"82573": "舊金山",
		"84875": "小貝法",
		"88347": "千代田",
		"90026": "翔鶴",
		"91674": "金伯利",
		"92494": "卡爾斯魯厄改",
		"94306": "逸仙",
		"95045": "女將",
		"99039": "加古改",
		"99193": "比洛克西",
		"3cd1e": "泛用型布里",
		"2453f": "試作型布里MKII",
		"4a638": "特裝型布里MKIII",
		"2d4cc": "杜威",
		"676d0": "卡辛",
		"27b92": "卡辛改",
		"95f11": "唐斯",
		"9388e": "唐斯改",
		"27b72": "格里德利",
		"0087b": "克雷文",
		"d25b1": "麥考爾",
		"a4b05": "莫里",
		"b137c": "佛萊契爾",
		"baf2f": "查爾斯·奧斯本",
		"07350": "柴契爾",
		"17dd3": "富特",
		"293fb": "斯彭斯",
		"56b90": "班森",
		"dfaa3": "拉菲",
		"8fafc": "拉菲改",
		"f6194": "西姆斯",
		"2a2da": "西姆斯改",
		"d4bc1": "哈曼",
		"ca286": "埃爾德里奇",
		"0848a": "貝利",
		"4b3c1": "貝利改",
		"0285b": "拉德福特",
		"3d842": "傑金斯",
		"e32b5": "尼古拉斯",
		"d5ae5": "尼古拉斯改",
		"75eaf": "布希",
		"35a55": "黑澤伍德",
		"60f5d": "貝奇",
		"e6c55": "霍比",
		"ec052": "科爾克",
		"be420": "馬拉尼",
		"60d8a": "艾爾文",
		"88e07": "斯坦利",
		"c4615": "斯莫利",
		"cee46": "海爾賽‧鮑威爾",
		"efaae": "庫珀",
		"d0f42": "艾倫·薩姆納",
		"837d6": "史蒂芬·波特",
		"fdbb7": "莫里森",
		"6c185": "英格拉罕",
		"5da52": "奧馬哈",
		"5ef7b": "羅利",
		"a27b8": "布魯克林",
		"3cfe0": "菲尼克斯",
		"a26ae": "海倫娜",
		"e14b3": "海倫娜改",
		"1d5d6": "亞特蘭大",
		"399a5": "朱諾",
		"84bad": "聖地牙哥",
		"8594d": "聖地牙哥改",
		"ba3b2": "克里夫蘭",
		"bcd86": "哥倫比亞",
		"3eed7": "里奇蒙",
		"e7b80": "火奴魯魯",
		"afeb3": "聖路易斯",
		"3960d": "蒙彼利埃",
		"16ccc": "丹佛",
		"ded24": "曼非斯",
		"27e14": "康克德",
		"1efc3": "小海倫娜",
		"d7372": "小克利夫蘭",
		"849b1": "小聖地牙哥",
		"e17e7": "聖胡安",
		"c93b3": "伯明罕",
		"a5c8c": "克里夫蘭(μ兵裝)",
		"23e19": "雷諾",
		"fc93a": "馬布爾黑德",
		"07c48": "博伊西",
		"98f24": "彭薩科拉",
		"af7e6": "鹽湖城",
		"b1960": "北安普敦",
		"bb136": "芝加哥",
		"a6cba": "休士頓",
		"bc44c": "波特蘭",
		"9f5ff": "波特蘭改",
		"babb5": "印第安納波利斯",
		"9629e": "阿斯托利亞",
		"5ab44": "文森尼斯",
		"85ecd": "威奇塔",
		"ae656": "新奧爾良",
		"ad286": "明尼亞波利斯",
		"94d9d": "巴爾的摩",
		"7e8c2": "布雷默頓",
		"4708b": "內華達",
		"c75a6": "內華達改",
		"d8da7": "奧克拉荷馬",
		"e298b": "奧克拉荷馬改",
		"07071": "田納西",
		"738ff": "加利福尼亞",
		"ad13e": "科羅拉多",
		"98f3d": "馬里蘭",
		"a6aa3": "西維吉尼亞",
		"969b9": "北卡羅來納",
		"68a6a": "南達科他",
		"d240d": "新澤西",
		"7f581": "麻薩諸塞",
		"9303f": "長島",
		"5ff5a": "長島改",
		"d62ac": "博格",
		"46a4d": "卡薩布蘭卡",
		"8d75b": "蘭利",
		"df538": "蘭利改",
		"b5706": "薩拉托加",
		"e57e2": "薩拉托加改",
		"5f3d6": "遊騎兵",
		"a8c0e": "遊騎兵改",
		"a4f8b": "約克鎮",
		"1f2a5": "企業",
		"bbcbb": "大黃蜂",
		"cf31d": "胡蜂",
		"fc550": "艾塞克斯",
		"da7a0": "無畏",
		"bced1": "提康德羅加",
		"9fa49": "碉堡山",
		"2c0b3": "獨立",
		"7bee5": "獨立改",
		"bb0cb": "普林斯頓",
		"b8099": "巴丹",
		"c3078": "香格里拉",
		"f7bab": "小企業",
		"7a62a": "鰷魚",
		"30ff4": "大青花魚",
		"80fa4": "棘鰭",
		"dd6f6": "藍鰓魚",
		"6e148": "大青花魚(μ兵裝)",
		"64b94": "射水魚",
		"a65e9": "鸚鵡螺",
		"7d9bb": "女灶神",
		"f2cbf": "西雅圖",
		"2a910": "喬治亞",
		"6f759": "安克雷奇",
		"8538e": "女將改",
		"3715b": "阿卡司塔",
		"7b2b5": "熱心",
		"8f676": "熱心改",
		"d46a6": "小獵兔犬",
		"918ea": "彗星",
		"9f6bd": "彗星改",
		"4b2e5": "新月",
		"b95c1": "新月改",
		"6d0b4": "小天鵝",
		"b651e": "小天鵝改",
		"402bf": "狐提",
		"5e52f": "狐提改",
		"c20f4": "命運女神",
		"028f4": "命運女神改",
		"7df8e": "格倫維爾",
		"ee13e": "勇敢",
		"e323f": "獵人",
		"0bf1d": "標槍",
		"1f7ba": "標槍改",
		"b4c4c": "天后",
		"01d7d": "吸血鬼",
		"bc2ab": "丘比特",
		"1dbe0": "澤西",
		"eba49": "無敵",
		"a1b11": "回聲",
		"5e53a": "愛斯基摩人",
		"9a263": "利安得",
		"4b89a": "利安得改",
		"0d841": "阿基里斯",
		"5537b": "阿基里斯改",
		"ec4b1": "阿賈克斯改",
		"99a4d": "黛朵",
		"9f588": "南安普敦",
		"b0470": "謝菲爾德",
		"417f6": "格洛斯特",
		"4123d": "愛丁堡",
		"f1cf1": "貝爾法斯特",
		"37c6a": "阿瑞托莎",
		"b6adc": "加拉蒂亞",
		"f167d": "歐若拉",
		"3c9d7": "斐濟",
		"8a7bc": "牙買加",
		"9e6b4": "紐卡斯爾",
		"81f72": "紐卡斯爾改",
		"aede9": "天狼星",
		"dc15c": "庫拉索",
		"3715f": "庫拉索改",
		"e9798": "杓鷸",
		"be1ea": "杓鷸改",
		"9cd29": "黑太子",
		"871a6": "謝菲爾德(μ兵裝)",
		"189a7": "格拉斯哥",
		"7d690": "赫敏",
		"73b31": "黛朵(μ兵裝)",
		"a21ce": "佩內洛珀",
		"15b29": "倫敦",
		"114f9": "倫敦改",
		"c7e60": "什羅普郡",
		"ead01": "肯特",
		"ecf9a": "薩福克",
		"4b97a": "薩福克改",
		"04443": "諾福克",
		"1ba46": "多塞特郡",
		"e3ee2": "約克",
		"9cdfe": "約克改",
		"f1612": "埃克塞特",
		"4a67a": "埃克塞特改",
		"ccf3f": "蘇塞克斯",
		"e1bf2": "聲望",
		"dcedc": "反擊",
		"0a60d": "胡德",
		"0824e": "小聲望",
		"07070": "伊莉莎白女王",
		"1513b": "厭戰",
		"f2633": "厭戰改",
		"62b82": "納爾遜",
		"c88cc": "羅德尼",
		"5f02a": "英王喬治五世",
		"cf369": "威爾斯親王",
		"a6287": "約克公爵",
		"32da4": "豪",
		"79c87": "英勇",
		"4e2bf": "競技神",
		"b15d5": "競技神改",
		"e00dc": "獨角獸",
		"fe2e1": "半人馬",
		"9bfcd": "追趕者",
		"f44f3": "英仙座",
		"125a1": "鷹",
		"ecbd1": "皇家方舟",
		"0c636": "皇家方舟改",
		"bc858": "光輝",
		"262bb": "勝利",
		"53e9f": "可畏",
		"9c823": "光榮",
		"20ca3": "光輝(μ兵裝)",
		"1d84a": "黑暗界",
		"8f240": "恐怖",
		"9ef1c": "阿貝克隆比",
		"630aa": "海王星",
		"9565a": "君主",
		"7c975": "柴郡",
		"d7323": "德雷克",
		"605ff": "吹雪",
		"0d16d": "白雪",
		"15c13": "綾波",
		"e4c83": "綾波改",
		"3ba7f": "曉",
		"4abe2": "響",
		"a56ad": "雷",
		"06dbf": "電",
		"c8aa5": "白露",
		"52f87": "夕立",
		"d61e1": "夕立改",
		"fd794": "時雨",
		"dff3d": "時雨改",
		"13a8d": "雪風",
		"b10c4": "陽炎",
		"2135c": "陽炎改",
		"2a0fd": "不知火",
		"054ea": "不知火改",
		"936e6": "野分",
		"90d4a": "初春",
		"41b1c": "初春改",
		"36b7e": "若葉",
		"7f8e8": "初霜改",
		"a8eea": "有明",
		"734d2": "有明改",
		"6aad4": "夕暮",
		"37e3b": "夕暮改",
		"5b063": "黑潮",
		"adab2": "親潮",
		"c2742": "島風",
		"ffc04": "神風",
		"f1222": "神風改",
		"9bfa8": "松風改",
		"b3655": "睦月",
		"3c4cf": "睦月改",
		"ebe97": "如月",
		"3f8b7": "如月改",
		"ebe07": "卯月",
		"3e197": "水無月",
		"bba0e": "文月",
		"d701a": "長月",
		"31da6": "三日月",
		"fa86c": "海風",
		"d08a5": "山風",
		"0b331": "江風",
		"6b1f4": "清波",
		"1d589": "新月",
		"10ab7": "春月",
		"30ece": "宵月",
		"0b9ad": "浦風",
		"825db": "磯風",
		"0f36c": "濱風",
		"e300b": "濱風改",
		"5314c": "谷風",
		"bd23a": "谷風改",
		"daaed": "朝潮",
		"84c1c": "大潮",
		"fb4dc": "荒潮",
		"58ca3": "浦波",
		"4bbba": "旗風",
		"673e5": "卷波",
		"2767e": "霞",
		"c8900": "霞改",
		"d0041": "花月",
		"6c1f4": "長波",
		"fe0a6": "涼月",
		"8076d": "追風",
		"232e6": "夕張",
		"d91b9": "夕張改",
		"c6ad4": "長良",
		"8fa9e": "五十鈴",
		"d48f4": "五十鈴改",
		"f6db4": "由良",
		"b172d": "鬼怒",
		"0d0fd": "鬼怒改",
		"4afab": "阿武隈",
		"0e3c8": "阿武隈改",
		"a6b98": "最上改",
		"00213": "三隈",
		"534ec": "川內改",
		"839e7": "神通",
		"4f019": "神通改",
		"c7c84": "那珂",
		"4d569": "阿賀野",
		"d938e": "能代",
		"cd93f": "古鷹",
		"a1059": "古鷹改",
		"ad573": "青葉",
		"55e73": "衣笠",
		"bf5ee": "築摩",
		"948fc": "妙高",
		"94e03": "那智",
		"fab3c": "足柄",
		"5b237": "高雄",
		"20c9b": "愛宕",
		"4d13b": "摩耶",
		"21eaa": "鳥海",
		"fc7f4": "鈴谷",
		"4918e": "熊野",
		"95dfc": "金剛",
		"79c5d": "比叡",
		"adc11": "天城",
		"52d6e": "小比叡",
		"2511a": "小天城",
		"99e4b": "扶桑改",
		"cfadb": "山城",
		"b5f7f": "山城改",
		"dc14a": "伊勢",
		"2f505": "伊勢改",
		"03403": "日向",
		"447b8": "日向改",
		"ee272": "陸奧",
		"4b5b0": "三笠",
		"2056e": "紀伊",
		"36f0e": "駿河",
		"8f6df": "飛鷹",
		"c2a3f": "隼鷹",
		"549a4": "鳳翔",
		"01f48": "祥鳳",
		"ccf95": "祥鳳改",
		"619dd": "龍驤",
		"66da9": "龍鳳",
		"b96d7": "千歲",
		"bc124": "赤城",
		"29ba6": "加賀",
		"4679d": "蒼龍",
		"ca883": "蒼龍改",
		"484cd": "飛龍",
		"5ebf7": "飛龍改",
		"b80b8": "瑞鶴",
		"487fb": "大鳳",
		"f6bea": "小赤城",
		"151e0": "赤城(μ兵裝)",
		"dd63a": "大鳳",
		"318d5": "葛城",
		"54cc3": "伊19",
		"5cf1c": "伊26",
		"108cb": "伊58",
		"f5114": "伊25",
		"7680f": "伊56",
		"a4962": "伊168",
		"4f34b": "明石",
		"527b8": "伊13",
		"5bd5b": "樫野",
		"dab58": "伊吹",
		"d1892": "出雲",
		"e5145": "北風",
		"ef610": "吾妻",
		"f8ea5": "白龍",
		"380a4": "Z1",
		"af6b3": "Z1改",
		"d057a": "Z18",
		"5fb8b": "Z19",
		"2f4d4": "Z20",
		"da059": "Z21",
		"adb87": "Z23改",
		"31a63": "Z24",
		"7b8e2": "Z25",
		"50a09": "Z26",
		"0d4fe": "Z28",
		"b7518": "Z35",
		"1038a": "Z36",
		"618b8": "Z46",
		"7e527": "卡爾斯魯厄",
		"0a8bb": "科隆",
		"3502b": "科隆改",
		"64c02": "萊比錫",
		"904db": "萊比錫改",
		"da8c9": "紐倫堡",
		"1313d": "希佩爾將軍",
		"37c07": "歐根親王",
		"573b2": "德意志",
		"fcdbd": "施佩伯爵將軍",
		"edc83": "希佩爾將軍(μ兵裝)",
		"0c564": "羅恩(μ兵裝)",
		"53c82": "海因里希親王",
		"294f5": "沙恩霍斯特",
		"f094c": "格奈森瑙",
		"9af68": "俾斯麥",
		"a9aff": "鐵必制",
		"2b8de": "威悉",
		"1ba54": "齊柏林伯爵",
		"cbbf1": "小齊柏林",
		"ed8ef": "彼得·史特拉塞",
		"30d58": "U-81",
		"52c51": "U-47",
		"ee540": "U-557",
		"5e0b2": "U-73",
		"df905": "U-101",
		"000c6": "U-522",
		"1d03f": "U-110",
		"924a2": "U-96",
		"6aebb": "U-410",
		"f93ed": "羅恩",
		"a8e59": "腓特烈大帝",
		"b2970": "美因茲",
		"06e1b": "奧丁",
		"6ea0a": "埃吉爾",
		"9fb08": "奧古斯特·馮·帕塞瓦爾",
		"6dfeb": "鞍山",
		"0d2ba": "撫順",
		"cdc90": "長春",
		"b61b2": "太原",
		"cb96f": "寧海",
		"4bf23": "寧海改",
		"643f1": "平海",
		"647b2": "平海改",
		"ad037": "應瑞",
		"f292e": "肇和",
		"49fc0": "文琴佐·焦貝蒂",
		"940c2": "西北風",
		"8cbc9": "西南風",
		"3480c": "阿布魯齊公爵",
		"64f11": "特倫托",
		"165d2": "扎拉",
		"2ddb7": "波拉",
		"0bde7": "維托里奧·維內托",
		"08d77": "利托里奧",
		"473b7": "加富爾伯爵",
		"ae3a3": "朱利奧·凱撒",
		"af000": "天鷹",
		"82fea": "馬可波羅",
		"df181": "威嚴",
		"939d1": "明斯克",
		"b6fa2": "塔什干",
		"105ed": "塔什干(μ兵裝)",
		"02d3f": "神速",
		"025d8": "洪亮",
		"a1bf7": "曙光",
		"f80ca": "水星紀念",
		"df7d8": "水星紀念改",
		"5c010": "恰巴耶夫",
		"1100e": "基洛夫",
		"a4394": "摩爾曼斯克",
		"47b9b": "塔林",
		"7f615": "甘古特",
		"f3cbd": "蘇維埃貝拉羅斯",
		"9151b": "蘇維埃俄羅斯",
		"af40d": "福爾班",
		"cb402": "福爾班改",
		"425d3": "魯莽",
		"cbf4e": "倔強",
		"130cb": "可怖",
		"d4002": "馬耶·布雷澤",
		"7b204": "埃米爾•貝爾坦",
		"c16bb": "埃米爾•貝爾坦改",
		"f1ea0": "聖女貞德",
		"a425a": "黎胥留",
		"858b0": "貝亞恩",
		"c9bac": "速科夫",
		"d77c6": "路易九世",
		"ce127": "香檳",
		"96d37": "勒馬爾",
		"3abd9": "勒馬爾改",
		"e82e6": "塔爾圖",
		"eb7c6": "沃克蘭",
		"863f8": "惡毒",
		"c5d2c": "拉·加利索尼埃",
		"dad01": "阿爾及利亞",
		"a3440": "敦克爾克",
		"e33eb": "讓·巴爾",
		"1f04c": "加斯科涅(μ兵裝)",
		"a27f3": "加斯科涅",
		"6d517": "海倫娜·META",
		"89e9f": "飛鷹(META)",
		"747a4": "飛龍·META",
		"3b4cc": "皇家方舟·META",
		"7ff40": "蒼龍·META",
		"8f86d": "涅普頓",
		"f9fda": "諾瓦露",
		"50d98": "布蘭",
		"86ead": "貝露",
		"9c5d0": "紺紫之心",
		"a088e": "聖黑之心",
		"c78aa": "群白之心",
		"1c010": "翡綠之心",
		"a31e4": "貓音",
		"1d582": "烏璐露",
		"9f52d": "薩拉娜",
		"aef91": "芙米露露",
		"45c9d": "絆愛",
		"dcc0f": "絆愛·Anniversary",
		"7e339": "白上吹雪",
		"897a1": "時乃空",
		"453c2": "湊阿庫婭",
		"e2d45": "夏色祭",
		"a31eb": "百鬼綾目",
		"6514f": "紫咲詩音",
		"f923d": "大神澪",
		"1d9c7": "瑪莉蘿絲",
		"00360": "穗香",
		"474b1": "霞",
		"e1f15": "海咲",
		"4cada": "凪咲",
		"84af7": "女天狗",
		"9b97a": "莫妮卡",
		"2b565": "天海春香",
		"f174c": "如月千早",
		"b5989": "水瀨伊織",
		"1396b": "三浦梓",
		"a063f": "雙海亞美",
		"4c4d3": "雙海真美",
		"862d4": "寶多六花",
		"edef0": "新條茜",
		"e6f14": "莲",
		"e502d": "奈美子",
		"fcddd": "南夢芽",
		"3f463": "飛鳥川千瀨",
		"30f08": "貉"
	};
})();