var http = require("http");
var httpProxy = require("http-proxy");
var express = require("express");
var socketio = require("socket.io");
var fs = require("fs");
var winston = require("winston");

var servers = {};


// proxy http server with websocket support
var proxy = new httpProxy.createProxyServer();

var proxyServer = http.createServer(function (req, res) {
  proxy.web(req, res, { target: 'http://127.0.0.1:9001' });
});

proxyServer.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head);
});

proxyServer.listen(9000);

createExpressHttpServer(9001);
createWebsocketServer(9002);
createWebsocketServer(9003);

function createExpressHttpServer(port) {
    var app = express();
    var expressHttpServer = app.listen(port,"127.0.0.1");
}

function createWebsocketServer(port) {
    var httpServer = http.createServer(handler);
    var socketIoServer = socketio(httpServer);
    socketIoServer.on("connection", onSocketIoConnection);
    httpServer.on("listening", function() {
        winston.info("websocket server listening " + port);
    });
    httpServer.listen(port);
}

function onSocketIoConnection(socket) {
    winston.info("onSocketIoConnection");
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
}

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}