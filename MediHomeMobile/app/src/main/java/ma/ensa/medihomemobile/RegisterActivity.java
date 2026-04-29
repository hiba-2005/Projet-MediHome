package ma.ensa.medihomemobile;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONObject;

import ma.ensa.medihomemobile.utils.ApiConfig;

public class RegisterActivity extends AppCompatActivity {

    private EditText etPrenom, etNom, etEmailRegister, etTelephone, etAdresse, etPasswordRegister, etConfirmPassword;
    private Button btnRegister;
    private TextView tvGoLogin;

    private RequestQueue requestQueue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        etPrenom = findViewById(R.id.etPrenom);
        etNom = findViewById(R.id.etNom);
        etEmailRegister = findViewById(R.id.etEmailRegister);
        etTelephone = findViewById(R.id.etTelephone);
        etAdresse = findViewById(R.id.etAdresse);
        etPasswordRegister = findViewById(R.id.etPasswordRegister);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnRegister = findViewById(R.id.btnRegister);
        tvGoLogin = findViewById(R.id.tvGoLogin);

        requestQueue = Volley.newRequestQueue(this);

        btnRegister.setOnClickListener(v -> registerPatient());

        tvGoLogin.setOnClickListener(v -> {
            startActivity(new Intent(RegisterActivity.this, LoginActivity.class));
            finish();
        });
    }

    private void registerPatient() {
        String prenom = etPrenom.getText().toString().trim();
        String nom = etNom.getText().toString().trim();
        String email = etEmailRegister.getText().toString().trim();
        String telephone = etTelephone.getText().toString().trim();
        String adresse = etAdresse.getText().toString().trim();
        String password = etPasswordRegister.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        if (prenom.isEmpty() || nom.isEmpty() || email.isEmpty() || telephone.isEmpty()
                || adresse.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            Toast.makeText(this, "Veuillez remplir tous les champs.", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!password.equals(confirmPassword)) {
            Toast.makeText(this, "Les mots de passe ne correspondent pas.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnRegister.setEnabled(false);
        btnRegister.setText("Inscription...");

        try {
            JSONObject body = new JSONObject();
            body.put("prenom", prenom);
            body.put("nom", nom);
            body.put("email", email);
            body.put("telephone", telephone);
            body.put("adresse", adresse);
            body.put("password", password);

            JsonObjectRequest request = new JsonObjectRequest(
                    Request.Method.POST,
                    ApiConfig.BASE_URL + "/patients/register",
                    body,
                    response -> {
                        btnRegister.setEnabled(true);
                        btnRegister.setText("S'inscrire →");

                        try {
                            boolean success = response.getBoolean("success");
                            String message = response.optString("message", "Opération terminée.");

                            Toast.makeText(RegisterActivity.this, message, Toast.LENGTH_LONG).show();

                            if (success) {
                                startActivity(new Intent(RegisterActivity.this, LoginActivity.class));
                                finish();
                            }
                        } catch (Exception e) {
                            Toast.makeText(RegisterActivity.this, "Réponse invalide du serveur.", Toast.LENGTH_SHORT).show();
                        }
                    },
                    error -> {
                        btnRegister.setEnabled(true);
                        btnRegister.setText("S'inscrire →");

                        String message = "Erreur serveur ou connexion.";
                        if (error.networkResponse != null) {
                            message += " Code: " + error.networkResponse.statusCode;
                        }
                        Toast.makeText(RegisterActivity.this, message, Toast.LENGTH_LONG).show();
                    }
            );

            requestQueue.add(request);

        } catch (Exception e) {
            btnRegister.setEnabled(true);
            btnRegister.setText("S'inscrire →");
            Toast.makeText(this, "Erreur lors de la préparation des données.", Toast.LENGTH_SHORT).show();
        }
    }
}