<?php

class Patient
{
    public ?int $idPatient = null;
    public string $nom;
    public string $prenom;
    public string $telephone;
    public string $adresse;
    public string $email;
    public string $passwordHash;

    public function __construct(array $data = [])
    {
        $this->idPatient = $data['idPatient'] ?? null;
        $this->nom = $data['nom'] ?? '';
        $this->prenom = $data['prenom'] ?? '';
        $this->telephone = $data['telephone'] ?? '';
        $this->adresse = $data['adresse'] ?? '';
        $this->email = $data['email'] ?? '';
        $this->passwordHash = $data['passwordHash'] ?? '';
    }
}