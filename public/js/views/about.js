var eatz =  eatz || {};

// note View-name (AboutView) matches name of template AboutView.html
eatz.AboutView = Backbone.View.extend({

    initialize: function () {
	this.render();
    },

    render: function () {
	this.$el.html(this.template());  // create DOM content for AboutView
	return this;    // support chaining
    }

});
