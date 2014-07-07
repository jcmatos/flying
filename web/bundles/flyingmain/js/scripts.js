var all_flights_go1 = new Array;
var all_flights_go2 = new Array;
var all_flights_return1 = new Array;
var all_flights_return2 = new Array;

var all_routes = new Array;


// valores defaults do controlador
var min_wait_time_default;
var max_wait_time_default;
var max_flight_price_default;
var max_trip_price_default;
var result_limit_default;
var min_return_days_default;
var max_return_days_default;
var max_tolerate_wait;

// valores vindos das opcoes definidas
var min_wait_time;
var max_wait_time;
var max_flight_price;
var max_trip_price;
var min_return_days;
var max_return_days;

var flight_results = new Array; // resultados da procura, para depois meter na div de resultados


var airport_list = new Array; // contem os codigos e os nomes reais dos aeroportos


function create_airport(code,text) {
	airport_list[code] = text;
}


function flight(id, origin, destination, flightNumber, departure, arrival, date, price, lastUpdated) {
	this.id = id;
	this.origin = origin;
	this.destination = destination;
	this.flightNumber = flightNumber;
	this.departure = departure;
	this.arrival = arrival;
	this.date = date;
	this.price = price;
	this.lastUpdated = lastUpdated;
}


function create_new_flight(id, origin, destination, flightNumber, departure, arrival, date, price, lastUpdated, type) {

	var one_flight = new flight(id, origin, destination, flightNumber, departure, arrival, date, price, lastUpdated);
	
	
	if (type=='go1') all_flights_go1.push(one_flight);
	else if (type=='go2') all_flights_go2.push(one_flight);
	else if (type=='return1') all_flights_return1.push(one_flight);
	else if (type=='return2') all_flights_return2.push(one_flight);
}


function route(origin, destination) {
	this.origin = origin;
	this.destination = destination;
}

function create_new_route(origin, destination) {
	var one_route = new route(origin, destination);
	all_routes.push(one_route);
}


function one_flight_result(code,price) {
	this.code = code;
	this.price = price;
}


function set_defaults(min_wait_time, max_wait_time, max_flight_price, max_trip_price, result_limit, min_return_days, max_return_days, max_tolerate_wait) {
	this.min_wait_time_default = min_wait_time;
	this.max_wait_time_default = max_wait_time;
	this.max_flight_price_default = max_flight_price;
	this.max_trip_price_default = max_trip_price;
	this.result_limit_default = result_limit;
	this.min_return_days_default = min_return_days;
	this.max_return_days_default = max_return_days;
	this.max_tolerate_wait = max_tolerate_wait;

	console.log(all_flights_return1);
	console.log("-------------");
	console.log(all_flights_return2);

}





function get_trips(search_start_date, search_end_date, returning, date_of_going_flight) {

	if (!returning) $('.search_results.going').html('');
	else $('.search_results.returning').html('');
	
	flight_results.length=0;

	// adiciona um voo, para haver sempre um mais caro
	flight_results.push(new one_flight_result('',999999));

	var temp_flights1;
	if (!returning) temp_flights1=all_flights_go1;
	else temp_flights1 = all_flights_return1


	for (fl1=0; fl1 < temp_flights1.length; fl1++ ) {

		// so procura o segundo se estiver dentro dos parametros das datas e preco definidas nas opcoes
		if (temp_flights1[fl1].date >=search_start_date && temp_flights1[fl1].date <=search_end_date && temp_flights1[fl1].price<=max_flight_price) {
			
			check_second_flight(temp_flights1[fl1], returning, date_of_going_flight);	
		}
		
	}

	if (flight_results.length>1) {
		for(i=0; i<flight_results.length-1 && i<=result_limit_default; i++){ // -1 para nao aparecer o ultimo, que e' o com preco 999999
			if (!returning) $('.search_results.going').append(flight_results[i].code);
			else $('.search_results.returning').append(flight_results[i].code);
		}
	}
					

}


