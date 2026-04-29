import { useEffect, useState } from "react";
import api from "../services/api";

function Staff() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get("/staff");
      setStaff(response.data.staff);
    } catch (error) {
      console.error("Erreur lors du chargement du staff :", error);
    }
  };

  return (
    <div>
      <h1>Liste du staff</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Spécialité</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Rôle</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((item) => (
              <tr key={item.idStaff}>
                <td>{item.idStaff}</td>
                <td>{item.nom}</td>
                <td>{item.prenom}</td>
                <td>{item.specialite}</td>
                <td>{item.telephone}</td>
                <td>{item.email}</td>
                <td>{item.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Staff;