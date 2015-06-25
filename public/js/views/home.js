var eatz =  eatz || {};

// note View-name (HomeView) matches name of template HomeView.html
eatz.HomeView = Backbone.View.extend({

    initialize: function () {
	this.render();
    },

    render: function () {
	this.$el.html(this.template());  // create DOM content for HomeView
	return this;    // support chaining
    },
    
    events: {
        'click #btnBrowse': "browseDish",
        'click #btnAdd': "addDish"
    },
    browseDish: function(e){
        app.navigate("dishes", {trigger: true, replace: true});
        
    },
    addDish: function(e){
        app.navigate("dishes/add", {trigger: true, replace: true});
    }

});
