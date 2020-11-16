// ==UserScript==
// @name         dlsite title reformat
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/dlsite_title_reformat.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/dlsite_title_reformat.user.js
// @version      0.51
// @description  remove title link / remove excess text / custum title format / click button to copy
// @author       x94fujo6
// @match        https://www.dlsite.com/maniax/work/=/product_id/*
// @match        https://www.dlsite.com/home/work/=/product_id/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

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
    let key_format = "format_seting";
    let key_adv = "format_adv";
    let default_format = "%id% %title_formatted%";
    let default_adv = false;
    let updateid;

    let half = "1234567890()[]{}~!@#$%^&_+-=;':,.()~";
    let full = "１２３４５６７８９０（）［］｛｝～！＠＃＄％︿＆＿＋－＝；’：，．（）〜";
    let forbidden = `<>:"/|?*\\`;
    let replacer = `＜＞：”／｜？＊＼`;

    let separator = "、"; // separator for data like %tags%
    let oldUI_original_title = true; // Original / ID+Original button
    let oldUI_default_format_title = true; // DefaultFormat / ID+DefaultFormat button

    let format_setting = GM_getValue(key_format, default_format);
    print(`${key_format}: ${format_setting}`);

    let adv = GM_getValue(key_adv, default_adv);
    print(`${key_adv}: ${adv}`);

    window.onload = function () {
        window.document.body.onload = main();
    };

    function saveSetting() {
        GM_setValue(key_adv, adv);
        print(`saved ${key_adv}: ${adv}`);
        if (format_setting.length > 0) {
            GM_setValue(key_format, format_setting);
            print(`saved ${key_format}: ${format_setting}`);
        } else {
            print(`${key_format} not saved cus is empty`);
        }
    }

    function getData() {
        console.time(getData.name);
        //------------------------------------------------------
        let sitedata = contents.detail[0];
        let [Y, m, d] = sitedata.regist_date.split("/");
        let y = Y.slice(2);
        let circle = document
            .getElementById("work_maker")
            .querySelector("span.maker_name[itemprop='brand']");
        let circle_text = circle.querySelector("a").textContent;
        circle.insertAdjacentElement("afterbegin", newCopyButton(circle_text, "Copy"));
        Object.assign(formatted_data, {
            id: sitedata.id,
            title_original: sitedata.name,
            title_formatted: stringFormatter(sitedata.name),
            circle: stringFormatter(circle_text),
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
                    th.parentNode.querySelectorAll("a").forEach(a => all.push(a.textContent));
                    formatted_data[key] = stringFormatter(all.join(separator));
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
        let tagpart = document
            .getElementById("work_right_inner")
            .querySelector("div.main_genre");
        let insertpos = tagpart;
        tagpart = tagpart.querySelectorAll("a");
        let tags = [];
        tagpart.forEach(a => tags.push(a.textContent));
        formatted_data.tags = stringFormatter(tags.join(separator));
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
        if (!data) {
            if (list.some(t => text.includes(t))) return true;
        }
        return false;
    }

    function stringFormatter(text) {
        text = removeExcess(text);
        text = toHalfWidth(text);
        text = repalceForbiddenChar(text);
        return text;
    }

    function removeExcess(text) {
        // remove excess text 【...】
        let count = 0;
        while (text.indexOf("【") != -1 && count < 999) {
            let start = text.indexOf("【");
            let end = text.indexOf("】") + 1;
            let removestr = "";
            if (end) {
                removestr = text.substring(start, end);
            } else {
                removestr = text.slice(start);
            }
            text = text.replace(removestr, "").trim();
            count++;
        }
        // remove『』if it at start & end
        if (text.indexOf("『" === 0 && text.indexOf("』") === text.length - 1)) {
            text = text.replace("『", "").replace("』", "").trim();
        }
        return text;
    }

    function toHalfWidth(text) {
        for (let index in half) {
            let h = half[index];
            let f = full[index];
            let count = 0;
            while (text.indexOf(f) != -1 && count < 999) {
                text = text.replace(f, h);
                count++;
            }
        }
        return text;
    }

    function repalceForbiddenChar(text) {
        for (let index in forbidden) {
            let fb = forbidden[index];
            let rp = replacer[index];
            let count = 0;
            while (text.indexOf(fb) != -1 && count < 999) {
                text = text.replace(fb, rp);
                count++;
            }
        }
        return text;
    }

    function updateSetting() {
        let s = document.getElementById("format_title_setting");
        let p = document.getElementById("format_title_preview");
        let cs = document.getElementById("format_title_custom_span");
        let cb = document.getElementById("format_title_custom_button");
        if (s.value.length > 0) {
            if (format_setting != s.value) {
                format_setting = s.value;
                let formatted = parseFormatString(format_setting);
                cs.textContent = p.value = formatted;
                cb.onclick = () => navigator.clipboard.writeText(formatted);
            }
        }
    }

    function parseFormatString(string = "") {
        let formatted_text = string;
        data_list.forEach(key => {
            let count = 0;
            while (formatted_text.includes(`%${key}%`) && count < 999) {
                formatted_text = formatted_text.replace(`%${key}%`, formatted_data[key]);
                count++;
            }
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
            textContent: "open format setting",
            value: "open",
            onclick: function () {
                let ele = document.getElementById("format_setting_ui");
                if (this.value === "close") {
                    ele.style.display = "none";
                    this.value = "open";
                    this.textContent = "open format setting";
                    clearInterval(updateid);
                } else {
                    ele.style.display = "";
                    this.value = "close";
                    this.textContent = "close format setting";
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
        //------------------------------------------------------
        button = document.createElement("button");
        let mode = adv ? "on" : "off";
        Object.assign(button, {
            className: "dtr_textsize05",
            id: "format_title_setting_advance_model",
            textContent: `advance mode: ${mode}`,
            value: mode,
            onclick: function () {
                let t = document.getElementById("format_title_setting");
                if (this.value === "off") {
                    Object.assign(this, {
                        value: "on",
                        textContent: "advance mode: on",
                    });
                    t.readOnly = false;
                    adv = true;
                } else {
                    Object.assign(this, {
                        value: "off",
                        textContent: "advance mode: off",
                    });
                    t.readOnly = true;
                    adv = false;
                }
            }
        });
        box.appendChild(button);
        box.appendChild(newSpan(" (enable this to direct edit format setting. if you don't know what is this, don't touch it.)"));
        appendNewLine(box);
        appendNewLine(box);
        //------------------------------------------------------
        data_list.forEach(s => box.appendChild(newDataButton(`+${s}`, `%${s}%`)));
        appendNewLine(box);
        //------------------------------------------------------
        let textarea;
        textarea = document.createElement("textarea");
        Object.assign(textarea, {
            className: "dtr_textsize05 dtr_max_width",
            id: "format_title_setting",
            rows: 1,
            value: format_setting,
        });
        textarea.readOnly = !adv;
        box.appendChild(newSpan("format setting:"));
        appendNewLine(box);
        box.appendChild(textarea);
        appendNewLine(box);

        textarea = document.createElement("textarea");
        Object.assign(textarea, {
            className: "dtr_textsize05 dtr_max_width",
            id: "format_title_preview",
            readOnly: true,
            rows: 1,
            value: parseFormatString(format_setting),
        });
        box.appendChild(newSpan("format preview:"));
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

    function newButton(btext, onclick) {
        let _button = document.createElement("button");
        Object.assign(_button, {
            textContent: btext,
            onclick: onclick,
        });
        return _button;
    }

    function newDataButton(btext, format_string) {
        return newButton(btext, () => {
            updateSettingString("format_title_setting", format_string);
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

    function main() {
        getData();
        myCss();
        setting();
        console.time(main.name);
        //------------------------------------------------------
        let pos = document.querySelector("#work_name").querySelector("a");
        pos.style.display = "none";
        pos = pos.parentNode;

        let id = formatted_data.id;
        let title_o = formatted_data.title_original;
        let title_f = formatted_data.title_formatted;
        let title_id_c = parseFormatString(format_setting);
        let title_id_o = `${id} ${title_o}`;
        let title_id_f = `${id} ${title_f}`;
        let notSame_o_c = title_id_o != title_id_c;
        let notSame_f_c_o = title_id_f != (title_id_c || title_id_o);
        //------------------------------------------------------
        // ID + original title
        if (notSame_o_c && oldUI_original_title) {
            pos.append(newSpan(title_id_o, ""));
            appendNewLine(pos);
        }
        //------------------------------------------------------
        // ID + formatted title
        if (notSame_f_c_o && oldUI_default_format_title) {
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
        // add copy custom format button
        let custom_button = newCopyButton(title_id_c, "Custom");
        custom_button.id = "format_title_custom_button";
        pos.append(custom_button);
        pos.append(newSeparate());
        //------------------------------------------------------   
        // add copy Original / ID+Original button
        if (notSame_o_c && oldUI_original_title) {
            pos.append(newCopyButton(title_o, "Original"));
            pos.append(newCopyButton(title_id_o, "ID+Original"));
        }
        //------------------------------------------------------
        // add copy Formatted / ID+Formatted button
        if (notSame_f_c_o && oldUI_default_format_title) {
            pos.append(newSeparate());
            pos.append(newCopyButton(title_f, "DefaultFormat"));
            pos.append(newCopyButton(title_id_f, "ID+DefaultFormat"));
        }
        //------------------------------------------------------
        // creat track list if any
        let list = gettracklist();
        if (list) addTracklist(list);
        console.timeEnd(main.name);
    }

    function addTracklist(list) {
        let pos = document.querySelector("[itemprop='description']").childNodes[2];
        let textbox = document.createElement("textarea");
        let count = 0;
        let maxlength = 0;
        list.forEach(line => {
            textbox.value += `${line}\n`;
            count++;
            if (line.length > maxlength) maxlength = line.length;
        });
        Object.assign(textbox, {
            name: "mytracklist",
            rows: count + 1,
            cols: maxlength * 2,
        });
        pos.insertAdjacentElement("afterbegin", textbox);
        let copyall = document.createElement("button");
        copyall.textContent = "Copy All";
        copyall.onclick = function () {
            textbox.select();
            textbox.setSelectionRange(0, 99999);
            document.execCommand("copy");
        };
        textbox.insertAdjacentElement("afterend", newLine());
        textbox.insertAdjacentElement("afterend", copyall);
        textbox.insertAdjacentElement("afterend", newLine());
    }

    function gettracklist() {
        let list = document.querySelector(".work_tracklist");
        if (list) {
            let tracklist = [];
            list = list.querySelectorAll(".work_tracklist_item");
            list.forEach((ele, index) => {
                tracklist.push(`${index + 1}. ${ele.querySelector(".title").textContent}`);
            });
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
        return newSpan(" / ");
    }

    function newCopyButton(copytext, btext = "") {
        if (btext === "") {
            return newButton(copytext, () => {
                navigator.clipboard.writeText(copytext);
            });
        } else {
            return newButton(btext, () => {
                navigator.clipboard.writeText(copytext);
            });
        }
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
            }

            .dtr_setting_box {
                border: 0.2rem;
                border-style: solid;
                padding: 0.5rem;
            }

            .dtr_max_width {
                width: 100%;
            }
        `;
    }

    function print(...any) {
        if (debug) console.log(...any);
    }
})();