// ==UserScript==
// @name         碧航艦隊科技工具
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/az_cn_wiki_fleet_tech_tool.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/az_cn_wiki_fleet_tech_tool.user.js
// @version      0.01
// @description  海事局的艦隊科技頁面 可以點擊編號來標記已120的船
// @author       x94fujo6
// @match        https://wiki.biligame.com/blhx/%E8%88%B0%E9%98%9F%E7%A7%91%E6%8A%80
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
	'use strict';
	const
		key = { ship_id: "ship_id", },
		bg_color = "gray",
		getValue = () => GM_getValue(key.ship_id, []),
		setValue = (list) => GM_setValue(key.ship_id, (list instanceof Array) ? list : []);
	wait();

	function wait(retry = 30) {
		let target = document.querySelector("#CardSelectTr");
		if (!target && retry > 0) {
			retry--;
			log(`target not found, remaining retries [${retry}]`);
			setTimeout(() => wait(retry), 500);
		} else {
			setTimeout(main, 500);
		}
	}

	function main() {
		let
			pos = document.querySelector("#CardSelectTr"),
			table = pos.querySelector("tbody"),
			msg = document.createElement("div");
		table.children.forEach(tr => addSwitch([...tr.children], tr.children[0]));
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
				table = document.querySelector("#CardSelectTr>tbody"),
				changeColor = (eles, color = "") => {
					eles.forEach(ele => ele.style.backgroundColor = color);
				},
				updateList = (list) => {
					document.querySelector("#wiki_tool_marked_count").textContent = list.size;
				};
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
		log(getValue());

		function addSwitch(elelist, id) {
			id.onclick = () => checkList();
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
					changeColor = (color = "") => {
						elelist.forEach(ele => ele.style.backgroundColor = color);
					},
					updateList = (list) => {
						document.querySelector("#wiki_tool_marked_count").textContent = list.size;
						document.querySelector("#wiki_tool_marked_list").value = [...list];
					},
					_list = new Set(getValue()),
					_id = id.innerText.trim(),
					_name = elelist[1].innerText.trim(),
					_isInList = _list.has(_id);

				if (_isInList) {
					if (!ini) {
						await removeFromList(_id);
						log(`remove ${_id} ${_name}, list size:${_list.size}`);
						changeColor();
						updateList(_list);
					} else {
						changeColor(bg_color);
					}
				} else {
					if (!ini) {
						await addToList(_id);
						log(`add ${_id} ${_name}, list size:${_list.size}`);
						changeColor(bg_color);
						updateList(_list);
					} else {
						changeColor();
					}
				}
			}
		}
	}

	function log(...any) {
		console.log(`%c[碧航艦隊科技工具]%c`, "color:OrangeRed;", "", ...any);
	}
})();

