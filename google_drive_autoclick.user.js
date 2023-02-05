// ==UserScript==
// @name         google drive auto click
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/google_drive_autoclick.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/google_drive_autoclick.user.js
// @version      0.2
// @description  auto skip & click download
// @author       x94fujo6
// @match        https://drive.google.com/*
// @match        https://docs.google.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    document.body.onload = main();

    function main() {
        let link = window.location.href;
        let list = [
            "drive",
            "docs",
        ];
        let index = list.findIndex(key => link.includes(`//${key}.`));
        if (index == -1) {
            return;
        }
        if (link.includes("google.com/file/d/")) {
            //	https://drive.google.com/file/d/*/view
            let id = link.split("/");
            id = id[id.length - 2];
            window.location.href = `https://${list[index]}.google.com/u/0/uc?id=${id}&export=download`;
        } else if (link.includes("uc?")) {
            if (!link.includes("confirm=")) {
                // https://drive.google.com/u/0/uc?id=*&export=download
                let id = setInterval(() => clickDL(id), 100);
            } else if (link.includes("export=download") && link.includes("confirm=")) {
                // https://drive.google.com/u/0/uc?export=download&confirm=*&id=*
                let id = setInterval(() => clickDL(id), 100);
            }
        }
    }

    function clickDL(id) {
        let button = document.getElementById("uc-download-link");
        if (button) {
            button.click();
            clearInterval(id);
        }
    }
})();
