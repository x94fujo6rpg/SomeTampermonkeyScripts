# SomeTampermonkeyScripts  
some scripts I made  
click link to install  

|script|install|
|-|-|
|[ehx direct download](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#ehx-direct-download)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js)|
|[ehx link color](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#ehx-link-color)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_link_color.user.js)|
|[ehx torrent text](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#ehx-torrent-text)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_torrent_text.user.js)|
|[dlsite title reformat](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#dlsite-title-reformat)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/dlsite_title_reformat.user.js)|
|[mangaoh title reformat](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#mangaoh-title-reformat)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/mangaoh_title_reformat.user.js)|
|[pornhub user video](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#pornhub-user-video)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ph_user_video.user.js)|
|[youtube url normalizer](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#youtube-url-normalizer)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ytb_url_normalizer.user.js)|
|[prts redirector](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#prts-redirector)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/prts_redirector.user.js)|
|[sharer.pw auto click](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#sharerpw-auto-click)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/sharer-pw_auto_click.user.js)|
|[google drive auto click](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#google-drive-auto-click)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/google_drive_autoclick.user.js)|
|[reddit img relink](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#reddit-img-relink)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/reddit_img_relink.user.js)|
|[anti-bili-anti-copy](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts#anti-bili-anti-copy)|[raw](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/anti-bili-anti-copy.user.js)|

## [[ehx direct download]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js)  
**only work in Thumbnail mode**  

click button to enable (pervent too many requests)  
![](https://i.imgur.com/P3ZWFR8.png)

#### Features:

- #### Memory `downloaded / marked` galleries 
  - (when click `Archive Download` or use `mark/unmark gallery` under gallery)
  - change `downloaded / marked` gallery color to black (quick identify in list)
- #### Enable Archive Download / Sorting / Show torrents Title / Fix Event in Ttile
  - ##### add button under gallery:
    - archive download
    - copy title (auto replace forbidden characters `<>:"/|?*\` to full-width)
    - mark/unmark gallery
    - show gallery's torrent list in pure text
  - ##### sorting gallery
    - example: `(aaaaaaaa) [bbbbbbbb] cccccccc (dddddddd)`  
    - Title (ignore Prefix/Group/End) => `cccccccc`
    - Title (ignore Prefix/Group) => `cccccccc (dddddddd)`  
    - Title (ignore Prefix) => `[bbbbbbbb] cccccccc (dddddddd)`  
    - Title => `(aaaaaaaa) [bbbbbbbb] cccccccc (dddddddd)`  
    - Event => `(aaaaaaaa)`  
  - ##### fix/unfix event in title (auto enable by default)
    - search event prefix in `torrent` / `same title gallery` and add to title
    - if no 100% match found, try similarity search (disabled by default)
      - threshold (edit code if you have issue)
        ```js
        let sim_search_threshold = 0.6
        ```
    - priority: `title_jpn` > `title_en` > `torrent` > `same title gallery`
    - highlight prefix [(github doesn't support color in 2020...okay...)](https://github.com/github/markup/issues/369)
      - from torrents (![](https://via.placeholder.com/15/008000/000000?text=+) green)
      - from other gallery (![](https://via.placeholder.com/15/8A2BE2/000000?text=+) blueviolet)
    - some prefix will be ignore: (already categorized)
        ```
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
        ```
  - ##### options
    - sort order (descending by default)
    - auto copy title when download (enabled by default)
    - auto show pure text (enabled by default)
    - auto fix event in title (enabled by default)
  - ##### sort options
    - Numeric `Whether numeric collation should be used, such that "1" < "2" < "10"`
    - Ignore Punctuation
- #### Show Pure Text
  - add pure text title under gallery (full title)
- #### Jump To Nearest Downloaded (if any)
- #### other
  - make all gallery link open in new tab (pervent click on accident) 
  - make all gallery show entire title

### updates

- v0.99
  - fix some issue in `show torrent list`  
    - decode HTML text (like `&#039;`)
    - separate each line
  - disable similarity search by default  
    pre-processed title is good enough, and it seems that no match can pass the final test anyway  
    in some cases, even humans are confused  
    ```js
    //after pre-process they all will be "title" and match
    "[group] title (anime series)"
    "[group] title (different anime series)"
    "[group] title [uploader description]"
    "[group] title (uploader description)"
    "(some uploader description) title"

    //if not pre-process, these won't match
    "[group] title"
    "[group] title [uploader description]"
    "[group] title (anime series)"
    "title"
    ```
    maybe add similarity search result under gallery like `torrent list` for quick check in the future  

- v0.97
  - add mask test at end so that `oooAAooo` != `oooBBooo` even have high similarity

- v0.96
  - pre-process titles for compare instead of before every compare  

- v0.95  
  - improve similarity compare  
    - before compare:  
      - convert fullwidth to halfwidth  
      - convert to lower case  
      - remove all punctuation  

- v0.94
  - improve prefix search  
    - reduce unnecessary `data extract`  
    - reduce unnecessary `similarity compare`(very slow)  
    - fix some bug in similarity search
  - try prevent script's input element submit data  

- v0.91
  - improve prefix search  
    - try to compare every number in title, abort if not the same  

- v0.88
  - improve prefix search  
    - if no 100% match found, use similarity search and use highest one  

- v0.86
  - fixed buttons position, now they all line up

- v0.85
  - new feature `exclude gallery` (opacity = 0.1) by tag 
  - add/remove tag from exclude list under gallery (after enable `Show Exclude List`)
  - tag that already in the list will be red

- v0.84
  - add options for sorting

- v0.83
  - better event search (search in same en or same jpn title)

- v0.81
  - auto replace forbidden characters `<>:"/|?*\` to full-width when copy title

- v0.79
  - highlight prefix
    - from torrents (![](https://via.placeholder.com/15/008000/000000?text=+) green)
    - from other gallery (![](https://via.placeholder.com/15/8A2BE2/000000?text=+) blueviolet)  
      [(github doesn't support color in 2020...okay...)](https://github.com/github/markup/issues/369)  
  - fix text color when at eh

- v0.78
  - option for auto enable `Show Pure Text`

- v0.76
  - add option for auto enable `Fix/Unfix Event in Title`
  - now script save option settings

- v0.75
  - add option: auto copy title when click `Archive Download`  

- v0.74
  - show full title
  - ~~auto enable `Fix/Unfix Event in Title`~~ (optional v0.76)
  - add sort by `JP(Recommended)` & `EN` title
    (sort still have some bug...)

- v0.72 
  - use jpn prefix first
  - priority: title_jpn > title_en > torrent > same title gallery
  - add `copy title` button

- v0.71  
  - new feature `Fix/Unfix Event in Title` 
  - more sort option  
  - improve speed (send next request when current one complete)  

- v0.65 
  - natural sort  

- v0.63 
  - improve sorting (now sorting is based on previous sort result)  

- v0.61 
  - new feature `mark/unmark gallery`  
  - rearrange code  

- v0.55 
  - new feature `Jump To Nearest Downloaded` (if any)  
  - mark downloaded gallery color in black  
  - disable send request to server when click archive download  

- v0.53 
  - add more sort option  

- v0.51 
  - after enable `archive download` you can sort gallery (current page)  
  - show gallery's torrent title list in pure text  
  - make all gallery link open in new tab (pervent click on accident)  
  - check every few seconds that is gallery (current page) downloaded or not and change button status  

- v0.43 
  - now it will update the list when you click archive download in gallery page  
    add new features when click archive download in list view:  
    1. ~~send a request to server as you visited the gallery (not sure if this count)~~  
    2. add gallery link to history ([HTML5 API](https://developer.mozilla.org/en-US/docs/Web/API/History)) `trigger visited css style`

- v0.35 
  - list limit up to 10000  

- v0.32
  - switch from cookie to [Tampermonkey API storage](https://www.tampermonkey.net/documentation.php)  
  - if you use any [v0.30] or [v0.31] or you got [400 Bad request]  
    use cookie editor like EditThisCookie to remove all "exhddl_list"  

- v0.30 
  - now script save recent downloaded gallerys in a list and set button as downloaded if it in the list  
  - if reach the limit, it will delete the oldest data until lower the limit  

## [[ehx link color]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_link_color.user.js)  
change visited & unvisited link color  
if you don't like default color, change it to any valid CSS color you want  
```js
// unvisited link color
let enable_link = true;
let ex = "DeepPink";
let eh = "DeepPink";
// visited link color
let enable_visited = true;
let ex_v = "gray";
let eh_v = "gray";
```
because of the security risk, visited link color many not work in some browser  
see [https://dbaron.org/mozilla/visited-privacy](https://dbaron.org/mozilla/visited-privacy)  

v0.27 fix visited link color (work on chrome)

## [[ehx torrent text]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_torrent_text.user.js)  
click to copy torrent name in torrent page  
event is from first parentheses in the name, may not correct  
auto close window after copy  
if you don't want it close, set this value to false  
```js
let autoclose = true;
``` 

## [[dlsite title reformat]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/dlsite_title_reformat.user.js)  

#### Features:
  - remove title link
  - remove excess text
  - custom title format
  - auto convert forbidden characters `<>:"/|?*\` to fullwidth 
  - add copy button for data
  - extract track list (experimental)
    - #### Still have many bugs
    - official (example: RJ298079)
    - search offset line
    - remove time info
    - remove excess white space
    - sort (only if official list is out of order and have 2nd index in title)
    - example: RJ237403
      ```
      1.track3 cccc
      2.track1 aaaa
      3.track2 bbbb

      convert to

      1 aaaa
      2 bbbb
      3 cccc
      ```

click button to copy  
![](https://i.imgur.com/kdsvTit.jpg)  

- v0.62
  - improved track list extract
  - list now use natural sort
  
- v0.61
  - now script will try to extract track list form entire page  
    Less accurate.  
    Can't get the track that has no number.  

- v0.58
  - improved excess string removal
  - fix track list position

- v0.56
  - add more settings  
  - script now trigger faster (don't have to wait for the page to fully load)  

- v0.53
  - add support to `search result` / `circle` page  
  - this doesn't support custom title because data is incomplete  
  - also grid view is too tight to put more buttons  

- v0.51 
  - add copy button for each data  

- v0.48 
  - fix some issue in getData  

- v0.45 
  - rearrange buttons (use less space)  
  - now old buttons only appear when:  
    original != custom  
    default_format != original & default_format != custom  

- v0.38 
  - now title can be custom to any format you want  

## [[mangaoh title reformat]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/mangaoh_title_reformat.user.js)  
reformat date & title in search result  
click button to copy  
![](https://i.imgur.com/amKQlOX.jpg)  

## [[reddit img relink]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/reddit_img_relink.user.js)  
**only work for New UI**  
show images direct link under title (only resized images)  
![](https://i.imgur.com/pw1fW6X.jpg)  

## [[pornhub user video]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ph_user_video.user.js)  
- video page  
  - replace `user link` to `user video list`, except comment  
    it will try to go to ```user/videos/public``` first  
    if it doesn't exist, auto redirect to ```user/videos```  
  - add a button to copy link of current page  

- user video list  
  - add checkbox for each video and a textbox on top to select and copy links  
  - make upload time visable  
  - [effect](https://i.imgur.com/lL6sJZX.png)  

## [[anti-bili-anti-copy]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/anti-bili-anti-copy.user.js)  
remove bilibili article copy protection  

## [[youtube url normalizer]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ytb_url_normalizer.user.js)
normalize url in video description  
remove miniplayer (still activated when you watch in playlist)  

## [[prts redirector]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/prts_redirector.user.js)
Arknights Wiki PRTS  
auto redirect & replace all link to desktop version  

## [[sharer.pw auto click]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/sharer-pw_auto_click.user.js)  
auto click and redirect to download link immediately  

## [[google drive auto click]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/google_drive_autoclick.user.js)
auto skip & click download
