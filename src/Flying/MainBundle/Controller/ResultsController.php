<?php

namespace Flying\MainBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class ResultsController extends Controller
{


    /**
    * @Route("/results/{start_date}/{end_date}/{origins}/{stops}/{destinations}")
    */
    public function results(Request $request, $start_date, $end_date, $origins, $stops, $destinations) {

        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        ini_set('memory_limit','256M');

        $session = $this->get('session');
        $locale = $request->getLocale();
        
        if ($session->has('lang')) {
            $sel_lang = $session->get('lang');
        }
        else {
            $sel_lang="pt";
        }
        $request->setLocale($sel_lang);


        // este link pode ser usado nos resultados, para actualizar estes
        $url_to_update = $start_date."/".$end_date."/".$origins."/".$stops."/".$destinations;


        $direct_flight = false;
        if ($destinations=='direct_flight') $direct_flight = true;  // se o voo for com escala


        $flights_go1 = array();
        $flights_go2 = array();
        $flights_return1 = array();
        $flights_return2 = array();


        $origins_list = explode("|", $origins);
        $stops_list = explode("|", $stops);

        // Ida viagem 1, e Regresso viagem 2
        foreach ($origins_list as $one_origin) {
            foreach ($stops_list as $one_stop) {
                $one_flight_go = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getFlightsCustom($start_date, $end_date, $one_origin, $one_stop);
                $flights_go1 = array_merge($flights_go1, $one_flight_go);
                
                $one_flight_return = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getFlightsCustom($start_date, $end_date, $one_stop, $one_origin);
                $flights_return2 = array_merge($flights_return2, $one_flight_return);
            }
        }

        if ($direct_flight == false) { // se o voo for com escala

            $destinations_list = explode("|", $destinations);

            // Ida viagem 2, e Regresso viagem 1
            foreach ($stops_list as $one_stop) {
                foreach ($destinations_list as $one_destination) {
                    $one_flight_go = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getFlightsCustom($start_date, $end_date, $one_stop, $one_destination);
                    $flights_go2 = array_merge($flights_go2, $one_flight_go);

                    $one_flight_return = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getFlightsCustom($start_date, $end_date, $one_destination, $one_stop);
                    $flights_return1 = array_merge($flights_return1, $one_flight_return);


                }
            }
        
        }

        $all_origins = $this->getDoctrine()->getRepository('FlyingMainBundle:AirportsAdded')->findBy(array('stop' => 0));
        
        $all_stops = $this->getDoctrine()->getRepository('FlyingMainBundle:AirportsAdded')->findBy(array('stop' => 1));
        
        
        // desactualizacao maxima em todos os voos existentes
        $param_begining_date = $this->container->getParameter('begining_date');     
        $total_latest_existing_date = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getLastExistingFlight($param_begining_date, $param_begining_date, '2999-01-01')->getLastUpdated();
        //if ($total_latest_existing_date!='') $total_latest_existing_date->getLastUpdated();

        
        // obtem a data de actualizacao mais antiga destes resultados
        $this_latest_existing_date='2999-01-01';
        foreach ($flights_go1 as $one_flight)
            if ($one_flight->getLastUpdated()<$this_latest_existing_date) $this_latest_existing_date = $one_flight->getLastUpdated();
        foreach ($flights_go2 as $one_flight)
            if ($one_flight->getLastUpdated()<$this_latest_existing_date) $this_latest_existing_date = $one_flight->getLastUpdated();
        foreach ($flights_return1 as $one_flight)
            if ($one_flight->getLastUpdated()<$this_latest_existing_date) $this_latest_existing_date = $one_flight->getLastUpdated();
        foreach ($flights_return2 as $one_flight)
            if ($one_flight->getLastUpdated()<$this_latest_existing_date) $this_latest_existing_date = $one_flight->getLastUpdated();
        
        if ($this_latest_existing_date=='2999-01-01') { // no caso de nao existirem voos
            $this_latest_existing_date=='NA';
        }

        $flights_count = count($this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->getAllExistingFlights());

        $this_flights_count = count($flights_go1)+count($flights_go2)+count($flights_return1)+count($flights_return2);

        $mem_usage = round(memory_get_usage()/1024/1024,1).' MB';

        $blank_flights = count($this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->findBy(array('flightNumber' => '')));

        $hours_left = round(($blank_flights/7)*$this->container->getParameter('request_interval')/60);

        $all_airports = $this->getDoctrine()->getRepository('FlyingMainBundle:Airports')->findAll();



        return $this->render('FlyingMainBundle::results.html.twig', array("all_flights_go1" => $flights_go1, "all_flights_go2" => $flights_go2, "all_flights_return1" => $flights_return1, "all_flights_return2" => $flights_return2, "all_origins" => $all_origins, "all_stops" => $all_stops, "total_latest_existing_date" => $total_latest_existing_date, "this_latest_existing_date" => $this_latest_existing_date, "flights_count" => $flights_count, 'this_flights_count' => $this_flights_count, "blank_flights" => $blank_flights, "mem_usage" => $mem_usage, 'hours_left' => $hours_left, 'all_airports' => $all_airports, 'direct_flight' => $direct_flight, 'sel_lang' => $sel_lang, 'url_to_update' => $url_to_update));


    }





}