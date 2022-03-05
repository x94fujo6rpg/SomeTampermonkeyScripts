// ==UserScript==
// @name         台電網頁工具
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/taipower_tool.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/taipower_tool.user.js
// @version      0.01
// @description  計算並顯示實際發電能力
// @author       x94fujo6
// @match        https://www.taipower.com.tw/tc/page.aspx?mid=206*
// ==/UserScript==
/* jshint esversion: 9 */

(async function () {
	let lastest = new Date(),
		hold = true;

	addCss();
	await addInfo(new Date(lastest));
	setHold();

	setInterval(() => {
		let isUpdate = checkUpdate();
		if (isUpdate > lastest && !hold) {
			let now = new Date();
			setHold();
			lastest = now.getTime();
			console.log(`資料更新@${getTimeString(now)}`);
			addInfo(now);
		}
	}, 1000);

	function setHold() {
		hold = true;
		setTimeout(() => {
			hold = false;
		}, 61000);
	}

	function getTimeString(time) {
		return time.toTimeString().split(" ")[0];
	}

	function getHMS(time) {
		return getTimeString(time).split(":");
	}

	function checkUpdate() {
		let now = new Date(),
			[h, m, s] = getHMS(now);
		return ((m % 10 == 0) && (s > 10)) ? now.getTime() : false;
	}

	async function addInfo(time) {
		let pos = document.querySelector("#main_info"),
			box = document.createElement("div"),
			data = await getData(),
			html = [],
			box_id = "usInfo",
			old_box = document.getElementById(box_id);
		if (old_box) old_box.remove();
		box.id = box_id;
		box.classList.add("usBox");
		for (let [key, value] of Object.entries(data)) {
			html.push(`
				<div class="usLine usUnderLine">
					<div class="usBold usTextL">${key.replace(/\d_/, "")}</div>
					<div class="usBold usTextR">${value}</div>
				</div>
			`);
		}
		html.push(`
			<div class="usLine">
				<div class="usBold usTextL">單位: MW</div>
				<div class="usBold usTextR">最後更新: ${getTimeString(time)}</div>
			</div>
		`);

		box.innerHTML = html.join("");
		pos.insertAdjacentElement("afterbegin", box);
	}

	async function getData() {
		let url = "https://www.taipower.com.tw/d006/loadGraph/loadGraph/data/genary.json",
			raw = await fetch(url),
			parseRaw = (arr) => {
				let [type, group, name, cap, gen, gen_percent, note] = arr;
				type = type.match(/b>(.*)<\/b/)[1].trim();
				cap = parseFloat(cap);
				gen = parseFloat(gen);
				note = note.trim();
				if (isNaN(cap)) cap = 0;
				if (isNaN(gen)) gen = 0;
				return { type, name, cap, gen, note };
			},
			not_run = [
				"歲修",
				"故障",
				"環保停機檢修",
				"檢修",
				"機組安檢",
				"測試停機",
			],
			limit = [
				"水文限制",
				"燃料限制",
				"環保限制",
				"空污減載",
				"測試運轉",
				"運轉限制",
				"EOH限制",
				"合約限制",
				"電源線限制",
				"輔機檢修",
				"外溫高限制",
				"歲修逾排程",

				"部分歲修",
				"部分檢修",
				"部分故障",

				"友善降載減排",
			],
			green = [
				"水力(Hydro)",
				"風力(Wind)",
				"太陽能(Solar)",
				"抽蓄發電(Pumping Gen)",
				"其它再生能源(Other Renewable Energy)",
			],
			offshore = [
				"澎湖",
				"金門",
				"馬祖",
				"離島",
			],
			data = [],
			p = [],
			sum_max_cap = 0,
			sum_max_actual = 0,
			sum_green_cap = 0,
			sum_no_green_cap = 0,
			sum_green_gen = 0
			;
		raw = await raw.json();
		raw = raw.aaData;
		raw.forEach(arr => {
			let pp = parseRaw(arr),
				{ name, cap, gen } = pp;
			if (
				name != "小計" &&
				(cap || gen) &&
				!offshore.some(t => name.includes(t))
			) {
				data.push(pp);
			}
		});
		//console.log(data);
		data.forEach(pp => {
			p.push((async () => {
				if (!not_run.some(t => t == pp.note)) {
					if (limit.some(t => t == pp.note) || pp.type == "抽蓄負載(Pumping Load)") {
						if (green.some(t => t == pp.type)) {
							sum_green_cap += pp.gen;
							sum_green_gen += pp.gen;
						} else {
							sum_no_green_cap += pp.gen;
						}
					} else {
						if (green.some(t => t == pp.type)) {
							sum_green_cap += pp.cap;
							sum_green_gen += pp.gen;
						} else {
							sum_no_green_cap += pp.cap;
						}
					}
				}
			})());
		});
		await Promise.all(p);
		sum_max_cap = sum_no_green_cap + sum_green_cap;
		sum_max_actual = sum_no_green_cap + sum_green_gen;
		[
			sum_max_cap,
			sum_green_cap,
			sum_no_green_cap,
			sum_green_gen,
			sum_max_actual,
		] = [
			sum_max_cap,
			sum_green_cap,
			sum_no_green_cap,
			sum_green_gen,
			sum_max_actual,
		].map(num => num = Math.floor(num));
		sum_green_gen = `${sum_green_gen} (${Math.floor(sum_green_gen / sum_green_cap * 10000) / 100}%)`;

		let result;
		result = {
			"1_總容量": sum_max_cap,
			"2_總容量 (綠能僅實際發電)": sum_max_actual,
			"3_容量 (非綠能)": sum_no_green_cap,
			"5_容量 (綠能)": sum_green_cap,
			"4_容量 (綠能-實際發電)": sum_green_gen,
		};
		console.log(result);
		return result;
	}

	function addCss() {
		let s = document.createElement("style");
		document.head.appendChild(s);
		s.textContent = `
			.usBox {
				display: block;
				width: 50%;
				margin: auto;
			}

			.usBold {
				font-weight: bold;
				font-size: large;
			}

			.usLine {
				display: flex;
				margin-bottom: 0.5rem;
			}

			.usUnderLine {
				border-bottom: 0.1rem black solid;
				border-left: 0.2rem black solid;
			}

			.usTextL {
				position: relative;
				margin: 0 auto 0 0;
				padding-left: 0.25rem;
			}

			.usTextR {
				position: relative;
				margin: 0 0 0 auto;
				padding-right: 0.25rem;
			}
		`;
	}
})();