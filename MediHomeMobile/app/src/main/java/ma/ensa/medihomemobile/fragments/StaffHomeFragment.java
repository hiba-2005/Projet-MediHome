package ma.ensa.medihomemobile.fragments;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.Gravity;
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

import ma.ensa.medihomemobile.LoginActivity;
import ma.ensa.medihomemobile.R;
import ma.ensa.medihomemobile.utils.ApiConfig;
import ma.ensa.medihomemobile.utils.JsonHttpHelper;

public class StaffHomeFragment extends Fragment {

    private TextView tvInitials, tvFullName, tvNameCard, tvEmailTop, tvSpecialityTop;
    private TextView tvStatTotal, tvStatPlanned, tvStatRoute, tvStatDone;
    private LinearLayout layoutTodayAgenda;

    private EditText etPrenom, etNom, etEmail, etTelephone, etSpecialite;
    private Button btnSaveProfile, btnLogout;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_staff_home, container, false);

        initViews(view);
        applyAnimation(view);
        loadStaffData();

        btnSaveProfile.setOnClickListener(v -> updateStaffProfile());
        btnLogout.setOnClickListener(v -> logout());

        return view;
    }

    private void initViews(View view) {
        tvInitials = view.findViewById(R.id.tvStaffInitials);
        tvFullName = view.findViewById(R.id.tvStaffFullName);
        tvNameCard = view.findViewById(R.id.tvStaffNameCard);
        tvEmailTop = view.findViewById(R.id.tvStaffEmailTop);
        tvSpecialityTop = view.findViewById(R.id.tvStaffSpecialityTop);

        tvStatTotal = view.findViewById(R.id.tvStatTotal);
        tvStatPlanned = view.findViewById(R.id.tvStatPlanned);
        tvStatRoute = view.findViewById(R.id.tvStatRoute);
        tvStatDone = view.findViewById(R.id.tvStatDone);

        layoutTodayAgenda = view.findViewById(R.id.layoutTodayAgenda);

        etPrenom = view.findViewById(R.id.etStaffPrenom);
        etNom = view.findViewById(R.id.etStaffNom);
        etEmail = view.findViewById(R.id.etStaffEmail);
        etTelephone = view.findViewById(R.id.etStaffTelephone);
        etSpecialite = view.findViewById(R.id.etStaffSpecialite);

        btnSaveProfile = view.findViewById(R.id.btnSaveStaffProfile);
        btnLogout = view.findViewById(R.id.btnLogoutStaff);
    }

    private void applyAnimation(View view) {
        AlphaAnimation animation = new AlphaAnimation(0f, 1f);
        animation.setDuration(500);
        view.startAnimation(animation);
    }

    private void loadStaffData() {
        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE);

        int idStaff = prefs.getInt("idStaff", -1);

        if (idStaff == -1) {
            Toast.makeText(getContext(), "Personnel médical non connecté", Toast.LENGTH_SHORT).show();
            return;
        }

        new Thread(() -> {
            try {
                String staffResponse = JsonHttpHelper.get(ApiConfig.STAFF);
                String visitsResponse = JsonHttpHelper.get(ApiConfig.getStaffVisits(idStaff));

                JSONObject staffJson = new JSONObject(staffResponse);
                JSONObject visitsJson = new JSONObject(visitsResponse);

                JSONArray staffArray = staffJson.optJSONArray("staff");
                JSONArray visitsArray = visitsJson.optJSONArray("visits");

                JSONObject currentStaff = null;

                if (staffArray != null) {
                    for (int i = 0; i < staffArray.length(); i++) {
                        JSONObject item = staffArray.optJSONObject(i);
                        if (item != null && item.optInt("idStaff", -1) == idStaff) {
                            currentStaff = item;
                            break;
                        }
                    }
                }

                JSONObject finalCurrentStaff = currentStaff;
                JSONArray finalVisitsArray = visitsArray;

                requireActivity().runOnUiThread(() -> {
                    if (finalCurrentStaff == null) {
                        Toast.makeText(getContext(), "Impossible de charger le profil staff", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    String prenom = finalCurrentStaff.optString("prenom", "");
                    String nom = finalCurrentStaff.optString("nom", "");
                    String email = finalCurrentStaff.optString("email", "");
                    String telephone = finalCurrentStaff.optString("telephone", "");
                    String specialite = finalCurrentStaff.optString("specialite", "");

                    String fullName = (prenom + " " + nom).trim();

                    etPrenom.setText(prenom);
                    etNom.setText(nom);
                    etEmail.setText(email);
                    etTelephone.setText(telephone);
                    etSpecialite.setText(specialite);

                    tvFullName.setText("Dr. " + fullName);
                    tvNameCard.setText(fullName);
                    tvEmailTop.setText(email);
                    tvSpecialityTop.setText("🩺 " + specialite);
                    tvInitials.setText(getInitials(prenom, nom));

                    int total = 0, planned = 0, route = 0, done = 0;

                    if (finalVisitsArray != null) {
                        total = finalVisitsArray.length();

                        for (int i = 0; i < finalVisitsArray.length(); i++) {
                            JSONObject v = finalVisitsArray.optJSONObject(i);
                            if (v == null) continue;

                            String status = v.optString("statut", "").toLowerCase();

                            if ("planifiee".equals(status)) planned++;
                            else if ("en_route".equals(status)) route++;
                            else if ("terminee".equals(status)) done++;
                        }
                    }

                    tvStatTotal.setText(String.valueOf(total));
                    tvStatPlanned.setText(String.valueOf(planned));
                    tvStatRoute.setText(String.valueOf(route));
                    tvStatDone.setText(String.valueOf(done));

                    layoutTodayAgenda.removeAllViews();

                    if (finalVisitsArray != null) {
                        int maxItems = Math.min(finalVisitsArray.length(), 2);

                        for (int i = 0; i < maxItems; i++) {
                            JSONObject v = finalVisitsArray.optJSONObject(i);
                            if (v == null) continue;

                            addAgendaItem(
                                    v.optString("heureVisite", "-"),
                                    (v.optString("prenomPatient", "") + " " + v.optString("nomPatient", "")).trim(),
                                    v.optString("adresse", "Casablanca"),
                                    v.optString("statut", "planifiee")
                            );
                        }
                    }

                    if (layoutTodayAgenda.getChildCount() == 0) {
                        TextView empty = new TextView(getContext());
                        empty.setText("Aucune visite aujourd’hui.");
                        empty.setTextColor(0xFF102A43);
                        empty.setTextSize(14);
                        layoutTodayAgenda.addView(empty);
                    }
                });

            } catch (Exception e) {
                requireActivity().runOnUiThread(() ->
                        Toast.makeText(getContext(), "Erreur de chargement", Toast.LENGTH_SHORT).show()
                );
            }
        }).start();
    }

    private void addAgendaItem(String time, String patientName, String city, String status) {
        LinearLayout row = new LinearLayout(getContext());
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(0, 10, 0, 10);

        TextView tvTime = new TextView(getContext());
        tvTime.setText(time);
        tvTime.setTextColor(0xFF102A43);
        tvTime.setTextSize(11);
        tvTime.setTypeface(null, Typeface.BOLD);
        tvTime.setGravity(Gravity.CENTER);

        row.addView(tvTime, new LinearLayout.LayoutParams(120, LinearLayout.LayoutParams.WRAP_CONTENT));

        TextView dot = new TextView(getContext());
        dot.setText("●");
        dot.setTextColor(0xFFF59E0B);
        dot.setTextSize(18);
        row.addView(dot);

        LinearLayout info = new LinearLayout(getContext());
        info.setOrientation(LinearLayout.VERTICAL);
        info.setPadding(12, 0, 0, 0);

        TextView tvName = new TextView(getContext());
        tvName.setText(patientName);
        tvName.setTextColor(0xFF102A43);
        tvName.setTextSize(14);
        tvName.setTypeface(null, Typeface.BOLD);

        TextView tvMeta = new TextView(getContext());
        tvMeta.setText("📍 " + city + " · Consultation");
        tvMeta.setTextColor(0xFF7B8CA3);
        tvMeta.setTextSize(11);

        info.addView(tvName);
        info.addView(tvMeta);

        row.addView(info, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));

        TextView tvStatus = new TextView(getContext());
        tvStatus.setText(formatStatus(status));
        tvStatus.setTextColor(0xFFFF8A00);
        tvStatus.setTextSize(11);
        tvStatus.setTypeface(null, Typeface.BOLD);
        tvStatus.setBackgroundResource(R.drawable.bg_staff_status_planned);
        tvStatus.setPadding(12, 6, 12, 6);

        row.addView(tvStatus);

        layoutTodayAgenda.addView(row);
    }

    private void updateStaffProfile() {
        SharedPreferences prefs = requireActivity().getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE);
        int idStaff = prefs.getInt("idStaff", -1);

        if (idStaff == -1) {
            Toast.makeText(getContext(), "Personnel médical non connecté", Toast.LENGTH_SHORT).show();
            return;
        }

        String prenom = etPrenom.getText().toString().trim();
        String nom = etNom.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String telephone = etTelephone.getText().toString().trim();
        String specialite = etSpecialite.getText().toString().trim();

        if (TextUtils.isEmpty(prenom) || TextUtils.isEmpty(nom) || TextUtils.isEmpty(email)
                || TextUtils.isEmpty(telephone) || TextUtils.isEmpty(specialite)) {
            Toast.makeText(getContext(), "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSaveProfile.setEnabled(false);
        btnSaveProfile.setText("Enregistrement...");

        new Thread(() -> {
            try {
                JSONObject body = new JSONObject();
                body.put("nom", nom);
                body.put("prenom", prenom);
                body.put("specialite", specialite);
                body.put("telephone", telephone);
                body.put("email", email);
                body.put("role", "personnel_medical");

                String response = JsonHttpHelper.put(ApiConfig.STAFF + "/" + idStaff, body.toString());
                JSONObject json = new JSONObject(response);

                requireActivity().runOnUiThread(() -> {
                    btnSaveProfile.setEnabled(true);
                    btnSaveProfile.setText("Enregistrer");

                    if (json.optBoolean("success", true)) {
                        prefs.edit()
                                .putString("staffPrenom", prenom)
                                .putString("staffNom", nom)
                                .putString("staffEmail", email)
                                .putString("staffTelephone", telephone)
                                .putString("staffSpecialite", specialite)
                                .apply();

                        tvFullName.setText("Dr. " + prenom + " " + nom);
                        tvNameCard.setText(prenom + " " + nom);
                        tvEmailTop.setText(email);
                        tvSpecialityTop.setText("🩺 " + specialite);
                        tvInitials.setText(getInitials(prenom, nom));

                        Toast.makeText(getContext(), "Profil mis à jour", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(getContext(), "Échec de la modification", Toast.LENGTH_SHORT).show();
                    }
                });

            } catch (Exception e) {
                requireActivity().runOnUiThread(() -> {
                    btnSaveProfile.setEnabled(true);
                    btnSaveProfile.setText("Enregistrer");
                    Toast.makeText(getContext(), "Erreur serveur", Toast.LENGTH_SHORT).show();
                });
            }
        }).start();
    }

    private void logout() {
        requireActivity()
                .getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE)
                .edit()
                .clear()
                .apply();

        Intent intent = new Intent(getActivity(), LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
    }

    private String getInitials(String prenom, String nom) {
        String p = TextUtils.isEmpty(prenom) ? "" : prenom.substring(0, 1).toUpperCase();
        String n = TextUtils.isEmpty(nom) ? "" : nom.substring(0, 1).toUpperCase();
        String result = p + n;
        return result.isEmpty() ? "SK" : result;
    }

    private String formatStatus(String status) {
        if ("terminee".equalsIgnoreCase(status)) return "Terminée";
        if ("en_route".equalsIgnoreCase(status)) return "En route";
        return "Planifiée";
    }
}