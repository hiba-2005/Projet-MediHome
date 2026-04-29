package ma.ensa.medihomemobile;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONObject;

import ma.ensa.medihomemobile.databinding.ActivityLoginBinding;
import ma.ensa.medihomemobile.utils.ApiConfig;
import ma.ensa.medihomemobile.utils.SessionManager;

public class LoginActivity extends AppCompatActivity {

    private ActivityLoginBinding binding;
    private SessionManager sessionManager;
    private RequestQueue requestQueue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        sessionManager = new SessionManager(this);
        requestQueue = Volley.newRequestQueue(this);

        setupSpinner();
        setupClicks();
    }

    private void setupSpinner() {
        String[] roles = {"Patient", "Personnel médical"};

        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_dropdown_item,
                roles
        );

        binding.spinnerUserType.setAdapter(adapter);
    }

    private void setupClicks() {
        binding.btnLogin.setOnClickListener(v -> loginUser());

        binding.tvRegister.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });
    }

    private void loginUser() {
        String email = binding.etEmail.getText().toString().trim();
        String password = binding.etPassword.getText().toString().trim();
        String selectedType = binding.spinnerUserType.getSelectedItem().toString();

        binding.tvError.setVisibility(View.GONE);
        binding.tvError.setText("");

        if (email.isEmpty() || password.isEmpty()) {
            showError("Veuillez remplir tous les champs.");
            return;
        }

        binding.btnLogin.setEnabled(false);
        binding.btnLogin.setText("Connexion...");

        String url = selectedType.equals("Patient")
                ? ApiConfig.LOGIN_PATIENT
                : ApiConfig.LOGIN_STAFF;

        JSONObject body = new JSONObject();
        try {
            body.put("email", email);
            body.put("password", password);
        } catch (Exception e) {
            resetLoginButton();
            showError("Erreur JSON.");
            return;
        }

        JsonObjectRequest request = new JsonObjectRequest(
                Request.Method.POST,
                url,
                body,
                response -> {
                    resetLoginButton();

                    try {
                        boolean success = response.optBoolean("success", false);

                        if (!success) {
                            showError(response.optString("message", "Connexion échouée."));
                            return;
                        }

                        JSONObject user = response.getJSONObject("user");

                        if (selectedType.equals("Patient")) {
                            sessionManager.savePatientSession(
                                    user.getInt("idPatient"),
                                    user.getString("nom"),
                                    user.getString("prenom"),
                                    user.getString("email")
                            );

                            Toast.makeText(this, "Connexion patient réussie.", Toast.LENGTH_SHORT).show();

                            Intent intent = new Intent(LoginActivity.this, PatientMainActivity.class);
                            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                            startActivity(intent);
                            finish();
                            return;
                        }

                        String role = user.optString("role", "");
                        String specialite = user.optString("specialite", "");

                        sessionManager.saveStaffSession(
                                user.getInt("idStaff"),
                                user.getString("nom"),
                                user.getString("prenom"),
                                user.getString("email"),
                                role,
                                specialite
                        );

                        Toast.makeText(this, "Connexion réussie : " + role, Toast.LENGTH_SHORT).show();

                        Intent intent = new Intent(LoginActivity.this, StaffDashboardActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                        finish();

                    } catch (Exception e) {
                        e.printStackTrace();
                        showError("Erreur de lecture de réponse.");
                    }
                },
                error -> {
                    resetLoginButton();
                    showError("Erreur serveur ou connexion.");
                }
        );

        requestQueue.add(request);
    }

    private void resetLoginButton() {
        binding.btnLogin.setEnabled(true);
        binding.btnLogin.setText("SE CONNECTER");
    }

    private void showError(String message) {
        binding.tvError.setText(message);
        binding.tvError.setVisibility(View.VISIBLE);
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}