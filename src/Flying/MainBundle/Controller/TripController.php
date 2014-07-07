<?php

namespace Flying\MainBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Flying\MainBundle\Entity\AirportsAdded;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class TripController extends Controller
{

    /**
    * @Route("/add_trip/{origin}/{stops}/{destination}")
    */
    public function addTrip(Request $request, $origin, $stops, $destination)
    {
		$em = $this->getDoctrine()->getManager();

		$this->addAirport($origin, false);
		$this->addAirport($destination, false);

		if ($stops!='none') {
			$stops_list = explode("|", $stops);
			foreach ($stops_list as $stop) {
				$this->addAirport($stop, true);
			}
		}

		$em->flush();
    	echo "success";
    	return new Response;
    }

    public function addAirport($code, $stop)
   	{
   		// adiciona um aeroporto a lista caso nao exista
    	$exist_airport = $this->getDoctrine()->getRepository('FlyingMainBundle:AirportsAdded')->findBy(array(/*'stop' => $stop, */'code' => $code)); // ATENCAO: se certo aeroporto e' uma escala, ja nao pode ser origem, e vice-versa

    	if (count($exist_airport)==0) {
    		$one_airport = new AirportsAdded();
			$one_airport->setCode($code);
			$one_airport->setStop($stop);
		    $em = $this->getDoctrine()->getManager();
			$em->persist($one_airport);

			// verifica se ha voos inactivos com esse aeroporto (na origem ou no destino)
    		
    		$flights_to_recover = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->findBy(array('origin' => $code, 'active' => false));
    		foreach ($flights_to_recover as $flight_to_recover) {
    			$flight_to_recover->setActive(true);
    		}

    		$flights_to_recover = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->findBy(array('destination' => $code, 'active' => false));
    		foreach ($flights_to_recover as $flight_to_recover) {
    			$flight_to_recover->setActive(true);
    		}
    	}

    	return;
    } 

    /**
    * @Route("/remove_airports/{airports}")
    */
    public function removeAirports(Request $request, $airports)
    {

		$em = $this->getDoctrine()->getManager();
		$airport_list = explode("|", $airports);

		foreach ($airport_list as $one_airport) {
    		$airport_to_remove = $this->getDoctrine()->getRepository('FlyingMainBundle:AirportsAdded')->findOneBy(array('code' => $one_airport));
			$em->remove($airport_to_remove);

			$flights_to_remove = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->findBy(array('origin' => $one_airport, 'active' => true));
			foreach ($flights_to_remove as $flight_to_remove) {
				$flight_to_remove->setActive(false);
			} 

			$flights_to_remove = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->findBy(array('destination' => $one_airport));
			foreach ($flights_to_remove as $flight_to_remove) {
				$flight_to_remove->setActive(false);
			} 
		}


		$em->flush();
		echo "success";
    	return new Response;
    }


    /**
    * @Route("/get_possible_route_list")
    */
    public function getPossibleRouteList() {
    	/*
		FUNCOES:
		1 - tirar da ryanair a lista de routes possiveis, e actualizar na minha DB
    	*/

		$em = $this->getDoctrine()->getManager();

		// Cria o log na DB
		$now = date("Y-m-d h:i:s");
		$one_log = new Logs();
		$one_log->setFunction("get_possible_route_list");
		$one_log->setTime($now);
		$one_log->setText('Comunica com a Ryanair para actualizar a lista de voos possiveis');
		$em->persist($one_log);

		$url = 'https://www.bookryanair.com/SkySales/booking.aspx?culture=en-gb&lc=en-gb&cmpid2=Google';
		
		$result = file_get_contents($url, false);
		
		preg_match('/FR\.stationInfo\s=\s(.*?)\;/',$result, $all_routes);
		$all_routes=json_decode($all_routes[1],true);

		$all_routes_db = $this->getDoctrine()->getRepository('FlyingMainBundle:Routes');

		foreach($all_routes as $one_route_info) {
			$route_origin = $one_route_info[0];
			$route_destinations = $one_route_info[2];

			foreach($route_destinations as $one_destination) {

				$one_existing_route = $all_routes_db->findOneBy(
    				array('origin' => $route_origin, 'destination' => $one_destination)
				);
				if ($one_existing_route=="") {
					$one_route = new Routes();
					$one_route->setOrigin($route_origin);
					$one_route->setDestination($one_destination);
					$em->persist($one_route);
				}

			}
		}
		$em->flush();

    }

}

