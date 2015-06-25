var eatz =  eatz || {};

// note View-name (HeaderView) matches name of template HeaderView.html
eatz.HeaderView = Backbone.View.extend({

    initialize: function () {
	this.render();
    },

    render: function () {
    	this.$el.html(this.template());  // create DOM content for HeaderView
    	return this;    // support chaining
    },
    
    events: {
        'click input[type="radio"][name="sort"]': "sort",
        'click #btnSignUp': "signUp",
        'click #btnSignIn': "signIn",
        'click #btnSignOut': "signOut"
    },
    
    ///Iterates over all menu items and defines only the one that corresponds to the current page as "active"
    selectMenuItem: function(menuItem){
        $(".nav > li > a").each(function(item) {
            if($(this).attr("href") == "#"+menuItem){
                $(this).parent().addClass("active");
            } else {
                $(this).parent().removeClass("active");
            }
        });
    },
    
    sort: function(e){
        eatz.pubSub.trigger('sortDishes', $(e.currentTarget).val());
    },
    
    signUp: function(e){
    	//console.log('signUp');
    	form = $(e.currentTarget).parent();
    	if(form.children('input[name="password"]').val() != form.children('input[name="password2"]').val()){
    		//TODO: Show error that passwords don't match with showNotice
	        eatz.utils.showNotice("Password does not match with username", "error");
	        eatz.utils.hideNotice("error");
    	} else {
    		user = new eatz.User();
	    	user.set("username",_.escape(form.children('input[name="username"]').val()));
	    	user.set("password",_.escape(form.children('input[name="password"]').val()));
	    	user.set("email",_.escape(form.children('input[name="email"]').val()));
	    	user.validate();
	    	if(user.isValid()){
	    	//if(true){
				eatz.users.add(user);
				user.save(null, {
					success : function(model, response){

						form.parent().parent().parent().trigger( "click" );
						eatz.utils.signedIn(user.get("username"));
						eatz.utils.showNotice("Signup Successful! Welcome " + user.get("username"), "success");
            eatz.utils.hideNotice("success");
					},
					error: function(model, response){
            eatz.utils.showNotice(response.responseText.replace(/\"/g, ""), "error");
            eatz.utils.hideNotice("error");
					}
				});
	
	    	} else {
            eatz.utils.showNotice("Could not signup the user! Invalid fields!", "error");
            eatz.utils.hideNotice("error");
	    	}
    	}
    },
    
    signIn: function(e){
    	form = $(e.currentTarget).parent();
    	var remember = (form.children('input[name="remember"]').is(':checked')) ? 1 : 0;
    	$.ajax({
          type: "PUT",
          url: '/auth',
          data: JSON.stringify({'username': _.escape(form.children('input[name="username"]').val()),
								'password': _.escape(form.children('input[name="password"]').val()),
								'remember': remember,
								'type': 'login'
                               }),
          contentType: 'application/json',
          dataType: 'json',
          success: function(data){
          	eatz.utils.signedIn(_.escape(form.children('input[name="username"]').val()));
            eatz.utils.showNotice("Welcome " + _.escape(form.children('input[name="username"]').val()), "success");
            eatz.utils.hideNotice("success");
          },
          error: function(data){
            eatz.utils.showNotice(data.responseText.replace(/\"/g, ""), "error");
            eatz.utils.hideNotice("error");
          }
        });

    },
    
    signOut: function(e){
    	form = $(e.currentTarget).parent();
    	var formData = new FormData();
    	formData.append("type","logout");
    	$.ajax({
          type: "PUT",
          url: '/auth',
          data: formData,
          contentType: false,
          processData: false,
          dataType: 'json',
          success: function(data){
          	eatz.utils.notSignedIn();
            eatz.utils.showNotice("User signed out", "info");
            eatz.utils.hideNotice("info");
          },
          error: function(data){
            eatz.utils.showNotice(data.responseText.replace(/\"/g, ""), "error");
            eatz.utils.hideNotice("error");
          }
        });

    },
});
