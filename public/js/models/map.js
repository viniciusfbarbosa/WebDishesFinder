var eatz =  eatz || {};

eatz.Map = Backbone.Model.extend({
    defaults: {
        center: new google.maps.LatLng(43.784925, -79.185323),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
		panControl: true,
		zoomControl: true,
		mapTypeControl: true,
		scaleControl: true,
		streetViewControl: true,
		overviewMapControl: true
    }
});