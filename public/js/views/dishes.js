var eatz =  eatz || {};

// note View-name (DishesView) matches name of template DishesView.html
eatz.DishesView = Backbone.View.extend({
    
    initialize: function () {
        //console.log(eatz.pubSub);
        this.render();

    },

    render: function () {
        //Instantiate the dishes collection if it wasn't already done
        if(!eatz.dishes) {
            eatz.dishes = new eatz.Dishes();
        }
        //Fetch the dishes
        var self = this;
        eatz.dishes.fetch({
            success: function(collection, response, options){
                bview = '<ul class="thumbnails">';
                //Gather all dishes and format the content of the dish views as list
                collection.each(function(dish) {
                    dview = new eatz.DishView({model: dish});
                    bview += dview.render().$el.html();
                });
                bview += '</ul>';
                self.$el.html(bview);
                //eatz.utils.showNotice("Successfully retrieved dishes from server", "success");
                //eatz.utils.hideNotice('success');
            },
            error: function(collection, response, options){
                if (response.statusCode != 200) {
                //Use response from the server to call showNotice
                eatz.utils.showNotice("Couldn't retrieve dishes from server", "error");
                eatz.utils.hideNotice('error');
                } 
            }
            
        });
    	  // create DOM content for DishesView
   	    return this;    // support chaining
    }

});