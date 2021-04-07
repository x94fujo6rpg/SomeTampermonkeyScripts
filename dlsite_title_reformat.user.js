// ==UserScript==
// @name         dlsite title reformat
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/dlsite_title_reformat.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/dlsite_title_reformat.user.js
// @version      0.68
// @description  remove title link / remove excess text / custom title format / click button to copy
// @author       x94fujo6
// @match        https://www.dlsite.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
/* jshint esversion: 9 */

(function () {
    'use strict';
    let debug = true;
    let formatted_data = {
        id: "",
        title_original: "",
        title_formatted: "",
        circle: "",
        Year: "",
        year: "",
        month: "",
        day: "",
        series: "",
        author: "",
        scenario: "",
        illust: "",
        cv: "",
        age: "",
        type: "",
        tags: "",
    };
    let data_list = Object.keys(formatted_data);
    let updateid;
    const forbidden = `<>:"/|?*\\`;
    const replacer = `＜＞：”／｜？＊＼`;
    //-----------------------------------------------------
    const key_format = "format_seting";
    const key_adv = "format_adv";
    const key_f2h = "format_f2h";
    const key_half = "format_falf";
    const key_full = "format_full";
    const key_show_ot = "format_show_ot";
    const key_show_ft = "format_show_ft";
    const key_sep = "format_sep";
    //-----------------------------------------------------
    const default_format = "%id% %title_formatted%";
    const default_adv = false;
    const default_f2h = true;
    const default_half = "1234567890()[]{}~!@#$%^&_+-=;':,.()~";
    const default_full = "１２３４５６７８９０（）［］｛｝～！＠＃＄％︿＆＿＋－＝；’：，．（）〜";
    const default_show_ot = true;
    const default_show_ft = true;
    const default_sep = "、";
    //-----------------------------------------------------
    let setting_format = GM_getValue(key_format, default_format);
    let setting_adv = GM_getValue(key_adv, default_adv);
    let setting_f2h = GM_getValue(key_f2h, default_f2h);
    let setting_half = default_half;
    let setting_full = default_full;
    let setting_show_ot = GM_getValue(key_show_ot, default_show_ot);
    let setting_show_ft = GM_getValue(key_show_ft, default_show_ft);
    let setting_sep = GM_getValue(key_sep, default_sep);
    //-----------------------------------------------------
    print("load setting");
    print(`${key_format}: ${setting_format}`);
    print(`${key_adv}: ${setting_adv}`);
    print(`${key_f2h}: ${setting_f2h}`);
    print(`${key_show_ot}: ${setting_show_ot}`);
    print(`${key_show_ft}: ${setting_show_ft}`);
    print(`${key_sep}: ${setting_sep}`);
    //-----------------------------------------------------
    const container_list = [
        "()", "[]", "{}", "（）", "<>",
        "［］", "｛｝", "【】", "『』", "《》", "〈〉", "「」"
    ];
    const regesc = t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const [container_start, container_end] = extracContainer();
    const reg_container = containerRegexGenerator();
    const reg_excess = new RegExp(`^\\s*${reg_container}\\s*|\\s*${reg_container}\\s*$`, "g");
    const reg_blank = /[\s　]{2,}/g;
    const reg_muti_blank = /[\s　\n\t]+/g;
    const reg_ascii = /[\x00-\x7F]/g;
    const reg_until_number = /[^\d]*[\d]+/;
    const reg_time = new RegExp(`[${regesc(container_start)}]*\\d+:\\d+[${regesc(container_end)}]*|約\\d*時*間*\\d+分\\d*秒*|合*計*\\d+分\\d+秒|\\d+時間\\d+分\\d*秒*`, "g");
    print("reg_unwanted | ", reg_time);
    /*
        \u0021-\u002f   !"#$%&'()*+,-./
        \u003a-\u0040   :;<=>?@
        \u005b-\u0060   [\]^_`
        \u007b-\u007e   {|}~
        \uff5f-\uff63   ｟｠｡｢｣
    */
    const reg_non_word_at_start = /^[\u0021-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007e\uff5f-\uff63　\s]/;
    const reg_text_start = /^(トラック|track)/;
    const max_depth = 10;

    window.document.body.onload = main();

    function main() {
        let link = window.location.href;
        let match_list = [
            "/circle/profile/",
            "/fsr/",
            "/genres/works",
        ];
        if (link.includes("/product_id/")) {
            myCss();
            productHandler();
            fix_switch_link();
            return print(productHandler.name);
        } else if (match_list.some(key => link.includes(key))) {
            myCss();
            searchHandler();
            fix_switch_link();
            return print(searchHandler.name);
        } else {
            return print("not in support list");
        }
    }

    function extracContainer() {
        let start = "", end = "";
        container_list.forEach(c => {
            start += c[0];
            end += c[1];
        });
        return [start, end];
    }

    function containerRegexGenerator() {
        let reg = [];
        container_list.forEach(c => {
            let esc = regesc(c);
            let end = esc.slice(esc.length / 2);
            let start = esc.replace(end, "");
            reg.push(`${start}[^${esc}]*${end}`);
        });
        return `(${reg.join("|")})`;
    }

    function newCheckbox(id, onclick) {
        let ck = document.createElement("input");
        Object.assign(ck, {
            type: "checkbox",
            id: id,
            onclick: onclick,
        });
        return ck;
    }

    function newLable(forid = "", text = "", className = "dtr_textsize05") {
        let lable = document.createElement("label");
        Object.assign(lable, {
            className: className,
            htmlFor: forid,
            textContent: text,
        });
        return lable;
    }

    function searchHandler() {
        let display_list = document.querySelector(".display_normal.on");
        let display_grid = document.querySelector(".display_block.on");
        if (display_list) {
            listHandler();
        } else if (display_grid) {
            gridHandler();
        }
    }

    function getMutipleDataToList(pos, type = "a") {
        let list = [];
        let es = pos.querySelectorAll(type);
        if (es) {
            es.forEach(e => list.push(e.textContent));
            list = stringFormatter(list.join(setting_sep));
            return list;
        } else {
            return "";
        }
    }

    function fix_switch_link() {
        let links = document.querySelectorAll(".floorNavLink-item a");
        if (!links || links.length == 0) return;
        let current = window.location.href.replace(/.+www\.dlsite\.com\/\w+\/(.+)/, "$1");
        links.forEach(link => link.href += current);
    }

    const to_full_size_image = url => url.replace(/(.*)resize(.*)_240x240(.*)/, "$1modpub$2$3");

    function newCoverDownload(id) {
        let b = document.createElement("button");
        b.id = "dtr_cover_dl";
        b.textContent = "Cover";
        b.onclick = () => {
            let url = document.querySelector(`img[src*="${id}"`).src;
            url = to_full_size_image(url);
            let rq = new XMLHttpRequest();
            rq.open("GET", url, true);
            rq.responseType = "blob";
            rq.onload = () => dl(rq.response, url.match(/[Rr][Jj]\d+[^\/]*\.[a-zA-Z]+/)[0]);
            rq.send();

            function dl(blob, filename) {
                let file_url = window.URL.createObjectURL(blob);
                let a = document.querySelector("#dtr_img_dl_url");
                if (!a) {
                    a = document.createElement("a");
                    a.id = "dtr_img_dl_url";
                    document.body.insertAdjacentElement("afterbegin", a);
                }
                a.href = file_url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(file_url);
            }
        };
        return b;
    }

    function addSortButton() {
        let classname = "reSortByID";
        let ele = document.querySelector(`.${classname}`);
        if (ele) return;

        let pos = document.querySelector(".sort_box .status_select");
        if (!pos) return;

        ele = document.createElement("div");
        ele.textContent = "SortByID:";
        ele.style = "margin: 0.5rem;";
        pos.appendChild(ele);

        ele = document.createElement("button");
        ele.textContent = "Descent";
        ele.className = classname;
        ele.onclick = () => sortByID(true);
        pos.appendChild(ele);

        ele = document.createElement("button");
        ele.textContent = "Ascent";
        ele.className = classname;
        ele.onclick = () => sortByID();
        pos.appendChild(ele);
    }

    async function sortByID(descent = false) {
        console.time(sortByID.name);
        let grid_mode = document.querySelector(".display_block.on") ? true : false;
        let eles = document.querySelectorAll(grid_mode ? ".search_result_img_box_inner" : "#search_result_list tr");
        let pos = document.querySelector(grid_mode ? "#search_result_img_box" : "#search_result_list tbody");
        let attrname = "sort_id";
        await new Promise(r => {
            eles.forEach(e => {
                let id = e.querySelector(grid_mode ? ".search_img" : ".work_thumb_inner")
                    .id.replace("_link_", "");
                e.setAttribute(attrname, id);
            });
            r();
        });
        let id_list = [...eles].map(e => parseInt(e.getAttribute(attrname).replace("RJ", ""), 10));
        id_list = id_list.sort((a, b) => descent ? b - a : a - b);
        console.log(id_list);
        id_list.forEach(id => pos.appendChild(document.querySelector(`[${attrname}="RJ${id}"]`)));
        console.timeEnd(sortByID.name);
    }

    function listHandler() {
        console.time(listHandler.name);
        let list = document.querySelectorAll("#search_result_list");
        if (!list) {
            print("list not found");
        } else {
            list = list[list.length - 1].querySelectorAll("tr");
            list.forEach(tr => {
                let id,
                    title_o_text, title_f_text,
                    circle_text,
                    cv, tags,
                    pos, newbox, node_list;
                pos = tr.querySelector("dl");
                id = tr.querySelector(".work_thumb a[href*='/product_id/']").id.replace("_link_", "");
                title_o_text = pos.querySelector(".work_name a[href*='/product_id/']").textContent;
                title_f_text = stringFormatter(title_o_text);
                circle_text = stringFormatter(pos.querySelector(".maker_name a").textContent);

                node_list = [
                    newLine(),
                    newCopyButton(title_o_text), newLine(),
                    newCopyButton(title_f_text), newLine(),
                    newCopyButton(id), newSeparate(), newCoverDownload(id), newSeparate(), newCopyButton(circle_text),
                ];
                if (title_o_text == title_f_text) node_list.splice(3, 2);
                newbox = appendAll(document.createElement("dd"), node_list);

                cv = pos.querySelector(".author");
                cv = cv ? getMutipleDataToList(cv) : "";
                tags = pos.querySelector(".search_tag");
                tags = tags ? getMutipleDataToList(tags) : "";
                if (cv != "") appendAll(newbox, [newSeparate(), newCopyButton(cv, "CV/Author")]);
                if (tags != "") appendAll(newbox, [newSeparate(), newCopyButton(tags, "Tags")]);

                pos.appendChild(newbox);
            });
        }
        console.timeEnd(listHandler.name);
        addSortButton();
    }

    function gridHandler() {
        console.time(gridHandler.name);
        let list = document.querySelectorAll(".search_result_img_box_inner");
        if (!list) {
            print("list not found");
        } else {
            let w = document.createElement("div");
            w.appendChild(newSpan("Can't get full CV/Author list in grid view. If you need it, switch to list view.", "dtr_list_w_text"));
            document.querySelector(".sort_box").insertAdjacentElement("afterend", w);

            list.forEach(box => {
                let id,
                    title_o_text, title_f_text,
                    circle_text,
                    cv,
                    pos, newbox, node_list;
                pos = box.querySelector(".work_price_wrap");
                id = box.querySelector(".search_img.work_thumb").id.replace("_link_", "");
                title_o_text = box.querySelector(".work_name a").textContent;
                title_f_text = stringFormatter(title_o_text);
                circle_text = stringFormatter(box.querySelector(".maker_name a").textContent);
                cv = box.querySelector(".author");
                cv = cv ? getMutipleDataToList(cv) : "";

                node_list = [
                    newCopyButton(id), newSeparate(), newCoverDownload(id), newLine(),
                    newCopyButton(title_o_text, "Original"), newSeparate(),
                    newCopyButton(title_f_text, "Formatted"), newLine(),
                    newCopyButton(circle_text, "Circle"),
                ];
                if (title_o_text == title_f_text) node_list.splice(5, 2);
                newbox = appendAll(document.createElement("dd"), node_list);

                if (cv != "") appendAll(newbox, [newSeparate(), newCopyButton(cv, "CV/Author")]);

                pos.insertAdjacentElement("beforebegin", newbox);
            });
        }
        console.timeEnd(gridHandler.name);
        addSortButton();
    }

    function appendAll(node, nodeList) {
        nodeList.forEach(e => node.appendChild(e));
        return node;
    }

    function saveSetting() {
        print("[saveSetting]");

        if (setting_format.length > 0) {
            GM_setValue(key_format, setting_format);
            print(`saved ${key_format}: ${setting_format}`);
        } else {
            print(`${key_format} not saved cus is empty`);
        }

        GM_setValue(key_adv, setting_adv);
        print(`saved ${key_adv}: ${setting_adv}`);

        GM_setValue(key_f2h, setting_f2h);
        print(`saved ${key_f2h}: ${setting_f2h}`);

        GM_setValue(key_show_ot, setting_show_ot);
        print(`saved ${key_show_ot}: ${setting_show_ot}`);

        GM_setValue(key_show_ft, setting_show_ft);
        print(`saved ${key_show_ft}: ${setting_show_ft}`);

        GM_setValue(key_sep, setting_sep);
        print(`saved ${key_sep}: ${setting_sep}`);
    }

    function getData() {
        console.time(getData.name);
        //------------------------------------------------------
        let sitedata = contents.detail[0];
        let [Y, m, d] = sitedata.regist_date.split("/");
        let y = Y.slice(2);
        let circle = document.getElementById("work_maker").querySelector("span.maker_name[itemprop='brand']");
        let circle_text = stringFormatter(circle.querySelector("a").textContent);
        circle.insertAdjacentElement("afterbegin", newCopyButton(circle_text, "Copy"));
        Object.assign(formatted_data, {
            id: sitedata.id,
            title_original: sitedata.name,
            title_formatted: stringFormatter(sitedata.name),
            circle: circle_text,
            Year: Y,
            year: y,
            month: m,
            day: d,
        });
        //------------------------------------------------------
        let datapart = document.getElementById("work_right_inner").querySelectorAll("th");
        let parselist = {
            series: ["Series name", "シリーズ名", "系列名", "系列名"],
            author: ["Author", "作者", "作者", "作者"],
            scenario: ["Scenario", "シナリオ", "剧情", "劇本"],
            illust: ["Illustration", "イラスト", "插画", "插畫"],
            cv: ["Voice Actor", "声優", "声优", "聲優"],
            age: ["Age", "年齢指定", "年龄指定", "年齡指定"],
            type: ["Product format", "作品形式", "作品类型", "作品形式"],
        };
        let release = ["Release date", "販売日", "贩卖日", "販賣日"];
        let text;
        let all = [];
        datapart.forEach(th => {
            for (let key in parselist) {
                text = th.textContent;
                if (isInList(text, parselist[key], formatted_data[key])) {
                    all = [];
                    if (key == ("age" || "type")) {
                        th.parentNode.querySelectorAll("span").forEach(span => all.push(span.textContent));
                    } else {
                        th.parentNode.querySelectorAll("a").forEach(a => all.push(a.textContent));
                    }
                    formatted_data[key] = stringFormatter(all.join(setting_sep));
                    insertCopyDataButton(th, formatted_data[key]);
                    delete parselist[key];
                    break;
                } else if (release) {
                    if (release.some(t => text.includes(t))) {
                        let date = `${Y}${m}${d}`;
                        insertCopyDataButton(th, date, date);
                        date = `${y}${m}${d}`;
                        insertCopyDataButton(th, date, date);
                        release = false;
                    }
                }
            }
        });
        //------------------------------------------------------
        let tagpart = document.querySelector("#work_right_inner div.main_genre");
        let insertpos = tagpart;
        tagpart = tagpart.querySelectorAll("a");
        let tags = [];
        tagpart.forEach(a => tags.push(a.textContent));
        formatted_data.tags = stringFormatter(tags.join(setting_sep));
        insertCopyDataButton(insertpos, formatted_data.tags);
        console.timeEnd(getData.name);
    }

    function insertCopyDataButton(ele, copytext = "", btext = "Copy") {
        ele = searchNodeNameInParents(ele, "TR");
        if (!ele) return;
        let pos = ele.querySelector("div");
        if (!pos) pos = ele.querySelector("td");
        if (!pos) return;
        pos.insertAdjacentElement("afterbegin", newCopyButton(copytext, btext));
    }

    function searchNodeNameInParents(ele, nodename = "") {
        if (!ele || !nodename) return false;
        nodename = nodename.toUpperCase();
        let count = 0;
        while (true) {
            ele = ele.parentNode;
            count++;
            if (!ele || count > 100) return false;
            if (ele.nodeName == nodename) break;
        }
        return ele;
    }

    function isInList(text, list, data) {
        if (!data) if (list.some(t => text.includes(t))) return true;
        return false;
    }

    function stringFormatter(text) {
        text = removeExcess(text);
        if (setting_f2h) text = toHalfWidth(text);
        text = repalceForbiddenChar(text);
        return text;
    }

    function removeExcess(text) {
        // remove excess text
        let count = 0;
        while (count < 100 && text.match(reg_excess)) {
            text = text.replace(reg_excess, "");
            count++;
        }
        // remove if it at start or end
        count = 0;
        while (count < 100) {
            count++;
            let index = container_start.indexOf(text[0]);
            if (index == -1) break;
            text = text.slice(1).trim();
            if (container_end[index] == text[text.length - 1]) text = text.slice(0, text.length - 1).trim();
        }
        text = text.replace(reg_blank, " ");
        return text;
    }

    function toHalfWidth(text) {
        for (let i in setting_full) {
            text = text.replace(new RegExp(setting_full[i], "g"), setting_half[i]);
        }
        return text;
    }

    function repalceForbiddenChar(text) {
        for (let index in forbidden) {
            text = text.replace(new RegExp(regesc(forbidden[index]), "g"), replacer[index]);
        }
        return text;
    }

    function updateSetting() {
        let s = document.getElementById("format_title_setting");
        let p = document.getElementById("format_title_preview");
        let cs = document.getElementById("format_title_custom_span");
        let cb = document.getElementById("format_title_custom_button");
        if (s.value.length > 0) {
            if (setting_format != s.value) {
                setting_format = s.value;
                let formatted = parseFormatString(setting_format);
                cs.textContent = p.value = formatted;
                cb.onclick = () => navigator.clipboard.writeText(formatted);
            }
        }
        let sep = document.getElementById(`dtr_${key_sep}`);
        setting_sep = sep.value;
    }

    function parseFormatString(string = "") {
        let formatted_text = string;
        data_list.forEach(key => {
            formatted_text = formatted_text.replace(new RegExp(`%${key}%`, "g"), formatted_data[key]);
        });
        formatted_text = repalceForbiddenChar(formatted_text);
        return formatted_text;
    }

    function setting() {
        console.time(setting.name);
        //------------------------------------------------------
        let pos = document.getElementById("work_name");
        let button = document.createElement("button");
        Object.assign(button, {
            textContent: "Open Setting",
            value: "open",
            onclick: function () {
                let ele = document.getElementById("format_setting_ui");
                if (this.value === "close") {
                    ele.style.display = "none";
                    this.value = "open";
                    this.textContent = "Open Setting";
                    clearInterval(updateid);
                } else {
                    ele.style.display = "";
                    this.value = "close";
                    this.textContent = "Close Setting";
                    updateid = setInterval(updateSetting, 100);
                }
            },
        });
        pos.appendChild(button);
        appendNewLine(pos);
        //------------------------------------------------------
        let box = document.createElement("div");
        Object.assign(box, {
            id: "format_setting_ui",
            className: "dtr_setting_box",
        });
        box.style.display = "none";
        let textarea;
        //------------------------------------------------------
        button = document.createElement("button");
        let mode = setting_adv ? "on" : "off";
        Object.assign(button, {
            className: "dtr_textsize05",
            id: "format_title_setting_advance_model",
            textContent: `Advance mode: ${mode}`,
            value: mode,
            onclick: function () {
                let t = document.getElementById("format_title_setting");
                if (this.value === "off") {
                    Object.assign(this, {
                        value: "on",
                        textContent: "Advance mode: on",
                    });
                    t.readOnly = false;
                    setting_adv = true;
                } else {
                    Object.assign(this, {
                        value: "off",
                        textContent: "Advance mode: off",
                    });
                    t.readOnly = true;
                    setting_adv = false;
                }
            }
        });
        box.appendChild(button);
        box.appendChild(newSpan(" enable this to direct edit format setting",
            "dtr_textsize05 dtr_setting_w_text"));
        appendNewLine(box);
        //------------------------------------------------------
        // all data
        data_list.forEach(s => box.appendChild(newDataButton(`+${s}`, `%${s}%`)));
        appendNewLine(box);
        //------------------------------------------------------
        textarea = document.createElement("textarea");
        Object.assign(textarea, {
            className: "dtr_textsize05 dtr_max_width",
            id: "format_title_setting",
            rows: 1,
            value: setting_format,
        });
        textarea.readOnly = !setting_adv;
        box.appendChild(newSpan("Format setting:"));
        appendNewLine(box);
        box.appendChild(textarea);
        appendNewLine(box);

        textarea = document.createElement("textarea");
        Object.assign(textarea, {
            className: "dtr_textsize05 dtr_max_width",
            id: "format_title_preview",
            readOnly: true,
            rows: 1,
            value: parseFormatString(setting_format),
        });
        box.appendChild(newSpan("Preview:"));
        appendNewLine(box);
        box.appendChild(textarea);
        appendNewLine(box);
        //------------------------------------------------------
        box.appendChild(newButton("save", saveSetting));
        box.appendChild(newSeparate());

        box.appendChild(newButton("default", () => {
            document.getElementById("format_title_setting").value = default_format;
        }));
        box.appendChild(newSeparate());

        box.appendChild(newButton("clear", () => {
            document.getElementById("format_title_setting").value = "";
        }));
        appendNewLine(box);
        appendNewLine(box);
        //------------------------------------------------------
        let ck_area = document.createElement("div");
        ck_area.className = "dtr_setting_ck_box";
        appendAll(ck_area, [
            newSpan(`Save & Refresh to make these setting work`, ""),
            newLine(),
        ]);
        let checkbox;
        let lable;
        checkbox = newCheckbox(`dtr_${key_f2h}`, function () {
            setting_f2h = this.checked ? true : false;
            print(`${key_f2h}: ${setting_f2h}`);
        });
        lable = newLable(`dtr_${key_f2h}`, "Replace some half-width to full-width");
        if (setting_f2h) checkbox.checked = true;
        appendAll(ck_area, [checkbox, lable, newLine()]);

        checkbox = newCheckbox(`dtr_${key_show_ot}`, function () {
            setting_show_ot = this.checked ? true : false;
            print(`${key_show_ot}: ${setting_show_ot}`);
        });
        lable = newLable(`dtr_${key_show_ot}`, "Show Original / ID+Original");
        if (setting_show_ot) checkbox.checked = true;
        appendAll(ck_area, [checkbox, lable, newLine()]);

        checkbox = newCheckbox(`dtr_${key_show_ft}`, function () {
            setting_show_ft = this.checked ? true : false;
            print(`${key_show_ft}: ${setting_show_ft}`);
        });
        lable = newLable(`dtr_${key_show_ft}`, "Show Formatted / ID+Formatted");
        if (setting_show_ft) checkbox.checked = true;
        appendAll(ck_area, [checkbox, lable, newLine()]);

        textarea = document.createElement("textarea");
        Object.assign(textarea, {
            className: "dtr_textsize05",
            id: `dtr_${key_sep}`,
            rows: 1,
            cols: 1,
            value: setting_sep,
            style: "resize: none;",
        });
        lable = newLable(`dtr_${key_sep}`, "Separator: ");
        appendAll(ck_area, [
            lable, textarea, newLable(`dtr_${key_sep}`, " for data have muti value like tags"),
            newLine(),
        ]);
        box.appendChild(ck_area);
        appendNewLine(box);
        //------------------------------------------------------
        box.appendChild(newSpan("data list:"));
        appendNewLine(box);
        textarea = document.createElement("textarea");
        Object.assign(textarea, {
            className: "dtr_textsize05",
            id: "format_title_all_data",
            readOnly: true,
        });
        box.appendChild(textarea);
        pos.append(box);

        listAllData();

        updateSetting();
        console.timeEnd(setting.name);
    }

    function listAllData() {
        let textbox = document.getElementById("format_title_all_data");
        textbox.value = "";

        let count = 0;
        let maxlength = 0;
        let s;
        for (let key in formatted_data) {
            s = `%${key}%: ${formatted_data[key]}\n`;
            textbox.value += s;
            count++;
            if (formatted_data[key]) {
                if (s.length > maxlength) maxlength = s.length;
            }
        }
        Object.assign(textbox, {
            rows: count + 1,
            cols: maxlength * 2,
        });
    }

    function updateSettingString(id, format_string) {
        let textarea = document.getElementById(id);
        let list = [
            "year",
            "Year",
            "month",
            "day",
        ];
        let o = textarea.value;
        if (list.some(s => format_string.includes(s)) && list.some(s => o.endsWith(`%${s}%`))) {
            textarea.value += format_string;
        } else {
            textarea.value += ` ${format_string}`;
        }
        textarea.value = textarea.value.trim();
    }

    function productHandler() {
        getData();
        setting();
        console.time(productHandler.name);
        //------------------------------------------------------
        let pos = document.querySelector("#work_name").querySelector("a");
        pos.style.display = "none";
        pos = pos.parentNode;

        let id = formatted_data.id;
        let cover = document.querySelector(`img[itemprop="image"]`).src;
        let title_o = formatted_data.title_original;
        let title_f = formatted_data.title_formatted;
        let title_id_c = parseFormatString(setting_format);
        let title_id_o = `${id} ${title_o}`;
        let title_id_f = `${id} ${title_f}`;
        let notSame_o_c = Boolean(title_id_o != title_id_c);
        let notSame_f_c_o = Boolean(title_id_f != title_id_c && title_id_f != title_id_o);
        //------------------------------------------------------
        // ID + original title
        if (notSame_o_c && setting_show_ot) {
            pos.append(newSpan(title_id_o, ""));
            appendNewLine(pos);
        }
        //------------------------------------------------------
        // ID + formatted title
        if (notSame_f_c_o && setting_show_ft) {
            pos.append(newSpan(title_id_f, ""));
            appendNewLine(pos);
        }
        //------------------------------------------------------
        // custom title
        let span = newSpan(title_id_c, "");
        span.id = "format_title_custom_span";
        pos.append(span);
        appendNewLine(pos);
        //------------------------------------------------------
        // add copy ID button
        pos.append(newCopyButton(id));
        pos.append(newSeparate());
        //------------------------------------------------------
        // add download cover
        pos.append(newCoverDownload(id));
        pos.append(newSeparate());
        //------------------------------------------------------
        // add copy custom format button
        let custom_button = newCopyButton(title_id_c, "CustomTitle");
        custom_button.id = "format_title_custom_button";
        pos.append(custom_button);
        //------------------------------------------------------   
        // add copy Original / ID+Original button
        if (notSame_o_c && setting_show_ot) {
            pos.append(newSeparate());
            pos.append(newCopyButton(title_o, "Original"));
            pos.append(newCopyButton(title_id_o, "ID+Original"));
        }
        //------------------------------------------------------
        // add copy Formatted / ID+Formatted button
        if (notSame_f_c_o && setting_show_ft) {
            pos.append(newSeparate());
            pos.append(newCopyButton(title_f, "DefaultFormat"));
            pos.append(newCopyButton(title_id_f, "ID+DefaultFormat"));
        }
        //------------------------------------------------------
        // creat track list if any
        let list = gettracklist();
        if (list) {
            addTracklist(list, "Official");
        } else {
            list = extractTrackListFromText();
            let spantext = "Extract from article (Less accurate. Can't get the track that has no number.)";
            if (list) list.reverse().forEach((result, index) => addTracklist(result, spantext, index));
        }
        //------------------------------------------------------
        console.timeEnd(productHandler.name);
    }

    function extractTrackListFromText() {
        let raw_text = document.querySelector(".work_parts_container");
        if (!raw_text) return false;
        if (debug) console.groupCollapsed();
        //------------------------------------------------------
        let extract_result = [];
        let reg_number = /[\d１２３４５６７８９０]+/;

        // pre process
        raw_text = raw_text.textContent.split("\n").filter(line => line.replace(reg_muti_blank, "") != "");
        let newtext = [];
        raw_text.forEach(line => { newtext.push(shiftCode(line)); });
        print("newtext | ", newtext);

        // get all line with number
        let extract = [];
        newtext.forEach((line, index) => {
            let number = reg_number.exec(line);
            if (number) { extract.push({ number: parseInt(number[0], 10), text: line, o_index: index, }); }
        });
        print("extract | ", extract);

        // extract line that number are continuous
        if (extract.length > 0) {
            let track_list = [];
            let offset = 1;
            let not_add = 0;
            let extract_copy = Object.assign([], extract);
            let skip = 0;
            for (let index = 1; index < extract_copy.length; index += offset) {
                if (offset == -1) offset = 1;
                print("");
                let this_n = extract_copy[index].number;
                let previous_n = extract_copy[index - offset].number;
                print(`index:${index} | this_n:${this_n} | previous_n:${previous_n} | offset:${offset} | not_add:${not_add} | skip:${skip} | this:${extract[index].text}`);
                if (skip != 0 && skip == index) {
                    skip = 0;
                    continue;
                }
                if (offset == 1) {
                    if (this_n == previous_n) {
                        // see same number as previous, skip this one
                        print(`skip | ${extract[index].text}`);
                        continue;
                    } else if (this_n == previous_n + 1) {
                        if (track_list.length == 0) {
                            track_list.push(extract[index - 1].text);
                            print(`add | ${extract[index - 1].text}`);
                        }
                        track_list.push(extract[index].text);
                        print(`add | ${extract[index].text}`);
                        not_add = 0;
                        continue;
                    } else if (index >= 2) {
                        if (this_n == extract[index - 2].number + 1) {
                            offset = 2;
                            if (track_list.length == 0) {
                                track_list.push(extract[index - 2].text);
                                print(`add | ${extract[index - 2].text}`);
                            }
                            track_list.push(extract[index].text);
                            print(`add | ${extract[index].text}, offset: 2`);
                            not_add = 0;
                            continue;
                        }
                    }
                } else if (offset == 2) {
                    if (this_n == previous_n) {
                        // see same number as previous, skip this one
                        print(`skip | ${extract[index].text}`);
                        continue;
                    } else if (this_n == previous_n + 1) {
                        track_list.push(extract[index].text);
                        print(`add | ${extract[index].text}`);
                        not_add = 0;
                        continue;
                    } else if (this_n == extract[index - 1].number + 1) {
                        offset = -1;
                        skip = index;
                        track_list.push(extract[index].text);
                        print(`add | ${extract[index].text}, offset: 1`);
                        not_add = 0;
                        continue;
                    }
                }
                not_add++;
                if (not_add > 1 || this_n == 1) {
                    if (track_list.length > 0) extract_result.push(track_list);
                    track_list = [];
                    not_add = 0;
                    print("_____reset_____");
                }
            }
            if (track_list.length > 0) extract_result.push(track_list);
            print("");
        }
        if (debug) console.groupEnd();
        //------------------------------------------------------
        if (debug) console.groupCollapsed();
        print("extract_result | ", extract_result);
        if (extract_result) {
            extract_result.forEach((result, result_index) => {
                let check_list = removeExcessInTrackList(result, true);
                print("====================");
                print("check_list", check_list);
                if (check_list.some(line => line == "")) {
                    print(`check_list is empty, try to extract from offset line`);
                    let extract_from = [];
                    result.forEach(track => {
                        let original = extract.find(ex => ex.text == track);
                        if (original) extract_from.push(original.o_index);
                    });
                    if (extract_from.length == result.length) {
                        let search_title = [];
                        let offset = 0;
                        while (offset < max_depth) {
                            offset++;
                            extract_from.forEach(o_index => search_title.push(newtext[o_index + offset]));
                            if (search_title.some(t => result.indexOf(t) != -1)) {
                                print("some offset title already in original list, list overlapped, abort");
                                break;
                            } else if (search_title.length == extract_from.length) {
                                let newlist = [];
                                search_title.forEach((st, st_index) => { newlist.push(result[st_index] + st); });
                                print("found newlist | ", search_title);
                                extract_result[result_index] = newlist;
                                break;
                            } else if (search_title.length != extract_from.length) {
                                print("2 list have different length, abort");
                                break;
                            }
                        }
                    }
                } else {
                    print("pass");
                }
            });
        }
        if (debug) console.groupEnd();
        return extract_result.length > 0 ? extract_result.sort((a, b) => b.length - a.length) : false;
    }

    function shiftCode(string = "") {
        let reg_fullwidth_code = /[\uFF01-\uFF63]/g;
        return string.replace(reg_fullwidth_code, match => String.fromCharCode(match.charCodeAt(0) - 0xFEE0)).replace(reg_muti_blank, " ").trim();
    }

    function removeExcessInTrackList(list, check_list = false) {
        if (!list) return false;
        let new_list = [];
        let have2index = /(\d+)\D+(\d+)/;
        let reglist = [
            reg_text_start,
            reg_non_word_at_start,
            reg_text_start,
        ];
        if (list.every(line => line.match(have2index))) reglist.splice(1, 0, /^\d+/);
        list.forEach(line => {
            print("====================");
            if (line.match(/[総].[^時間]*時間/)) return;
            let new_line = line.replace(reg_time, "");
            if (!new_line.match(/\d+/)) return print("no number left, abort");
            print(line);
            print(new_line);
            let c_index = container_start.indexOf(new_line[0]);
            if (c_index != -1 && new_line[new_line.length - 1] == container_end[c_index]) {
                new_line = new_line.slice(1, line.length - 1);
            }
            reglist.forEach(reg => {
                new_line = new_line.replace(reg, "").trim();
                print(new_line);
            });
            print(new_line);
            new_line = new_line.replace(reg_muti_blank, " ").trim();
            c_index = container_start.indexOf(new_line[0]);
            if (c_index != -1 && new_line[new_line.length - 1] == container_end[c_index]) {
                new_line = new_line.slice(1, line.length - 1);
            }

            if (check_list) {
                new_line = new_line
                    .replace(reg_muti_blank, "")
                    .replace(/\d+/, "").trim();
            }
            new_list.push(new_line);
        });
        return new_list;
    }

    function addTracklist(list, from, index = 0) {
        print("====================");
        print("raw list | ", list);
        let newlist = list;
        if (from != "Official") {
            newlist = removeExcessInTrackList(list);
            print("processed | ", newlist);
        }
        if (newlist.some(line => line == "")) return print("found empty line, abort");
        if (newlist.every(line => line.match(/^\d+/))) {
            newlist = newlist.sort((a, b) =>
                a.localeCompare(b,
                    navigator.languages[0] || navigator.language, {
                    numeric: true,
                })
            );
        }

        let pos = document.querySelector("[itemprop='description']");
        let textbox = document.createElement("textarea");
        let id = `dtr_tracklist${index}`;
        let box = Object.assign(document.createElement("div"), { className: "dtr_tracklist" });
        let textlist = [];
        newlist.forEach((line, index) => { textlist.push(`${index + 1}. ${line}`); });

        let row_count = textlist.length;
        let maxlength = Math.max(...textlist.map(t => getTrueLength(t)));
        textbox.value = textlist.join("\n");
        print("final | ", textlist);
        Object.assign(textbox, { id: id, rows: row_count + 1, cols: maxlength, });

        let copyall = Object.assign(document.createElement("button"), {
            textContent: "Copy All",
            onclick: () => { navigator.clipboard.writeText(document.getElementById(id).value); },
        });

        let span = newSpan(from);
        if (from != "Official") span.className = "dtr_setting_w_text";

        pos.insertAdjacentElement("afterbegin", box);
        appendAll(box, [textbox, newLine(), copyall, newLine(), span,]);
        box.insertAdjacentElement("afterend", newLine());

        function getTrueLength(string = "") {
            let length = 0;
            [...string].forEach(char => { length += char.match(/[\w\s_]/) ? 1 : 2; });
            return length;
        }
    }

    function gettracklist() {
        let list = document.querySelector(".work_tracklist");
        if (list) {
            let tracklist = [];
            list = list.querySelectorAll(".work_tracklist_item");
            list.forEach(ele => { tracklist.push(`${ele.querySelector(".title").textContent}`); });
            print("Official list | ", tracklist);
            return tracklist;
        } else {
            return false;
        }
    }

    function appendNewLine(ele) {
        ele.appendChild(document.createElement("br"));
    }

    function newLine() {
        return document.createElement("br");
    }

    function newSeparate() {
        return newSpan(` / `);
    }

    function newButton(btext, onclick) {
        let button = document.createElement("button");
        button.innerHTML = btext;
        button.onclick = onclick;
        return button;
    }

    function newDataButton(btext, format_string) {
        return newButton(btext, () => {
            updateSettingString("format_title_setting", format_string);
        });
    }

    function newCopyButton(copytext, btext = "") {
        return newButton(btext === "" ? copytext : btext, async () => {
            await navigator.clipboard.writeText(copytext);
        });
    }

    function newSpan(text = "", className = "dtr_textsize05") {
        let span = document.createElement("span");
        Object.assign(span, {
            className: className,
            textContent: text,
        });
        return span;
    }

    function myCss() {
        let s = document.createElement("style");
        s.className = "myCssSheet";
        document.head.appendChild(s);
        s.textContent = `
            .dtr_textsize05 {
                font-size: 0.5rem;
                vertical-align: middle;
            }

            .dtr_setting_box {
                border: 0.2rem;
                border-style: solid;
                padding: 0.5rem;
            }

            .dtr_setting_w_text {
                color: red;
            }

            .dtr_max_width {
                width: 100%;
            }

            .dtr_list_w_text {
                color: red;
                float: right;
            }

            .dtr_setting_ck_box {
                border: black 0.1rem solid;
                width: max-content;
                padding: 0.5rem;
            }

            .dtr_tracklist{
                display: inline-grid;
                margin: 1rem;
            }
        `;
    }

    function print(...any) {
        if (debug) console.log(`[dlsite title reformat] `, ...any);
    }
})();
