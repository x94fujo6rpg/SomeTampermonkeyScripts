// ==UserScript==
// @name         pixiv blacklist
// @version      0.03
// @description  hide unwant artist in search
// @author       x94fujo6
// @match        https://www.pixiv.net/*
// @grant        GM_getValue
// @grant        GM_setValue

// ==/UserScript==
/* jshint esversion: 9 */

(async function () {
	let current = window.location.href,
		retry_count = 0,
		delay = 1000;

	console.log("script start");

	window.onload = setTimeout(checkUrl, delay);

	setInterval(() => {
		let url = window.location.href;
		if (url != current) {
			console.log(`re-run script @${url}`);
			window.onload = setTimeout(checkUrl, delay);
			current = url;
		}
	}, 1000);

	function checkUrl() {
		let url = window.location.href;
		if (url.includes("/tags/")) main("tag");
		if (url.includes("/users/")) main("user");
	}

	async function main(mode = "") {
		let
			g = {
				key: {
					blacklist: "blacklist",
				},
				default: {
					blacklist: [],
				},
				get(key) {
					this.is_key(key);
					return GM_getValue(key, this.default[key]);
				},
				set(key, value) {
					this.is_key(key);
					return GM_setValue(key, value);
				},
				is_key(key) {
					if (!this.default[key]) throw Error("unknown key");
				},
			},
			checkBlacklist = (ele) => {
				let user_id = ele.querySelector("a[href*='/users/']");
				if (user_id) {
					user_id = Number(user_id.href.match(/users\/(\d+)/)[1]);
				} else {
					return false;
				}
				if (blacklist.has(user_id)) {
					let nodes = [...ele.childNodes[0].childNodes];
					nodes.pop();
					nodes.forEach(node => {
						node.style.opacity = 0;
						node.style.pointerEvents = "none";
					});
					return true;
				}
				return false;
			},
			result = false,
			blacklist = new Set(g.get(g.key.blacklist));

		console.log("script main");
		result = document.querySelectorAll(".juyBTC");
		console.log("result", result);
		if (mode == "user") {
			console.log("user");
			let b = null,
				ids = {
					remove: "_blacklist_remove",
					add: "_blacklist_add",
				},
				add = document.getElementById(ids.add),
				remove = document.getElementById(ids.remove);
			if (add) {
				add.remove();
				add = null;
			}
			if (remove) {
				remove.remove();
				remove = null;
			}
			b = document.querySelector("button[data-gtm-user-id]");
			if (b) {
				let user_id = Number(b.getAttribute("data-gtm-user-id"));
				if (blacklist.has(user_id)) {
					remove = b.cloneNode();
					remove.id = ids.remove;
					remove.textContent = "blacklist--";
					remove.type = "button";
					remove.style = `
							color: white;
							background-color: limegreen;
						`;
					remove.onclick = () => {
						blacklist.delete(user_id);
						g.set(g.key.blacklist, [...blacklist]);
						console.log(`user[${user_id}] is remove from blacklist`, [...blacklist]);
						document.location.reload();
					};
					b.insertAdjacentElement("afterend", remove);
				} else {
					add = b.cloneNode();
					add.id = ids.add;
					add.textContent = "blacklist++";
					add.type = "button";
					add.style = `
							color: white;
							background-color: black;
						`;
					add.onclick = () => {
						blacklist.add(user_id);
						g.set(g.key.blacklist, [...blacklist]);
						console.log(`user[${user_id}] is add to blacklist`, [...blacklist]);
						document.location.reload();
					};
					b.insertAdjacentElement("afterend", add);
				}
				b.addEventListener("click", () => {
					window.location.reload();
				});
			} else {
				console.log("user button not found");
				return false;
			}
			console.log("script end [user]");
			return true;
		}

		if (mode == "tag") {
			let count = 0;
			console.log("search");

			result.forEach(r => {
				let all = r.querySelectorAll("li");
				all.forEach(ele => {
					if (checkBlacklist(ele)) count++;
				});
			});

			console.log(`script hide ${count} artworks`);
			console.log("script end [search]");
			if (count == 0) {
				console.log(`count = 0, retry(${retry_count})`);
				if (retry_count < 3) {
					retry_count++;
					setTimeout(() => {
						main("tag");
					}, delay);
				} else {
					retry_count = 0;
					console.log(`end retry`);
				}
			}
			return count;
		}
		console.log("script end");
		return false;
	}
})();