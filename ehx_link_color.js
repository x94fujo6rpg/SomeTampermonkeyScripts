// ==UserScript==
// @name         ehx_link_color
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_link_color.js
// @version      0.1
// @description  change unvisited link color
// @author       x94fujo6
// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let style = document.createElement("style");
    document.head.appendChild(style);
    style.sheet.insertRule("a:link {color: orange;}");
})();