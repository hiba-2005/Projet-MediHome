import { useEffect, useState } from "react";
import api from "../services/api";

function Visits() {
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await api.get("/home-visits");
      setVisits(response.data.visits);
    } catch (error) {
      console.error("Erreur lors du chargement des visites :", error);
    }
  };

  return (
    <div>
      <h1>Liste des visites</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Staff</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.idHomeVisit}>
                <td>{visit.idHomeVisit}</td>
                <td>{visit.nomPatient} {visit.prenomPatient}</td>
                <td>{visit.nomStaff} {visit.prenomStaff}</td>
                <td>{visit.dateVisite}</td>
                <td>{visit.heureVisite}</td>
                <td>{visit.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Visits;