<?php

require_once __DIR__ . '/../config/database.php';

class AuthController
{
    private PDO $conn;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    private function getRequestData(): array
    {
        $rawInput = file_get_contents("php://input");
        $jsonData = json_decode($rawInput, true);

        if (is_array($jsonData) && !empty($jsonData)) {
            return $jsonData;
        }

        return $_POST ?? [];
    }

    public function loginPatient(): void
    {
        $data = $this->getRequestData();

        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if ($email === '' || $password === '') {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Email et mot de passe sont requis."
            ]);
            return;
        }

        $sql = "SELECT * FROM patients WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':email', $email);
        $stmt->execute();

        $patient = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$patient) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Patient introuvable."
            ]);
            return;
        }

        if (!password_verify($password, $patient['passwordHash'])) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Mot de passe incorrect."
            ]);
            return;
        }

        echo json_encode([
            "success" => true,
            "message" => "Connexion patient réussie.",
            "user" => [
                "idPatient" => $patient['idPatient'],
                "nom" => $patient['nom'],
                "prenom" => $patient['prenom'],
                "email" => $patient['email']
            ]
        ]);
    }

    public function loginStaff(): void
    {
        $data = $this->getRequestData();

        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if ($email === '' || $password === '') {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Email et mot de passe sont requis."
            ]);
            return;
        }

        $sql = "SELECT * FROM staff WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':email', $email);
        $stmt->execute();

        $staff = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$staff) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Utilisateur introuvable."
            ]);
            return;
        }

        if (!password_verify($password, $staff['passwordHash'])) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Mot de passe incorrect."
            ]);
            return;
        }

        echo json_encode([
            "success" => true,
            "message" => "Connexion staff réussie.",
            "user" => [
                "idStaff" => $staff['idStaff'],
                "nom" => $staff['nom'],
                "prenom" => $staff['prenom'],
                "email" => $staff['email'],
                "role" => $staff['role'],
                "specialite" => $staff['specialite']
            ]
        ]);
    }
}