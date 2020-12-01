# SomeTampermonkeyScripts  
some scripts I made  
click link to install  

## [[ehx direct download]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js)  
**only work in Thumbnail mode**  

click button to enable (pervent too many requests)  
![](https://i.imgur.com/05KQrh6.png)

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
    - search event prefix in `torrent / same title gallery` and add to title
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

## [[mangaoh title reformat]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/mangaoh_title_reformat.user.js)  
reformat date & title in search result  
click button to copy  
![](https://i.imgur.com/amKQlOX.jpg)  

## [[dlsite title reformat]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/dlsite_title_reformat.user.js)  
remove title link / remove excess text / custom title format  
automatic convert forbidden characters `<>:"/|?*\` to fullwidth  
click button to copy  
![](https://i.imgur.com/kdsvTit.jpg)  

v0.56: add more settings  
script now trigger faster (don't have to wait for the page to fully load)  

v0.53: add support to `search result` / `circle` page  
this doesn't support custom title because data is incomplete  
also grid view is too tight to put more buttons  

v0.51: add copy button for each data  

v0.48: fix some issue in getData  

v0.45: rearrange buttons (use less space)  
now old buttons only appear when:  
original != custom  
default_format != original & default_format != custom  

v0.41: ~~add old button back, edit code to enable / disable~~ (add setting in v0.56)  

v0.38: now can be custom to any format you want  
~~chagne separator in code~~ (add setting in v0.56)  

## [[reddit img relink]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/reddit_img_relink.user.js)  
**only work for New UI**  
show images direct link under title (only resized images)  
![](https://i.imgur.com/pw1fW6X.jpg)  

## [[ph_user_video]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ph_user_video.user.js)
pornhub  
in video page  
replace `user link` to `user video list`, except comment  
it will try to go to ```user/videos/public``` first  
if it doesn't exist, auto redirect to ```user/videos```  
add a button to copy link of current page  

in user video list  
add checkbox for each video and a textbox on top to select and copy links  

make upload time visable  
[effect](https://i.imgur.com/lL6sJZX.png)  

## [[anti-bili-anti-copy]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/anti-bili-anti-copy.user.js)  
remove bilibili article copy protection  

## [[youtube url normalizer]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ytb_url_normalizer.user.js)
normalize url in video description  
remove miniplayer (still activated when you watch in playlist)  

## [[prts redirector]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/prts_redirector.user.js)
Arknights Wiki PRTS  
auto redirect to desktop version  

## [[sharer.pw auto click]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/sharer-pw_auto_click.user.js)  
auto click and redirect to download link immediately  
