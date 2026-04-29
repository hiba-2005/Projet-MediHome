package ma.ensa.medihomemobile.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AlphaAnimation;
import android.widget.Button;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import ma.ensa.medihomemobile.R;

public class ContactFragment extends Fragment {

    private Button btnCall, btnEmail, btnMap;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_contact, container, false);

        btnCall = view.findViewById(R.id.btnCall);
        btnEmail = view.findViewById(R.id.btnEmail);
        btnMap = view.findViewById(R.id.btnMap);

        applyFadeAnimation(view);
        setupActions();

        return view;
    }

    private void applyFadeAnimation(View view) {
        AlphaAnimation animation = new AlphaAnimation(0f, 1f);
        animation.setDuration(500);
        view.startAnimation(animation);
    }

    private void setupActions() {
        btnCall.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_DIAL);
            intent.setData(Uri.parse("tel:+212600000000"));
            startActivity(intent);
        });

        btnEmail.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_SENDTO);
            intent.setData(Uri.parse("mailto:contact@medihome.ma"));
            intent.putExtra(Intent.EXTRA_SUBJECT, "Demande d'information MediHome");
            startActivity(intent);
        });

        btnMap.setOnClickListener(v -> {
            Uri uri = Uri.parse("geo:0,0?q=Marrakech,+Maroc");
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(intent);
        });
    }
}