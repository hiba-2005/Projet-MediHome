<?php

require_once __DIR__ . '/../config/database.php';

class PatientController
{
    private PDO $conn;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getAll(): void
    {
        $sql = "SELECT idPatient, nom, prenom, telephone, adresse, email FROM patients ORDER BY idPatient DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "patients" => $stmt->fetchAll()
        ]);
    }

    public function getById(int $id): void
    {
        $sql = "SELECT idPatient, nom, prenom, telephone, adresse, email FROM patients WHERE idPatient = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $patient = $stmt->fetch();

        if (!$patient) {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Patient introuvable."
            ]);
            return;
        }

        echo json_encode([
            "success" => true,
            "patient" => $patient
        ]);
    }

    public function create(): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            !isset($data['nom'], $data['prenom'], $data['telephone'], $data['adresse'], $data['email'], $data['passwordHash'])
        ) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Tous les champs sont obligatoires."
            ]);
            return;
        }

        $sql = "INSERT INTO patients (nom, prenom, telephone, adresse, email, passwordHash)
                VALUES (:nom, :prenom, :telephone, :adresse, :email, :passwordHash)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':nom', $data['nom']);
        $stmt->bindValue(':prenom', $data['prenom']);
        $stmt->bindValue(':telephone', $data['telephone']);
        $stmt->bindValue(':adresse', $data['adresse']);
        $stmt->bindValue(':email', $data['email']);
        $stmt->bindValue(':passwordHash', $data['passwordHash']);

        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Patient ajouté avec succès."
        ]);
    }

    public function update(int $id): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $sql = "UPDATE patients 
                SET nom = :nom, prenom = :prenom, telephone = :telephone, adresse = :adresse, email = :email
                WHERE idPatient = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':nom', $data['nom']);
        $stmt->bindValue(':prenom', $data['prenom']);
        $stmt->bindValue(':telephone', $data['telephone']);
        $stmt->bindValue(':adresse', $data['adresse']);
        $stmt->bindValue(':email', $data['email']);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);

        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Patient modifié avec succès."
        ]);
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM patients WHERE idPatient = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Patient supprimé avec succès."
        ]);
    }
}