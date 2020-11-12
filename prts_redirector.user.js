// ==UserScript==
// @name         prts redirector
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/prts_redirector.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/prts_redirector.user.js
// @version      0.1
// @description  auto redirect to desktop version 
// @author       x94fujo6
// @match        http://prts.wiki/*
// @exclude      http://prts.wiki/index.php?title=*&mobileaction=toggle_view_desktop
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let link = window.location.href;

    if (!link.includes("prts.wiki/w/")) return;
    if (link.includes("toggle_view_desktop")) return;

    link = link.replace("http://prts.wiki/w/", "").split("/");

    let title = "";
    for (let index in link) {
        if (index == 0) {
            title += link[index];
        } else {
            title += `/${link[index]}`;
        }
    }

    window.location.href = `http://prts.wiki/index.php?title=${title}&mobileaction=toggle_view_desktop`;
})();