function check_second_flight(check, returning, date_of_going_flight) {
	
	var temp_flights2;

	if (!returning) temp_flights2 = all_flights_go2;
	else temp_flights2 = all_flights_return2;

	for (fl2=0; fl2 < temp_flights2.length; fl2++ ) {
		
		if (check.destination==temp_flights2[fl2].origin && temp_flights2[fl2].price <= max_flight_price) {
			
			var check_date = new Date(check.date);
			tokens=(check.arrival).split(':');
			check_date.setHours(tokens[0]);
			check_date.setMinutes(tokens[1]);

			var sec_flight_date = new Date (temp_flights2[fl2].date);
			tokens=(temp_flights2[fl2].departure).split(':');
			sec_flight_date.setHours(tokens[0]);
			sec_flight_date.setMinutes(tokens[1]);
			

			//var check_date = new Date("2014-03-01 23:00");
			//var sec_flight_date = new Date("2014-03-02 01:03");
			

			var date_dif = (sec_flight_date-check_date);


			var diffDays = Math.round(date_dif / 86400000); // days

			if (diffDays<=1) {

				var diffHrs = Math.round((date_dif % 86400000) / 3600000); // hours
				var diffMins = Math.round(((date_dif % 86400000) % 3600000) / 60000); // minutes
				
				var total_mins= (diffDays*24*60)+(diffHrs*60)+diffMins;
				

				if (total_mins>min_wait_time && total_mins<max_wait_time) {
					

					var hours = Math.floor( total_mins / 60);          
   				 	var minutes = total_mins % 60;
 					
 					wait_time_class='';
 					if (hours<max_tolerate_wait) wait_time_class="low_wait";
   				 
			 		var flight1_price = format_price(check.price);
   				 	var tokens_flight1_price = (""+flight1_price).split('.'); //divide pelo ponto
   				 	var flight1_price_string= '<span class="euros">'+tokens_flight1_price[0]+'</span><span class="cents">.'+tokens_flight1_price[1]+'</span>';
					
					var flight2_price = format_price(temp_flights2[fl2].price);
   				 	var tokens_flight2_price = (""+flight2_price).split('.'); //divide pelo ponto
   				 	var flight2_price_string= '<span class="euros">'+tokens_flight2_price[0]+'</span><span class="cents">.'+tokens_flight2_price[1]+'</span>';

   				 	var total_price = format_price(check.price+temp_flights2[fl2].price);
   				 	var tokens_total_price = (""+total_price).split('.'); //divide pelo ponto
   				 	var total_price_string= '<span class="euros">'+tokens_total_price[0]+'</span><span class="cents">.'+tokens_total_price[1]+'</span>';

   				 	// define se um dos botoes vai ser para procurar o voo, ou para enviar email com o resultado (consoante se e' uma ida ou um regresso)
   				 	var button_class;
   				 	var button_icon;
   				 	if (!returning) {
   				 		button_class = 'res_return_btn';
   				 		button_icon = 'plane';
   				 	}
   				 	else {
   				 		button_class = 'res_email_btn';
   				 		button_icon = 'envelope';
   				 	}

   				 	// adiciona no voo de regresso o numero de dias apos o voo de ida
   				 	var days_after='';
   				 	if (returning) { // so adiciona os dias no caso de ser um voo de regresso
   				 		date_dif = ((new Date(check.date))-(new Date(date_of_going_flight)));
						diffDays = Math.round(date_dif / 86400000); // days
						days_after = ' (+'+diffDays+')';
   				 	}

   				 	var code_to_add = 
   				 	'<article class="one_result">'+
					'<div class="col-md-12">'+
					'<span class="res_title">'+'<span class="res_fulldate">'+format_date(check_date)+'<span class="smaller">'+days_after+'</span></span>'+
					'<span class="glyphicon glyphicon-'+button_icon+' '+button_class+'" data-date="'+check.date+'"></span>'+
					'<span class="glyphicon glyphicon-refresh res_refresh_btn" data-id1="'+check.id+'" data-id2="'+temp_flights2[fl2].id+'"></span>'+
					'<span class="res_total"><span class="glyphicon glyphicon-credit-card"></span> &euro; '+total_price_string+'</span>'+
					'<span class="res_wait '+wait_time_class+'"><span class="glyphicon glyphicon-time">espera</span>'+' '+(("0" + hours).slice(-2))+':'+(("0" + minutes).slice(-2))+'</span>'+
					'</span>'+
					'</div>'+
					'<div class="col-md-6 res_flight1">'+
					'<span class="res_date1"><span class="glyphicon glyphicon-calendar"></span>'+check.date+'</span>'+
					'<span class="res_origin1 larger"><span class="glyphicon glyphicon-upload"></span>'+airport_list[check.origin]+'</span>'+
					'<span class="res_destination1"><span class="glyphicon glyphicon-download"></span>'+airport_list[check.destination]+'</span>'+
					'<span class="res_departure1 larger"><span class="glyphicon glyphicon-export"></span>'+check.departure+'</span>'+
					'<span class="res_arrival1"><span class="glyphicon glyphicon-import"></span>'+check.arrival+'</span>'+
					'<span class="res_price1"><span class="glyphicon glyphicon-euro"></span>'+flight1_price_string+'</span>'+
					'</div>'+
					'<div class="col-md-6 res_flight2">'+
					'<span class="res_date2"><span class="glyphicon glyphicon-calendar"></span>'+temp_flights2[fl2].date+'</span>'+
					'<span class="res_origin2"><span class="glyphicon glyphicon-upload"></span>'+airport_list[temp_flights2[fl2].origin]+'</span>'+
					'<span class="res_destination2 larger"><span class="glyphicon glyphicon-download"></span>'+airport_list[temp_flights2[fl2].destination]+'</span>'+
					'<span class="res_departure2"><span class="glyphicon glyphicon-export"></span>'+temp_flights2[fl2].departure+'</span>'+
					'<span class="res_arrival2 larger"><span class="glyphicon glyphicon-import"></span>'+temp_flights2[fl2].arrival+'</span>'+
					'<span class="res_price2"><span class="glyphicon glyphicon-euro"></span>'+flight2_price_string+'</span>'+
					'</div>'+
					'</article>';

					var one_result = new one_flight_result(code_to_add, total_price);

					if (flight_results.length==0) {
						flight_results.push(one_result);
					}
					else if (total_price <= max_trip_price) {
						var inserted=false;
						for (i=0; i<flight_results.length && inserted==false; i++ ) {
							
							if (parseFloat(total_price)<=parseFloat(flight_results[i].price)) {
								flight_results.splice(i,0,one_result);
								inserted=true;
							}
						}
					}
				}
			}
		}
	}
}



