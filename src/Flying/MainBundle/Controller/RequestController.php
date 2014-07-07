<?php

namespace Flying\MainBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Flying\MainBundle\Entity\Flights;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class RequestController extends Controller
{

    /**
    * @Route("/results_request/{start_date}/{end_date}/{origins}/{stops}/{destinations}")
    */
    public function resultsRequest(Request $request, $start_date, $end_date, $origins, $stops, $destinations) {

    	$direct_flight = false;
    	if ($destinations=='direct_flight') $direct_flight = true;  // se o voo for com escala

    	$flights_go1 = array();
    	$flights_go2 = array();
    	$flights_return1 = array();
    	$flights_return2 = array();

    	$origins_list = explode("|", $origins);
    	$stops_list = explode("|", $stops);
    	$requests_count = 0;

		$today_date = date("Y-m-d");

		// so faz o request se a data de last updated for mais antiga que o numero de dias definidos nos parametros
		$min_update_days = $this->container->getParameter('min_update_days');
		$update_date_only = date('Y-m-d', strtotime($today_date. ' - '.$min_update_days.' days'));

    	// Ida viagem 1, e Regresso viagem 2
    	foreach ($origins_list as $one_origin) {
    		foreach ($stops_list as $one_stop) {
    			$one_flight_go = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getFlightsCustomAll($start_date, $end_date, $one_origin, $one_stop, $update_date_only);
    			foreach ($one_flight_go as $flight_for_request) {
    				$this->makeOneRequest($flight_for_request);
    				$requests_count++;
    			}
    			
    			$one_flight_return = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getFlightsCustomAll($start_date, $end_date, $one_stop, $one_origin, $update_date_only);
    			foreach ($one_flight_return as $flight_for_request) {
    				$this->makeOneRequest($flight_for_request);
    				$requests_count++;
    			}
    			if ($requests_count>200) {
    				echo "limit";
    				return new Response;
    			}
    		}
    	}

    	if ($direct_flight == false) { // se o voo for com escala

	    	$destinations_list = explode("|", $destinations);

			// Ida viagem 2, e Regresso viagem 1
	    	foreach ($stops_list as $one_stop) {
	    		foreach ($destinations_list as $one_destination) {
	    			$one_flight_go = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getFlightsCustomAll($start_date, $end_date, $one_stop, $one_destination, $update_date_only);
	    			foreach ($one_flight_go as $flight_for_request) {
	    				$this->makeOneRequest($flight_for_request);
	    				$requests_count++;
	    			}

	    			$one_flight_return = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getFlightsCustomAll($start_date, $end_date, $one_destination, $one_stop, $update_date_only);
	    			foreach ($one_flight_return as $flight_for_request) {
	    				$this->makeOneRequest($flight_for_request);
	    				$requests_count++;
	    			}
	    			if ($requests_count>200) {
    					echo "limit";
    					return new Response;
    				}
	    		}
	    	}
    	}

    	echo "success";
    	return new Response;
    }


    /**
    * @Route("/auto_request/{qty}")
    */
    public function autoRequest($qty) 
    {
		set_time_limit(1024);

    	//faz $qty (x7) requests de cada vez

		for ($i=0; $i<$qty; $i++) {	
	    	sleep(rand(1,4));
	    	$oldest_flight = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getLastFlight();
		    $this->makeOneRequest($oldest_flight);
		}

		return new Response();
    }


    /**
    * @Route("/update_existing_flight/{id1}/{id2}")
    */
    public function updateExistingFlightAction($id1, $id2) {
    	
    	$all_flights = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights');
    	$flight_to_update1 = $all_flights->findOneBy(array('id' => $id1)); 

		$this->makeOneRequest($flight_to_update1);

		$result = json_encode(array('price1' => $flight_to_update1->getPrice(), 'price2' => 0));


		if ($id2!='direct_flight') {
			$flight_to_update2 = $all_flights->findOneBy(array('id' => $id2)); 	
			$this->makeOneRequest($flight_to_update2);

			$result = json_encode(array('price1' => $flight_to_update1->getPrice(), 'price2' => $flight_to_update2->getPrice()));
		} 


		echo $result;
		die();
    }

