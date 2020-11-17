// ==UserScript==
// @name         sharer.pw auto click
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/sharer-pw_auto_click.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/sharer-pw_auto_click.user.js
// @version      0.1
// @description  auto click and redirect to download link immediately
// @author       x94fujo6
// @match        https://sharer.pw/file/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    window.onload = function () {
        window.document.body.onload = main();
    };

    function main() {
        let idButton = setInterval(() => { watcherButton(idButton); }, 100);
        let idLink = setInterval(() => { watcherLink(idLink); }, 100);
    }

    function watcherButton(id) {
        let button = document.getElementById("btndl");
        if (!button) return;
        console.log(`stop ${watcherButton.name}(${id})`);
        clearInterval(id);
        button.click();
    }

    function watcherLink(id) {
        let links = getDownloadLink();
        if (!links) return;
        console.log(`stop ${watcherLink.name}(${id})`);
        clearInterval(id);
        if (links.length === 1) {
            window.location.href = links[0];
        } else {
            console.log("multiple links detected!! abort");
            console.log(links);
        }
    }

    function getDownloadLink() {
        let links = [];
        [...document.querySelectorAll("a")]
            .filter(e => e.textContent.includes("click here"))
            .forEach(e => links.push(e.href));
        if (links.length === 0) {
            return false;
        } else {
            return links;
        }
    }
})();