//var Client = require('ftp');
//var fs = require('fs');
//var c = new Client();
//var ftpOption = {
//	host: 'didi.douvo.com',
//	user: 'dididouvo@didi.douvo.com',
//	password: '8609001'
//}
//c.on('ready', function(saveThumbDir, filename, saveOriginalDir, saveOriginalThumbDir) {
//	if(saveThumbDir) {
//		c.cwd(saveThumbDir, function(err) {
//			if(err) {
//				c.mkdir(saveThumbDir, true, function(err) {
//					//console.log(saveThumbDir)
//				});
//				c.end()
//
//			}
//
//		});
//	}
//
//});
//
//c.connect(ftpOption);
//c.emit('ready', '/cao/c2')



var fs = require("fs")
var path = require("path")

var root = "original/20170826/thumb/"

readDirSync(root)
function readDirSync(path){
	var pa = fs.readdirSync(path);
	pa.forEach(function(ele,index){
		var info = fs.statSync(path+"/"+ele)	
		if(info.isDirectory()){
			console.log("dir: "+ele)
			readDirSync(path+"/"+ele);
		}else{
			console.log("file: "+ele)
		}	
	})
}