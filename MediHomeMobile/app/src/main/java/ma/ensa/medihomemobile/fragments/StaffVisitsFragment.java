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
import android.widget.EditText;
import android.widget.LinearLayout;
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


public class StaffVisitsFragment extends Fragment {

    private LinearLayout visitsListContainer;
    private LinearLayout layoutEmptyVisits;
    private LinearLayout layoutVisitDetails;

    private TextView tvPatientName, tvPatientPhone, tvPatientAddress;
    private TextView tvVisitDate, tvVisitTime, tvVisitStatus;
    private EditText etObservations, etSoins, etRecommandations;
    private Button btnEnRoute, btnTerminee, btnSaveReport;

    private JSONObject selectedVisit;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_staff_visits, container, false);

        initViews(view);
        applyAnimation(view);
        loadVisits();

        btnEnRoute.setOnClickListener(v -> updateVisitStatus("en_route"));
        btnTerminee.setOnClickListener(v -> updateVisitStatus("terminee"));
        btnSaveReport.setOnClickListener(v -> saveReport());

        return view;
    }

    private void initViews(View view) {
        visitsListContainer = view.findViewById(R.id.visitsListContainer);
        layoutEmptyVisits = view.findViewById(R.id.layoutEmptyVisits);
        layoutVisitDetails = view.findViewById(R.id.layoutVisitDetails);

        tvPatientName = view.findViewById(R.id.tvPatientName);
        tvPatientPhone = view.findViewById(R.id.tvPatientPhone);
        tvPatientAddress = view.findViewById(R.id.tvPatientAddress);
        tvVisitDate = view.findViewById(R.id.tvStaffVisitDate);
        tvVisitTime = view.findViewById(R.id.tvStaffVisitTime);
        tvVisitStatus = view.findViewById(R.id.tvStaffVisitStatus);

        etObservations = view.findViewById(R.id.etObservations);
        etSoins = view.findViewById(R.id.etSoins);
        etRecommandations = view.findViewById(R.id.etRecommandations);

        btnEnRoute = view.findViewById(R.id.btnEnRoute);
        btnTerminee = view.findViewById(R.id.btnTerminee);
        btnSaveReport = view.findViewById(R.id.btnSaveReport);
    }

    private void applyAnimation(View view) {
        AlphaAnimation animation = new AlphaAnimation(0f, 1f);
        animation.setDuration(450);
        view.startAnimation(animation);
    }

    private void loadVisits() {
        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE);

        int idStaff = prefs.getInt("idStaff", -1);

        if (idStaff == -1) {
            Toast.makeText(getContext(), "Personnel non connecté", Toast.LENGTH_SHORT).show();
            return;
        }

        new Thread(() -> {
            try {
                String response = JsonHttpHelper.get(ApiConfig.getStaffVisits(idStaff));
                JSONObject json = new JSONObject(response);
                JSONArray visits = json.optJSONArray("visits");

                requireActivity().runOnUiThread(() -> {

                    visitsListContainer.removeAllViews();

                    if (visits == null || visits.length() == 0) {
                        layoutEmptyVisits.setVisibility(View.VISIBLE);
                        return;
                    }

                    layoutEmptyVisits.setVisibility(View.GONE);

                    for (int i = 0; i < visits.length(); i++) {

                        JSONObject visit = visits.optJSONObject(i);
                        if (visit == null) continue;

                        View item = LayoutInflater.from(getContext())
                                .inflate(R.layout.item_staff_visit, visitsListContainer, false);

                        // ✅ IMPORTANT : déclarer ici
                        TextView tvName = item.findViewById(R.id.tvItemPatientName);
                        TextView tvMeta = item.findViewById(R.id.tvItemDate);
                        TextView tvStatus = item.findViewById(R.id.tvItemStatus);

                        String patientName = visit.optString("prenomPatient", "") + " "
                                + visit.optString("nomPatient", "");

                        String meta = visit.optString("dateVisite", "-") + " • "
                                + visit.optString("heureVisite", "-");

                        String status = visit.optString("statut", "-");

                        tvName.setText(patientName.trim());
                        tvMeta.setText(meta);
                        tvStatus.setText(status);

                        item.setOnClickListener(v -> {
                            selectedVisit = visit;
                            bindSelectedVisit();
                        });

                        visitsListContainer.addView(item);
                    }
                });

            } catch (Exception e) {
                requireActivity().runOnUiThread(() ->
                        Toast.makeText(getContext(), "Erreur chargement", Toast.LENGTH_SHORT).show()
                );
            }
        }).start();
    }

    private void bindSelectedVisit() {
        if (selectedVisit == null) {
            layoutVisitDetails.setVisibility(View.GONE);
            return;
        }

        layoutVisitDetails.setVisibility(View.VISIBLE);

        String patientName = selectedVisit.optString("prenomPatient", "") + " " +
                selectedVisit.optString("nomPatient", "");
        tvPatientName.setText(patientName.trim());
        tvPatientPhone.setText(selectedVisit.optString("telephone", "-"));
        tvPatientAddress.setText(selectedVisit.optString("adresse", "-"));
        tvVisitDate.setText(selectedVisit.optString("dateVisite", "-"));
        tvVisitTime.setText(selectedVisit.optString("heureVisite", "-"));
        tvVisitStatus.setText(selectedVisit.optString("statut", "-"));

        etObservations.setText("");
        etSoins.setText("");
        etRecommandations.setText("");
    }

    private void updateVisitStatus(String status) {
        if (selectedVisit == null) {
            Toast.makeText(getContext(), "Sélectionnez une visite", Toast.LENGTH_SHORT).show();
            return;
        }

        new Thread(() -> {
            try {
                JSONObject body = new JSONObject();
                body.put("statut", status);

                int idVisit = selectedVisit.optInt("idHomeVisit", -1);
                String response = JsonHttpHelper.patch(ApiConfig.updateVisitStatus(idVisit), body.toString());
                JSONObject json = new JSONObject(response);

                requireActivity().runOnUiThread(() -> {
                    if (json.optBoolean("success")) {
                        Toast.makeText(getContext(), "Statut mis à jour", Toast.LENGTH_SHORT).show();
                        loadVisits();
                    } else {
                        Toast.makeText(getContext(), "Échec de la mise à jour", Toast.LENGTH_SHORT).show();
                    }
                });

            } catch (Exception e) {
                requireActivity().runOnUiThread(() ->
                        Toast.makeText(getContext(), "Erreur serveur", Toast.LENGTH_SHORT).show()
                );
            }
        }).start();
    }

    private void saveReport() {
        if (selectedVisit == null) {
            Toast.makeText(getContext(), "Sélectionnez une visite", Toast.LENGTH_SHORT).show();
            return;
        }

        String observations = etObservations.getText().toString().trim();
        String soins = etSoins.getText().toString().trim();
        String recommandations = etRecommandations.getText().toString().trim();

        if (TextUtils.isEmpty(observations) || TextUtils.isEmpty(soins) || TextUtils.isEmpty(recommandations)) {
            Toast.makeText(getContext(), "Veuillez remplir tous les champs du rapport", Toast.LENGTH_SHORT).show();
            return;
        }

        new Thread(() -> {
            try {
                JSONObject body = new JSONObject();
                body.put("idHomeVisit", selectedVisit.optInt("idHomeVisit", -1));
                body.put("observations", observations);
                body.put("soinsEffectues", soins);
                body.put("recommandations", recommandations);

                String response = JsonHttpHelper.post(ApiConfig.VISIT_REPORTS, body.toString());
                JSONObject json = new JSONObject(response);

                requireActivity().runOnUiThread(() -> {
                    if (json.optBoolean("success")) {
                        Toast.makeText(getContext(), "Rapport enregistré", Toast.LENGTH_SHORT).show();
                        etObservations.setText("");
                        etSoins.setText("");
                        etRecommandations.setText("");
                        loadVisits();
                    } else {
                        Toast.makeText(getContext(), "Échec d'enregistrement", Toast.LENGTH_SHORT).show();
                    }
                });

            } catch (Exception e) {
                requireActivity().runOnUiThread(() ->
                        Toast.makeText(getContext(), "Erreur serveur", Toast.LENGTH_SHORT).show()
                );
            }
        }).start();
    }
}