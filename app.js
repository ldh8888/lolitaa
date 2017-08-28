var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var fs = require('fs');
var async = require('async');
var iconv = require('iconv-lite');
var moment = require('moment');
var crypto = require('crypto');
var http = require('http');
var qs = require('querystring');
var images = require("images");
/*
 * 
 * ftp
 */
//var Client = require('ftp');
//var c = new Client();
//var ftpOption = {
//	host: 'didi.douvo.com',
//	user: 'dididouvo@didi.douvo.com',
//	password: '8609001'
//}

//c.on('ready', mkdir);
//c.on('ready', appendFile);

var options = []; //用于存储网址链接的数组
var n = 0;
var baseurl = 'https://www.4493.com/';
var time = moment().format('YYYYMMDD');
var imgDir = "preview/" + time + '/'; //预览图地址
var originalImgDir = "original/" + time + '/'; //详情大图地址
var thumbDir = originalImgDir + 'thumb/';
var saveDir = '/' + imgDir;
var originalDir = '/' + originalImgDir;
var protype;
//console.log(protype)

if(!fs.existsSync(thumbDir)) {
	fs.mkdirSync(originalImgDir)
	fs.mkdirSync(thumbDir)
}
//fs.exists(thumbDir, function(exists) {
//	if(!exists) {
//		fs.mkdir(thumbDir, function(e) {
//
//		})
//	}
//});
fs.exists(imgDir, function(exists) {
	if(!exists) {
		fs.mkdir(imgDir, function(e) {

		})
	}
});

//先生称图片地址链接的数组
function limits(start, param) {
	options = []
	for(var i = start; i < start + 1; i++) {
		var obj = {
			url: baseurl + param + i + '.htm',
			encoding: null,
			headers: {
				'User-Agent': 'request'
			}
		}
		options.push(obj);
	}
	console.log(options)
}

function setDbProtype(type) {
	protype = type;
	console.log(protype)
}

function GetRandomNum(Min, Max) {
	var Range = Max - Min;
	var Rand = Math.random();
	return moment().format('YYYYMMDDHHmmss').toString() + (Min + Math.round(Rand * Range)).toString();
}

function mkdir(dir, file, parentDir) {
	
	if(dir) {
		c.mkdir(dir, true, function(err) {
			console.log('文件夹' + dir + '创建成功')
			c.end()
		});
	}
}

function appendFile(dir, file, parentDir) {
	if(file && c.connected) {
		var filename = dir + file
		c.append(filename, filename, function(err) {
			if(err) {
				console.log(filename + '缩略图上传失败')
			} else {

				console.log(filename + '缩略图上传成功');
				fs.unlink(filename, function(err) {
					if(err) {
						console.log(filename + '缩略图删除失败!')
					} else {
						console.log(filename + '缩略图删除成功!')
					}
				});
				if(parentDir) {
					var pfilename = parentDir + file
					c.append(pfilename, pfilename, function(err) {
						if(err) {
							console.log(pfilename + '原图上传失败')
						} else {

							console.log(pfilename + '原图上传成功');
							fs.unlink(pfilename, function(err) {
								if(err) {
									console.log(pfilename + '原图删除失败!')
								} else {
									console.log(pfilename + '原图删除成功!')
								}
							});

						}

					});
				}

			}
			c.end()
		});

	}
}

//用来处理这个调用逻辑的总函数
function all(err, res, body) {
	body = iconv.decode(body, 'gbk');
	var $ = cheerio.load(body);
	n = n + $(".piclist img").length;

	$(".piclist img").each(function(i, ele) {
		//console.log(getToatalPage()) 

		var rand = GetRandomNum(1111, 9999);
		var title = $(this).next().text()
		var createtime = moment().format('YYYY-MM-DD HH:mm:ss');
		var imgsrc = $(this).attr('src');
		var href = $(this).parent().attr('href')
		console.log(title)
		postTo({
			link: href
		}, '/Index/existLink', function(json) {
			if(json.cnt > 0) {
				return;
			}

			postTo({
				title: title,
				createtime: createtime,
				itemType: 'album',
				property: protype
			}, '/Index/itemList', function(json) {
				var id = json.id;

				if(id) {
					var fileName = FileName(rand, imgsrc.toString());
					var type = 'album'; //模型

					downloadImg(imgsrc, imgDir + fileName, function() {
						var param = {
							path: saveDir + fileName,
							cover: 1,
							type: type,
							tid: id
						}
						//console.log(param)
						postTo(param, '/Index/detail', null);
						//c.emit('ready', imgDir, fileName);
						
					});
					detail(href, id, type)
					postTo({
						link: href
					}, '/Index/spider', null)
				}
			});

		})

	})
}

