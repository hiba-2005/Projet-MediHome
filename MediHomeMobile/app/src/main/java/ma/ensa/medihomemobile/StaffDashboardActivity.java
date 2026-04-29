package ma.ensa.medihomemobile;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import ma.ensa.medihomemobile.fragments.StaffHomeFragment;
import ma.ensa.medihomemobile.fragments.StaffVisitsFragment;

public class StaffDashboardActivity extends AppCompatActivity {

    private BottomNavigationView bottomNavigationView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_staff_dashboard);

        bottomNavigationView = findViewById(R.id.bottomNavigationView);

        loadFragment(new StaffHomeFragment());

        bottomNavigationView.setOnItemSelectedListener(item -> {
            int id = item.getItemId();

            if (id == R.id.nav_staff_home) {
                loadFragment(new StaffHomeFragment());
                return true;
            } else if (id == R.id.nav_staff_visits) {
                loadFragment(new StaffVisitsFragment());
                return true;
            }

            return false;
        });
    }

    private void loadFragment(@NonNull Fragment fragment) {
        getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.staffFragmentContainer, fragment)
                .commit();
    }
}