import { useEffect, useState } from "react";
import api from "../services/api";

function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get("/visit-reports");
      setReports(response.data.reports);
    } catch (error) {
      console.error("Erreur lors du chargement des rapports :", error);
    }
  };

  return (
    <div>
      <h1>Liste des rapports</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID Rapport</th>
              <th>ID Visite</th>
              <th>Observations</th>
              <th>Soins effectués</th>
              <th>Recommandations</th>
              <th>Date création</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.idVisitReport}>
                <td>{report.idVisitReport}</td>
                <td>{report.idHomeVisit}</td>
                <td>{report.observations}</td>
                <td>{report.soinsEffectues}</td>
                <td>{report.recommandations}</td>
                <td>{report.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;