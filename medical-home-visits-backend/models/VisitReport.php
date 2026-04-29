<?php

class VisitReport
{
    public ?int $idVisitReport = null;
    public int $idHomeVisit;
    public string $observations;
    public string $soinsEffectues;
    public string $recommandations;
    public ?string $createdAt = null;
}