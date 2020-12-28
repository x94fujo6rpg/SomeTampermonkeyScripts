// ==UserScript==
// @name         fc2 show all products
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/fc2_show_all_products.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/fc2_show_all_products.user.js
// @version      0.1
// @description  show full list of products in 1 page and sort by id / show full title
// @author       x94fujo6
// @match        https://adult.contents.fc2.com/*
// @grant        none
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
    'use strict';
    let msgid = "fc2_script_message";

    window.document.body.onload = () => {
        setReload();
        checkLink();
    };

    function setReload() {
        let menu = document.querySelector("[data-menulist]");
        if (menu) {
            let links = menu.querySelectorAll("a");
            links.forEach(a => {
                if (a.getAttribute("reload")) return;
                a.onclick = (event) => {
                    document.location.href = a.href;
                    event.preventDefault();
                };
                a.setAttribute("reload", true);
            });
        }
    }

    function checkLink() {
        let link = document.location.href;
        //console.log(`link: ${link}`);
        if (link.match(/users\/[^\/]+\/articles\?sort=date&order=desc/)) {
            let regtest = link.match(/page=(\d+)/);
            let page = regtest ? regtest[1] : false;
            if (regtest) page = (page == 1) ? true : false;
            if (!regtest || page) {
                console.log(`script start, link: ${link}`);
                sortList();
            }
        }
    }

    function getAllProduct() {
        let total = document.querySelector(".seller_user_articles_pageHeaderCount").textContent.match(/\((\d*)\)/)[1];
        total = parseInt(total, 10);
        let max_page = Math.ceil(total / 30);
        let user = document.location.href.match(/users\/([^\/]*)\/articles/)[1];
        let url = `https://adult.contents.fc2.com/users/${user}/articles?sort=date&order=desc&deal=&page=`;

        console.log(`max page = ${max_page}, start to retrieve data`);
        updateMessage(`max page = ${max_page}, start to retrieve data`);

        getPage(url, 2);

        function resort(data, page) {
            page++;
            let current = getCurrentProduct();
            if (!current) return;

            data = extractProducts(data);
            current.push(...data);
            current.sort((a, b) => b.id - a.id);

            let pos = document.querySelector("section.seller_user_articlesList");
            [...pos.children].forEach(e => e.remove());

            current.forEach(p => pos.appendChild(p.ele));

            data = null;
            current = null;

            if (page <= max_page) {
                setTimeout(() => { getPage(url, page); }, 500);
            } else {
                console.log("done");
                updateMessage(`done`);
                page = 2;
            }

            function getCurrentProduct() {
                let pos = document.querySelector("section.seller_user_articlesList");
                if (pos) {
                    return [...pos.children].map(ele => {
                        return {
                            id: ele.querySelector("a").href.match(/id=(\d*)/)[1],
                            ele: ele.cloneNode(true),
                        };
                    });
                } else {
                    return false;
                }
            }

            function extractProducts(domtext) {
                let parser = new DOMParser();
                let new_document = parser.parseFromString(domtext, "text/html");
                let pos = new_document.querySelector("section.seller_user_articlesList");
                let products = [...pos.children];
                let list = products.map(div => processDiv(div));
                parser = null; // release memory
                new_document = null;
                return list;
            }
        }

        function getPage(rq_url, page) {
            let rq = new XMLHttpRequest();
            rq.open("GET", `${rq_url}${page}`);
            rq.send(null);
            rq.onreadystatechange = function () {
                if (rq.readyState == 4 && rq.status == 200) {
                    console.log(`processing... please wait [page: ${page}, total: ${max_page}]`);
                    updateMessage(`processing... please wait [page: ${page}, total: ${max_page}]`);
                    resort(rq.responseText, page);
                }
            };
        }
    }

    function updateMessage(text = "") {
        document.getElementById(msgid).textContent = `script: ${text}`;
    }

    function sortList() {
        let pos = document.querySelector("section.seller_user_articlesList");
        if (pos) {
            let products = [...pos.children];
            let list = products.map(div => processDiv(div));

            document.querySelector(".c-pager-101").remove();
            list.sort((a, b) => b.id - a.id);

            products.forEach(e => e.remove());
            list.forEach(data => { pos.appendChild(data.ele); });

            let message = Object.assign(document.createElement("span"), {
                id: msgid,
                textContent: "script start",
                style: `
                    display: inline-block;
                    margin: 0.5rem;
                    color: gold;
                `,
            });
            document.querySelector("div.seller_user_articles_pageHeader").appendChild(message);
            getAllProduct();
        }
    }

    function processDiv(div) {
        let id = div.querySelector("a").href.match(/id=(\d*)/)[1];
        let box = div.querySelector(".c-cntCard-110-f_indetail");
        let title_ele = div.querySelector(".c-cntCard-110-f_itemName");
        let title_span = convertToSpan(title_ele);
        let id_span = Object.assign(document.createElement("span"), {
            textContent: id,
            style: `font-size: 1.5rem;`,
        });
        box.insertAdjacentElement("afterbegin", title_span);
        box.insertAdjacentElement("afterbegin", id_span);
        title_ele.remove();

        div.querySelector("img").setAttribute("loading", "lazy");
        div.querySelector(".items_article_SmapleVideo").remove();

        div.querySelector("span.c-cntCard-110-f_thumb_type").remove();
        div.querySelector("button").remove();
        div.querySelector("section.c-tooltip-107").remove();

        //div.querySelector(".detail-layout").remove();
        div.querySelector(".c-cntCard-110-f_seller").remove();

        let all_link = div.querySelectorAll("a");
        if (all_link) all_link.forEach(a => { a.target = "_blank"; });
        return { id: id, ele: div.cloneNode(true) };

        function convertToSpan(ele) {
            return Object.assign(document.createElement("span"), {
                textContent: ele.textContent,
                className: ele.className,
                style: `
                    overflow: visible;
                    display: inline-block;
                    width: auto;
                `,
            });
        }
    }
})();
