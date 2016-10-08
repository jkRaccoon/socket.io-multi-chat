// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 4041;

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = {};

io.on('connection', function (socket) {
	var addedUser = false;


	/**
	 * 클라이언트에서 'new message'를 emits할때
	 */
	socket.on('new message', function (data) {	   
		socket.to(data.room).emit('new message', {
			username: socket.username,
			message: data.message
		});
	});


	/**
	 * 클라이언트에서 'add user'를 emits할때 
	 */
	socket.on('add user', function (data) {
		if (addedUser) return;

		// 소켓세션에 username을 저장해 놓음. 나중에 쓰기위해서
		socket.username = data.username;

		if(!numUsers[data.room] || !socket.adapter.rooms[data.room]) {
			numUsers[data.room] = 1;
		}else{
			numUsers[data.room] = socket.adapter.rooms[data.room].length + 1;
		}
		addedUser = true;
		socket.emit('login', {
			numUsers: numUsers[data.room]
		});
		
		// 입장 알림
		socket.to(data.room).emit('user joined', {
			username: socket.username,
			numUsers: numUsers[data.room]
		});
   
	});
	
	/**
	 * 
	 */
	socket.on('set room', function (room) {
		
		// 소켓세션에 현재방번호를 넣어놓음.
		socket.currentroom = room;
		socket.join(room,function(data){
			for(var i in socket.adapter.rooms[room].sockets){
			} 
		});
	});
  
	/**
	 * 글쓰기 시작
	 */
	socket.on('typing', function (room) {
		socket.to(room).emit('typing', {
			username: socket.username
		});
	});

	/**
	 * 글쓰기 멈춤
	 */
	socket.on('stop typing', function (room) {
		socket.to(room).emit('stop typing', {
			username: socket.username
		});
	});

	/**
	 * 유저 소켓이 끊겼을때.
	 */
	socket.on('disconnect', function () {
		if (addedUser) {
			var rooms = Object.keys(socket.adapter.rooms);
			for(var i in rooms){
				if(numUsers[rooms[i]]) {
					numUsers[rooms[i]] = socket.adapter.rooms[rooms[i]].length;
					socket.to(rooms[i]).emit('user left', {
						username: socket.username,
						numUsers: numUsers[rooms[i]]
					});
				}
			}
		}
	});
	
});