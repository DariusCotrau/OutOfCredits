package com.appblocker.modules;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

/**
 * BroadcastReceiver care repornește BlockerService după boot-ul dispozitivului.
 * Verifică dacă existau reguli active înainte de restart.
 */
public class BootCompletedReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE);
        boolean wasActive = prefs.getBoolean("serviceActive", false);

        if (!wasActive) {
            return;
        }

        // Repornește serviciul doar dacă era activ înainte de reboot
        Intent serviceIntent = new Intent(context, BlockerService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }
}
