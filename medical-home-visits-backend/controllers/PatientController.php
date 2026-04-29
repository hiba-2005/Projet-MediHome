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
        $sql = "SELECT idPatient, nom, prenom, telephone, adresse, email
                FROM patients
                ORDER BY idPatient DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "patients" => $stmt->fetchAll()
        ]);
    }

    public function getById(int $id): void
    {
        $sql = "SELECT idPatient, nom, prenom, telephone, adresse, email
                FROM patients
                WHERE idPatient = :id";
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
            !isset(
                $data['nom'],
                $data['prenom'],
                $data['telephone'],
                $data['adresse'],
                $data['email'],
                $data['password']
            )
        ) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Tous les champs sont obligatoires."
            ]);
            return;
        }

        $nom = trim($data['nom']);
        $prenom = trim($data['prenom']);
        $telephone = trim($data['telephone']);
        $adresse = trim($data['adresse']);
        $email = trim($data['email']);
        $password = trim($data['password']);

        if (
            $nom === "" || $prenom === "" || $telephone === "" ||
            $adresse === "" || $email === "" || $password === ""
        ) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Aucun champ ne doit être vide."
            ]);
            return;
        }

        $checkSql = "SELECT idPatient FROM patients WHERE email = :email LIMIT 1";
        $checkStmt = $this->conn->prepare($checkSql);
        $checkStmt->bindValue(':email', $email);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                "success" => false,
                "message" => "Cet email existe déjà."
            ]);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO patients (nom, prenom, telephone, adresse, email, passwordHash)
                VALUES (:nom, :prenom, :telephone, :adresse, :email, :passwordHash)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':nom', $nom);
        $stmt->bindValue(':prenom', $prenom);
        $stmt->bindValue(':telephone', $telephone);
        $stmt->bindValue(':adresse', $adresse);
        $stmt->bindValue(':email', $email);
        $stmt->bindValue(':passwordHash', $passwordHash);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Patient ajouté avec succès."
        ]);
    }

    public function update(int $id): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            !isset(
                $data['nom'],
                $data['prenom'],
                $data['telephone'],
                $data['adresse'],
                $data['email']
            )
        ) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Les champs nom, prénom, téléphone, adresse et email sont obligatoires."
            ]);
            return;
        }

        $sql = "UPDATE patients
                SET nom = :nom,
                    prenom = :prenom,
                    telephone = :telephone,
                    adresse = :adresse,
                    email = :email
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

    public function register(): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            !isset(
                $data['nom'],
                $data['prenom'],
                $data['telephone'],
                $data['adresse'],
                $data['email'],
                $data['password']
            )
        ) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Tous les champs sont obligatoires."
            ]);
            return;
        }

        $nom = trim($data['nom']);
        $prenom = trim($data['prenom']);
        $telephone = trim($data['telephone']);
        $adresse = trim($data['adresse']);
        $email = trim($data['email']);
        $password = trim($data['password']);

        if (
            $nom === "" || $prenom === "" || $telephone === "" ||
            $adresse === "" || $email === "" || $password === ""
        ) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Aucun champ ne doit être vide."
            ]);
            return;
        }

        $checkSql = "SELECT idPatient FROM patients WHERE email = :email LIMIT 1";
        $checkStmt = $this->conn->prepare($checkSql);
        $checkStmt->bindValue(':email', $email);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                "success" => false,
                "message" => "Cet email existe déjà."
            ]);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO patients (nom, prenom, telephone, adresse, email, passwordHash)
                VALUES (:nom, :prenom, :telephone, :adresse, :email, :passwordHash)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':nom', $nom);
        $stmt->bindValue(':prenom', $prenom);
        $stmt->bindValue(':telephone', $telephone);
        $stmt->bindValue(':adresse', $adresse);
        $stmt->bindValue(':email', $email);
        $stmt->bindValue(':passwordHash', $passwordHash);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Inscription patient réussie."
        ]);
    }

   public function getDashboard(int $id): void
{
    $sqlPatient = "SELECT idPatient, nom, prenom, telephone, adresse, email
                   FROM patients
                   WHERE idPatient = :id";
    $stmtPatient = $this->conn->prepare($sqlPatient);
    $stmtPatient->bindValue(':id', $id, PDO::PARAM_INT);
    $stmtPatient->execute();

    $patient = $stmtPatient->fetch();

    if (!$patient) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Patient introuvable."
        ]);
        return;
    }

    $sqlVisit = "SELECT hv.idHomeVisit,
                        hv.idPatient,
                        hv.idStaff,
                        hv.dateVisite,
                        hv.heureVisite,
                        hv.statut,
                        hv.ancienneDateVisite,
                        hv.ancienneHeureVisite,
                        hv.createdAt,
                        hv.updatedAt,
                        s.nom AS nomStaff,
                        s.prenom AS prenomStaff,
                        s.specialite
                 FROM home_visits hv
                 JOIN staff s ON hv.idStaff = s.idStaff
                 WHERE hv.idPatient = :id
                 ORDER BY hv.dateVisite DESC, hv.heureVisite DESC
                 LIMIT 1";
    $stmtVisit = $this->conn->prepare($sqlVisit);
    $stmtVisit->bindValue(':id', $id, PDO::PARAM_INT);
    $stmtVisit->execute();

    $visit = $stmtVisit->fetch();

    if (!$visit) {
        echo json_encode([
            "success" => true,
            "patient" => $patient,
            "hasVisit" => false,
            "message" => "Aucune visite programmée pour le moment. Veuillez contacter le responsable pour fixer une home visit.",
            "notifications" => []
        ]);
        return;
    }

    $sqlReport = "SELECT idVisitReport, idHomeVisit, observations, soinsEffectues, recommandations, createdAt
                  FROM visit_reports
                  WHERE idHomeVisit = :idHomeVisit
                  LIMIT 1";
    $stmtReport = $this->conn->prepare($sqlReport);
    $stmtReport->bindValue(':idHomeVisit', $visit['idHomeVisit'], PDO::PARAM_INT);
    $stmtReport->execute();

    $report = $stmtReport->fetch();

    $notifications = [];
    $statut = strtolower(trim($visit['statut'] ?? ''));

    if ($statut === 'planifiee') {
        $notifications[] = [
            "type" => "new_visit",
            "title" => "Nouvelle visite planifiée",
            "text" => "Une nouvelle visite à domicile a été programmée pour le " . $visit['dateVisite'] . " à " . $visit['heureVisite'] . "."
        ];
    }

    if ($statut === 'en_route') {
        $notifications[] = [
            "type" => "on_the_way",
            "title" => "Personnel médical en route",
            "text" => "Le personnel médical est en route pour votre visite."
        ];
    }

    if ($statut === 'reportee') {
        $notifications[] = [
            "type" => "postponed",
            "title" => "Visite reportée",
            "text" => "Votre visite a été reportée. Nouvelle date : " . $visit['dateVisite'] . " à " . $visit['heureVisite'] . "."
        ];
    }

    if ($statut === 'terminee') {
        $notifications[] = [
            "type" => "visit_done",
            "title" => "Visite effectuée",
            "text" => "Votre visite à domicile a été effectuée avec succès."
        ];

        if ($report) {
            $notifications[] = [
                "type" => "report_available",
                "title" => "Rapport disponible",
                "text" => "Le compte rendu de votre visite est maintenant disponible."
            ];
        }
    }

    echo json_encode([
        "success" => true,
        "patient" => $patient,
        "hasVisit" => true,
        "visit" => $visit,
        "report" => $report ?: null,
        "notifications" => $notifications
    ]);
}
public function updatePassword(int $id): void
{
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['password'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Le nouveau mot de passe est obligatoire."
        ]);
        return;
    }

    $password = trim($data['password']);

    if ($password === "" || strlen($password) < 6) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Le mot de passe doit contenir au moins 6 caractères."
        ]);
        return;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $sql = "UPDATE patients
            SET passwordHash = :passwordHash
            WHERE idPatient = :id";
    $stmt = $this->conn->prepare($sql);
    $stmt->bindValue(':passwordHash', $passwordHash);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Mot de passe modifié avec succès."
    ]);
}
}