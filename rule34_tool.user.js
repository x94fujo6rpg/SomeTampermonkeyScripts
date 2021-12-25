// ==UserScript==
// @name         rule34 harvest tool
// @version      0.01
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/rule34_tool.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/rule34_tool.user.js
// @description  get direct link of the image in the list / single post view
// @author       x94fujo6
// @match        https://rule34.xxx/index.php?page=post&s=view&id=*
// @match        https://rule34.xxx/index.php?page=post&s=list*
// @grant        none
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
	const
		script_name = "rule34 tool",
		slog = (...any) => console.log(`[${script_name}]`, ...any),
		sleep = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));
	let list_id = "selected_list";
	let box_id = "selected_box";
	window.onload = start_script();

	function start_script() {
		let url = document.location.href;
		if (url.includes("s=view")) {
			single_view();
		}
		if (url.includes("s=list")) {
			list_view();
		}
	}

	async function list_view() {
		let pos = document.querySelector(`#content .content`);
		let all_ele = pos.querySelectorAll(".thumb");
		let reg = /<meta property="og:image" itemprop="image" content="(.*)"/;
		let length = all_ele.length;
		let button;
		if (!length) return;

		myCss();
		addSelectBox(pos);

		button = newButton("myButtonB", "Start Harvest", async function () {
			button.disabled = true;
			button.onclick = "";
			button.textContent = `Harvesting... (0/${length})`;
			document.getElementById(box_id).style.display = "";
			for (let i = 0; i < length; i++) {
				let thumb = all_ele[i];
				let post = thumb.children[0].href;
				let link = await getTrueLink(post);
				addCheckbox(link ? link : "", thumb);
				thumb.classList.add("my_thumb");
				button.textContent = `Harvesting... (${i + 1}/${length})`;
				await sleep();
			}
			button.textContent = "Done";
		});
		pos.insertAdjacentElement("afterbegin", button);

		function addSelectBox(target) {
			let
				select_box = document.createElement("div"),
				textbox_style = `
					width: 100%;
					height: auto;
					display: block;
					margin: auto;
					white-space: nowrap;
				`;
			select_box.id = box_id;
			select_box.style = `
				display: flex;
				text-align: center;
				flex-wrap: wrap;
				width: 50%;
				margin: auto;
				display: none;
			`;
			select_box.innerHTML = `<textarea id="${list_id}" rows="5" cols="70" style="${textbox_style}"></textarea>`;

			let button,
				button_class = "myButton line-4-item",
				button_box = document.createElement("div");
			button_box.style = `width: 100%;`;
			[
				{ text: "Select All", click: secectAll },
				{ text: "Unselect All", click: unsecectAll },
				{ text: "Invert Select", click: invertSecect },
				{ text: "Copy", click: copyAll },
			].forEach(o => {
				button = newButton(button_class, o.text, o.click);
				button_box.appendChild(button);
			});
			select_box.appendChild(button_box);

			target.insertAdjacentElement("afterbegin", select_box);
		}

		function addCheckbox(link, toEle) {
			let div = document.createElement("div");
			let label = document.createElement("label");
			label.className = "myLable";
			if (link.length > 0) {
				label.innerHTML = `
					<input type="checkbox" name="selected_list" value="${link}">
					<div>Add to List</div>
				`;
				label.onclick = updateTextBox;
			} else {
				label.innerHTML = `
					<div>found no link</div>
				`;
			}
			div.className = "lable_box";
			div.appendChild(label);
			toEle.insertAdjacentElement("afterbegin", div);
		}

		async function getTrueLink(post_link) {
			let r = await fetch(post_link);
			let text = await r.text();
			let link = text.match(reg);
			if (link) {
				return link[1];
			} else {
				return false;
			}
		}
	}

	function updateTextBox() {
		let inputs = document.querySelectorAll(`input[name='${list_id}']:checked`);
		let newtext = "";
		if (inputs) {
			inputs.forEach(ck => {
				if (!newtext.includes(ck.value)) newtext += `${ck.value}\n`;
			});
		}
		let box = document.getElementById(list_id);
		box.value = newtext;
	}

	function copyAll() {
		let textbox = document.getElementById(list_id);
		navigator.clipboard.writeText(textbox.value);
	}

	function invertSecect() {
		let inputs = document.querySelectorAll(`input[name='${list_id}']`);
		inputs.forEach(e => {
			if (e.checked) {
				e.checked = false;
			} else {
				e.checked = true;
			}
		});
		updateTextBox();
	}

	function unsecectAll() {
		let inputs = document.querySelectorAll(`input[name='${list_id}']:checked`);
		inputs.forEach(e => {
			e.checked = false;
		});
		updateTextBox();
	}

	function secectAll() {
		let inputs = document.querySelectorAll(`input[name='${list_id}']`);
		inputs.forEach(e => {
			if (!e.checked) e.checked = true;
		});
		updateTextBox();
	}

	function single_view(getlink = false) {
		let link = document.querySelector(`[property="og:image"]`).content;
		if (getlink) {
			return link;
		} else {
			let pos = document.querySelector(`#content .content`);
			let ele = document.createElement("a");
			let copy = document.createElement("button");
			let box = document.createElement("div");
			ele.textContent = ele.href = link;

			box.style = `
				display: flex;
			`;
			copy.style = `
				display: flex;
				padding: 2rem;
				width: max-content;
				margin: 0.2rem;
			`;
			ele.style = `
				display: flex;
				padding: 2rem;
				background-color: rgba(0,0,0,0.25);
				width: max-content;
				margin: 0.2rem;
			`;

			copy.onclick = () => {
				navigator.clipboard.writeText(link);
			};
			copy.textContent = "copy link";

			box.appendChild(copy);
			box.appendChild(ele);
			pos.insertAdjacentElement("afterbegin", box);
		}
	}

	function myCss() {
		let s = document.createElement("style");
		s.className = "myCssSheet";
		document.head.appendChild(s);
		s.textContent = `
		.my_thumb {
			height: max-content !important;
		}

        .added {
            display:initial !important;
        }

        .myButtonB {
            position: relative;
			padding: 1rem;
			width: 50%;
			font-size: 1.5rem;
			margin: 1rem auto;
			display: block;
        }

        .myButton {
            position: relative;
			padding: 0.5rem 0;
			margin: 0.5rem;
			font-size: 1rem;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
        }

        .line-4-item {
            max-width: 100%;
            width: calc(80% / 4);
        }

        .myButton:active, .myButtonB:active {
            background-color: DeepPink;
        }

		.lable_box {
			margin: 0.5rem 0;
		}

        .myLable {
            position: relative;
            width: auto;
            padding: 0.5rem;
            border-style: solid;
            border-width: 0.1rem;
            border-color: gray;
            display: flex;
			justify-content: center;
        }

        .myLable>input {
            position: relative;
            margin: auto;
            margin-left: 0rem;
            margin-right: 0.2rem;
        }

        .myLable>div {
            position: relative;
            margin: 0.1rem;
        }
        `;
	}

	function newButton(bclass, btext, handeler) {
		let button = document.createElement("button");
		Object.assign(button, {
			className: bclass,
			textContent: btext,
			onclick: handeler,
		});
		return button;
	}
})();

