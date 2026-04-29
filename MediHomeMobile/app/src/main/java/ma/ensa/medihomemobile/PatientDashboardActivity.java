package ma.ensa.medihomemobile;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONObject;

import ma.ensa.medihomemobile.databinding.ActivityPatientDashboardBinding;
import ma.ensa.medihomemobile.utils.ApiConfig;
import ma.ensa.medihomemobile.utils.SessionManager;

public class PatientDashboardActivity extends AppCompatActivity {

    private ActivityPatientDashboardBinding binding;
    private SessionManager sessionManager;
    private RequestQueue requestQueue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityPatientDashboardBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        sessionManager = new SessionManager(this);
        requestQueue = Volley.newRequestQueue(this);

        if (!sessionManager.isLoggedIn() || !"patient".equals(sessionManager.getUserType())) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        binding.btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Intent intent = new Intent(PatientDashboardActivity.this, LoginActivity.class);
            startActivity(intent);
            finish();
        });

        loadPatientDashboard();
    }

    private void loadPatientDashboard() {
        int idPatient = sessionManager.getIdPatient();

        if (idPatient == -1) {
            Toast.makeText(this, "Session patient introuvable.", Toast.LENGTH_SHORT).show();
            return;
        }

        showLoading(true);

        JsonObjectRequest request = new JsonObjectRequest(
                Request.Method.GET,
                ApiConfig.getPatientDashboard(idPatient),
                null,
                response -> {
                    showLoading(false);
                    parseDashboardResponse(response);
                },
                error -> {
                    showLoading(false);
                    binding.tvError.setVisibility(View.VISIBLE);
                    binding.tvError.setText("Erreur lors du chargement des données.");
                    Toast.makeText(
                            PatientDashboardActivity.this,
                            "Erreur serveur ou connexion.",
                            Toast.LENGTH_SHORT
                    ).show();
                }
        );

        requestQueue.add(request);
    }

    private void parseDashboardResponse(JSONObject response) {
        try {
            boolean success = response.getBoolean("success");

            if (!success) {
                binding.tvError.setVisibility(View.VISIBLE);
                binding.tvError.setText("Impossible de charger les données.");
                return;
            }

            binding.tvError.setVisibility(View.GONE);

            JSONObject patient = response.getJSONObject("patient");
            boolean hasVisit = response.optBoolean("hasVisit", false);
            JSONObject visit = response.optJSONObject("visit");
            JSONObject report = response.optJSONObject("report");
            JSONArray notifications = response.optJSONArray("notifications");
            String message = response.optString("message", "");

            String prenom = patient.optString("prenom", "");
            String nom = patient.optString("nom", "");
            String email = patient.optString("email", "");
            String telephone = patient.optString("telephone", "");
            String adresse = patient.optString("adresse", "");

            binding.tvHello.setText("Bonjour, " + prenom);
            binding.tvFullName.setText(prenom + " " + nom);
            binding.tvEmail.setText(email);
            binding.tvPhone.setText(telephone);
            binding.tvAddress.setText(adresse);

            String initials = getInitials(prenom, nom);
            binding.tvAvatar.setText(initials);

            if (hasVisit && visit != null) {
                binding.cardVisit.setVisibility(View.VISIBLE);
                binding.cardNoVisit.setVisibility(View.GONE);

                String dateVisite = visit.optString("dateVisite", "-");
                String heureVisite = visit.optString("heureVisite", "-");
                String statut = visit.optString("statut", "-");
                String prenomStaff = visit.optString("prenomStaff", "");
                String nomStaff = visit.optString("nomStaff", "");
                String specialite = visit.optString("specialite", "-");
                String ancienneDate = visit.optString("ancienneDateVisite", "");
                String ancienneHeure = visit.optString("ancienneHeureVisite", "");

                binding.tvVisitDate.setText(dateVisite);
                binding.tvVisitTime.setText(heureVisite);
                binding.tvVisitStaff.setText(prenomStaff + " " + nomStaff);
                binding.tvVisitSpeciality.setText(specialite);
                binding.tvVisitStatus.setText(capitalize(statut));

                if ("reportee".equalsIgnoreCase(statut)
                        && !ancienneDate.isEmpty()
                        && !ancienneHeure.isEmpty()) {
                    binding.tvOldVisit.setVisibility(View.VISIBLE);
                    binding.tvOldVisit.setText("Ancienne visite : " + ancienneDate + " à " + ancienneHeure);
                } else {
                    binding.tvOldVisit.setVisibility(View.GONE);
                }
            } else {
                binding.cardVisit.setVisibility(View.GONE);
                binding.cardNoVisit.setVisibility(View.VISIBLE);
                binding.tvNoVisitMessage.setText(
                        message.isEmpty()
                                ? "Aucune visite programmée pour le moment."
                                : message
                );
            }

            if (notifications != null && notifications.length() > 0) {
                binding.cardMessages.setVisibility(View.VISIBLE);

                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < notifications.length(); i++) {
                    JSONObject notif = notifications.getJSONObject(i);
                    String title = notif.optString("title", "");
                    String text = notif.optString("text", "");

                    if (!title.isEmpty()) {
                        builder.append("• ").append(title).append("\n");
                    }
                    if (!text.isEmpty()) {
                        builder.append(text).append("\n\n");
                    }
                }

                binding.tvMessages.setText(builder.toString().trim());
            } else {
                binding.cardMessages.setVisibility(View.VISIBLE);
                binding.tvMessages.setText("Aucun message important pour le moment.");
            }

            if (report != null) {
                binding.cardReport.setVisibility(View.VISIBLE);

                String observations = report.optString("observations", "-");
                String soins = report.optString("soinsEffectues", "-");
                String recommandations = report.optString("recommandations", "-");

                binding.tvObservations.setText(observations);
                binding.tvCare.setText(soins);
                binding.tvRecommendations.setText(recommandations);
            } else {
                binding.cardReport.setVisibility(View.GONE);
            }

        } catch (Exception e) {
            e.printStackTrace();
            binding.tvError.setVisibility(View.VISIBLE);
            binding.tvError.setText("Erreur de lecture des données.");
        }
    }

    private void showLoading(boolean isLoading) {
        binding.progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        binding.scrollContent.setVisibility(isLoading ? View.GONE : View.VISIBLE);
    }

    private String getInitials(String prenom, String nom) {
        String first = "";
        String second = "";

        if (prenom != null && !prenom.isEmpty()) {
            first = prenom.substring(0, 1).toUpperCase();
        }

        if (nom != null && !nom.isEmpty()) {
            second = nom.substring(0, 1).toUpperCase();
        }

        return first + second;
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return "";
        return text.substring(0, 1).toUpperCase() + text.substring(1).toLowerCase();
    }
}