// ==UserScript==
// @name         ehx direct download
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js
// @version      0.62
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
    let timer_list = [];
    let id_list = {
        mainbox: "exhddl_activate",
        dd: "exhddl_ddbutton",
        puretext: "exhddl_puretext",
        sort_setting: "exhddl_sortsetting",
        jump_to_last: "exhddl_jump_to_last",
    };
    let style_list = {
        top_button: { width: "max-content" },
        gallery_button: { width: "max-content", alignSelf: "center" },
        gallery_marked: { backgroundColor: "black" },
        button_marked: { color: "gray", backgroundColor: "transparent" },
        ex: {opacity: 0.3},
    };
    let status_update_interval = 500;

    window.onload = main();

    function main() {
        domain = `https://${document.domain}`;
        api = `${domain}/api.php`;

        myCss();
        timerMananger();

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

        function myCss() {
            let newcss = document.createElement("style");
            newcss.id = "ehx_direct_download_css";
            document.head.appendChild(newcss);
            newcss.textContent = `
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

        function timerMananger() {
            document.addEventListener("visibilitychange", () => {
                if (timer_list.length > 0) {
                    let pause = (document.visibilityState === "visible") ? false : true;
                    for (let index in timer_list) {
                        let timer = timer_list[index];
                        if (!pause) {
                            timer.id = setInterval(timer.handler, timer.delay);
                            print(`${m}start timer[${timer.note}] id:${timer.id}`);
                        } else {
                            clearInterval(timer.id);
                            print(`${m}stop timer[${timer.note}] id:${timer.id}`);
                        }
                    }
                }
            });
        }

        function setEvent(link) {
            let _link = link.split("/");
            if (_link[3] === "g") {
                let gid = _link[4];
                let archive_download = findEleByText("a", "Archive Download");
                archive_download.addEventListener("click", () => {
                    addToDownloadedList(gid);
                });
                print(`${m}set trigger for updateList on gallery:${gid}`);
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

        function setButton() {
            let pos = document.querySelector(".ido");
            let box = document.createElement("div");
            box.id = id_list.mainbox;
            let nodelist = [
                newButton(id_list.dd, "Enable: Archive Download & Sorting & Show torrents Title", style_list.top_button, enableDirectDownload),
                newLine(),
                newButton(id_list.puretext, "Show Pure Text", style_list.top_button, pureText),
                newLine(),
                newButton(id_list.jump_to_last, "Jump To Nearest Downloaded", style_list.top_button, jumpToLastDownload),
                newLine(),
                newLine(),
            ];
            box = appendAll(box, nodelist);
            pos.insertAdjacentElement("afterbegin", box);
            if (hid) hlexg();
            addInfoToAllGallery();
            setAllLinkToNewTab();
            addTimer(updateGalleryStatus, status_update_interval);

            function enableDirectDownload() {
                let pos = document.getElementById(id_list.mainbox);
                document.getElementById(id_list.dd).remove();
                pos.insertAdjacentElement("afterbegin", newSpan("Processing... Please Wait"));
                acquireGalleryData();

                function acquireGalleryData() {
                    let gallery_nodelist = document.querySelectorAll(".gl1t");
                    let gc = 0;
                    if (gallery_nodelist) {
                        print(`${m}acquire gallery data`);
                        let data = { method: "gdata", gidlist: [], namespace: 1 };
                        let alldata = [];
                        let count = 0;
                        let glist = [];
                        gallery_nodelist.forEach((gallery, index) => {
                            let gid = gallery.getAttribute("gid");
                            let gtoken = gallery.getAttribute("gtoken");
                            if (gid && gtoken) {
                                glist.push([gid, gtoken]);
                                count++;
                                gc++;
                                if (count === 25 || index === gallery_nodelist.length - 1) {
                                    count = 0;
                                    let newdata = Object.assign({}, data);
                                    newdata.gidlist = Object.assign([], glist);
                                    alldata.push(newdata);
                                    glist = [];
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
            }

            function pureText() {
                document.getElementById(id_list.puretext).remove();
                document.getElementById(id_list.mainbox).querySelector("br").remove();
                let gallery_nodelist = document.querySelectorAll(".gl1t");
                gallery_nodelist.forEach(gallery => {
                    let puretext_span = document.createElement("span");
                    puretext_span.textContent = gallery.querySelector("a[href]").textContent;
                    puretext_span.className = "puretext";
                    let pos = gallery.querySelector(".gdd");
                    if (pos) {
                        // found dl button
                        pos.insertAdjacentElement("beforebegin", puretext_span);
                        pos.parentElement.querySelector("br").remove();
                    } else {
                        pos = gallery.querySelector(".gl3t");
                        pos.insertAdjacentElement("afterend", puretext_span);
                    }
                });
            }

            function jumpToLastDownload() {
                let last = document.querySelector("[marked='true']");
                if (last) last.scrollIntoView();
            }

            function hlexg() {
                let w = document.querySelectorAll("s");
                if (w.length > 0) {
                    w.forEach(ele => {
                        Object.assign(ele.parentElement.parentElement.parentElement.parentElement.style, style_list.ex);
                    });
                }
            }
        }
    }

    function directDL(data, index) {
        data = JSON.parse(data);
        print(`${m}process data from request batch:${index}, gallery count:${Object.keys(data.gmetadata).length}`);

        let downloaded_list = GM_getValue(key, defaultValue);
        if (downloaded_list.length != 0) downloaded_list.split(",");

        let gidlist = [];
        let mark_list = [];
        data.gmetadata.forEach(gallery_data => {
            gdata.push(gallery_data);
            let gid = gallery_data.gid;
            let gtoken = gallery_data.token;
            let archiver_key = gallery_data.archiver_key;

            let archivelink = `${domain}/archiver.php?gid=${gid}&token=${gtoken}&or=${archiver_key}`;
            let glink = `${domain}/g/${gid}/${gtoken}/`;
            let gallery = document.querySelector(`.gl1t[gid='${gid}']`);
            if (gallery) {
                let dl_button = document.createElement("button");
                Object.assign(dl_button, {
                    id: `gallery_dl_${gid}`,
                    className: "gdd",
                    textContent: "Archive Download",
                    onclick: function () { downloadButton(this, gid, archivelink, glink); },
                });

                Object.assign(dl_button.style, style_list.gallery_button);

                if (downloaded_list.indexOf(`${gid}`) != -1) {
                    Object.assign(dl_button.style, style_list.button_marked);
                    dl_button.setAttribute("marked", true);
                    mark_list.push(gid);
                }

                let pos = gallery.querySelector(".puretext");
                if (!pos) {
                    // no pure text
                    pos = gallery.querySelector(".gl3t");
                    pos.insertAdjacentElement("afterend", dl_button);
                    pos.insertAdjacentElement("afterend", newLine());
                } else {
                    pos.insertAdjacentElement("afterend", dl_button);
                }

                gidlist.push(dl_button.id);
                pcount++;

                let set_status_button = document.createElement("button");
                Object.assign(set_status_button, {
                    id: `gallery_status_${gid}`,
                    className: "gstatus",
                    textContent: "Mark/Unmark This",
                    onclick: function () { setGalleryStatus(gid); },
                });
                Object.assign(set_status_button.style, style_list.gallery_button);

                dl_button.insertAdjacentElement("afterend", set_status_button);
                dl_button.insertAdjacentElement("afterend", newLine());
            }
        });
        if (mark_list.length > 0) print(`${m}found in list, set as downloaded: ${mark_list}`);

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
        }

        function downloadButton(button, gid, archivelink, glink) {
            Object.assign(button.style, style_list.button_marked);
            button.setAttribute("marked", true);
            visitGallery(glink);
            addToDownloadedList(gid);
            my_popUp(archivelink, 480, 320);
            updateGalleryStatus();
        }

        function setGalleryStatus(gid) {
            gid = `${gid}`; // convert to string
            let downloaded_list = GM_getValue(key, defaultValue);

            if (downloaded_list.length > 0) {
                downloaded_list = downloaded_list.split(",");

                let index = downloaded_list.indexOf(gid);
                if (index != -1) {
                    downloaded_list.splice(index, 1);
                    print(`${m}gallery:[${gid}] in list, remove from list`);
                    resetGalleryStatus(gid);
                } else {
                    downloaded_list.push(gid);
                    print(`${m}gallery:[${gid}] not in list, add to list`);

                    let count = 0;
                    while (downloaded_list.length > 10000) {
                        let r = downloaded_list.shift();
                        print(`${m}reach limit, remove [${r}]`);
                        count++;
                        if (count > 100) return print(`${m}unknow error while removing old data, script stop`);
                    }
                }
            } else {
                downloaded_list = [gid];
            }
            downloaded_list = downloaded_list.join();
            GM_setValue(key, downloaded_list);
            print(`${m}save list. [list_size:${downloaded_list.length}, list_length:${downloaded_list.split(",").length}]`);

            updateGalleryStatus();

            function resetGalleryStatus(gid) {
                let gallery = document.querySelector(`[gid="${gid}"]`);
                gallery.style.removeProperty("background-color");
                gallery.removeAttribute("marked");

                let dl_button = gallery.querySelector(".gdd");
                dl_button.style = "";
                Object.assign(dl_button.style, style_list.gallery_button);
                dl_button.removeAttribute("marked");
            }
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
                data.title_no_event = removePrefix(data.title);
                data.title_no_event_no_group = removeGroup(data.title_no_event);
            });
        }

        function setSortingButton() {
            let pos = document.getElementById(id_list.mainbox);
            let ck = document.createElement("input");
            Object.assign(ck, {
                type: "checkbox",
                id: id_list.sort_setting,
                checked: true,
            });
            let lable = document.createElement("label");
            Object.assign(lable, {
                htmlFor: id_list.sort_setting,
                textContent: "Descending",
            });
            let nodelist = [
                newButton("exhddl_sort_by_title_no_event_no_group", "Sort By Title (ignore Prefix/Group/Circle/Artist)", style_list.top_button, () => { sortGalleryByKey("title_no_event_no_group"); }),
                newSeparate(),
                newButton("exhddl_sort_by_title_no_event", "Sort By Title (ignore Prefix)", style_list.top_button, () => { sortGalleryByKey("title_no_event"); }),
                newSeparate(),
                newButton("exhddl_sort_by_title", "Sort by Title", style_list.top_button, () => { sortGalleryByKey("title"); }),
                newLine(),
                newButton("exhddl_sort_by_artist", "Sort by Artist", style_list.top_button, () => { sortGalleryByKey("artist"); }),
                newSeparate(),
                newButton("exhddl_sort_by_group", "Sort by Group/Circle", style_list.top_button, () => { sortGalleryByKey("group"); }),
                newSeparate(),
                newButton("exhddl_sort_by_date", "Sort by Date (Default)", style_list.top_button, () => { sortGalleryByKey("posted"); }),
                newSeparate(),
                newButton("exhddl_sort_by_category", "Sort by Category", style_list.top_button, () => { sortGalleryByKey("category"); }),
                newSeparate(),
                newButton("exhddl_sort_by_ex", "Sort by ???", style_list.top_button, () => { sortGalleryByKey("expunged"); }),
                newLine(),
                ck, lable,
            ];
            // remove loading message
            pos.querySelector("span").remove();
            pos.querySelector("br").remove();
            appendAll(pos, nodelist);

            function sortGalleryByKey(key = "") {
                if (!key) return;
                let sorted_id = getSortedGalleryID(gdata, key);
                let container = document.querySelector(".itg.gld");
                getAllGalleryNode();
                removeAllGallery();
                sorted_id.forEach(id => container.appendChild(gallery_nodes[id].node));
            }
        }

        function setShowTorrent() {
            let gallery_nodelist = document.querySelectorAll(".gl1t");
            gallery_nodelist.forEach(gallery => {
                let id = gallery.getAttribute("gid");
                let torrent_list = getTorrentList(id);
                if (torrent_list) {
                    let pos = gallery.querySelector(`#gallery_status_${id}`);
                    torrent_list.forEach(torrent => {
                        let span = newSpan(torrent);
                        span.className = "puretext torrent_title";
                        span.style.display = "none";
                        pos.insertAdjacentElement("afterend", span);
                    });
                    let button = newButton(`t_title_${id}`, "Show torrent List", style_list.gallery_button, function () {
                        let torrent_list = this.parentElement.querySelectorAll(".torrent_title");
                        torrent_list.forEach(torrent => {
                            torrent.style.display = (torrent.style.display == "none") ? "" : "none";
                        });
                    });
                    pos.insertAdjacentElement("afterend", button);
                    pos.insertAdjacentElement("afterend", newLine());
                }
            });
        }
    }

    function print(...any) {
        if (debug) console.log(...any);
    }

    function addTimer(handler, delay, note = "") {
        if (note == "") note = handler.name;
        timer_list.push({
            id: setInterval(handler, delay),
            handler: handler,
            delay: delay,
            note: note,
        });
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

    function visitGallery(link) {
        if (link) {
            // send request to server, not sure this count or not. (no effect to link states)
            /*
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
            */
            // trigger :visited
            let current = window.location.href;
            history.pushState({}, "", link); // add link to history. this will change current winodw link.
            print(`${m}add history, link:${window.location.href}`);
            history.pushState({}, "", current); // change it back.
        }
    }

    function addToDownloadedList(gid) {
        gid = `${gid}`; // convert to string
        let downloaded_list = GM_getValue(key, defaultValue);
        if (downloaded_list.length != 0) {
            downloaded_list = downloaded_list.split(",");

            if (downloaded_list.indexOf(gid) != -1) return print(`${m}[${gid}] is already in the list, abort`);

            downloaded_list.push(gid);

            let count = 0;
            while (downloaded_list.length > 10000) {
                let r = downloaded_list.shift();
                print(`${m}reach limit, remove [${r}]`);
                count++;
                if (count > 100) return print(`${m}unknow error while removing old data, script stop`);
            }
        } else {
            print(`${m}no list found, creat new list`);
            downloaded_list = [gid];
        }
        downloaded_list = downloaded_list.join();
        GM_setValue(key, downloaded_list);
        print(`${m}add [${gid}] to list. [list_size:${downloaded_list.length}, list_length:${downloaded_list.split(",").length}]`);
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

    function appendAll(node, nodeList) {
        nodeList.forEach(e => node.appendChild(e));
        return node;
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

    function newButton(button_id, button_text, button_style, button_onclick) {
        let button = document.createElement("button");
        Object.assign(button, {
            id: button_id,
            textContent: button_text,
            onclick: button_onclick,
        });
        Object.assign(button.style, button_style);
        return button;
    }

    function removePrefix(string = "") {
        if (string.indexOf("(") === 0) {
            let cutat = string.indexOf(")");
            if (cutat != -1 && cutat != string.length - 1) string = string.substring(cutat + 1);
        }
        return string.trim();
    }

    function removeGroup(string = "") {
        if (string.indexOf("[") === 0) {
            let cutat = string.indexOf("]");
            if (cutat != -1 && cutat != string.length - 1) string = string.substring(cutat + 1);
        }
        return string.trim();
    }

    function getSortedGalleryID(object_list, sort_key) {
        let newlist = [];
        let descending = document.getElementById(id_list.sort_setting);
        descending = descending.checked ? true : false;
        newlist = object_list.sort((a, b) => {
            if (descending) {
                return a[sort_key] < b[sort_key] ? 1 : -1;
            } else {
                return a[sort_key] > b[sort_key] ? 1 : -1;
            }
        });
        let new_id_list = [];
        if (newlist) newlist.forEach(item => new_id_list.push(item.gid));
        return new_id_list;
    }

    function getAllGalleryNode() {
        gallery_nodes = {};
        let gallery_nodelist = document.querySelectorAll(".gl1t");
        gallery_nodelist.forEach(gallery => {
            /*
            let title = gallery.querySelector(".glname");
            let id = title.parentElement.href.split("/g/")[1].split("/")[0];
            */
            let id = gallery.getAttribute("gid");
            let title = gallery.getAttribute("gtitle");
            let deepcopy = gallery.cloneNode(true);
            copyOnclick(gallery, deepcopy, `#gallery_dl_${id}`);
            copyOnclick(gallery, deepcopy, `#t_title_${id}`);
            copyOnclick(gallery, deepcopy, `#gallery_status_${id}`);
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

    function removeAllGallery() {
        let gallery_nodelist = document.querySelectorAll(".gl1t");
        gallery_nodelist.forEach(gallery => gallery.remove());
    }

    function getTorrentList(gid = "") {
        let list = [];
        let torrents = gdata.find(gallery_data => gallery_data.gid == gid).torrents;
        if (torrents.length == 0) return false;
        torrents.forEach(torrent => list.push(torrent.name));
        return list.reverse();
    }

    function addInfoToAllGallery() {
        let gallery_nodelist = document.querySelectorAll(".gl1t");
        gallery_nodelist.forEach(gallery => {
            let link = gallery.querySelector("a").href;
            let id = link.split("/g/")[1].split("/")[0];
            let token = link.split("/g/")[1].split("/")[1];
            let title = gallery.querySelector(".glname").textContent;

            gallery.setAttribute("gid", id);
            gallery.setAttribute("gtoken", token);
            gallery.setAttribute("gtitle", title);
        });
    }

    function setAllLinkToNewTab() {
        let gallery_nodelist = document.querySelectorAll(".gl1t");
        gallery_nodelist.forEach(gallery => {
            gallery.querySelectorAll("a").forEach(a => {
                if (a.href.includes("/g/")) a.target = "_blank";
            });
        });
    }

    function updateGalleryStatus() {
        let list = GM_getValue(key, defaultValue);

        if (list.length <= 0) return; // no downloaded gallery in list, abort
        list = list.split(",");

        let find_button = document.querySelector(".itg.gld");
        if (!find_button) return print(`${m}gallery list not found`);

        find_button = find_button.querySelectorAll("button");
        if (find_button.length > 0) updateButtonStatus();

        updateGalleryColor();

        function updateGalleryColor() {
            let gallery_nodelist = document.querySelectorAll(".gl1t");
            let marked = [];
            gallery_nodelist.forEach(gallery => {
                let id = gallery.getAttribute("gid");
                if (list.indexOf(id) != -1 && !gallery.getAttribute("marked")) {
                    Object.assign(gallery.style, style_list.gallery_marked);
                    gallery.setAttribute("marked", true);
                    marked.push(id);
                }
            });
            if (marked.length > 0) print(`${m}found in list, mark gallery: ${marked}`);
        }

        function updateButtonStatus() {
            let marked = [];
            gdata.forEach(gallery_data => {
                let gid = gallery_data.gid;
                let dl_button = document.querySelector(`#gallery_dl_${gid}`);
                if (list.indexOf(`${gid}`) != -1 && !dl_button.getAttribute("marked")) {
                    Object.assign(dl_button.style, style_list.button_marked);
                    dl_button.setAttribute("marked", true);
                    marked.push(gid);
                }
            });
            if (marked.length > 0) print(`${m}found in list, mark dl_button: ${marked}`);
        }
    }
})();
