package ma.ensa.medihomemobile.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {

    private static final String PREF_NAME = "MediHomePrefs";

    private static final String KEY_IS_LOGGED_IN = "isLoggedIn";
    private static final String KEY_USER_TYPE = "userType";
    private static final String KEY_ID_PATIENT = "idPatient";
    private static final String KEY_ID_STAFF = "idStaff";
    private static final String KEY_NOM = "nom";
    private static final String KEY_PRENOM = "prenom";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_ROLE = "role";
    private static final String KEY_SPECIALITE = "specialite";

    private final SharedPreferences prefs;
    private final SharedPreferences.Editor editor;

    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
    }

    public void savePatientSession(int idPatient, String nom, String prenom, String email) {
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.putString(KEY_USER_TYPE, "patient");
        editor.putInt(KEY_ID_PATIENT, idPatient);
        editor.putString(KEY_NOM, nom);
        editor.putString(KEY_PRENOM, prenom);
        editor.putString(KEY_EMAIL, email);
        editor.apply();
    }

    public void saveStaffSession(int idStaff, String nom, String prenom, String email, String role, String specialite) {
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.putString(KEY_USER_TYPE, "staff");
        editor.putInt(KEY_ID_STAFF, idStaff);
        editor.putString(KEY_NOM, nom);
        editor.putString(KEY_PRENOM, prenom);
        editor.putString(KEY_EMAIL, email);
        editor.putString(KEY_ROLE, role);
        editor.putString(KEY_SPECIALITE, specialite);
        editor.apply();
    }

    public boolean isLoggedIn() {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    public String getUserType() {
        return prefs.getString(KEY_USER_TYPE, "");
    }

    public int getIdPatient() {
        return prefs.getInt(KEY_ID_PATIENT, -1);
    }

    public int getIdStaff() {
        return prefs.getInt(KEY_ID_STAFF, -1);
    }

    public String getNom() {
        return prefs.getString(KEY_NOM, "");
    }

    public String getPrenom() {
        return prefs.getString(KEY_PRENOM, "");
    }

    public String getEmail() {
        return prefs.getString(KEY_EMAIL, "");
    }

    public String getRole() {
        return prefs.getString(KEY_ROLE, "");
    }

    public String getSpecialite() {
        return prefs.getString(KEY_SPECIALITE, "");
    }

    public void logout() {
        editor.clear();
        editor.apply();
    }
}