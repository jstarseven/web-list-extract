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
var submitMessUrl = "http://127.0.0.1:8080/rzx-analyzer-control/task/submitMess.action";
//任务脚本
var task_json = [];
//任务步骤
var task_steps = [];
//采集数据
var task_datas = [];


setTimeout(function () {
    var iget = {
        "type": "get",
        "iframeselector": "",
        "datas": [
            {
                "selector": "body > header > div.header-top-update > div > ul.horizontal-nav.pull-left > li:nth-child(1)",
                "column": "1",
                "from": "text",
                "regx": "",
                "regvalue": "",
                "iframeselector": ""
            },
            {
                "selector": "body > header > div.header-top-update > div > ul.horizontal-nav.pull-right > li:nth-child(1) > a",
                "column": "2",
                "from": "text",
                "regx": "",
                "regvalue": "",
                "iframeselector": ""
            }
        ]
    };
    new getAction(iget).executor();
}, 3000);


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
 * @param  {start}
 * @return {[type]}
 */
function startAction(start) {
    this.type = start.type;
    this.wait = start.wait;
    this.executor = function () {
        setTimeout(function () {
            console.log(new Date() + ": startAction is started");
        }, wait);
    };

}

/**
 * @param  {get}
 * @return {[type]}
 */
function getAction(get) {
    this.type = get.type;
    this.iframeselector = get.iframeselector;
    this.datas = get.datas;
    this.executor = function () {
        console.log(new Date() + ": getAction is starting");
        var context = {};
        for (var i = 0; i < this.datas.length; i++) {
            var item = this.datas[i], element;
            if (isNullParam(item))continue;
            if (isNullParam(item.iframeselector))
                element = document.querySelectorAll(item.selector);
            else//元素存在于iframe中
                element = document.querySelector(item.iframeselector).contentWindow.document.querySelectorAll(item.selector);
            if (isNullParam(element))continue;
            context[item.column] = extractDeal(item, element);
            if (item.hasOwnProperty("opentab"))
                context = new newTabAction(item.selector, item.opentab).executor();
            console.log(new Date() + ": extract data is running<" + i + ">");
        }
        console.log(new Date() + ": getAction is end");
        return context;
    };
}


/**
 * 抽取元素数据信息进行处理
 * @param  {item}
 * @param  {[element]}
 * @return {string}
 */
function extractDeal(item, element) {
    var from = item.from;
    var content = '';
    if (isNullParam(from) || "text" == from)
        content = $(element).text();
    if ("html" == from)
        content = $(element).html();
    return content;
}

/**
 * @param  {click}
 * @return {[type]}
 */
function clickAction(click) {
    this.type = click.type;
    this.wait = click.wait;
    this.executor = function () {

    };
}

/**
 * @param  {list_start}
 * @param  {[action]}
 * @return {[type]}
 */
function listAction(list_start, action) {
    this.type = list_start.type;
    this.selector = list_start.selector;
    this.maxpage = list_start.maxpage;
    this.pageselector = list_start.pageselector;
    this.iframeselector = list_start.iframeselector;
    this.action = action;
    this.executor = function () {

    };
}

/**
 * @param  {open_sel}
 * @param  {[open_get]}
 * @return {[type]}
 */
function newTabAction(open_sel, open_get) {
    this.selector = open_sel;
    this.open_get = open_get;
    this.executor = function () {
        //开新标签提取数据
        if (isNullParam(open_sel) || isNullParam(open_get))
            return;
        var element = document.querySelector(open_sel);
        //模拟点击打开新标签
        element.setAttribute('target', '_blank');
        //将新标签selector信息放入localstorage中
        var config = {
            "cur_key": open_sel,
            "cur_opentab": open_get
        };
        localStorage.setItem("cur_config", JSON.stringify(config));
        element.click();
    };
}

/**
 * @param  {end}
 * @return {[type]}
 */
function endAction(end) {
    this.type = start.type;
    this.wait = start.wait;
    this.executor = function () {

    };
}


/**
 *获取当前任务配置信息
 */
function getTaskDataMap() {
    var data_maps = sessionStorage.getItem("data_maps");
    var datas = new Map();
    if (isNullParam(data_maps)) {
        data_maps = datas;
    } else {
        datas.elements = JSON.parse(data_maps).elements;
        data_maps = datas;
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
  
