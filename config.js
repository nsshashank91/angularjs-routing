angular
.module("OktaConfig", [])
.constant("CONFIG", {
    options : {
	    url: "https://dev-65059193.okta.com",
	    clientId: "0oafgdbbqfCAoXsav5d7",
      redirectUri: "http://localhost:8080",
  	  authParams: {
    	  responseType: ["id_token", "token"],
    	  responseMode: "okta_post_message",
    	  scope : [
      		"openid",
      		"email",
      		"profile",
      		"address",
      		"phone"
    	  ]
  	  }
    },
    apiUrl : "http://localhost:9000/protected"
});