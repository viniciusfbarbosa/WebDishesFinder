var eatz =  eatz || {};
eatz.Users = Backbone.Collection.extend({
    model: eatz.User,
    url: '/auth',
    initialize: function(){
        return true;
    }
});