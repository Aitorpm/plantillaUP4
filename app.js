
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , streamingService = require('./lib/service/streamingService');

var io = require('socket.io');
var server;
var clients = [];

var app = express();

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

app.configure('development', function(){
  app.use(express.errorHandler());
});

server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



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
}




app.get('/', routes.index);
app.post('/test',test);
//streamingService.start(server);
