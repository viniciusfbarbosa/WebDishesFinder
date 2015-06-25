var eatz =  eatz || {};

eatz.MapView = Backbone.View.extend({
    //el: '#googleMap',
    initialize: function() {
        this.render();
    },
    render: function() {
    	if(!this.map){
    		this.$el.html(this.template());
		        this.map = new google.maps.Map(
		            this.$el.find("#gMap").get(0),
		            this.model.toJSON()
		        );
    	}
     	if(!this.marker){
        	this.marker = new google.maps.Marker({map: this.map, position: this.map.getCenter(), visible: true});
        }

        return this;
    },
    setCenter: function(lat,lon){
    	this.map.set({center: new google.maps.LatLng(lat, lon)});
    },
    resize: function(){
    	google.maps.event.trigger(this.map, 'resize');
    }
});