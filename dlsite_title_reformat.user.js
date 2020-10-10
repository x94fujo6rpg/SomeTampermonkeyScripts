// ==UserScript==
// @name         dlsite title reformat
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/dlsite_title_reformat.user.js
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

        // save original title
        let originaltext = titletext;

        // remove excess text 【...】
        while (titletext.indexOf("【") != -1) {
            let start = titletext.indexOf("【");
            let end = titletext.indexOf("】") + 1;
            let removestr = titletext.substring(start, end);
            titletext = titletext.replace(removestr, "");
            titletext = titletext.trim();
        }

        // remove『』if it at start & end
        if (titletext.indexOf("『" === 0 && titletext.indexOf("』") === titletext.length - 1)) {
            titletext = titletext.replace("『", "").replace("』", "");
            titletext = titletext.trim();
        }

        // number + original title
        let original = document.createElement("span");
        original.textContent = `${RJ} ${originaltext}`;
        title.append(original);

        // ------------------------------------------------------
        title.append(newline());

        // formatted title
        let span = document.createElement("span");
        span.textContent = `${RJ} ${titletext}`;
        title.append(span);

        // ------------------------------------------------------
        title.append(newline());

        // add copy Number button
        let button_number = document.createElement("button");
        $(button_number).click(function () {
            navigator.clipboard.writeText(RJ);
        });
        button_number.textContent = "Copy Number";
        title.append(button_number);

        // ------------------------------------------------------
        title.append(newseparate());

        // add copy Original button
        let button_original = document.createElement("button");
        $(button_original).click(function () {
            navigator.clipboard.writeText(originaltext);
        });
        button_original.textContent = "Copy Original";
        title.append(button_original);

        // add copy Number+Original button
        button_original = document.createElement("button");
        $(button_original).click(function () {
            navigator.clipboard.writeText(`${RJ} ${originaltext}`);
        });
        button_original.textContent = "Copy Number+Original";
        title.append(button_original);

        // ------------------------------------------------------
        title.append(newseparate());

        // add copy Formatted button
        let button_formatted = document.createElement("button");
        $(button_formatted).click(function () {
            navigator.clipboard.writeText(titletext);
        });
        button_formatted.textContent = "Copy Formatted";
        title.append(button_formatted);

        // add copy Number+Formatted button
        button_formatted = document.createElement("button");
        $(button_formatted).click(function () {
            navigator.clipboard.writeText(`${RJ} ${titletext}`);
        });
        button_formatted.textContent = "Copy Number+Formatted";
        title.append(button_formatted);
    }

    function newline() {
        return document.createElement("br");
    }

    function newseparate() {
        let ele = document.createElement("span").textContent = " / ";
        return ele;
    }
})();