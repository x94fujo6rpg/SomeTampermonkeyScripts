// ==UserScript==
// @name         PTT Web Image Fix
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ptt_web_image_fix.user.js
// @version      0.11
// @description  修復PTT網頁板自動開圖、嘗試修復被截斷的網址、阻擋黑名單ID的推文/圖片
// @author       x94fujo6
// @include      https://www.ptt.cc/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @run-at       document-start
// ==/UserScript==

/*
0.11
新增阻擋關鍵字功能
自行修改key_word內容 (regex)
F12控制台會顯示整批被阻擋之ID跟推文內容
ID阻擋>圖片阻擋>關鍵字阻擋
*/

(function () {
	let
		blacklist_id = ["s910408", "ig49999", "bowen5566", "sos976431"],
		blacklist_img = ["Dey10PF", "WfOR5a8", "wsG5vrZ", "Q7hvcZw", "7h9s0iC", "g28oNwO", "y9arWAn", "9QnqRM3", "UeImoq1", "snzmE7h", "cJXK0nM", "jWy4BKY", "feMElhb", "CpGkeGb", "txz4iGW", "W2i4y4k", "aVXa6GN", "Mni1ayO"],
		blocked_id = new Set([]),
		blocked_img = new Set([]);
	let key_word = `五樓|覺青|莫斯科|演員|司機|小丑|嘻嘻`;
	key_word = new RegExp(key_word);
	const
		script_name = "fix ptt img", fixed = "fix_by_script",
		rd_text = (text = "") => {
			if (text.length <= 11) return " ██REDACTED██";
			let rp = (len) => "█".repeat(len),
				side = (text.length - 11) / 2;
			side = (side > 1) ? rp(side) : "█";
			return ` ${side}REDACTED${side}`;
		},
		remove_blacklist_target = async () => {
			let user, text, ele,
				ck_id, ck_img,
				push_content = document.querySelectorAll("div.push"),
				reg = /(?<=\/)(\w+)(?:\.\w{3,4})*$/;
			let ck_kw, kw_list = [];
			push_content.forEach(div => {
				user = div.querySelector(".push-userid").textContent.trim();
				ele = div.querySelector(".push-content");
				text = ele.textContent;
				ck_id = blacklist_id.find(id => id == user);
				ck_img = blacklist_img.find(img => text.includes(`/${img}`));
				//ck_kw = key_word.find(key => text.toLowerCase().match(`${key}`));
				ck_kw = text.toLowerCase().match(key_word);

				if (ck_id || ck_img || ck_kw) {
					ele.title = text;
					ele.innerHTML = rd_text(text);
					ele.style = "color: darkred;";
					slog_c(`%cblock by id blacklist %c${user}:%c${ele.title.replace(":", "").trim()}`, "#FF0000;#FFFF00;"); //.replace(/:[\s]*(https|https)*(:\/\/)*/, "")
					if (ck_kw && !ck_id && !ck_img) {
						kw_list.push(
							{
								user,
								text
							}
						);
					}
					if (ck_id && !ck_img) {
						text = text.match(reg);
						if (text) {
							slog_c(`%cblock by id blacklist %c${user}:%c${ele.title.replace(":", "").trim()}%c img [%c${text[1]}%c] not in list`, "#40E0D0;#FFFF00;;#40E0D0;;#40E0D0");
							blocked_img.add(text[1]);
						}
					}
					if (!ck_id && ck_img) {
						slog_c(`%cblock by img blacklist %c${user}:%c${ele.title.replace(":", "").trim()}%c user [%c${user}%c] not in list`, "#FFA500;#FFFF00;;#FFA500;;#FFA500");
						blocked_id.add(user);
					}
				}
			});
			if (kw_list.length > 0) {
				let _list = kw_list.map(data => data.user);
				_list = new Set(_list);
				_list = [..._list];
				slog(`block by key word`);
				slog(`\n` + _list.join("\n"));
				_list = {};
				kw_list.forEach(data => {
					if (!_list[data.user]) {
						_list[data.user] = [];
					}
					_list[data.user].push(data.text);
				});
				Object.keys(_list).forEach(id => {
					_list[id].forEach(t => {
						console.log(`${id}${t}`);
					});
				});
			}
			return true;
		},
		slog = (...any) => console.log(`[${script_name}]`, ...any),
		slog_c = (s = "", c = "") => console.log(`[${script_name}] ${s}`, ...c.split(";").map(_c => `color:${_c};`)),
		wait_tab = () => {
			return new Promise(resolve => {
				if (document.visibilityState === "visible") return resolve();
				slog("tab in background, script paused");
				document.addEventListener("visibilitychange", () => {
					if (document.visibilityState === "visible") { slog("script unpaused"); return resolve(); }
				});
			});
		},
		remove_richcontent = async () => {
			let eles = document.querySelectorAll(".richcontent");
			if (!eles.length) { slog(`no richcontent found`); return false; }
			slog(`remove ${eles.length} richcontent`);
			eles.forEach(e => { if (!e.innerHTML.match(/(youtube.com|youtu.be|-player")/)) e.remove(); });
			return true;
		},
		async_push = async (list, item) => list.push(item),
		extractor = async (e, adv = false) => {
			let url = e.href, extract = false,
				reg_list = [
					/imgur\.com\/gallery\/\w{5,7}/,
					/imgur\.com\/a\/\w{5,7}/,
					/imgur\.com\/\w{5,7}/,
					/pbs\.twimg\.com\/media\/[\w-]+/,
					/(?<=https:\/\/|http:\/\/).*\.\w{3,4}$/,
				],
				twitter_format = /(?<=media[^\.\n]+\.|format=)\w{3,4}/,
				format_check = /\.(jpg|jpeg|png|webp|gif|gifv|mp4|webm)$/;
			if (e.getAttribute(fixed)) return false;
			if (adv) {
				if (e.nextSibling) {
					if (e.nextSibling.nodeType !== 3) return false;
					url += e.nextSibling.textContent.trim();
				}
				if (reg_list.find(reg => e.textContent.match(reg))) return false;
			}
			if (!url) return false; // no link
			reg_list = reg_list.map(reg => url.match(reg));
			extract = reg_list.findIndex(reg => Boolean(reg));
			if (extract == -1) return false; //no reg match
			if ((extract == reg_list.length - 1) && !(url.match(format_check))) return false; //match the last reg but not in format list
			extract = `https://${reg_list[extract][0]}`;
			if (extract.includes("pbs.twimg.com")) extract += `.${url.match(twitter_format)[0]}`;
			return extract;
		},
		extract_in_text = (eles) => extract_url(eles, true),
		extract_url = async (eles, in_text = false) => {
			let list = [], url;
			for (let e of eles) {
				url = await extractor(e, in_text);
				if (!url) continue;
				await async_push(list, { e, url });
			}
			return list;
		},
		get_imgur_image = (url) => {
			return new Promise(reslove => {
				GM_xmlhttpRequest({
					method: "GET", url,
					onload: async (rs) => {
						let full_url = rs.responseText.match(/(https:\/\/i.imgur\.com\/\w+\.\w{3,4})\W[\w#]+">/);
						full_url = full_url ? full_url[1] : false;
						slog(!full_url ? `${url} has no data` : `GET ${url} done`);
						return reslove([full_url, rs.status]);
					},
				});
			});
		},
		create_img_ele = (url, get_img) => {
			let box = Object.assign(document.createElement("div"), { className: "richcontent" }),
				a = Object.assign(document.createElement("a"), {
					href: url,
					target: "_blank",
					style: "text-decoration: none; box-shadow: none; background: none;",
					innerHTML: `<img src="${url}" referrerpolicy="no-referrer" rel="noreferrer noopener nofollow">`, //loading="lazy" 
					referrerPolicy: "no-referrer",
					rel: "noreferrer noopener nofollow",
				});
			if (!get_img) {
				a.style = a.innerHTML = "";
				a.textContent = `${url} (分段修復)`;
			}
			a.setAttribute(fixed, 1);
			box.appendChild(a);
			return box;
		},
		create_rd_ele = (text = "") => {
			return Object.assign(document.createElement("div"), {
				className: "richcontent",
				style: "color: darkred;",
				title: text,
				textContent: rd_text(text),
			});
		},
		fix_image = async (obj, get_img) => {
			let url, status;
			if (obj.url.includes("imgur")) {
				for (let retry = 3; retry >= 0; retry--) {
					if (retry < 3) slog(`retry ${obj.url}, remain ${retry}`);
					[url, status] = await get_imgur_image(obj.url);
					if (status == 200) break;
				}
			} else {
				url = obj.url;
			}
			if (!url) url = "https://i.imgur.com/removed.png";
			url = (blacklist_img.find(img => url.includes(img))) ? create_rd_ele(url) : create_img_ele(url, get_img);
			obj.e.insertAdjacentElement("afterend", url);
			obj.e.target = "_blank";
			obj.e.setAttribute(fixed, 1);
			return;
		},
		process_ele = async (eles, extractor, log, get_img = true) => {
			if (!eles.length) return;
			eles = await extractor(eles);
			if (!eles?.length) return;
			slog(log, eles);
			eles.forEach(e => fix_image(e, get_img));
			return;
		},
		main = async () => {
			let eles = document.querySelectorAll("a[href]");
			await process_ele(eles, extract_url, "try fix");
			await sleep(1000);
			await process_ele(eles, extract_in_text, "try fix spaced", GM_config.get("fix_segment"));
		},
		sleep = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
		start_script = async () => {
			slog("script start");
			await wait_tab();
			await ini_config();
			await load_value();
			await remove_blacklist_target();
			await remove_richcontent();
			await main();
			GM_config.onOpen(); // update ui
		},
		load_value = async () => {
			blacklist_id = GM_config.get("blacklist_id").split("\n");
			blacklist_img = GM_config.get("blacklist_img").split("\n");
			slog("load blacklist, id", blacklist_id.length, "img", blacklist_img.length);
			return true;
		},
		ini_config = async () => {
			GM_registerMenuCommand("設定(alt+Q)", () => GM_config.open());
			document.addEventListener("keydown", (e) => { if (e.altKey && e.key == "q") GM_config.open(); });
			GM_config.init({
				id: "settings", // The id used for this instance of GM_config
				title: "腳本設定",
				fields: {
					// This is the id of the field
					fix_segment: {
						label: "嘗試對分段網址開圖 (小心使用)",
						section: "功能設定",
						type: "checkbox",
						default: true,
					},
					blacklist_id: {
						label: "ID",
						section: ["黑名單", "每行一個ID/圖片檔名"],
						type: "textarea",
						default: blacklist_id.join("\n")
					},
					blocked_id: {
						label: "由於圖片被阻擋，但ID未在名單中",
						type: "textarea",
						default: [...blocked_id].join("\n")
					},
					blacklist_img: {
						label: "圖片名稱",
						type: "textarea",
						default: blacklist_img.join("\n")
					},
					blocked_img: {
						label: "由於ID被阻擋，但圖片未在名單中",
						type: "textarea",
						default: [...blocked_img].join("\n")
					},
				},
				css: `
					#settings_fix_segment_var {
						display: inline-flex;
    					margin: 0.5rem !important;
						border: 0.1rem solid;
    					padding: 0.5rem;
					}

					#settings_blacklist_id_var,#settings_blacklist_img_var,#settings_blocked_id_var,#settings_blocked_img_var {
						width: calc(90% / 4) !important;
						height: 60% !important;
						margin: 1rem !important;
						display: inline-block;
					}

					#settings_blacklist_id_field_label,#settings_blacklist_img_field_label,#settings_blocked_id_field_label,#settings_blocked_img_field_label,#settings_fix_segment_field_label {
						font-size: 1rem !important;
						text-align: center;
    					display: block;
					}

					#settings_field_blacklist_id,#settings_field_blacklist_img,#settings_field_blocked_id,#settings_field_blocked_img {
						width: 100% !important;
						height: 90% !important;
					}
				`,
			});
			const
				blacklist = ["blacklist_id", "blacklist_img",],
				load_list = (list_id = "") => { return GM_config.get(list_id); };
			GM_config.onOpen = () => {
				let ui_id = [
					{ id: "blocked_id", data: blocked_id },
					{ id: "blocked_img", data: blocked_img },
				];
				ui_id.forEach(o => {
					slog("load", o.id, o.data.size);
					GM_config.fields[o.id].value = [...o.data].join("\n");
				});
				blacklist.forEach(id => {
					let list = load_list(id);
					slog("load", id, list.split("\n").length);
					GM_config.fields[id].value = list;
				});
			};
			GM_config.onSave = () => {
				blacklist.forEach(id => {
					let list = load_list(id);
					slog("save", id, list.split("\n").length);
				});
			};
			return true;
		};
	document.body.onload = start_script;
})();

