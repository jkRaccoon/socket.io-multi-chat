app.controller('loginConroller', function($scope,$rootScope,$location,$cookies,$http,$filter,$state,chat) {
	$scope.username = "";
	$scope.room = "codecraft";
	$scope.submit = function(){
		
		if(!$scope.username) return;
		$rootScope.username = $scope.username;
		$rootScope.room = $scope.room;
		
		$state.go('main.chat');
		
	}
	
});