function format_date(date_to_format) {

	var day_name = date_to_format.getDay();
	var month_name = date_to_format.getMonth();

	if (day_name==0) day_name = 'Domingo';
	else if (day_name==1) day_name = 'Segunda';
	else if (day_name==2) day_name = 'Terça';
	else if (day_name==3) day_name = 'Quarta';
	else if (day_name==4) day_name = 'Quinta';
	else if (day_name==5) day_name = 'Sexta';
	else if (day_name==6) day_name = 'Sábado';

	if (month_name==0) day_name = 'Janeiro';
	else if (month_name==1) month_name = 'Fevereiro';
	else if (month_name==2) month_name = 'Março';
	else if (month_name==3) month_name = 'Abril';
	else if (month_name==4) month_name = 'Maio';
	else if (month_name==5) month_name = 'Junho';
	else if (month_name==6) month_name = 'Julho';
	else if (month_name==7) month_name = 'Agosto';
	else if (month_name==8) month_name = 'Setembro';
	else if (month_name==9) month_name = 'Outubro';
	else if (month_name==10) month_name = 'Novembro';
	else if (month_name==11) month_name = 'Dezembro';
	

	return day_name+', '+date_to_format.getDate()+' de '+month_name;

}

// arredonda e adiciona 2 casas decimais
function format_price(price) {
	return (Math.round( price * 100 ) / 100).toFixed(2);
}




