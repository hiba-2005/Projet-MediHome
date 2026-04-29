<?php

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/PatientController.php';
require_once __DIR__ . '/../controllers/StaffController.php';
require_once __DIR__ . '/../controllers/HomeVisitController.php';
require_once __DIR__ . '/../controllers/VisitReportController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$basePath = '/medical-home-visits-backend/public';
$route = str_replace($basePath, '', $uri);

$authController = new AuthController();
$patientController = new PatientController();
$staffController = new StaffController();
$homeVisitController = new HomeVisitController();
$visitReportController = new VisitReportController();

/* AUTH */
if ($method === 'POST' && $route === '/api/login/patient') {
    $authController->loginPatient();
    exit;
}

if ($method === 'POST' && $route === '/api/login/staff') {
    $authController->loginStaff();
    exit;
}

/* PATIENTS */
if ($method === 'POST' && $route === '/api/patients/register') {
    $patientController->register();
    exit;
}

if ($method === 'GET' && $route === '/api/patients') {
    $patientController->getAll();
    exit;
}

if ($method === 'POST' && $route === '/api/patients') {
    $patientController->create();
    exit;
}

/* DASHBOARD PATIENT */
if ($method === 'GET' && preg_match('#^/api/patients/(\d+)/dashboard$#', $route, $matches)) {
    $patientController->getDashboard((int)$matches[1]);
    exit;
}

/* CHANGER MOT DE PASSE PATIENT */
if ($method === 'POST' && preg_match('#^/api/patients/(\d+)/password$#', $route, $matches)) {
    $patientController->updatePassword((int)$matches[1]);
    exit;
}

/* PATIENT BY ID */
if ($method === 'GET' && preg_match('#^/api/patients/(\d+)$#', $route, $matches)) {
    $patientController->getById((int)$matches[1]);
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/patients/(\d+)$#', $route, $matches)) {
    $patientController->update((int)$matches[1]);
    exit;
}

if ($method === 'DELETE' && preg_match('#^/api/patients/(\d+)$#', $route, $matches)) {
    $patientController->delete((int)$matches[1]);
    exit;
}

/* STAFF */
if ($method === 'GET' && $route === '/api/staff') {
    $staffController->getAll();
    exit;
}

if ($method === 'POST' && $route === '/api/staff') {
    $staffController->create();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/staff/(\d+)/visits$#', $route, $matches)) {
    $homeVisitController->getByStaff((int)$matches[1]);
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/staff/(\d+)$#', $route, $matches)) {
    $staffController->update((int)$matches[1]);
    exit;
}

if ($method === 'DELETE' && preg_match('#^/api/staff/(\d+)$#', $route, $matches)) {
    $staffController->delete((int)$matches[1]);
    exit;
}

/* HOME VISITS */
if ($method === 'GET' && $route === '/api/home-visits') {
    $homeVisitController->getAll();
    exit;
}

if ($method === 'POST' && $route === '/api/home-visits') {
    $homeVisitController->create();
    exit;
}

if ($method === 'PUT' && preg_match('#^/api/home-visits/(\d+)$#', $route, $matches)) {
    $homeVisitController->update((int)$matches[1]);
    exit;
}

if ($method === 'PATCH' && preg_match('#^/api/home-visits/(\d+)/status$#', $route, $matches)) {
    $homeVisitController->updateStatus((int)$matches[1]);
    exit;
}

if ($method === 'DELETE' && preg_match('#^/api/home-visits/(\d+)$#', $route, $matches)) {
    $homeVisitController->delete((int)$matches[1]);
    exit;
}

/* VISIT REPORTS */
if ($method === 'GET' && $route === '/api/visit-reports') {
    $visitReportController->getAll();
    exit;
}

if ($method === 'GET' && preg_match('#^/api/visit-reports/(\d+)$#', $route, $matches)) {
    $visitReportController->getById((int)$matches[1]);
    exit;
}

if ($method === 'POST' && $route === '/api/visit-reports') {
    $visitReportController->create();
    exit;
}

if ($method === 'DELETE' && preg_match('#^/api/visit-reports/(\d+)$#', $route, $matches)) {
    $visitReportController->delete((int)$matches[1]);
    exit;
}

http_response_code(404);
echo json_encode([
    "success" => false,
    "message" => "Route non trouvée."
]);