// ==UserScript==
// @name         Web-Source-Extract-detail
// @namespace    http://your.homepage/
// @version      1.0
// @description  针对网页列表做详情跳转提取
// @author       jstarseven
// @match        https://www.lancai.cn/about/notice_detail.html?*
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
        if (isNullParam(data_key))return "fail";
        var config = localStorage.getItem(data_key);
        if (isNullParam(config))return "fail";
        config = JSON.parse(config);
        var open_tab = config.cur_opentab;
        if (isNullParam(open_tab))return "fail";
        var data_map = getTaskDataMap();
        if (isNullParam(data_map))return "fail";
        var cur_list_item = data_map.get(data_key);
        for (var i = 0; i < open_tab.length; i++) {
            var item = open_tab[i], item_ele;
            item_ele = $(item.selector);
            if (!isNullParam(item.iframe_selector))
                item_ele = document.querySelector(item.iframe_selector).contentWindow.document.querySelector(item.selector);
            cur_list_item[item.column] = extractDeal(item, item_ele);
        }
        addTaskDataMap(data_key, cur_list_item);
        return "success"
    }
}

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
 * 关闭当前窗口
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

//判断参数值是否是空值
function isNullParam(param) {
    return !!(param == "" || null == param || param == undefined);
}

//获取url参数
function getUrlParamValue(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}

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