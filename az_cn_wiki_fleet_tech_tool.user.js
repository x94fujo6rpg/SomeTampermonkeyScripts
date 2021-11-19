// ==UserScript==
// @name         碧航艦隊科技工具
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/az_cn_wiki_fleet_tech_tool.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/az_cn_wiki_fleet_tech_tool.user.js
// @version      0.03
// @description  海事局的艦隊科技頁面 可以點擊該行來標記已120的船
// @author       x94fujo6
// @match        https://wiki.biligame.com/blhx/%E8%88%B0%E9%98%9F%E7%A7%91%E6%8A%80
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/**
 * [changelog]
 * 0.03
 * 修改標記顏色/等待的selector、正確應用delay參數
 * 因用手機看wiki時部分欄位會被隱藏，標記方式改為整行都能觸發
 * 
 * 0.02
 * 自動修復當頁面在背景中載入後標題列的錯位問題 (WIKI本身問題 關掉腳本一樣會)
 * https://i.imgur.com/kQWlEU1.jpg
 * 
 */

(function () {
	'use strict';
	const
		key = { ship_id: "ship_id", },
		bg_color = "silver",
		getValue = () => GM_getValue(key.ship_id, []),
		setValue = (list) => GM_setValue(key.ship_id, (list instanceof Array) ? list : []),
		log = (...any) => console.log(`%c[碧航艦隊科技工具]%c`, "color:OrangeRed;", "", ...any),
		sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

	waitPageLoad(30, "#CardSelectTr>thead", main);

	async function waitPageLoad(retry = 30, selector = "", run = () => { }, delay = 1000) {
		await waitTab();
		waitEle();

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

		async function waitEle() {
			if (selector.length) {
				let target = document.querySelector(selector);
				if (!target && retry > 0) {
					retry--;
					log(`target not found, remaining retries [${retry}]`);
					setTimeout(() => waitEle(retry), delay);
				} else {
					await sleep(delay);
					run();
				}
			} else {
				throw Error("selector is empty");
			}
		}
	}


	function main() {
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
			};

		fixDataHeader();

		table.children.forEach(tr => addSwitch([...tr.children], tr));
		msg.innerHTML = `
			<div style="display: inline-flex;">
				<div style="color: red;">碧航艦隊科技工具</div>作用中，點擊艦船編號可進行標記。 已標記: <div id="wiki_tool_marked_count">${getValue().length}</div>
			</div>
			<div>
				<button id="wiki_tool_edit">編輯/查看列表</button>
				<div id="wiki_tool_box" style="display: none;">
					<textarea id="wiki_tool_marked_list"></textarea>
					<button id="wiki_tool_save">儲存並更新</button>
				</div>
			</div>
		`;
		pos.insertAdjacentElement("beforebegin", msg);
		document.querySelector("#wiki_tool_edit").onclick = () => {
			let
				box = document.querySelector("#wiki_tool_box"),
				display = box.style.display;
			box.style.display = (display == "none") ? "" : "none";
			document.querySelector("#wiki_tool_marked_list").value = getValue();
		};
		document.querySelector("#wiki_tool_save").onclick = () => {
			let
				_list = new Set(document.querySelector("#wiki_tool_marked_list").value.split(",")),
				table = document.querySelector("#CardSelectTr>tbody");
			_list.delete('');
			log("載入清單", [..._list]);
			setValue([..._list]);
			table.children.forEach(tr => {
				let
					_id = tr.children[0].textContent.trim(),
					_isInList = _list.has(_id);
				changeColor([...tr.children], _isInList ? bg_color : "");
			});
			updateList(_list);
		};
		log("載入清單", getValue());

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
						setValue([..._list]);
					},
					removeFromList = async () => {
						_list.delete(`${_id}`);
						setValue([..._list]);
					},
					_list = new Set(getValue()),
					_id = elelist[0].innerText.trim(),
					_name = elelist[1].innerText.trim(),
					_isInList = _list.has(_id);

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

