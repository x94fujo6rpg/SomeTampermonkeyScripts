// ==UserScript==
// @name         anti-bili-anti-copy
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/anti-bili-anti-copy.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/anti-bili-anti-copy.user.js
// @version      0.11
// @description  copy
// @author       x94fujo6
// @match        https://www.bilibili.com/read/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.onload = setTimeout(ck, 1000);
    function main(article) {
        article.forEach(element => element.classList.remove("unable-reprint"));
        setTimeout(ck, 1000);
    }
    function ck() {
        let article = document.getElementsByClassName("unable-reprint");
        if (article.length != 0) main(article);
    }
})();