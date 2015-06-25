var eatz =  eatz || {};
//Collection model (not an instance of a collection!)
eatz.Dishes = Backbone.Collection.extend({
    model: eatz.Dish,
    //localStorage: new Backbone.LocalStorage('eatz'),
    url: '/dishes',
    initialize: function(){
        return true;
    }
});