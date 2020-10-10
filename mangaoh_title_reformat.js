// ==UserScript==
// @name         mangaoh title reformat
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/mangaoh_title_reformat.js
// @version      0.1
// @description  reformat date & title in search result (click button to copy)
// @author       x94fujo6
// @match        https://www.mangaoh.co.jp/search/?q=*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.onload = main();
    function main() {
        let allcard = document.querySelectorAll(".result-card");
        allcard.forEach(card => {
            let buttonclass = "btn btn-outline-dark";
            let ele = card.querySelector("h2");

            // get author
            let author = card.querySelector("a[href*=作者]").textContent.trim();
            let button_author = document.createElement("button");
            $(button_author).attr({
                class: buttonclass,
                onclick: `navigator.clipboard.writeText("${author}")`,
            });
            button_author.textContent = author;
            ele.append(button_author);

            // get release date
            let date = card.querySelector(".add_filter[href*='発売日']").getAttribute("href").split(":")[1];
            let [y, m, d] = date.split("-");
            y = y.slice(2);
            date = y + m + d;

            // release date button
            let button_date = document.createElement("button");
            $(button_date).attr({
                class: buttonclass,
                onclick: `navigator.clipboard.writeText("${date} ")`,
            });
            button_date.textContent = date;
            ele.append(button_date);
            ele.append(document.createElement("br"));

            // format title
            let button_full = document.createElement("button");
            let title = ele.querySelector(".prd_name").textContent.trim();
            let formatted = `[${author}] ${date} ${title}`;
            let adult = card.querySelector(".badge-adult");
            if (adult) {
                formatted = `(成年コミック) ${formatted}`;
            } else {
                formatted = `(一般コミック) ${formatted}`;
            }
            $(button_full).attr({
                class: buttonclass,
                onclick: `navigator.clipboard.writeText("${formatted}")`,
                name: "bookdata",
                "book_author": author,
                "book_date": date,
                "book_title": title,
            });
            button_full.textContent = formatted;
            ele.append(button_full);
        });
    }
})();