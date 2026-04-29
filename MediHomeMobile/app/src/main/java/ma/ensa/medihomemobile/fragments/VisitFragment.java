package ma.ensa.medihomemobile.fragments;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AlphaAnimation;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import org.json.JSONArray;
import org.json.JSONObject;

import ma.ensa.medihomemobile.R;
import ma.ensa.medihomemobile.utils.ApiConfig;
import ma.ensa.medihomemobile.utils.JsonHttpHelper;

public class VisitFragment extends Fragment {

    private TextView tvVisitStatus, tvVisitDateTime, tvVisitDone;
    private TextView tvVisitDate, tvVisitTime, tvVisitType, tvVisitDuration;
    private TextView tvStaffInitials, tvStaffName, tvStaffSpeciality, tvStaffTag;
    private TextView tvImportantMessage;
    private Button btnRefreshVisit;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_visit, container, false);

        initViews(view);
        applyFadeAnimation(view);
        loadVisitData();

        btnRefreshVisit.setOnClickListener(v -> loadVisitData());

        return view;
    }

    private void initViews(View view) {
        tvVisitStatus = view.findViewById(R.id.tvVisitStatus);
        tvVisitDateTime = view.findViewById(R.id.tvVisitDateTime);
        tvVisitDone = view.findViewById(R.id.tvVisitDone);

        tvVisitDate = view.findViewById(R.id.tvVisitDate);
        tvVisitTime = view.findViewById(R.id.tvVisitTime);
        tvVisitType = view.findViewById(R.id.tvVisitType);
        tvVisitDuration = view.findViewById(R.id.tvVisitDuration);

        tvStaffInitials = view.findViewById(R.id.tvStaffInitials);
        tvStaffName = view.findViewById(R.id.tvStaffName);
        tvStaffSpeciality = view.findViewById(R.id.tvStaffSpeciality);
        tvStaffTag = view.findViewById(R.id.tvStaffTag);

        tvImportantMessage = view.findViewById(R.id.tvImportantMessage);
        btnRefreshVisit = view.findViewById(R.id.btnRefreshVisit);
    }

    private void applyFadeAnimation(View view) {
        AlphaAnimation animation = new AlphaAnimation(0f, 1f);
        animation.setDuration(450);
        view.startAnimation(animation);
    }

    private void loadVisitData() {
        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE);

        int idPatient = prefs.getInt("idPatient", -1);

        if (idPatient == -1) {
            Toast.makeText(getContext(), "Patient non connecté", Toast.LENGTH_SHORT).show();
            return;
        }

        btnRefreshVisit.setEnabled(false);
        btnRefreshVisit.setText("Actualisation...");

        new Thread(() -> {
            try {
                String endpoint = ApiConfig.PATIENTS + "/" + idPatient + "/dashboard";
                String response = JsonHttpHelper.get(endpoint);

                JSONObject json = new JSONObject(response);

                requireActivity().runOnUiThread(() -> {
                    btnRefreshVisit.setEnabled(true);
                    btnRefreshVisit.setText("Actualiser la visite");
                });

                if (!json.optBoolean("success", false)) {
                    requireActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), "Impossible de charger la visite", Toast.LENGTH_SHORT).show()
                    );
                    return;
                }

                boolean hasVisit = json.optBoolean("hasVisit", false);
                JSONObject visit = json.optJSONObject("visit");
                JSONArray notifications = json.optJSONArray("notifications");

                if (!hasVisit || visit == null) {
                    requireActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), "Aucune visite programmée", Toast.LENGTH_SHORT).show()
                    );
                    return;
                }

                requireActivity().runOnUiThread(() ->
                        bindVisitData(visit, notifications)
                );

            } catch (Exception e) {
                requireActivity().runOnUiThread(() -> {
                    btnRefreshVisit.setEnabled(true);
                    btnRefreshVisit.setText("Actualiser la visite");
                    Toast.makeText(getContext(), "Erreur serveur", Toast.LENGTH_SHORT).show();
                });
            }
        }).start();
    }

    private void bindVisitData(JSONObject visit, JSONArray notifications) {
        String statut = visit.optString("statut", "planifiee");
        String dateVisite = visit.optString("dateVisite", "-");
        String heureVisite = visit.optString("heureVisite", "-");

        String prenomStaff = visit.optString("prenomStaff", "");
        String nomStaff = visit.optString("nomStaff", "");
        String specialite = visit.optString("specialite", "Médecin généraliste");

        String staffName = (prenomStaff + " " + nomStaff).trim();
        if (TextUtils.isEmpty(staffName)) staffName = "Personnel médical";

        tvVisitStatus.setText("● " + formatStatus(statut));
        tvVisitDone.setText("✓ " + formatDone(statut));

        tvVisitDateTime.setText(dateVisite + " · " + heureVisite);
        tvVisitDate.setText(dateVisite);
        tvVisitTime.setText(heureVisite);
        tvVisitType.setText(inferVisitType(specialite));
        tvVisitDuration.setText(inferDuration(statut));

        tvStaffName.setText(staffName);
        tvStaffSpeciality.setText(specialite);
        tvStaffInitials.setText(getInitials(prenomStaff, nomStaff));
        tvStaffTag.setText("MediHome · " + formatStatus(statut).toLowerCase());

        tvImportantMessage.setText(buildImportantMessage(statut, notifications));
    }

    private String formatStatus(String status) {
        if (status == null) return "Planifiée";

        switch (status.toLowerCase()) {
            case "planifiee":
                return "Planifiée";
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

    private String formatDone(String status) {
        if ("terminee".equalsIgnoreCase(status)) return "Effectuée";
        if ("en_route".equalsIgnoreCase(status)) return "En cours";
        if ("reportee".equalsIgnoreCase(status)) return "Reportée";
        return "Planifiée";
    }

    private String inferVisitType(String specialite) {
        if (specialite == null) return "Consultation";

        String s = specialite.toLowerCase();

        if (s.contains("infirm")) return "Soins infirmiers";
        if (s.contains("médec") || s.contains("medec")) return "Consultation";

        return "Consultation";
    }

    private String inferDuration(String statut) {
        if ("terminee".equalsIgnoreCase(statut)) return "Effectuée";
        if ("en_route".equalsIgnoreCase(statut)) return "En cours";
        if ("reportee".equalsIgnoreCase(statut)) return "Reportée";
        return "Prévue";
    }

    private String getInitials(String prenom, String nom) {
        String p = TextUtils.isEmpty(prenom) ? "" : prenom.substring(0, 1).toUpperCase();
        String n = TextUtils.isEmpty(nom) ? "" : nom.substring(0, 1).toUpperCase();
        String result = p + n;
        return result.isEmpty() ? "PM" : result;
    }

    private String buildImportantMessage(String statut, JSONArray notifications) {
        if (notifications != null && notifications.length() > 0) {
            JSONObject notif = notifications.optJSONObject(0);
            if (notif != null) {
                String text = notif.optString("text", "");
                if (!TextUtils.isEmpty(text)) return text;
            }
        }

        if ("terminee".equalsIgnoreCase(statut)) {
            return "Votre visite à domicile a été effectuée avec succès.";
        }

        if ("en_route".equalsIgnoreCase(statut)) {
            return "Le professionnel médical est en route vers votre domicile.";
        }

        if ("reportee".equalsIgnoreCase(statut)) {
            return "Votre visite a été reportée. Consultez la nouvelle planification.";
        }

        return "Votre visite est confirmée. Merci de rester disponible.";
    }
}