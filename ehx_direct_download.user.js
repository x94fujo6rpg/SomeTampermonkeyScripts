// ==UserScript==
// @name         ehx direct download
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js
// @version      0.16
// @description  direct download archive from list (only work in Thumbnail mode)
// @author       x94fujo6
// @match        https://e-hentai.org/*
// @exclude      https://e-hentai.org/*.php*
// @exclude      https://e-hentai.org/mytags
// @exclude      https://e-hentai.org/g/*
// @exclude      https://e-hentai.org/mpv/*
// @match        https://exhentai.org/*
// @exclude      https://exhentai.org/*.php*
// @exclude      https://exhentai.org/mytags
// @exclude      https://exhentai.org/g/*
// @exclude      https://exhentai.org/mpv/*
// @grant        none
// ==/UserScript==


(function () {
    'use strict';
    let api;
    let domain;
    let hid = false;
    window.onload = main();

    function main() {
        api = setApi();
        let pos = document.querySelector(".ido");
        let bs = "width: max-content";

        let e = document.createElement("button");
        e.id = "puretext";
        e.textContent = "Show Pure Text";
        e.style = bs;
        e.onclick = function () { return puretext(); };
        pos.insertAdjacentElement("afterbegin", e);

        e = document.createElement("button");
        e.id = "ddbutton";
        e.textContent = "Show Archive Download";
        e.style = bs;
        e.onclick = function () { return click2start(); };
        pos.insertAdjacentElement("afterbegin", e);

        if (hid) hlexg();
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

    function hlexg() {
        let w = document.querySelectorAll("s");
        if (w.length > 0) w.forEach(ele => ele.parentElement.parentElement.parentElement.parentElement.style.backgroundColor = "gold");
    }

    function puretext() {
        document.getElementById("puretext").remove();
        let gallery = document.querySelectorAll(".gl1t");
        gallery.forEach(ele => {
            let e = document.createElement("span");
            e.textContent = ele.querySelector("a[href]").textContent;
            e.className = "gl4t puretext";
            let pos = ele.querySelector(".gdd");
            if (pos) {
                pos.insertAdjacentElement("beforebegin", e);
            } else {
                pos = ele.querySelector(".gl3t");
                pos.insertAdjacentElement("afterend", e);
            }
        });
    }

    function click2start() {
        if (api) {
            document.getElementById("ddbutton").remove();
            gallerylist();
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
            }, 3000 * index);
        }
    }

    function directDL(data) {
        data = JSON.parse(data);
        data.gmetadata.forEach(g => {
            let archivelink = `${domain}/archiver.php?gid=${g.gid}&token=${g.token}&or=${g.archiver_key}`;
            let gallery = document.querySelector(`a[href="${domain}/g/${g.gid}/${g.token}/"`);
            if (gallery) {
                let ele = document.createElement("button");
                ele.id = g.gid;
                ele.className = "gdd";
                ele.href = "#";
                ele.style = "width: max-content; align-self: center;";
                ele.onclick = function () { 
                    let s = document.getElementById(g.gid).style;
                     s.color= "gray";
                     s.backgroundColor = "transparent";
                    return my_popUp(archivelink, 480, 320); 
                };
                ele.textContent = "Archive Download";
                let pos = gallery.parentElement.querySelector(".puretext");
                if (!pos) pos = gallery.parentElement.querySelector(".gl3t");
                pos.insertAdjacentElement("afterend", ele);
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