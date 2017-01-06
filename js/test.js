var i = 0;
function mainFunc(){
    i++;
    //把i发送到浏览器的js引擎线程里
    postMessage(i);
}
var id = setInterval(mainFunc,1000);