<?php

namespace Flying\MainBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Flying\MainBundle\Entity\Logs;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class FlightController extends Controller
{


	/**
    * @Route("/populate_next_flights")
    */
    public function populate_next_flights() // vai preencher na tabela flighs os voos nos proximos 5 meses (se assim estiver definido), para depois fazer requests
    {	
    	/* FUNCOES:
			1 - vai buscar as origens, escalas (stops), e destinos.
			2 - ve a data de hoje e cria a lista (funcao externa) dos proximos 150 dias (ou o que estiver definido nos parameters)
			3 - cria todas as combinacoes possiveis: origem-escala, e escala-destino, com todas as datas
			4 - insere (funcao externa) esse voo na lista (caso nao exista, para mais tarde, ser feito um request a ryanair)
		*/

		ini_set('memory_limit','256M');
    	error_reporting(E_ALL);
		ini_set('display_errors', 1);
		set_time_limit(1024);

		$start = $this->microtime_float();

    	// gets data from DB
    	$all_origins = $this->getDoctrine()->getRepository('FlyingMainBundle:AirportsAdded')->findBy(array('stop' => 0));
    	
    	$all_stops = $this->getDoctrine()->getRepository('FlyingMainBundle:AirportsAdded')->findBy(array('stop' => 1));

		$ignore_first_days = $this->container->getParameter('ignore_first_days');
		$days_to_check = $this->container->getParameter('days_to_check');

		$today_date = date("Y-m-d");
		$starting_date = date('Y-m-d', strtotime($today_date. ' + '.$ignore_first_days.' days'));
		
		$last_date = date('Y-m-d', strtotime($today_date. ' + '.$days_to_check.' days'));
		
		$em = $this->getDoctrine()->getManager();

		// Cria o log na DB
		$now = date("Y-m-d h:i:s");
		$one_log = new Logs();
		$one_log->setFunction("populate_next_flights");
		$one_log->setTime($now);
		$one_log->setText("Cria os voos que ainda nao estao definidos, para depois fazer request.");
		$em->persist($one_log);

		$start = $this->microtime_float(); // Temp - controlling the time

		$all_flights = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights');

		// entre origens/destinos e escalas
		foreach($all_origins as $one_origin) {
			foreach($all_stops as $one_stop) {
				if ($this->checkRoute($one_origin->getCode(),$one_stop->getCode())) {

					// verifica qual a ultima data desta rota - nao e' necessario estar a ver tudo outra vez, caso a rota ja exista. se nao houver data, entao cria as rotas todas
					$newest_flight = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getNewestFlight($one_origin->getCode(), $one_stop->getCode());
					if ($newest_flight=='') { // rota nao existente na DB
						$list_of_days_to_add = $this->createDateRangeArray($starting_date, $last_date);	
					}
					else if ($last_date>($newest_flight->getDate())) {
						$newest_date = date($newest_flight->getDate());	
						$list_of_days_to_add = $this->createDateRangeArray($newest_date, $last_date);	
					}
					else {
						$list_of_days_to_add = array();
					}

					foreach($list_of_days_to_add as $one_day_to_add) {
						$this->createFlight($one_origin->getCode(), $one_stop->getCode(), $one_day_to_add, $all_flights);
						$this->createFlight($one_stop->getCode(), $one_origin->getCode(), $one_day_to_add, $all_flights);
					}
				}
			}
		}

		// entre origens/destinos e origens/destinos
		foreach($all_origins as $one_origin) {
			foreach($all_origins as $one_destination) { // origens e destinos e' igual
				if ($one_origin->getCode()!=$one_destination->getCode() && $this->checkRoute($one_origin->getCode(),$one_destination->getCode())) {

					// verifica qual a ultima data desta rota - nao e' necessario estar a ver tudo outra vez, caso a rota ja exista. se nao houver data, entao cria as rotas todas
					$newest_flight = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getNewestFlight($one_origin->getCode(), $one_destination->getCode());
					if ($newest_flight=='') { // rota nao existente na DB
						$list_of_days_to_add = $this->createDateRangeArray($starting_date, $last_date);	
					}
					else if ($last_date>($newest_flight->getDate())) {
						$newest_date = date($newest_flight->getDate());	
						$list_of_days_to_add = $this->createDateRangeArray($newest_date, $last_date);	
					}
					else {
						$list_of_days_to_add = array();
					}

					foreach($list_of_days_to_add as $one_day_to_add) {
						$this->createFlight($one_origin->getCode(), $one_destination->getCode(), $one_day_to_add, $all_flights);
						$this->createFlight($one_destination->getCode(), $one_origin->getCode(), $one_day_to_add, $all_flights);
					}
				}
			}
		}
	
		// envia para a DB
		$em->flush();

		$end = $this->microtime_float();
		echo "Tempo - ".($end-$start);

		return new Response();

    }

