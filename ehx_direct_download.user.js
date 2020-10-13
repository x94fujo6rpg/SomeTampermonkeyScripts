// ==UserScript==
// @name         ehx direct download
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js
// @version      0.1
// @description  direct download archive from list (only work in Thumbnail mode)
// @author       x94fujo6
// @match        https://e-hentai.org/*
// @exclude      https://e-hentai.org/*.php*
// @exclude      https://e-hentai.org/g/*
// @match        https://exhentai.org/*
// @exclude      https://exhentai.org/*.php*
// @exclude      https://exhentai.org/mytags
// @exclude      https://exhentai.org/g/*
// @grant        none
// ==/UserScript==


(function () {
    'use strict';
    let api;
    let domain;
    window.onload = main();

    function main() {
        api = setApi();
        if (api) setTimeout(gallerylist, 1000);
    }

    function setApi() {
        let eh = "https://api.e-hentai.org/api.php";
        let ex = "https://exhentai.org/api.php";
        let link = document.location.href;
        domain = `https://${link.split("/")[2]}`;
        if (link.indexOf("exhentai") != -1) {
            return ex;
        } else if (link.indexOf("e-hentai") != -1) {
            return eh;
        } else {
            return false;
        }
    }

    function gallerylist() {
        let gallery = document.querySelectorAll(".gl1t");
        if (gallery) {
            let data = { method: "gdata", gidlist: [], };
            let alldata = [];
            let count = 0;
            let glist = [];
            gallery.forEach((ele, index) => {
                let link = document.location.href.split("/")[2];
                link = ele.querySelector(`a[href*='${domain}/g/']`).href;
                link = link.split("/");
                if (link[3] === "g") {
                    let gid = link[4];
                    let gtoken = link[5];
                    if (gid && gtoken) {
                        glist.push([gid, gtoken]);
                        count++;
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
            requestdata(alldata);
        }
    }

    function requestdata(datalist) {
        for (let index = 0; index < datalist.length; index++) {
            setTimeout(() => {
                let data = datalist[index];
                if (data) my_api_call(data);
            }, 1000 * index);
        }
    }

    function directDL(data) {
        data = JSON.parse(data);
        data.gmetadata.forEach(g => {
            let archivelink = `${domain}/archiver.php?gid=${g.gid}&token=${g.token}&or=${g.archiver_key}`;
            let gallery = document.querySelector(`a[href="${domain}/g/${g.gid}/${g.token}/"`);
            if (gallery) {
                let ele = document.createElement("button");
                ele.href = "#";
                ele.style = "width: max-content; align-self: center;";
                ele.onclick = function () { return my_popUp(archivelink, 480, 320); };
                ele.textContent = "Archive Download";
                gallery.insertAdjacentElement("afterend", ele);
            }
        });
    }

    function my_popUp(URL, w, h) {
        window.open(URL, "_pu" + (Math.random() + "").replace(/0\./, ""), "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=" + w + ",height=" + h + ",left=" + ((screen.width - w) / 2) + ",top=" + ((screen.height - h) / 2));
        return false;
    }

    function my_api_call(data) {
        let request = new XMLHttpRequest();
        request.open("POST", api);
        request.setRequestHeader("Content-Type", "application/json");
        request.withCredentials = true;
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                let data = request.responseText;
                directDL(data);
            }
        };
        request.send(JSON.stringify(data));
    }
})();