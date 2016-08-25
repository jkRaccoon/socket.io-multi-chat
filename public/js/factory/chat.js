app.factory('chat', function (socketFactory) {
	
	var myIoSocket = io.connect(document.location.hostname+":4041");

	return socketFactory({
		ioSocket: myIoSocket
	});
	
})