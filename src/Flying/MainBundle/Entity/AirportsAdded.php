<?php

namespace Flying\MainBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Airportsadded
 *
 * @ORM\Table(name="airports_added")
 * @ORM\Entity(repositoryClass="Flying\MainBundle\Entity\AirportsAddedRepository")
 */
class AirportsAdded
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="code", type="string", length=3)
     */
    private $code;

    /**
     * @var boolean
     *
     * @ORM\Column(name="stop", type="boolean")
     */
    private $stop;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set code
     *
     * @param string $code
     * @return Airportsadded
     */
    public function setCode($code)
    {
        $this->code = $code;

        return $this;
    }

    /**
     * Get code
     *
     * @return string 
     */
    public function getCode()
    {
        return $this->code;
    }

    /**
     * Set stop
     *
     * @param boolean $stop
     * @return Airportsadded
     */
    public function setStop($stop)
    {
        $this->stop = $stop;

        return $this;
    }

    /**
     * Get stop
     *
     * @return boolean 
     */
    public function getStop()
    {
        return $this->stop;
    }
}
