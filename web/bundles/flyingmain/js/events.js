//Eventos para fechar e abrir as tabs

$(function() {

	$('#options_form').submit(function (e){
		e.preventDefault();


		if(options_validation()) {
		
			// datas de limite de procura, e false indica que e' uma ida
			get_trips('1111-01-01', '2999-01-01', false, 0);
			$(".search_results.going").show();
			$('#going_btn').show().css('display','block');
			$(".search_results.going").mCustomScrollbar({
            	theme:"dark",
            	set_height: 450,
            	advanced:{
				    updateOnContentResize: true
				}

            });
			$("html, body").animate({ scrollTop: $('#going_btn').offset().top }, 500);

			return false;


		}

	});

	$('#initial_form').submit(function (e){
		var search_start_date = $('#search_start_date').val();
		var search_end_date = $('#search_end_date').val();

		var origins='';
		var stops='';
		var destinations='';

		$('.origins_wrapper input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    origins+=airport_code+'|';
			}
		});
	    origins = origins.substring(0, origins.length - 1)

		$('.stops_wrapper input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    stops+=airport_code+'|';
			}
	    });
	    stops = stops.substring(0, stops.length - 1)

		$('.destinations_wrapper input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    destinations+=airport_code+'|';
		    }
	    });
	    console.log('destinations:'+destinations);
		window.location = '/results/'+search_start_date+'/'+search_end_date+'/'+origins+'/'+stops+'/'+destinations;
		return false; 
	});

	$('#airports_btn').click(function() {
		var content = $(".airports_content");
		show_hide_elements($(this), content);
	});

	$('#options_btn').click(function () {
		var content = $(".options_content");
		show_hide_elements($(this), content);
	});
	
	$('#going_btn').click(function () {
		var content = $(".search_results_wrapper.going");
		show_hide_elements($(this), content);
	});

	$('#returning_btn').click(function () {
		var content = $(".search_results_wrapper.returning");
		show_hide_elements($(this), content);
	});

	$(".search_results").on('click', '.res_title', function(){
		if ( $(this).hasClass('active') ){
			var height_to_close=36;
			if ( $(window).width()<=670) height_to_close = 96;
			$(this).parent().parent().animate({ height: height_to_close }, 400);
			$(this).removeClass('active');

		}
		else {
			var el = $(this).parent().parent(),
			curHeight = el.height(),
	    	autoHeight = el.css('height', 'auto').height(); //temporarily change to auto and get the height.

		    el.height(curHeight).animate({ height: autoHeight }, 400, function() {
		        el.css('height', 'auto'); 
		    });

		    $(this).addClass('active');
		}


	});

	$(".search_results").on('click', '.res_return_btn', function(e){
		e.stopPropagation();

		$('.going .res_title').css('font-weight', 'normal');
		$(this).parent().css('font-weight','bold');

		var date_of_flight = $(this).attr('data-date');


		if(options_validation()) {
		
			var min_return_date = new Date(date_of_flight);
			min_return_date.setDate(min_return_date.getDate()+min_return_days);
			min_return_date = min_return_date.getFullYear()+'-'+("0" + (min_return_date.getMonth()+1)).slice(-2)+'-'+("0" + min_return_date.getDate()).slice(-2)
			

			var max_return_date = new Date(date_of_flight);
			max_return_date.setDate(max_return_date.getDate()+max_return_days);
			max_return_date = max_return_date.getFullYear()+'-'+("0" + (max_return_date.getMonth()+1)).slice(-2)+'-'+("0" + max_return_date.getDate()).slice(-2)

			get_trips(min_return_date, max_return_date, true, date_of_flight);
			$(".search_results.returning").show();
			$('#returning_btn').show().css('display','block');
			$(".search_results.returning").mCustomScrollbar({
            	theme:"dark",
            	set_height: 450,
            	advanced:{
				    updateOnContentResize: true
				}

            });

			$("html, body").animate({ scrollTop: $('#returning_btn').offset().top }, 500);


		}

	});

	function show_hide_elements(button, content) {

		if ( button.hasClass('active') ){
			content.animate({ height: -2 }, 400, function() { 
				content.hide();
			});
			button.removeClass('active');

		}
		else {
			content.show();
			var el = content,
			curHeight = el.height(),
	    	autoHeight = el.css('height', 'auto').height(); //temporarily change to auto and get the height.

		    el.height(curHeight).animate({ height: autoHeight }, 400, function() {
		        el.css('height', 'auto'); 
		    });

		    button.addClass('active');
		}
	}

	$('#menu_home_btn').click(function() {
		window.location = 'http://'+window.location.hostname;		
	});

	$('#menu_airports_btn').click(function() {
		if ( !$('#airports_btn').hasClass('active') ) $('#airports_btn').click();
		$("html, body").animate({ scrollTop: $('#airports_btn').offset().top }, 500);
	});

	$('#menu_options_btn').click(function() {
		if ( !$('#options_btn').hasClass('active') ) $('#options_btn').click();
		$("html, body").animate({ scrollTop: $('#options_btn').offset().top }, 500);
	});

	$('#menu_info_btn').click(function(ev) {
		ev.stopPropagation();
		if ( $('#top_menu').hasClass('active') ) {
			$('#top_menu').removeClass('active')
		}
		else {
			$('#top_menu').addClass('active')
		}
	});

	$('html').click(function() {
		if ($('#top_menu').hasClass('active')) $('#top_menu').removeClass('active');
	});



	$('#menu_going_btn').click(function() {
		$('#refine_btn').click();
		$("html, body").animate({ scrollTop: $('#going_btn').offset().top }, 500);
	});

	$('#menu_returning_btn').click(function() {
		$("html, body").animate({ scrollTop: $('#returning_btn').offset().top }, 500);
	});



	$(".search_results").on('click', '.res_refresh_btn', function(e){
		e.stopPropagation();
		var clicked_el=$(this);

		var id1 = $(this).attr('data-id1');
		var id2 = $(this).attr('data-id2');
		
		$.ajax({  
			type: 'POST',
			url: '/update_existing_flight/'+id1+'/'+id2,
			success: function(result){

				var updated_prices = $.parseJSON(result);
				
				var parent_el = clicked_el.closest('.one_result');
				
				// actualiza o preco total	
				var total_price = format_price(updated_prices['price1']+updated_prices['price2']);
				var tokens_total_price = total_price.split('.');

				var res_total = parent_el.find('.res_total');
				res_total.find('.euros').text(tokens_total_price[0]).css('color','green');
				res_total.find('.cents').text('.'+tokens_total_price[1]).css('color','green');

				// actualiza o preco do voo 1	
				var price1 = format_price(updated_prices['price1']);
				var tokens_price1 = price1.split('.');

				var res_price1 = parent_el.find('.res_price1');
				res_price1.find('.euros').text(tokens_price1[0]).css('color','green');
				res_price1.find('.cents').text('.'+tokens_price1[1]).css('color','green');

				// actualiza o preco do voo 2	
				var price2 = format_price(updated_prices['price2']);
				var tokens_price2 = price2.split('.');

				var res_price2 = parent_el.find('.res_price2');
				res_price2.find('.euros').text(tokens_price2[0]).css('color','green');
				res_price2.find('.cents').text('.'+tokens_price2[1]).css('color','green');

				clicked_el.animate({ opacity: 0 }, 400);
				

			},
			error: function() {
				alert('Erro ao actualizar o voo');
			}

		});
	});

	function options_validation() {

		if ( $('#flight_price').val()=='') max_flight_price = max_flight_price_default;
		else max_flight_price = parseFloat($('#flight_price').val());
	
		if ( $('#trip_price').val()=='') max_trip_price = max_trip_price_default;
		else max_trip_price = parseFloat($('#trip_price').val());
		
		if ( $('#min_time').val()=='') min_wait_time = min_wait_time_default;
		else min_wait_time = parseFloat($('#min_time').val())*60;
		
		if ( $('#max_time').val()=='') max_wait_time = max_wait_time_default;
		else max_wait_time = parseFloat($('#max_time').val())*60;

		if ( $('#min_days').val()=='') min_return_days = min_return_days_default;
		else min_return_days = parseFloat($('#min_days').val());

		if ( $('#max_days').val()=='') max_return_days = max_return_days_default;
		else max_return_days = parseFloat($('#max_days').val());

		validated=true;

		if ( min_wait_time > max_wait_time ) {
			$('#min_time, #max_time').parent().find('span').css('background-color','#F4220B');
			$('#min_time').focus();
			validated=false;
		}

		if ( min_return_days > max_return_days ) {
			$('#min_days, #max_days').parent().find('span').css('background-color','#F4220B');
			$('#min_days').focus();
			validated=false;
		}

		return validated;
	}


	$(".origins_wrapper input").on('change', function(e){
		check_origin_stop_routes();
		check_stop_destination_routes();
		check_origin_destination_routes();
	});

	$(".stops_wrapper input").on('change', function(e){
		check_stop_destination_routes();
	});

	$(".chosen-select").on('change', function(e){
		console.log('changed');
		var sel_origin = $('#sel_origin').val();
		var sel_destination = $('#sel_destination').val();
		console.log('origin:'+sel_origin+'!');
		console.log('destinations:'+sel_destination+'!');

		

	});
	


	$( ".datepicker" ).datepicker({ dateFormat: 'yy-mm-dd' });;

});



