<?php

require_once __DIR__ . '/../config/database.php';

class HomeVisitController
{
    private PDO $conn;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getAll(): void
    {
        $sql = "SELECT hv.*, 
                       p.nom AS nomPatient, p.prenom AS prenomPatient, p.adresse, p.telephone,
                       s.nom AS nomStaff, s.prenom AS prenomStaff, s.specialite
                FROM home_visits hv
                JOIN patients p ON hv.idPatient = p.idPatient
                JOIN staff s ON hv.idStaff = s.idStaff
                ORDER BY hv.dateVisite ASC, hv.heureVisite ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "visits" => $stmt->fetchAll()
        ]);
    }

    public function getByStaff(int $idStaff): void
    {
        $sqlStaff = "SELECT idStaff, nom, prenom, specialite, telephone, email, role
                     FROM staff
                     WHERE idStaff = :idStaff
                     LIMIT 1";
        $stmtStaff = $this->conn->prepare($sqlStaff);
        $stmtStaff->bindValue(':idStaff', $idStaff, PDO::PARAM_INT);
        $stmtStaff->execute();

        $staff = $stmtStaff->fetch();

        if (!$staff) {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Personnel médical introuvable."
            ]);
            return;
        }

        $sqlVisits = "SELECT hv.idHomeVisit,
                             hv.idPatient,
                             hv.idStaff,
                             hv.dateVisite,
                             hv.heureVisite,
                             hv.statut,
                             hv.ancienneDateVisite,
                             hv.ancienneHeureVisite,
                             hv.createdAt,
                             hv.updatedAt,
                             p.nom AS nomPatient,
                             p.prenom AS prenomPatient,
                             p.telephone,
                             p.adresse,
                             p.email
                      FROM home_visits hv
                      JOIN patients p ON hv.idPatient = p.idPatient
                      WHERE hv.idStaff = :idStaff
                      ORDER BY hv.dateVisite DESC, hv.heureVisite DESC";
        $stmtVisits = $this->conn->prepare($sqlVisits);
        $stmtVisits->bindValue(':idStaff', $idStaff, PDO::PARAM_INT);
        $stmtVisits->execute();

        $visits = $stmtVisits->fetchAll();

        $notifications = [];

        foreach ($visits as $visit) {
            $statut = strtolower(trim($visit['statut'] ?? ''));

            if ($statut === 'planifiee') {
                $notifications[] = [
                    "type" => "new_visit",
                    "title" => "Nouvelle visite à effectuer",
                    "text" => "Une visite a été planifiée pour le patient " .
                        $visit['prenomPatient'] . " " . $visit['nomPatient'] .
                        " le " . $visit['dateVisite'] . " à " . $visit['heureVisite'] . ".",
                    "idHomeVisit" => $visit['idHomeVisit']
                ];
            }

            if ($statut === 'en_route') {
                $notifications[] = [
                    "type" => "en_route",
                    "title" => "Visite en cours de déplacement",
                    "text" => "Vous êtes marqué en route pour la visite de " .
                        $visit['prenomPatient'] . " " . $visit['nomPatient'] . ".",
                    "idHomeVisit" => $visit['idHomeVisit']
                ];
            }
        }

        echo json_encode([
            "success" => true,
            "staff" => $staff,
            "visits" => $visits,
            "notifications" => $notifications
        ]);
    }

    public function create(): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $sql = "INSERT INTO home_visits (idPatient, idStaff, dateVisite, heureVisite, statut, ancienneDateVisite, ancienneHeureVisite)
                VALUES (:idPatient, :idStaff, :dateVisite, :heureVisite, :statut, :ancienneDateVisite, :ancienneHeureVisite)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':idPatient', $data['idPatient'], PDO::PARAM_INT);
        $stmt->bindValue(':idStaff', $data['idStaff'], PDO::PARAM_INT);
        $stmt->bindValue(':dateVisite', $data['dateVisite']);
        $stmt->bindValue(':heureVisite', $data['heureVisite']);
        $stmt->bindValue(':statut', $data['statut']);
        $stmt->bindValue(':ancienneDateVisite', $data['ancienneDateVisite'] ?? null);
        $stmt->bindValue(':ancienneHeureVisite', $data['ancienneHeureVisite'] ?? null);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Visite ajoutée avec succès."
        ]);
    }

    public function updateStatus(int $id): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['statut'])) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Le statut est obligatoire."
            ]);
            return;
        }

        $allowed = ['planifiee', 'en_route', 'reportee', 'terminee'];
        $statut = strtolower(trim($data['statut']));

        if (!in_array($statut, $allowed, true)) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Statut invalide."
            ]);
            return;
        }

        $sql = "UPDATE home_visits 
                SET statut = :statut, updatedAt = NOW()
                WHERE idHomeVisit = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':statut', $statut);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Statut mis à jour avec succès."
        ]);
    }

    public function delete(int $id): void
    {
        $sql = "DELETE FROM home_visits WHERE idHomeVisit = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Visite supprimée avec succès."
        ]);
    }
    public function update(int $id): void
{
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        !isset(
            $data['idPatient'],
            $data['idStaff'],
            $data['dateVisite'],
            $data['heureVisite'],
            $data['statut']
        )
    ) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Tous les champs de la visite sont obligatoires."
        ]);
        return;
    }

    // récupérer l'ancienne visite pour conserver l'historique en cas de report
    $sqlOld = "SELECT dateVisite, heureVisite FROM home_visits WHERE idHomeVisit = :id";
    $stmtOld = $this->conn->prepare($sqlOld);
    $stmtOld->bindValue(':id', $id, PDO::PARAM_INT);
    $stmtOld->execute();
    $oldVisit = $stmtOld->fetch();

    $ancienneDateVisite = null;
    $ancienneHeureVisite = null;

    if ($oldVisit) {
        if (
            $oldVisit['dateVisite'] !== $data['dateVisite'] ||
            $oldVisit['heureVisite'] !== $data['heureVisite']
        ) {
            $ancienneDateVisite = $oldVisit['dateVisite'];
            $ancienneHeureVisite = $oldVisit['heureVisite'];
        }
    }

    $sql = "UPDATE home_visits
            SET idPatient = :idPatient,
                idStaff = :idStaff,
                dateVisite = :dateVisite,
                heureVisite = :heureVisite,
                statut = :statut,
                ancienneDateVisite = :ancienneDateVisite,
                ancienneHeureVisite = :ancienneHeureVisite
            WHERE idHomeVisit = :id";

    $stmt = $this->conn->prepare($sql);
    $stmt->bindValue(':idPatient', $data['idPatient'], PDO::PARAM_INT);
    $stmt->bindValue(':idStaff', $data['idStaff'], PDO::PARAM_INT);
    $stmt->bindValue(':dateVisite', $data['dateVisite']);
    $stmt->bindValue(':heureVisite', $data['heureVisite']);
    $stmt->bindValue(':statut', $data['statut']);
    $stmt->bindValue(':ancienneDateVisite', $ancienneDateVisite);
    $stmt->bindValue(':ancienneHeureVisite', $ancienneHeureVisite);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Visite modifiée avec succès."
    ]);
}
}