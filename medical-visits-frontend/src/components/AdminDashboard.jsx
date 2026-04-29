import React, { useEffect, useMemo, useState } from "react";
import "./AdminDashboard.css";
import jsPDF from "jspdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import autoTable from "jspdf-autotable";
const API_BASE = "http://localhost/medical-home-visits-backend/public/api";

function AdminDashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user"));

 const [activeTab, setActiveTab] = useState("dashboard");

  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [visits, setVisits] = useState([]);
  const visitsByMonth = useMemo(() => {
  const months = {};

  visits.forEach((visit) => {
    if (!visit.dateVisite) return;

    const date = new Date(visit.dateVisite);
    const monthName = date.toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });

    months[monthName] = (months[monthName] || 0) + 1;
  });

  return Object.keys(months).map((month) => ({
    mois: month,
    visites: months[month],
  }));
}, [visits]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editingVisitId, setEditingVisitId] = useState(null);

  const emptyVisitForm = {
    idPatient: "",
    idStaff: "",
    dateVisite: "",
    heureVisite: "",
    statut: "planifiee",
  };

  const emptyPatientForm = {
    nom: "",
    prenom: "",
    telephone: "",
    adresse: "",
    email: "",
    password: "",
  };

  const emptyStaffForm = {
    nom: "",
    prenom: "",
    specialite: "",
    telephone: "",
    email: "",
    password: "",
    role: "personnel_medical",
  };

  const [visitForm, setVisitForm] = useState(emptyVisitForm);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);

  const [searchPatient, setSearchPatient] = useState("");
  const [searchStaff, setSearchStaff] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setMessage("");

    try {
      await Promise.all([
        fetchPatients(),
        fetchStaff(),
        fetchVisits(),
        fetchReports(),
      ]);
    } catch (error) {
      console.error("Erreur loadAllData :", error);
      setMessage("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients || []);
      } else {
        console.error("Patients API:", data);
      }
    } catch (error) {
      console.error("Erreur fetchPatients :", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_BASE}/staff`);
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff || []);
      } else {
        console.error("Staff API:", data);
      }
    } catch (error) {
      console.error("Erreur fetchStaff :", error);
    }
  };

  const fetchVisits = async () => {
    try {
      const res = await fetch(`${API_BASE}/home-visits`);
      const data = await res.json();
      if (data.success) {
        setVisits(data.visits || []);
      } else {
        console.error("Visits API:", data);
      }
    } catch (error) {
      console.error("Erreur fetchVisits :", error);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/visit-reports`);
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
      } else {
        console.error("Reports API:", data);
      }
    } catch (error) {
      console.error("Erreur fetchReports :", error);
    }
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaffForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVisitChange = (e) => {
    const { name, value } = e.target;
    setVisitForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetPatientForm = () => {
    setPatientForm(emptyPatientForm);
    setEditingPatientId(null);
  };

  const resetStaffForm = () => {
    setStaffForm(emptyStaffForm);
    setEditingStaffId(null);
  };

  const resetVisitForm = () => {
    setVisitForm(emptyVisitForm);
    setEditingVisitId(null);
  };

  const handleSubmitPatient = async (e) => {
    e.preventDefault();

    try {
      let res;

      if (editingPatientId) {
        res = await fetch(`${API_BASE}/patients/${editingPatientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom: patientForm.nom,
            prenom: patientForm.prenom,
            telephone: patientForm.telephone,
            adresse: patientForm.adresse,
            email: patientForm.email,
          }),
        });
      } else {
        res = await fetch(`${API_BASE}/patients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientForm),
        });
      }

      const data = await res.json();

      if (data.success) {
        showMessage(data.message);
        resetPatientForm();
        fetchPatients();
      } else {
        showMessage(data.message || "Opération échouée.");
      }
    } catch (error) {
      console.error("Erreur handleSubmitPatient :", error);
      showMessage("Erreur serveur.");
    }
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();

    try {
      let res;

      if (editingStaffId) {
        res = await fetch(`${API_BASE}/staff/${editingStaffId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom: staffForm.nom,
            prenom: staffForm.prenom,
            specialite: staffForm.specialite,
            telephone: staffForm.telephone,
            email: staffForm.email,
            role: staffForm.role,
          }),
        });
      } else {
        res = await fetch(`${API_BASE}/staff`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom: staffForm.nom,
            prenom: staffForm.prenom,
            specialite: staffForm.specialite,
            telephone: staffForm.telephone,
            email: staffForm.email,
            passwordHash: staffForm.password,
            role: staffForm.role,
          }),
        });
      }

      const data = await res.json();

      if (data.success) {
        showMessage(data.message);
        resetStaffForm();
        fetchStaff();
      } else {
        showMessage(data.message || "Opération échouée.");
      }
    } catch (error) {
      console.error("Erreur handleSubmitStaff :", error);
      showMessage("Erreur serveur.");
    }
  };

  const handleSubmitVisit = async (e) => {
    e.preventDefault();

    if (
      !visitForm.idPatient ||
      !visitForm.idStaff ||
      !visitForm.dateVisite ||
      !visitForm.heureVisite ||
      !visitForm.statut
    ) {
      showMessage("Veuillez remplir tous les champs de la visite.");
      return;
    }

    try {
      let res;

      if (editingVisitId) {
        res = await fetch(`${API_BASE}/home-visits/${editingVisitId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idPatient: parseInt(visitForm.idPatient, 10),
            idStaff: parseInt(visitForm.idStaff, 10),
            dateVisite: visitForm.dateVisite,
            heureVisite: visitForm.heureVisite,
            statut: visitForm.statut,
          }),
        });
      } else {
        res = await fetch(`${API_BASE}/home-visits`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idPatient: parseInt(visitForm.idPatient, 10),
            idStaff: parseInt(visitForm.idStaff, 10),
            dateVisite: visitForm.dateVisite,
            heureVisite: visitForm.heureVisite,
            statut: visitForm.statut,
            ancienneDateVisite: null,
            ancienneHeureVisite: null,
          }),
        });
      }

      const data = await res.json();

      if (data.success) {
        showMessage(
          editingVisitId
            ? "Visite modifiée avec succès."
            : "Visite planifiée avec succès."
        );
        resetVisitForm();
        fetchVisits();
      } else {
        showMessage(data.message || "Erreur lors de l'opération.");
      }
    } catch (error) {
      console.error("Erreur handleSubmitVisit :", error);
      showMessage("Erreur serveur.");
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatientId(patient.idPatient);
    setPatientForm({
      nom: patient.nom || "",
      prenom: patient.prenom || "",
      telephone: patient.telephone || "",
      adresse: patient.adresse || "",
      email: patient.email || "",
      password: "",
    });
    setActiveTab("patients");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePatient = async (id) => {
    const confirmDelete = window.confirm("Supprimer ce patient ?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/patients/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        showMessage(data.message);
        fetchPatients();
      } else {
        showMessage(data.message || "Suppression échouée.");
      }
    } catch (error) {
      console.error("Erreur handleDeletePatient :", error);
      showMessage("Erreur serveur.");
    }
  };

  const handleEditStaff = (member) => {
    setEditingStaffId(member.idStaff);
    setStaffForm({
      nom: member.nom || "",
      prenom: member.prenom || "",
      specialite: member.specialite || "",
      telephone: member.telephone || "",
      email: member.email || "",
      password: "",
      role: member.role || "personnel_medical",
    });
    setActiveTab("staff");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteStaff = async (id) => {
    const confirmDelete = window.confirm("Supprimer ce membre du staff ?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/staff/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        showMessage(data.message);
        fetchStaff();
      } else {
        showMessage(data.message || "Suppression échouée.");
      }
    } catch (error) {
      console.error("Erreur handleDeleteStaff :", error);
      showMessage("Erreur serveur.");
    }
  };

  const handleEditVisit = (visit) => {
    setEditingVisitId(visit.idHomeVisit);
    setVisitForm({
      idPatient: String(visit.idPatient),
      idStaff: String(visit.idStaff),
      dateVisite: visit.dateVisite || "",
      heureVisite: visit.heureVisite || "",
      statut: visit.statut || "planifiee",
    });
    setActiveTab("visits");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteVisit = async (idHomeVisit) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer cette visite ?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/home-visits/${idHomeVisit}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        showMessage("Visite supprimée avec succès.");
        if (editingVisitId === idHomeVisit) {
          resetVisitForm();
        }
        fetchVisits();
      } else {
        showMessage(data.message || "Suppression impossible.");
      }
    } catch (error) {
      console.error("Erreur handleDeleteVisit :", error);
      showMessage("Erreur serveur.");
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) =>
      `${p.nom} ${p.prenom} ${p.email} ${p.telephone}`
        .toLowerCase()
        .includes(searchPatient.toLowerCase())
    );
  }, [patients, searchPatient]);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) =>
      `${s.nom} ${s.prenom} ${s.email} ${s.specialite} ${s.role}`
        .toLowerCase()
        .includes(searchStaff.toLowerCase())
    );
  }, [staff, searchStaff]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    window.location.href = "/";
  };
 const downloadReportPdf = async (report) => {
  try {
    const res = await fetch(`${API_BASE}/visit-reports/${report.idVisitReport}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      showMessage(data.message || "Impossible de récupérer le rapport.");
      return;
    }

    const r = data.report;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    const primaryColor = [53, 88, 114];
    const lightBlue = [122, 170, 206];
    const softBg = [245, 248, 250];
    const darkText = [28, 47, 62];
    const grayText = [90, 90, 90];

    // Charger le logo
    const loadImageAsBase64 = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = url;
      });

    let logoBase64 = null;

    try {
      logoBase64 = await loadImageAsBase64("/logo-medihome.png");
    } catch (e) {
      console.warn("Logo non chargé :", e);
    }

    // ===== HEADER =====
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 34, "F");

    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 14, 7, 16, 16);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.text("MediHome", 36, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Rapport de visite a domicile", 36, 22);

    doc.setFontSize(9);
    doc.text("Sante - Suivi - Coordination", 36, 28);

    // ===== TITLE BLOCK =====
    doc.setFillColor(...softBg);
    doc.roundedRect(14, 42, pageWidth - 28, 20, 4, 4, "F");

    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Rapport HomeVisit", 18, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...grayText);
    doc.text(`Rapport N° ${r.idVisitReport}`, 18, 57);

    // ===== INFOS GENERALES =====
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Informations generales", 14, 74);

    autoTable(doc, {
      startY: 78,
      theme: "grid",
      head: [["Champ", "Valeur"]],
      body: [
        ["Nom du rapport", `HomeVisit #${r.idHomeVisit}`],
        ["Patient", `${r.prenomPatient} ${r.nomPatient}`],
        ["Personnel medical responsable", `${r.prenomStaff} ${r.nomStaff}`],
        ["Specialite", `${r.specialite || "-"}`],
        ["Date de visite", `${r.dateVisite}`],
        ["Heure de visite", `${r.heureVisite}`],
        ["Date du rapport", `${r.createdAt || "-"}`],
        ["Statut", `${r.statut || "-"}`],
      ],
      styles: {
        fontSize: 10,
        cellPadding: 3,
        textColor: darkText,
        lineColor: [220, 228, 235],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 252, 253],
      },
      margin: { left: margin, right: margin },
    });

    let currentY = doc.lastAutoTable.finalY + 12;

    const drawSection = (title, content) => {
      const split = doc.splitTextToSize(content || "-", 178);

      // vérifier saut de page
      if (currentY + 24 + split.length * 5 > 270) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, currentY, pageWidth - 28, 10, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(...primaryColor);
      doc.text(title, 18, currentY + 6.5);

      currentY += 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...darkText);
      doc.text(split, 18, currentY);

      currentY += split.length * 5 + 10;
    };

    drawSection("Observations", r.observations);
    drawSection("Soins effectues", r.soinsEffectues);
    drawSection("Recommandations", r.recommandations);

    // ===== CONTACT FOOTER =====
    if (currentY + 28 > 280) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(...primaryColor);
    doc.roundedRect(14, currentY + 4, pageWidth - 28, 24, 4, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Contact MediHome", 18, currentY + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Telephone : +212 6 00 00 00 00", 18, currentY + 18);
    doc.text("Email : contact@medihome.ma", 85, currentY + 18);
    doc.text("Adresse : Marrakech, Maroc", 18, currentY + 24);

    doc.save(`rapport-visite-${r.idVisitReport}.pdf`);
  } catch (error) {
    console.error("Erreur downloadReportPdf :", error);
    showMessage("Erreur lors du téléchargement du PDF.");
  }
};
const today = new Date().toISOString().split("T")[0];