function detail(url, id, type) {
	var urlArr = url.split('/');
	url = baseurl + url;
	request({
		url: url,
		encoding: null,
		headers: {
			'User-Agent': 'request'
		}
	}, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			body = iconv.decode(body, 'gbk');
			var $ = cheerio.load(body);
			var p = $(".picmainer #allnum").text()

			for(var i = 1; i <= p; i++) {
				var detailUrl = baseurl + urlArr[1] + '/' + urlArr[2] + '/' + i + '.htm'

				request({
					url: detailUrl,
					encoding: null
				}, function(error, response, body) {
					if(!error && response.statusCode == 200) {
						body = iconv.decode(body, 'gbk');
						//console.log(body)
						var $ = cheerio.load(body);
						var imgUrl = $(".picsbox img").attr('src')
						if(imgUrl) {
							var rand = GetRandomNum(1111, 9999);
							var fileName = FileName(rand, imgUrl.toString());

							downloadImg(imgUrl, originalImgDir + fileName, function() {
								postTo({
									path: originalDir + fileName,
									type: type,
									tid: id
								}, '/Index/detail', null)
								console.log(originalImgDir + fileName + "下载完毕")
								resizeImg(originalImgDir + fileName, originalImgDir + 'thumb/' + fileName, function() {
									
								});
								//c.emit('ready', thumbDir, fileName, originalImgDir);
								

							})
						}
					}
				})
			}
		}
	})

}

function resizeImg(path, savePath, callback) {
	try {
		images(path)
			.size(300) //等比缩放图像到400像素宽
			//.draw(images("logo.png"), 10, 10)   //在(10,10)处绘制Logo
			.save(savePath, { //保存图片到文件,图片质量为50
				quality: 80
			})
		console.log(path + '裁剪完毕')
		callback()
	} catch(err) {
		console.log(err)
	}
}

//格式化图片名称
function FileName(name, url) {
	var md5 = crypto.createHash('md5');
	md5.update(name);
	var n = md5.digest('hex'); //加密后的值d
	var fileName = 'DSN-' + n + '.' + path.basename(url).split('.')[1];
	return fileName;
}
//利用fs模块download图片
function downloadImg(url, filename, callback) {
	var stream = fs.createWriteStream(filename);
	request(url).on('error', function() {
		console.log('done no');
	}).pipe(stream.on('finish', callback));
}

function postTo(content, path, callback) {
	content = qs.stringify(content);
	var rs;
	var options = {
		host: '192.168.2.196',
		//port: 80,
		path: path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': content.length
		}
	};

	var req = http.request(options, function(res) {

		var _data = '';
		res.on('data', function(chunk) {
			_data += chunk;
		});
		res.on('end', function() {
			if(_data) {
				callback(JSON.parse(_data))
			}

		});

	});

	req.write(content);
	req.end();

}

function end() {
	console.log('全部执行完毕')
}
//利用async的mapLimit方法实现限定并发数为3的调用
function doSpider() {
	//if(!c.connected) {c.destroy();c.connect(ftpOption);}
	async.mapLimit(options, 10000, function(option, end) {
		request(option, all);
		end();
		console.log('全部检索完毕++');
	}, function(err, result) {
		if(err) {
			console.log(err);
		} else {

			console.log('全部检索完毕');
		}
	})
}

function aesEncrypt(data, key) {
	const cipher = crypto.createCipher('aes192', key);
	var crypted = cipher.update(data, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

function aesDecrypt(encrypted, key) {
	const decipher = crypto.createDecipher('aes192', key);
	var decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}

module.exports = {
	doSpider: doSpider,
	limits: limits,
	setDbProtype: setDbProtype
};