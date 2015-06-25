var eatz = eatz || {};

eatz.utils = {

    // Asynchronously load templates located in separate .html files
    loadTemplates: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (eatz[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    eatz[view].prototype.template = _.template(data);
                }));
            } else {
                console.log(view + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    },
    
    uploadFile: function(files, model, callback){   
        var formData = new FormData();
       	$.each(files, function(key, value)
    	{
    		formData.append(key, value);
    	});
        
        $.ajax({
          type: "POST",
          url: '/dishes/image',
          data: formData,
          contentType: false,
          processData: false,
          success: function(){
            //console.log('success');
          },
          dataType: 'json'
        }).done(function(data){
            callback(data,model);
        });
    },
    //TODO: Add publish-subscribe event watcher

    showNotice: function(message, type){
      //get content selector
      var content_selector = $('#notice');

      $(content_selector).show(function(){
        switch(type){
          case 'error':
            content_selector.addClass('alert alert-danger').html(message);
            break;
          case 'success':
            content_selector.addClass('alert alert-success').html(message);
            break;
          case 'warning':
            content_selector.addClass('alert alert-warning').html(message);
            break;
          case 'info':
            content_selector.addClass('alert alert-info').html(message);
            break;
          default:
            break;
        }
      });

    },

    hideNotice: function(type){
      //get content selector
      var content_selector = $('#notice');

      $(content_selector).hide(5000, function(){
        switch(type){
          case 'error':
            content_selector.removeClass('alert alert-danger').html();
            break;
          case 'success':
            content_selector.removeClass('alert alert-success').html();
            break;
          case 'warning':
            content_selector.removeClass('alert alert-warning').html();
            break;
          case 'info':
            content_selector.removeClass('alert alert-info').html();
            break;
          default:
            break;
        }
      });
    },
    
    signedIn: function(username){
    	$(".lblUserName").html(username);
    	$("#frmSignOut").show();
    	$("#frmSignIn").hide();
    	$("#frmSignUp").hide();
    },
    
    notSignedIn: function(){
    	$("#frmSignOut").hide();
    	$("#frmSignIn").show();
    	$("#frmSignUp").show();
    },
    
    checkAuth: function(sucess,error){
    	var success_cb = sucess;
    	var error_cb = error;
		$.ajax({
			type: "GET",
			url: '/auth',
			success: function(data){
				if(success_cb != undefined){
					success_cb(data);
				}
			},
			error: function(data){
				if(error_cb != undefined){
					error_cb(data);
				}
			}
		});
    }
};


