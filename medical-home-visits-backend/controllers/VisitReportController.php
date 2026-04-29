<?php

require_once __DIR__ . '/../config/database.php';

class VisitReportController
{
    private PDO $conn;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getAll(): void
    {
        $sql = "SELECT 
                    vr.idVisitReport,
                    vr.idHomeVisit,
                    vr.observations,
                    vr.soinsEffectues,
                    vr.recommandations,
                    vr.createdAt,
                    hv.dateVisite,
                    hv.heureVisite,
                    hv.statut,
                    p.nom AS nomPatient,
                    p.prenom AS prenomPatient,
                    s.nom AS nomStaff,
                    s.prenom AS prenomStaff,
                    s.specialite
                FROM visit_reports vr
                JOIN home_visits hv ON vr.idHomeVisit = hv.idHomeVisit
                JOIN patients p ON hv.idPatient = p.idPatient
                JOIN staff s ON hv.idStaff = s.idStaff
                ORDER BY vr.idVisitReport DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "reports" => $stmt->fetchAll()
        ]);
    }

    public function getById(int $id): void
    {
        $sql = "SELECT 
                    vr.idVisitReport,
                    vr.idHomeVisit,
                    vr.observations,
                    vr.soinsEffectues,
                    vr.recommandations,
                    vr.createdAt,
                    hv.dateVisite,
                    hv.heureVisite,
                    hv.statut,
                    p.nom AS nomPatient,
                    p.prenom AS prenomPatient,
                    s.nom AS nomStaff,
                    s.prenom AS prenomStaff,
                    s.specialite
                FROM visit_reports vr
                JOIN home_visits hv ON vr.idHomeVisit = hv.idHomeVisit
                JOIN patients p ON hv.idPatient = p.idPatient
                JOIN staff s ON hv.idStaff = s.idStaff
                WHERE vr.idVisitReport = :id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $report = $stmt->fetch();

        if (!$report) {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Rapport introuvable."
            ]);
            return;
        }

        echo json_encode([
            "success" => true,
            "report" => $report
        ]);
    }

    public function create(): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            !isset(
                $data['idHomeVisit'],
                $data['observations'],
                $data['soinsEffectues'],
                $data['recommandations']
            )
        ) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Tous les champs du rapport sont obligatoires."
            ]);
            return;
        }

        $sql = "INSERT INTO visit_reports (idHomeVisit, observations, soinsEffectues, recommandations)
                VALUES (:idHomeVisit, :observations, :soinsEffectues, :recommandations)";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':idHomeVisit', $data['idHomeVisit'], PDO::PARAM_INT);
        $stmt->bindValue(':observations', $data['observations']);
        $stmt->bindValue(':soinsEffectues', $data['soinsEffectues']);
        $stmt->bindValue(':recommandations', $data['recommandations']);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Rapport ajouté avec succès."
        ]);
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM visit_reports WHERE idVisitReport = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Rapport supprimé avec succès."
        ]);
    }
}