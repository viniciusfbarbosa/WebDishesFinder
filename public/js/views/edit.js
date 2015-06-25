var eatz =  eatz || {};

// note View-name (EditView) matches name of template EditView.html
eatz.EditView = Backbone.View.extend({

    initialize: function () {
		this.uploadedImg = '';
		this.render();
      // console.log(this.model, this.model.collection);
    },

    render: function () {
        //Load own template
        this.$el.html(this.template(this.model.toJSON()));
        //Define the centre of the map
        var mapCenter = new google.maps.LatLng(this.model.get("lat"), this.model.get("lon"));
        // if(this.mapView){
        // 	mapCenter = this.mapView.map.getCenter();
        // }
        //Create map model
        var mapModel = new eatz.Map({center: mapCenter});
        //Create map view
		this.mapView = new eatz.MapView({ model: mapModel });
		this.mapView.resize();
		//Insert map view into the mapContainer div
		this.$el.find("#mapContainer").replaceWith(this.mapView.$el);
        return this;    // support chaining
    },
    
    events: {
        'click #btnSave': "addDish",
        'click #btnDelete': "deleteDish",
        "change #frmDishEdit input":  "changeModel",
        "change #uploadImage": "previewImg",
        "drop #uploadPreview": "dropEvent",
        "dragover": "dragEvent",
        "click #btnLocation": "getLocation"
    },
    
    changeModel: function(e) {
        var element = $(e.currentTarget);
    	var inputvalue = $(e.currentTarget).val().trim();
    	inputvalue = _.escape(inputvalue);
    	switch ($(e.currentTarget).attr("name")) {
    	case 'name':
    		  this.model.set("name", inputvalue);
    		break;
    	case 'venue':
    		  this.model.set("venue", inputvalue);
    		break;
    	case 'info':
    			this.model.set("info", inputvalue);
    		break;
    	case 'number':
    			this.model.set("number", inputvalue);
    		break;
    	case 'street':
    			this.model.set("street", inputvalue);
    		break;
    	case 'city':
    			this.model.set("city", inputvalue);
    		break;
    	case 'province':
         		 this.model.set("province", inputvalue);
    		break;
    	case 'url':
    			this.model.set("url", inputvalue);
    		break;
    	default:
    		break;
    	}
        if(!this.model.isValid()){
            element.parent().addClass('error').children('.help-inline').html(this.model.validationError);
        } else {
            element.parent().removeClass('error').children('.help-inline').html('');
        }
    },
    
    previewImg: function(e){
        var imgselector = $(e.currentTarget)[0];
        var oFReader = new FileReader();
        this.uploadedImg = imgselector.files;
        oFReader.readAsDataURL(this.uploadedImg[0]);
        oFReader.onload = function (oFREvent) {
            $("#uploadPreview").attr('src',oFREvent.target.result);
        };
    },
    
    dropEvent: function(e){
        e.stopPropagation();
        e.preventDefault();
        files = e.originalEvent.dataTransfer.files;
        var oFReader = new FileReader();
        this.uploadedImg = files;
        oFReader.readAsDataURL(this.uploadedImg[0]);
        oFReader.onload = function (oFREvent) {
            $("#uploadPreview").attr('src',oFREvent.target.result);
        };
    },
    
    dragEvent: function(e){
        e.stopPropagation();
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = "copy";
    },
    
    addDish: function(e){
    	var self = this;
    	var toApp = app;
    	eatz.utils.checkAuth(function(data){
			if(data.userid != null){
				//Add dish
		        if(self.uploadedImg[0]){
		            eatz.utils.uploadFile(self.uploadedImg, self.model, function(data,model){
		                model.set("image",data.filename);
		                //Save the model (after ajax request has returned)
		               // model.save();
		                self.model.save(null, {
		                    success : function(model, response){
		                        eatz.utils.showNotice("Dish successfully saved!", "success");
		                        eatz.utils.hideNotice("success");
		                        toApp.navigate("dishes/"+model.get("_id"), {trigger: false, replace: true});
		                    },
		                    error: function(model, response){
		                        eatz.utils.showNotice("Dish could not be saved", "error");
		                        eatz.utils.hideNotice("error");
		                    }
		                });
		                self.render();
		            });
		        } else {
		                //Save the model (no need to wait for the ajax request)
		                //this.model.save();
		                self.model.save(null, {
		                    success : function(model, response){
		                        eatz.utils.showNotice("Dish successfully saved!", "success");
		                        eatz.utils.hideNotice("success");
		                        console.log(toApp);
		                        console.log("dishes/"+model.get("_id"));
		                        toApp.navigate("dishes/"+model.get("_id"), {trigger: false, replace: true});
		                    },
		                    error: function(model, response){
		                        eatz.utils.showNotice("Dish could not be saved", "error");
		                        eatz.utils.hideNotice("error");
		                    }
		                });
		                self.render();
		        }
			} else {
                eatz.utils.showNotice("User must me logged in to save dish. Please log in", "error");
                eatz.utils.hideNotice("error");
			}
    	},function(){
            eatz.utils.showNotice("Server request failed", "error");
            eatz.utils.hideNotice("error");
    	});
    	
 
    },
    
    deleteDish: function(e){
    	var toApp = app;
    	var self = this;
    	
    	eatz.utils.checkAuth(function(data){
    		if(data.userid != null){
    			//Remove dish
	    		self.model.destroy({
		            success : function(model, response){
		                eatz.utils.showNotice("Dish successfully deleted!", "success");
		                eatz.utils.hideNotice("success");
		                toApp.navigate("dishes", {trigger: true, replace: true});
		            },
		            error: function(model, response){
		                eatz.utils.showNotice("Dish could not be deleted", "error");
		                eatz.utils.hideNotice("error");
		            }
				});
    		} else {
    			//Error: user not logged in
    		}
    	},function(data){
    		//Error checking if the client is logged in

    	});

    },

    getLocation: function(e){
        var self = this;
        if (navigator.geolocation) {
            var timeoutVal = 10 * 1000 * 1000;
            var ageVal = 30 * 1000 * 1000;
            navigator.geolocation.getCurrentPosition(
            function(position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                $.ajax({
                      type: "GET",
                      url: 'https://geocoder.ca',
                      data: {'latt': latitude,
                                            'longt': longitude,
                                            'reverse': 1,
                                            'json': 1,
                                            'geoit': "XML"
                                           },
                      success: function(data){
                        $("input[name='number']").val(data.stnumber).trigger("change");
                        $("input[name='street']").val(data.staddress).trigger("change");
                        $("input[name='city']").val(data.city).trigger("change");
                        $("input[name='province']").val(data.prov).trigger("change");
                      },
                      error: function(data){
                        console.log(data);
                      }
                });
                self.model.set("lat", latitude);
                self.model.set("lon", longitude);
                self.render();

            }, 
            function(error) {
                  var errors = { 
                    1: 'Permission denied',
                    2: 'Position unavailable',
                    3: 'Request timeout'
                  };
                  eatz.utils.showNotice(errors[error.code], "error");
                  eatz.utils.hideNotice("error");
                  //console.log("Error: " + errors[error.code]);
                },
            { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: ageVal }
          );
        }
        else {
            eatz.utils.showNotice("Geolocation is not supported by this browser", "error");
            eatz.utils.hideNotice("error");
            //console.log("Geolocation is not supported by this browser");
        }
    }

});