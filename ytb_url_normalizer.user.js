// ==UserScript==
// @name         youtube url normalizer
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ytb_url_normalizer.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ytb_url_normalizer.user.js
// @version      0.02
// @description  normalize url in video description / remove miniplayer (still activated when you watch in playlist)
// @author       x94fujo6
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    let location;
    let cid;
    window.onload = setTimeout(function () {
        console.log("script start");
        location = window.location.href;
        main();
        removeMiniplayer();
        setInterval(watcher, 1000);
    }, 3000);

    function removeMiniplayer() {
        let b = document.querySelectorAll(".ytp-miniplayer-button");
        if (b) b.forEach(e => { e.remove(); });
        b = document.querySelectorAll("[src*='miniplayer.js']");
        if (b) b.forEach(e => { e.remove(); });
    }

    function watcher() {
        let newlocation = window.location.href;
        if (location != newlocation) {
            console.log(`page changed. rerun script.`);
            location = newlocation;
            setTimeout(() => {
                main();
                removeMiniplayer();
            }, 3000);
        }
    }

    function main() {
        let c_location = window.location.href;
        if (!c_location.includes("/watch?v=")) return;
        let pos = document.getElementById("meta-contents");
        let id = getVideoID();
        if (id && pos) {
            console.log(`start normalizer [id: ${id}]`);
            cid = id;
            normalizer(id, c_location);
        } else {
            console.log("waiting for page load.");
            setTimeout(main, 100);
        }
    }

    function normalizer(id, c_location) {
        let newid = getVideoID();
        if (newid != id) return console.log(`page changed. stop normalizer [id: ${id}]`);

        let links = document.querySelectorAll("a.yt-formatted-string");
        let count = 0;
        links.forEach(a => {
            if (!a.href.includes("redirect?")) return;
            let url = getLink(a.href);
            if (!url) return;
            url = decodeURIComponent(url);
            console.log(`set urlReplacer on url: ${url}`);
            let interID = setInterval(() => urlReplacer(a, url, interID, c_location), 500);
            a.addEventListener("mouseover", () => { urlReplacer(a, url, interID, c_location); });
            count++;
        });
        console.log(`script end. found ${count} url`);
    }

    function getLink(href) {
        let reg = /&q=(.[^\&]*)/;
        let extract = reg.exec(href);
        return extract ? extract[1] : false;
    }

    function urlReplacer(ele, url, interID, c_location) {
        if (c_location != window.location.href) {
            console.log(`page change. urlReplacer:${interID} will stop`);
            return clearInterval(interID);
        }
        if (ele.href != url) {
            //console.log(`link change detected. re-replace:${url}`);
            ele.href = url;
        }
    }

    function getVideoID() {
        let pos = document.querySelector("ytd-watch-flexy");
        return pos ? pos.getAttribute("video-id") : false;
    }
})();
