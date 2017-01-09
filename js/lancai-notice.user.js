// ==UserScript==
// @name         Web-Source-Extract
// @namespace    http://your.homepage/
// @version      0.1
// @description  针对网页列表做数据翻页提取
// @author       jstarseven
// @match        https://www.lancai.cn/about/notice.html
// @grant        none
// ==/UserScript==

//全局变量
//数据提交url
var submitMessUrl = "http://127.0.0.1:8080/rzx-analyzer-control/task/submitMess.action";

var task_json = {
    "type": "list",
    "selector": "ul#noticeList > li",
    "max_page": 8,
    "page_selector": "#noticeListContent > div.media-page-box.clearfix.media-page.pull-right > a.pageTurnNext",
    "iframe_selector": "",
    "datas": [
        {
            "selector": " div.about-list-content  >  div.about-list-heading ",
            "column": "title",
            "from": "text",
            "iframe_selector": "",
            "open_tab": []
        },
        {
            "selector": " div.about-list-content  >  p:nth-child(2) ",
            "column": "content",
            "from": "text",
            "iframe_selector": ""
        },
        {
            "selector": " div.about-list-content  >  p:nth-child(3)  >  span.pull-right ",
            "column": "time",
            "from": "text",
            "iframe_selector": ""
        }
    ]
};

createPseudoStyle('surfilter_inject_mouse_css', "plum");

var timer = setInterval(function () {
    var cur_page = sessionStorage.getItem("cur_page");
    if (!isNullParam(cur_page) && cur_page > task_json.max_page) {
        clearInterval(timer);
        return;
    }
    new analyzerJson(task_json).executor();
}, 3000);


//创建伪元素样式Pseudo Element style
function createPseudoStyle(styleName, back_color) {
    var style = document.createElement("style");
    style.innerHTML =
        '.' + styleName + '{position:relative;} ' +
        '.' + styleName + ':after{' +
        'position:absolute;' +
        'pointer-events:none;' +
        'left:0px;top:0px;' +
        'display:inline-block;' +
        'margin:-2px;width:100%;' +
        'height:100%;' +
        'border:dashed 2px #FF69B4;' +
        'background:' + back_color + ';' +
        'opacity:0.25;' +
        'content:" ";' +
        '}';
    document.head.appendChild(style);
    return style;
}

/**
 * 提交任务数据
 * @param mess
 */
function submitMess(mess) {
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
        error: function () {
            console.log("message submit fail");
        }
    });
}


//脚本动作action

/**
 * 抽取元素数据信息进行处理
 * @param item
 * @param element
 * @returns {string}
 */
function extractDeal(item, element) {
    var from = item.from;
    var content = '';
    if (isNullParam(from) || "text" == from)
        content = $(element).text();
    if ("html" == from)
        content = $(element).html();
    console.log(new Date() + ":extract data success < " + content + " >");
    return content;
}

/**
 * 列表数据提取
 * @param list_start
 * @param action
 */
