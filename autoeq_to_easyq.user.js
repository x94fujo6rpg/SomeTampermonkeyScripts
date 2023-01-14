// ==UserScript==
// @name         AutoEQ to EasyQ converter
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/autoeq_to_easyq.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/autoeq_to_easyq.user.js
// @version      0.03
// @description  convert & download XML for EasyQ
// @author       x94fujo6
// @match        https://github.com/jaakkopasanen/AutoEq/*
// ==/UserScript==

/**
 * AutoEq
 * https://github.com/jaakkopasanen/AutoEq
 * https://github.com/jaakkopasanen/AutoEq/tree/master/results
 * 
 * EasyQ
 * https://www.kvraudio.com/product/easyq_by_rs_met
 * 
 * Require (for foobar2000)
 * https://wiki.hydrogenaud.io/index.php?title=Foobar2000:Components/VST_2.4_adapter_(foo_vst)
 * 
 * disable other EQ DSP or it may crash foobar
 * 
 * Components > VST plug-ins > load EasyQ dll file
 * DSP > EasyQ > load xml file
 * 
 * 
 * [Quick switch different EQ]
 * after load EQ, close EasyQ
 * type under [DSP chain presets] for preset name and click [save]
 * 
 * View > Layout > Enable layout editing mode
 * [right click] on toolbar > add [DSP switcher]
 * to disable editing mode
 * View > Layout > Enable layout editing mode
 */

(function () {
	let msgid = "autoEQ converter";

	window.onload = main();

	function debug_msg(...any) {
		console.log(`[${msgid}]: `, ...any);
	}

	function debug_data(...any) {
		console.log(...any);
	}

	function main() {
		let data = genXML();
		if (!data) {
			return debug_msg("extract failed");
		} else {
			let pos = data[2].children[0],
				style = { display: "block", margin: "0.2rem", },
				b1 = newButton("", `Download  ${data[0]} (+GlobalGain).xml`, style, () => download(`${data[0]} (+ GlobalGain).xml`, data[1])),
				b2 = newButton("", `Download  ${data[0]}.xml`, style, () => download(`${data[0]}.xml`, data[1].replace(/ GlobalGain="[\d.]+"/g, ""))),
				b3 = newButton("", `Download  ${data[0]} (-GlobalGain).xml`, style, () => download(`${data[0]} (- GlobalGain).xml`, data[1].replace(/ GlobalGain="/g, ` GlobalGain="-`)));
			pos.insertAdjacentElement("afterend", b3);
			pos.insertAdjacentElement("afterend", b2);
			pos.insertAdjacentElement("afterend", b1);
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

	function newButton(id = "", textContent = "", style = {}, onclick = "") {
		let b = Object.assign(document.createElement("button"), { id, textContent, onclick, });
		Object.assign(b.style, style);
		return b;
	}

	function genXML() {
		let xml_head = `<?xml version="1.0" encoding="UTF-8"?>`,
			xml = document.implementation.createDocument(null, "Equalizer"),
			xml_file = [],
			filename = "",
			article = document.querySelector(`div[data-target="readme-toc.content"]>article`),
			preamp = article.innerText.match(/preamp of (.*)dB/);
		if (!extractData()) return false;
		if (preamp) {
			preamp = preamp[1].match(/[\d\.]+/gm).reverse()[0];
		} else {
			preamp = 0;
		}
		xml.documentElement.setAttribute("PatchFormat", 2);
		xml.documentElement.setAttribute("GlobalGain", preamp);
		console.log(xml_file);
		xml_file.forEach(line => {
			let new_band = document.createElementNS(null, "Band"),
				m = mode(line[1]),
				f = parseInt(line[2].replace(" Hz", "")),
				g = parseFloat(line[4].replace(" dB", "")),
				q = parseFloat(line[3]),
				b = calcOct(q);
			console.log({ mode: m, frequency: f, gain: g, q, bandwidth: b });
			new_band.setAttributeNS(null, "Mode", m);
			new_band.setAttributeNS(null, "Frequency", f);
			new_band.setAttributeNS(null, "Gain", g);
			new_band.setAttributeNS(null, "Bandwidth", b);
			xml.documentElement.appendChild(new_band);
		});
		xml_file = xml_head + (new XMLSerializer()).serializeToString(xml);
		console.log(xml_file);
		return [filename, xml_file, article];

		function calcOct(input = 0) {
			let l = 100000000,
				Q1 = ((2 * input * input) + 1) / (2 * input * input),
				Q2 = Math.pow(2 * Q1, 2) / 4,
				Q3 = Math.sqrt(Q2 - 1),
				Q4 = Q1 + Q3;
			return Math.round(l * Math.log(Q4) / Math.log(2)) / l;
		}

		function mode(input = "") {
			let table = {
				"Peaking": "Peak/Dip",
				"LowShelf": "Low Shelving",
				"HighShelf": "High Shelving",
			};
			return table[input];
		}

		function extractData() {
			let data = article.querySelector(`table`),
				o = article.querySelector(`a[href="https://github.com/jaakkopasanen/AutoEq#usage"]`);
			console.log(data);
			if (!data || !o) {
				return false;
			} else {
				filename = article.children[0].textContent;
				o = data.querySelectorAll("tbody>tr");
				o.forEach(tr => {
					let newline = [];
					[...tr.children].forEach(td => newline.push(td.textContent));
					xml_file.push(newline);
				});
				return true;
			}
		}
	}
})();

