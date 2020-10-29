// ==UserScript==
// @name         ph_user_video
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ph_user_video.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ph_user_video.user.js
// @version      0.03
// @description  redirect link to user video list / muti select & copy video links
// @author       x94fujo6
// @match        https://*.pornhub.com/view_video.php?viewkey=*
// @match        https://*.pornhub.com/model/*/videos/public*
// @match        https://*.pornhub.com/model/*/videos*
// @match        https://*.pornhub.com/users/*/videos/public*
// @match        https://*.pornhub.com/users/*/videos*
// @match        https://*.pornhub.com/pornstar/*/videos/public*
// @match        https://*.pornhub.com/pornstar/*/videos*
// ==/UserScript==


(function () {
    'use strict';
    let itemIndex = 0;
    let trycount = 0;
    window.onload = () => {
        window.document.body.onload = main();
    };

    function main() {
        myCss();
        let link = document.location.href;
        if (link.includes("viewkey")) {
            setLink();
        } else {
            reDirect(link);
        }
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
        }

        .myButton {
            position: relative;
            padding: 0.2rem;
            margin: 0.2rem;
            width: max-content;
            border-style:solid;
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

    function setLink() {
        let info = document.querySelector(".video-detailed-info");
        info = info.querySelector(".usernameBadgesWrapper");
        if (info) {
            info = info.querySelector("a");
            let link = `${info.href}/videos/public`;
            info.setAttribute("href", link);
        }

        replaceLink("relatedVideosCenter");
        replaceLink("recommendedVideos");
        replaceLink("p2vVideosVPage");

        let button = newButton("myButtonB", "Copy Video link", copyLink);
        let div = document.createElement("div");
        div.appendChild(button);

        let pos = document.querySelector(".underplayerAd");
        pos.insertAdjacentElement("afterend", div);
    }

    function copyLink() {
        let link = window.location.href;
        navigator.clipboard.writeText(link);
    }

    function replaceLink(targetid) {
        let target = document.getElementById(targetid);
        if (target) {
            target = target.querySelectorAll(".usernameWrap");
            target.forEach(e => {
                let a = e.querySelector("a");
                let alink = `${a.href}/videos/public`;
                a.href = alink;
            });
        }
    }

    function reDirect(link) {
        let vids = document.querySelector(".profileVids"); // profileVids videoUList
        if (!vids) {
            if (link.includes("/public")) {
                document.location.href = link.replace("/public", "");
                return;
            } else {
                console.log("can't found video list, abort");
                return;
            }
        } else {
            mutiSelect(vids);
        }
    }

    function mutiSelect(vid_list) {
        let textbox = document.createElement("textarea");
        Object.assign(textbox, {
            id: "selected_vid_list",
            rows: 10,
            cols: 70,
            style: "width: auto; height: auto; display: block;",
        });
        vid_list.insertAdjacentElement("afterbegin", textbox);
        textbox.insertAdjacentElement("beforebegin", document.createElement("br"));

        let button;

        button = newButton("myButton", "Copy All", copyAll);
        textbox.insertAdjacentElement("afterend", button);

        button = newButton("myButton", "Invert Select", invertSecect);
        textbox.insertAdjacentElement("afterend", button);

        button = newButton("myButton", "Unselect All", unsecectAll);
        textbox.insertAdjacentElement("afterend", button);

        button = newButton("myButton", "Select All", secectAll);
        textbox.insertAdjacentElement("afterend", button);

        vid_list = vid_list.querySelectorAll(".pcVideoListItem");
        addCheckbox(vid_list);

        let more = document.getElementById("moreDataBtn");
        if (more) {
            more.addEventListener("click", loadEvent);
            let ele = document.createElement("span");
            ele.textContent = "Load button found, this user video list is ajax. Recommend using other tools to extract the list.";
            textbox.insertAdjacentElement("beforebegin", ele);
        }
    }

    function copyAll() {
        let textbox = document.getElementById("selected_vid_list");
        navigator.clipboard.writeText(textbox.value);
    }

    function secectAll() {
        let inputs = document.querySelectorAll("input[name='selected_vid_list']");
        inputs.forEach(e => {
            if (!e.checked) e.checked = true;
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

    function newButton(bclass, btext, handeler) {
        let button = document.createElement("button");
        Object.assign(button, {
            className: bclass,
            textContent: btext,
            onclick: handeler,
        });
        return button;
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

    function addCheckbox(nodelist) {
        let e, key, vlink;
        console.log(`itemIndex:${itemIndex}, nodecount:${nodelist.length}`);
        for (itemIndex; itemIndex < nodelist.length; itemIndex++) {
            e = nodelist[itemIndex];
            key = e.attributes["data-video-vkey"].value;
            vlink = `https://www.pornhub.com/view_video.php?viewkey=${key}`;

            let ck = document.createElement("input");
            Object.assign(ck, {
                type: "checkbox",
                name: "selected_vid_list",
                value: vlink,
            });
            ck.addEventListener("click", updateTextBox);

            let label = document.createElement("label");
            Object.assign(label, {
                className: "myLable",
            });
            label.appendChild(ck);

            let div = document.createElement("div");
            Object.assign(div, {
                textContent: "Add to List",
            });
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
})();
