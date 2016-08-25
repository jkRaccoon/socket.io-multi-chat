var app = angular.module('raccoonchat', [
	'ui.router',
	'ngCookies',	
	'ngAnimate',
	'base64',
	'pascalprecht.translate',
	'ui.bootstrap',
	'btford.socket-io',
	'ngAside'
]);

app.config(function ($stateProvider,$urlRouterProvider) {  
  $urlRouterProvider.otherwise('/login'); //기본주소 설정
  $stateProvider
    .state('main', {
      url: "/main",
      templateUrl: "html/main.html",    
    })
    .state('main.chat', {
      url: "/chat",
      templateUrl: "html/home/chat.html",
      controller	: 'chatConroller'    
    })
    .state('login', {
      url: "/login",
      templateUrl: "html/login.html",    
      controller	: 'loginConroller'
    })
    
})

// 
// app.component('landyNav', {
// 	templateUrl	: 'html/component/nav.html',
// 	controller	: 'landyNavConroller'
// });
// app.component('landyNav2', {
// 	templateUrl	: 'html/component/nav2.html'
// });