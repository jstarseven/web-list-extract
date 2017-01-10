// ==UserScript==
// @name         Web-Source-Extract-detail
// @namespace    http://your.homepage/
// @version      0.1
// @description  针对网页列表做详情跳转提取
// @author       jstarseven
// @match        https://www.lancai.cn/about/*
// @grant        none
// ==/UserScript==


(function () {
    'use strict';
    var detailTimer = setTimeout(function () {
        var data_key = getUrlParamValue("data_key");
        var isSuc = new webExcutor(data_key).executor();
        if ("success" == isSuc) {
            clearTimeout(detailTimer);
            closeWebPage();
        }
    }, 3000);
})();


/**
 * 抽取详情页面数据字段
 * @param data_key
 */
function webExcutor(data_key) {
    this.executor = function () {
        if (isNullParam(data_key))
            return "fail";
        var config = localStorage.getItem(data_key);
        console.log("opentab=" + JSON.stringify(config));
        if (isNullParam(config))
            return "fail";
        config = JSON.parse(config);
        var open_tab = config.cur_opentab;
        console.log("opentab=" + JSON.stringify(open_tab));
        if (isNullParam(open_tab))
            return "fail";
        var data_map = getTaskDataMap();
        if (isNullParam(data_map))
            return "fail";
        console.log(new Date() + "open new tab <" + data_key + ">");
        var cur_list_item = data_map.get(data_key);
        for (var i = 0; i < open_tab.length; i++) {
            var item = open_tab[i], item_ele;
            item_ele =  $(item.selector);
            console.log("selector= " + item.selector + "---" + JSON.stringify(item_ele) + "---" + $(item.selector) + "---" + $(item.selector).text());
            if (!isNullParam(item.iframe_selector))
                item_ele = document.querySelector(item.iframe_selector).contentWindow.document.querySelector(item.selector);
            cur_list_item[item.column] = extractDeal(item, item_ele);
        }
        addTaskDataMap(data_key, cur_list_item);
        console.log(new Date() + "new tab data extract end");
        console.log(new Date() + "close new tab <" + data_key + ">");
        return "success"
    }
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
 *获取当前任务配置信息
 */
function getTaskDataMap() {
    var data_maps = localStorage.getItem("data_maps");
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

/**
 * 关闭当前窗口
 * @constructor
 */
function closeWebPage() {
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
            window.opener = null;
            window.close();
        } else {
            window.open('', '_top');
            window.top.close();
        }
    }
    else if (navigator.userAgent.indexOf("Firefox") > 0) {
        window.location.href = 'about:blank ';
    } else {
        window.opener = null;
        window.open('', '_self', '');
        window.close();
    }
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

