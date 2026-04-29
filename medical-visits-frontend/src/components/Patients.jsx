import { useEffect, useState } from "react";
import api from "../services/api";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    adresse: "",
    email: "",
    passwordHash: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error("Erreur lors du chargement des patients :", error);
      setMessage("Erreur lors du chargement des patients.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm({
      nom: "",
      prenom: "",
      telephone: "",
      adresse: "",
      email: "",
      passwordHash: ""
    });
    setEditingId(null);
  };

  const handleEdit = (patient) => {
    setForm({
      nom: patient.nom || "",
      prenom: patient.prenom || "",
      telephone: patient.telephone || "",
      adresse: patient.adresse || "",
      email: patient.email || "",
      passwordHash: ""
    });
    setEditingId(patient.idPatient);
    setMessage("Mode modification activé.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !form.nom.trim() ||
      !form.prenom.trim() ||
      !form.telephone.trim() ||
      !form.adresse.trim() ||
      !form.email.trim()
    ) {
      setMessage("Les champs nom, prénom, téléphone, adresse et email sont obligatoires.");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        const response = await api.put(`/patients/${editingId}`, {
          nom: form.nom,
          prenom: form.prenom,
          telephone: form.telephone,
          adresse: form.adresse,
          email: form.email
        });

        if (response.data.success) {
          setMessage("Patient modifié avec succès.");
          resetForm();
          fetchPatients();
        } else {
          setMessage(response.data.message || "Modification impossible.");
        }
      } else {
        if (!form.passwordHash.trim()) {
          setMessage("Le mot de passe est obligatoire pour ajouter un patient.");
          setLoading(false);
          return;
        }

        const response = await api.post("/patients", form);

        if (response.data.success) {
          setMessage("Patient ajouté avec succès.");
          resetForm();
          fetchPatients();
        } else {
          setMessage(response.data.message || "Ajout impossible.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'opération :", error);
      setMessage("Erreur lors de l'opération.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (idPatient) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce patient ?"
    );

    if (!confirmation) return;

    try {
      const response = await api.delete(`/patients/${idPatient}`);

      if (response.data.success) {
        setMessage("Patient supprimé avec succès.");
        if (editingId === idPatient) {
          resetForm();
        }
        fetchPatients();
      } else {
        setMessage(response.data.message || "Suppression impossible.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du patient :", error);
      setMessage("Erreur lors de la suppression du patient.");
    }
  };

  return (
    <div>
      <h1>Liste des patients</h1>

      <div className="card">
        <h3>{editingId ? "Modifier un patient" : "Ajouter un patient"}</h3>

        {message && <p>{message}</p>}

        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-grid">
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={form.nom}
              onChange={handleChange}
            />

            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={form.prenom}
              onChange={handleChange}
            />

            <input
              type="text"
              name="telephone"
              placeholder="Téléphone"
              value={form.telephone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="adresse"
              placeholder="Adresse"
              value={form.adresse}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            {!editingId && (
              <input
                type="password"
                name="passwordHash"
                placeholder="Mot de passe"
                value={form.passwordHash}
                onChange={handleChange}
              />
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading
                ? "Traitement..."
                : editingId
                ? "Enregistrer"
                : "Ajouter"}
            </button>

            <button type="button" onClick={resetForm}>
              Annuler / Vider
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.idPatient}>
                  <td>{patient.idPatient}</td>
                  <td>{patient.nom}</td>
                  <td>{patient.prenom}</td>
                  <td>{patient.telephone}</td>
                  <td>{patient.adresse}</td>
                  <td>{patient.email}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(patient)}
                      >
                        Modifier
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(patient.idPatient)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Aucun patient trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Patients;