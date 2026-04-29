package ma.ensa.medihomemobile.fragments;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AlphaAnimation;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import org.json.JSONObject;

import ma.ensa.medihomemobile.LoginActivity;
import ma.ensa.medihomemobile.R;
import ma.ensa.medihomemobile.utils.ApiConfig;
import ma.ensa.medihomemobile.utils.JsonHttpHelper;

public class ProfileFragment extends Fragment {
    private EditText etNewPassword, etConfirmPassword;
    private Button btnChangePassword;
    private TextView tvInitials, tvFullName, tvEmailTop;
    private EditText etPrenom, etNom, etEmail, etTelephone, etAdresse;
    private Button btnSaveProfile, btnLogout;
    private ImageView btnChangePhoto;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        initViews(view);
        setupAnimation(view);
        loadPatientProfile();

        btnChangePassword.setOnClickListener(v -> changePassword());
        btnSaveProfile.setOnClickListener(v -> updatePatientProfile());
        btnLogout.setOnClickListener(v -> logout());

        return view;
    }

    private void initViews(View view) {
        tvInitials = view.findViewById(R.id.tvProfileInitials);
        tvFullName = view.findViewById(R.id.tvProfileFullName);
        tvEmailTop = view.findViewById(R.id.tvProfileEmailTop);

        btnChangePhoto = view.findViewById(R.id.btnChangePhoto);

        etPrenom = view.findViewById(R.id.etProfilePrenom);
        etNom = view.findViewById(R.id.etProfileNom);
        etEmail = view.findViewById(R.id.etProfileEmail);
        etTelephone = view.findViewById(R.id.etProfileTelephone);
        etAdresse = view.findViewById(R.id.etProfileAdresse);

        btnSaveProfile = view.findViewById(R.id.btnSaveProfile);
        btnLogout = view.findViewById(R.id.btnLogout);
        etNewPassword = view.findViewById(R.id.etNewPassword);
        etConfirmPassword = view.findViewById(R.id.etConfirmPassword);
        btnChangePassword = view.findViewById(R.id.btnChangePassword);
    }

    private void setupAnimation(View view) {
        AlphaAnimation animation = new AlphaAnimation(0f, 1f);
        animation.setDuration(500);
        view.startAnimation(animation);
    }

    private void loadPatientProfile() {
        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE);

        int idPatient = prefs.getInt("idPatient", -1);

        if (idPatient == -1) {
            Toast.makeText(getContext(), "Patient non connecté", Toast.LENGTH_SHORT).show();
            return;
        }

        new Thread(() -> {
            try {
                String endpoint = ApiConfig.PATIENTS + "/" + idPatient + "/dashboard";
                String response = JsonHttpHelper.get(endpoint);

                JSONObject json = new JSONObject(response);

                if (!json.optBoolean("success")) {
                    requireActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), "Impossible de charger le profil", Toast.LENGTH_SHORT).show()
                    );
                    return;
                }

                JSONObject patient = json.getJSONObject("patient");

                String prenom = patient.optString("prenom", "");
                String nom = patient.optString("nom", "");
                String email = patient.optString("email", "");
                String telephone = patient.optString("telephone", "");
                String adresse = patient.optString("adresse", "");

                requireActivity().runOnUiThread(() -> {
                    etPrenom.setText(prenom);
                    etNom.setText(nom);
                    etEmail.setText(email);
                    etTelephone.setText(telephone);
                    etAdresse.setText(adresse);

                    tvFullName.setText(prenom + " " + nom);
                    tvEmailTop.setText(email);
                    tvInitials.setText(getInitials(prenom, nom));
                });

            } catch (Exception e) {
                requireActivity().runOnUiThread(() ->
                        Toast.makeText(getContext(), "Erreur de chargement", Toast.LENGTH_SHORT).show()
                );
            }
        }).start();
    }
    private void changePassword() {
        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE);

        int idPatient = prefs.getInt("idPatient", -1);

        String newPassword = etNewPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        if (TextUtils.isEmpty(newPassword) || TextUtils.isEmpty(confirmPassword)) {
            Toast.makeText(getContext(), "Veuillez remplir les deux champs", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!newPassword.equals(confirmPassword)) {
            Toast.makeText(getContext(), "Les mots de passe ne correspondent pas", Toast.LENGTH_SHORT).show();
            return;
        }

        if (newPassword.length() < 6) {
            Toast.makeText(getContext(), "Minimum 6 caractères", Toast.LENGTH_SHORT).show();
            return;
        }

        btnChangePassword.setEnabled(false);
        btnChangePassword.setText("Modification...");

        new Thread(() -> {
            try {
                JSONObject body = new JSONObject();
                body.put("password", newPassword);

                String endpoint = ApiConfig.PATIENTS + "/" + idPatient + "/password";
                String response = JsonHttpHelper.post(endpoint, body.toString());

                JSONObject json = new JSONObject(response);

                requireActivity().runOnUiThread(() -> {
                    btnChangePassword.setEnabled(true);
                    btnChangePassword.setText("Changer mot de passe");

                    if (json.optBoolean("success")) {
                        etNewPassword.setText("");
                        etConfirmPassword.setText("");
                        Toast.makeText(getContext(), "Mot de passe changé avec succès", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(getContext(), json.optString("message", "Erreur"), Toast.LENGTH_SHORT).show();
                    }
                });

            } catch (Exception e) {
                requireActivity().runOnUiThread(() -> {
                    btnChangePassword.setEnabled(true);
                    btnChangePassword.setText("Changer mot de passe");
                    Toast.makeText(getContext(), "Erreur serveur", Toast.LENGTH_SHORT).show();
                });
            }
        }).start();
    }
    private void updatePatientProfile() {
        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MediHomePrefs", Context.MODE_PRIVATE);

        int idPatient = prefs.getInt("idPatient", -1);

        if (idPatient == -1) {
            Toast.makeText(getContext(), "Patient non connecté", Toast.LENGTH_SHORT).show();
            return;
        }

        String prenom = etPrenom.getText().toString().trim();
        String nom = etNom.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String telephone = etTelephone.getText().toString().trim();
        String adresse = etAdresse.getText().toString().trim();

        if (TextUtils.isEmpty(prenom) || TextUtils.isEmpty(nom)
                || TextUtils.isEmpty(email) || TextUtils.isEmpty(telephone)
                || TextUtils.isEmpty(adresse)) {
            Toast.makeText(getContext(), "Veuillez remplir tous les champs", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSaveProfile.setEnabled(false);
        btnSaveProfile.setText("Enregistrement...");

        new Thread(() -> {
            try {
                JSONObject body = new JSONObject();
                body.put("prenom", prenom);
                body.put("nom", nom);
                body.put("email", email);
                body.put("telephone", telephone);
                body.put("adresse", adresse);

                String endpoint = ApiConfig.PATIENTS + "/" + idPatient;
                String response = JsonHttpHelper.put(endpoint, body.toString());

                JSONObject json = new JSONObject(response);

                requireActivity().runOnUiThread(() -> {
                    btnSaveProfile.setEnabled(true);
                    btnSaveProfile.setText("ENREGISTRER");

                    if (json.optBoolean("success")) {
                        prefs.edit()
                                .putString("patientPrenom", prenom)
                                .putString("patientNom", nom)
                                .putString("patientEmail", email)
                                .apply();

                        tvFullName.setText(prenom + " " + nom);
                        tvEmailTop.setText(email);
                        tvInitials.setText(getInitials(prenom, nom));

                        Toast.makeText(getContext(), "Profil mis à jour", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(getContext(), "Erreur modification", Toast.LENGTH_SHORT).show();
                    }
                });

            } catch (Exception e) {
                requireActivity().runOnUiThread(() -> {
                    btnSaveProfile.setEnabled(true);
                    btnSaveProfile.setText("ENREGISTRER");
                    Toast.makeText(getContext(), "Erreur serveur", Toast.LENGTH_SHORT).show();
                });
            }
        }).start();
    }

    private String getInitials(String prenom, String nom) {
        String p = TextUtils.isEmpty(prenom) ? "" : prenom.substring(0, 1).toUpperCase();
        String n = TextUtils.isEmpty(nom) ? "" : nom.substring(0, 1).toUpperCase();

        String result = p + n;
        return result.isEmpty() ? "PT" : result;
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
}