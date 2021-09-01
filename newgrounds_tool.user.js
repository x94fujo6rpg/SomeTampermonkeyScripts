// ==UserScript==
// @name         newgrounds tool
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/newgrounds_tool.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/newgrounds_tool.user.js
// @version      0.01
// @description  download video/auto select best resolution...etc
// @author       x94fujo6
// @match        https://www.newgrounds.com/portal/view/*
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
	const
		script_name = "newgrounds tool",
		slog = (...any) => console.log(`[${script_name}]`, ...any);
	window.onload = () => wait_data();

	function wait_data(retry = 10) {
		let data = $ng_adcode_page;
		if (retry <= 0) return slog("max retry, abort");
		if (!data) {
			slog(`wait for data..., retry:${retry}`);
			retry--;
			setTimeout(() => wait_data(retry), 500);
		} else {
			start_script();
		}
	}

	async function start_script() {
		let
			button = document.querySelector(`[data-action="play"]`),
			video = document.querySelector(`.ng-video-player>video>source`);
		if (!isPlayer()) return slog("not video");
		if (!button || !video) return slog("no play button or source");
		button.click();
		setTimeout(add_download, 1000);

		async function add_download() {
			button.click();
			let res = await sel_best(),
				video_data = document.querySelector(`.ng-video-player>video>source`),
				pos = document.querySelector(`.body-guts`),
				dl_button = document.createElement("a"),
				filename = video_data.src.match(/\/(\w+\.\w+\.\w{3,4})\?\d+$/),
				format = video_data.src.match(/(.\w{3,4})\?\d+$/),
				title = document.querySelector(`#embed_header>[itemprop="name"]`).textContent;

			if (!res || !format) return slog("unknown video format, abort", res, format);
			if (!filename) return slog("filename not found", filename);
			if (!title) return slog("no title", title);

			filename = filename[1];
			format = format[1];
			dl_button.href = video_data.src;
			dl_button.title = dl_button.download = `${title} [${res}]${format}`;			
			dl_button.innerHTML = `[ Left Click ]  to Copy Title: ${dl_button.title}<br>[ Right Click > Save as ]  to Download`;
			dl_button.style = `
				display: block;
				width: 100%;
				text-align: center;
				padding: 1rem;
				font-size: large;
				border: 0.1rem white solid;
			`;
			dl_button.referrerPolicy = "no-referrer";
			dl_button.rel = "noreferrer noopener nofollow";
			dl_button.target = "_blank";
			dl_button.onclick = (event) => {
				event.preventDefault();
				navigator.clipboard.writeText(dl_button.title);
			};
			pos.insertAdjacentElement("afterbegin", dl_button);

			slog(`add dl ${dl_button.href}`);

			async function sel_best() {
				let q = document.querySelector(`.ng-video-options[data-options="res"]`);
				if (!q) return false;
				if (!q.children.length) return false;
				q.children[0].click();
				return q.children[0].textContent;
			}
		}

		function isPlayer() {
			if ($ng_adcode_page !== "movie-view") return false;
			return document.querySelector(".ng-video-player") ? true : false;
		}
	}
})();