function analyzerJson(task_json) {
    if (isNullParam(task_json.type) || "list" != task_json.type) {
        console.log(new Date() + ":json type is null");
        return;
    }
    if (isNullParam(task_json.selector)) {
        console.log(new Date() + ":list selector is null");
        return;
    }
    if (isNullParam(task_json.datas)) {
        console.log(new Date() + ":list datas is null");
        return;
    }
    this.type = task_json.type;
    this.selector = task_json.selector;
    this.max_page = task_json.max_page;
    this.page_selector = task_json.page_selector;
    this.iframe_selector = task_json.iframe_selector;
    this.datas = task_json.datas;
    this.executor = function () {
        var list_all, page_ele;
        if (!isNullParam(this.page_selector))
            page_ele = document.querySelectorAll(this.page_selector);
        if (isNullParam(this.iframeselector)) {
            list_all = document.querySelectorAll(this.selector);
        } else {//元素存在于iframe中
            list_all = document.querySelector(this.iframeselector).contentWindow.document.querySelectorAll(this.selector);
        }
        var cur_page = isNullParam(sessionStorage.getItem("cur_page")) ? 1 : Number(sessionStorage.getItem("cur_page"));
        console.log(new Date() + "start extract " + cur_page + " data");
        for (var i = 0; i < list_all.length; i++) {
            var data_items = this.datas, list_item_ele = list_all[i], list_item = {};
            var list_item_key = cur_page + "-" + this.selector + "-" + i;
            for (var j = 0; j < data_items.length; j++) {
                var item_sel = data_items[j].selector, item_col = data_items[j].column;
                var item_ifr_sel = data_items[j].iframe_selector, item_open_type = data_items[j].open_tab;
                var datas_item_ele = $(list_item_ele).find(item_sel);
                if (!isNullParam(item_ifr_sel))
                    datas_item_ele = document.querySelector(item_ifr_sel).contentWindow.document.querySelectorAll(item_sel);
                list_item[item_col] = extractDeal(data_items[j], datas_item_ele);
                if (!isNullParam(item_open_type))
                    newTabAction(datas_item_ele, list_item_key, item_open_type).executor();
            }
            addTaskDataMap(list_item_key, list_item);
        }
        //添加选中样式
        $(this.selector).addClass("surfilter_inject_mouse_css");
        console.log(new Date() + "end extract " + cur_page + " data");
        //点击跳转下一页
        if (!isNullParam(page_ele)) {
            sessionStorage.setItem("cur_page", cur_page + 1);
            $(this.page_selector).simulate('click');
        }
    };
}

/**
 * 新建标签
 * @param open_sel
 * @param open_get
 */
function newTabAction(click_ele, list_item_key, open_type) {
    this.executor = function () {
        //开新标签提取数据
        if (isNullParam(click_ele) || isNullParam(list_item_key) || isNullParam(open_type))
            return;
        //模拟点击打开新标签
        click_ele.setAttribute('target', '_blank');
        //将新标签selector信息放入localstorage中
        var config = {
            "cur_key": list_item_key,
            "cur_opentab": open_type
        };
        localStorage.setItem("cur_config", JSON.stringify(config));
        click_ele.click();
    };
}


/**
 *获取当前任务配置信息
 */
function getTaskDataMap() {
    var data_maps = localStorage.getItem("data_maps");
    //debugger;
    var datas = new Map();
    if (isNullParam(data_maps)) {
        data_maps = datas;
    } else {
        datas.elements = JSON.parse(data_maps).elements;
        return datas;
    }
    return data_maps;
}

/**
 *清空当前任务配置信息
 */
function clearTaskDataMap() {
    localStorage.setItem("data_maps", "");
}

/**
 * 当前任务添加配置信息
 * @param step_id  脚本步骤id
 * @param config   [doms,json]
 */
function addTaskDataMap(key, values) {
    if (isNullParam(key) || isNullParam(values))
        return;
    var data_maps = getTaskDataMap();
    data_maps.put(key, values);
    localStorage.setItem("data_maps", JSON.stringify(data_maps));
}

//-------------------------------------------------------------------------------------------------------------------------------------
/**
 * Created by jstarseven on 2016/4/6.
 * 前端js基本函数库
 */

/**
 * 暂停函数
 * @param d
 */
function sleep(d) {
    for (var t = Date.now(); Date.now() - t <= d;);
}

//判断对象属性值是否有空值
function hasPropertiesNull(param) {
    var values;
    for (var name in param) {
        values = param[name];
        if (values == "" || null == values || values == undefined) {
            return true;
        }
    }
    return false;
}
//判断对象属性值是否有空值
function isNullObject(param) {
    var values;
    for (var name in param) {
        values = param[name];
        if (values != "" && null != values && values != undefined) {
            return false;
        }
    }
    return true;
}
//判断参数值是否是空值
function isNullParam(param) {
    return !!(param == "" || null == param || param == undefined);

}
//判断参数值是否是数字
function isNumber(param) {
    if (isNullParam(param))
        return false;
    return /^[0-9]+.?[0-9]*$/.test(param);
}
//获取对象属性值
function displayProp(obj) {
    var names = "";
    for (var name in obj) {
        names += name + ": " + obj[name] + ", ";
    }
    alert(names);
}
//获取url参数
function getUrlParamValue(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}
/**
 * paramObj 将要转为URL参数字符串的对象
 * key URL参数字符串的前缀
 * encode true/false 是否进行URL编码,默认为true
 * js实现
 * return URL参数字符串
 */
