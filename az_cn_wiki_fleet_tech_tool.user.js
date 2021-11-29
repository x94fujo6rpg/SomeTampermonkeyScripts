// ==UserScript==
// @name         碧航艦隊科技工具
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/az_cn_wiki_fleet_tech_tool.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/az_cn_wiki_fleet_tech_tool.user.js
// @version      0.05
// @description  海事局的艦隊科技頁面 可以點擊該行來標記已120的船 顯示艦船頭像
// @author       x94fujo6
// @match        https://wiki.biligame.com/blhx/%E8%88%B0%E9%98%9F%E7%A7%91%E6%8A%80
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/*
[changelog]
0.05
現在可以關閉/開啟標記功能

0.04
顯示艦船頭像(海事局)
自動更新並快取

0.03
修改標記顏色/等待的selector、正確應用delay參數
因用手機看wiki時部分欄位會被隱藏，標記方式改為整行都能觸發

0.02
自動修復當頁面在背景中載入後標題列的錯位問題 (WIKI本身問題 關掉腳本一樣會)
https://i.imgur.com/kQWlEU1.jpg

*/

(async function () {
	'use strict';
	const
		key = { ship_id: "ship_id", ship_icon: "ship_icon" },
		bg_color = "silver",
		getValue = (_key) => GM_getValue(_key, []),
		setValue = (_key, _list) => GM_setValue(_key, (_list instanceof Array) ? _list : []),
		log = (...any) => console.log(`%c[碧航艦隊科技工具]%c`, "color:OrangeRed;", "", ...any),
		sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
	let
		waitting_result = false;

	await waitTab();
	waitting_result = await waitEle({ retry: 30, selector: "#CardSelectTr>thead" });
	if (!waitting_result) return;

	main();

	function waitTab() {
		return new Promise(resolve => {
			if (document.visibilityState === "visible") return resolve();
			log("tab in background, script paused");
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState === "visible") {
					log("script unpaused");
					return resolve();
				}
			});
		});
	}

	async function waitEle({ retry = 30, selector = "", delay = 500 }) {
		let result = false;
		for (let i = 0; i < retry; i++) {
			result = document.querySelector(selector);
			if (result) break;
			if (!result) log(`target[${selector}] not found, remaining retries [${retry - i}]`, result);
			await sleep(delay);
		}
		if (result) {
			log(`found target[${selector}] continue`);
			return true;
		} else {
			log(`max retries exceeded, target[${selector}] not found`);
			return false;
		}
	}

	async function main() {
		let
			pos = document.querySelector("#CardSelectTr"),
			table = pos.querySelector("tbody"),
			msg = document.createElement("div"),
			changeColor = (eles, color = "") => {
				eles.forEach(ele => ele.style.backgroundColor = color);
			},
			updateList = (list) => {
				document.querySelector("#wiki_tool_marked_count").textContent = list.size;
				document.querySelector("#wiki_tool_marked_list").value = [...list];
			},
			addCss = () => {
				let css = document.createElement("style");
				css.textContent = `
					.fleet_tech_tool_ship_icon {
						display: inline-block;
						border: 1px solid #a2a9b1;
						border-radius: 7px;
					}

					.fleet_tech_tool_ship_name {
						display: inline-block;
						width: calc(100% - 40px);
						/*justify-content: center;*/
						word-break: keep-all;
						vertical-align: middle;
					}
				`;
				document.head.appendChild(css);
			},
			data_srcipt = [];

		addCss();
		fixDataHeader();
		table.children.forEach(tr => {
			addSwitch([...tr.children], tr);
		});
		await checkIcon();

		msg.innerHTML = `
			<div style="display: inline-block;">
				<div style="display: inline-block; color: red;">艦隊科技工具</div>作用中，點擊艦船該行任意位置進行標記。
				已標記: <div id="wiki_tool_marked_count" style="display: inline-block;">${getValue(key.ship_id).length}</div>
			</div>
			<div>
				<button id="wiki_tool_edit" class="btn btn-default">編輯/查看列表</button>
				<div id="wiki_tool_box" style="display: none;">
					<textarea id="wiki_tool_marked_list"></textarea>
					<button id="wiki_tool_save" class="btn btn-default">儲存並更新</button>
				</div>
				<button id="wiki_tool_switch" class="btn btn-default" style="width: 12rem;">標記功能: OFF</button>
			</div>
		`;
		pos.insertAdjacentElement("beforebegin", msg);

		waitting_result = false;
		waitting_result = await waitEle({ retry: 30, selector: "#wiki_tool_switch" });
		if (!waitting_result) return;

		document.querySelector("#wiki_tool_edit").onclick = () => {
			let
				box = document.querySelector("#wiki_tool_box"),
				display = box.style.display;
			box.style.display = (display == "none") ? "" : "none";
			document.querySelector("#wiki_tool_marked_list").value = getValue(key.ship_id);
		};
		document.querySelector("#wiki_tool_save").onclick = () => {
			let
				_list = new Set(document.querySelector("#wiki_tool_marked_list").value.split(",")),
				_table = document.querySelector("#CardSelectTr>tbody");
			_list.delete('');
			log("載入清單", [..._list]);
			setValue(key.ship_id, [..._list]);
			_table.children.forEach(tr => {
				let
					_id = tr.children[0].textContent.trim(),
					_isInList = _list.has(_id);
				changeColor([...tr.children], _isInList ? bg_color : "");
			});
			updateList(_list);
		};
		document.querySelector("#wiki_tool_switch").onclick = function () {
			let is_on = this.classList.contains("active");
			if (is_on) this.classList.remove("active");
			if (!is_on) this.classList.add("active");
			this.classList.remove(is_on ? "btn-success" : "btn-default");
			this.classList.add(!is_on ? "btn-success" : "btn-default");
			this.textContent = `標記功能: ${is_on ? "OFF" : "ON"}`;
		};

		log("載入清單", getValue(key.ship_id));
		loadIcon();

		function loadIcon() {
			let
				_getData = () => {
					let
						list = getValue(key.ship_icon),
						data = {};
					list.forEach(o => data[o.id] = o.icon);
					return data;
				},
				_data = _getData();

			log(`開始載入icon`);
			table.children.forEach(tr => {
				let
					_id = tr.children[0].textContent.trim(),
					_name = tr.children[1],
					_img = _name.querySelector("img"),
					_div = _name.querySelector("div");
				tr.style.padding = "0px";
				if (_img) _img.remove(); // remove old img if exist
				if (_data[_id]) {
					_img = document.createElement("img");
					_img.src = _data[_id];
					_img.className = "fleet_tech_tool_ship_icon";
					_name.insertAdjacentElement("afterbegin", _img);
					if (!_div) {
						_div = document.createElement("div");
						_div.className = "fleet_tech_tool_ship_name";
						_div.appendChild(_name.querySelector("a"));
						_name.insertAdjacentElement("beforeend", _div);
					}
				}
			});
		}

		async function checkIcon() {
			let icon_length = getValue(key.ship_icon).length;
			if (data_srcipt.length != icon_length) {
				//add update btn
				log(`檢查icon, 本頁${data_srcipt.length} != 已取得${icon_length}, 開始更新`);
				await iconHarvester();
			} else {
				log(`檢查icon, 本頁${data_srcipt.length} == 已取得${icon_length}, 不需更新`);
			}

			async function iconHarvester() {
				let
					url = "https://wiki.biligame.com/blhx/%E5%AE%9E%E8%A3%85%E6%97%A5%E6%9C%9F",
					parser = new DOMParser(),
					page = await fetch(url);
				if (page.status !== 200) {
					throw Error(`unable to get ${url}`);
				} else {
					let
						html_text = await page.text(),
						dom = parser.parseFromString(html_text, "text/html"),
						waitParser = new Promise((resolve) => { if (dom.readyState == "complete") resolve(true); }),
						data_icon = [],
						promise_list = [];
					log("wait dom");

					await waitParser.then(() => {
						log("dom loaded");
						let data_wiki = extractData(dom);
						data_wiki.forEach(o => {
							if (data_srcipt.find(id => id == o.id)) {
								data_icon.push({
									id: o.id,
									icon: o.icon,
								});
							}
						});
						log("更新完畢", { data_wiki, data_srcipt, data_icon });
					});

					log("開始轉換為快取");
					data_icon.forEach(data => {
						promise_list.push(
							fetchImageToDataURI(data.icon)
								.then(data_url => data.icon = data_url)
						);
					});

					await Promise.all(promise_list);
					log("轉換完畢");
					setValue(key.ship_icon, data_icon);

					return true;
				}

				async function fetchImageToDataURI(url = "", test = false) {
					let local = window.location.protocol == "file:" ? true : false;
					if (test || local) {
						return url; // can't fetch in local file
					} else {
						return fetch(url).then(r => {
							return r.blob();
						}).then(blob => {
							return blobToURL(blob);
						});
					}
					function blobToURL(blob) {
						return new Promise((resolve, reject) => {
							var fr = new FileReader();
							fr.onload = () => { resolve(fr.result); };
							fr.onerror = reject;
							fr.readAsDataURL(blob);
						});
					}
				}

				function extractData(dom) {
					let
						extractor = (ele) => {
							let _data = [],
								nor = (node) => node.textContent.trim().replace(/[\s·]/mg, "");
							ele.querySelector("tbody")
								.children
								.forEach((line, i) => {
									if (i > 0) {
										let img = line.querySelector("img");
										if (img) {
											_data.push({
												id: nor(line.children[0]),
												name: nor(line.children[1]),
												//date: nor(node.children[2]),
												icon: img.src,
											});
										}
									}
								});
							return _data;
						},
						list = [],
						target = dom.querySelector("#mw-content-text");
					//log([target]);
					target.querySelector("div[class=row]")
						.children
						.forEach(ele => list = list.concat(extractor(ele)));
					//log(JSON.stringify(list));
					//log(list);
					return list;
				}
			}
		}

		function fixDataHeader() {
			let head = document.querySelector("#CardSelectTr>thead");
			if (head.children.length == 1) {
				let bottom = document.querySelector("#CardSelectTr>tbody>tr");
				log("missing head, trying to fix it");
				if (!(bottom.innerHTML.match(/dataHeader headerSort/gm))) {
					throw Error(`element not found, abort\n${bottom.innerHTML}`);
				} else {
					head.appendChild(bottom);
					log("head fixed");
				}
			} else {
				log("normal datahead");
			}
		}

		function addSwitch(elelist, target) {
			target.onclick = () => checkList();
			checkList(true); // at start

			async function checkList(ini = false) {
				let
					addToList = async () => {
						_list.add(`${_id}`);
						setValue(key.ship_id, [..._list]);
					},
					removeFromList = async () => {
						_list.delete(`${_id}`);
						setValue(key.ship_id, [..._list]);
					},
					_list = new Set(getValue(key.ship_id)),
					_id = elelist[0].innerText.trim(),
					_name = elelist[1].innerText.trim(),
					_isInList = _list.has(_id),
					_is_on = document.querySelector("#wiki_tool_switch")?.classList.contains("active");
				if (!_is_on && !ini) return;
				if (ini) data_srcipt.push(_id);
				if (_isInList) {
					if (!ini) {
						await removeFromList(_id);
						log(`remove ${_id} ${_name}, list size:${_list.size}`);
						changeColor(elelist);
						updateList(_list);
					} else {
						changeColor(elelist, bg_color);
					}
				} else {
					if (!ini) {
						await addToList(_id);
						log(`add ${_id} ${_name}, list size:${_list.size}`);
						changeColor(elelist, bg_color);
						updateList(_list);
					} else {
						changeColor(elelist);
					}
				}
			}
		}
	}
})();

