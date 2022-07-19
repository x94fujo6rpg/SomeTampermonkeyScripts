// ==UserScript==
// @name         pixiv blacklist
// @version      0.02
// @description  hide unwant artist in search
// @author       x94fujo6
// @match        https://www.pixiv.net/*
// @grant        GM_getValue
// @grant        GM_setValue

// ==/UserScript==
/* jshint esversion: 9 */

(async function () {
	let current = window.location.href;
	let retry_count = 0;

	console.log("script start");

	window.onload = setTimeout(checkUrl, 1000);

	setInterval(() => {
		let url = window.location.href;
		if (url != current) {
			console.log(`re-run script @${url}`);
			window.onload = setTimeout(checkUrl, 1000);
			current = url;
		}
	}, 1000);

	function checkUrl() {
		let url = window.location.href;
		if (url.includes("/tags/") || url.includes("/users/")) {
			main();
		}
	}

	async function main() {
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
			is_user = document.location.href.includes("/users/"),
			result = false,
			blacklist = new Set(g.get(g.key.blacklist));

		console.log("script main");
		result = document.querySelectorAll(".juyBTC");
		if (!result.length) {
			if (is_user) {
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
		} else {
			let count = 0;
			console.log("search");
			/*
			await (async function () {
				for (let group of result) {
					let artworks = group.querySelectorAll("li");
					for (let art of artworks) {
						if (checkBlacklist(art)) count++;
					}
				}
			})();
			*/

			result.forEach(r => {
				let all = r.querySelectorAll("li");
				all.forEach(ele => {
					if (checkBlacklist(ele)) count++;
				});
			});

			console.log(`script hide ${count} artworks`);
			console.log("script end [search]");
			if (count == 0) {
				if (retry_count < 3) {
					retry_count++;
					setTimeout(() => {
						console.log(`retry ${retry_count}`);
						main();
					}, 1000);
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