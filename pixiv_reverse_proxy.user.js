// ==UserScript==
// @name         pixiv reverse proxy
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @version      0.0.1
// @description  Reverse proxy all images. If you are experiencing 56k speeds on pixiv, try this. (I can't even load my own post. WTF)
// @author       x94fujo6
// @match        https://www.pixiv.net/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
/*jshint esversion: 6 */

(function () {

	setInterval(() => {
		replaceLink();
		replaceImg();
	}, 1000);

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
