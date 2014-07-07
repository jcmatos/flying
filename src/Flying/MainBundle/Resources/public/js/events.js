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
		e.preventDefault();
		var search_start_date = $('#search_start_date').val();
		var search_end_date = $('#search_end_date').val();

		var direct_flight = false;
		if ( $('#show_direct_flights').hasClass('active')) direct_flight = true;


		var error=false;

		$('#search_start_date, #search_end_date').css('background-color','#FFF');
		
		if (search_start_date == '') {
			$('#search_start_date').css('background-color','red');
			error=true;
		}
		if (search_end_date == '') {
			$('#search_end_date').css('background-color','red');
			error=true;
		}

		if (search_end_date < search_start_date) {
			$('.datepicker').css('background-color','red');
			error=true;
		}

		if (error) {
			$('html, body').animate({scrollTop: $(".date_content").offset().top-$('#menu_buttons').height()}, 1000);
			return;	
		} 

		var origins = '';
		var stops = '';
		var destinations = '';

		$('.origins_wrapper input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    origins += airport_code + '|';
			}
		});
		if ( $('.remaining_origins').hasClass('active') ) {
			$('.remaining_origins input').each(function(i, obj) {
			    if ($(this).prop('checked')) {
				    airport_code = ($(this).attr('id')).split('_');
				    airport_code = airport_code[1];	
				    origins += airport_code + '|';
				}
			});
		}

	    origins = origins.substring(0, origins.length - 1);

		$('.stops_wrapper input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    stops += airport_code + '|';
			}
	    });
		if ( $('.remaining_stops').hasClass('active') ) {
			$('.remaining_stops input').each(function(i, obj) {
			    if ($(this).prop('checked')) {
				    airport_code = ($(this).attr('id')).split('_');
				    airport_code = airport_code[1];	
				    stops += airport_code + '|';
				}
		    });
	    }

	    stops = stops.substring(0, stops.length - 1);

	    if (!direct_flight) {
			$('.destinations_wrapper input').each(function(i, obj) {
			    if ($(this).prop('checked')) {
				    airport_code = ($(this).attr('id')).split('_');
				    airport_code = airport_code[1];	
				    destinations += airport_code + '|';
			    }
		    });
			if ( $('.remaining_destinations').hasClass('active') ) {
				$('.remaining_destinations input').each(function(i, obj) {
			    if ($(this).prop('checked')) {
				    airport_code = ($(this).attr('id')).split('_');
				    airport_code = airport_code[1];	
				    destinations += airport_code + '|';
			    }
		    });
			}
		}

	    destinations = destinations.substring(0, destinations.length - 1);

	    if (direct_flight) destinations='direct_flight';


		$('.airports_content h3').css('color','#333');

		if (origins.length <= 1) {
			$('#origins_title').css('color','red');
			error = true;
		}

		if (stops.length <= 1) {
			$('#stops_title').css('color','red');
			error = true;
		}

		if (destinations.length <= 1) {
			$('#destinations_title').css('color','red');
			error = true;
		}

		if (error) {
			if (!$('#airports_btn').hasClass('active')) $('#airports_btn').click();
			$('html, body').animate({scrollTop: $(".airports_content").offset().top-$('#menu_buttons').height()}, 1000);
			return;	
		} 

		window.location = '/results/' + search_start_date + '/' + search_end_date + '/' + origins + '/' + stops + '/' + destinations;
		return false; 
	});

	$('.resizable_wrapper > button').click(function(){
		var content = $(this).siblings('section');
		show_hide_elements($(this), content);

	});

	$(".search_results").on('click', '.res_title', function(){
		if ( $(this).hasClass('active') ){
			var height_to_close = 36;
			if ( $(window).width() <= 670) height_to_close = 96;
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

		// marcar como seleccionado
		$('.one_result').removeClass('go_selected');
		$(this).closest('.one_result').addClass('go_selected');

		var date_of_flight = $(this).attr('data-date');


		if(options_validation()) {
		
			var min_return_date = new Date(date_of_flight);
			min_return_date.setDate(min_return_date.getDate() + min_return_days);
			min_return_date = min_return_date.getFullYear() + '-' + ("0" + (min_return_date.getMonth() + 1)).slice(-2) + '-' + ("0" + min_return_date.getDate()).slice(-2);
			

			var max_return_date = new Date(date_of_flight);
			max_return_date.setDate(max_return_date.getDate() + max_return_days);
			max_return_date = max_return_date.getFullYear() + '-' + ("0" + (max_return_date.getMonth() + 1)).slice(-2) + '-' + ("0" + max_return_date.getDate()).slice(-2);

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
		if ( !$('#going_btn').hasClass('active') ) $('#going_btn').click();
		$("html, body").animate({ scrollTop: $('#going_btn').offset().top }, 500);
	});

	$('#menu_returning_btn').click(function() {
		if ( !$('#returning_btn').hasClass('active') ) $('#returning_btn').click();
		$("html, body").animate({ scrollTop: $('#returning_btn').offset().top }, 500);
	});



	$(".search_results").on('click', '.res_refresh_btn', function(e){
		e.stopPropagation();
		var clicked_el = $(this);

		var id1 = $(this).attr('data-id1');
		
		var id2 = 'direct_flight';
		if (!direct_flight)	var id2 = $(this).attr('data-id2');
		

		$.ajax({  
			type: 'POST',
			url: '/update_existing_flight/' + id1 + '/' + id2,
			success: function(result){

				var updated_prices = $.parseJSON(result);
				
				var parent_el = clicked_el.closest('.one_result');
				
				// actualiza o preco total	
				var total_price = format_price(updated_prices['price1'] + updated_prices['price2']);
				var tokens_total_price = total_price.split('.');

				var res_total = parent_el.find('.res_total');
				res_total.find('.euros').text(tokens_total_price[0]).css('color','green');
				res_total.find('.cents').text('.'+tokens_total_price[1]).css('color','green');

				// actualiza o preco do voo 1	
				var price1 = format_price(updated_prices['price1']);
				var tokens_price1 = price1.split('.');

				var res_price1 = parent_el.find('.res_price1');
				res_price1.find('.euros').text(tokens_price1[0]).css('color','green');
				res_price1.find('.cents').text('.' + tokens_price1[1]).css('color','green');

				// actualiza o preco do voo 2
				if (!direct_flight) {	
					var price2 = format_price(updated_prices['price2']);
					var tokens_price2 = price2.split('.');

					var res_price2 = parent_el.find('.res_price2');
					res_price2.find('.euros').text(tokens_price2[0]).css('color','green');
					res_price2.find('.cents').text('.'+tokens_price2[1]).css('color','green');
				}

				clicked_el.animate({ opacity: 0 }, 400);
				

			},
			error: function() {
				alert('Erro ao actualizar o voo');
			}

		});
	});

	function options_validation() {

		if ( $('#flight_price').val() == '') max_flight_price = max_flight_price_default;
		else max_flight_price = parseFloat($('#flight_price').val());
	
		if ( $('#trip_price').val() == '') max_trip_price = max_trip_price_default;
		else max_trip_price = parseFloat($('#trip_price').val());
		
		if ( $('#min_time').val() == '') min_wait_time = min_wait_time_default;
		else min_wait_time = parseFloat($('#min_time').val())*60;
		
		if ( $('#max_time').val() == '') max_wait_time = max_wait_time_default;
		else max_wait_time = parseFloat($('#max_time').val())*60;

		if ( $('#min_days').val() == '') min_return_days = min_return_days_default;
		else min_return_days = parseFloat($('#min_days').val());

		if ( $('#max_days').val() == '') max_return_days = max_return_days_default;
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


	$(".origins_wrapper input, .remaining_origins input").on('change', function(e){
		check_origin_stop_routes();
		check_stop_destination_routes();
		check_origin_destination_routes();
	});

	$(".stops_wrapper input, .remaining_stops input").on('change', function(e){
		check_stop_destination_routes();
		check_origin_destination_routes();

	});

	// adicionar uma viagem
	$(".chosen-select").on('change', function(e){

		if ($(".chosen-select").hasClass('inactive')) return;

		var sel_origin = $('#sel_origin').val();
		var sel_destination = $('#sel_destination').val();
		$('.stops_add_list').html('');
		$('#no_flights_msg').hide();
		$('#add_trip_btn').hide();

		// se estiverem os 2 preenchidos
		if (sel_origin != '' && sel_destination != '') {
			$('.add_trip_content .chosen-single').removeClass('error_bkg');

			// se forem iguais
			if (sel_origin == sel_destination) {
				$('.add_trip_content .chosen-single').addClass('error_bkg');
				return;	
			} 


			// verifica se e' voo directo
			var direct_flight=false;
			for (i=0; i<all_routes.length; i++) {
				if (all_routes[i].origin == sel_origin && all_routes[i].destination == sel_destination) direct_flight = true;
			}

			// caso seja voo directo
			if (direct_flight) {
				$('#add_trip_btn').fadeIn();
			}
			else { // vai ver as escalas
				origin_routes = new Array;
				destination_routes = new Array;

				for (i=0; i<all_routes.length; i++) {
					if (all_routes[i].origin == sel_origin) origin_routes.push(all_routes[i].destination);
					if (all_routes[i].origin == sel_destination) destination_routes.push(all_routes[i].destination);
				}

				intersection = $(origin_routes).filter(destination_routes);

				if (intersection.length == 0) {
					$('#no_flights_msg').fadeIn();
					return;
				}

				for (i=0; i<intersection.length; i++) {
					
					// verifica se esta escala ja existe nas origens (ou destinos). Se sim, uma origem/destino nao pode ser escala
					var css_style = "";
					if ( $('.origins_wrapper #origchk_' + intersection[i]).length ) css_style = 'visibility: hidden;';	

					$('.stops_add_list').append('<div class="chk_lbl_wrapper"><input type="checkbox" id="addchk_' + intersection[i] + '" class="css-checkbox med" style="' + css_style + '" checked="checked"/><label for="addchk_' + intersection[i]+'" name="" class="css-label med elegant">' + airport_list[intersection[i]] + '</label><br></div>');
					
				}
				$('#add_trip_btn').fadeIn();

			}

		}



	});
	
	$('#add_trip_btn').click(function () {

		var stops_add_list='';

		$('.stops_add_list input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    stops_add_list += airport_code + '|';
		    }
	    });
	    stops_add_list = stops_add_list.substring(0, stops_add_list.length - 1);

	    if(stops_add_list.length<1) stops_add_list = 'none';

	    var sel_origin = $('#sel_origin').val();
		var sel_destination = $('#sel_destination').val();


		$.ajax({  // adiciona os aeroportos
			type: 'POST',
			url: '/add_trip/' + sel_origin + '/' + stops_add_list + '/' + sel_destination,
			success: function(result){
					if (result=='success') { // se adicionou os aeroportos, vai entao actualizar as viagens, e colocar o botao a verde
						$('#add_trip_btn').hide();
						$('.add_trip_content .label-success').fadeIn();
						$(".chosen-select").addClass('inactive');


						$.ajax({  // adiciona os aeroportos
							type: 'POST',
							url: '/populate_next_flights',
							success: function(result){
							},
							error: function() {
								alert('Erro ao actualizar a lista de voos');
							}

						});
					}
			},
			error: function() {
				alert('Erro ao inserir viagem');
			}

		});

	});


	$('#remove_airports_btn').click(function () {

		var airports = '';
		var airports_array = new Array;
		$('.remove_origins_wrapper input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    airports += airport_code + '|';
			    airports_array.push(airport_code);
			}
		});
		$('.remove_stops_wrapper input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    airports += airport_code + '|';
			    airports_array.push(airport_code);
			}
	    });
	    airports = airports.substring(0, airports.length - 1);

	    if (airports.length < 1) return;

	    $.ajax({  // adiciona os aeroportos
			type: 'POST',
			url: '/remove_airports/' + airports,
			success: function(result){
					if (result=='success') { // se adicionou os aeroportos, vai entao actualizar as viagens, e colocar o botao a verde
						
						//remove os elementos relativos aos aeroportos eliminados
						for (i=0; i<airports_array.length; i++) {
							$('.clw_' + airports_array[i]).remove();
						}

						$('#remove_airports_btn').fadeOut();
					}
			},
			error: function() {
				alert('Erro ao remover aeroportos');
			}

		});

	});


	$('.show_remaining_airports').click(function () {
		$(this).hide();
		$(this).siblings('.remaining_airports_wrapper').addClass('active').show();
		check_origin_stop_routes();
		check_stop_destination_routes();
		check_origin_destination_routes();
	});

	$('#show_direct_flights').click(function () {

		if ( $(this).hasClass('active') ) return;
		$(this).addClass('active');
		$('#show_stop_flights').removeClass('active');

		// troca os titulos h3 das escalas pelos destinos
		var html_temp = $('#stops_title').html();
		$('#stops_title').html($('#destinations_title').html())
		$('#destinations_title').html(html_temp);
		$('.destinations_col').hide();
		$('.show_remaining_airports').click();
	});

	$('#show_stop_flights').click(function () {

		if ( $(this).hasClass('active') ) return;
		$(this).addClass('active');
		$('#show_direct_flights').removeClass('active');


		// troca os titulos h3 das escalas pelos destinos
		var html_temp = $('#stops_title').html();
		$('#stops_title').html($('#destinations_title').html())
		$('#destinations_title').html(html_temp);
		$('.destinations_col').show();

	});

	$('#update_btn').click(function () {
	    

		$('#update_btn').hide();
		$('.updating_flights').fadeIn();

		$.ajax({
			type: 'POST',
			url: '/results_request/' + url_to_update,
			success: function(result){
				if (result=='success') {
					 setCookie('requesting', 'no', 1);
					 location.reload();
				} 
				else if (result == 'limit') {
					console.log('Limite atingido. Tera que pedir novamente...');	
					setCookie('requesting', 'yes', 1)
					location.reload();
				}
				else {
					console.log('Erro desconhecido:');
					console.log(result);
				}
			},
			error: function() {
				alert('Erro. Voos nao actualizados.');
				return;
			}
		});

		
	});


	$('.airports_title').click(function () {
		$(this).siblings('div').find('input').each(function(i,obj){
			$(obj).prop('checked', false);
		});

		if ($(this).siblings('div').hasClass('origins_wrapper')) {
			check_origin_stop_routes();
			check_stop_destination_routes();
			check_origin_destination_routes();	
		}
		else if ($(this).siblings('div').hasClass('stops_wrapper')) {
			check_stop_destination_routes();
		}
			

	});

	$(".search_results").on('click', '.res_email_btn', function(ev){
		ev.stopPropagation();
		$('#send_email_to').css('background-color','white');
		$('.input_email').fadeIn();
		
		email_return_id1 = $(this).siblings('.res_refresh_btn').attr('data-id1');

		email_return_id2 = 'direct_flight';
		if (!direct_flight)	email_return_id2 = $(this).siblings('.res_refresh_btn').attr('data-id2');
		
		email_go_id1 = $('.go_selected .res_refresh_btn').attr('data-id1');
		email_go_id2 = 'direct_flight';
		if (!direct_flight)	email_go_id2 = $('.go_selected .res_refresh_btn').attr('data-id2');

	});

	$(".input_email").click(function (ev) {
		$(this).fadeOut();
	});

	$(".input_email input").click(function (ev) {
		ev.stopPropagation();
	});
	
	$("#send_email").click(function (ev) {
		ev.stopPropagation();
		
		var send_email_to = $('#send_email_to').val();

		if (!validateEmail(send_email_to)) {
			$('#send_email_to').css('background-color','red');
			return;
		}

		$(".input_email").fadeOut();

	    $.ajax({  // adiciona os aeroportos
			type: 'POST',
			url: '/send_email/' + email_go_id1 + '/' + email_go_id2 + '/' + email_return_id1 + '/' + email_return_id2 + '/' + send_email_to,
			success: function(result){
				if (result == '0') alert('Email nao enviado');
			},
			error: function() {
				alert('Erro ao enviar email');
			}

		});
		return false;
	});


	$( ".datepicker" ).datepicker({ dateFormat: 'yy-mm-dd' });;

});

