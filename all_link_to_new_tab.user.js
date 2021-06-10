// ==UserScript==
// @name         open all link in new tab
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/all_link_to_new_tab.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/all_link_to_new_tab.user.js
// @version      0.03
// @description  make all link open in new tab
// @author       x94fujo6
// @match        *://*/*
// @grant        GM_openInTab
// @run-at       document-body
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
	'use strict';
	const
		/**
		 * active: decides whether the new tab should be focused, (是否在新分頁打開後跳到該分頁)
		 * insert: that inserts the new tab after the current one, (是否將新分頁排在目前分頁後面)
		 * setParent: makes the browser re-focus the current tab on close and (是否在該分頁關閉時回到目前分頁)
		 * incognito: makes the tab being opened inside a incognito mode/private mode window. (是否在隱密模式下打開分頁)
		 */
		newTabConfig = {
			active: false,
			inserts: false,
			setParent: false,
			incognito: false,
		},
		linkReg = /^(https|http):\/\/.+/,
		log = (...any) => console.log(`%c[open all link in new tab]%c`, "color:OrangeRed;", "", ...any),
		asyncTimeout = (fun, time) => {
			return new Promise(resolve => {
				setTimeout(() => {
					fun();
					resolve();
				}, time);
			});
		},
		setOnclick = () => {
			let links = document.querySelectorAll("[href]");
			if (links) {
				links.forEach(link => {
					if (!link.href.match(linkReg)) {
						log(`this is not a http/https link, skip`, link);
						return;
					}
					if (link.getAttribute("setNewTab") == "true") {
						log(`this link has been set, skip`, link);
						return;
					}
					link.onclick = function (event) {
						GM_openInTab(link.href, newTabConfig);
						event.preventDefault();
					};
					link.setAttribute("setNewTab", true);
				});
				return true;
			} else {
				setTimeout(setOnclick, 500);
				return false;
			}
		},
		setQueue = async (max = 3) => {
			let done = false;
			for (let i = 0; i < max; i++) {
				await asyncTimeout(() => done = setOnclick(), 1000 * i);
				if (!done) continue;
				log("all links are set");
				break;
			}
		},
		ob = new MutationObserver(setQueue);

	//--------------------------------
	log("script start");
	setQueue();
	ob.observe(document.body, { childList: true, });

})();

