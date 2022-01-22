// ==UserScript==
// @name         4chan Base64 Decode Tool
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/4ch_b64_tool.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/4ch_b64_tool.user.js
// @version      0.01
// @description  appears in the thread page. auto recursive decoding if the message is coded multiple times.
// @author       x94fujo6
// @match        https://boards.4chan.org/*/thread/*
// @match        https://boards.4channel.org/*/thread/*
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
	let
		elem = {
			tool: "decode_tool",
			in: "decode_input",
			out: "decode_output",
			decode: "decode_shit",
			copy: "decode_copy",
			open: "decode_open",
			close: "decode_close",
		},
		box = document.createElement("div"),
		class_list = {
			title: "usTitle",
			box: "usBox",
			t: "usTextBox",
			b: "usButton line-2-item",
		},
		getIn = () => document.getElementById(elem.in).value,
		getOut = () => document.getElementById(elem.out).value,
		setIn = (t = "") => document.getElementById(elem.in).value = t,
		setOut = (t = "") => document.getElementById(elem.out).value = t,
		decode_text = () => {
			let text = getIn(),
				count = 0,
				max = 100,
				[err, output] = decoder(text),
				last_output = output,
				err_msg = "decode failed";
			setIn();
			console.log(count, text);
			if (err) {
				setOut(err_msg);
				console.log(err_msg);
			}
			while (!err && output.length && count < max) {
				count++;
				console.log(count, last_output);
				setOut(last_output);
				[err, output] = decoder(last_output);
				if (err) {
					console.log("end loop");
					break;
				} else {
					setIn(last_output);
					last_output = output;
				}
			}

			function decoder(_t = "") {
				let out = false,
					error = false;
				try {
					out = atob(_t);
				} catch (e) {
					error = e;
				} finally {
					return [error, out];
				}
			}
		},
		copy = () => {
			let text = document.getElementById(elem.out);
			text.select();
			text.setSelectionRange(0, 99999);
			document.execCommand("copy");
		},
		open = () => document.getElementById(elem.tool).style.display = "",
		close = () => document.getElementById(elem.tool).style.display = "none";

	box.className = class_list.box;
	box.innerHTML = `
		<div class="${class_list.title}">Base64 Decode Tool</div>
		<div id="${elem.tool}" style="display: none;">
			<button type="button" id="${elem.decode}" class="${class_list.b}">Decode Input</button>
			<button type="button" id="${elem.copy}" class="${class_list.b}">Copy Output</button>
			<textarea id="${elem.in}" class="${class_list.t}" rows="10" cols="70" placeholder="input"></textarea>
			<textarea id="${elem.out}" class="${class_list.t}" rows="10" cols="70" placeholder="output"></textarea>
		</div>
		<button type="button" id="${elem.open}" class="${class_list.b}">Open</button>
		<button type="button" id="${elem.close}" class="${class_list.b}">Close</button>
	`;
	addCss();
	document.body.appendChild(box);
	document.getElementById(elem.decode).onclick = () => decode_text(false);
	document.getElementById(elem.copy).onclick = () => copy();
	document.getElementById(elem.open).onclick = () => open();
	document.getElementById(elem.close).onclick = () => close();

	function addCss() {
		let s = document.createElement("style");
		document.head.appendChild(s);
		s.textContent = `
			.usTitle {
				display: block;
				font-size: large;
				margin: auto;
				width: 20rem;
				padding: 0.5rem;
			}

			.usBox {
				position: fixed;
				bottom: 1rem;
				right: 1rem;
				z-index: 100;
				border: 2px ridge rgba(0, 0, 0, 0.3);
				background-color: rgba(255, 255, 255, 0.75);
				display: block;
				width: max-content;
				height: max-content;
				text-align: center;
			}

			.usTextBox {
				display: flex;
				width: 95%;
				height: 35%;
				margin: 0.2rem auto;
				word-break: break-all;
			}

			.usButton {
				display: inline;
				margin: 0.25rem;
				padding: 0.5rem;
				text-align: center;
				font-size: large;
			}

			.line-2-item {
				max-width: 100%;
				width: calc(90% / 2);
			}
		`;
	}
})();