// ==UserScript==
// @name         youtube url normalizer
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ytb_url_normalizer.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ytb_url_normalizer.user.js
// @version      0.03
// @description  normalize url in video description / remove miniplayer (still activated when you watch in playlist)
// @author       x94fujo6
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.onload = () => { setInterval(main, 500); };

    function main() {
        let links = document.querySelectorAll("a.yt-formatted-string");
        if (links) normalizer(links);
        removeMiniplayer();

        function normalizer(links) {
            links.forEach(a => {
                if (!a.href.includes("redirect?")) return;
                let url = getLink(a.href);
                if (!url) return;
                a.href = decodeURIComponent(url);
            });

            function getLink(href) {
                let reg = /&q=(.[^\&]*)/;
                let extract = reg.exec(href);
                return extract ? extract[1] : false;
            }
        }

        function removeMiniplayer() {
            let b = document.querySelectorAll(".ytp-miniplayer-button");
            if (b) b.forEach(e => { e.remove(); });
            b = document.querySelectorAll("[src*='miniplayer.js']");
            if (b) b.forEach(e => { e.remove(); });
        }
    }
})();
