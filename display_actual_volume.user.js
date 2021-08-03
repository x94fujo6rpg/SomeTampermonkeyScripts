// ==UserScript==
// @name         顯示實際水量
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/display_actual_volume.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/display_actual_volume.user.js
// @version      0.8
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
		let dataURL = "https://www.taiwanstat.com/waters/latest";
		$.getJSON(dataURL)
			.done((data) => main(data[0]))
			.fail(() => console.log("getJSON failed"));
	}

	function main(data) {
		data = mapToID(data);
		let eles = document.querySelectorAll("div.reservoir-wrap>div"),
			numReg = /：(\d+.\d+)/,
			sum = sumAll(data, "volumn"),
			sumMax = sumAll(data, "baseAvailable");
		if (!eles) return;
		eles.forEach(ele => {
			addData(ele, sum, sumMax);

			let name = ele.querySelector(".name");
			if (name) name.childNodes[0].textContent += "　　";
		});

		let ele = addSum(sum, sumMax, data);
		addData(ele, sum, sumMax);
		editCss();
		add_sort();

		function add_sort() {
			let
				b_data = [
					{ t: "預設", key: "sid" },
					{ t: "有效蓄水", key: "vol" },
					{ t: "最大蓄水", key: "max" },
					{ t: "昨日上升", key: "inc_v" },
					{ t: "昨日下降", key: "dec_v" },
					{ t: "昨日上升(%)", key: "inc_p" },
					{ t: "昨日下降(%)", key: "dec_p" },
				],
				pos = document.querySelector("div.reservoir-wrap"),
				box = Object.assign(document.createElement("div"), { className: "sortbox" }),
				sel_a = Object.assign(document.createElement("select"), { id: "sort_des" }),
				sel_b = Object.assign(document.createElement("select"), { id: "sort_key" }),
				option,
				sorting = () => {
					let des = document.querySelector("#sort_des").selectedOptions[0].value,
						key = document.querySelector("#sort_key").selectedOptions[0].value;
					resort(key, parseInt(des));
				},
				b = Object.assign(document.createElement("button"), { textContent: "排序", onclick: () => sorting() });

			box.style = `
				text-align: center;
				font-size: large;
			`;

			b.style = `
				margin: 0px 10px;
				padding: 0px 20px;
			`;

			sel_a.innerHTML = `
				<option value="1">降序</option>
				<option value="0">升序</option>
			`;

			b_data.forEach(data => {
				option = document.createElement("option");
				option.text = data.t;
				option.value = data.key;
				sel_b.appendChild(option);
			});

			box.appendChild(sel_a);
			box.appendChild(sel_b);
			box.appendChild(b);
			pos.insertAdjacentElement("beforebegin", box);

			function resort(key, des = true) {
				let
					pos = document.querySelector("div.reservoir-wrap"),
					eles = pos.querySelectorAll("div.reservoir"),
					sort_by = {
						sid: true,
						vol: /有效蓄水量：(\d+\.\d+)萬立方公尺/,
						max: /最大蓄水量：(\d+\.\d+)萬立方公尺/,
						inc_p: /昨日水量上升：(\d+\.\d+)%/,
						inc_v: /昨日水量上升：(\d+\.\d+)萬立方公尺/,
						dec_p: /昨日水量下降：(\d+\.\d+)%/,
						dec_v: /昨日水量下降：(\d+\.\d+)萬立方公尺/,
					},
					data = [],
					rid, sortdata,
					ns = (a, b) => String(a).localeCompare(String(b), navigator.languages[0] || navigator.language, { numeric: true });
	
				if (!sort_by[key]) throw Error("unknown key");
	
				// set id for sort
				if (!eles[0].getAttribute("sid")) {
					eles.forEach(e => {
						e.setAttribute("sid", e.querySelector("svg").id);
					});
				}
	
				eles.forEach(e => {
					rid = e.getAttribute("sid");
					if (key !== "sid") {
						sortdata = e.innerHTML.match(sort_by[key]);
						sortdata = sortdata ? sortdata[1] : "";
					} else {
						sortdata = rid;
					}
					data.push({
						ele: e,
						sortdata: sortdata,
					});
				});
	
				if (key !== "sid") {
					if (!des) {
						data = data.sort((a, b) => ns(a.sortdata, b.sortdata));
					} else {
						data = data.sort((a, b) => ns(b.sortdata, a.sortdata));
					}
				} else {
					if (des) {
						data = data.sort((a, b) => ns(a.sortdata, b.sortdata));
					} else {
						data = data.sort((a, b) => ns(b.sortdata, a.sortdata));
					}
				}
	
				log("sort result:", data);
				data.forEach(o => pos.appendChild(o.ele));
			}
		}

		function sumAll(data, target) {
			let sum = 0;
			for (let key in data) {
				let num = parseFloat(data[key][target]);
				sum += isNaN(num) ? 0 : num;
			}
			log(`${sumAll.name} [${target}]: ${sum}`);
			return sum;
		}

		function mapToID(data) {
			let newData = {};
			Object.keys(data).forEach(key => {
				let o = data[key];
				newData[o.id] = o;
			});
			return newData;
		}

		function addSum(sum, sumMax, rdata) {
			let reservoirName = "全台水庫",
				dataForSvg = {};
			dataForSvg[reservoirName] = {
				name: reservoirName,
				daliyNetflow: sumAll(rdata, "daliyNetflow"),
				daliyInflow: sumAll(rdata, "daliyInflow"),
				daliyOverflow: sumAll(rdata, "daliyOverflow"),
				percentage: 0,
				volumn: parseFloat(sum).toFixed(2),
				updateAt: "userscript",
				id: "reservoir999",
				baseAvailable: parseFloat(sumMax).toFixed(2),
			};
			let reservoir = dataForSvg[reservoirName];
			reservoir.percentage = Math.round((reservoir.volumn / reservoir.baseAvailable) * 10000) / 100;
			log(`percentage, ${reservoir.percentage}`);

			// add to data
			data[reservoir.id] = reservoir;
			log(reservoir);

			let newEle = addNewEle();
			setAnimate();
			return newEle;

			function addNewEle() {
				let pos = document.querySelector(".reservoir-wrap"),
					ele = document.createElement("div");
				ele.className = "reservoir";
				ele.innerHTML = `
					<div class="name">
						<h3>${reservoirName}　　</h3>
					</div>
					<svg id="reservoir999" width="100%" height="250"></svg>
					<div class="volumn">
						<h5>${reservoir.volumn}萬立方公尺</h5>
					</div>
					<div class="state">
						<h5>萬立方公尺</h5>
					</div>
					<div class="dueDay">
						<h5>預測剩餘天數：----</h5>
					</div>
					<div class="updateAt">更新時間：0000-00-00 (0時)</div>
				`;
				pos.appendChild(ele);
				return ele;
			}

			// source https://water.taiwanstat.com/js/index.js
			function setAnimate() {
				var percentage = parseFloat(dataForSvg[reservoirName].percentage).toFixed(1);
				var updateAt = dataForSvg[reservoirName].updateAt;
				var volumn = dataForSvg[reservoirName].volumn;
				var id = dataForSvg[reservoirName].id;
				var netFlow = -parseFloat(dataForSvg[reservoirName].daliyNetflow).toFixed(1);
				var netPercentageVar;

				log(netFlow);

				if (isNaN(percentage)) {
					$('#' + id).parent().remove();
					return;
				}

				if (isNaN(netFlow)) {
					$('#' + id).siblings('.state')
						.children('h5')
						.text('昨日水量狀態：待更新');
					$('#' + id).siblings('.state').removeClass();
				} else if (netFlow < 0) {
					netPercentageVar = ((-netFlow) / parseFloat(dataForSvg[reservoirName].baseAvailable) * 100).toFixed(2);

					var usageDay = Math.round(percentage / netPercentageVar);
					if (dataForSvg[reservoirName].percentage > 80 && netPercentageVar > 2) usageDay = 60;

					if (usageDay >= 60) {
						usageDay = '預測剩餘天數：60天以上';
					} else if (usageDay >= 30) {
						usageDay = '預測剩餘天數：30天-60天';
						$('#' + id).siblings('.dueDay').addClass('red');
					} else {
						usageDay = '預測剩餘天數：' + usageDay + '天';
						$('#' + id).siblings('.dueDay').addClass('red');
					}

					$('#' + id).siblings('.dueDay')
						.children('h5')
						.text(usageDay);

					$('#' + id).siblings('.state')
						.children('h5')
						.text('昨日水量下降：' + netPercentageVar + '%');

					$('#' + id).siblings('.state').addClass('red');
				} else {
					netPercentageVar = ((netFlow) / parseFloat(dataForSvg[reservoirName].baseAvailable) * 100).toFixed(2);

					$('#' + id).siblings('.state')
						.children('h5')
						.text('昨日水量上升：' + netPercentageVar + '%');
					$('#' + id).siblings('.state').addClass('blue');
				}

				configs[reservoirName] = liquidFillGaugeDefaultSettings();
				configs[reservoirName].waveAnimate = true;
				configs[reservoirName].waveAnimateTime = setAnimateTime(percentage);
				configs[reservoirName].waveOffset = 0.3;
				configs[reservoirName].waveHeight = 0.05;
				configs[reservoirName].waveCount = setWavaCount(percentage);
				setColor(configs[reservoirName], percentage);

				$('#' + id).siblings('.updateAt').html('<h5>更新時間：' + updateAt + '</h5>');
				$('#' + id).siblings('.volumn').children('h5').text('有效蓄水量：' + volumn + '萬立方公尺');
				loadLiquidFillGauge(id, percentage, configs[reservoirName]);
			}

			function setColor(config, percentage) {
				if (percentage < 25) {
					config.circleColor = "#FF7777";
					config.textColor = "#FF4444";
					config.waveTextColor = "#FFAAAA";
					config.waveColor = "#FFDDDD";
				}
				else if (percentage < 50) {
					config.circleColor = "rgb(255, 160, 119)";
					config.textColor = "rgb(255, 160, 119)";
					config.waveTextColor = "rgb(255, 160, 119)";
					config.waveColor = "rgba(245, 151, 111, 0.48)";
				}
			}

			function setWavaCount(percentage) {
				if (percentage > 75) {
					return 3;
				} else if (percentage > 50) {
					return 2;
				}
				return 1;
			}

			function setAnimateTime(percentage) {
				if (percentage > 75) {
					return 2000;
				} else if (percentage > 50) {
					return 3000;
				} else if (percentage > 25) {
					return 4000;
				}
				return 5000;
			}

			function addZero(i) {
				if (i < 10) {
					i = "0" + i;
				}
				return i;
			}
		}

		function addData(ele, sum, sumMax) {
			let id = ele.querySelector("svg").id,
				rData = data[id],
				eff = ele.querySelector("div.volumn"),
				blue = ele.querySelector("div.state.blue h5"),
				red = ele.querySelector("div.state.red h5");
			if (!rData) return;
			let max = rData.baseAvailable;
			addNewLine(ele, ".volumn", `　└ 佔全台：${Math.floor(max / sumMax * 10000) / 100}%`);
			addNewLine(ele, ".volumn", `最大蓄水量：${max}萬立方公尺`);
			addNewLine(ele, ".volumn", `　└ 佔全台：${getPercent(eff, sum)}%`);
			if (blue) {
				addNewLine(ele, ".state.blue", `昨日水量上升：${calcVolume(blue, max)}萬立方公尺`);
			} else if (red) {
				addNewLine(ele, ".state.red", `昨日水量下降：${calcVolume(red, max)}萬立方公尺`);
			} else {
				addNewLine(ele, ".dueDay", `　`, true);
			}

			function addNewLine(ele, targetClass, text, empty = false) {
				let pos = ele.querySelector(targetClass),
					newEle = document.createElement("div");
				if (!empty) newEle.className = `${pos.className} davCss`;
				newEle.innerHTML = `<h5>${text}</h5>`;
				pos.insertAdjacentElement(empty ? "beforebegin" : "afterend", newEle);
			}

			function getNum(ele) {
				let text = ele.textContent.match(numReg),
					num = text ? parseFloat(text[1]) : false;
				return num !== false ? num : 0;
			}

			function calcVolume(ele, max) {
				let num = getNum(ele);
				return num !== 0 ? calc(num, max) : 0;

				function calc(num, max) {
					return Math.round(num * max) / 100;
				}
			}

			function getPercent(ele, max) {
				let num = getNum(ele);
				return num !== 0 ? calc(num, max) : 0;

				function calc(num, max) {
					return Math.floor((num / max) * 10000) / 100;
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
