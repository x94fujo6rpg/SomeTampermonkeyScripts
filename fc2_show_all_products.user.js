// ==UserScript==
// @name         fc2 show all products
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/fc2_show_all_products.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/fc2_show_all_products.user.js
// @version      0.2
// @description  show full list of products in 1 page and sort by id / show full title
// @author       x94fujo6
// @match        https://adult.contents.fc2.com/*
// @grant        none
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
    'use strict';
    let msgid = "fc2_script_message";
    let listener = false;

    window.document.body.onload = () => {
        startScript();
    };

    function dPrint(...any) {
        console.log(`[${msgid}]: `, ...any);
    }

    function startScript() {
        if (document.visibilityState == "visible") {
            if (listener) {
                document.removeEventListener("visibilitychange", startScript);
                //dPrint("remove event listener");
            } else {
                //dPrint("normal start");
            }
            setReload();
            checkLink();
        } else {
            document.addEventListener("visibilitychange", startScript);
            //dPrint("document not visible, set event listener");
            listener = true;
        }
    }

    function setReload() {
        let menu = document.querySelector("[data-menulist]");
        if (!menu) return;
        let links = menu.querySelectorAll("a");
        links.forEach(a => {
            if (a.getAttribute("reload")) return;
            a.onclick = (event) => {
                event.preventDefault();
                document.location.href = a.href;
            };
            a.setAttribute("reload", true);
        });
    }

    function checkLink() {
        let link = document.location.href;
        //dPrint(`link: ${link}`);
        if (link.match(/users\/[^\/]+\/articles\?sort=date&order=desc/)) {
            let regtest = link.match(/page=(\d+)/);
            let page = regtest ? regtest[1] : false;
            if (regtest) page = (page == 1) ? true : false;
            if (!regtest || page) {
                dPrint("listview");
                dPrint(`script start, link: ${link}`);
                sortList();
            }
        } else if (link.match(/article_search.php\?id=\d+/) || link.match(/\/article\/\d+\//)) {
            dPrint("productpage");
            productpage();
        }
    }

    function updateMessage(text = "") {
        document.getElementById(msgid).textContent = text;
        dPrint(text);
    }

    function sortList() {
        let pos = document.querySelector("section.seller_user_articlesList");
        if (!pos) return;

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

        async function getAllProduct() {
            let total = document.querySelector(".seller_user_articles_pageHeaderCount");
            if (!total) return;
            total = total.textContent.match(/\((\d*)\)/)[1];
            total = parseInt(total, 10);

            let max_page = Math.ceil(total / 30);
            if (max_page == 1) {
                updateMessage(`only 1 page, abort`);
            } else {
                let user = document.location.href.match(/users\/([^\/]*)\/articles/)[1];
                let url = `https://adult.contents.fc2.com/users/${user}/articles?sort=date&order=desc&deal=&page=`;
                updateMessage(`max page = ${max_page}, start to retrieve data`);

                for (let page = 2; page <= max_page; page++) {
                    updateMessage(`processing... please wait [page: ${page}, total: ${max_page}]`);
                    await getPage(url, page)
                        .then(async (resolve) => {
                            await resort(resolve, page);
                        })
                        .catch((reject) => {
                            updateMessage(`somthing went wrong...script stopped`);
                            dPrint(reject);
                            return;
                        });
                }
            }
            updateMessage(`done`);

            function getPage(rq_url, page) {
                return new Promise((resolve, reject) => {
                    let rq = new XMLHttpRequest();
                    rq.open("GET", `${rq_url}${page}`);
                    rq.onreadystatechange = function () {
                        if (rq.readyState == 4) {
                            return (rq.status == 200) ? setTimeout(resolve, 500, rq.responseText) : reject(rq.responseText);
                        }
                    };
                    rq.send(null);
                });
            }

            function resort(data) {
                return new Promise((resolve, reject) => {
                    let current = getCurrentProduct();
                    if (!current) return reject(false);

                    data = extractProducts(data);
                    current.push(...data);
                    current.sort((a, b) => b.id - a.id);

                    let pos = document.querySelector("section.seller_user_articlesList");
                    [...pos.children].forEach(e => e.remove());

                    current.forEach(p => pos.appendChild(p.ele));

                    data = null;
                    current = null;
                    return resolve(true);
                });

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
        div.querySelector(".items_article_SmapleVideo").remove(); //heavy element

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

    function productpage() {
        let data = document.querySelector("[type='application/ld+json']").textContent;
        data = JSON.parse(data);
        let id = data.productID;
        let title = data.name;
        let pos = document.querySelector(".items_article_headerInfo h3");
        let e = newButton(`Copy [${id} ${title}]`, `${id} ${title}`);
        pos.insertAdjacentElement("afterend", e);
    }

    function newButton(text, copy) {
        let e = document.createElement("a");
        e.style = "color: deeppink; font-size: 1.5rem;";
        e.textContent = text;
        e.onclick = function () {
            navigator.clipboard.writeText(repalceForbiddenChar(copy));
        };
        return e;
    }

    function repalceForbiddenChar(string = "") {
        let forbidden = `<>:"/|?*\\`;
        let replacer = `＜＞：”／｜？＊＼`;
        for (let index of forbidden) {
            string = string.replaceAll(forbidden[index], replacer[index]);
        }
        return string.trim();
    }
})();
