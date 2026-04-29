# 🏥 MediHome – Plateforme de gestion des visites médicales à domicile

<p align="center">
  <img src="./assets/logo_medihome.png" alt="Logo MediHome" width="180">
</p>

---

## 📑 Table des matières

- [📌 Description](#-description)
- [🎯 Objectifs](#-objectifs)
- [👥 Acteurs](#-acteurs)
- [🧩 Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technologies](#️-technologies)
- [🗄️ Base de données](#️-base-de-données)
- [🧬 Modélisation UML](#-modélisation-uml)
- [🎥 Démonstration](#-démonstration)
- [🚀 Installation](#-installation)
- [🔗 API](#-api)
- [📄 Génération PDF](#-génération-pdf)
- [🔐 Sécurité](#-sécurité)
- [🔄 Fonctionnement](#-fonctionnement)
- [🔮 Perspectives](#-perspectives)
- [👩‍💻 Auteur](#-auteur--encadrement)
- [📜 Licence](#-licence)

---

## 📌 Description

**MediHome** est une plateforme web et mobile dédiée à la gestion des visites médicales à domicile.  
Elle permet de connecter **patients**, **personnel médical** et **administrateurs**.

Architecture du projet :

- 🌐 Web (React)
- 📱 Mobile (Android)
- ⚙️ Backend (PHP API REST)
- 🗄️ Base de données (MySQL)

---

## 🎯 Objectifs

- Digitaliser la gestion des visites
- Planifier les interventions médicales
- Suivre les visites en temps réel
- Faciliter la communication
- Générer des rapports médicaux

---

## 👥 Acteurs

### 👤 Patient

- Consulter ses informations
- Voir sa visite
- Suivre le statut
- Voir le rapport

### 👨‍⚕️ Personnel médical

- Voir ses visites
- Consulter les patients
- Modifier le statut
- Ajouter un rapport

### 🛠️ Administrateur

- Gérer patients et staff
- Planifier visites
- Gérer rapports
- Télécharger PDF

---

## 🧩 Fonctionnalités

- Authentification (patient / staff / admin)
- CRUD Patients
- CRUD Staff
- CRUD Visites
- Gestion des statuts
- Gestion des rapports
- Génération PDF
- Dashboard Admin
- Application mobile

---

## 🏗️ Architecture

```
MediHome/
├── MediHomeMobile/
├── medical-home-visits-backend/
├── medical-visits-frontend/
├── medical_home_visits.sql
├
└── README.md
```

---

## 🛠️ Technologies

### Backend

- PHP
- API REST
- MySQL

### Frontend

- React.js
- JavaScript
- CSS

### Mobile

- Android (Java)
- XML

### Outils

- XAMPP
- VS Code
- Android Studio
- Git / GitHub

---

## 🗄️ Base de données

Le système MediHome repose sur une base de données MySQL structurée autour de quatre tables principales.

### Tables principales

- `patients`
- `staff`
- `home_visits`
- `visit_reports`

---

### Structure des tables

#### Table `patients`

| Champ | Description |
|-------|-------------|
| idPatient | Identifiant unique du patient |
| nom | Nom du patient |
| prenom | Prénom du patient |
| telephone | Numéro de téléphone |
| adresse | Adresse du patient |
| email | Adresse email |

---

#### Table `staff`

| Champ | Description |
|-------|-------------|
| idStaff | Identifiant du personnel |
| nom | Nom |
| prenom | Prénom |
| specialite | Spécialité médicale |
| role | Type d'utilisateur (personnel médical / admin) |

---

#### Table `home_visits`

| Champ | Description |
|-------|-------------|
| idHomeVisit | Identifiant de la visite |
| idPatient | Patient concerné |
| idStaff | Personnel affecté |
| dateVisite | Date de la visite |
| statut | Statut (planifiée, en route, reportée, terminée) |

---

#### Table `visit_reports`

| Champ | Description |
|-------|-------------|
| idVisitReport | Identifiant du rapport |
| observations | Observations médicales |
| soinsEffectues | Soins effectués |
| recommandations | Recommandations |

---

## 🧬 Modélisation UML

Cette section présente les diagrammes utilisés pour concevoir le système MediHome.

### Diagramme de cas d'utilisation

Ce diagramme montre les interactions entre les différents acteurs du système (patient, personnel médical, administrateur) et les fonctionnalités principales.

<p align="center">
  <img src="./assets/use_case_diagram.png" width="700" alt="Diagramme de cas d'utilisation">
</p>

---

### Diagramme de classes

Ce diagramme décrit la structure du système en termes de classes, leurs attributs et les relations entre elles.

<p align="center">
  <img src="./assets/class_diagram.png" width="700" alt="Diagramme de classes">
</p>

---

## 🎥 Démonstration

### Application Web

Une démonstration de l'interface administrateur développée avec React, incluant la gestion des patients, du personnel médical et des visites.

👉 [Voir la vidéo](./assets/demo-web.mp4)

### Application Mobile

Une démonstration de l'application Android utilisée par le patient et le personnel médical pour consulter les visites et ajouter des rapports.

👉 [Voir la vidéo](./assets/demo-mobile.mp4)

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/hiba-2005/Projet-MediHome.git
cd Projet-MediHome
```

### 2. Backend (PHP API)

1. Copier le dossier `medical-home-visits-backend` dans le répertoire `htdocs` de XAMPP.
2. Importer le fichier `medical_home_visits.sql` dans phpMyAdmin.
3. Démarrer les services Apache et MySQL depuis le panneau XAMPP.

### 3. Frontend (React)

```bash
cd medical-visits-frontend
npm install
npm start
```

### 4. Mobile (Android)

1. Ouvrir le projet dans Android Studio.
2. Modifier `ApiConfig.java` pour pointer vers l'adresse IP du serveur local.
3. Lancer l'application sur un émulateur ou un appareil physique.

---

## 🔗 API

### Authentification

```http
POST /api/login/patient
POST /api/login/staff
```

### Patients

```http
GET    /api/patients
POST   /api/patients
PUT    /api/patients/{id}
DELETE /api/patients/{id}
```

### Visites

```http
GET   /api/home-visits
POST  /api/home-visits
PATCH /api/home-visits/{id}/status
```

---

## 📄 Génération PDF

Le rapport PDF généré comprend :

- Informations du patient
- Détails de la visite
- Observations médicales
- Recommandations

---

## 🔐 Sécurité

- Mots de passe hashés
- Validation des données côté serveur
- Gestion des rôles (patient / staff / admin)
- API sécurisée

---

## 🔄 Fonctionnement

1. L'administrateur crée les comptes patients et du personnel médical.
2. L'administrateur planifie une visite médicale.
3. Le personnel médical consulte les visites qui lui sont assignées.
4. Le personnel médical met à jour le statut de la visite.
5. Après la visite, un rapport médical est ajouté.
6. Le patient consulte les informations de sa visite et son rapport.

---

## 🔮 Perspectives

- Intégration des notifications en temps réel
- Ajout de la géolocalisation du personnel médical
- Mise en place d'un système de messagerie entre patient et personnel médical
- Implémentation d'une authentification sécurisée avec JWT
- Développement d'un tableau de bord avec statistiques avancées
- Amélioration de la sécurité des données
- Déploiement du système en ligne (web et mobile)
- Amélioration de l'expérience utilisateur

---

## 👩‍💻 Auteur & Encadrement

**Réalisé par :**  
Ouirouane Hiba  
Projet de Fin de Module   
Année universitaire : 2025–2026

**Encadré par :**  
Pr. Lachgar Mohammed

---

