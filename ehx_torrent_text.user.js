// ==UserScript==
// @name         ehx torrent text
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_torrent_text.user.js
// @version      0.26
// @description  copy text in torrent page
// @author       x94fujo6
// @match        https://exhentai.org/*
// @match        https://e-hentai.org/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    let autoclose = true;
    let m = "[ehx torrent text]: ";
    window.onload = function () {
        window.document.body.onload = main();
    };

    function main() {
        let link = document.location.href;
        if (link.indexOf("gallerytorrents.php") === -1) return console.log(`${m}not torrent page, abort ${link}`);
        if (link.indexOf("//exhentai") === -1 && link.indexOf("//e-hentai") === -1) return console.log(`${m}incorrect site ${link}`);

        let t = document.querySelectorAll("a[href$='.torrent']");
        if (t) {
            t.forEach(e => {
                let text = e.textContent;
                let tr = creatnewline(text, "Copy Name");
                let pos = e.parentElement.parentElement.parentElement;
                pos.appendChild(tr);

                if (text.indexOf("(") === 0) {
                    let end = text.indexOf(")") + 1;
                    text = text.substring(0, end) + " ";
                    tr = creatnewline(text, "Copy Event");
                    pos.appendChild(tr);
                }
            });
        }
    }

    function creatnewline(text, copy_text) {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        let s = document.createElement("span");
        s.textContent = text;
        td.colSpan = 5;
        td.appendChild(s);
        tr.appendChild(td);
        let e = document.createElement("a");
        e.textContent = copy_text;
        e.style = "width: max-content;";
        e.onclick = function () {
            navigator.clipboard.writeText(text).then(
                function () {
                    console.log("done");
                    if (autoclose) window.close();
                }, function () {
                    console.log("failed");
                });
        };
        td = document.createElement("td");
        td.rowSpan = 1;
        td.style = "width:100px; text-align:center; border-style: outset; height: 1.5rem;";
        td.appendChild(e);
        tr.appendChild(td);
        return tr;
    }
})();