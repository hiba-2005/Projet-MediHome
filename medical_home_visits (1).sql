-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 29 avr. 2026 à 17:00
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `medical_home_visits`
--

-- --------------------------------------------------------

--
-- Structure de la table `home_visits`
--

CREATE TABLE `home_visits` (
  `idHomeVisit` int(11) NOT NULL,
  `idPatient` int(11) NOT NULL,
  `idStaff` int(11) NOT NULL,
  `dateVisite` date NOT NULL,
  `heureVisite` time NOT NULL,
  `statut` varchar(50) NOT NULL,
  `ancienneDateVisite` date DEFAULT NULL,
  `ancienneHeureVisite` time DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `home_visits`
--

INSERT INTO `home_visits` (`idHomeVisit`, `idPatient`, `idStaff`, `dateVisite`, `heureVisite`, `statut`, `ancienneDateVisite`, `ancienneHeureVisite`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, '2026-03-15', '09:00:00', 'terminee', NULL, NULL, '2026-04-08 14:15:03', '2026-04-16 00:00:29'),
(2, 2, 2, '2026-03-15', '11:00:00', 'terminee', NULL, NULL, '2026-04-08 14:15:03', '2026-04-18 20:44:12'),
(3, 1, 1, '2026-03-16', '14:00:00', 'reportee', '2026-03-14', '10:00:00', '2026-04-08 14:15:03', '2026-04-08 14:15:03'),
(4, 1, 1, '2026-04-10', '10:00:00', 'terminee', NULL, NULL, '2026-04-08 18:31:33', '2026-04-21 00:26:01'),
(5, 5, 2, '2026-04-16', '09:30:00', 'terminee', NULL, NULL, '2026-04-15 23:17:57', '2026-04-18 11:44:12'),
(6, 7, 2, '2026-04-17', '09:45:00', 'terminee', NULL, NULL, '2026-04-15 23:43:06', '2026-04-18 12:36:16'),
(7, 6, 1, '2026-04-21', '14:59:00', 'terminee', NULL, NULL, '2026-04-20 22:59:25', '2026-04-21 00:26:22'),
(8, 4, 2, '2026-04-25', '16:00:00', 'en_route', NULL, NULL, '2026-04-25 12:03:51', '2026-04-25 21:19:37'),
(9, 10, 1, '2026-04-25', '18:30:00', 'planifiee', NULL, NULL, '2026-04-25 12:19:52', '2026-04-25 12:19:52'),
(10, 2, 2, '2026-04-25', '17:30:00', 'planifiee', NULL, NULL, '2026-04-25 12:21:37', '2026-04-25 12:21:37'),
(11, 5, 2, '2026-04-28', '23:30:00', 'planifiee', NULL, NULL, '2026-04-28 23:12:45', '2026-04-28 23:12:45');

-- --------------------------------------------------------

--
-- Structure de la table `patients`
--

CREATE TABLE `patients` (
  `idPatient` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `adresse` varchar(255) NOT NULL,
  `email` varchar(150) NOT NULL,
  `passwordHash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `patients`
--

INSERT INTO `patients` (`idPatient`, `nom`, `prenom`, `telephone`, `adresse`, `email`, `passwordHash`) VALUES
(1, 'El Amrani', 'Ahmed', '0611111111', 'Marrakech, Guéliz', 'ahmed@gmail.com', '123456'),
(2, 'Bennani', 'Fatima', '0622222222', 'Marrakech, Mhamid', 'fatima@gmail.com', '123456'),
(4, 'OUIROUANE', 'HIBA', '0767940351', 'MARRAKECH', 'hiba.ouirouane.05@gmail.com', '$2y$10$MMSMDpKOiATTMZ9XQKHPq.BEy8f3e1h6.bCS9Nvzu2CqQTwislUVq'),
(5, 'hajar', 'hajar', '0767940351', 'MARRAKECH massira', 'hajar@gmail.com', '$2y$10$fDkkaHzN29r/45ySMOZaAeSlZxkrVJNRGJeqjgGqrDI5fwfyO8Uk.'),
(6, 'ROMA', 'ROMA', '987654334', 'AGADIR', 'roma@gmail.com', '$2y$10$C7I1ZGUPiECHXQG7Lij0jetH3GPzxafXSHFbWhT.ZZA1eQ1ocF0jW'),
(7, 'Nour', 'NOUR', '9876543210', 'Marrakech massira', 'NOUR@gmail.com', '$2y$10$BoEMC1N/KoGgy0q0RVSHhuyBUYMeWqJy4Bs6rc6TPKQ4iMUetMbwO'),
(8, 'fati', 'fatii', '0712352394', 'safi', 'fati@gmail.com', '$2y$10$5DOVc34Y.zGtDFiqqJ47F.7jTSgxEt72DOxMHplw1euLC1jc5gik2'),
(9, 'ahmed', 'ahmed', '0788645966', 'Marrakech', 'ahme@gmail.com', '$2y$10$6.LML8sPEbgmywmJK/8vv.XfWD8JcGCpMgKDf4PronZhwRH1A8nrm'),
(10, 'ftd', 'rx', '8585588', 'tdchub', 'ftcv', '$2y$10$mqjNGwVcBekKuf1zA5Z4hO5JugfVCEwdwMjOGqUTIwu7NWfk2dLrG'),
(11, 'ijdhfu', 'QBfuef', '1234567890', 'ZXER5CTYU', 'YVUBHNJ@GAMIL.COM', '$2y$10$HhFR7OiVMo9AGMrNJwyGpOrHBg0AEzt1VL8m.Ya80XfQlgceLhcty');

-- --------------------------------------------------------

--
-- Structure de la table `staff`
--

CREATE TABLE `staff` (
  `idStaff` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `specialite` varchar(100) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `staff`
--

INSERT INTO `staff` (`idStaff`, `nom`, `prenom`, `specialite`, `telephone`, `email`, `passwordHash`, `role`) VALUES
(1, 'Alaoui', 'Youssef', 'Infirmier', '9124790865', 'youssef@gmail.com', '$2y$10$mro3QC2.O/Z.JU2BjQGQU.rpA8aTO305B2/wN6m7hSt39rL82WdQO', 'personnel_medical'),
(2, 'Karimi', 'Sara', 'Médecin généraliste', '0644444446', 'sara@gmail.com', '$2y$10$mro3QC2.O/Z.JU2BjQGQU.rpA8aTO305B2/wN6m7hSt39rL82WdQO', 'personnel_medical'),
(3, 'Nadiri', 'Hiba', 'Administration', '0655555555', 'hiba@gmail.com', '$2y$10$mro3QC2.O/Z.JU2BjQGQU.rpA8aTO305B2/wN6m7hSt39rL82WdQO', 'coordinateur');

-- --------------------------------------------------------

--
-- Structure de la table `visit_reports`
--

CREATE TABLE `visit_reports` (
  `idVisitReport` int(11) NOT NULL,
  `idHomeVisit` int(11) NOT NULL,
  `observations` text NOT NULL,
  `soinsEffectues` text NOT NULL,
  `recommandations` text NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `visit_reports`
--

INSERT INTO `visit_reports` (`idVisitReport`, `idHomeVisit`, `observations`, `soinsEffectues`, `recommandations`, `createdAt`) VALUES
(1, 2, 'Patient avec légère fièvre.', 'Prise de température et médicament.', 'Repos et hydratation.', '2026-04-08 14:15:03'),
(2, 1, 'Etat stable', 'Prise de tension', 'Repos', '2026-04-08 18:31:56'),
(4, 5, 'JREGUAZHFJKbfuiz', 'JHZEGFRZEGFJHdfcz', 'KLJDSGUZYR98EJ', '2026-04-18 11:44:11'),
(5, 4, 'MKUTVERDTFYGHUJIKL', 'WSXRDCTFVYGBUHNIJ?OK.', 'QWSEXRD6CTY8BUI?O', '2026-04-21 00:26:00'),
(6, 7, 'UYGUYVHV', 'JKBUYVTYCRXEW', 'KJBGVGYCTXR\n', '2026-04-21 00:26:22');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `home_visits`
--
ALTER TABLE `home_visits`
  ADD PRIMARY KEY (`idHomeVisit`),
  ADD KEY `fk_patient` (`idPatient`),
  ADD KEY `fk_staff` (`idStaff`);

--
-- Index pour la table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`idPatient`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`idStaff`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `visit_reports`
--
ALTER TABLE `visit_reports`
  ADD PRIMARY KEY (`idVisitReport`),
  ADD UNIQUE KEY `idHomeVisit` (`idHomeVisit`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `home_visits`
--
ALTER TABLE `home_visits`
  MODIFY `idHomeVisit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `patients`
--
ALTER TABLE `patients`
  MODIFY `idPatient` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `staff`
--
ALTER TABLE `staff`
  MODIFY `idStaff` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `visit_reports`
--
ALTER TABLE `visit_reports`
  MODIFY `idVisitReport` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `home_visits`
--
ALTER TABLE `home_visits`
  ADD CONSTRAINT `fk_patient` FOREIGN KEY (`idPatient`) REFERENCES `patients` (`idPatient`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_staff` FOREIGN KEY (`idStaff`) REFERENCES `staff` (`idStaff`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `visit_reports`
--
ALTER TABLE `visit_reports`
  ADD CONSTRAINT `fk_visit` FOREIGN KEY (`idHomeVisit`) REFERENCES `home_visits` (`idHomeVisit`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
