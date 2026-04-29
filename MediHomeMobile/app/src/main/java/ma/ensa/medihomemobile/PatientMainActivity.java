package ma.ensa.medihomemobile;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import ma.ensa.medihomemobile.fragments.ContactFragment;
import ma.ensa.medihomemobile.fragments.HomeFragment;
import ma.ensa.medihomemobile.fragments.ProfileFragment;
import ma.ensa.medihomemobile.fragments.VisitFragment;

public class PatientMainActivity extends AppCompatActivity {

    private BottomNavigationView bottomNavigation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_patient_main);

        bottomNavigation = findViewById(R.id.bottomNavigation);

        if (savedInstanceState == null) {
            loadFragment(new HomeFragment());
        }

        bottomNavigation.setOnItemSelectedListener(item -> {
            int id = item.getItemId();

            if (id == R.id.nav_home) {
                return loadFragment(new HomeFragment());
            } else if (id == R.id.nav_profile) {
                return loadFragment(new ProfileFragment());
            } else if (id == R.id.nav_visit) {
                return loadFragment(new VisitFragment());
            } else if (id == R.id.nav_contact) {
                return loadFragment(new ContactFragment());
            }

            return false;
        });
    }

    private boolean loadFragment(Fragment fragment) {
        if (fragment == null) return false;

        getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.fragmentContainer, fragment)
                .commit();

        return true;
    }
}