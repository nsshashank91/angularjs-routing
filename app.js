/* 	Author: Jordan Melberg */
/** Copyright © 2016, Okta, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var app = angular.module("app", ["ngRoute", "OktaAuthClient", "OktaConfig"]);
app.config(function ($routeProvider) {
	$routeProvider
	.when("/", {
		templateUrl: "views/home.html",
		controller: "HomeController"
	})
	.when("/login", {
		templateUrl: "views/login.html",
		controller: "LoginController"
	})
	.otherwise({redirectTo: "/"});
});

/** Set up controllers */
app.controller("HomeController", HomeController);
app.controller("LoginController", LoginController);

/**	Global variable oktaAuth */
app.value("oktaAuth", undefined);
app.run(function(authClient, CONFIG){
	// Init OktaAuth from configuration file
	oktaAuth = authClient.init(CONFIG.options);
});

HomeController.$inject = ["$scope", "$window", "$location", "$http", "authClient", "CONFIG"];
function HomeController($scope, $window, $location, $http, authClient, CONFIG) {
	
	// Get authClient for helper methods
	var oktaAuth = authClient.getClient();

	// Get auth object from sessionStorage
	var auth = angular.isDefined($window.sessionStorage["auth"]) ? JSON.parse($window.sessionStorage["auth"]) : undefined;

	// Token manager
	var tokenManager = oktaAuth.tokenManager;

	// Redirect user if not authenticated
	if (angular.isUndefined(auth)) {
		$location.path("/login");
	};

	if(auth!=undefined){
		$scope.session = true;
		$scope.auth = auth;
		$scope.user = auth.user.profile;
	}
	
	//	Clears the localStorage saved in the web browser and scope variables
	function clearStorage() {
		$window.sessionStorage.clear();
		$scope = $scope.$new(true);
	}

	/** Signout method called via button selection */
	$scope.signout = function() {
		oktaAuth.session.close();
		clearStorage();
		$location.url("/login");
	};
}

// Renders login view if session does not exist
LoginController.$inject = ["$window", "$scope", "authClient"];
function LoginController($window, $scope, authClient) {
	var oktaAuth = authClient.getClient()
	
	oktaAuth.session.exists(function(exists) {
		oktaAuth.session.close();
	});

	// Handles authentication
	$scope.authenticate = function(user) {
		oktaAuth.signIn({ username: user.email, password: user.password })
		.then(function(transaction) {
			if(transaction.status === "SUCCESS"){
				$window.sessionStorage["auth"] = angular.toJson({
					"sessionToken" : transaction.sessionToken,
					"user" : transaction.user
				});
				oktaAuth.session.setCookieAndRedirect(transaction.sessionToken)
				
				$window.location.href = '/';
			}
		}, function(error) {
			// Error authenticating
			console.error(error);
		});
	}
}