function check_origin_stop_routes() {
	var origins = new Array;
	var stops = new Array;
	$('.origins_wrapper input').each(function(i, obj) {
	    if ($(this).prop('checked')) {
		    airport_code = ($(this).attr('id')).split('_');
		    airport_code = airport_code[1];	
		    origins.push(airport_code);
		}
	});

	$('.stops_wrapper input').each(function(i, obj) {
	    airport_code = ($(this).attr('id')).split('_');
	    id_prefix=airport_code[0]+'_';
	    airport_code = airport_code[1];	
	    stops.push(airport_code);

		//primeiro elimina todos os stops
		$(this).attr('checked', false).parent().hide();
    });

	for (or=0; or<origins.length; or++) {
		for (st=0; st<stops.length; st++) {
			if ( check_route(origins[or], stops[st]) ) {
				$('#'+id_prefix+stops[st]).prop('checked', true).parent().show();	
			}
		}
	}

}

function check_stop_destination_routes() {
	var stops = new Array;
	var destinations = new Array;
	$('.stops_wrapper input').each(function(i, obj) {
	    if ($(this).prop('checked')) {
		    airport_code = ($(this).attr('id')).split('_');
		    airport_code = airport_code[1];	
		    stops.push(airport_code);
		}
	});

	$('.destinations_wrapper input').each(function(i, obj) {
	    airport_code = ($(this).attr('id')).split('_');
	    id_prefix=airport_code[0]+'_';
	    airport_code = airport_code[1];	
	    destinations.push(airport_code);

		//primeiro elimina todos os stops
		$(this).attr('checked', false).parent().hide();
    });

	for (st=0; st<stops.length; st++) {
		for (de=0; de<destinations.length; de++) {
			if ( check_route(stops[st], destinations[de]) ) {
				$('#'+id_prefix+destinations[de]).prop('checked', true).parent().show();	
			}
		}
	}

}


// apenas para nao permitir ter o mesmo aeroporto na origem e no destino
function check_origin_destination_routes() {
	$('.origins_wrapper input').each(function(i, obj) {
	    if ($(this).prop('checked')) {
		    airport_code = ($(this).attr('id')).split('_');
		    airport_code = airport_code[1];	
		    if ($('#destchk_'+airport_code).length > 0 ) {
		    	$('#destchk_'+airport_code).attr('checked', false).parent().hide();
		    }
		}
	});
}

function check_route(from, to) {
	for (i=0; i<all_routes.length; i++) {
		if (all_routes[i].origin == from && all_routes[i].destination == to) {
			//console.log('found route: '+from+' to '+to);
			return true;
		}
	}
	return false;
}

