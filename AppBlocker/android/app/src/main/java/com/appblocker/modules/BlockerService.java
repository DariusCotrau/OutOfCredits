package com.appblocker.modules;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.TextView;

import java.util.Calendar;
import java.util.Map;
import java.util.Set;

/**
 * Foreground Service care monitorizează periodic aplicațiile active
 * și afișează un overlay de blocare când limita de timp este depășită.
 */
public class BlockerService extends Service {

    private static final String CHANNEL_ID = "blocker_channel";
    private static final int NOTIFICATION_ID = 1;
    private static final long CHECK_INTERVAL_MS = 5000; // Verificare la fiecare 5 secunde

    private Handler handler;
    private WindowManager windowManager;
    private TextView overlayView;
    private boolean isOverlayShowing = false;

    // Setate din SharedPreferences la pornirea serviciului
    private Set<String> blockedPackages;
    private long timeLimitMs;

    @Override
    public void onCreate() {
        super.onCreate();
        handler = new Handler(Looper.getMainLooper());
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Citește configurația din SharedPreferences
        loadConfig();

        Notification notification = buildNotification();
        startForeground(NOTIFICATION_ID, notification);

        // Pornește monitorizarea periodică
        handler.post(checkUsageRunnable);

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        handler.removeCallbacks(checkUsageRunnable);
        removeOverlay();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    /**
     * Runnable care se execută periodic pentru a verifica utilizarea aplicațiilor.
     */
    private final Runnable checkUsageRunnable = new Runnable() {
        @Override
        public void run() {
            checkAndBlock();
            handler.postDelayed(this, CHECK_INTERVAL_MS);
        }
    };

    /**
     * Verifică dacă aplicația din foreground a depășit limita de timp
     * și afișează overlay-ul de blocare dacă este cazul.
     */
    private void checkAndBlock() {
        UsageStatsManager usm = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);

        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        long startOfDay = calendar.getTimeInMillis();
        long now = System.currentTimeMillis();

        Map<String, UsageStats> statsMap = usm.queryAndAggregateUsageStats(startOfDay, now);

        for (Map.Entry<String, UsageStats> entry : statsMap.entrySet()) {
            String pkg = entry.getKey();
            UsageStats stats = entry.getValue();

            if (blockedPackages != null && blockedPackages.contains(pkg)) {
                if (stats.getTotalTimeInForeground() >= timeLimitMs) {
                    showOverlay(pkg);
                    return;
                }
            }
        }

        // Dacă nicio aplicație blocată nu a depășit limita, ascundem overlay-ul
        removeOverlay();
    }

    /**
     * Afișează overlay-ul de blocare peste ecranul curent.
     */
    private void showOverlay(String packageName) {
        if (isOverlayShowing) return;

        overlayView = new TextView(this);
        overlayView.setText("Timpul limită a fost atins!\nAplicația " + packageName + " este blocată.");
        overlayView.setGravity(Gravity.CENTER);
        overlayView.setBackgroundColor(0xDD000000); // Negru semi-transparent
        overlayView.setTextColor(0xFFFFFFFF);
        overlayView.setTextSize(24);
        overlayView.setPadding(40, 40, 40, 40);

        int layoutFlag;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutFlag = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutFlag = WindowManager.LayoutParams.TYPE_PHONE;
        }

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        );

        windowManager.addView(overlayView, params);
        isOverlayShowing = true;
    }

    /**
     * Ascunde overlay-ul de blocare.
     */
    private void removeOverlay() {
        if (isOverlayShowing && overlayView != null) {
            windowManager.removeView(overlayView);
            overlayView = null;
            isOverlayShowing = false;
        }
    }

    /**
     * Citește configurația salvată (pachete blocate + limita de timp).
     */
    private void loadConfig() {
        android.content.SharedPreferences prefs = getSharedPreferences("AppBlockerPrefs", MODE_PRIVATE);
        blockedPackages = prefs.getStringSet("blockedPackages", null);
        timeLimitMs = prefs.getLong("timeLimitMs", 3600000); // Default: 1 oră
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "App Blocker Service",
                NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification() {
        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }
        return builder
            .setContentTitle("App Blocker")
            .setContentText("Monitorizare activă a aplicațiilor")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .build();
    }
}
