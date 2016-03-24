
//var url = "http://192.168.1.5/CodeigniterREST_config/index.php/api;
// var default_ctrl = "event";

var url = "http://192.168.1.244/obs/api/";
	// url for get all controllers GET
var url_ctrls = "http://192.168.1.244/obs/admin/testFunction/TestFunction/get_ctrls";
	// url for get functions depend on a controller POST
var url_funcs = "http://192.168.1.244/obs/admin/testFunction/TestFunction/get_funcs";
	// url for get information of a function POST
var url_info_func = "http://192.168.1.244/obs/admin/testFunction/TestFunction/get_info_of_function";

var app = angular.module('myApp', []);
var caret = ' <span class="caret"></span>';
var response="";
	// used to suffix the param type for radio button
var nthParam=1;



app.controller('myCtrl', function($scope, $http, $compile) {
		
	showDefaultCtrlFunc();
	// triger function when a controller is selected in combo
	$scope.selectCtrl = function(ctrl){
		$scope.ctrl = ctrl;
		console.log("select ctrl: "+ctrl);
			//list functions in combo
		$scope.listFunction(ctrl);	
	} 

	$scope.listFunction = function(ctrl){
		// request object
		var req = {
			method: 'POST',
			url: url_funcs,
			headers: {
				'Authorization': 'Basic '+btoa('admin:1234') //js use btoa('user:password')  or php use = base64encode() YWRtaW46MTIzNA==
			},
			data: { ctrlName: ctrl }
		};

		// manipulate request object
		$http(req).then(function(response){

			if(response.data['code']==1){
				$scope.functions = response.data.data;
				var func = response.data.data[0].action;
				console.log($scope.functions);
				$scope.selectFunction(func);  // after list select the first function by default
			}else{
				alert(response.data['description']);
			}
			
		}, function(error){
			console.log(error);
		});
	} 

	$scope.selectFunction = function(funcName){

		$scope.func = funcName;   
		console.log("select function: "+funcName);
		$('#function-name').html(funcName+caret);
		$scope.url = url+$scope.ctrl+"/"+$scope.func;
		$('#url-box').val($scope.url);

		$scope.showMethodNParamForm(funcName);
	} 

	$scope.showMethodNParamForm = function(funcName) {
		console.log("show param form for function: "+funcName);
		// request object
		var req = {
			method: 'POST',
			url: url_info_func,
			headers: {
				'Authorization': 'Basic '+btoa('admin:1234') //js use btoa('user:password')  or php use = base64encode() YWRtaW46MTIzNA==
			},
			data: { funcName: funcName }
		};

		// manipulate request object
		$http(req).then(function(response){
			if(response.data['code']==1){
				console.log(response);
				$scope.info_func = response.data.data;
				$scope.method = response.data.data[0].method;
				$scope.params = response.data.data[0].params;
			}else{
				alert(response.data['description']);
			}
			
		}, function(error){
			console.log(error);
		});
	}

	// handle submit button with jQuery and request data with AngularJS (submit form to get data back from server)
	$('#form-param').submit(function(e){
		
		 // Using ajax to post data to server cus it works well with file upload
		$.ajax( {
			  url: $scope.url,
			  method: $scope.method,
			  headers: {
			  	'Authorization': 'Basic '+btoa('admin:1234') //js use btoa('user:password')  or php use = base64encode() YWRtaW46MTIzNA==
			  },
			  data: new FormData( this ),
			  processData: false,
			  contentType: false,
			  success: function (response) {	  	
			  	if(response['code']==1){ 
			  		this.response = JSON.stringify(response, null,3);
			  		$('#response').html(this.response);  //output response
			  	}else{ // alert if fail
			  		this.response = JSON.stringify(response, null,3);
			  		$('#response').html(this.response);  //output response
			  		alert(response.message['description']);
			  	}
			  	console.log(response);
			  },
			  error: function (error) {
			  	this.response = JSON.stringify(response, null,3);
			  	$('#response').html(this.response);
			  	console.log(error);
			  }
		} );
		e.preventDefault();
		
	});

	

	function convert_to_js_object (data) {
		var obj = {};
	    $.each(data, function() {
	        if (obj[this.name] !== undefined) {
	            if (!obj[this.name].push) {
	                obj[this.name] = [obj[this.name]];
	            }
	            obj[this.name].push(this.value || '');
	        } else {
	            obj[this.name] = this.value || '';
	        }
	    });
	    return obj;
	}

	$scope.addParam = function() {	
		nthParam+=1; // increment number of param. later use when add new row with radio type spcify name
		var param_input = '<tr class="param-tbl-row">'+
		        	         '<td>'+     	          
		        	         	'<input type="text" class="form-control" name="params" placeholder="parameter name ...">'+
		        	         '</td> '+   
		        	        '<td>'+       
		        	        	'<label class="radio-inline"><input type="radio" value="text" name="type-param'+nthParam+'">text</label>' +
		        	        	'<label class="radio-inline"><input type="radio" value="file" name="type-param'+nthParam+'">file</label>' + 	
		        	        '</td>'+
		        	        '<td>'+
		        	        	'<button type="button" class="btn btn-warning btn-remove-param" onclick="removeParam(this)" aria-label="Left Align" ><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
		        	        '</td>' +     				       
		        	      '</tr>';
		$(param_input).appendTo('#param-tbl-body');//$('#param-tbl-body').append(param_input);
		console.log(nthParam,param_input);
	}
	

	function showDefaultCtrlFunc() {
		// default controller and function when open index.html
		$scope.method = "Method";
		$scope.ctrl = "Profile";  // current selected controller scope variable
		$scope.func = "login";    // current selected function scope variable

			/** request data to to get list of controllers using Angular*/
		// create request object
		var req = {
			method: 'GET',
			url: url_ctrls,
			headers: {
				'Authorization': 'Basic '+btoa('admin:1234') //js use btoa('user:password')  or php use = base64encode() YWRtaW46MTIzNA==
			}
		}
		// process request
		$http(req).then(function(response){
			
			if(response.data['code']==1){
				$scope.controllers = response.data.data; 
		    	this.response = JSON.stringify(response, null,3); // (data,replacer,space)
		        $('#response').html(this.response);
		        $scope.listFunction($scope.ctrl);
			}else{
				$scope.controllers = response.data.data; 
		    	this.response = JSON.stringify(response, null,3); // (data,replacer,space)
		        $('#response').html(this.response);
		        $scope.listFunction($scope.ctrl);
				alert(this.response.message['description']);
			}

		}, function(error){
			console.log(error);
		});
			
	}

	$('#form-add-function').submit(function(e) {

		alert('submit form add new function');
		var form_data = $(this).serializeArray();
		var obj = convert_to_js_object(form_data);
		console.log(obj);

		params = obj.params;
		
	});
	
});

// js functoin to remove row of param when onlick event is fired.  onclick="removeParam(this)"
function removeParam (element) {
	$(element).closest('tr').remove ();
}


