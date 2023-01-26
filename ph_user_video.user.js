// ==UserScript==
// @name         ph_user_video
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ph_user_video.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ph_user_video.user.js
// @version      0.11
// @description  redirect link to user video list / muti select & copy video links
// @author       x94fujo6
// @match        https://*.pornhub.com/*
// ==/UserScript==


(function () {
    'use strict';
    let itemIndex = 0;
    let trycount = 0;
    let listener = false;

    window.onload = startScript();

    function startScript() {
        if (document.visibilityState == "visible") {
            if (listener) document.removeEventListener("visibilitychange", startScript);
            main();
        } else {
            document.addEventListener("visibilitychange", startScript);
            listener = true;
        }
    }

    function main() {
        myCss();
        let link = document.location.href,
            target_list = ["/videos", "/playlist", "video/search",];

        //enable this if you want auto switch to EN
        //switchLan();

        if (link.includes("viewkey")) {
            setLink();
        } else if (target_list.some(t => link.includes(t))) {
            reDirect(link);
        } else {
            replaceLink(".usernameWrap");
        }

        function switchLan() {
            let host = document.location.host,
                target_host = "www.pornhub.com";
            if (host != target_host) {
                setTimeout(() => {
                    document.querySelector(`li[data-lang="en"] a`).click();
                }, 1000);
            }
        }

        function setLink() {
            let info = document.querySelector(".video-detailed-info");
            info = info.querySelector(".usernameBadgesWrapper");
            if (!info) return print("no user info");
            info = info.querySelector("a");
            let username = info.textContent;
            print("username", username);

            let link = `${info.href}/videos/public`;
            info.setAttribute("href", link);

            replaceLink(".usernameWrap");
            markSameUser(username);

            let button = newButton("myButtonB", "Copy Video link", copyLink);
            let div = document.createElement("div");
            div.appendChild(button);

            let pos = document.querySelector("#player");
            pos.insertAdjacentElement("afterend", div);

            function copyLink() {
                let link = window.location.href;
                navigator.clipboard.writeText(link);
            }
        }

        function markSameUser(username = "") {
            mark("#relatedVideosCenter");
            mark("#recommendedVideosVPage");

            function mark(css_selector) {
                let target = document.querySelector(css_selector);
                if (target) {
                    target = target.querySelectorAll("li");
                    if (target) {
                        target.forEach(e => {
                            let uploader = e.querySelector(".usernameWrap a");
                            if (uploader) {
                                if (uploader.textContent == username) {
                                    e.style = "border: red 0.2rem solid;";
                                }
                            }
                        });
                    }
                }
            }
        }

        function replaceLink(css_selector) {
            let target = document.querySelectorAll(css_selector);
            if (target) {
                target.forEach(e => {
                    let a = e.querySelector("a");
                    if (a) if (!a.href.includes("/videos")) a.href = `${a.href}/videos/public`;
                });
            } else {
                print(`target ${css_selector} not found`);
            }
        }

        function reDirect(link) {
            let vids = document.querySelector(".profileVids"); // profileVids videoUList
            if (!vids) {
                if (link.includes("/public")) {
                    console.log("public");
                    setTimeout(() => document.location.href = link.replace("/public", ""), 1000);
                }
                if (link.includes("/playlist")) {
                    console.log("playlist");
                    vids = document.querySelector(".container.playlistSectionWrapper");
                    if (vids) mutiSelect(vids);
                }
                if (link.includes("/search")) {
                    console.log("search");
                    vids = document.querySelector("#videoSearchResult").parentElement;
                    if (vids) mutiSelect(vids);
                }
                console.log("can't found video list, abort");
                return;
            } else {
                mutiSelect(vids);
            }

            function mutiSelect(vid_list) {
                let
                    select_box = document.createElement("div"),
                    textbox = document.createElement("textarea"),
                    textbox_style = `
                        width: 100%;
                        height: auto;
                        display: block;
                        margin: auto;
                    `;

                select_box.style = `
                    display: flex;
                    text-align: center;
                    flex-wrap: wrap;
                    width: 50%;
                    margin: auto;
                `;
                select_box.innerHTML = `<textarea id="selected_vid_list" rows="10" cols="70" style="${textbox_style}"></textarea>`;
                vid_list.insertAdjacentElement("afterbegin", select_box);

                let button,
                    button_class = "myButton line-4-item",
                    button_box = document.createElement("div");
                button_box.style = `width: 100%;`;
                [
                    { text: "Select All", click: secectAll },
                    { text: "Unselect All", click: unsecectAll },
                    { text: "Invert Select", click: invertSecect },
                    { text: "Copy", click: copyAll },
                ].forEach(o => {
                    button = newButton(button_class, o.text, o.click);
                    button_box.appendChild(button);
                });
                select_box.appendChild(button_box);

                vid_list = vid_list.querySelectorAll(".pcVideoListItem");
                addCheckbox(vid_list);

                let more = document.getElementById("moreDataBtn");
                if (more) {
                    more.addEventListener("click", loadEvent);
                    let ele = document.createElement("span");
                    ele.textContent = "Load button found, this user video list is ajax. Recommend using other tools to extract the list.";
                    textbox.insertAdjacentElement("beforebegin", ele);
                }

                function addCheckbox(nodelist) {
                    let e, key, vlink;
                    console.log(`itemIndex:${itemIndex}, nodecount:${nodelist.length}`);
                    for (itemIndex; itemIndex < nodelist.length; itemIndex++) {
                        e = nodelist[itemIndex];
                        key = e.attributes["data-video-vkey"].value;
                        vlink = `https://www.pornhub.com/view_video.php?viewkey=${key}`;

                        let ck = Object.assign(document.createElement("input"), {
                            type: "checkbox",
                            name: "selected_vid_list",
                            value: vlink,
                        });
                        ck.addEventListener("click", updateTextBox);

                        let label = Object.assign(document.createElement("label"), { className: "myLable", });
                        label.appendChild(ck);

                        let div = Object.assign(document.createElement("div"), { textContent: "Add to List", });
                        label.appendChild(div);

                        div = document.createElement("div");
                        div.appendChild(label);

                        let pos = e.querySelector(".thumbnail-info-wrapper");
                        pos.insertAdjacentElement("beforebegin", document.createElement("br"));
                        pos.insertAdjacentElement("beforebegin", div);

                        pos = e.querySelector("span.title").querySelector("a");
                        pos.removeAttribute("href");
                    }
                    itemIndex = nodelist.length;
                }

                function loadEvent() {
                    let vids = document.querySelector(".profileVids").querySelectorAll(".pcVideoListItem");
                    if (vids.length === itemIndex) {
                        if (trycount < 100) {
                            console.log(`no new item found, waiting for page to load [retry:${trycount}]`);
                            setTimeout(loadEvent, 100);
                        } else {
                            console.log("retry too much, script stop");
                        }
                        trycount++;
                    } else {
                        trycount = 0;
                        addCheckbox(vids);
                    }
                }

                function copyAll() {
                    let textbox = document.getElementById("selected_vid_list");
                    navigator.clipboard.writeText(textbox.value);
                }

                function invertSecect() {
                    let inputs = document.querySelectorAll("input[name='selected_vid_list']");
                    inputs.forEach(e => {
                        if (e.checked) {
                            e.checked = false;
                        } else {
                            e.checked = true;
                        }
                    });
                    updateTextBox();
                }

                function unsecectAll() {
                    let inputs = document.querySelectorAll("input[name='selected_vid_list']:checked");
                    inputs.forEach(e => {
                        e.checked = false;
                    });
                    updateTextBox();
                }

                function secectAll() {
                    let inputs = document.querySelectorAll("input[name='selected_vid_list']");
                    inputs.forEach(e => {
                        if (!e.checked) e.checked = true;
                    });
                    updateTextBox();
                }

                function updateTextBox() {
                    let inputs = document.querySelectorAll("input[name='selected_vid_list']:checked");
                    let newtext = "";
                    if (inputs) {
                        inputs.forEach(ck => {
                            if (!newtext.includes(ck.value)) newtext += `${ck.value}\n`;
                        });
                    }
                    let box = document.getElementById("selected_vid_list");
                    box.value = newtext;
                }
            }
        }
    }

    function print(...any) {
        console.log(...any);
    }

    function newButton(bclass, btext, handeler) {
        let button = document.createElement("button");
        Object.assign(button, {
            className: bclass,
            textContent: btext,
            onclick: handeler,
        });
        return button;
    }

    function myCss() {
        let s = document.createElement("style");
        s.className = "myCssSheet";
        document.head.appendChild(s);
        s.textContent = `
        .added {
            display:initial !important;
        }

        .myButtonB {
            position: relative;
            padding: 1rem;
            width: 100%;
            border-style: solid;
            font-size: 1rem;            
            background: transparent;
            color: white;
        }

        .myButton {
            position: relative;
            padding: 0.5rem 0;
            margin: 0.5rem;
            width: max-content;
            font-size: 1rem;
        }

        .line-4-item {
            max-width: 100%;
            width: calc(80% / 4);
        }

        .myButton:active, .myButtonB:active {
            background-color: DeepPink;
        }

        .myLable {
            position: relative;
            width: auto;
            padding: 0.5rem;
            border-style: solid;
            border-width: 0.1rem;
            border-color: gray;
            display: flex;
        }

        .myLable>input {
            position: relative;
            margin: auto;
            margin-left: 0rem;
            margin-right: 0.2rem;
        }

        .myLable>div {
            position: relative;
            margin: 0.1rem;
        }
        `;
    }
})();
