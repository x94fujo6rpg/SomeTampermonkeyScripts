// ==UserScript==
// @name         pixiv reverse proxy
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @version      0.0.2
// @description  Reverse proxy all images. If you are experiencing 56k speeds on pixiv, try this. (I can't even load my own post. WTF)
// @author       x94fujo6
// @match        https://www.pixiv.net/*
// @match        https://i.pximg.net/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
/*jshint esversion: 6 */

(function () {

	setInterval(() => {
		main();
	}, 1000);

	function main() {
		let url = window.location.href;
		if (url.includes("//i.pximg.net")) {
			window.location.href = url.replace("//i.pximg.net", "//i.pixiv.cat");
		} else {
			replaceLink();
			replaceImg();
		}
	}

	function replaceLink() {
		let images = document.querySelectorAll("a[href*='i.pximg.net']");
		if (!images) return;
		images.forEach(a => {
			if (!(a.getAttribute("reverse_proxy"))) {
				let link = getProxy(a.href);
				if (link) {
					a.href = link;
					a.setAttribute("reverse_proxy", true);
					console.log(`reverse proxy [link]: ${link}`);
				}
			}
		});
	}

	function replaceImg() {
		let targets = document.querySelectorAll("img[src*='i.pximg.net']");
		if (!targets) return;
		targets.forEach(img => {
			if (!(img.getAttribute("reverse_proxy"))) {
				let link = getProxy(img.src);
				if (link) {
					img.src = link;
					img.setAttribute("reverse_proxy", true);
					console.log(`reverse proxy [img]: ${link}`);
				}
			}
		});
	}

	function getProxy(link) {
		let reg = /i\.pximg\.net\/(.*)/,
			proxy = "https://i.pixiv.cat/",
			extract;
		if (!link) throw Error("empty link");
		extract = reg.exec(link);
		return extract ? `${proxy}${extract[1]}` : false;
	}
})();
