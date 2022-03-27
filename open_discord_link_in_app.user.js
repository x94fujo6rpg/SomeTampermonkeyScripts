// ==UserScript==
// @name         open discord link in app
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/open_discord_app.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/open_discord_app.user.js
// @version      0.01
// @description  use discord app to open discord link instead of open in browser
// @author       x94fujo6
// @match        *://*/*
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
	let reg = /https\:\/\/(discordapp\.com\/channels.*|discord\.com\/channels.*)/,
		links = document.querySelectorAll("a"),
		discord_links = [...links].filter(a => a.href.match(reg));
	[...discord_links].forEach(a => a.href = a.href.replace(reg, "discord://$1"));
})();
