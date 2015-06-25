var eatz =  eatz || {};
//Dish object model (not an instance of a dish object!)
eatz.Dish = Backbone.Model.extend({

    idAttribute: "_id",

    defaults: {
        name: "Grande",
        venue: "Burger King",
        info: "Burgers and fries",
        number: "1265",
        street: "Military Trail",
        city: "Scarborough",
        province: "ON",
        url: "http://www.bk.ca",
        image: "placeholder",
        lat: 43.784925,
        lon: -79.185323
    },

    validURL: function(str) {
      var pattern = new RegExp("(http|ftp|https)://[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?"); // fragment locator
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
    },

    validName: function(str){
      var re = /^(?! )((?!  )(?! $)[a-zA-Z ]){3,50}$/;
      return re.test(str);
    },

    validAlphaNumericString: function(str){
      var re = /[A-Za-z0-9]+/;
      return re.test(str);
    },
    
    validate: function(attrs, options){
    	
      if (!(this.validName(this.attributes.name))){
          return 'Name is a required field and cannot be empty.';
      }
      if (!(this.validAlphaNumericString(this.attributes.venue))){
          return 'Venue is a required field and cannot be empty.';
      }
      if ( this.attributes.number.length < 1 || !this.attributes.info){
          return 'Info is a required field and cannot be empty.';
      }
     if ( !(this.validURL(this.attributes.url)) || !this.attributes.url){
          return 'URL is a required field and cannot be empty.';
      }
      if ( this.attributes.number.length < 1 || !this.attributes.number){
          return 'Number is a required field and cannot be empty.';
      }
      if ( this.attributes.street.split(' ').length < 1 || !this.attributes.street){
          return 'Street is a required field and cannot be empty.';
      }
      if ( this.attributes.city.split(' ').length < 1 || !this.attributes.city){
          return 'City is a required field and cannot be empty.';
      }
      
    }

});