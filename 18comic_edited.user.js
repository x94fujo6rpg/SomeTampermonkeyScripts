// ==UserScript==
// @name         18comic漫画下载edited
// @namespace    http://github.com/eternalphane/Userscripts/
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/18comic_edited.user.js
// @version      1.0.5.7
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
	let btn = document.querySelector('.menu-bolock i.fa-download').parentElement;
	if (location.search) {
		btn.addEventListener('click', async e => {
			e.preventDefault();
			const page = document.querySelector('div[id*=".jpg"],div[id*=".webp"]');
			save(
				await download(page.querySelector('img').getAttribute('data-original')),
				`${page.id.slice(0, -4)}.webp`
			);
		});
		return;
	}
	GM.addStyle(await GM.getResourceText('css'));

	let overlay = document.createElement('div');
	overlay.id = 'dl-overlay';
	overlay.innerHTML = await GM.getResourceText('html');
	overlay.hidden = true;
	document.body.appendChild(overlay);

	let circle = overlay.querySelectorAll('circle')[1],
		number = overlay.querySelector('span'),
		msg = overlay.querySelector('h2'),
		updateProgress = (percent, text) => {
			circle.style.strokeDasharray = `${percent} 100`;
			number.innerText = Math.round(percent);
			if (text != undefined) msg.innerText = text;
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

		const zip = new JSZip();
		await Promise.all(pages.map(async page => {
			zip.file(
				`${page.id.slice(0, -4)}.webp`,
				await download(page.querySelector('img').getAttribute('data-original'))
			);
			updateProgress(++progress * 100 / total);
		}));
		updateProgress(0, 'Compressing...');

		// TODO: Select output format? (cbz, cbt, pdf)
		save(
			await zip.generateAsync(
				{
					type: 'blob',
					compression: 'DEFLATE',
					compressionOptions: { level: 9 },
					mimeType: 'application/vnd.comicbook+zip'
				}, (meta) => updateProgress(meta.percent)
			),
			`${document.querySelector('.panel-heading .pull-left').textContent.trim()}.cbz`
		);
		document.body.classList.remove('noscroll');
		overlay.hidden = true;
	});

	(() => {
		let class_name = "scramble-page",
			ele = document.querySelector(`.${class_name}`);
		if (ele) {
			[...ele.parentNode.children]
				.forEach(e => {
					if (!(e.classList.contains(class_name))) {
						e.remove();
					}
				});
		}
	})();

	function get_num(aid, img_index) {
		let n = md5(`${aid}${img_index}`).slice(-1).charCodeAt(0);
		if (aid >= 268850 && aid <= 421925) n %= 10;
		if (aid >= 421926) n %= 8;
		return ((n % 10) + 1) * 2;
	}

	function get_img(url) {
		return new Promise((resolve, reject) => {
			GM.xmlHttpRequest(
				{
					url,
					method: 'GET',
					responseType: 'blob',
					onload: resolve,
					onerror: reject
				}
			);
		});
	}

	const download = async url => {
		let img = new Image(),
			img_id = url.match(/\d+\..+$/)[0],
			img_index = img_id.split(".")[0],
			img_data,
			num = get_num(aid, img_index),
			canvas = document.createElement('canvas'),
			canvas_2d = canvas.getContext('2d'),
			img_nwidth = 0,
			img_nheight = 0,
			sWidth = 0;

		img_data = await get_img(url);
		img_data = img_data.response;
		img.src = URL.createObjectURL(img_data);
		await new Promise((resolve, reject) => (img.onload = resolve, img.onerror = reject));
		img_nwidth = img.naturalWidth;
		img_nheight = img.naturalHeight;
		sWidth = img_nwidth;
		canvas.width = img_nwidth;
		canvas.height = img_nheight;

		// `aid`, `scramble_id` and `md5` are both global variables
		if (url.includes('.gif') || aid < scramble_id) {
			canvas_2d.drawImage(img, 0, 0);
		} else {
			let naturalHeight = parseInt(img_nheight % num);
			for (i = 0; i < num; i++) {
				let sHeight = Math.floor(img_nheight / num),
					dy = sHeight * i,
					sy = img_nheight - sHeight * (i + 1) - naturalHeight;
				if (i == 0) {
					sHeight += naturalHeight;
				} else {
					dy += naturalHeight;
				}
				canvas_2d.drawImage(img, 0, sy, sWidth, sHeight, 0, dy, sWidth, sHeight);
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
})();
