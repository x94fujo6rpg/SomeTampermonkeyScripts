// ==UserScript==
// @name         18comic漫画下载edited
// @namespace    http://github.com/eternalphane/Userscripts/
// @version      1.0.5.1
// @description  从18comic上下载cbz格式（整话阅读）或webp格式（分页阅读）的漫画
// @author       eternalphane (edit by x94fujo6)
// @license      MIT
// @match        https://18comic.vip/photo/*
// @match        https://18comic.org/photo/*
// @match        https://18comic.bet/photo/*
// @match        https://18comic1.one/photo/*
// @match        https://18comic2.one/photo/*
// @connect      cdn-msp.18comic.vip
// @connect      cdn-msp.18comic.org
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require      https://unpkg.com/jszip@3.5.0/dist/jszip.min.js
// @resource     css https://raw.githubusercontent.com/eternalphane/UserScripts/master/18comic%20Downloader/overlay.css
// @resource     html https://raw.githubusercontent.com/eternalphane/UserScripts/master/18comic%20Downloader/overlay.html
// @grant        GM_getResourceText
// @grant        GM.getResourceText
// @grant        GM_addStyle
// @grant        GM.addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(async () => {
	const btn = document.querySelector('.menu-bolock i.fa-download').parentElement;
	if (location.search) {
		return btn.addEventListener('click', async e => {
			e.preventDefault();
			const page = document.querySelector('div[id*=".jpg"],div[id*=".webp"]');
			save(
				await download(page.querySelector('img').getAttribute('data-original')),
				`${page.id.slice(0, -4)}.webp`
			);
		});
	}
	GM.addStyle(await GM.getResourceText('css'));
	const overlay = document.createElement('div');
	overlay.id = 'dl-overlay';
	overlay.innerHTML = await GM.getResourceText('html');
	overlay.hidden = true;
	document.body.appendChild(overlay);

	const circle = overlay.querySelectorAll('circle')[1];
	const number = overlay.querySelector('span');
	const msg = overlay.querySelector('h2');
	const updateProgress = (percent, text) => {
		circle.style.strokeDasharray = `${percent} 100`;
		number.innerText = Math.round(percent);
		text != undefined && (msg.innerText = text);
	};

	btn.addEventListener('click', async e => {
		e.preventDefault();
		if (!overlay.hidden) {
			return;
		}
		overlay.hidden = false;
		document.body.classList.add('noscroll');
		const pages = [...document.querySelectorAll('div[id*=".jpg"],div[id*=".webp"]')];
		const total = pages.length;
		let progress = 0;
		updateProgress(0, 'Downloading...');
		const zip = new JSZip;
		await Promise.all(pages.map(async page => {
			zip.file(`${page.id.slice(0, -4)}.webp`, await download(
				page.querySelector('img').getAttribute('data-original')
			));
			updateProgress(++progress * 100 / total);
		}));
		updateProgress(0, 'Compressing...');
		// TODO: Select output format? (cbz, cbt, pdf)
		save(
			await zip.generateAsync({
				type: 'blob',
				compression: 'DEFLATE',
				compressionOptions: { level: 9 },
				mimeType: 'application/vnd.comicbook+zip'
			}, (meta) => updateProgress(meta.percent)),
			`${document.querySelector('.panel-heading .pull-left').textContent.trim()}.cbz`
		);
		document.body.classList.remove('noscroll');
		overlay.hidden = true;
	});
})();

/**
 * @param {string} url
 */
const download = async url => {
	const img = new Image;
	img.src = URL.createObjectURL((await new Promise((resolve, reject) => GM.xmlHttpRequest({
		url,
		method: 'GET',
		responseType: 'blob',
		onload: resolve,
		onerror: reject
	}))).response);
	await new Promise((resolve, reject) => (img.onload = resolve, img.onerror = reject));
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const w = canvas.width = img.naturalWidth;
	const h = canvas.height = img.naturalHeight;
	// `aid`, `scramble_id` and `md5` are both global variables
	if (!url.includes('.jpg') || aid < scramble_id) {
		ctx.drawImage(img, 0, 0);
	} else {
		const num = (md5(`${aid}${url.slice(url.lastIndexOf('/') + 1).split('.')[0]}`).slice(-1).charCodeAt(0) % 10 + 1) * 2;
		const rem = h % num;
		const sh = Math.floor(h / num);
		let sy = h - rem - sh, dy = rem;
		ctx.drawImage(img, 0, sy, w, rem + sh, 0, 0, w, rem + sh);
		for (let i = 1; i < num; ++i) {
			ctx.drawImage(img, 0, sy -= sh, w, sh, 0, dy += sh, w, sh);
		}
	}
	URL.revokeObjectURL(img.src);
	// TODO: Select image type? Change quality?
	return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.9));
};

const save = (blob, filename) => {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	URL.revokeObjectURL(a.href);
};
