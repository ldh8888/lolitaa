var fs = require('fs'); //引用文件系统模块
var start = 10;//起始页
var tid = 9;//数据库属性id
var links = 'star/zfyh/index-';//爬虫列表页链接
var max = 6;//攀爬偏移量
var i = start;//当前页
var interval = 1000*60*3;//间隔执行时间

var gan = require('./app');
gan.setDbProtype(tid);
gan.limits(i,links )
gan.doSpider()

var myInterval = setInterval(myfunc, interval , '打算');
setTimeout(stopInterval,interval*max);

function myfunc(Interval) {
	i = i + 1;
	gan.setDbProtype(tid);
	gan.limits(i, links)
	gan.doSpider()

}
function stopInterval(){
	clearTimeout(myInterval);
	console.log('全部执行完毕!')
}
