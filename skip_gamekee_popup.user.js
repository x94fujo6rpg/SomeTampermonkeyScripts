// ==UserScript==
// @name         skip gamekee popup
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/skip_gamekee_popup.user.js
// @version      0.2
// @description  自動關閉gamekee註冊訊息
// @author       x94fujo6
// @include      https://*.gamekee.com/*
// ==/UserScript==

(async function () {
	function wait_tab() {
		return new Promise(resolve => {
			if (document.visibilityState === "visible") return resolve();
			console.log("tab in background, script paused");
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState === "visible") { console.log("script unpaused"); return resolve(); }
			});
		});
	}

	function waitHTML(css_selector, run) {
		let id = setInterval(() => {
			if (document.querySelectorAll(css_selector).length) {
				clearInterval(id);
				run();
				console.log(`found [${css_selector}]`);
			} else {
				console.log(`[${css_selector}] not found`);
			}
		}, 100);
	}

	function main() {
		let css_selector = ".el-popup-parent--hidden";
		removePopup();
		waitHTML(css_selector, () => resumeBody(css_selector.replace(".", "")));
	}

	function removePopup() {
		let css_selector = [
			"body > .el-dialog__wrapper",
			".v-modal"
		].join(",");

		document.querySelectorAll(css_selector)
			.forEach(ele => {
				ele.remove();
			});
	}

	function resumeBody(class_name = "") {
		document.body.style.overflow = "unset";
		document.body.classList.remove(class_name);
	}

	await wait_tab();
	waitHTML("body > .el-dialog__wrapper", main);
})();

