var app = require('http').createServer();
var io = require('socket.io')(app);
var request = require('request');
var schedule = require("node-schedule");
var _ = require('underscore');
var hashName = new Object();


app.listen(3000, function () {
    console.log('listening on *:3000');
});

io.on('connection', function (socket) {
    console.log('新加入一个连接。');
    // 不管是服务器还是客户端都有 emit 和 on 这两个函数，socket.io 的核心就是这两个函数
    socket.on('conn', function (data) {
        var name = data.un;
        // // 储存上线的用户
        hashName[name] = socket.id;
        sendGameNextNo();
        sendGameCurrentOpenNo();
        console.log(Object.keys(hashName).length)

        //_.findWhere(io.sockets.sockets, {id: hashName.a111111}).emit('message', "欢迎光临!当前在线人数:"+Object.keys(hashName).length);
    });
    /**
     * on ：用来监听一个 emit 发送的事件
     * 'sayTo' 为要监听的事件名
     * 匿名函数用来接收对方发来的数据
     * 这个匿名函数的第一个参数为接收的数据，如果有第二个参数，则是要返回的函数。
     */
    socket.on('sayTo', function (data) {
        var toName = data.to;
        var toId = data.id;
        if (toId = hashName[toName]) {
            // nodejs的underscore扩展中的findWhere方法，可以在对象集合中，通过对象的属性值找到该对象并返回。
            var toSocket = _.findWhere(io.sockets.sockets, { id: toId });

            // socket.emit() ：向建立该连接的客户端广播
            // socket.broadcast.emit() ：向除去建立该连接的客户端的所有客户端广播
            // io.sockets.emit() ：向所有客户端广播，等同于上面两个的和

            // 通过该连接对象（toSocket）与链接到这个对象的客户端进行单独通信
            toSocket.emit('message', data.msg);
        }
    });

    // 当关闭连接后触发 disconnect 事件
    socket.on('disconnect', function () {
        console.log('断开一个连接。');
    });
})


var rule1 = new schedule.RecurrenceRule();
var times1 = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];
var turn_num_uri = "http://192.168.1.188/index.php/Api/checkNode";
var game_api_uri = "http://f.apiplus.net/cqssc.json"
rule1.second = times1;
schedule.scheduleJob(rule1, function () {
    sendGameNextNo();
    sendGameCurrentOpenNo();
});

function sendGameNextNo() {
    httpGet(turn_num_uri, (res) => {
            console.log(new Date().toLocaleString() + '--' + res.actionNo) // 请求成功的处理逻辑
            io.sockets.emit('message', res)
    });
}

function sendGameCurrentOpenNo(){
    httpGet(game_api_uri, (res) => {
            console.log(new Date().toLocaleString() + '==' +
                "期数:" + res.data[0].expect + "," +//期数
                "开奖号码:" + res.data[0].opencode + "," +//开奖号码
                "开奖时间戳:" + res.data[0].opentimestamp //开奖时间戳
            )
            io.sockets.emit('message', res.data[0])
    });
}

function httpGet(uri, cb) {
    request(uri, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if (typeof cb == "function") {
                cb(JSON.parse(body))
            }
        }
    });
}

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});