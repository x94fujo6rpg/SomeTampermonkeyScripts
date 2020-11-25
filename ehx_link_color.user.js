// ==UserScript==
// @name         ehx link color
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_link_color.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_link_color.user.js
// @version      0.27
// @description  change link color
// @author       x94fujo6
// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    // (use any valid CSS color you want)
    // unvisited link color
    let enable_link = true;
    let ex = "DeepPink";
    let eh = "DeepPink";
    // visited link color
    let enable_visited = true;
    let ex_v = "gray";
    let eh_v = "gray";
    // because of the security risk, visited link color many not work in some browser
    // see https://dbaron.org/mozilla/visited-privacy

    let domain;
    window.onload = setlinkcolor();

    function setlinkcolor() {
        domain = getdomain();
        if (domain) setcss();
    }

    function setcss() {
        let link = document.location.href;
        let color = (link.indexOf("exhentai") != -1) ? ex : eh;
        let color_v = (link.indexOf("exhentai") != -1) ? ex_v : eh_v;
        let style = document.createElement("style");
        document.head.appendChild(style);
        let csslist = [];
        if (enable_link) csslist.push(`
            a:link {
                color: ${color};
            }
        `);
        if (enable_visited) csslist.push(`
            a:visited .glink, a:active .glink {
                color:${color_v} !important;
            }
        `);
        myCss(csslist);
    }

    function getdomain() {
        let eh = "e-hentai.org";
        let ex = "exhentai.org";
        let link = document.location.href;
        if (link.indexOf("exhentai") != -1) {
            return ex;
        } else if (link.indexOf("e-hentai") != -1) {
            return eh;
        }
        return false;
    }

    function myCss(innerlist = []) {
        if (innerlist.length > 0) {
            let s = document.createElement("style");
            s.id = "mycss";
            document.head.appendChild(s);
            let content = "";
            innerlist.forEach(inner => content += inner);
            s.innerHTML = content;
        }
    }
})();