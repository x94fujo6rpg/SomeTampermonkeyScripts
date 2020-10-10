// ==UserScript==
// @name         dlsite title reformat(dev)
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @version      0.1
// @description  remove title link / remove excess text / click button to copy
// @author       x94fujo6
// @match        https://www.dlsite.com/maniax/work/=/product_id/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.onload = main();

    function main() {
        let link = document.location.href;
        let title = document.querySelector(`a[href="${link}"]`);
        let titletext = title.textContent;
        title.style.display = "none";
        title = title.parentNode;
        let RJ = link.slice(link.lastIndexOf("/") + 1).replace(".html", "");

        // remove excess text
        while (titletext.indexOf("【") != -1) {
            let start = titletext.indexOf("【");
            let end = titletext.indexOf("】") + 1;
            let removestr = titletext.substring(start, end);
            titletext = titletext.replace(removestr, "");
        }
        titletext = titletext.trim();
        titletext = `${RJ} ${titletext}`;

        // formatted title
        let span = document.createElement("span");
        span.textContent = titletext;
        title.append(span);

        // newline
        title.append(document.createElement("br"));

        // add copy Number button
        let button = document.createElement("button");
        $(button).click(function () {
            navigator.clipboard.writeText(RJ);
        });
        button.textContent = "Copy Number";
        title.append(button);

        // add copy Full title button
        let button2 = document.createElement("button");
        $(button2).click(function () {
            navigator.clipboard.writeText(titletext);
        });
        button2.textContent = "Copy Full Title";
        title.append(button2);

        // add google search link
        link = document.createElement("button");
        $(link).click(function () {
            window.open(`https://www.google.com/search?q=${RJ}+site:ww8.erovoice.us`, "_blank");
        });
        link.textContent = `Search google`;
        title.append(link);

        let link2 = document.createElement("button");
        $(link2).click(function () {
            window.open(`http://ww8.erovoice.us/search/?q=${RJ}`, "_blank");
        });
        link2.textContent = `Search erovoice`;
        title.append(link2);
    }
})();