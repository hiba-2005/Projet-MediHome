package ma.ensa.medihomemobile.fragments;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import ma.ensa.medihomemobile.R;
import ma.ensa.medihomemobile.utils.ApiConfig;
import ma.ensa.medihomemobile.utils.JsonHttpHelper;

public class HomeFragment extends Fragment {

    private TextView tvInitials, tvCurrentDate, tvGreeting, tvVisitCountdown;
    private TextView tvVisitDateTime, tvVisitStaff, tvVisitStatus, tvNoVisitMessage;
    private View cardNextVisit;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_home, container, false);

        initViews(view);
        loadLocalPatientInfo();
        loadDashboardData();

        return view;
    }

    private void initViews(View view) {
        tvInitials = view.findViewById(R.id.tvInitials);
        tvCurrentDate = view.findViewById(R.id.tvCurrentDate);
        tvGreeting = view.findViewById(R.id.tvGreeting);
        tvVisitCountdown = view.findViewById(R.id.tvVisitCountdown);
        tvVisitDateTime = view.findViewById(R.id.tvVisitDateTime);
        tvVisitStaff = view.findViewById(R.id.tvVisitStaff);
        tvVisitStatus = view.findViewById(R.id.tvVisitStatus);
        tvNoVisitMessage = view.findViewById(R.id.tvNoVisitMessage);
        cardNextVisit = view.findViewById(R.id.cardNextVisit);

        String dateNow = new SimpleDateFormat("EEEE, dd MMMM yyyy", Locale.FRENCH)
                .format(new Date());
        tvCurrentDate.setText(capitalize(dateNow));
    }

    private void loadLocalPatientInfo() {
        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE);

        String prenom = prefs.getString("patientPrenom", "");
        String nom = prefs.getString("patientNom", "");

        tvInitials.setText(getInitials(prenom, nom));

        if (!TextUtils.isEmpty(prenom)) {
            tvGreeting.setText("Bonjour, " + prenom + " 👋");
        } else {
            tvGreeting.setText("Bonjour 👋");
        }
    }

    private void loadDashboardData() {
        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE);

        int idPatient = prefs.getInt("idPatient", -1);

        if (idPatient == -1) {
            showNoVisit("Patient non connecté.");
            return;
        }

        new Thread(() -> {
            try {
                String endpoint = ApiConfig.PATIENTS + "/" + idPatient + "/dashboard";
                String response = JsonHttpHelper.get(endpoint);

                JSONObject json = new JSONObject(response);

                if (!json.optBoolean("success", false)) {
                    requireActivity().runOnUiThread(() ->
                            showNoVisit(json.optString("message", "Impossible de charger les données."))
                    );
                    return;
                }

                JSONObject patient = json.optJSONObject("patient");
                boolean hasVisit = json.optBoolean("hasVisit", false);
                JSONObject visit = json.optJSONObject("visit");
                JSONArray notifications = json.optJSONArray("notifications");

                requireActivity().runOnUiThread(() -> {
                    if (patient != null) {
                        String prenom = patient.optString("prenom", "");
                        String nom = patient.optString("nom", "");

                        tvGreeting.setText("Bonjour, " + prenom + " 👋");
                        tvInitials.setText(getInitials(prenom, nom));
                    }

                    if (hasVisit && visit != null) {
                        cardNextVisit.setVisibility(View.VISIBLE);
                        tvNoVisitMessage.setVisibility(View.GONE);

                        String dateVisite = visit.optString("dateVisite", "-");
                        String heureVisite = visit.optString("heureVisite", "-");
                        String prenomStaff = visit.optString("prenomStaff", "");
                        String nomStaff = visit.optString("nomStaff", "");
                        String specialite = visit.optString("specialite", "");
                        String statut = visit.optString("statut", "planifiee");

                        tvVisitDateTime.setText(formatDateFr(dateVisite) + " · " + heureVisite);
                        tvVisitStaff.setText("Dr. " + prenomStaff + " " + nomStaff + " · " + specialite);
                        tvVisitStatus.setText(formatStatus(statut));
                        tvVisitCountdown.setText(buildVisitSubtitle(statut, notifications));
                    } else {
                        showNoVisit(json.optString("message", "Aucune visite programmée."));
                    }
                });

            } catch (Exception e) {
                requireActivity().runOnUiThread(() -> {
                    Toast.makeText(getContext(), "Erreur serveur", Toast.LENGTH_SHORT).show();
                    showNoVisit("Erreur de chargement des données patient.");
                });
            }
        }).start();
    }

    private void showNoVisit(String message) {
        cardNextVisit.setVisibility(View.GONE);
        tvNoVisitMessage.setVisibility(View.VISIBLE);
        tvNoVisitMessage.setText(message);
        tvVisitCountdown.setText("Aucune visite programmée");
    }

    private String getInitials(String prenom, String nom) {
        String p = TextUtils.isEmpty(prenom) ? "" : prenom.substring(0, 1).toUpperCase();
        String n = TextUtils.isEmpty(nom) ? "" : nom.substring(0, 1).toUpperCase();
        return (p + n).isEmpty() ? "MH" : p + n;
    }

    private String formatDateFr(String dateIso) {
        try {
            SimpleDateFormat input = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            SimpleDateFormat output = new SimpleDateFormat("EEEE dd MMMM", Locale.FRENCH);
            Date date = input.parse(dateIso);
            return capitalize(output.format(date));
        } catch (Exception e) {
            return dateIso;
        }
    }

    private String formatStatus(String status) {
        if (status == null) return "En attente";

        switch (status.toLowerCase()) {
            case "planifiee":
                return "Confirmé";
            case "en_route":
                return "En route";
            case "reportee":
                return "Reportée";
            case "terminee":
                return "Terminée";
            default:
                return status;
        }
    }

    private String buildVisitSubtitle(String statut, JSONArray notifications) {
        if (statut == null) return "Votre visite est en attente";

        switch (statut.toLowerCase()) {
            case "planifiee":
                return "Votre prochaine visite est programmée";
            case "en_route":
                return "Le personnel médical est en route";
            case "reportee":
                return "Votre visite a été reportée";
            case "terminee":
                return "Votre visite a été effectuée avec succès";
            default:
                return "Consultez les détails de votre visite";
        }
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return "";
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    }
}