// ==UserScript==
// @name         prts redirector
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/prts_redirector.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/prts_redirector.user.js
// @version      0.2
// @description  auto redirect to desktop version 
// @author       x94fujo6
// @match        http://prts.wiki/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    let link = window.location.href;
    let reg;
    if (link.includes("toggle_view_desktop")) return replaceAllLink();
    reg = link.includes("toggle_view_mobile") ? /title=(.*)&/ : /\/w\/(.[^\&\#]*)/;
    redirect();

    function redirect() {
        if (!reg) return;
        let extract = reg.exec(link);
        if (extract) window.location.href = `http://prts.wiki/index.php?title=${extract[1]}&mobileaction=toggle_view_desktop`;
    }

    function replaceAllLink() {
        let all = document.querySelectorAll("a");
        all.forEach(a => {
            let alink = a.href;
            if (!alink.includes("prts.wiki")) return;
            reg = alink.includes("title=") ? /title=(.*)&/ : /\/w\/(.[^\&\#]*)/;
            let extract = reg.exec(alink);
            if (extract) a.href = `http://prts.wiki/index.php?title=${extract[1]}&mobileaction=toggle_view_desktop`;
        });
    }
})();