// ==UserScript==
// @name         open discord link in app
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/open_discord_app.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/open_discord_app.user.js
// @version      0.02
// @description  use discord app to open discord link instead of open in browser
// @author       x94fujo6
// @match        *://*/*
// ==/UserScript==
/* jshint esversion: 9 */

(async function () {
	const script_name = "open discord link in app";
	let count = 0, id;

	await wait_tab();

	id = setInterval(() => {
		let result = main();
		if (!result) {
			count++;
		}
		if (count >= 10) {
			clearInterval(id);
		}
	}, 1000);

	function main() {
		let reg = /https\:\/\/(discordapp\.com\/channels.*|discord\.com\/channels.*)/,
			links = document.querySelectorAll("a"),
			discord_links;
		if (links.length > 0) {
			discord_links = [...links].filter(a => a.href.match(reg));
			if (discord_links.length > 0) {
				[...discord_links].forEach(a => a.href = a.href.replace(reg, "discord://$1"));
				return true;
			}
		}
		return false;
	}

	function wait_tab() {
		return new Promise(resolve => {
			if (document.visibilityState === "visible") return resolve();
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState === "visible") {
					return resolve();
				}
			});
		});
	}

})();
