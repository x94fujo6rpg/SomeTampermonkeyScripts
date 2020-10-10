// ==UserScript==
// @name         ehx link color
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_link_color.user.js
// @version      0.1
// @description  change unvisited link color
// @author       x94fujo6
// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let link = document.location.href;
    let color = (link.indexOf("exhentai")!=-1) ? "DeepPink": "DeepPink"; // ex:eh
    let style = document.createElement("style");
    document.head.appendChild(style);
    style.sheet.insertRule(`a:link {color: ${color};}`);
})();