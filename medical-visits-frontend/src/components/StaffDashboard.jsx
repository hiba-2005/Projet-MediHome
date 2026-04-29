import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffDashboard.css";

const API_BASE = "http://localhost/medical-home-visits-backend/public/api";

export default function StaffDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState(null);
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [error, setError] = useState("");
  const [savingReport, setSavingReport] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [pageMessage, setPageMessage] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [reportForm, setReportForm] = useState({
    observations: "",
    soinsEffectues: "",
    recommandations: "",
  });

  const [profileForm, setProfileForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    specialite: "",
    role: "",
  });

  const showMessage = (text) => {
    setPageMessage(text);
    setTimeout(() => setPageMessage(""), 3000);
  };

  const loadStaffVisits = async () => {
    const idStaff = localStorage.getItem("idStaff");
    const nom = localStorage.getItem("staffNom");
    const prenom = localStorage.getItem("staffPrenom");
    const email = localStorage.getItem("staffEmail");
    const role = localStorage.getItem("staffRole");
    const specialite = localStorage.getItem("staffSpecialite");

    if (!idStaff) {
      setError("Personnel médical non connecté.");
      setLoading(false);
      return;
    }

    const currentStaff = {
      idStaff,
      nom: nom || "",
      prenom: prenom || "",
      email: email || "",
      role: role || "",
      specialite: specialite || "",
      telephone: "",
    };

    setStaff(currentStaff);
    setProfileForm({
      nom: currentStaff.nom,
      prenom: currentStaff.prenom,
      email: currentStaff.email,
      telephone: currentStaff.telephone,
      specialite: currentStaff.specialite,
      role: currentStaff.role,
    });

    try {
      const [staffRes, visitsRes] = await Promise.all([
        fetch(`${API_BASE}/staff`),
        fetch(`${API_BASE}/home-visits`),
      ]);

      const staffData = await staffRes.json();
      const visitsData = await visitsRes.json();

      if (!staffRes.ok || !staffData.success) {
        throw new Error(staffData.message || "Erreur lors du chargement du profil.");
      }

      if (!visitsRes.ok || !visitsData.success) {
        throw new Error(visitsData.message || "Erreur lors du chargement des visites.");
      }

      const fullStaff =
        (staffData.staff || []).find(
          (member) => String(member.idStaff) === String(idStaff)
        ) || currentStaff;

      setStaff(fullStaff);
      setProfileForm({
        nom: fullStaff.nom || "",
        prenom: fullStaff.prenom || "",
        email: fullStaff.email || "",
        telephone: fullStaff.telephone || "",
        specialite: fullStaff.specialite || "",
        role: fullStaff.role || "",
      });

      const filtered = (visitsData.visits || []).filter(
        (visit) => String(visit.idStaff) === String(idStaff)
      );

      setVisits(filtered);

      if (filtered.length > 0) {
        if (selectedVisit) {
          const refreshedSelected = filtered.find(
            (v) => String(v.idHomeVisit) === String(selectedVisit.idHomeVisit)
          );
          setSelectedVisit(refreshedSelected || filtered[0]);
        } else {
          setSelectedVisit(filtered[0]);
        }
      } else {
        setSelectedVisit(null);
      }

      setError("");
    } catch (err) {
      setError(err.message || "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffVisits();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("idStaff");
    localStorage.removeItem("staffNom");
    localStorage.removeItem("staffPrenom");
    localStorage.removeItem("staffEmail");
    localStorage.removeItem("staffRole");
    localStorage.removeItem("staffSpecialite");
    navigate("/auth");
  };

  const handleReportChange = (e) => {
    setReportForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCancelEditProfile = () => {
    setEditMode(false);
    setProfileForm({
      nom: staff?.nom || "",
      prenom: staff?.prenom || "",
      email: staff?.email || "",
      telephone: staff?.telephone || "",
      specialite: staff?.specialite || "",
      role: staff?.role || "",
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const idStaff = localStorage.getItem("idStaff");
    if (!idStaff) {
      showMessage("Personnel médical non connecté.");
      return;
    }

    if (
      !profileForm.nom.trim() ||
      !profileForm.prenom.trim() ||
      !profileForm.email.trim() ||
      !profileForm.telephone.trim() ||
      !profileForm.specialite.trim()
    ) {
      showMessage("Veuillez remplir tous les champs du profil.");
      return;
    }

    setSavingProfile(true);

    try {
      const res = await fetch(`${API_BASE}/staff/${idStaff}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: profileForm.nom,
          prenom: profileForm.prenom,
          specialite: profileForm.specialite,
          telephone: profileForm.telephone,
          email: profileForm.email,
          role: profileForm.role || "personnel_medical",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Impossible de modifier le profil.");
      }

      localStorage.setItem("staffNom", profileForm.nom);
      localStorage.setItem("staffPrenom", profileForm.prenom);
      localStorage.setItem("staffEmail", profileForm.email);
      localStorage.setItem("staffRole", profileForm.role || "personnel_medical");
      localStorage.setItem("staffSpecialite", profileForm.specialite);

      showMessage("Informations modifiées avec succès.");
      setEditMode(false);
      await loadStaffVisits();
    } catch (err) {
      showMessage(err.message || "Erreur lors de la modification du profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const updateVisitStatus = async (idHomeVisit, statut) => {
    if (!idHomeVisit) return;

    setSavingStatus(true);

    try {
      const res = await fetch(`${API_BASE}/home-visits/${idHomeVisit}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statut }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Impossible de modifier le statut.");
      }

      showMessage(
        statut === "en_route"
          ? "Le statut de la visite est maintenant : en route."
          : "Le statut de la visite est maintenant : terminée."
      );

      await loadStaffVisits();
    } catch (err) {
      showMessage(err.message || "Erreur lors de la mise à jour du statut.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();

    if (!selectedVisit) {
      alert("Aucune visite sélectionnée.");
      return;
    }

    if (
      !reportForm.observations.trim() ||
      !reportForm.soinsEffectues.trim() ||
      !reportForm.recommandations.trim()
    ) {
      alert("Veuillez remplir tous les champs du rapport.");
      return;
    }

    setSavingReport(true);

    try {
      const res = await fetch(`${API_BASE}/visit-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idHomeVisit: selectedVisit.idHomeVisit,
          observations: reportForm.observations,
          soinsEffectues: reportForm.soinsEffectues,
          recommandations: reportForm.recommandations,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de l'ajout du rapport.");
      }

      const statusRes = await fetch(
        `${API_BASE}/home-visits/${selectedVisit.idHomeVisit}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            statut: "terminee",
          }),
        }
      );

      const statusData = await statusRes.json();

      if (!statusRes.ok || !statusData.success) {
        throw new Error(
          statusData.message ||
            "Rapport enregistré, mais le statut n'a pas été mis à jour."
        );
      }

      setReportForm({
        observations: "",
        soinsEffectues: "",
        recommandations: "",
      });

      showMessage("Rapport ajouté avec succès et visite marquée comme terminée.");
      await loadStaffVisits();
    } catch (err) {
      alert(err.message || "Erreur serveur.");
    } finally {
      setSavingReport(false);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "status-neutral";
    const s = status.toLowerCase();

    if (s === "planifiee") return "status-planned";
    if (s === "en_route") return "status-route";
    if (s === "reportee") return "status-postponed";
    if (s === "terminee") return "status-done";
    return "status-neutral";
  };

  const notifications = useMemo(() => {
    return visits
      .filter((visit) => {
        const s = visit.statut?.toLowerCase();
        return s === "planifiee" || s === "en_route";
      })
      .map((visit) => {
        const s = visit.statut?.toLowerCase();

        if (s === "planifiee") {
          return {
            id: visit.idHomeVisit,
            type: "new",
            title: "Nouvelle visite à effectuer",
            text: `Une nouvelle visite est programmée pour ${visit.prenomPatient} ${visit.nomPatient} le ${visit.dateVisite} à ${visit.heureVisite}.`,
          };
        }

        return {
          id: visit.idHomeVisit,
          type: "route",
          title: "Visite en cours",
          text: `Vous êtes en route pour la visite de ${visit.prenomPatient} ${visit.nomPatient}.`,
        };
      });
  }, [visits]);

  const stats = useMemo(() => {
    return {
      total: visits.length,
      planned: visits.filter((v) => v.statut?.toLowerCase() === "planifiee").length,
      route: visits.filter((v) => v.statut?.toLowerCase() === "en_route").length,
      postponed: visits.filter((v) => v.statut?.toLowerCase() === "reportee").length,
      done: visits.filter((v) => v.statut?.toLowerCase() === "terminee").length,
    };
  }, [visits]);

  if (loading) {
    return (
      <div className="medical-page">
        <div className="medical-container">
          <div className="medical-loading-card">
            <div className="loader"></div>
            <p>Chargement de l’espace médical...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medical-page">
        <div className="medical-container">
          <div className="medical-error-card">
            <h2>Erreur</h2>
            <p>{error}</p>
            <button className="logout-btn" onClick={() => navigate("/auth")}>
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-page">
      <div className="medical-container">
        <div className="medical-topbar">
          <div className="medical-brand">
            <div className="medical-brand-icon">🩺</div>
            <div>
              <h3>MediHome</h3>
              <span>Espace personnel médical</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        <div className="medical-hero">
          <div className="medical-hero-left">
            <div className="medical-avatar">
              {staff?.prenom?.charAt(0)}
              {staff?.nom?.charAt(0)}
            </div>

            <div>
              <h1>
                Bonjour, {staff?.prenom} {staff?.nom}
              </h1>
              <p>
                Consultez vos visites, changez le statut et ajoutez vos rapports
                de soins.
              </p>
            </div>
          </div>

          <div className="medical-badges">
            <span className="hero-chip">
              {staff?.specialite || "Personnel médical"}
            </span>
            <span className="hero-chip chip-soft">{staff?.role || "staff"}</span>
          </div>
        </div>

        {pageMessage && <div className="page-message">{pageMessage}</div>}

        {notifications.length > 0 && (
          <div className="medical-card notifications-card">
            <div className="card-header">
              <h2>Notifications</h2>
              <span className="card-chip">Alertes</span>
            </div>

            <div className="notification-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${
                    notif.type === "new" ? "notif-new" : "notif-route"
                  }`}
                >
                  <h4>{notif.title}</h4>
                  <p>{notif.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="medical-stats">
          <div className="stat-card">
            <strong>{stats.total}</strong>
            <span>Visites totales</span>
          </div>
          <div className="stat-card">
            <strong>{stats.planned}</strong>
            <span>Planifiées</span>
          </div>
          <div className="stat-card">
            <strong>{stats.route}</strong>
            <span>En route</span>
          </div>
          <div className="stat-card">
            <strong>{stats.postponed}</strong>
            <span>Reportées</span>
          </div>
          <div className="stat-card">
            <strong>{stats.done}</strong>
            <span>Terminées</span>
          </div>
        </div>

        <div className="medical-grid">
          <div className="medical-card">
            <div className="card-header">
              <h2>Mes informations</h2>
              <div className="card-actions">
                {!editMode ? (
                  <button
                    className="edit-profile-btn"
                    onClick={() => setEditMode(true)}
                  >
                    Modifier
                  </button>
                ) : (
                  <button
                    className="cancel-profile-btn"
                    onClick={handleCancelEditProfile}
                  >
                    Annuler
                  </button>
                )}
                <span className="card-chip">Profil</span>
              </div>
            </div>

            {!editMode ? (
              <div className="info-list">
                <div className="info-row">
                  <span>Prénom</span>
                  <strong>{staff?.prenom}</strong>
                </div>
                <div className="info-row">
                  <span>Nom</span>
                  <strong>{staff?.nom}</strong>
                </div>
                <div className="info-row">
                  <span>Email</span>
                  <strong>{staff?.email}</strong>
                </div>
                <div className="info-row">
                  <span>Téléphone</span>
                  <strong>{staff?.telephone || "-"}</strong>
                </div>
                <div className="info-row">
                  <span>Rôle</span>
                  <strong>{staff?.role}</strong>
                </div>
                <div className="info-row">
                  <span>Spécialité</span>
                  <strong>{staff?.specialite}</strong>
                </div>
              </div>
            ) : (
              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="profile-grid">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      value={profileForm.prenom}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={profileForm.nom}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="profile-grid">
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      type="text"
                      name="telephone"
                      value={profileForm.telephone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Spécialité</label>
                    <input
                      type="text"
                      name="specialite"
                      value={profileForm.specialite}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <button type="submit" className="save-btn" disabled={savingProfile}>
                  {savingProfile ? "Enregistrement..." : "Enregistrer mes informations"}
                </button>
              </form>
            )}
          </div>

          <div className="medical-card">
            <div className="card-header">
              <h2>Mes visites</h2>
              <span className="card-chip">{visits.length} visite(s)</span>
            </div>

            {visits.length === 0 ? (
              <div className="empty-box">
                <div className="empty-icon">📭</div>
                <h3>Aucune visite affectée</h3>
                <p>Vous n’avez pas encore de visites à domicile affectées.</p>
              </div>
            ) : (
              <div className="visit-list">
                {visits.map((visit) => (
                  <button
                    key={visit.idHomeVisit}
                    className={`visit-item ${
                      selectedVisit?.idHomeVisit === visit.idHomeVisit ? "active" : ""
                    }`}
                    onClick={() => setSelectedVisit(visit)}
                  >
                    <div className="visit-item-top">
                      <strong>
                        {visit.prenomPatient} {visit.nomPatient}
                      </strong>
                      <span className={`status-badge ${getStatusClass(visit.statut)}`}>
                        {visit.statut}
                      </span>
                    </div>
                    <div className="visit-item-bottom">
                      <span>{visit.dateVisite}</span>
                      <span>{visit.heureVisite}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedVisit && (
          <div className="medical-grid detail-grid">
            <div className="medical-card">
              <div className="card-header">
                <h2>Détail de la visite</h2>
                <span className={`status-badge ${getStatusClass(selectedVisit.statut)}`}>
                  {selectedVisit.statut}
                </span>
              </div>

              <div className="info-list">
                <div className="info-row">
                  <span>Patient</span>
                  <strong>
                    {selectedVisit.prenomPatient} {selectedVisit.nomPatient}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Téléphone</span>
                  <strong>{selectedVisit.telephone}</strong>
                </div>

                <div className="info-row">
                  <span>Adresse</span>
                  <strong>{selectedVisit.adresse}</strong>
                </div>

                <div className="info-row">
                  <span>Date</span>
                  <strong>{selectedVisit.dateVisite}</strong>
                </div>

                <div className="info-row">
                  <span>Heure</span>
                  <strong>{selectedVisit.heureVisite}</strong>
                </div>

                {selectedVisit.statut?.toLowerCase() === "reportee" && (
                  <>
                    <div className="info-row">
                      <span>Ancienne date</span>
                      <strong>{selectedVisit.ancienneDateVisite || "-"}</strong>
                    </div>

                    <div className="info-row">
                      <span>Ancienne heure</span>
                      <strong>{selectedVisit.ancienneHeureVisite || "-"}</strong>
                    </div>
                  </>
                )}
              </div>

              <div className="status-actions">
                {selectedVisit.statut?.toLowerCase() !== "en_route" &&
                  selectedVisit.statut?.toLowerCase() !== "terminee" && (
                    <button
                      className="route-btn"
                      onClick={() =>
                        updateVisitStatus(selectedVisit.idHomeVisit, "en_route")
                      }
                      disabled={savingStatus}
                    >
                      {savingStatus ? "Traitement..." : "Marquer en route"}
                    </button>
                  )}

                {selectedVisit.statut?.toLowerCase() !== "terminee" && (
                  <button
                    className="done-btn"
                    onClick={() =>
                      updateVisitStatus(selectedVisit.idHomeVisit, "terminee")
                    }
                    disabled={savingStatus}
                  >
                    {savingStatus ? "Traitement..." : "Marquer terminée"}
                  </button>
                )}
              </div>
            </div>

            <div className="medical-card">
              <div className="card-header">
                <h2>Ajouter un rapport</h2>
                <span className="card-chip">Compte rendu</span>
              </div>

              <form className="report-form" onSubmit={handleCreateReport}>
                <div className="form-group">
                  <label>Observations</label>
                  <textarea
                    name="observations"
                    rows="4"
                    value={reportForm.observations}
                    onChange={handleReportChange}
                  />
                </div>

                <div className="form-group">
                  <label>Soins effectués</label>
                  <textarea
                    name="soinsEffectues"
                    rows="4"
                    value={reportForm.soinsEffectues}
                    onChange={handleReportChange}
                  />
                </div>

                <div className="form-group">
                  <label>Recommandations</label>
                  <textarea
                    name="recommandations"
                    rows="4"
                    value={reportForm.recommandations}
                    onChange={handleReportChange}
                  />
                </div>

                <button type="submit" className="save-btn" disabled={savingReport}>
                  {savingReport ? "Enregistrement..." : "Enregistrer le rapport"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}