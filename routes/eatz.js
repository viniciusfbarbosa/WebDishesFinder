"use strict";
var fs = require('fs'),
    gm = require('gm').subClass({imageMagick: false}),
    config = require(__dirname + '/../config'),  // port#, other params
    express = require("express"),
    bcrypt = require('bcrypt'), //Windows version
    //Use this in linux: bcrypt = require('bcrypt'),
    mongoose = require("mongoose"),
	cookieParser = require('cookie-parser'),
	session = require('express-session');
    
mongoose.connect(config.db);
// Schemas
var Dish = new mongoose.Schema({
    name: { type: String, required: true },
    venue: { type: String, required: true },
    info: [String],
    number: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    url: { type: String },
    image: { type: String, required: true },
    lat: {type: Number, required: true},
    lon: {type: Number, required: true}
});
var User = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true }
});

// each name:venue pair must be unique; duplicates are dropped
Dish.index({ name: 1, venue: 1 }, { unique: true });

// Models
var DishModel = mongoose.model('Dish', Dish);
var UserModel = mongoose.model('User', User);

exports.randomString = function (bits) {
  var chars, rand, i, ret;
  
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'; 
  ret = '';
  
  // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
  while (bits > 0) {
    // 32-bit integer
    rand = Math.floor(Math.random() * 0x100000000); 
    // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
    for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6) {
      ret += chars[0x3F & rand >>> i];
    }
  }
  
  return ret;
};

// Implement the eatz API:

// "exports" is used to make the associated name visible
// to modules that "require" this file (in particular app.js)
exports.api = function(req, res){
  res.send(200, '<h3>Eatz API is running!</h3>');
};

exports.uploadImage = function (req, res) {
    // req.files is an object, attribute "file" is the HTML-input name attr
    var filePath = req.files[0].path,   //Temporary file path
        tmpFile = req.files[0].originalFilename,  //Root file name
        uniqueName = exports.randomString(32*8), //Generate random name
    	imageURL = __dirname+'/../public/img/uploads/'; //Destination path
        
    // process EditView image
    
    gm(filePath).resize(360,270).noProfile().setFormat("png").write(imageURL+uniqueName+".png", function(err) {
    	if (!err) {
    	   //Process dishView image
    	   gm(filePath).resize(240,180).noProfile().write(imageURL+uniqueName+"_thumb.png",function(err){ 
                if(err){
                    console.log(err);
                    fs.unlink(""+filePath, function (err) {if (err){console.log(err);}});
                } else {
                    //Return the image file name to the client
                    res.type('json');
                    res.send({ filename: uniqueName });
                    //Remove temporary files
                    fs.unlink(""+filePath, function (err) {if (err){console.log(err);}});
                }
            });
    	} else {
    	    console.log(err);
            fs.unlink(""+filePath, function (err) {if (err){console.log(err);}});
        }
    });
};

exports.getDish = function(req, res){
    DishModel.findById(req.params.id, function(err, dish) {
        if (err) {
            res.send(500, "Sorry, unable to retrieve dish at this time."
            	+err.message+ ")" );
        } else if (!dish) {
            res.send(404, "Sorry, that dish doesn't seem to exist; try reselecting from the browse view");
        } else {
            res.send(200, dish);
        }
    });
};

exports.getDishes = function(req, res){
    DishModel.find({}, function(err, dishes) {
        if (err) {
            res.send(500, "Sorry, unable to retrieve dishes at this time."
            	+err.message+ ")" );
        } else if (!dishes) {
            res.send(404, "Sorry, that dish doesn't seem to exist; try reselecting from the browse view");
        } else {
            res.send(200, dishes);
        }
    });
};

exports.addDish = function(req, res){
    var dish = new DishModel(req.body);
    dish.save(function(error, data){
        if(error){
            res.send(500, "Sorry, unable to save the dish at this time.");
        }
        else{
            res.json(200,data);
        }
    });
};

exports.editDish = function(req, res){
    DishModel.findById(req.params.id, function(err, dish) {
        if (err) {
            res.send(500, "Sorry, unable to retrieve dish to be edited at this time."
                +err.message+ ")" );
        } else if (!dish) {
            res.send(404, "Sorry, that dish doesn't seem to exist; try reselecting from the browse view");
        } else {
            dish.name = req.body.name;
            dish.venue = req.body.venue;
            dish.info = req.body.info;
            dish.number = req.body.number;
            dish.street = req.body.street;
            dish.city = req.body.city;
            dish.province = req.body.province;
            dish.url = req.body.url;
            dish.image = req.body.image;
            dish.save(function(error, data){
                if(error){
                    res.send(500, "Sorry, unable to save the edited the dish at this time.");
                }
                else{
                    res.send(200, dish);
                }
            });
        }
    });
};

