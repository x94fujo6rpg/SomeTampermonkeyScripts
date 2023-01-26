// ==UserScript==
// @name         aegiswiki
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/aegiswiki.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/aegiswiki.user.js
// @version      0.1
// @description  large image / direct link to unit & class page
// @author       x94fujo6
// @match        https://wikiwiki.jp/aigiszuki/%E3%83%A6%E3%83%8B%E3%83%83%E3%83%88/%E3%83%AC%E3%82%A2%E3%83%AA%E3%83%86%E3%82%A3/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wikiwiki.jp
// @grant        none
// @run-at       document-start
// ==/UserScript==

(async function aegiswiki() {
	let remove_offset = 4;

	document.addEventListener("readystatechange", async () => {
		console.log(document.readyState);
		if (document.readyState == "interactive") {
			console.log("start main");
			await main();
			await removeEle();
		}
	});

	async function main() {
		let max_width = document.querySelector("div#body").clientWidth;
		let sec = 7;
		let top_gap = 5;
		let recalc_width = Math.round((max_width) / sec);
		let img_size = Math.round((recalc_width - 10) / 3);
		let queue = [];

		[...document.querySelectorAll(`.column-center #content>.h-scrollable td[style*="text-align:center;"]`)]
			.forEach(td => {
				queue.push(
					processTd(td)
				);
			});

		await Promise.all(queue);
		queue = [];

		[...document.querySelectorAll(".column-center img")]
			.forEach(img => {
				queue.push(
					processImg(img)
				);
			});

		await Promise.all(queue);
		queue = [];

		fixTypo();

		async function findTypo() {
			let list = [];
			for (let a of [...document.querySelectorAll("a[href*='クラス']")]) {
				let result = await testLink(a.href);
				console.log(result, a.textContent, decodeURI(a.href));
				if (!result) {
					list.push(a.textContent);
				}
				await sleep();
			}
			console.log(list);
			console.log(list.map(text => {
				return {
					a: text,
					b: ""
				};
			}));

			async function testLink(link) {
				let d = await fetch(link);
				if (d.status != 200) {
					return false;
				} else {
					return true;
				}
			}

			function sleep(ms = 500) {
				return new Promise(resolve => setTimeout(resolve, ms));
			}
		}
		//findTypo();

		async function fixTypo() {
			let list = [
				{ a: "ちびイモータルプリンセス", b: "イモータルプリンセス" },
				{ a: "ちびイビルプリンセス", b: "イビルプリンセス" },
				{ a: "ちび中級竜兵", b: "竜兵" },
				{ a: "ちび重装砲兵", b: "重装砲兵" },
				{ a: "ちびインペリアルナイト", b: "インペリアルナイト" },
				{ a: "ちび鬼", b: "鬼" },
				{ a: "ちび雷公", b: "雷公" },
				{ a: "ちび風伯", b: "風伯" },
				{ a: "ちびグランドナイト", b: "グランドナイト" },
				{ a: "ちび邪仙", b: "邪仙" },
				{ a: "ちび料理人", b: "料理人" },
				{ a: "ちびスチームナイト", b: "スチームナイト" },
				{ a: "ちびシャーマン", b: "シャーマン" },
				{ a: "ちびレンジャー", b: "レンジャー" },
				{ a: "ちびルーンアコライト", b: "ルーンアコライト" },
				{ a: "ちびシービショップ", b: "シービショップ" },

				{ a: "下級ソルジャー", b: "ソルジャー" },
				{ a: "下級ヘビーアーマー", b: "ヘビーアーマー" },
				{ a: "下級バンデット", b: "バンデット" },
				{ a: "下級竜兵", b: "竜兵" },
				{ a: "下級サムライ", b: "サムライ" },
				{ a: "下級忍者", b: "忍者" },
				{ a: "下級シーソルジャー", b: "シーソルジャー" },
				{ a: "下級アーチャー", b: "アーチャー" },
				{ a: "下級メイジ", b: "メイジ" },
				{ a: "下級パイレーツ", b: "パイレーツ" },
				{ a: "下級スカイウォリアー", b: "スカイウォリアー" },
				{ a: "下級スカイシューター", b: "スカイシューター" },

				{ a: "儀杖軍神", b: "儀仗軍神" },
				{ a: "中級竜兵", b: "竜兵" },
				{ a: "仙猿", b: "仙人" },
				{ a: "王太子公子", b: "王太子" },
				{ a: "盗賊【七つの大罪】盗賊【異郷】", b: "盗賊【七つの大罪】" },
				{ a: "巨人【七つの大罪】槌使い【異郷】", b: "巨人【七つの大罪】" },
				{ a: "召喚系アイドル", b: "アイドル召喚士" },
				{ a: "騎士【七つの大罪】騎士【異郷】", b: "騎士【七つの大罪】" },
				{ a: "妖精【七つの大罪】妖精【異郷】", b: "妖精【七つの大罪】" },
				{ a: "王女【七つの大罪】王女【異郷】", b: "王女【七つの大罪】" },
			];
			let eles = document.querySelectorAll("a[href*='クラス']");
			eles.forEach(a => {
				let url = decodeURI(a.href);
				let index = list.findIndex(str => url.includes(str.a));
				if (index != -1) {
					let replace = list[index];
					console.log(`[fix typo] ${replace.a} => ${replace.b}`, a);
					a.href = url.replace(replace.a, replace.b);
				}
			});
		}

		async function processImg(img) {
			if (img.alt == img.title) {
				["height", "width"].forEach(attr => {
					img.removeAttribute(attr);
				});
				img.style = `
					height: ${img_size}px;
					width: ${img_size}px;
					margin-top: ${top_gap}px;
				`;
			}
		}

		async function processTd(td) {
			let img, a, parent;
			a = td.querySelector("a");
			// https://wikiwiki.jp/aigiszuki/ユニット/クラス/${class_name}

			if (!a) {
				if (td.innerHTML != "") {
					// no unit
					let unit_class = td.textContent.replace(/\s/gm, "");
					a = document.createElement("a");
					a.href = `https://wikiwiki.jp/aigiszuki/ユニット/クラス/${unit_class}`;
					a.target = "_blank";
					a.textContent = unit_class;
					td.textContent = "";
					td.appendChild(a);
					console.log(`[add link] ${unit_class}: ${a.href}`);
				} else {
					// empty
				}
				return true;
			}

			td.style = `
				text-align: center;
				width: ${recalc_width}px;
				padding: 0;
			`;
			a.href = `https://wikiwiki.jp/aigiszuki/ユニット/クラス/${a.textContent.replace(/\s/gm, "")}`;
			a.target = "_blank";

			// https://wikiwiki.jp/aigiszuki/${title}
			img = td.querySelectorAll("img");
			[...img].reverse().forEach(ele => {
				parent = ele.parentElement;
				a = document.createElement("a");
				a.href = `https://wikiwiki.jp/aigiszuki/${ele.title}`;
				a.target = "_blank";
				a.appendChild(ele);
				parent.insertAdjacentElement("afterbegin", a);
			});

			let move_ele;
			move_ele = [...td.childNodes[0].childNodes].filter(node => node.nodeName != "#text");
			move_ele.reverse().forEach(ele => {
				td.insertAdjacentElement("afterbegin", ele);
			});

			return true;
		}
	}

	async function removeEle() {
		let content = [...document.querySelector("#content").childNodes];
		let start_remove = false;
		start_remove = content.findIndex(node => {
			if (node.nodeType == 3) {
				return false;
			}
			if (node.className.includes("splitinclude")) {
				return true;
			}
			return false;
		});

		console.log("start_remove", start_remove);
		if (start_remove == -1) {
			return false;
		} else {
			start_remove = start_remove - remove_offset;
			content.forEach((ele, index) => {
				if (index >= start_remove) {
					ele.remove();
				}
			});
			return true;
		}
	}
})();