    public function checkRoute($origin, $destination)
    {
    	/*
    	FUNCOES:
    	1- Determina se determinado voo e' efectuado de um sitio para o outro
    	*/

		$all_routes = $this->getDoctrine()->getRepository('FlyingMainBundle:Routes');
    	$possible_routes = $all_routes->findBy(
    		array('origin' => $origin, 'destination' => $destination)
			); 

    	if (count($possible_routes)>0) {
    		return true;	
    	} 
    	else {
    		return false;
    	} 

    }



    public function createFlight($origin, $destination, $date, $all_flights)
    {
    	/*
		FUNCOES
		1 - adiciona um voo 'a tabele flights, caso nao exista ja.
    	*/

	    $em = $this->getDoctrine()->getManager();
    	
    	$one_flight = $all_flights->findOneBy(
    		array('origin' => $origin, 'destination' => $destination, 'date' => $date)
		);
		
		if ($one_flight=="") { // nao, existe, podemos adicionar
		    $one_flight = new Flights();
		    $one_flight->setOrigin($origin);
		    $one_flight->setDestination($destination);
			$one_flight->setDate($date);
			$one_flight->setFlightNumber("");
			$one_flight->setDeparture("");
			$one_flight->setArrival("");
			$one_flight->setLastUpdated($this->container->getParameter('begining_date'));
			$one_flight->setPrice(0);
			$one_flight->setActive(true);

		    $em->persist($one_flight);
		}

    }


    public function createDateRangeArray($strDateFrom,$strDateTo)
	{
	    $aryRange=array();
	    $iDateFrom=mktime(1,0,0,substr($strDateFrom,5,2), substr($strDateFrom,8,2),substr($strDateFrom,0,4));
	    $iDateTo=mktime(1,0,0,substr($strDateTo,5,2), substr($strDateTo,8,2),substr($strDateTo,0,4));

	    if ($iDateTo>=$iDateFrom)
	    {
	        array_push($aryRange,date('Y-m-d',$iDateFrom)); // first entry
	        while ($iDateFrom<$iDateTo)
	        {
	            $iDateFrom+=86400; // add 24 hours
	            array_push($aryRange,date('Y-m-d',$iDateFrom));
	        }
	    }
	    return $aryRange;
	}


	/**
    * @Route("/remove_old_flights")
    */
    public function removeOldFlights() // apaga os voos com datas que ja passaram
    {
		
		$em = $this->getDoctrine()->getManager();


		$ignore_first_days = $this->container->getParameter('ignore_first_days');
		$today_date = date("Y-m-d");
		$last_date = date('Y-m-d', strtotime($today_date. ' + '.$ignore_first_days.' days'));


		$count=0;

    	$all_flights = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights');
    	$all_flights = $all_flights->findAll();
    	$today_date = date("Y-m-d");

    	foreach ($all_flights as $one_flight) {
    		$flight_date = date('Y-m-d', strtotime($one_flight->getDate()));

    		if ($last_date>$flight_date) {
    			$em->remove($one_flight);
    			$count++;
    		}

    	}

    	// Cria o log na DB
		$now = date("Y-m-d h:i:s");
		$one_log = new Logs();
		$one_log->setFunction("remove_old_flights");
		$one_log->setTime($now);
		$one_log->setText("Elimina os voos com datas antigas. Total de eliminados: ".$count);
		$em->persist($one_log);

		$em->flush();

		return new Response();
    }

	
    function microtime_float()
	{
	    list($usec, $sec) = explode(" ", microtime());
	    return ((float)$usec + (float)$sec);
	}




}