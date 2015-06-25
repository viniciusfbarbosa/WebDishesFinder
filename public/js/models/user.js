var eatz =  eatz || {};
//User object model
eatz.User = Backbone.Model.extend({

    idAttribute: "_id",

    defaults: {
        username: "",
        password: "",
        email: ""
           },

    ValidEmail: function(str) {
      var re = /\S+@\S+\.\S+/;
      return re.test(str);
    },
           
    //Will validate own attributes received and return true only if they pass all criterias
    validate: function(attrs, options){
      if ( this.attributes.username.length < 1 || !this.attributes.username){
          return 'User name is a required field and cannot be empty.';
      }
      if ( this.attributes.password.length < 1 || !this.attributes.password){
          return 'Password is a required field and cannot be empty.';
      }
      if ( !(this.ValidEmail(this.attributes.email)) || !this.attributes.email){
          return 'Email is a required field and cannot be empty.';
      }
    }

});