import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

const API_BASE = "http://localhost/medical-home-visits-backend/public/api";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      prenom: "",
      nom: "",
      email: "",
      telephone: "",
      adresse: "",
      password: "",
      confirmPassword: "",
      role: "patient",
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Veuillez remplir l'email et le mot de passe.");
      return;
    }

    setLoading(true);

    try {
      const url =
        form.role === "patient"
          ? `${API_BASE}/login/patient`
          : `${API_BASE}/login/staff`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Échec de la connexion.");
        return;
      }

     if (form.role === "patient") {
  localStorage.setItem("idPatient", String(data.user.idPatient));
  localStorage.setItem("patientNom", data.user.nom);
  localStorage.setItem("patientPrenom", data.user.prenom);
  localStorage.setItem("patientEmail", data.user.email);

  resetForm();
  navigate("/patient-dashboard");
} else {
  localStorage.setItem("idStaff", String(data.user.idStaff));
  localStorage.setItem("staffNom", data.user.nom);
  localStorage.setItem("staffPrenom", data.user.prenom);
  localStorage.setItem("staffEmail", data.user.email);
  localStorage.setItem("staffRole", data.user.role);
  localStorage.setItem("staffSpecialite", data.user.specialite);

  resetForm();

  if (data.user.role === "admin" || data.user.role === "coordinateur") {
  navigate("/admin-dashboard");
} else {
  navigate("/staff-dashboard");
}
}
    } catch (error) {
      alert("Erreur serveur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !form.prenom ||
      !form.nom ||
      !form.email ||
      !form.telephone ||
      !form.adresse ||
      !form.password ||
      !form.confirmPassword
    ) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/patients/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          telephone: form.telephone,
          adresse: form.adresse,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Échec de l'inscription.");
        return;
      }

      alert("Inscription réussie. Vous pouvez maintenant vous connecter.");
      resetForm();
      setIsLogin(true);
    } catch (error) {
      alert("Erreur serveur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">⚕️</div>
            <div className="auth-logo-text">MediHome</div>
          </div>

          <h2>{isLogin ? "Connexion" : "Créer un compte"}</h2>
          <p>
            {isLogin
              ? "Accédez à votre espace personnel"
              : "Inscription réservée aux patients"}
          </p>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Type d'utilisateur</label>
              <div className="select-wrapper">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="auth-select"
                >
                 <option value="patient">Patient</option>
                 <option value="medical">Personnel médical</option>
                 <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="vous@exemple.ma"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="text"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Adresse</label>
              <input
                type="text"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire →"}
            </button>
          </form>
        )}

        <div className="auth-toggle">
          {isLogin ? (
            <>
              Pas encore inscrit ?{" "}
              <span onClick={() => !loading && setIsLogin(false)}>
                Créer un compte
              </span>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <span onClick={() => !loading && setIsLogin(true)}>
                Connexion
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}