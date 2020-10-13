// ==UserScript==
// @name         re-link image in reddit
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/reddit_img_relink.user.js
// @version      0.11
// @description  show images direct link under title
// @author       x94fujo6
// @match        https://www.reddit.com/r/*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.onload = function () {
        window.document.body.onload = setInterval(relink, 1000);
    };

    function relink() {
        // reddit image
        let images = document.querySelectorAll("[alt='Post image'][src*='/preview.redd.it/']");
        if (images) {
            images.forEach(ele => {
                let link = ele.src.split("?")[0];
                let end = link.lastIndexOf("/") + 1;
                link = `https://i.redd.it/${link.slice(end)}`;
                ele.setAttribute("src", link);
                appendNewLink(ele, link);
                console.log(link);
            });
        }
        // external image
        images = document.querySelectorAll("[src*='external-preview.redd.it']");
        if (images) {
            images.forEach(ele => {
                let link = searchInParent(ele, ".styled-outbound-link");
                if (link.href) {
                    link = link.href;
                } else {
                    return;
                }
                ele.setAttribute("src", link);
                appendNewLink(ele, link);
                console.log(link);
            });
        }
    }

    function appendNewLink(ele, link) {
        let br = document.createElement("br");
        let div = document.createElement("div");
        let a = document.createElement("a");
        let filename = link.slice(link.lastIndexOf("/") + 1);
        a.textContent = a.href = `${link}`;
        a.target = "_blank";
        a.download = filename;
        a.setAttribute("crossOrigin", "anonymous");
        div.appendChild(a);
        let p = ele.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        p.insertAdjacentElement("afterbegin", br);
        p.insertAdjacentElement("afterbegin", div);
    }

    function searchInParent(ele, selector = "") {
        let count = 0;
        while (!ele.querySelector(selector)) {
            ele = ele.parentElement;
            count++;
            if (count > 100) return;
        }
        ele = ele.querySelector(selector);
        return ele;
    }
})();