exports.deleteDish = function(req, res){
    DishModel.findById(req.params.id, function(err, dish) {
        if (err) {
            res.send(500, "Sorry, unable to retrieve dish to be deleted at this time."
                +err.message+ ")" );
        } else if (!dish) {
            res.send(404, "Sorry, that dish doesn't seem to exist; try reselecting from the browse view");
        } else {
            //Delete images associated with instance
            if(dish.image != "placeholder"){
                fs.unlink(__dirname+'/../public/img/uploads/'+dish.image+".png", function (err) {if (err){console.log(err);}});
                fs.unlink(__dirname+'/../public/img/uploads/'+dish.image+"_thumb.png", function (err) {if (err){console.log(err);}});
            }

            //Delete the instance itself
            dish.remove(function(error){
                if(!error){
                    res.send(200, dish);
                } else {
                    res.send(500, "Sorry, unable to delete dish."
                        +error.message+ ")" );
                }
            });

        }
    });
};

exports.signUp = function(req, res){
    //res.json(200,"Worked");
    //console.log(req.body);
    // /*
	var user = new UserModel(req.body);
	bcrypt.genSalt(10, function(err, salt) {
		// store the hashed-with-salt password in the DB

		bcrypt.hash(user.password, salt, function(err, hash) {
			user.password = hash;// incorporate hash output and salt value
			user.save(function (err, result) {
				if (!err) {
				// set username, userid, and auth status on the session
				req.session.cookie.maxAge = config.timeout;
				req.session.auth = true;
				req.session.username = result.username;
	    		req.session.userid = result._id;
				// return username and userid to client
				res.send({userid: req.session.userid, username: req.session.username});
				req.session.save(function(err) {});
				// ADD CODE
				} else {
					if (err.err.indexOf("E11000") != -1) {
					// return duplicate-username error response to client
					// could alternatively do a find() on model user.
					res.json(500,"A user with this username already exists.");
					} else {
					// return DB error response to client
					res.json(500,"There was an error with the database and the request could not be fulfilled.");
					}
				}
			});
		});
	});
	// */
};

exports.auth = function(req, res){
	if (req.body.type == "login") {
		//This is a login request
		var username = req.body.username; // get username ;
		var password =  req.body.password; // get password ;
		if (!username || !password) {  // client should have ensured this, but just in case
		// oops, that's an error - what kind of response to generate?  403?
			res.json(400,"Username and password are necessary to Sign In.");
		};
		UserModel.findOne({username : username}, function(err, user){
			if (!err) {
				if(user != null){
					bcrypt.compare(password, user.password , function(err, result) {
						if (result) { // username-password OK
							req.session.auth = true; // user logged in
							req.session.username = user.username;
							req.session.userid = user._id;
							// extend session-life if "remember-me" checked on login form
							if (req.body.remember == 1) {
								req.session.cookie.maxAge = config.timeout_extension;// ... update cookie age ...
							}  else {
								req.session.cookie.maxAge = config.timeout;
							}
							req.session.save(function(err) {});
							res.send({'userid': req.session.userid, 'username': req.session.username});  // return userid/username set to session values
						} else {
							//Wrong password
							res.json(403,"The Sign in credentials provided are invalid.");
						}
						
					});
				} else {
					//Invalid username
					res.json(403,"The Sign in credentials provided are invalid.");
				}

			} else {
			//Could not retrieve user
			res.json(500,"The server could not retrieve the user data at the moment. Please try again later.");
			}
		});
	} else {
		//This is a logout request
  		req.session.auth = false; // ... and reset other session fields]
		req.session.username = null;
		req.session.userid = null;
		res.send({'userid': req.session.userid, 'username': req.session.username});  // return userid and username set to null
	}
};

exports.isAuth = function (req, res) {
  if ((req.session != undefined) && (req.session.auth == true)) {
    res.send({'userid': req.session.userid, 'username': req.session.username});  // return userid and username set to session values
  } else {  // user not authenticated
    res.send({'userid': null, 'username': null});  // return userid and username set to null
  };
};