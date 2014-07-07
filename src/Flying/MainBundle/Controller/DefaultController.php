<?php

namespace Flying\MainBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Flying\MainBundle\Entity\AirportsAdded;
use Flying\MainBundle\Entity\Flights;
use Flying\MainBundle\Entity\Routes;
use Flying\MainBundle\Entity\Currencies;
use Flying\MainBundle\Entity\Logs;
use Symfony\Component\Process\Process;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;

class DefaultController extends Controller
{

	

	/**
    * @Route("/")
    */
    public function indexAction(Request $request)
    {

    	error_reporting(E_ALL);
		ini_set('display_errors', 1);
		$session = new Session();
		$session->start();

		$sel_lang = $request->request->get('lang');
		$locale = $request->getLocale();

		if (count($sel_lang)>0) {
    		$session->set('lang', $sel_lang);
		}
		else {
			$sel_lang = 'pt';
		}

		$request->setLocale($sel_lang);

    	$all_routes = $this->getDoctrine()->getRepository('FlyingMainBundle:Routes')->findAll();

    	// all_origins tambem e' all_destinations
    	$all_origins = $this->getDoctrine()->getRepository('FlyingMainBundle:AirportsAdded')->findBy(array('stop' => 0));
    	$all_stops = $this->getDoctrine()->getRepository('FlyingMainBundle:AirportsAdded')->findBy(array('stop' => 1));
    	$all_airports = $this->getDoctrine()->getRepository('FlyingMainBundle:Airports')->findAll();

		return $this->render('FlyingMainBundle::home.html.twig', array("all_origins" => $all_origins, "all_stops" => $all_stops, "all_routes" => $all_routes, "all_airports" => $all_airports));

    }



	/**
    * @Route("/update_currencies")
    */
    public function update_currencies()
    {
    	$currencies = simplexml_load_file('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml');
    	
    	$currencies = $currencies->Cube->Cube[0];
		$em = $this->getDoctrine()->getManager();
    	
    	foreach ($currencies as $currency) {
    		$currency_to_update = $this->getDoctrine()->getRepository('FlyingMainBundle:Currencies')->findOneBy(array('code' => $currency["currency"]));
    		$currency_to_update->setRate((float)($currency["rate"]));
    	}

    	$em->flush();

    	return new Response;
    }


    /**
    * @Route("/send_email/{id1_go}/{id2_go}/{id1_return}/{id2_return}/{send_email_to}")
    */
    public function send_email($id1_go, $id2_go, $id1_return, $id2_return, $send_email_to) {

    	// vai buscar os 2 ou 4 voos por id (2 ou 4 dependendo se e' directo ou nao)
    	$flight_go1 = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->findOneById($id1_go);
    	if ($id2_go!='direct_flight') $flight_go2 = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->findOneById($id2_go);
    	else $flight_go2 = null;

    	$flight_return1 = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->findOneById($id1_return);
    	if ($id2_return!='direct_flight') $flight_return2 = $this->getDoctrine()->getRepository('FlyingMainBundle:Flights')->findOneById($id2_return);
    	else $flight_return2 = null;

    	// Vai buscar a origem, destino e data, para ser titulo do email
    	$flight_from = $flight_go1->getOrigin();
    	if ($id2_go=='direct_flight') $flight_to = $flight_go1->getDestination();
    	else $flight_to = $flight_go2->getDestination();

    	$flight_from = $this->getDoctrine()->getRepository('FlyingMainBundle:Airports')->findOneByCode($flight_from)->getText();
		$flight_to = $this->getDoctrine()->getRepository('FlyingMainBundle:Airports')->findOneByCode($flight_to)->getText();

    	$flight_date = $flight_go1->getDate();

  		$message = \Swift_Message::newInstance()
        ->setSubject('Flight from '.$flight_from.' to '.$flight_to.' - '.$flight_date)
        ->setFrom('jcmatosdev@gmail.com')
        ->setContentType("text/html")
        ->setTo($send_email_to)
        ->setBody(
            $this->renderView(
                'FlyingMainBundle::email.txt.twig',
                array('flight_go1' => $flight_go1, 'flight_go2' => $flight_go2, 'flight_return1' => $flight_return1, 'flight_return2' => $flight_return2)
            )
        );

		echo $this->get('mailer')->send($message);

    	return new Response;

    }

}
