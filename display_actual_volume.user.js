// ==UserScript==
// @name         顯示實際水量
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/display_actual_volume.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/display_actual_volume.user.js
// @version      0.3
// @description  顯示最大蓄水量，顯示上升/下降的實際水量而不是百分比
// @author       x94fujo6
// @match        https://water.taiwanstat.com/
// @grant        none
// @run-at       document-end
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
	wait();

	function log(...any) {
		console.log(`%c[顯示實際水量]%c`, "color:OrangeRed;", "", ...any);
	}

	function wait(retry = 30) {
		let target = document.querySelectorAll(".state.blue,.state.red");
		if (!target.length && retry > 0) {
			retry--;
			log(`target not found, remaining retries [${retry}]`);
			setTimeout(() => wait(retry), 500);
		} else {
			setTimeout(getData, 500);
		}
	}

	function getData() {
		let dataURL = "https://chihsuan.github.io/reservoir-data/data.json";
		$.getJSON(dataURL)
			.done((data) => main(data))
			.fail(() => console.log("getJSON failed"));
	}

	function main(data) {
		data = mapToID(data);
		let eles = document.querySelectorAll("div.reservoir-wrap>div"),
			numReg = /：(\d+.\d+)/;
		if (!eles) return;
		eles.forEach(ele => addData(ele));
		editCss();

		function mapToID(data) {
			let newData = {};
			Object.keys(data).forEach(key => {
				let o = data[key];
				newData[o.id] = o;
			});
			return newData;
		}

		function addData(ele) {
			let id = ele.querySelector("svg").id,
				rData = data[id],
				blue = ele.querySelector("div.state.blue h5"),
				red = ele.querySelector("div.state.red h5");
			if (!rData) return;
			let max = rData.baseAvailable;
			addNewLine(ele, ".volumn", `最大蓄水量：${max}萬立方公尺`);
			if (blue) addNewLine(ele, ".state.blue", `昨日水量上升：${getNum(blue, max)}萬立方公尺`);
			if (red) addNewLine(ele, ".state.red", `昨日水量下降：${getNum(red, max)}萬立方公尺`);

			function addNewLine(ele, targetClass, text) {
				let pos = ele.querySelector(targetClass),
					newEle = document.createElement("div");
				newEle.className = `${pos.className} davCss`;
				newEle.innerHTML = `<h5>${text}</h5>`;
				pos.insertAdjacentElement("afterend", newEle);
			}

			function getNum(ele, max) {
				let text = ele.textContent.match(numReg),
					num = text ? parseFloat(text[1]) : false;
				return num !== false ? calc(num, max) : 0;

				function calc(num, max) {
					return Math.round(num * max) / 100;
				}
			}
		}

		function editCss() {
			let style =
				[...
					[...document.styleSheets]
						.find(s => s.href == "https://water.taiwanstat.com/css/style.css")
						.cssRules
				].find(s => s.selectorText == ".reservoir").style;
			style.width = "max-content";
			style.marginTop = "20px";

			let newCss = document.createElement("style");
			newCss.innerHTML = `
				.davCss {
					background: rgba(0, 0, 0, 0.05);
				}
			`;
			document.head.appendChild(newCss);
		}
	}
})();
