// ==UserScript==
// @name         ehx direct download
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js
// @version      0.96
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
/*jshint esversion: 9 */

// this script only work in Thumbnail mode
(function () {
    'use strict';
    let api;
    let domain;
    let hid = true;
    let m = "[ehx direct download]: ";
    let debug_message = true;
    let debug_adv = false;
    let gallery_nodes;
    let gdata = [];
    let gcount = 0;
    let pcount = 0;
    let timer_list = [];
    let key_list = {
        dl_list: "exhddl_list",
        exclude_tag: "exhddl_exclude_tag_list",
        exclude_uploader: "exhddl_exclude_uploader_list",
        sort_setting: "exhddl_sortsetting",
        dl_and_copy: "exhddl_dl_and_copy",
        auto_fix_title: "exhddl_auto_fix_title",
        auto_enable_puretext: "exhddl_auto_enable_puretext",
        sort_numeric: "exhddl_sort_numeric",
        sort_ignore_punctuation: "exhddl_sort_ignore_punctuation",
    };
    let default_value = {
        dl_list: [],
        exclude_tag: [],
        exclude_uploader: [],
        sort_setting: true,
        dl_and_copy: true,
        auto_fix_title: true,
        auto_enable_puretext: true,
        sort_numeric: true,
        sort_ignore_punctuation: false,
    };
    let id_list = {
        mainbox: "exhddl_activate",
        dd: "exhddl_ddbutton",
        puretext: "exhddl_puretext",
        sort_setting: "exhddl_sortsetting",
        jump_to_last: "exhddl_jump_to_last",
        dl_and_copy: "exhddl_dl_and_copy",
        auto_fix_title: "exhddl_auto_fix_title",
        auto_enable_puretext: "exhddl_auto_enable_puretext",
        sort_numeric: "exhddl_sort_numeric",
        sort_ignore_punctuation: "exhddl_sort_ignore_punctuation",
    };
    let style_list = {
        top_button: { width: "max-content" },
        gallery_button: { width: "max-content", alignSelf: "center", },
        gallery_marked: { backgroundColor: "black" },
        button_marked: { color: "gray", backgroundColor: "transparent" },
        ex: { backgroundColor: "goldenrod" },
        mainbox: { textAlign: "center", lineHeight: "2rem" },
        separator: { color: "transparent" },
    };
    let status_update_interval = 500;
    let fix_prefix = false;
    let ignore_prefix = [
        "(同人誌)",
        "(成年コミック)",
        "(成年コミック・雑誌)",
        "(一般コミック)",
        "(一般コミック・雑誌)",
        "(エロライトノベル)",
        "(ゲームCG)",
        "(同人ゲームCG)",
        "(18禁ゲームCG)",
        "(同人CG集)",
        "(画集)",
    ];
    let forbidden = `<>:"/|?*\\`;
    let replacer = `＜＞：”／｜？＊＼`;
    let container_list = [
        "()", "[]", "{}", "（）",
        "［］", "｛｝", "【】", "『』", "《》", "〈〉", "「」"
    ];
    let [container_start, container_end] = extracContainer();
    let container_reg = containerRegexGenerator();
    let group_reg = new RegExp(`^${container_reg}`);
    let excess_reg = new RegExp(`\\s*${container_reg}\\s*`);
    let blank_reg = /[\s　]{2,}/g;
    let sim_search_threshold = 0.6;
    let gallery_data_max_size = 512; // kb, 0 = no limit
    let gallery_data_limit = { max_size: 1024 * (gallery_data_max_size), max_length: parseInt((1024 * gallery_data_max_size) / 7, 10), };

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
            let newcss = Object.assign(document.createElement("style"), {
                id: "ehx_direct_download_css",
                innerHTML: `
                    .puretext {
                        overflow: hidden;
                        min-height: 32px;
                        line-height: 16px;
                        margin: 6px 4px 0;
                        font-size: 10pt;
                        text-align: center;
                    }

                    .gallery_box {
                        text-align: center;
                        line-height: 2rem;
                        margin: auto auto 0rem auto;
                        max-height: max-content;
                    }

                    .torrent_title {
                        line-height: 1rem;
                        text-align: center;
                        margin: 0.2rem;
                        border: 0.1rem solid;
                        padding: 0.2rem;
                    }
                `,
            });
            document.head.appendChild(newcss);
            setTitleStyle();
        }

        function setTitleStyle() {
            [...document.styleSheets[0].cssRules].find(s => s.selectorText == ".gl4t").style.removeProperty("max-height");
        }

        function timerMananger() {
            document.addEventListener("visibilitychange", () => {
                if (timer_list.length > 0) {
                    let pause = (document.visibilityState === "visible") ? false : true;
                    for (let index in timer_list) {
                        let timer = timer_list[index];
                        if (!pause) {
                            timer.id = setInterval(timer.handler, timer.delay);
                            //dPrint(`${m}start timer[${timer.note}] id:${timer.id}`);
                        } else {
                            clearInterval(timer.id);
                            //dPrint(`${m}stop timer[${timer.note}] id:${timer.id}`);
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
            let box = Object.assign(document.createElement("div"), { id: id_list.mainbox });
            Object.assign(box.style, style_list.mainbox);
            let nodelist = [
                newButton(id_list.dd, "Enable Archive Download / Sorting / Show torrents Title / Fix Event in Ttile / Exclude Gallery", style_list.top_button, enableDirectDownload),
                newSeparate(),
                newButton(id_list.puretext, "Show Pure Text", style_list.top_button, pureText),
                newSeparate(),
                newButton(id_list.jump_to_last, "Jump To Nearest Downloaded", style_list.top_button, jumpToLastDownload),
                newLine(),
            ];
            box = appendAllChild(box, nodelist);

            document.getElementById("toppane").insertAdjacentElement("afterend", box);
            if (hid) hlexg();
            addInfoToAllGallery();
            setAllLinkToNewTab();
            addTimer(updateGalleryStatus, status_update_interval);

            function enableDirectDownload() {
                group();
                time(`${m}request_data`);
                let dd = document.getElementById(id_list.dd);
                dd.disabled = true;
                dd.removeAttribute("onclick");
                dd.insertAdjacentElement("afterend", newSpan("Processing... Please Wait"));
                acquireGalleryData();
                setBottomStyle();

                function setBottomStyle() {
                    [...document.styleSheets[0].cssRules].find(s => s.selectorText == ".gl5t").style.removeProperty("margin");
                }

                function acquireGalleryData() {
                    let gallery_nodelist = selectAllGallery();
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
                        gcount = gc; // save gallery list count
                        print(`${m}gallery queue length:[${alldata.length}], total gallery count:[${gc}]`);
                        if (alldata.length != 0) {
                            print(`${m}start sending request`);
                            requestData(alldata);
                        } else {
                            print(`${m}gallery queue is empty`);
                        }
                    }
                }

                function requestData(datalist, request_index = 0) {
                    if (request_index >= datalist.length) return;
                    print(`${m}sending request[${request_index + 1}]`);
                    myApiCall(datalist, request_index);
                }

                function myApiCall(datalist, request_index) {
                    let request = new XMLHttpRequest();
                    request.open("POST", api);
                    request.setRequestHeader("Content-Type", "application/json");
                    request.withCredentials = true;
                    request.onreadystatechange = function () {
                        if (request.readyState == 4) {
                            if (request.status == 200) {
                                print(`${m}receive request[${request_index + 1}]`);
                                directDL(request.responseText, request_index + 1);
                                requestData(datalist, request_index + 1);
                            } else {
                                print(`${m}request[${request_index}] failed, status:[${request.status}]`);
                                print(request);
                            }
                        }
                    };
                    request.send(JSON.stringify(datalist[request_index]));
                }
            }

            function pureText() {
                let button = document.getElementById(id_list.puretext);
                button.disabled = true;
                button.removeAttribute("onclick");
                selectAllGallery().forEach(gallery => {
                    let puretext_div = Object.assign(document.createElement("div"), {
                        innerHTML: gallery.querySelector(".glname").innerHTML,
                        className: "puretext",
                    });
                    puretext_div.setAttribute("name", id_list.puretext);
                    let pos = gallery.querySelector(".gl3t");
                    pos.insertAdjacentElement("afterend", puretext_div);
                });
            }

            function jumpToLastDownload() {
                let last = document.querySelector("[marked='true']");
                if (last) last.scrollIntoView();
            }

            function hlexg() {
                selectAllGallery().forEach(gallery => { if (gallery.querySelector("s")) Object.assign(gallery.style, style_list.ex); });
            }
        }
    }

    function directDL(data, index) {
        data = JSON.parse(data);
        print(`${m}process request[${index}] data, gallery count:[${Object.keys(data.gmetadata).length}]`);

        let downloaded_list = GM_getValue(key_list.dl_list, default_value.dl_list);
        downloaded_list = downloaded_list.length > 0 ? downloaded_list.split(",") : [];

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
                let dl_button = Object.assign(document.createElement("button"), {
                    id: `gallery_dl_${gid}`,
                    className: "gdd",
                    textContent: "Archive Download",
                    onclick: function () {
                        let self = this;
                        let ck = document.getElementById(id_list.dl_and_copy).checked;
                        if (ck) {
                            navigator.clipboard.writeText(repalceForbiddenChar(self.parentElement.parentElement.querySelector(".glname").textContent.trim()))
                                .then(() => downloadButton(self, gid, archivelink, glink));
                        } else {
                            downloadButton(self, gid, archivelink, glink);
                        }
                    },
                });

                Object.assign(dl_button.style, style_list.gallery_button);

                if (downloaded_list.indexOf(`${gid}`) != -1) {
                    Object.assign(dl_button.style, style_list.button_marked);
                    dl_button.setAttribute("marked", true);
                    mark_list.push(gid);
                }

                let box = Object.assign(document.createElement("div"), { className: "gallery_box" });
                box.insertAdjacentElement("afterbegin", dl_button);

                let pos = gallery.querySelector(".gl5t");
                pos.insertAdjacentElement("beforebegin", box);

                gidlist.push(dl_button.id);
                pcount++;

                let set_status_button = Object.assign(document.createElement("button"), {
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
        if (mark_list.length > 0) print(`${m}found in list, set as downloaded:\n`, mark_list);

        print(`${m}request[${index}] done`);

        if (gcount === pcount) {
            groupEnd();
            timeEnd(`${m}request_data`);
            print(`${m}all request done`);
            print(`${m}initializing sorting`);
            print(`${m}process data`);
            processGdata();
            print(`${m}setup sorting button`);
            setSortingButton();
            print(`${m}setup copy title button`);
            setCopyTitle();
            print(`${m}setup show torrent title button`);
            setShowTorrent();
            if (GM_getValue(key_list.auto_fix_title, default_value.auto_fix_title)) {
                print(`${m}auto enable fix title`);
                document.getElementById("exhddl_fix_title").click();
            }
            if (GM_getValue(key_list.auto_enable_puretext, default_value.auto_enable_puretext)) {
                print(`${m}auto enable pure text`);
                document.getElementById("exhddl_puretext").click();
            }
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
            let downloaded_list = GM_getValue(key_list.dl_list, default_value.dl_list);
            downloaded_list = downloaded_list.length > 0 ? downloaded_list.split(",") : [];

            if (downloaded_list.length > 0) {
                let index = downloaded_list.indexOf(gid);
                if (index != -1) {
                    downloaded_list.splice(index, 1);
                    print(`${m}gallery:[${gid}] in list, remove from list`);
                    resetGalleryStatus(gid);
                } else {
                    downloaded_list.push(gid);
                    print(`${m}gallery:[${gid}] not in list, add to list`);

                    let count = 0;
                    if (downloaded_list.length > gallery_data_limit.max_size && gallery_data_limit.max_size != 0) {
                        while (downloaded_list.length > gallery_data_limit.max_size) {
                            let r = downloaded_list.shift();
                            print(`${m}reach limit, remove [${r}]`);
                            count++;
                            if (count > 100) return print(`${m}unknow error while removing old data, script stop`);
                        }
                    }
                }
            } else {
                downloaded_list = [gid];
            }
            let list_length = downloaded_list.length;
            downloaded_list = downloaded_list.join();
            GM_setValue(key_list.dl_list, downloaded_list);
            print(`${m}save list. [list_size:${downloaded_list.length}(limit:${gallery_data_limit.max_size}), list_length:${list_length}(possible limit:${gallery_data_limit.max_length})]`);

            updateGalleryStatus();

            function resetGalleryStatus(gid) {
                let gallery = document.querySelector(`[gid="${gid}"]`);
                if (!gallery.querySelector("s")) gallery.style.removeProperty("background-color");
                gallery.removeAttribute("marked");

                let dl_button = gallery.querySelector(".gdd");
                dl_button.style = "";
                Object.assign(dl_button.style, style_list.gallery_button);
                dl_button.removeAttribute("marked");
            }
        }

        function processGdata() {
            let tag_key_list = [
                "artist:",
                "group:",
                "female:",
                "male:",
                "parody:",
                "character:",
                "language:",
            ];
            dGroup();
            gdata.forEach(data => {
                // extract tags
                let copy_tags = Object.assign([], data.tags);
                tag_key_list.forEach(tag_key => {
                    let data_key = tag_key.replace(":", "");
                    data[data_key] = [];
                    copy_tags.forEach(tag => { if (tag.includes(tag_key)) data[data_key].push(tag); });
                    // remove used
                    copy_tags = copy_tags.filter(tag => data[data_key].indexOf(tag) == -1);
                });
                data.misc = copy_tags; // unused list

                data.title_original = data.title;
                data.title_jpn = data.title_jpn.length > 0 ? data.title_jpn : data.title;
                data.title_jpn_original = data.title_jpn;
                [data.title_prefix, data.title_no_event] = extractPrefix(data.title);
                [, data.title_no_event_jpn] = extractPrefix(data.title_jpn);

                // try to found prefix in title_jpn
                let [title_prefix_jpn,] = extractPrefix(data.title_jpn);
                if (title_prefix_jpn) data.title_prefix = title_prefix_jpn;

                let from_torrent = false;
                if (data.title_prefix.length == 0) {
                    // try to found prefix in torrent
                    let torrent_list = getTorrentList(data.gid);
                    if (torrent_list) {
                        for (let index in torrent_list) {
                            let [prefix,] = extractPrefix(torrent_list[index]);
                            if (prefix) {
                                data.title_prefix = prefix;
                                from_torrent = true;
                                break;
                            }
                        }
                    }
                }

                [data.title_group, data.title_no_group] = extractGroup(data.title_no_event);
                [data.title_group_jpn, data.title_no_group_jpn] = extractGroup(data.title_no_event_jpn);
                data.title_pure = removeExcess(data.title_no_group);
                data.title_pure_jpn = removeExcess(data.title_no_group_jpn);
                data.title_pure_for_sim = removeAllPunctuation(data.title_pure).toLowerCase();
                data.title_pure_jpn_for_sim = removeAllPunctuation(data.title_pure_jpn).toLowerCase();

                if (debug_message && debug_adv) {
                    dPrint(`${String(data.gid).padStart(10)}|__________`);
                    let title_list = [
                        "title_original",
                        //"title_no_event",
                        //"title_no_group",
                        "title_pure",
                        "title_prefix",
                        //"title_group",
                        "title_jpn",
                        //"title_no_event_jpn",
                        //"title_no_group_jpn",
                        "title_pure_jpn",
                        //"title_group_jpn"
                        "title_pure_for_sim",
                        "title_pure_jpn_for_sim",
                    ];
                    title_list.forEach(key => {
                        let add = (from_torrent && key == "title_prefix") ? "　found in torrent" : "";
                        dPrint(`${String(data.gid).padStart(10)}|${key.padStart(25)}|${data[key]}%c${add}`, "color:DarkOrange;");
                    });
                }
            });
            dGroupEnd();
        }

        function setSortingButton() {
            let pos = document.getElementById(id_list.mainbox);
            let input_list = [
                newSetting("(Sort) Descending", "sort_setting"), newSeparate(),
                newSetting("(Sort) Numeric", "sort_numeric"), newSeparate(),
                newSetting("(Sort) Ignore Punctuation", "sort_ignore_punctuation"), newSeparate(),
                newSetting("Copy Title When Download", "dl_and_copy"), newSeparate(),
                newSetting("Auto Enable Pure Text", "auto_enable_puretext"), newSeparate(),
                newSetting("Auto Enable Fix Title", "auto_fix_title"), newLine(),
            ].flat();
            input_list.forEach(node => { if (node.tagName == "INPUT") { node.addEventListener("change", updateSetting); } });
            let form = Object.assign(
                document.createElement("form"),
                {
                    id: "exhddl_setting_form_prevent_send_data",
                    onsubmit: (event) => {
                        event.preventDefault();
                        return false;
                    },
                }
            );
            appendAllChild(form, input_list);
            let nodelist = [form];
            //nodelist.forEach(node => { if (node.tagName == "INPUT") { node.addEventListener("change", updateSetting); } });
            nodelist.push([
                newButton("exhddl_sort_by_title_jp", "Title (JP)", style_list.top_button, () => { sortGalleryByKey("title_jpn"); }),
                newSeparate(),
                newButton("exhddl_sort_by_title_en", "Title (EN)", style_list.top_button, () => { sortGalleryByKey("title"); }),
                newSeparate(),
                newButton("exhddl_sort_by_title_pure", "Title (ignore Prefix/Group/End)", style_list.top_button, () => { sortGalleryByKey("title_pure"); }),
                newSeparate(),
                newButton("exhddl_sort_by_title_no_group", "Title (ignore Prefix/Group)", style_list.top_button, () => { sortGalleryByKey("title_no_group"); }),
                newSeparate(),
                newButton("exhddl_sort_by_title_no_event", "Title (ignore Prefix)", style_list.top_button, () => { sortGalleryByKey("title_no_event"); }),
                newSeparate(),

                newButton("exhddl_sort_by_date", "Date (Default)", style_list.top_button, () => { sortGalleryByKey("posted"); }),
                newSeparate(),
                newButton("exhddl_sort_by_prefix", "Event", style_list.top_button, () => { sortGalleryByKey("title_prefix"); }),
                newSeparate(),
                newButton("exhddl_sort_by_artist", "Artist", style_list.top_button, () => { sortGalleryByKey("artist"); }),
                newSeparate(),
                newButton("exhddl_sort_by_group", "Group/Circle", style_list.top_button, () => { sortGalleryByKey("group"); }),
                newSeparate(),
                newButton("exhddl_sort_by_category", "Category", style_list.top_button, () => { sortGalleryByKey("category"); }),
                newSeparate(),
                newButton("exhddl_sort_by_ex", "???", style_list.top_button, () => { sortGalleryByKey("expunged"); }),
                newLine(),

                newButton("exhddl_fix_title", "Fix/Unfix Event in Title (Search in torrents/same title gallery)", style_list.top_button, () => { fixTitlePrefix(); }),
                newSeparate(),
                newButton("exhddl_exclude_buttons", "Show Exclude List", style_list.top_button, () => { setExclude(); }),
            ]);
            nodelist = nodelist.flat();
            pos.querySelector("span").remove(); // remove loading message
            appendAllChild(pos, nodelist);

            function newSetting(lable_text, id_key) {
                return [
                    Object.assign(document.createElement("input"), {
                        type: "checkbox",
                        id: id_list[id_key],
                        checked: GM_getValue(key_list[id_key], default_value[id_key]),
                    }),
                    Object.assign(document.createElement("label"), {
                        htmlFor: id_list[id_key],
                        textContent: lable_text,
                    })
                ];
            }

            function updateSetting() {
                let skip_list = [
                    "dl_list",
                    "exclude_list",
                    "exclude_tag",
                    "exclude_uploader",
                ];
                let updatelist = Object.keys(key_list).filter(key => skip_list.every(skip => key != skip));
                let info = [];
                let style = [];
                updatelist.forEach(key => {
                    let value = document.getElementById(id_list[key]).checked;
                    GM_setValue(key_list[key], value);
                    info.push(`[${key}]:%c${value}`);
                    style.push("", value ? "color:DeepSkyBlue" : "color:DeepPink");
                });
                print(`${m}updateSetting | %c${info.join(" %c| ")}`, ...style);
            }

            function sortGalleryByKey(key = "") {
                if (!key) return;
                getAllGalleryNode();
                sortGdata();
                let sorted_id = getSortedGalleryID(gdata, key);
                let container = document.querySelector(".itg.gld");
                removeAllGallery();
                sorted_id.forEach(id => container.appendChild(gallery_nodes[id].node));
            }
        }

        function setCopyTitle() {
            selectAllGallery().forEach(gallery => {
                let gid = gallery.getAttribute("gid");
                let pos = gallery.querySelector(`#gallery_status_${gid}`);
                let button = newButton(`copy_title_${gid}`, "Copy Title", style_list.gallery_button, function () {
                    navigator.clipboard.writeText(repalceForbiddenChar(document.querySelector(`[gid="${gid}"] .glname`).textContent.trim()));
                });
                pos.insertAdjacentElement("beforebegin", button);
                pos.insertAdjacentElement("beforebegin", newLine());
            });
        }

        function setShowTorrent() {
            selectAllGallery().forEach(gallery => {
                let gid = gallery.getAttribute("gid");
                let torrent_list = getTorrentList(gid);
                let pos = gallery.querySelector(".gallery_box");
                let button = newButton(`t_title_${gid}`, "Show torrent List", style_list.gallery_button, function () {
                    let torrent_list = document.querySelector(`[gid="${gid}"] .torrent_title`);
                    torrent_list.style.display = (torrent_list.style.display == "none") ? "" : "none";
                });
                pos.insertAdjacentElement("beforeend", newLine());
                pos.insertAdjacentElement("beforeend", button);

                if (torrent_list) {
                    let box = Object.assign(document.createElement("div"), { className: "torrent_title", style: "display:none" });
                    torrent_list.forEach(torrent => { box.appendChild(Object.assign(newSpan(torrent), { className: "puretext", })); });
                    pos.insertAdjacentElement("beforebegin", box);
                } else {
                    button.disabled = true;
                    button.removeAttribute("onclick");
                }
            });
        }

        function setExclude() {
            let self = document.getElementById("exhddl_exclude_buttons");
            self.disabled = true;
            self.removeAttribute("onclick");
            selectAllGallery().forEach(gallery => {
                let gid = gallery.getAttribute("gid");
                let data = gdata.find(gallery_data => gallery_data.gid == gid);
                let pos = gallery.querySelector(".gallery_box");
                let tag_list = [
                    `uploader:${data.uploader.trim()}`,
                    data.language,
                    data.artist,
                    data.group,
                    data.female,
                    data.male,
                    data.parody,
                    data.character,
                ].flat();
                let select = newSelect(tag_list);
                Object.assign(select.style, style_list.gallery_button);
                let span = newSpan("Exclude");
                Object.assign(span.style, style_list.gallery_button);
                appendAllChild(pos, [
                    newLine(),
                    span, newLine(),
                    select, newLine(),
                    newButton(`exhddl_exclude_${gid}`, "Add/Remove", style_list.gallery_button, () => { updateExcludeList(gid); }),
                ]);
            });

            function newSelect(data_list) {
                let select = document.createElement("select");
                if (data_list.length == 0) return select;
                data_list.forEach(data => { if (data.length > 0) select.appendChild(newOption(data)); });
                return select;
            }

            function newOption(text) {
                return Object.assign(document.createElement("option"), { textContent: text });
            }

            function updateExcludeList(gid) {
                let gallery = document.querySelector(`[gid="${gid}"]`);
                if (!gallery) return;
                let up = "uploader:";
                let exclude = gallery.querySelector("select").selectedOptions[0].textContent;
                let update_key = exclude.includes(up) ? "exclude_uploader" : "exclude_tag";

                if (exclude.includes(up)) exclude = exclude.replace(up, "");
                updateByKey(update_key, exclude);

                function updateByKey(key, value) {
                    let list = GM_getValue(key_list[key], default_value[key]);
                    list = list.length > 0 ? list.split(",") : [];
                    let index = list.indexOf(value);
                    if (index == -1) {
                        list.push(value);
                        print(`${m}add [${value}] to list [${key}]`);
                    } else {
                        list.splice(index, 1);
                        print(`${m}remove [${value}] from list [${key}]`);
                    }
                    GM_setValue(key_list[key], list.join());
                }
            }
        }
    }

    function extracContainer() {
        let [start, end] = ["", ""];
        container_list.forEach(c => {
            start += c[0];
            end += c[1];
        });
        return [start, end];
    }

    function containerRegexGenerator() {
        let reg = [];
        let esc_reg = /[-\/\\^$*+?.()|[\]{}]/g;
        container_list.forEach(c => {
            let esc = c.replace(esc_reg, "\\$&");
            let end = esc.slice(esc.length / 2);
            let start = esc.replace(end, "");
            reg.push(`${start}[^${esc}]*${end}`);
        });
        return `(${reg.join("|")})`;
    }

    function selectAllGallery() {
        return document.querySelectorAll(".gl1t");
    }

    function print(...any) {
        if (debug_message) console.log(...any);
    }

    function time(tag = "") {
        if (debug_message) return tag ? console.time(tag) : console.time();
    }

    function timeEnd(tag = "") {
        if (debug_message) return tag ? console.timeEnd(tag) : console.timeEnd();
    }

    function group() {
        if (debug_message) return console.groupCollapsed();
    }

    function groupEnd() {
        if (debug_message) return console.groupEnd();
    }

    function dPrint(...any) {
        if (debug_message && debug_adv) console.log(...any);
    }

    function dTime(tag = "") {
        if (debug_message && debug_adv) return tag ? console.time(tag) : console.time();
    }

    function dTimeEnd(tag = "") {
        if (debug_message && debug_adv) return tag ? console.timeEnd(tag) : console.timeEnd();
    }

    function dGroup() {
        if (debug_message && debug_adv) return console.groupCollapsed();
    }

    function dGroupEnd() {
        if (debug_message && debug_adv) return console.groupEnd();
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
        let downloaded_list = GM_getValue(key_list.dl_list, default_value.dl_list);
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
        GM_setValue(key_list.dl_list, downloaded_list);
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

    function appendAllChild(to_node, nodeList) {
        nodeList.forEach(e => to_node.appendChild(e));
        return to_node;
    }

    function newSpan(text = "") {
        return Object.assign(document.createElement("span"), { textContent: text, });
    }

    function newLine() {
        return document.createElement("br");
    }

    function newSeparate() {
        let sep = newSpan("／");
        Object.assign(sep.style, style_list.separator);
        return sep;
    }

    function newButton(button_id, button_text, button_style, button_onclick) {
        let button = Object.assign(document.createElement("button"), {
            id: button_id,
            textContent: button_text,
            onclick: button_onclick,
        });
        Object.assign(button.style, button_style);
        return button;
    }

    function extractPrefix(string = "") {
        let reg = /^\([^\(\)]*\)/;
        let prefix = reg.exec(string);
        if (prefix) {
            prefix = prefix[0];
            if (!ignore_prefix.some(text => prefix == text)) return [prefix, string.replace(prefix, "").trim()];
        }
        return ["", string];
    }

    function extractGroup(string = "") {
        let group = group_reg.exec(string);
        return group ? [group[0], (string.replace(group[0], "")).trim()] : ["", string];
    }

    function removeExcess(text = "") {
        // remove excess text
        let count = 0;
        while (count < 100) {
            count++;
            let extract = excess_reg.exec(text);
            if (extract) {
                if (extract[0] != text) {
                    text = text.replace(extract[0], "");
                    continue;
                }
            }
            break;
        }
        // remove container if it at start or end
        count = 0;
        while (count < 100) {
            count++;
            let index = container_start.indexOf(text[0]);
            if (index == -1) break;
            text = text.slice(1).trim();
            if (container_end[index] == text[text.length - 1]) text = text.slice(0, text.length - 1).trim();
        }

        text = text.replace(blank_reg, " ");
        return text;
    }

    function sortGdata() {
        let newdata = [];
        for (let gid in gallery_nodes) {
            newdata.push(gdata.find(gallery_data => gallery_data.gid == gid));
        }
        gdata = newdata;
    }

    function getSortedGalleryID(object_list, sort_key) {
        let newlist = [];
        let descending = document.getElementById(id_list.sort_setting);
        descending = descending.checked ? true : false;
        newlist = object_list.sort((a, b) => {
            return descending ? naturalSort(b[sort_key], a[sort_key]) : naturalSort(a[sort_key], b[sort_key]);
        });

        let new_id_list = [];
        print(`${m}sort by: ${sort_key}`);
        dGroup();
        if (newlist) {
            newlist.forEach(data => {
                new_id_list.push(data.gid);
                dPrint(`${String(data.gid).padStart(10)} | ${data[sort_key]}`);
            });
        }
        dGroupEnd();

        return new_id_list;

        function naturalSort(a, b) {
            let numeric = document.getElementById(id_list.sort_numeric).checked;
            let ignore_punctuation = document.getElementById(id_list.sort_ignore_punctuation).checked;
            return String(a).localeCompare(String(b), navigator.languages[0] || navigator.language, { numeric: numeric, ignorePunctuation: ignore_punctuation });
        }
    }

    function getAllGalleryNode() {
        gallery_nodes = {};
        selectAllGallery().forEach(gallery => {
            let id = gallery.getAttribute("gid");
            let title = gallery.getAttribute("gtitle");
            let deepcopy = gallery.cloneNode(true);
            copyOnclick(gallery, deepcopy, `#gallery_dl_${id}`);
            copyOnclick(gallery, deepcopy, `#t_title_${id}`);
            copyOnclick(gallery, deepcopy, `#copy_title_${id}`);
            copyOnclick(gallery, deepcopy, `#gallery_status_${id}`);
            copyOnclick(gallery, deepcopy, `#exhddl_exclude_${id}`);
            gallery_nodes[id] = {
                id: id,
                title: title,
                node: deepcopy,
            };
        });

        function copyOnclick(original, copy, css_selector) {
            let o = original.querySelector(css_selector);
            if (o) copy.querySelector(css_selector).onclick = o.onclick;
        }
    }

    function removeAllGallery() {
        selectAllGallery().forEach(gallery => gallery.remove());
    }

    function fixTitlePrefix() {
        time(`${m}fixTitlePrefix`);
        dGroup();
        fix_prefix = fix_prefix ? false : true;
        dPrint(fix_prefix ? "try fix prefix" : "restore original title");
        let arr = selectAllGallery();
        for (let gallery of arr) {
            let id = gallery.getAttribute("gid");
            let tofix = gdata.find(gallery_data => gallery_data.gid == id);
            let title_ele = gallery.querySelector(".glname");
            let prefix = tofix.title_prefix;
            if (fix_prefix) {
                dPrint("");
                dPrint(`[%c${String(id).padStart(10)} ${tofix.title_jpn}%c]`, "color:DarkOrange;", "");
                if (prefix.length > 0) {
                    let checklist = [
                        title_ele.innerHTML,
                        tofix.title,
                        tofix.title_original,
                        tofix.title_jpn,
                    ];
                    ignore_prefix.forEach(ignore => checklist.push(ignore));
                    if (!checklist.some(title => title.includes(prefix))) {
                        tofix.title = `${prefix} ${tofix.title_original}`;
                        tofix.title_jpn = `${prefix} ${tofix.title_jpn}`;
                        title_ele.insertAdjacentElement("afterbegin", Object.assign(newSpan(`${prefix} `), { style: tofix.from_other_gallery ? "color:blueviolet" : "color:green;" }));
                        dPrint(`add prefix "${prefix}" from self`);
                    } else {
                        dPrint(`skip`);
                    }
                } else {
                    // search in same title gallery
                    let same_title = gdata.find(gallery_data => ((gallery_data.title_pure_for_sim == tofix.title_pure_for_sim || gallery_data.title_pure_jpn_for_sim == tofix.title_pure_jpn_for_sim) && (gallery_data.title_prefix.length > 0)));
                    dPrint(`same_title ${same_title ? same_title.title_pure_jpn : "not found"}`);
                    let by_sim = "";
                    if (!same_title) {
                        // try similarity search
                        let search_key = ["title_pure_for_sim", "title_pure_jpn_for_sim",];
                        let search_result = [];
                        let timetag = `sim search`;
                        dTime(timetag);
                        for (let key of search_key) {
                            let best = similaritySearch(tofix, key);
                            if (best) {
                                search_result.push(best);
                                if (best.sim == 1) break;
                            }
                        }
                        dTimeEnd(timetag);
                        if (search_result.length > 0) {
                            search_result = search_result.sort((a, b) => b.sim - a.sim);
                            let sim = search_result[0].sim;
                            dPrint(`best`, Object.keys(search_result[0]).map(key => [key, search_result[0][key]]).flat());
                            search_result = gdata.find(gallery_data => gallery_data.gid == search_result[0].gid);
                            if (search_result) {
                                if (checkNumberInTitle(tofix.title_pure_jpn_for_sim, search_result.title_pure_jpn_for_sim)) {
                                    [same_title, by_sim] = [search_result, ` ${sim}`];
                                } else {
                                    print(`similarity search found [%c${search_result.gid}%c] (${sim}) but failed in final test, abort`, "color:DarkOrange", "");
                                }
                            }
                        } else {
                            dPrint(`sim search result: ${search_result.length}`);
                        }
                    }
                    if (same_title) {
                        let new_prefix = same_title.title_prefix;
                        tofix.title_prefix = new_prefix;
                        tofix.title = `${new_prefix} ${tofix.title_original}`;
                        tofix.title_jpn = `${new_prefix} ${tofix.title_jpn_original}`;
                        title_ele.insertAdjacentElement("afterbegin", Object.assign(newSpan(`${new_prefix} `), { style: "color:blueviolet;" }));
                        tofix.from_other_gallery = same_title.gid;
                        let style = ["color:DarkOrange;", "", "color:OrangeRed;", "", "color:DeepPink;"];
                        print(`[%c${String(id).padStart(10)} ${tofix.title_pure_jpn}%c] add prefix "${new_prefix}" from\n[%c${String(same_title.gid).padStart(10)} ${same_title.title_pure_jpn}%c]%c${by_sim}`, ...style);
                    }
                }
            } else {
                dPrint(`restore [%c${String(id).padStart(10)} ${tofix.title_jpn_original}%c]`, "color:DarkOrange;", "");
                tofix.title = tofix.title_original;
                tofix.title_jpn = tofix.title_jpn_original;
                title_ele.innerHTML = tofix.title_jpn ? tofix.title_jpn : tofix.title;
            }
            let title_puretext = gallery.querySelector(`[name="${id_list.puretext}"]`);
            if (title_puretext) title_puretext.innerHTML = title_ele.innerHTML;
        }
        dGroupEnd();
        timeEnd(`${m}fixTitlePrefix`);

        function checkNumberInTitle(a, b) {
            let test = /總集篇|総集編|soushuuhen/g;
            let [na, nb] = [a.match(test), b.match(test)];
            let style = ["color:DarkOrange;", "", "color:OrangeRed;", "", "color:DarkOrange;", "", "color:OrangeRed;", ""];
            if (na || nb) {
                if (na && nb) {
                    return tester(a, b, getNumber) ? true : false;
                } else {
                    print(`only found 1 match use regexp ${test} , abort\n${a}\n${b}`);
                    return false;
                }
            }
            test = tester(a, b, getNumber);
            if (test) return true;
            if (test != null) return false;
            test = tester(a, b, utf8Number);
            if (test) return true;
            if (test != null) return false;
            return maskTest(a, b) ? true : false;

            function tester(a, b, test) {
                let [na, nb] = [test(a), test(b)];
                if (na && nb) {
                    print(`[%c${a}%c, %c${b}%c] >>> [%c${na}%c, %c${nb}%c]`, ...style);
                    if (na.length != nb.length) return false;
                    return (na.every((data, index) => data == nb[index])) ? true : false;
                } else {
                    return null;
                }
            }

            function getNumber(input) {
                let reg = /\d/g;
                return reg.test(input) ? [input.match(reg)].flat() : false;
            }

            function utf8Number(input) {
                let number_system = [
                    "²³¹⁰⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞⅟ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅺⅻ",
                    "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛",
                    "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵",
                    "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ",
                    "⓪⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴⓵⓶⓷⓸⓹⓺⓻⓼⓽⓾⓿❶❷❸❹❺❻❼❽❾❿➀➁➂➃➄➅➆➇➈➉➊➋➌➍➎➏➐➑➒➓",
                    "㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉一七三九二五伍八六十叁参參叄四壱壹弐拾捌柒玖肆貳贰陆陸零",
                    "０１２３４５６７８９𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿",
                    "上下中前后後",
                ].join("");
                let reg_number_system = new RegExp(`[\d${number_system}]+`, "g");
                return reg_number_system.test(input) ? [input.match(reg_number_system)].flat() : false;
            }

            function maskTest(a, b) {
                let mask_a = a.replace(new RegExp(`[${b}]`, "g"), "");
                let mask_b = b.replace(new RegExp(`[${a}]`, "g"), "");
                print(`mask test [%c${a}%c, %c${b}%c] >>> [%c${mask_a}%c, %c${mask_b}%c]`, ...style);
                if (mask_a && mask_b) return false;
                return (!mask_a && !mask_b) ? true : false;
            }
        }

        function similaritySearch(target, key = "", threshold = sim_search_threshold) {
            if (!key || !target) return;
            if (gdata.length == 0) return;
            let best_match;
            findBestMatch();
            if (!best_match) return;
            return best_match;

            function findBestMatch() {
                for (let g of gdata) {
                    if (g.gid == target.gid) continue;
                    if (!target[key] || !g[key]) continue;
                    if (g.title_prefix.length == 0) continue;
                    let sim = similarity(target[key], g[key]);
                    let better = false;
                    if (sim > threshold) {
                        let style = ["color:DarkOrange;", "", "color:DeepPink;", ""];
                        dPrint(`[%c${String(target.gid).padStart(10)} ${target[key]}%c] use key [${key}] found prefix "${g.title_prefix}" in\n[%c${String(g.gid).padStart(10)} ${g[key]}%c] ${sim}`, ...style);
                        if (!best_match) {
                            better = true;
                        } else {
                            if (sim > best_match.sim) better = true;
                        }
                    }
                    if (better) best_match = { gid: g.gid, sim: sim, };
                }
            }

            //https://stackoverflow.com/a/36566052/13800616
            function similarity(s1, s2) {
                var longer = s1;
                var shorter = s2;
                if (s1.length < s2.length) {
                    longer = s2;
                    shorter = s1;
                }
                var longerLength = longer.length;
                if (longerLength == 0) return 1.0;
                return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);

                function editDistance(s1, s2) {
                    var costs = [];
                    for (var i = 0; i <= s1.length; i++) {
                        var lastValue = i;
                        for (var j = 0; j <= s2.length; j++) {
                            if (i == 0) {
                                costs[j] = j;
                            } else {
                                if (j > 0) {
                                    var newValue = costs[j - 1];
                                    if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                                    costs[j - 1] = lastValue;
                                    lastValue = newValue;
                                }
                            }
                        }
                        if (i > 0) costs[s2.length] = lastValue;
                    }
                    return costs[s2.length];
                }
            }
        }
    }

    function removeAllPunctuation(input = "") {
        let reg = /[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~\s　]/g;
        return shiftCode(input).replace(reg, "");

        function shiftCode(string = "") {
            let reg_fullwidth_code = /[\uFF01-\uFF63]/g;
            let reg_muti_blank = /[\s　\n\t]+/g;
            return string.replace(reg_fullwidth_code, match => String.fromCharCode(match.charCodeAt(0) - 0xFEE0)).replace(reg_muti_blank, " ").trim();
        }
    }

    function getTorrentList(gid = "") {
        let list = [];
        let torrents = gdata.find(gallery_data => gallery_data.gid == gid);
        if (!torrents) {
            print(`${m}${gdata.gid} have no torrents`);
            return false;
        }
        torrents = torrents.torrents;
        if (torrents.length == 0) return false;
        torrents.forEach(torrent => list.push(torrent.name));
        return list.reverse();
    }

    function addInfoToAllGallery() {
        selectAllGallery().forEach(gallery => {
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
        selectAllGallery().forEach(gallery => {
            gallery.querySelectorAll("a").forEach(a => {
                if (a.href.includes("/g/")) a.target = "_blank";
            });
        });
    }

    function updateGalleryStatus() {
        let dl_list = GM_getValue(key_list.dl_list, default_value.dl_list);
        dl_list = dl_list.length > 0 ? dl_list.split(",") : [];

        let find_button = document.querySelector(".itg.gld");
        if (!find_button) return dPrint(`${m}gallery list not found`);

        find_button = find_button.querySelectorAll("button");
        if (find_button.length > 0) { updateButtonStatus(); updateExclude(); }
        updateGalleryColor();

        function updateExclude() {
            if (gdata.length == 0) return;
            let ex_uploader = GM_getValue(key_list.exclude_uploader, default_value.exclude_uploader);
            let ex_tag = GM_getValue(key_list.exclude_tag, default_value.exclude_tag);
            ex_uploader = ex_uploader.length > 0 ? ex_uploader.split(",") : [];
            ex_tag = ex_tag.length > 0 ? ex_tag.split(",") : [];
            gdata.forEach(gallery_data => {
                let match_uploader = ex_uploader.includes(gallery_data.uploader);
                let match_tag = gallery_data.tags.some(tag => ex_tag.includes(tag));
                let gallery = document.querySelector(`[gid="${gallery_data.gid}"]`);
                gallery.style.opacity = (match_uploader || match_tag) ? 0.1 : 1;
                gallery.querySelector("img").style.display = (match_uploader || match_tag) ? "none" : "";
                let options = gallery.querySelectorAll("option");
                if (options) { options.forEach(o => { o.style.color = (ex_tag.includes(o.textContent) || ex_uploader.includes(o.textContent.replace("uploader:", ""))) ? "red" : ""; }); }
            });
        }

        function updateGalleryColor() {
            let marked = [];
            selectAllGallery().forEach(gallery => {
                let id = gallery.getAttribute("gid");
                let puretext = gallery.querySelector(".puretext");
                if (dl_list.indexOf(id) != -1) {
                    if (!gallery.getAttribute("marked")) {
                        if (!gallery.querySelector("s")) Object.assign(gallery.style, style_list.gallery_marked);
                        gallery.setAttribute("marked", true);
                        marked.push(id);
                        if (isEH()) gallery.querySelector(".gl5t").style = "color:white;";
                    }
                    if (puretext && isEH()) puretext.setAttribute("style", "color:white;");
                } else {
                    if (isEH()) {
                        gallery.querySelector(".gl5t").removeAttribute("style");
                        if (puretext) puretext.removeAttribute("style");
                    }
                }
            });
            if (marked.length > 0) print(`${m}found in list, mark gallery:\n`, marked);

            function isEH() {
                return document.domain == "e-hentai.org" ? true : false;
            }
        }

        function updateButtonStatus() {
            let marked = [];
            gdata.forEach(gallery_data => {
                let gid = gallery_data.gid;
                let dl_button = document.querySelector(`#gallery_dl_${gid}`);
                if (dl_list.indexOf(`${gid}`) != -1 && !dl_button.getAttribute("marked")) {
                    Object.assign(dl_button.style, style_list.button_marked);
                    dl_button.setAttribute("marked", true);
                    marked.push(gid);
                }
            });
            if (marked.length > 0) print(`${m}found in list, mark dl_button: ${marked}`);
        }
    }

    function repalceForbiddenChar(string = "") {
        for (let index in forbidden) {
            let fb = forbidden[index];
            let rp = replacer[index];
            let count = 0;
            while (string.indexOf(fb) != -1 && count < 999) {
                string = string.replaceAll(fb, rp);
                count++;
            }
        }
        return string.trim();
    }
})();
