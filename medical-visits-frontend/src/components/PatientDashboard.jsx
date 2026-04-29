import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientDashboard.css";

const API_BASE = "http://localhost/medical-home-visits-backend/public/api";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  const loadDashboard = async () => {
    const patientId = localStorage.getItem("idPatient");

    if (!patientId) {
      setError("Patient non connecté.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/dashboard`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erreur lors du chargement des données.");
      }

      setPatientData(data);
      setEditForm({
        prenom: data.patient.prenom || "",
        nom: data.patient.nom || "",
        email: data.patient.email || "",
        telephone: data.patient.telephone || "",
        adresse: data.patient.adresse || "",
      });
      setError("");
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("idPatient");
    localStorage.removeItem("patientNom");
    localStorage.removeItem("patientPrenom");
    localStorage.removeItem("patientEmail");
    navigate("/auth");
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const patientId = localStorage.getItem("idPatient");
    if (!patientId) {
      alert("Patient non connecté.");
      return;
    }

    if (
      !editForm.prenom.trim() ||
      !editForm.nom.trim() ||
      !editForm.email.trim() ||
      !editForm.telephone.trim() ||
      !editForm.adresse.trim()
    ) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prenom: editForm.prenom,
          nom: editForm.nom,
          email: editForm.email,
          telephone: editForm.telephone,
          adresse: editForm.adresse,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Échec de la modification.");
      }

      localStorage.setItem("patientNom", editForm.nom);
      localStorage.setItem("patientPrenom", editForm.prenom);
      localStorage.setItem("patientEmail", editForm.email);

      alert("Informations mises à jour avec succès.");
      setEditMode(false);
      await loadDashboard();
    } catch (err) {
      alert(err.message || "Erreur lors de la modification.");
    } finally {
      setSaving(false);
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

  const getNotificationClass = (type) => {
    if (type === "new_visit") return "notif-info";
    if (type === "on_the_way") return "notif-route";
    if (type === "postponed") return "notif-warning";
    if (type === "visit_done") return "notif-success";
    if (type === "report_available") return "notif-report";
    return "notif-info";
  };

  if (loading) {
    return (
      <div className="patient-page">
        <div className="patient-container">
          <div className="patient-loading-card">
            <div className="loader"></div>
            <p>Chargement de votre espace patient...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-page">
        <div className="patient-container">
          <div className="patient-error-card">
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

  if (!patientData) {
    return (
      <div className="patient-page">
        <div className="patient-container">
          <div className="patient-error-card">
            <h2>Données indisponibles</h2>
            <p>Aucune donnée disponible.</p>
          </div>
        </div>
      </div>
    );
  }

  const { patient, hasVisit, visit, report, message, notifications = [] } = patientData;

  return (
    <div className="patient-page">
      <div className="patient-container">
        <div className="patient-topbar">
          <div className="patient-brand">
            <div className="patient-brand-icon">⚕️</div>
            <div>
              <h3>MediHome</h3>
              <span>Espace patient</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        <div className="patient-hero">
          <div className="patient-hero-content">
            <div className="patient-avatar">
              {patient.prenom?.charAt(0)}
              {patient.nom?.charAt(0)}
            </div>

            <div>
              <h1>Bonjour, {patient.prenom}</h1>
              <p>
                Consultez vos informations personnelles, l’état de votre visite
                et vos notifications importantes.
              </p>
            </div>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="patient-card notifications-card">
            <div className="card-header">
              <h2>Messages importants</h2>
              <span className="card-chip">Notifications</span>
            </div>

            <div className="notifications-list">
              {notifications.map((notif, index) => (
                <div
                  key={`${notif.type}-${index}`}
                  className={`notification-item ${getNotificationClass(notif.type)}`}
                >
                  <h4>{notif.title}</h4>
                  <p>{notif.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="patient-grid">
          <div className="patient-card">
            <div className="card-header">
              <h2>Informations personnelles</h2>
              <div className="card-actions">
                {!editMode ? (
                  <button
                    className="small-action-btn"
                    onClick={() => setEditMode(true)}
                  >
                    Modifier
                  </button>
                ) : (
                  <button
                    className="small-action-btn cancel-btn"
                    onClick={() => {
                      setEditMode(false);
                      setEditForm({
                        prenom: patient.prenom || "",
                        nom: patient.nom || "",
                        email: patient.email || "",
                        telephone: patient.telephone || "",
                        adresse: patient.adresse || "",
                      });
                    }}
                  >
                    Annuler
                  </button>
                )}
                <span className="card-chip">Patient</span>
              </div>
            </div>

            {!editMode ? (
              <div className="info-list">
                <div className="info-row">
                  <span>Prénom</span>
                  <strong>{patient.prenom}</strong>
                </div>

                <div className="info-row">
                  <span>Nom</span>
                  <strong>{patient.nom}</strong>
                </div>

                <div className="info-row">
                  <span>Email</span>
                  <strong>{patient.email}</strong>
                </div>

                <div className="info-row">
                  <span>Téléphone</span>
                  <strong>{patient.telephone}</strong>
                </div>

                <div className="info-row">
                  <span>Adresse</span>
                  <strong>{patient.adresse}</strong>
                </div>
              </div>
            ) : (
              <form className="edit-form" onSubmit={handleSaveProfile}>
                <div className="edit-grid">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      value={editForm.prenom}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={editForm.nom}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="text"
                    name="telephone"
                    value={editForm.telephone}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label>Adresse</label>
                  <textarea
                    name="adresse"
                    rows="3"
                    value={editForm.adresse}
                    onChange={handleEditChange}
                  />
                </div>

                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </form>
            )}
          </div>

          {!hasVisit ? (
            <div className="patient-card">
              <div className="card-header">
                <h2>Home visit</h2>
                <span className="card-chip chip-soft">En attente</span>
              </div>

              <div className="empty-visit-box">
                <div className="empty-visit-icon">📅</div>
                <h3>Aucune visite programmée</h3>
                <p>{message}</p>
                <p className="empty-note">
                  Merci de contacter le responsable ou l’administration pour
                  planifier votre première visite à domicile.
                </p>
              </div>
            </div>
          ) : (
            <div className="patient-card">
              <div className="card-header">
                <h2>Informations de la visite</h2>
                <span className={`status-badge ${getStatusClass(visit.statut)}`}>
                  {visit.statut}
                </span>
              </div>

              <div className="info-list">
                <div className="info-row">
                  <span>Date</span>
                  <strong>{visit.dateVisite}</strong>
                </div>

                <div className="info-row">
                  <span>Heure</span>
                  <strong>{visit.heureVisite}</strong>
                </div>

                <div className="info-row">
                  <span>Personnel</span>
                  <strong>
                    {visit.prenomStaff} {visit.nomStaff}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Spécialité</span>
                  <strong>{visit.specialite}</strong>
                </div>

                <div className="info-row">
                  <span>Statut</span>
                  <strong>{visit.statut}</strong>
                </div>

                {visit.statut?.toLowerCase() === "reportee" && (
                  <>
                    <div className="info-row">
                      <span>Ancienne date</span>
                      <strong>{visit.ancienneDateVisite || "-"}</strong>
                    </div>

                    <div className="info-row">
                      <span>Ancienne heure</span>
                      <strong>{visit.ancienneHeureVisite || "-"}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {hasVisit && report && (
          <div className="patient-card report-card">
            <div className="card-header">
              <h2>Rapport de visite</h2>
              <span className="card-chip">Suivi médical</span>
            </div>

            <div className="report-grid">
              <div className="report-block">
                <span>Observations</span>
                <p>{report.observations}</p>
              </div>

              <div className="report-block">
                <span>Soins effectués</span>
                <p>{report.soinsEffectues}</p>
              </div>

              <div className="report-block">
                <span>Recommandations</span>
                <p>{report.recommandations}</p>
              </div>
            </div>
          </div>
        )}

        <div className="patient-card contact-card">
          <div className="card-header">
            <h2>Contacter MediHome</h2>
            <span className="card-chip">Support</span>
          </div>

          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>
                <span>Téléphone</span>
                <a href="tel:+212600000000">+212 6 00 00 00 00</a>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div>
                <span>Email</span>
                <a href="mailto:contact@medihome.ma">contact@medihome.ma</a>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div>
                <span>Adresse</span>
                <p>Marrakech, Maroc</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">🕒</div>
              <div>
                <span>Disponibilité</span>
                <p>Lundi - Vendredi, 09:00 - 18:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}