    public function makeOneRequest($oldest_flight)
    {
    	/*
    	FUNCOES
    	1 - vai buscar a lista de voos na DB, o que tiver a data mais antiga (last_updated)
    	2 - adiciona 3 dias a essa data
    	3 - faz um request a ryanair para esse voo
    	4 - actualiza na lista de voos na DB
		*/


		$em = $this->getDoctrine()->getManager();

		$all_flights = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights');

		$oldest_date = $oldest_flight->getDate();

		//adicionar 3 dias a data desse voo, ja que o request da ryanair, da a data mais 3 dias para tras e para a frente
		$today_date = date("Y-m-d");

		// so faz o request se a data de last updated for mais antiga que o numero de dias definidos nos parametros
		$min_update_days = $this->container->getParameter('min_update_days');
		$update_date_only = date('Y-m-d', strtotime($today_date. ' - '.$min_update_days.' days'));
		
		if ($oldest_flight->getLastUpdated() > $update_date_only ) return;

		$request_date = date('Y-m-d', strtotime($oldest_date. ' + 3 days'));

		$request_origin = $oldest_flight->getOrigin();
		$request_destination = $oldest_flight->getDestination();

		$request_date_formated = str_replace("-","/",$request_date);

		$url = 'https://www.bookryanair.com/SkySales/Search.aspx';
		$data = array('__EVENTTARGET' => 'SearchInput$ButtonSubmit',
      	  'SearchInput$IsFlexible' => 'on',
      	  'SearchInput$TripType' => 'OneWay',
	      'SearchInput$Orig' => $request_origin,
	      'SearchInput$Dest' => $request_destination,
	      'SearchInput$DeptDate' => $request_date_formated,
	      'SearchInput$RetDate' => $request_date_formated,
	      'SearchInput$PaxTypeADT' => "1");

		$options = array(
		    'http' => array(
		        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
		        'method'  => 'POST',
		        'content' => http_build_query($data),
		    ),
		);
		$context  = stream_context_create($options);
		$result = file_get_contents($url, false, $context);

		preg_match('/FR\.flightData\s=\s(.*?)\;/',$result, $flightData);
		preg_match('/FR\.booking\s=\s(.*?)\;/',$result, $booking);
		
		$flightData=json_decode($flightData[1],true);
	
		if ($flightData==null) { // pode ainda nao haver voo. marca como visto na DB
			$one_flight_to_update->setFlightNumber('NA');
			$one_flight_to_update->setLastUpdated($today_date);
			return;
		}
		$booking=json_decode($booking[1],true); // daqui so interessa a moeda usada
		$currency = $booking['Info']['Curr'];

		//actualiza ja este voo como visto, porque pode dar origem a erros. Se a oldest date for igual a hoje, simplesmente nao vai actualizar este voo
		$oldest_flight->setLastUpdated($today_date);

		foreach ($flightData[$request_origin.$request_destination] as $one_day) {

    		$this_day_date = $one_day[0];

    		$flights_to_update = $all_flights->findBy(array('origin' => $request_origin, 'destination' => $request_destination, 'date' => $this_day_date)); 

    		$one_day_info= $one_day[1]; // aqui posso saber se o voo nao existe
    		
    		// considera-os como inexistentes ate prova em contrario
			foreach ($flights_to_update as $one_flight_to_update) {
    				$one_flight_to_update->setFlightNumber('NA');
					$one_flight_to_update->setLastUpdated($today_date);
    			}

			$one_day_info_count = count($one_day_info); // numero de voos nesse dia
    		
			foreach($one_day_info as $one_flight ) { // percorre os voos nesse dia
				$flight_number = $one_flight[2];
				$times_dates = $one_flight[3];

				$departure_info = $times_dates[0];
				$arrival_info = $times_dates[1];
				
				$departure_date = $departure_info[0];
				$departure_time = $departure_info[1];

				$arrival_time = $arrival_info[1];
				
				$price_info = $one_flight[4]['ADT'][1];

				if (isset($price_info['Tax'])) $price_tax = $price_info['Tax'];
				else $price_tax=0;

				$price = $price_info['FarePrice'] + $price_tax;

				if ($currency!='EUR') { // faz a conversao para euro
					$currencies = $this->getDoctrine()->getRepository('FlyingMainBundle:Currencies');
					$currencies = $currencies->findOneBy(array('code' => $currency)); 
					$price = $price/($currencies->getRate());
				}

				// ve se este voo existe na DB
				$search_flight_to_update = $all_flights->findOneBy(array('origin' => $request_origin, 'destination' => $request_destination, 'date' => $departure_date, 'departure' => $departure_time));

				if ($search_flight_to_update!='') { // existe na DB, por isso vai actualizar
					$search_flight_to_update->setFlightNumber($flight_number);
					$search_flight_to_update->setLastUpdated($today_date);
					$search_flight_to_update->setPrice($price);
				}
				else { // nao existe na DB por isso cria um novo
					$one_flight = new Flights();
				    $one_flight->setOrigin($request_origin);
				    $one_flight->setDestination($request_destination);
					$one_flight->setDate($departure_date);
					$one_flight->setFlightNumber($flight_number);
					$one_flight->setDeparture($departure_time);
					$one_flight->setArrival($arrival_time);
					$one_flight->setLastUpdated($today_date);
					$one_flight->setPrice($price);
					$one_flight->setActive(true);
					$em->persist($one_flight);
				}
			}
    	}

		$em->flush();

    }

}