// ==UserScript==
// @name         code-formmat-json.osc
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        http://tool.oschina.net/codeformat/json
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var formatTimer = setTimeout(function () {
        var data_map = getTaskDataMap();
        if (isNullParam(data_map))return;
        var str_json = JSON.stringify(data_map);
        $('body').text(str_json.slice(1, str_json.length - 1));
        //$('#format').trigger('click');
    }, 2000);
})();

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

//-------------------------------------------------------------------------------------------------------------------------------------
/**
 * Created by jstarseven on 2016/4/6.
 * 前端js基本函数库
 */
//判断参数值是否是空值
function isNullParam(param) {
    return !!(param == "" || null == param || param == undefined);
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