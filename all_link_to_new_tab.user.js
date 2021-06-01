// ==UserScript==
// @name         all_link_to_new_tab
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/all_link_to_new_tab.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/all_link_to_new_tab.user.js
// @version      0.01
// @description  make all link open in new tab
// @author       x94fujo6
// @match        *://*/*
// @grant        none
// @run-at       document-body
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
	'use strict';
	console.log("script start");
	const
		openLink = (link) => window.open(link, "_blank", "noreferrer"),
		setOnclick = () => {
			let links = document.querySelectorAll("[href]");
			if (links) {
				links.forEach(link => {
					link.onclick = function (event) {
						openLink(link.href);
						event.preventDefault();
					};
				});
			} else {
				setTimeout(setOnclick, 500);
			}
		},
		setQueue = (max = 3) => {
			for (let i = 0; i < max; i++) {
				setTimeout(setOnclick, 1000 * i);
			}
		},
		ob = new MutationObserver(setQueue);
	setQueue();
	ob.observe(document.body, { childList: true, });
})();

