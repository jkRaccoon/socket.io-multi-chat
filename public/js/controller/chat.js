app.controller('chatConroller', function($scope,$rootScope,$location,$cookies,$http,$filter,$state,$aside,chat) {
	var FADE_TIME = 150; // ms
	var TYPING_TIMER_LENGTH = 400; // ms
	var COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	];
	var username;
	var roomnumber;
	var connected = false;
	var typing = false;
	var lastTypingTime;
	var $messages = $('.messages'); // Messages area
	var $inputMessage = $('.inputMessage'); // Input message input box
	
	
	
	if(!$rootScope.username){
		$state.go('login');
		return;
	}
	
	chat.emit('add user', {username:$rootScope.username , room:$rootScope.room});
	chat.emit('set room', $scope.room);
	
	
	
	//$("#chatinput").focus();
	$scope.message = "";
	$scope.newMessage = function(){
		//console.log($scope.message)
		var data = {
			username: $rootScope.username,
			message : $scope.message , 
			room : $rootScope.room
		};
		$scope.message = "";
		addChatMessage(data);
		chat.emit('new message', data);
		//$("#chatinput").focus();
	};
	
	$scope.typing = function(){
		updateTyping();
	};
	
	chat.on('login', function (data) {
		connected = true;
		// Display the welcome message
		var message = "Welcome to Raccoon Chat – ";
		log(message, {
			prepend: true
		});
		addParticipantsMessage(data);
	});
  

	chat.on('disconnect',function(){
		connected = false;
		$state.go('login');
	})
	chat.on('new message', function (data) {
//		console.log(data);
		addChatMessage(data);
		
	});
	// Whenever the server emits 'user joined', log it in the chat body
	chat.on('user joined', function (data) {
		log(data.username + ' joined');
		addParticipantsMessage(data);
	});
	
	// Whenever the server emits 'user left', log it in the chat body
	chat.on('user left', function (data) {
	log(data.username + ' left');
		addParticipantsMessage(data);
		removeChatTyping(data);
	});
	
	// Whenever the server emits 'typing', show the typing message
	chat.on('typing', function (data) {
		addChatTyping(data);
	});
	
	// Whenever the server emits 'stop typing', kill the typing message
	chat.on('stop typing', function (data) {
		removeChatTyping(data);
	});
	
	$scope.openAside = function(){
		var asideInstance = $aside.open({
	      templateUrl: 'html/aside/aside.html',
	     
	      placement: 'left',
	      size: 'lg'
	    });	
	};
	
    
    
	// Adds the visual chat typing message
	function addChatTyping (data) {
		data.typing = true;
		data.message = ' is typing';
		addChatMessage(data);
	}
	function addChatMessage(data,options){

	    var $typingMessages = getTypingMessages(data);
	    options = options || {};
	    if ($typingMessages.length !== 0) {
			options.fade = false;
			$typingMessages.remove();
	    }
	
	    var $usernameDiv = $('<span class="username"/>')
			.text(data.username)
			.css('color', getUsernameColor(data.username));
	    var $messageBodyDiv = $('<span class="messageBody">')
	    	.text(data.message);
	
	    var typingClass = data.typing ? 'typing' : '';
	    var $messageDiv = $('<p class="message"/>')
			.data('username', data.username)
			.addClass(typingClass)
			.append($usernameDiv, $messageBodyDiv);
	
	    addMessageElement($messageDiv, options);
	}
	function addMessageElement (el, options) {
		var $el = $(el);
		
		// Setup default options
		if (!options) {
			options = {};
		}
		if (typeof options.fade === 'undefined') {
			options.fade = true;
		}
		if (typeof options.prepend === 'undefined') {
			options.prepend = false;
		}
		
		// Apply options
		if (options.fade) {
			$el.hide().fadeIn(FADE_TIME);
		}
		if (options.prepend) {
			$messages.prepend($el);
		} else {
			$messages.append($el);
		}
		document.body.scrollTop = document.body.scrollHeight;
		
	}
	function removeChatTyping (data) {
		getTypingMessages(data).fadeOut(function () {
			$(this).remove();
		});
	}
	function getTypingMessages (data) {
		return $('.typing.message').filter(function (i) {
			return $(this).data('username') === data.username;
		});
	}
	function getUsernameColor (username) {
		// Compute hash code
		var hash = 7;
		for (var i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + (hash << 5) - hash;
		}
		// Calculate color
		var index = Math.abs(hash % COLORS.length);
		return COLORS[index];
	}
	function addParticipantsMessage (data) {
	    var message = '';
	    if (data.numUsers === 1) {
			message += "there's 1 participant";
	    } else {
			message += "there are " + data.numUsers + " participants";
	    }
	    log(message);
	}
	// Log a message
	function log (message, options) {
		var $el = $('<p>').addClass('log').text(message);
		addMessageElement($el, options);
	}
	
	function updateTyping () {
		if (connected) {
			if (!typing) {
				typing = true;
				chat.emit('typing',$rootScope.room);
			}
			lastTypingTime = (new Date()).getTime();
			
			setTimeout(function () {
				var typingTimer = (new Date()).getTime();
				var timeDiff = typingTimer - lastTypingTime;
				if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
					chat.emit('stop typing',$rootScope.room);
					typing = false;
				}
			}, TYPING_TIMER_LENGTH);
		}
	}
});