// ==UserScript==
// @name         mangaoh title reformat
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/mangaoh_title_reformat.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/mangaoh_title_reformat.user.js
// @version      0.12
// @description  reformat date & title in search result (click button to copy)
// @author       x94fujo6
// @match        https://www.mangaoh.co.jp/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.onload = main;

    function main() {
        fixScrollbar();
        if (window.location.href.match(/www\.mangaoh\.co\.jp\/search\/\?q=.+/)) {
            let allcard = document.querySelectorAll(".result-card");
            if (allcard) allcard.forEach(card => reformat(card));
        }
    }

    // fix broken scrollbar cause by checkout-js error
    function fixScrollbar() {
        document.body.style = `overflow:scroll !important;`;
    }

    function reformat(card) {
        let buttonclass = "btn btn-outline-dark",
            titleEle = card.querySelector("h2"),
            box = document.createElement("div");

        // get author
        let author = card.querySelector("a[href*=作者]");
        if (author) {
            author = author.textContent.trim();
            let button_author = document.createElement("button");
            $(button_author).attr({
                class: buttonclass,
                onclick: `navigator.clipboard.writeText("${author}")`,
            });
            button_author.textContent = author;
            box.append(button_author);
        }

        // get release date
        let date = card.querySelector(".add_filter[href*='発売日']");
        if (date) {
            date = date.getAttribute("href");
            if (date) {
                date = date.split(":")[1];
                if (date) {
                    let [y, m, d] = date.split("-"),
                        button_date = document.createElement("button");
                    y = y.slice(2);
                    date = y + m + d;

                    // release date button
                    $(button_date).attr({
                        class: buttonclass,
                        onclick: `navigator.clipboard.writeText("${date} ")`,
                    });
                    button_date.textContent = date;
                    box.append(button_date);
                }
            }
        }

        // format title
        let title = titleEle.querySelector(".prd_name")
        if (title) {
            title = title.textContent.trim();
            if (title) {
                let button_full = document.createElement("button"),
                    formatted = `[${author}] ${date} ${title}`,
                    adult = card.querySelector(".badge-adult");
                formatted = `${adult ? "(成年コミック)" : "(一般コミック)"} ${formatted}`;
                $(button_full).attr({
                    class: buttonclass,
                    onclick: `navigator.clipboard.writeText("${formatted}")`,
                    name: "bookdata",
                    "book_author": author,
                    "book_date": date,
                    "book_title": title,
                });
                button_full.textContent = formatted;
                box.append(document.createElement("br"));
                box.append(button_full);
            }
        }

        titleEle.insertAdjacentElement("afterend", box);
    }
})();