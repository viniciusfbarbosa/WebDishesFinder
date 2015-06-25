// app.js Node.js server

"use strict;"   // flag JS errors 

/* Module dependencies:
 *
 * require() loads a nodejs "module" - basically a file.  Anything
 * exported from that file (with "exports") can now be dotted off
 * the value returned by require(), in this case e.g. eatz.api
 * The convention is use the same name for variable and module.
 */
var https = require('https'),
    // NOTE, use the version of "express" linked to the assignment handout
    express = require('express'), // Express Web framework
    fs = require("fs"),

  options = {
  key: fs.readFileSync(__dirname + "/key.pem"),  // RSA private-key
  cert: fs.readFileSync(__dirname + "/cert.pem")  // RSA public-key certificate
},

// var a = https.createServer(options, app).listen( ...
//     // same as HTTP server from A2 except use different port #
// });
    // config is just an object, that defines attributes such as "port"
    config = require("./config"),  // app's local config - port#, etc
    eatz = require('./routes/eatz'),
	cookieParser = require('cookie-parser'),
	session = require('express-session');  // route handlers

var app = express();  // Create Express app server

// Configure app server
app.configure(function() {
    // use PORT environment variable, or local config file value
    app.set('port', config.port || process.env.PORT);

    // change param value to control level of logging  ... ADD CODE
    app.use(express.logger('default'));  // 'default', 'short', 'tiny', 'dev'

    // use compression (gzip) to reduce size of HTTP responses
    app.use(express.compress());

    // parses HTTP request-body and populates req.body
    app.use(express.bodyParser({
        uploadDir: __dirname + '/public/img/uploads',
        keepExtensions: true
    }));
    
    app.use(express.cookieParser());  
    
	app.use(express.session(({ secret: config.secret, key: config.key, cookie: { maxAge: config.timeout }})));
    // Perform route lookup based on URL and HTTP method,
    // Put app.router before express.static so that any explicit
    // app.get/post/put/delete request is called before static
    app.use(app.router);

    // location of app's static content ... may need to ADD CODE
    app.use(express.static(__dirname + "/public")); //CHANGE IT

    // return error details to client - use only during development
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
    

});

// App routes (API) - route-handlers implemented in routes/eatz.js

// Heartbeat test of server API
//app.get('/', eatz.api); 

// Retrieve a single dish by its id attribute
app.get('/dishes/:id', eatz.getDish);

// Retrieve all dishes
app.get('/dishes', eatz.getDishes);

//Add a dish to the database
app.post('/dishes', eatz.addDish);

//Edit a dish on the database
app.put('/dishes/:id', eatz.editDish);

//Remove a dish from the database
app.del('/dishes/:id', eatz.deleteDish);

// Upload an image file and perform image processing on it
app.post('/dishes/image', eatz.uploadImage);

//Create an user
app.post('/auth', eatz.signUp);

//Logs an user in or out
app.put('/auth', eatz.auth);

//Checks if the user is authorized
app.get('/auth', eatz.isAuth);


//Default handler (page not found)
app.use(function(req, res) {
     res.send('404: Page not Found', 404);
});

// Start HTTP server
https.createServer(options, app).listen(app.get('port'), function () {
    console.log("Express server listening on port %d in %s mode",
    		app.get('port'), config.env );
});