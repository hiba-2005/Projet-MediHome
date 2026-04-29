<?php

class HomeVisit
{
    public ?int $idHomeVisit = null;
    public int $idPatient;
    public int $idStaff;
    public string $dateVisite;
    public string $heureVisite;
    public string $statut;
    public ?string $ancienneDateVisite = null;
    public ?string $ancienneHeureVisite = null;
    public ?string $createdAt = null;
    public ?string $updatedAt = null;
}