
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , streamingService = require('./lib/service/streamingService');
var fs = require('fs');
var https = require('https');
var key = fs.readFileSync('./cert/privkey.pem');
var cert = fs.readFileSync('./cert/fullchain.pem');
var https_options = {
  key: key,
  cert: cert
};

var io = require('socket.io');
var server;
var server2;
var clients = [];
var srt=[];

var app = express();

var app2 = express();

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app2.configure(function(){
  app2.set('port', process.env.PORT || 5001);
  app2.set('views', __dirname + '/views');
  app2.set('view engine', 'jade');
  app2.use(express.favicon());
  app2.use(express.logger('dev'));
  app2.use(express.bodyParser());
  app2.use(express.methodOverride());
  app2.use(app.router);
  app2.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app2.configure('development', function(){
  app2.use(express.errorHandler());
});

server = https.createServer(https_options,app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

server2 = http.createServer(app2).listen(app2.get('port'),function () {
  console.log('server http operative on port 5001');

})



io = io.listen(server);
io.set("transports", ["xhr-polling"]);
io.sockets.on('connection', function (socket) {
  console.log(socket);
  socket.on('disconnect', function () {
    console.log('User disconnected');
  });

  socket.on('data', function (data) {
    socket.broadcast.emit('data', data);
  });

});


test = function(req,res) {
    console.log(req.body);
    res.send('OK');
    io.sockets.emit('coords',req.body);
};

postdirection = function (req,res) {
  console.log(req.body);
  console.log(req.body.message);
  srt.push(req.body.message);
  res.end();
};

getDirection = function (req,res){
  console.log(srt);
  console.log(srt.length);
  if(srt.length>0){
    console.log(srt[srt.length-1]);
    res.send(srt[srt.length-1]);
    res.end();
    srt=[];
    console.log(srt);
  }
  else res.send();
};

postfromapp = function (req,res){
  console.log(req.body);
  console.log(req.body.message);
  io.sockets.emit('chat',req.body.message);
};

hello = function (req, res) {
  res.send('Hola mundo!');
}




app.get('/', routes.index);
app.post('/test',test);
app.get('/getdirection',getDirection);
app.post('/chat/postdirection',postdirection);
app.post('/chat/app/postmessage',postfromapp);
app.get('/hello', hello);
//streamingService.start(server);
