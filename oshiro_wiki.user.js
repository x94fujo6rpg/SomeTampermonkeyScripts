// ==UserScript==
// @name         oshiro wiki QOL
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/oshiro_wiki.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/oshiro_wiki.user.js
// @version      0.1
// @description  wiki QOL
// @author       x94fujo6
// @match        https://scre.swiki.jp/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=swiki.jp
// @grant        none
// ==/UserScript==

/*

auto search & add event answer
https://i.imgur.com/Uqrx1GL.png

*/

(function () {
	let data = isChar();

	if (data) {
		charHandler(data);
	}

	async function charHandler({ name, link }) {
		let giftInfo = await getGiftInfo(link);
		let pos = document.querySelector("#evaluation");
		//console.log(giftInfo);

		if (pos) {
			addGiftInfo(giftInfo, pos);
		}

		function addGiftInfo(info, pos) {
			let ele = document.createElement("div");
			if (info) {
				let eleHTML =
					`<div class="ie5">
						<table class="style_table" cellspacing="1" border="0">
							<tbody>
								${info}
							</tbody>
						</table>
					</div>`;
				let list = [3, 4, 5, 6, 7, 8, 9];
				ele.innerHTML = eleHTML;
				[...ele.querySelector("tr").childNodes]
					.filter((ele, index) => !list.includes(index))
					.forEach(ele => ele.remove());
			} else {
				ele.textContent = "not found";
			}
			pos.insertAdjacentElement("beforebegin", ele);

			pos = ele;
			ele = document.createElement("h3");
			ele.textContent = `${name} 好みとイベント解答`;
			pos.insertAdjacentElement("beforebegin", ele);
		}
	}

	async function getGiftInfo(link = "") {
		let info_page = await fetch("https://scre.swiki.jp/index.php?%E8%B4%88%E3%82%8A%E7%89%A9");
		let parser = new DOMParser();
		let _doc = parser.parseFromString(await info_page.text(), "text/html");
		let info = _doc.querySelector(`.style_table a[href="${link}"]`);
		if (info) {
			info = info.parentNode.parentNode.outerHTML;
		}
		parser = null;
		_doc = null;
		return info;
	}

	function isChar() {
		let list = [
			"evaluation",
			"voice",
			"image",
			"information",
		];
		list = list.map(id => Boolean(document.getElementById(id)));
		if (list.every(check => check)) {
			let name = document.querySelector("#page_title a").textContent.trim();
			let link = window.location.href;
			console.log("this is a char page", list, `name: ${name}, link: ${link}`);
			return { name, link };
		} else {
			console.log("this is not a char page", list);
			return false;
		}
	}

})();
