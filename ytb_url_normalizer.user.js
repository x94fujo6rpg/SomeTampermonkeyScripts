// ==UserScript==
// @name         youtube url normalizer
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ytb_url_normalizer.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ytb_url_normalizer.user.js
// @version      0.01
// @description  normalize url in video description / remove miniplayer (still activated when you watch in playlist)
// @author       x94fujo6
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    let location;
    let cid;
    window.onload = function () {
        console.log("script start");
        location = window.location.href;
        main();
        removeMiniplayer();
        setInterval(watcher, 1000);
    };

    function removeMiniplayer() {
        let b = document.querySelectorAll(".ytp-miniplayer-button");
        if (b) b.forEach(e => { e.remove(); console.log(e); });
        b = document.querySelectorAll("script[src*='miniplayer.js']");
        if (b) b.forEach(e => { e.remove(); console.log(e); });
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
        links.forEach(e => {
            let mass = decodeURIComponent(e.href).replace("https://www.youtube.com/redirect?", "");
            if (mass.includes("redir_token")) {
                let token = getToken(mass);
                if (!token) return console.log("token not found. script stop.");
                let url = mass
                    .replace(`&v=${id}`, "")
                    .replace(`v=${id}`, "")
                    .replace(`&redir_token=${token}`, "")
                    .replace(`redir_token=${token}`, "")
                    .replace(`&event=video_description`, "")
                    .replace(`event=video_description`, "")
                    .replace("&q=http", "http")
                    .replace("q=http", "http")
                    ;
                e.href = url;
                console.log(`set urlReplacer on url: ${url}`);
                let interID = setInterval(() => urlReplacer(e, url, 1, interID, c_location), 500);
                count++;
            }
        });
        console.log(`script end. found ${count} url`);
    }

    function urlReplacer(ele, url, code, interID, c_location) {
        if (c_location != window.location.href) {
            console.log(`page change. urlReplacer:${interID} will stop`);
            return clearInterval(interID);
        }
        if (ele.href != url) {
            let type = {
                1: "change",
                2: "mouseover",
                3: "select",
            };
            console.log(`link change detected. type:${type[code]} re-replace:${url}`);
            ele.href = url;
        }
    }

    function getVideoID() {
        let pos = document.querySelector("ytd-watch-flexy");
        if (pos) {
            return pos.getAttribute("video-id");
        } else {
            return false;
        }
    }

    function getToken(url) {
        let index = url.indexOf("&redir_token=");
        if (index === -1) index = url.indexOf("redir_token=");
        if (index === -1) return false;
        let token = url.slice(index);
        token = token
            .replace("&redir_token=", "")
            .replace("redir_token=", "")
            ;
        token = token.split("&")[0];
        return token;
    }
})();