var urlEncode = function (paramObj, key, encode) {
    if (paramObj == null) return "";
    var paramStr = "";
    var t = typeof (paramObj);
    if (t == "string" || t == "number" || t == "boolean") {
        paramStr += "&" + key + "=" + ((encode == null || encode) ? encodeURIComponent(paramObj) : paramObj);
    } else {
        for (var i in paramObj) {
            var k = key == null ? i : key + (paramObj instanceof Array ? "[" + i + "]" : "." + i);
            paramStr += urlEncode(paramObj[i], k, encode);
        }
    }
    return paramStr;
};
// 将js对象转转成url jquery实现
var parseParam = function (paramObj, key) {
    var paramStr = "";
    if (paramObj instanceof String || paramObj instanceof Number || paramObj instanceof Boolean) {
        paramStr += "&" + key + "=" + encodeURIComponent(paramObj);
    } else {
        $.each(paramObj, function (i) {
            var k = key == null ? i : key + (paramObj instanceof Array ? "[" + i + "]" : "." + i);
            paramStr += "&" + parseParam(this, k);
        });
    }
    return paramStr.substr(1);
};
// 获取url参数封装成对象
function GetUrlParam() {

    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    var strs;
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURIComponent((strs[i].split("=")[1]));
        }
    }
    return theRequest;
}
//删除数组中指定位置的元素 调用方式a=a.del(n)
Array.prototype.del = function (n) {
    if (n < 0)
        return this;
    else
        return this.slice(0, n).concat(this.slice(n + 1, this.length));
};
//在数组指定位置插入 调用方式a.insert(n)
Array.prototype.insert = function (index, item) {
    if (index < 0)
        return this;
    else
        return this.splice(index, 0, item);
};
//判断数组中是否包含指定字符串
Array.prototype.containVal = function (needle) {
    for (var i in this) {
        if (this[i] == needle) return i;
    }
    return false;
};

/*   
 * MAP对象，实现MAP功能   
 *   
 * 接口：   
 * size()     获取MAP元素个数   
 * isEmpty()    判断MAP是否为空   
 * clear()     删除MAP所有元素   
 * put(key, value)   向MAP中增加元素（key, value)    
 * remove(key)    删除指定KEY的元素，成功返回True，失败返回False   
 * get(key)    获取指定KEY的元素值VALUE，失败返回NULL   
 * element(index)   获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL   
 * containsKey(key)  判断MAP中是否含有指定KEY的元素   
 * containsValue(value) 判断MAP中是否含有指定VALUE的元素   
 * values()    获取MAP中所有VALUE的数组（ARRAY）   
 * keys()     获取MAP中所有KEY的数组（ARRAY）   
 */
