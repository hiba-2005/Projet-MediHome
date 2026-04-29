<?php

class Database
{
    private string $host = "localhost";
    private string $db_name = "medical_home_visits";
    private string $username = "root";
    private string $password = "";
    public ?PDO $conn = null;

    public function getConnection(): ?PDO
    {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);

            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch (PDOException $exception) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Connexion à la base de données échouée.",
                "error" => $exception->getMessage()
            ]);
            exit;
        }

        return $this->conn;
    }
}