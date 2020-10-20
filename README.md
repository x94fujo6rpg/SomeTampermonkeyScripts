# SomeTampermonkeyScripts  
some scripts I use  
click link to install  

[[anti-bili-anti-copy]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/anti-bili-anti-copy.user.js)  
remove bilibili article copy protection  

[[ehx direct download]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_direct_download.user.js)  
**only work in Thumbnail mode**  
add button for each gallery in list view to use archive download directly  
because there is a limit on how many requests you can send at once  
this need some time to process  
~~warning: don't open new page rapidly when you using this, it may trigger api limit protection~~  
now you have to click button to enable it (pervent too many requests)  

v0.30: now it save recent downloaded gallerys in a list and set button as downloaded if it in list  
the number of the list can save is about 450  
if reach the limit, it will delete the oldest data until lower the limit  
~~note: ex and eh cookie is separate~~(see below)  

v0.31: ~~fix cookie path~~  
~~if you got [400 Bad request], use cookie editor like EditThisCookie to remove all "exhddl_list"~~  

v0.32 switch from cookie to [Tampermonkey API storage](https://www.tampermonkey.net/documentation.php)  
if you use any [v0.30] or [v0.31] or you got [400 Bad request] 
use cookie editor like EditThisCookie to remove all "exhddl_list"  

[[ehx link color]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_link_color.user.js)  
change e-hentai/exhentai visited & unvisited link color  
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

[[ehx torrent text]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/ehx_torrent_text.user.js)  
click to copy torrent name in torrent page  
event is from first parentheses in the name, may not correct  
auto close window after copy  
if you don't want it close, set this value to false  
```js
let autoclose = true;
``` 

[[mangaoh title reformat]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/mangaoh_title_reformat.user.js)  
reformat date & title in search result  
click button to copy  
![](https://i.imgur.com/amKQlOX.jpg)  

[[dlsite title reformat]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/dlsite_title_reformat.user.js)  
remove title link / remove excess text  
click button to copy  
![](https://i.imgur.com/1IEqFnA.jpg)  

[[reddit img relink]](https://github.com/x94fujo6rpg/SomeTampermonkeyScripts/raw/master/reddit_img_relink.user.js)  
**only work for New UI**  
show images direct link under title (only resized images)  
![](https://i.imgur.com/pw1fW6X.jpg)  