function Map() {
    this.elements = [];

    //获取MAP元素个数     
    this.size = function () {
        return this.elements.length;
    };

    //判断MAP是否为空     
    this.isEmpty = function () {
        return (this.elements.length < 1);
    };

    //删除MAP所有元素     
    this.clear = function () {
        this.elements = [];
    };

    //向MAP中增加元素（key, value)      
    this.put = function (_key, _value) {
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == _key) {
                this.elements[i].value = _value;
                return;
            }
        }
        this.elements.push({
            key: _key,
            value: _value
        });
    };

    //删除指定KEY的元素，成功返回True，失败返回False     
    this.remove = function (_key) {
        var bln = false;
        try {
            for (var i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    this.elements.splice(i, 1);
                    return true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //获取指定KEY的元素值VALUE，失败返回NULL     
    this.get = function (_key) {
        try {
            for (var i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    return this.elements[i].value;
                }
            }
        } catch (e) {
            return null;
        }
    };

    //获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL     
    this.element = function (_index) {
        if (_index < 0 || _index >= this.elements.length) {
            return null;
        }
        return this.elements[_index];
    };

    //判断MAP中是否含有指定KEY的元素     
    this.containsKey = function (_key) {
        var bln = false;
        try {
            for (var i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //判断MAP中是否含有指定VALUE的元素     
    this.containsValue = function (_value) {
        var bln = false;
        try {
            for (var i = 0; i < this.elements.length; i++) {
                if (this.elements[i].value == _value) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //获取MAP中所有VALUE的数组（ARRAY）     
    this.values = function () {
        var arr = [];
        for (var i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].value);
        }
        return arr;
    };

    //获取MAP中所有KEY的数组（ARRAY）     
    this.keys = function () {
        var arr = [];
        for (var i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].key);
        }
        return arr;
    };

}


/*!
 * jQuery Simulate v@VERSION - simulate browser mouse and keyboard events
 * https://github.com/jquery/jquery-simulate
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: @DATE
 */

;(function ($, undefined) {

    var rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|contextmenu)|click/;

    $.fn.simulate = function (type, options) {
        return this.each(function () {
            new $.simulate(this, type, options);
        });
    };

    $.simulate = function (elem, type, options) {
        var method = $.camelCase("simulate-" + type);

        this.target = elem;
        this.options = options;

        if (this[method]) {
            this[method]();
        } else {
            this.simulateEvent(elem, type, options);
        }
    };

    $.extend($.simulate, {

        keyCode: {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        },

        buttonCode: {
            LEFT: 0,
            MIDDLE: 1,
            RIGHT: 2
        }
    });

    $.extend($.simulate.prototype, {

        simulateEvent: function (elem, type, options) {
            var event = this.createEvent(type, options);
            this.dispatchEvent(elem, type, event, options);
        },

        createEvent: function (type, options) {
            if (rkeyEvent.test(type)) {
                return this.keyEvent(type, options);
            }

            if (rmouseEvent.test(type)) {
                return this.mouseEvent(type, options);
            }
        },

        mouseEvent: function (type, options) {
            var event, eventDoc, doc, body;
            options = $.extend({
                bubbles: true,
                cancelable: (type !== "mousemove"),
                view: window,
                detail: 0,
                screenX: 0,
                screenY: 0,
                clientX: 1,
                clientY: 1,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button: 0,
                relatedTarget: undefined
            }, options);

            if (document.createEvent) {
                event = document.createEvent("MouseEvents");
                event.initMouseEvent(type, options.bubbles, options.cancelable,
                    options.view, options.detail,
                    options.screenX, options.screenY, options.clientX, options.clientY,
                    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
                    options.button, options.relatedTarget || document.body.parentNode);

                // IE 9+ creates events with pageX and pageY set to 0.
                // Trying to modify the properties throws an error,
                // so we define getters to return the correct values.
                if (event.pageX === 0 && event.pageY === 0 && Object.defineProperty) {
                    eventDoc = event.relatedTarget.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    Object.defineProperty(event, "pageX", {
                        get: function () {
                            return options.clientX +
                                ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                                ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                        }
                    });
                    Object.defineProperty(event, "pageY", {
                        get: function () {
                            return options.clientY +
                                ( doc && doc.scrollTop || body && body.scrollTop || 0 ) -
                                ( doc && doc.clientTop || body && body.clientTop || 0 );
                        }
                    });
                }
            } else if (document.createEventObject) {
                event = document.createEventObject();
                $.extend(event, options);
                // standards event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ff974877(v=vs.85).aspx
                // old IE event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ms533544(v=vs.85).aspx
                // so we actually need to map the standard back to oldIE
                event.button = {
                        0: 1,
                        1: 4,
                        2: 2
                    }[event.button] || ( event.button === -1 ? 0 : event.button );
            }

            return event;
        },

        keyEvent: function (type, options) {
            var event;
            options = $.extend({
                bubbles: true,
                cancelable: true,
                view: window,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                keyCode: 0,
                charCode: undefined
            }, options);

            if (document.createEvent) {
                try {
                    event = document.createEvent("KeyEvents");
                    event.initKeyEvent(type, options.bubbles, options.cancelable, options.view,
                        options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
                        options.keyCode, options.charCode);
                    // initKeyEvent throws an exception in WebKit
                    // see: http://stackoverflow.com/questions/6406784/initkeyevent-keypress-only-works-in-firefox-need-a-cross-browser-solution
                    // and also https://bugs.webkit.org/show_bug.cgi?id=13368
                    // fall back to a generic event until we decide to implement initKeyboardEvent
                } catch (err) {
                    event = document.createEvent("Events");
                    event.initEvent(type, options.bubbles, options.cancelable);
                    $.extend(event, {
                        view: options.view,
                        ctrlKey: options.ctrlKey,
                        altKey: options.altKey,
                        shiftKey: options.shiftKey,
                        metaKey: options.metaKey,
                        keyCode: options.keyCode,
                        charCode: options.charCode
                    });
                }
            } else if (document.createEventObject) {
                event = document.createEventObject();
                $.extend(event, options);
            }

            if (!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()) || (({}).toString.call(window.opera) === "[object Opera]")) {
                event.keyCode = (options.charCode > 0) ? options.charCode : options.keyCode;
                event.charCode = undefined;
            }

            return event;
        },

        dispatchEvent: function (elem, type, event) {
            if (elem.dispatchEvent) {
                elem.dispatchEvent(event);
            } else if (type === "click" && elem.click && elem.nodeName.toLowerCase() === "input") {
                elem.click();
            } else if (elem.fireEvent) {
                elem.fireEvent("on" + type, event);
            }
        },

        simulateFocus: function () {
            var focusinEvent,
                triggered = false,
                element = $(this.target);

            function trigger() {
                triggered = true;
            }

            element.bind("focus", trigger);
            element[0].focus();

            if (!triggered) {
                focusinEvent = $.Event("focusin");
                focusinEvent.preventDefault();
                element.trigger(focusinEvent);
                element.triggerHandler("focus");
            }
            element.unbind("focus", trigger);
        },

        simulateBlur: function () {
            var focusoutEvent,
                triggered = false,
                element = $(this.target);

            function trigger() {
                triggered = true;
            }

            element.bind("blur", trigger);
            element[0].blur();

            // blur events are async in IE
            setTimeout(function () {
                // IE won't let the blur occur if the window is inactive
                if (element[0].ownerDocument.activeElement === element[0]) {
                    element[0].ownerDocument.body.focus();
                }

                // Firefox won't trigger events if the window is inactive
                // IE doesn't trigger events if we had to manually focus the body
                if (!triggered) {
                    focusoutEvent = $.Event("focusout");
                    focusoutEvent.preventDefault();
                    element.trigger(focusoutEvent);
                    element.triggerHandler("blur");
                }
                element.unbind("blur", trigger);
            }, 1);
        }
    });


    /** complex events **/

    function findCenter(elem) {
        var offset,
            document = $(elem.ownerDocument);
        elem = $(elem);
        offset = elem.offset();

        return {
            x: offset.left + elem.outerWidth() / 2 - document.scrollLeft(),
            y: offset.top + elem.outerHeight() / 2 - document.scrollTop()
        };
    }

    function findCorner(elem) {
        var offset,
            document = $(elem.ownerDocument);
        elem = $(elem);
        offset = elem.offset();

        return {
            x: offset.left - document.scrollLeft(),
            y: offset.top - document.scrollTop()
        };
    }

    $.extend($.simulate.prototype, {
        simulateDrag: function () {
            var i = 0,
                target = this.target,
                eventDoc = target.ownerDocument,
                options = this.options,
                center = options.handle === "corner" ? findCorner(target) : findCenter(target),
                x = Math.floor(center.x),
                y = Math.floor(center.y),
                coord = {clientX: x, clientY: y},
                dx = options.dx || ( options.x !== undefined ? options.x - x : 0 ),
                dy = options.dy || ( options.y !== undefined ? options.y - y : 0 ),
                moves = options.moves || 3;

            this.simulateEvent(target, "mousedown", coord);

            for (; i < moves; i++) {
                x += dx / moves;
                y += dy / moves;

                coord = {
                    clientX: Math.round(x),
                    clientY: Math.round(y)
                };

                this.simulateEvent(eventDoc, "mousemove", coord);
            }

            if ($.contains(eventDoc, target)) {
                this.simulateEvent(target, "mouseup", coord);
                this.simulateEvent(target, "click", coord);
            } else {
                this.simulateEvent(eventDoc, "mouseup", coord);
            }
        }
    });

})(jQuery);
