// ==UserScript==
// @name         nexusmods skip countdown
// @namespace    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts
// @updateURL    https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/nexusmods_skip_countdown.user.js
// @downloadURL  https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/nexusmods_skip_countdown.user.js
// @version      0.1
// @description  no countdown & auto start download
// @author       x94fujo6
// @match        https://www.nexusmods.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    window.onload = checkURL();

    function checkURL() {
        // https://www.nexusmods.com/*/mods/*tab=files&file_id=*
        if (window.location.href.match(/www\.nexusmods\.com\/.*\/mods\/\d+\?tab=files&file_id=\d+/)) direct_download();
    }

    function direct_download() {
        let game_id = window.current_game_id;
        let file_id = window.location.href.match(/file_id=(\d+)/);
        if (!game_id) return console.log("game_id not found");
        if (!file_id) return console.log("file_id not found");
        file_id = file_id[1];

        $('.subheader, .table').hide();
        $('.donation-wrapper').show();

        $.ajax({
            type: "POST",
            url: "/Core/Libs/Common/Managers/Downloads?GenerateDownloadUrl",
            data: {
                fid: file_id,
                game_id: game_id,
            },
            success: function (data) {
                if (data && data.url) {
                    console.log('Success');
                    window.location.href = data.url;
                    $('.donation-wrapper > p').html(`<p>Your download has started</p><p>If you are having trouble, <a href="${data.url}">click here</a> to download manually</p>`);
                } else {
                    setError();
                }
            },
            error: function () {
                setError();
            }
        });
    }

    function setError() {
        console.log('An error occurred');
        $('.donation-wrapper > p').html('<p>Unfortunately an error occurred while downloading this file</p><p>Please try again later or contact support</p>');
    }
})();
