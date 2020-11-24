// ==UserScript==
// @name         ehx direct download
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js
// @version      0.51
// @description  direct download archive from list / sort gallery (in current page) / show full title in pure text
// @author       x94fujo6
// @match        https://e-hentai.org/*
// @exclude      https://e-hentai.org/mytags
// @exclude      https://e-hentai.org/mpv/*
// @match        https://exhentai.org/*
// @exclude      https://exhentai.org/mytags
// @exclude      https://exhentai.org/mpv/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

// this script only work in Thumbnail mode
(function () {
    'use strict';
    let api;
    let domain;
    let hid = true;
    let m = "[ehx direct download]: ";
    let key = "exhddl_list";
    let defaultValue = [];
    let debug = true;
    let gallery_nodes;
    let gdata = [];
    let gcount = 0;
    let pcount = 0;
    let id_mainbox = "exhddl_activate";
    let id_dd = "exhddl_ddbutton";
    let id_puretext = "exhddl_puretext";
    let id_sort_setting = "exhddl_sortsetting";

    window.onload = main();

    function myCss() {
        let s = document.createElement("style");
        s.id = "ehx_direct_download_css";
        document.head.appendChild(s);
        s.textContent = `
            .puretext {
                overflow: hidden;
                min-height: 32px;
                line-height: 16px;
                margin: 6px 4px 0;
                font-size: 10pt;
                text-align: center;
            }
        `;
    }

    function main() {
        api = setApi();
        domain = `https://${document.domain}`;
        if (!domain || !api) return print(`${m}domain or api is missing`);
        myCss()
        let link = document.location.href;
        if (link.includes(".php")) {
            return print(`${m}see php, abort`);
        } else if (link.includes("/g/")) {
            print(`${m}gallery page`);
            return setEvent(link);
        } else {
            print(`${m}normal start`);
            if (!checkDisplayMode) return wrongDisplayMode();
            return setButton();
        }
    }

    function checkDisplayMode() {
        let setting = document.getElementById("dms");
        if (!setting) return false;
        setting = setting.querySelector("option[value='t']");
        return setting.selected;
    }

    function wrongDisplayMode() {
        let pos = document.querySelector(".ido");
        pos.insertAdjacentElement("afterbegin", newSpan("Display mode is not Thumbnail. Script stop"));
    }

    function newSpan(text = "") {
        let span = document.createElement("span");
        Object.assign(span, {
            textContent: text,
        });
        return span;
    }

    function newLine() {
        return document.createElement("br");
    }

    function newSeparate() {
        return newSpan(" / ");
    }

    function setEvent(link) {
        let la = link.split("/");
        if (la[3] === "g") {
            let gid = la[4];
            let e = findEleByText("a", "Archive Download");
            e.addEventListener("click", () => {
                updateList(gid);
            });
            print(`${m}set trigger for updateList on gallery:${gid}`);
        }
    }

    function findEleByText(type, string) {
        let es = document.querySelectorAll(type);
        for (let index in es) {
            if (!isNaN(index)) {
                let e = es[index];
                if (e.textContent.includes(string)) {
                    return e;
                }
            }
        }
    }

    function setButton() {
        let pos = document.querySelector(".ido");
        let bs = "width: max-content";
        let box = document.createElement("div");
        box.id = id_mainbox;
        let nodelist = [
            newButton(id_dd, "Enable: Archive Download & Sorting & Show torrents Title", bs, downloadButton),
            newLine(),
            newButton(id_puretext, "Show Pure Text", bs, pureText),
        ];
        box = appendAll(box, nodelist);
        pos.insertAdjacentElement("afterbegin", box);
        if (hid) hlexg();
    }

    function setSortingButton() {
        let pos = document.getElementById(id_mainbox);
        let bs = "width: max-content";
        let ck = document.createElement("input");
        Object.assign(ck, {
            type: "checkbox",
            id: id_sort_setting,
            checked: true,
        });
        let lable = document.createElement("label");
        Object.assign(lable, {
            htmlFor: id_sort_setting,
            textContent: "Descending",
        });
        let nodelist = [
            newLine(),
            newButton("exhddl_sort_by_title", "Sort BY Title", bs, () => { sortGalleryByKey("title"); }),
            newSeparate(),
            newButton("exhddl_sort_by_artist", "Sort BY Artist", bs, () => { sortGalleryByKey("artist"); }),
            newSeparate(),
            newButton("exhddl_sort_by_group", "Sort BY Group/Circle", bs, () => { sortGalleryByKey("group"); }),
            newLine(),
            newButton("exhddl_sort_by_date", "Sort BY Date", bs, () => { sortGalleryByKey("gid"); }),
            newSeparate(),
            newButton("exhddl_sort_by_category", "Sort BY Category", bs, () => { sortGalleryByKey("category"); }),
            newSeparate(),
            newButton("exhddl_sort_by_ex", "Sort BY ???", bs, () => { sortGalleryByKey("expunged"); }),
            newLine(),
            ck, lable,
        ];
        pos.querySelector("span").remove();
        appendAll(pos, nodelist);
    }

    function setShowTorrent() {
        let nodelist = document.querySelectorAll(".gl1t");
        nodelist.forEach(g => {
            let id = g.querySelector("a").href.split("/g/")[1].split("/")[0];
            let torrent_list = getTorrentList(id);
            if (torrent_list) {
                let pos = g.querySelector(`#gallery_dl_${id}`);
                torrent_list.forEach((t, index) => {
                    let span = newSpan(t);
                    span.className = "puretext torrent_title";
                    span.style.display = "none";
                    //if (index != 0) pos.insertAdjacentElement("afterend", newLine());
                    pos.insertAdjacentElement("afterend", span);
                });
                let bs = "width: max-content; align-self: center;";
                let button = newButton(`t_title_${id}`, "Torrent List", bs, function () {
                    let t_list = this.parentElement.querySelectorAll(".torrent_title");
                    t_list.forEach(e => e.style.display = (e.style.display == "none") ? "" : "none");
                });
                pos.insertAdjacentElement("afterend", button);
            }
        });
    }

    function getTorrentList(gid = "") {
        let list = [];
        let torrents = gdata.find(g => g.gid == gid).torrents;
        if (torrents.length == 0) return false;
        torrents.forEach(t => {
            list.push(t.name);
        });
        return list.reverse();
    }

    function appendAll(node, nodeList) {
        nodeList.forEach(e => node.appendChild(e));
        return node;
    }

    function processGdata() {
        let taglist = [
            "artist",
            "group",
        ];
        gdata.forEach(data => {
            taglist.forEach(tag_key => {
                data[tag_key] = data.tags.find(s => s.includes(`${tag_key}:`));
                if (data[tag_key]) {
                    data[tag_key] = data[tag_key].replace(`${tag_key}:`, "");
                } else {
                    data[tag_key] = "";
                }
            });
        });
    }

    function getAllGalleryNode() {
        gallery_nodes = {};
        let nodelist = document.querySelectorAll(".gl1t");
        nodelist.forEach(node => {
            let title = node.querySelector(".glname");
            let id = title.parentElement.href.split("/g/")[1].split("/")[0];
            let deepcopy = node.cloneNode(true);
            copyOnclick(node, deepcopy, `#gallery_dl_${id}`);
            copyOnclick(node, deepcopy, `#t_title_${id}`);
            title = title.textContent;
            gallery_nodes[id] = {
                id: id,
                title: title,
                node: deepcopy,
            };
        });
        
        function copyOnclick(original, copy, css_selector) {
            let o = original.querySelector(css_selector);
            if (o) {
                copy.querySelector(css_selector).onclick = o.onclick;
            }
        }
    }

    function sortGalleryByKey(key = "") {
        if (!key) return;
        let sorted_id = getSortedGalleryID(gdata, key);
        let container = document.querySelector(".itg.gld");
        getAllGalleryNode();
        removeAllGallery();
        sorted_id.forEach(id => container.appendChild(gallery_nodes[id].node));
    }

    function removeAllGallery() {
        let nodelist = document.querySelectorAll(".gl1t");
        nodelist.forEach(e => e.remove());
    }

    function getSortedGalleryID(object_list, sort_key) {
        let newlist = [];
        let descending = document.getElementById(id_sort_setting);
        descending = descending.checked ? true : false;
        newlist = object_list.sort((a, b) => {
            if (descending) {
                return a[sort_key] < b[sort_key] ? 1 : -1;
            } else {
                return a[sort_key] > b[sort_key] ? 1 : -1;
            }
        });
        let id_list = [];
        if (newlist) newlist.forEach(item => id_list.push(item.gid));
        return id_list;
    }

    function newButton(e_id, e_text, e_style, e_onclick) {
        let e = document.createElement("button");
        return Object.assign(e, {
            id: e_id,
            textContent: e_text,
            style: e_style,
            onclick: e_onclick,
        });
    }

    function setApi() {
        let eh = "https://api.e-hentai.org/api.php";
        let ex = "https://exhentai.org/api.php";
        let link = document.location.href;
        if (link.indexOf("//exhentai") != -1) {
            print(`${m}set api as ${ex}`);
            return ex;
        } else if (link.indexOf("//e-hentai") != -1) {
            print(`${m}set api as ${eh}`);
            return eh;
        }
        return false;
    }

    function hlexg() {
        let w = document.querySelectorAll("s");
        if (w.length > 0) w.forEach(ele => ele.parentElement.parentElement.parentElement.parentElement.style.backgroundColor = "gold");
    }

    function pureText() {
        document.getElementById(id_puretext).remove();
        let gallery = document.querySelectorAll(".gl1t");
        gallery.forEach(ele => {
            let e = document.createElement("span");
            e.textContent = ele.querySelector("a[href]").textContent;
            e.className = "puretext";
            let pos = ele.querySelector(".gdd");
            if (pos) {
                pos.insertAdjacentElement("beforebegin", e);
            } else {
                pos = ele.querySelector(".gl3t");
                pos.insertAdjacentElement("afterend", e);
            }
        });
    }

    function downloadButton() {
        document.getElementById(id_dd).remove();
        let pos = document.getElementById(id_mainbox);
        pos.insertAdjacentElement("afterbegin", newSpan("Processing... Please Wait"));
        acquireGalleryData();
        setLinkToNewTab();
    }

    function updateGalleryStatus() {
        let list = GM_getValue(key, defaultValue).split(",");
        gdata.forEach(g => {
            let dl_button = document.querySelector(`#gallery_dl_${g.gid}`);
            if (list.indexOf(`${g.gid}`) != -1) {
                dl_button.style.color = "gray";
                dl_button.style.backgroundColor = "transparent";
            }
        });
    }

    function setLinkToNewTab() {
        let gallery = document.querySelectorAll(".gl1t");
        gallery.forEach(g => {
            g.querySelectorAll("a").forEach(a => {
                if (a.href.includes("/g/")) a.target = "_blank";
            });
        });
    }

    function acquireGalleryData() {
        let gallery = document.querySelectorAll(".gl1t");
        let gc = 0;
        if (gallery) {
            print(`${m}acquire gallery data`);
            let data = { method: "gdata", gidlist: [], namespace: 1 };
            let alldata = [];
            let count = 0;
            let glist = [];
            gallery.forEach((ele, index) => {
                let link = ele.querySelector(`a[href*='${domain}/g/']`).href.split("/");
                if (link[3] === "g") {
                    let gid = link[4];
                    let gtoken = link[5];
                    if (gid && gtoken) {
                        glist.push([gid, gtoken]);
                        count++;
                        gc++;
                        if (count === 25 || index === gallery.length - 1) {
                            count = 0;
                            let newdata = Object.assign({}, data);
                            newdata.gidlist = Object.assign([], glist);
                            alldata.push(newdata);
                            glist = [];
                        }
                    }
                }
            });
            gcount = gc; // save gallery count
            print(`${m}gallery queue length:${alldata.length}, total gallery count:${gc}`);
            if (alldata.length != 0) {
                print(`${m}start sending request`);
                requestData(alldata);
            } else {
                print(`${m}gallery queue is empty`);
            }
        }
    }

    function requestData(datalist) {
        for (let index = 0; index < datalist.length; index++) {
            setTimeout(() => {
                print(`${m}sending request${index + 1}`);
                let data = datalist[index];
                if (data) myApiCall(data, index + 1);
            }, 1000 * index);
        }
    }

    function directDL(data, index) {
        data = JSON.parse(data);
        print(`${m}process data from request batch:${index}, gallery count:${Object.keys(data.gmetadata).length}`);

        let list = GM_getValue(key, defaultValue);
        if (list.length != 0) list.split(",");

        let gidlist = [];
        data.gmetadata.forEach(g => {
            gdata.push(g);
            let archivelink = `${domain}/archiver.php?gid=${g.gid}&token=${g.token}&or=${g.archiver_key}`;
            let glink = `${domain}/g/${g.gid}/${g.token}/`;
            let gallery = document.querySelector(`a[href="${glink}`);
            if (gallery) {
                let dlbutton = document.createElement("button");
                Object.assign(dlbutton, {
                    id: `gallery_dl_${g.gid}`,
                    className: "gdd",
                    style: "width: max-content; align-self: center;",
                    textContent: "Archive Download",
                });
                dlbutton.onclick = function () {
                    let s = document.getElementById(dlbutton.id).style;
                    s.color = "gray";
                    s.backgroundColor = "transparent";
                    visitGallery(glink);
                    updateList(g.gid);
                    return my_popUp(archivelink, 480, 320);
                };
                if (list.indexOf(`${g.gid}`) != -1) {
                    dlbutton.style.color = "gray";
                    dlbutton.style.backgroundColor = "transparent";
                    print(`${m}gallery [${dlbutton.id}] is in downloaded list, set as downloaded`);
                }
                let pos = gallery.parentElement.querySelector(".puretext");
                if (!pos) pos = gallery.parentElement.querySelector(".gl3t");
                pos.insertAdjacentElement("afterend", dlbutton);
                gidlist.push(dlbutton.id);
                pcount++;
            }
        });
        print(`${m}request batch:${index} done`);
        if (gcount === pcount) {
            print(`${m}all request done`);
            print(`${m}initializing sorting`);
            print(`${m}process data`);
            processGdata();
            print(`${m}setup sorting button`);
            setSortingButton();
            print(`${m}setup show torrent title button`);
            setShowTorrent();
            setInterval(updateGalleryStatus, 3000);
        }
    }

    function my_popUp(URL, w, h) {
        window.open(
            URL,
            `_pu${Math.random().toString().replace(/0\./, "")}`,
            `toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0
            ,width=${w},height=${h},left=${(screen.width - w) / 2},top=${(screen.height - h) / 2}`
        );
        return false;
    }

    function myApiCall(data, index) {
        let request = new XMLHttpRequest();
        request.open("POST", api);
        request.setRequestHeader("Content-Type", "application/json");
        request.withCredentials = true;
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    print(`${m}request${index} complete`);
                    return directDL(request.responseText, index);
                } else {
                    print(`${m}request${index} failed [status: ${request.status}]`);
                    print(request);
                    return;
                }
            }
        };
        request.send(JSON.stringify(data));
    }

    function visitGallery(link) {
        if (link) {
            // send request to server, not sure this count or not. (no effect to link states)
            let r = new XMLHttpRequest();
            r.open("get", link, true);
            r.onreadystatechange = function () {
                if (r.readyState == 4) {
                    if (r.status == 200) {
                        print(`${m}server request success, gallery:${link}`);
                    } else {
                        print(`${m}server request failed, gallery:${link}`);
                        print(r);
                    }
                }
            };
            r.send();
            // trigger :visited
            let current = window.location.href;
            history.pushState({}, "", link); // add link to history. this will change current winodw link.
            print(`${m}add history, link:${window.location.href}`);
            history.pushState({}, "", current); // change it back.
        }
    }

    function updateList(gid) {
        gid = `${gid}`; // convert to string
        let list = GM_getValue(key, defaultValue);
        if (list.length != 0) {
            let count = 0;
            list = list.split(",");

            if (list.indexOf(gid) != -1) return print(`${m}[${gid}] is already in the list, abort`);

            list.push(gid);
            while (list.length > 10000) {
                let r = list.shift();
                print(`${m}reach limit, remove [${r}]`);
                count++;
                if (count > 100) return print(`${m}unknow error while removing old data, script stop`);
            }
        } else {
            print(`${m}no list found, creat new list`);
            list = [gid];
        }
        list = list.join();
        GM_setValue(key, list);
        print(`${m}add [${gid}] to list. [list_size:${list.length}, list_length:${list.split(",").length}]`);
    }

    function print(...any) {
        if (debug) console.log(...any);
    }
})();