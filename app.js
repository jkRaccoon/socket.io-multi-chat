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

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
   //console.log(data)
    socket.to(data.room).emit('new message', {
      username: socket.username,
      message: data.message
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (data) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = data.username;

    if(!numUsers[data.room])numUsers[data.room] = 0;
    ++numUsers[data.room];
    addedUser = true;
    socket.emit('login', {
    	numUsers: numUsers[data.room]
    });
    // echo globally (all clients) that a person has connected
    socket.to(data.room).emit('user joined', {
      username: socket.username,
      numUsers: numUsers[data.room]
    });
   
  });
  socket.on('set room', function (room) {
	  
	   socket.currentroom = room;
	   socket.join(room,function(){
	   //console.log(socket)
	   });
	   
  });
  
  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

	// when the user disconnects.. perform this
	socket.on('disconnect', function () {
		if (addedUser) {
			var rooms = Object.keys(socket.adapter.rooms);
			
			for(var i in rooms){
				
				if(numUsers[rooms[i]]) {
					
					--numUsers[rooms[i]];
					socket.to(rooms[i]).emit('user left', {
						username: socket.username,
						numUsers: numUsers[rooms[i]]
					});
				}
			}
		}
	});
});