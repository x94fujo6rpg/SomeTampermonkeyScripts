// ==UserScript==
// @name         link color
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
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