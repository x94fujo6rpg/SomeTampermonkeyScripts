// ==UserScript==
// @name         avgle m3u8 extractor
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/avgle_m3u8_extractor.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/avgle_m3u8_extractor.user.js
// @version      0.02
// @description  extract m3u8 after click close / use video title as filename
// @author       x94fujo6
// @match		 https://avgle.com/video/*
// ==/UserScript==
/* jshint esversion: 9 */
/*
reference:
https://github.com/download-online-video/chrome-avgle-helper/issues/21
https://github.com/download-online-video/chrome-avgle-helper/issues/54
*/
(function () {
	let msgid = "avgle extract tool";
	let discard_first_seg = false; //discard the first segment
	let url_only = false; //only the video url as .txt instead of .m3u8 (for youtube-dl/uget/wget...etc)

	window.onload = main();

	function debug_msg(...any) {
		console.log(`[${msgid}]: `, ...any);
	}

	function debug_data(...any) {
		console.log(...any);
	}

	function newButton(button_id, button_text, button_style, button_onclick) {
		let button = Object.assign(document.createElement("button"), {
			id: button_id,
			textContent: button_text,
			onclick: button_onclick,
		});
		Object.assign(button.style, button_style);
		return button;
	}

	async function main() {
		let pos = document.querySelector("#response_message").parentNode;
		let b = newButton("aet_dl_button", "click close to extract data", { width: "max-content" }, () => { });
		pos.insertAdjacentElement("afterbegin", b);
		b = document.querySelector("#aet_dl_button");
		b.disabled = true;

		//add observer
		let ob = new MutationObserver(() => {
			b.textContent = "waitting data...";
			ob.disconnect();
		});
		
		ob.observe(document.querySelector("#player_3x2_container"), { attributes: true });

		await cap_segments().then(data => {
			debug_data(data);
			let title = video_title;
			let seg_data = data.decrypted.map(x => x.uri);
			let duration_data = data.info;
			let max_duration = arr => Math.ceil(Math.max(...arr));
			let m3u_inf = time => `#EXTINF:${time}`;
			let file;
			if (discard_first_seg) {
				seg_data.shift();
				duration_data.shift();
			}
			b.disabled = false;
			if (url_only) {
				file = seg_data.join("\n");
				b.textContent = "download url text";
				b.onclick = () => download(`${title}.txt`, file);
			} else {
				file = [
					"#EXTM3U",
					`#EXT-X-TARGETDURATION:${max_duration(duration_data)}`,
					"#EXT-X-ALLOW-CACHE:YES",
					"#EXT-X-PLAYLIST-TYPE:VOD",
					"#EXT-X-VERSION:3",
					"#EXT-X-MEDIA-SEQUENCE:1",
				];
				for (let index = 0, length = seg_data.length; index < length; index++) {
					file.push(m3u_inf(duration_data[index]));
					file.push(seg_data[index]);
				}
				file.push("#EXT-X-ENDLIST");
				file = file.join("\n");
				b.textContent = "download m3u8";
				b.onclick = () => download(`${title}.m3u8`, file);
			}
		});

		function cap_segments() {
			return new Promise(resolve => {
				let v = videojs('video-player');
				v.on("loadedmetadata", async () => {
					await new Promise(resolve => {
						b.textContent = "processing...";
						resolve();
					});
					setTimeout(() => {
						debug_msg("metadata loaded");
						let segments = v.tech_.hls.playlists.media_.segments;
						let arr = [];
						let info = [];
						arr = segments.map(x => {
							return {
								uri: x.resolvedUri,
								method: "HEAD",
								timeout: 50,
							};
						});
						arr.forEach((x, index) => {
							x.uri = videojs.Hls.xhr(x, function () { }).uri;
							info.push(segments[index].duration);
						});
						debug_msg(`uri count: ${arr.length}`);
						resolve({ decrypted: arr, info: info });
					});
				});
			});
		}

		function download(filename, data) {
			var blob = new Blob([data], { type: 'text/plain', endings: 'native' });
			if (window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, filename);
			} else {
				var elem = window.document.createElement('a');
				elem.href = window.URL.createObjectURL(blob);
				elem.download = filename;
				document.body.appendChild(elem);
				elem.click();
				document.body.removeChild(elem);
			}
		}
	}
})();
