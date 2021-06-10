// ==UserScript==
// @name         ptt chrome autosave blacklist
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ptt_chrome_blacklist_autosave.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ptt_chrome_blacklist_autosave.user.js
// @version      0.02
// @description  autosave blacklist (use Tampermonkey API GM_setValue & GM_getValue)
// @author       x94fujo6
// @match        https://iamchucky.github.io/PttChrome/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==
/* jshint esversion: 9 */

(async function () {
	let
		blacklist = false,
		addUser = false,
		removeUser = false;
	const
		listKey = "blackList",
		log = (...any) => console.log(`%c[autosave blacklist]%c`, "color:OrangeRed;", "", ...any),
		setGMValue = (key = listKey, value = "") => GM_setValue(key, value),
		getGMValue = (key = listKey, default_value = false) => GM_getValue(key, default_value),
		getListInApp = () => {
			if (!pttchrome.app) return false;
			let list = Object.keys(pttchrome.app.pref.blacklistedUserIds);
			list = list.join("\n");
			return list;
		},
		autoSave = () => {
			let data = getListInApp();
			if (!data.length) return;
			setGMValue(listKey, data);
			log(`autosave blacklist [${data.split("\n").length}]`);
		},
		loadList = () => {
			let data = getGMValue(),
				list = pttchrome.app.pref.blacklistedUserIds,
				count = 0;
			if (!data.length) return;
			blacklist.value = data;
			data = data.split("\n");
			log(`load blacklist [${data.length}]`);
			data.forEach(id => {
				if (list[id]) return;
				list[id] = true;
				count++;
			});
			log(`added missing id [${count}]`);
		},
		start = () => {
			log(`script start`);
			blacklist.addEventListener("input", autoSave);
			addUser.addEventListener("click", autoSave);
			removeUser.addEventListener("click", autoSave);
			loadList();
		},
		wait = (retry = 30) => {
			blacklist = document.querySelector("#opt_blacklistedUsers");
			addUser = document.querySelector("#cmenu_addBlacklistUserId");
			removeUser = document.querySelector("#cmenu_removeBlacklistUserId");
			if ((!blacklist || !addUser || !removeUser) && retry > 0) {
				retry--;
				log(`target not found, remaining retries [${retry}]`);
				setTimeout(() => wait(retry), 1000);
			} else {
				setTimeout(start, 1000);
			}
		};
	wait();
})();