function validateEmail(email) { 
  
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


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
	
	if ( $('.remaining_origins').hasClass('active') ) {
		$('.remaining_origins input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    origins.push(airport_code);
			}
		});
	}


	$('.stops_wrapper input').each(function(i, obj) {
	    airport_code = ($(this).attr('id')).split('_');
	    id_prefix = airport_code[0] + '_';
	    airport_code = airport_code[1];	
	    stops.push(airport_code);

		//primeiro elimina todos os stops
		$(this).attr('checked', false).parent().hide();
    });
    
	if ( $('.remaining_stops').hasClass('active') ) {
		$('.remaining_stops input').each(function(i, obj) {
		    airport_code = ($(this).attr('id')).split('_');
		    id_prefix = airport_code[0] + '_';
		    airport_code = airport_code[1];	
		    stops.push(airport_code);

			//primeiro elimina todos os stops
			$(this).attr('checked', false).parent().hide();
	    });

	}

	for (or=0; or<origins.length; or++) {
		for (st=0; st<stops.length; st++) {
			if ( check_route(origins[or], stops[st]) ) {
				$('#' + id_prefix + stops[st]).prop('checked', true).parent().show();	
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
	if ( $('.remaining_stops').hasClass('active') ) {
		$('.remaining_stops input').each(function(i, obj) {
		    if ($(this).prop('checked')) {
			    airport_code = ($(this).attr('id')).split('_');
			    airport_code = airport_code[1];	
			    stops.push(airport_code);
			}
		});
	}


	$('.destinations_wrapper input').each(function(i, obj) {
	    airport_code = ($(this).attr('id')).split('_');
	    id_prefix = airport_code[0] + '_';
	    airport_code = airport_code[1];	
	    destinations.push(airport_code);

		//primeiro elimina todos os stops
		$(this).attr('checked', false).parent().hide();
    });

	if ( $('.remaining_destinations').hasClass('active') ) {
		$('.remaining_destinations input').each(function(i, obj) {
		    airport_code = ($(this).attr('id')).split('_');
		    id_prefix = airport_code[0] + '_';
		    airport_code = airport_code[1];	
		    destinations.push(airport_code);

			//primeiro elimina todos os stops
			$(this).attr('checked', false).parent().hide();
	    });
	}

	for (st=0; st<stops.length; st++) {
		for (de=0; de<destinations.length; de++) {
			if ( check_route(stops[st], destinations[de]) ) {
				$('#' + id_prefix + destinations[de]).prop('checked', true).parent().show();	
			}
		}
	}

}


// apenas para nao permitir ter o mesmo aeroporto na origem e no destino
function check_origin_destination_routes() {
	$('.origins_wrapper input, .remaining_origins input').each(function(i, obj) {
	    if ($(this).prop('checked')) {
		    airport_code = ($(this).attr('id')).split('_');
		    airport_code = airport_code[1];	
		    if ($('#destchk_' + airport_code).length > 0 ) {
		    	$('#destchk_' + airport_code).attr('checked', false).parent().hide();
		    }
		}
	});
}

function check_route(from, to) {
	for (i=0; i<all_routes.length; i++) {
		if (all_routes[i].origin == from && all_routes[i].destination == to) {
			return true;
		}
	}
	return false;
}

