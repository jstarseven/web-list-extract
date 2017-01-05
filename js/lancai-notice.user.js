// ==UserScript==
// @name         My Fancy New Userscript
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        https://www.lancai.cn/about/notice.html
// @grant        none
// ==/UserScript==

//全局变量
//数据提交url
var submitMessUrl="http://127.0.0.1:8080/rzx-analyzer-control/task/submitMess.action";
//任务脚本
var taskJson=[];



setTimeout(function(){
    var items=$('#noticeList > li > div.about-list-content > div > a');
    alert('current elements size: '+items.length);
    for(var i=0;i<items.length;i++){
        alert($(items[i]).text());
    }
},3000);



/**
 * 提交任务数据
 * @param mess
 */
function submitMess(mess){
    $.ajax({
        type: "POST",
        url: submitMessUrl,
        data: mess,
        dataType: "jsonp",
        jsonp: "callbackparam",
        jsonpCallback: "success_jsonpCallback",
        async: true,
        cache: false,
        success: function (data) {
            console.log("message submit success");
        },
        error:function(){
            console.log("message submit fail");
        }
    });
}

