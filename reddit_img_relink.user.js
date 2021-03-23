// ==UserScript==
// @name         re-link image in reddit
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/reddit_img_relink.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/reddit_img_relink.user.js
// @version      0.14
// @description  show images direct link under title
// @author       x94fujo6
// @match        https://www.reddit.com/r/*
// @match        https://www.reddit.com/r/*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.onload = function () {
        window.document.body.onload = setInterval(relink, 1000);
    };

    function relink() {
        let posts = document.querySelectorAll(".scrollerItem");
        if (!posts) return;
        posts.forEach(post => {
            setTimeout(() => {
                if (post.getAttribute("fixed_by_script")) return;
                let load = post.querySelector("[src='https://www.redditstatic.com/desktop2x/img/renderTimingPixel.png']");
                if (load) load.remove();
                let box = post.querySelector(".STit0dLageRsa2yR4te_b");
                if (box) {
                    let link_to_post = box.querySelector(`a[href*="/r/"]`);
                    if (link_to_post) {
                        let pos = link_to_post.parentElement;
                        let copy = link_to_post.innerHTML;
                        link_to_post.remove();
                        pos.innerHTML = copy;
                    }
                    let image = box.querySelector("img");
                    if (image) {
                        image.src = image.src.replace(/https:\/\/preview\.redd\.it\/([^.]+\.[^\?]+)\?.*/, (m, p1) => `https://i.redd.it/${p1}`);
                        if (image.src.match(/external-preview/)) {
                            let source = post.querySelector(".styled-outbound-link");
                            if (source) {
                                image.setAttribute("crossOrigin", "anonymous");
                                image.src = source.href;
                            }
                        }
                        let pos = post.querySelector("._2FCtq-QzlfuN-SwVMUZMM3");
                        if (pos) {
                            let link = document.createElement("a");
                            link.textContent = link.href = image.src;
                            link.target = "_blank";
                            link.setAttribute("crossOrigin", "anonymous");
                            let div = document.createElement("div");
                            div.appendChild(link);
                            pos.appendChild(div);
                        }
                    }
                }
                post.setAttribute("fixed_by_script", "true");
            });
        });
    }
})();
