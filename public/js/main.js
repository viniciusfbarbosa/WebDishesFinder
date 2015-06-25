var eatz =  eatz || {};

eatz.AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
        "about": "about",
        "dishes": "browse",
        "dishes/add": "editDish",
        "dishes/:id": "editDish"
    },

    initialize: function() {
        eatz.pubSub = _.extend({}, Backbone.Events);

        var self = this;
        
        //Instantiate the users collection if it wasn't already done
	    if(!eatz.users){
	    	eatz.users = new eatz.Users();
     	}
	    this.home;
	    
	    //Checks if the user is logged in
	    eatz.utils.checkAuth(function(data){
	    	if(data.username != null){
	    		eatz.utils.signedIn(data.username);
	    	}
	    });

        
	   if (navigator.geolocation) {
            var timeoutVal = 10 * 1000 * 1000;
            var ageVal = 30 * 1000 * 1000;
            navigator.geolocation.getCurrentPosition(
            function(position) {
                eatz.userLatitude = position.coords.latitude;
                eatz.userLongitude = position.coords.longitude;
            }, 
            function(error) {
            },
            { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: ageVal }
          );
        }

	    //Load header/menu
        this.loadheader();
        
        //Listener for the dish-sorting event
        eatz.pubSub.on('sortDishes',function(filter){
        	//Instantiate the dishes collection if it wasn't already done
	        if(!eatz.dishes){
	            eatz.dishes = new eatz.Dishes();
	        }
        	
            switch(filter){
            	case 'name':
		            eatz.dishes.comparator = function (dish) {
						return dish.get("name").toLowerCase();
					};
            		break;
            		
            	case 'venue':
		            eatz.dishes.comparator = function (dish) {
						return dish.get("venue").toLowerCase();
					};
            		break;

                case 'distance':
                    eatz.dishes.comparator = function (dish) {
                    var R = 6371; // km
                    var φ1 = dish.get("lat") * Math.PI / 180;
                    var φ2 = eatz.userLatitude * Math.PI / 180;
                    var Δφ = (eatz.userLatitude-dish.get("lat")) * Math.PI / 180;
                    var Δλ = (eatz.userLongitude-dish.get("lon")) * Math.PI / 180;

                    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                            Math.cos(φ1) * Math.cos(φ2) *
                            Math.sin(Δλ/2) * Math.sin(Δλ/2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                    var d = R * c;
                        return d;
                    };
                    break;
            	
            	default:
            		break;
            }
			eatz.dishes.sort();
			
	        if (self.DishesView) {
	            self.DishesView.render();
	        };
        }, this);
        
    },

    loadheader: function(){
        if (!this.HeaderView) {
            this.HeaderView = new eatz.HeaderView();
        };
        $('#header').html(this.HeaderView.el);
    },
    
    home: function() {
             //Load main content
        if (!this.HomeView) {
            this.HomeView = new eatz.HomeView();
        };
        $('#content').html(this.HomeView.el);
        
        this.HeaderView.selectMenuItem("");
    },
    
    about: function() {
        //Load main content
        if (!this.AboutView) {
            this.AboutView = new eatz.AboutView();
        };
        $('#content').html(this.AboutView.el);
        
        //Select the appropriate menu item
        this.HeaderView.selectMenuItem("about");
    },

    browse: function(){
        //Load the Dishes View
        if (!this.DishesView) {
            this.DishesView = new eatz.DishesView();
        };
        
        this.DishesView.render();
        $('#content').html(this.DishesView.el);

        //Select the appropriate menu item
        this.HeaderView.selectMenuItem("dishes");
    },

    editDish: function(id){
        //Instantiate the dishes collection if it wasn't already done
        if(!this.dishes){
            this.dishes = new eatz.Dishes();
        }
        
        this.dishes.fetch({
            success: function(coll){
                if(!id){
                    //If "id" is undefined, populate with default values
                    this.dish = new eatz.Dish();
                    coll.add(this.dish);
                } else {
                    //Populate with values taken from a specific dish
                    this.dish = coll.get(id);
                    if(!this.dish){
                        //If no dish could be found under this ID, create a new one
                        this.dish = new eatz.Dish();
                        coll.add(this.dish);
                    }
                }
                eview = new eatz.EditView({"model": this.dish});
                $('#content').html(eview.render().el);
            },
            error: function(coll){
                eatz.utils.showNotice("Dish could not be found", "error");
                eatz.utils.hideNotice("error");
            }

        });
        
        //Load main content


    this.HeaderView.selectMenuItem("dishes/add");
    //location.reload();
    }

});

eatz.utils.loadTemplates(['HomeView', 'MapView', 'HeaderView', 'AboutView', 'DishView', 'EditView'], function() {
    app = new eatz.AppRouter();
    Backbone.history.start();
});
