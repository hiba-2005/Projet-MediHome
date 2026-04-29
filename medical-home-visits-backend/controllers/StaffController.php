<?php

require_once __DIR__ . '/../config/database.php';

class StaffController
{
    private PDO $conn;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getAll(): void
    {
        $sql = "SELECT idStaff, nom, prenom, specialite, telephone, email, role FROM staff ORDER BY idStaff DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "staff" => $stmt->fetchAll()
        ]);
    }

    public function create(): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $sql = "INSERT INTO staff (nom, prenom, specialite, telephone, email, passwordHash, role)
                VALUES (:nom, :prenom, :specialite, :telephone, :email, :passwordHash, :role)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':nom', $data['nom']);
        $stmt->bindValue(':prenom', $data['prenom']);
        $stmt->bindValue(':specialite', $data['specialite']);
        $stmt->bindValue(':telephone', $data['telephone']);
        $stmt->bindValue(':email', $data['email']);
        $stmt->bindValue(':passwordHash', $data['passwordHash']);
        $stmt->bindValue(':role', $data['role']);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Membre du staff ajouté avec succès."
        ]);
    }

    public function update(int $id): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $sql = "UPDATE staff 
                SET nom = :nom, prenom = :prenom, specialite = :specialite, telephone = :telephone, email = :email, role = :role
                WHERE idStaff = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':nom', $data['nom']);
        $stmt->bindValue(':prenom', $data['prenom']);
        $stmt->bindValue(':specialite', $data['specialite']);
        $stmt->bindValue(':telephone', $data['telephone']);
        $stmt->bindValue(':email', $data['email']);
        $stmt->bindValue(':role', $data['role']);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Staff modifié avec succès."
        ]);
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM staff WHERE idStaff = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Staff supprimé avec succès."
        ]);
    }
}