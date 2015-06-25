var eatz =  eatz || {};

// note View-name (DishView) matches name of template DishView.html
eatz.DishView = Backbone.View.extend({
    initialize: function () {
    	this.render();
    },

    render: function () {
    	this.$el.html(this.template(this.model.toJSON()));  // create DOM content for DishView
    	return this;    // support chaining
    }

});