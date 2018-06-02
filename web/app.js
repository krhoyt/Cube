var cfenv = require( 'cfenv' );
var express = require( 'express' );

// Application
var app = express();

// Static for main files
app.use( '/', express.static( 'public' ) );

// IBM Cloud
var env = cfenv.getAppEnv();

// Listen
var server = app.listen( env.port, env.bind, function() {
	// Debug
	console.log( 'Started on: ' + env.port );
} );