const todayVisits = visits.filter(
  (visit) => visit.dateVisite === today
);
  return (
  <div className="admin-shell">

    <aside className="admin-sidebar">
      <div className="sidebar-logo">⚕️ MediHome</div>
<button
  className={activeTab === "dashboard" ? "side-active" : ""}
  onClick={() => setActiveTab("dashboard")}
>
  ▦ Tableau de bord
</button>
      <button
        className={activeTab === "patients" ? "side-active" : ""}
        onClick={() => setActiveTab("patients")}
      >
        👤 Patients
      </button>

      <button
        className={activeTab === "staff" ? "side-active" : ""}
        onClick={() => setActiveTab("staff")}
      >
        🩺 Personnel
      </button>

      <button
        className={activeTab === "visits" ? "side-active" : ""}
        onClick={() => setActiveTab("visits")}
      >
        📅 Visites
      </button>

      <button
        className={activeTab === "reports" ? "side-active" : ""}
        onClick={() => setActiveTab("reports")}
      >
        📄 Rapports
      </button>

      <button className="sidebar-logout" onClick={handleLogout}>
        🚪 Log out
      </button>
    </aside>

    <main className="admin-page">
      
      <div className="admin-header">
        <div>
          <h1>Tableau de bord Admin</h1>
          <p>
            Bienvenue {storedUser?.prenom} {storedUser?.nom}
          </p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>

      
      {message && <div className="admin-message">{message}</div>}
      {loading && <div className="admin-message">Chargement...</div>}
{activeTab === "dashboard" && (
  <div className="pro-dashboard">
    {/* HEADER */}
    <div className="pro-header">
      <div>
        <h1>Hello, Admin 👋</h1>
        <p>Bienvenue sur MediHome</p>
      </div>

      <div className="pro-header-actions">
        <input placeholder="Rechercher..." />
        <div className="avatar">MH</div>
      </div>
    </div>

    {/* STATS */}
    <div className="pro-stats">
      <div className="pro-card">
        <span>Patients</span>
        <h2>{patients.length}</h2>
        <p>Total</p>
      </div>

      <div className="pro-card">
        <span>Personnel</span>
        <h2>{staff.length}</h2>
        <p>Actifs</p>
      </div>

      <div className="pro-card">
        <span>Visites</span>
        <h2>{visits.length}</h2>
        <p>Planifiées</p>
      </div>

      <div className="pro-card">
        <span>Rapports</span>
        <h2>{reports.length}</h2>
        <p>Médicaux</p>
      </div>
    </div>
<div className="pro-box chart-box">
  <h3>Nombre de visites par mois</h3>

  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={visitsByMonth}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="mois" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="visites" radius={[10, 10, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
    {/* VISITES AUJOURD'HUI */}
    <div className="pro-box today-calendar-box">
  <h3>Visites d’aujourd’hui</h3>

  <div className="today-schedule">
    <div className="mini-calendar">
      <div className="calendar-header">
        <button>←</button>
        <strong>
          {new Date().toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </strong>
        <button>→</button>
      </div>

      <div className="calendar-week">
        {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-days">
        {Array.from({ length: 30 }, (_, index) => {
          const day = index + 1;
          const currentDay = new Date().getDate();

          return (
            <button
              key={day}
              className={day === currentDay ? "calendar-day active-day" : "calendar-day"}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>

    <div className="today-visits-list">
      {todayVisits.length > 0 ? (
        todayVisits.map((visit) => (
          <div className="today-visit-event" key={visit.idHomeVisit}>
            <div className="event-day">
              {new Date(visit.dateVisite).getDate()}
            </div>

            <div className="event-info">
              <strong>
                {visit.prenomPatient} {visit.nomPatient}
              </strong>
              <span>
                Personnel : {visit.prenomStaff} {visit.nomStaff}
              </span>
              <small>{visit.statut}</small>
            </div>

            <div className="event-time">{visit.heureVisite}</div>
          </div>
        ))
      ) : (
        <div className="empty-dashboard">
          Aucune visite prévue aujourd’hui.
        </div>
      )}
    </div>
  </div>
</div>

    {/* MAIN GRID */}
    <div className="pro-grid">
      <div className="pro-left">
        <div className="pro-box">
          <h3>Visites récentes</h3>

          {visits.slice(0, 4).map((v) => (
            <div className="visit-item" key={v.idHomeVisit}>
              <strong>
                {v.prenomPatient} {v.nomPatient}
              </strong>
              <span>
                {v.dateVisite} • {v.heureVisite}
              </span>
              <small>{v.statut}</small>
            </div>
          ))}
        </div>

        <div className="pro-box">
          <h3>Derniers rapports</h3>

          {reports.slice(0, 3).map((r) => (
            <div className="report-item" key={r.idVisitReport}>
              <strong>
                {r.prenomPatient} {r.nomPatient}
              </strong>
              <span>
                {r.prenomStaff} {r.nomStaff}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pro-right">
        <div className="pro-box">
          <h3>Personnel médical</h3>

          {staff.slice(0, 4).map((s) => (
            <div className="staff-item" key={s.idStaff}>
              <div className="circle">{s.prenom?.charAt(0)}</div>

              <div>
                <strong>
                  {s.prenom} {s.nom}
                </strong>
                <span>{s.specialite}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
      {activeTab === "patients" && (
        <section className="admin-section">
          <div className="form-card">
            <h2>{editingPatientId ? "Modifier un patient" : "Ajouter un patient"}</h2>

            <form onSubmit={handleSubmitPatient} className="admin-form">
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={patientForm.nom}
                onChange={handlePatientChange}
                required
              />
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={patientForm.prenom}
                onChange={handlePatientChange}
                required
              />
              <input
                type="text"
                name="telephone"
                placeholder="Téléphone"
                value={patientForm.telephone}
                onChange={handlePatientChange}
                required
              />
              <input
                type="text"
                name="adresse"
                placeholder="Adresse"
                value={patientForm.adresse}
                onChange={handlePatientChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={patientForm.email}
                onChange={handlePatientChange}
                required
              />
              {!editingPatientId && (
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={patientForm.password}
                  onChange={handlePatientChange}
                  required
                />
              )}

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  {editingPatientId ? "Mettre à jour" : "Ajouter"}
                </button>

                {editingPatientId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetPatientForm}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="table-card">
            <div className="card-top">
              <h2>Liste des patients</h2>
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
              />
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom complet</th>
                    <th>Téléphone</th>
                    <th>Adresse</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.idPatient}>
                      <td>{patient.idPatient}</td>
                      <td>
                        {patient.nom} {patient.prenom}
                      </td>
                      <td>{patient.telephone}</td>
                      <td>{patient.adresse}</td>
                      <td>{patient.email}</td>
                      <td className="action-group">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditPatient(patient)}
                        >
                          Modifier
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeletePatient(patient.idPatient)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-cell">
                        Aucun patient trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === "staff" && (
        <section className="admin-section">
          <div className="form-card">
            <h2>{editingStaffId ? "Modifier un membre du staff" : "Ajouter un membre du staff"}</h2>

            <form onSubmit={handleSubmitStaff} className="admin-form">
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={staffForm.nom}
                onChange={handleStaffChange}
                required
              />
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={staffForm.prenom}
                onChange={handleStaffChange}
                required
              />
              <input
                type="text"
                name="specialite"
                placeholder="Spécialité"
                value={staffForm.specialite}
                onChange={handleStaffChange}
                required
              />
              <input
                type="text"
                name="telephone"
                placeholder="Téléphone"
                value={staffForm.telephone}
                onChange={handleStaffChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={staffForm.email}
                onChange={handleStaffChange}
                required
              />
              {!editingStaffId && (
                <input
                  type="text"
                  name="password"
                  placeholder="Mot de passe"
                  value={staffForm.password}
                  onChange={handleStaffChange}
                  required
                />
              )}

              <select
                name="role"
                value={staffForm.role}
                onChange={handleStaffChange}
                required
              >
                <option value="personnel_medical">Personnel médical</option>
                <option value="coordinateur">Admin / Coordinateur</option>
              </select>

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  {editingStaffId ? "Mettre à jour" : "Ajouter"}
                </button>

                {editingStaffId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetStaffForm}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="table-card">
            <div className="card-top">
              <h2>Liste du personnel</h2>
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
              />
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom complet</th>
                    <th>Spécialité</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.idStaff}>
                      <td>{member.idStaff}</td>
                      <td>
                        {member.nom} {member.prenom}
                      </td>
                      <td>{member.specialite}</td>
                      <td>{member.telephone}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td className="action-group">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditStaff(member)}
                        >
                          Modifier
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteStaff(member.idStaff)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStaff.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        Aucun membre trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === "visits" && (
        <section className="admin-section">
          <div className="form-card">
            <h2>{editingVisitId ? "Modifier une visite" : "Planifier une visite"}</h2>

            <form onSubmit={handleSubmitVisit} className="admin-form">
              <select
                name="idPatient"
                value={visitForm.idPatient}
                onChange={handleVisitChange}
                required
              >
                <option value="">Choisir un patient</option>
                {patients.map((patient) => (
                  <option key={patient.idPatient} value={patient.idPatient}>
                    {patient.nom} {patient.prenom}
                  </option>
                ))}
              </select>

              <select
                name="idStaff"
                value={visitForm.idStaff}
                onChange={handleVisitChange}
                required
              >
                <option value="">Choisir un personnel médical</option>
                {staff
                  .filter(
                    (member) =>
                      member.role !== "coordinateur" && member.role !== "admin"
                  )
                  .map((member) => (
                    <option key={member.idStaff} value={member.idStaff}>
                      {member.nom} {member.prenom} - {member.specialite}
                    </option>
                  ))}
              </select>

              <input
                type="date"
                name="dateVisite"
                value={visitForm.dateVisite}
                onChange={handleVisitChange}
                required
              />

              <input
                type="time"
                name="heureVisite"
                value={visitForm.heureVisite}
                onChange={handleVisitChange}
                required
              />

              <select
                name="statut"
                value={visitForm.statut}
                onChange={handleVisitChange}
                required
              >
                <option value="planifiee">Planifiée</option>
                <option value="en_route">En route</option>
                <option value="reportee">Reportée</option>
                <option value="terminee">Terminée</option>
              </select>

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  {editingVisitId
                    ? "Enregistrer les modifications"
                    : "Planifier la visite"}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetVisitForm}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>

          <div className="table-card">
            <h2>Toutes les visites</h2>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Personnel</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit.idHomeVisit}>
                      <td>{visit.idHomeVisit}</td>
                      <td>
                        {visit.nomPatient} {visit.prenomPatient}
                      </td>
                      <td>
                        {visit.nomStaff} {visit.prenomStaff}
                      </td>
                      <td>{visit.dateVisite}</td>
                      <td>{visit.heureVisite}</td>
                      <td>{visit.statut}</td>
                      <td className="action-group">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditVisit(visit)}
                        >
                          Modifier
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteVisit(visit.idHomeVisit)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visits.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        Aucune visite trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === "reports" && (
        <section className="admin-section single-block">
          <div className="table-card">
            <h2>Tous les rapports</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
  <th>ID Rapport</th>
  <th>ID Visite</th>
  <th>Patient</th>
  <th>Personnel</th>
  <th>Observations</th>
  <th>Soins</th>
  <th>Recommandations</th>
  <th>Actions</th>
</tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
  <tr key={report.idVisitReport}>
    <td>{report.idVisitReport}</td>
    <td>{report.idHomeVisit}</td>
    <td>{report.prenomPatient} {report.nomPatient}</td>
    <td>{report.prenomStaff} {report.nomStaff}</td>
    <td>{report.observations}</td>
    <td>{report.soinsEffectues}</td>
    <td>{report.recommandations}</td>
    <td className="action-group">
      <button
        className="primary-btn"
        onClick={() => downloadReportPdf(report)}
      >
        Télécharger PDF
      </button>
    </td>
  </tr>
))}
                  {reports.length === 0 && (
                    <tr>
                    <td colSpan="8" className="empty-cell">
                        Aucun rapport trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
            )}
    </main>
  </div>
  );
}

export default AdminDashboard;