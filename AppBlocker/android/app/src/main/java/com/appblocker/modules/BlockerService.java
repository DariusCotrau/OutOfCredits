package com.appblocker.modules;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.appblocker.R;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

/**
 * Foreground Service care monitorizează periodic aplicațiile active
 * și afișează un overlay de blocare când limita de timp este depășită.
 *
 * Suportă:
 * - Limite de timp diferite per aplicație
 * - Detecție real-time a aplicației din foreground
 * - Notificări de avertizare la 80% din limită
 * - Overlay custom cu layout XML și animație
 * - Lifecycle corect (restart după kill, START_STICKY)
 */
public class BlockerService extends Service {

    private static final String CHANNEL_ID = "blocker_channel";
    private static final String WARNING_CHANNEL_ID = "warning_channel";
    private static final int NOTIFICATION_ID = 1;
    private static final int WARNING_NOTIFICATION_BASE_ID = 1000;
    private static final long CHECK_INTERVAL_MS = 5000;
    private static final double WARNING_THRESHOLD = 0.80;

    private Handler handler;
    private WindowManager windowManager;
    private View overlayView;
    private boolean isOverlayShowing = false;
    private String currentlyBlockedPackage = null;

    // Limite per-aplicație: packageName -> timeLimitMs
    private Map<String, Long> packageLimits = new HashMap<>();
    // Fallback: limită globală dacă nu există limite per-app
    private long globalTimeLimitMs;
    // Set de pachete blocate (pentru compatibilitate cu formatul vechi)
    private Set<String> blockedPackages = new HashSet<>();
    // Tracking pentru notificări de avertizare (să nu trimitem de mai multe ori)
    private Set<String> warnedPackages = new HashSet<>();

    @Override
    public void onCreate() {
        super.onCreate();
        handler = new Handler(Looper.getMainLooper());
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        createNotificationChannels();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Gestionare acțiune extindere limită din notificare
        if (intent != null && "ACTION_EXTEND_LIMIT".equals(intent.getAction())) {
            String pkg = intent.getStringExtra("packageName");
            int extraMin = intent.getIntExtra("extraMinutes", 15);
            if (pkg != null) {
                handleExtendLimit(pkg, extraMin);
            }
            return START_STICKY;
        }

        loadConfig();

        // Marchează serviciul ca activ (pentru BootCompletedReceiver)
        SharedPreferences prefs = getSharedPreferences("AppBlockerPrefs", MODE_PRIVATE);
        prefs.edit().putBoolean("serviceActive", true).apply();

        Notification notification = buildNotification();
        startForeground(NOTIFICATION_ID, notification);

        // Resetează avertizările la pornire
        warnedPackages.clear();

        handler.removeCallbacks(checkUsageRunnable);
        handler.post(checkUsageRunnable);

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        handler.removeCallbacks(checkUsageRunnable);
        removeOverlay();

        // Marchează serviciul ca inactiv
        SharedPreferences prefs = getSharedPreferences("AppBlockerPrefs", MODE_PRIVATE);
        prefs.edit().putBoolean("serviceActive", false).apply();
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
     * Detectează aplicația curentă din foreground folosind UsageEvents (real-time).
     * Returnează packageName sau null dacă nu se poate determina.
     */
    private String getCurrentForegroundApp() {
        UsageStatsManager usm = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
        long now = System.currentTimeMillis();
        // Căutăm în ultimele 10 secunde
        UsageEvents events = usm.queryEvents(now - 10000, now);

        String foregroundApp = null;
        UsageEvents.Event event = new UsageEvents.Event();

        while (events.hasNextEvent()) {
            events.getNextEvent(event);
            if (event.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                foregroundApp = event.getPackageName();
            }
        }

        return foregroundApp;
    }

    /**
     * Verifică dacă aplicația din foreground a depășit limita de timp
     * și afișează overlay-ul de blocare dacă este cazul.
     * Trimite notificări de avertizare la 80% din limită.
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

        // Detectare aplicație din foreground (real-time)
        String foregroundApp = getCurrentForegroundApp();

        // Verificare pentru notificări de avertizare (80%) și blocare per-app
        for (String pkg : blockedPackages) {
            UsageStats stats = statsMap.get(pkg);
            if (stats == null) continue;

            long usedTime = stats.getTotalTimeInForeground();
            long limitMs = getLimitForPackage(pkg);

            // Notificare de avertizare la 80%
            if (usedTime >= (long)(limitMs * WARNING_THRESHOLD) && usedTime < limitMs) {
                if (!warnedPackages.contains(pkg)) {
                    sendWarningNotification(pkg, usedTime, limitMs);
                    warnedPackages.add(pkg);
                }
            }

            // Blocare dacă limita e depășită și aplicația e în foreground
            if (usedTime >= limitMs) {
                if (foregroundApp != null && foregroundApp.equals(pkg)) {
                    showOverlay(pkg, usedTime, limitMs);
                    return;
                }
            }
        }

        // Dacă nicio aplicație blocată nu e în foreground sau nu a depășit limita
        removeOverlay();
    }

    /**
     * Obține limita de timp pentru un pachet specific.
     * Folosește limita per-app dacă există, altfel limita globală.
     */
    private long getLimitForPackage(String packageName) {
        if (packageLimits.containsKey(packageName)) {
            return packageLimits.get(packageName);
        }
        return globalTimeLimitMs;
    }

    /**
     * Obține numele vizibil al unei aplicații după packageName.
     */
    private String getAppName(String packageName) {
        try {
            PackageManager pm = getPackageManager();
            ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
            return pm.getApplicationLabel(appInfo).toString();
        } catch (PackageManager.NameNotFoundException e) {
            return packageName;
        }
    }

    /**
     * Afișează overlay-ul custom de blocare cu layout XML și animație.
     */
    private void showOverlay(String packageName, long usedTimeMs, long limitMs) {
        if (isOverlayShowing) {
            // Dacă overlay-ul e deja afișat pentru altă aplicație, actualizăm textul
            if (!packageName.equals(currentlyBlockedPackage)) {
                updateOverlayText(packageName, usedTimeMs, limitMs);
                currentlyBlockedPackage = packageName;
            }
            return;
        }

        LayoutInflater inflater = LayoutInflater.from(this);
        overlayView = inflater.inflate(R.layout.overlay_blocker, null);

        // Setare texte
        updateOverlayText(packageName, usedTimeMs, limitMs);

        // Buton "Întoarcere la AppBlocker"
        Button btnOpen = overlayView.findViewById(R.id.btn_open_appblocker);
        btnOpen.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openAppBlocker();
            }
        });

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
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        );

        windowManager.addView(overlayView, params);
        isOverlayShowing = true;
        currentlyBlockedPackage = packageName;

        // Animație de apariție
        Animation fadeIn = AnimationUtils.loadAnimation(this, R.anim.overlay_fade_in);
        overlayView.startAnimation(fadeIn);
    }

    /**
     * Actualizează textul overlay-ului cu informații despre aplicația blocată.
     */
    private void updateOverlayText(String packageName, long usedTimeMs, long limitMs) {
        if (overlayView == null) return;

        String appName = getAppName(packageName);
        long usedMinutes = usedTimeMs / 60000;
        long limitMinutes = limitMs / 60000;

        TextView titleView = overlayView.findViewById(R.id.overlay_title);
        titleView.setText("Timpul limită a fost atins!");

        TextView messageView = overlayView.findViewById(R.id.overlay_message);
        messageView.setText("Aplicația " + appName + " este blocată.");

        TextView timeInfoView = overlayView.findViewById(R.id.overlay_time_info);
        timeInfoView.setText("Utilizat: " + usedMinutes + " min / Limită: " + limitMinutes + " min");
    }

    /**
     * Deschide activitatea principală AppBlocker.
     */
    private void openAppBlocker() {
        Intent intent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
        }
    }

    /**
     * Ascunde overlay-ul de blocare.
     */
    private void removeOverlay() {
        if (isOverlayShowing && overlayView != null) {
            windowManager.removeView(overlayView);
            overlayView = null;
            isOverlayShowing = false;
            currentlyBlockedPackage = null;
        }
    }

    /**
     * Trimite o notificare de avertizare când utilizarea atinge 80% din limită.
     * Include acțiuni: extindere limită cu 15 min și deschidere AppBlocker.
     */
    private void sendWarningNotification(String packageName, long usedTimeMs, long limitMs) {
        String appName = getAppName(packageName);
        long remainingMinutes = (limitMs - usedTimeMs) / 60000;

        // Intent pentru extinderea limitei cu 15 minute
        Intent extendIntent = new Intent(this, BlockerService.class);
        extendIntent.setAction("ACTION_EXTEND_LIMIT");
        extendIntent.putExtra("packageName", packageName);
        extendIntent.putExtra("extraMinutes", 15);
        PendingIntent extendPendingIntent = PendingIntent.getService(
            this,
            packageName.hashCode(),
            extendIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Intent pentru deschiderea AppBlocker
        Intent openIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent openPendingIntent = PendingIntent.getActivity(
            this,
            packageName.hashCode() + 1,
            openIntent != null ? openIntent : new Intent(),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, WARNING_CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }

        Notification notification = builder
            .setContentTitle("Avertizare: " + appName)
            .setContentText("Mai ai ~" + remainingMinutes + " min. Limita se apropie!")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setAutoCancel(true)
            .addAction(new Notification.Action.Builder(
                null, "Extinde +15 min", extendPendingIntent
            ).build())
            .addAction(new Notification.Action.Builder(
                null, "Deschide AppBlocker", openPendingIntent
            ).build())
            .build();

        NotificationManager notifManager = getSystemService(NotificationManager.class);
        int notifId = WARNING_NOTIFICATION_BASE_ID + Math.abs(packageName.hashCode() % 500);
        notifManager.notify(notifId, notification);
    }

    /**
     * Citește configurația salvată (pachete blocate + limite de timp).
     * Suportă atât formatul vechi (limită globală) cât și cel nou (per-app JSON).
     */
    private void loadConfig() {
        SharedPreferences prefs = getSharedPreferences("AppBlockerPrefs", MODE_PRIVATE);

        // Încarcă limita globală (fallback)
        globalTimeLimitMs = prefs.getLong("timeLimitMs", 3600000);

        // Încarcă pachetele blocate
        blockedPackages.clear();
        packageLimits.clear();

        // Formatul nou: JSON cu limite per-app
        String limitsJson = prefs.getString("packageLimitsJson", null);
        if (limitsJson != null) {
            try {
                JSONObject json = new JSONObject(limitsJson);
                Iterator<String> keys = json.keys();
                while (keys.hasNext()) {
                    String pkg = keys.next();
                    long limitMs = json.getLong(pkg);
                    packageLimits.put(pkg, limitMs);
                    blockedPackages.add(pkg);
                }
            } catch (JSONException e) {
                // Fallback la formatul vechi
            }
        }

        // Formatul vechi: StringSet cu limită globală
        if (blockedPackages.isEmpty()) {
            Set<String> oldPackages = prefs.getStringSet("blockedPackages", null);
            if (oldPackages != null) {
                blockedPackages.addAll(oldPackages);
            }
        }
    }

    /**
     * Gestionează acțiunea de extindere a limitei din notificare.
     */
    private void handleExtendLimit(String packageName, int extraMinutes) {
        long extraMs = (long) extraMinutes * 60 * 1000;

        SharedPreferences prefs = getSharedPreferences("AppBlockerPrefs", MODE_PRIVATE);

        // Actualizează limita per-app
        if (packageLimits.containsKey(packageName)) {
            long currentLimit = packageLimits.get(packageName);
            packageLimits.put(packageName, currentLimit + extraMs);

            // Salvează în SharedPreferences
            JSONObject json = new JSONObject(packageLimits);
            prefs.edit().putString("packageLimitsJson", json.toString()).apply();
        } else {
            // Extinde limita globală
            globalTimeLimitMs += extraMs;
            prefs.edit().putLong("timeLimitMs", globalTimeLimitMs).apply();
        }

        // Permite re-avertizare
        warnedPackages.remove(packageName);

        // Anulează notificarea de avertizare
        NotificationManager notifManager = getSystemService(NotificationManager.class);
        int notifId = WARNING_NOTIFICATION_BASE_ID + Math.abs(packageName.hashCode() % 500);
        notifManager.cancel(notifId);
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);

            // Canal pentru serviciul foreground
            NotificationChannel serviceChannel = new NotificationChannel(
                CHANNEL_ID,
                "App Blocker Service",
                NotificationManager.IMPORTANCE_LOW
            );
            manager.createNotificationChannel(serviceChannel);

            // Canal pentru avertizări (cu sunet/vibrație)
            NotificationChannel warningChannel = new NotificationChannel(
                WARNING_CHANNEL_ID,
                "Avertizări limită de timp",
                NotificationManager.IMPORTANCE_HIGH
            );
            warningChannel.setDescription("Notificări când te apropii de limita de timp");
            manager.createNotificationChannel(warningChannel);
        }
    }

    private Notification buildNotification() {
        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }

        int activeCount = blockedPackages.size();
        return builder
            .setContentTitle("App Blocker")
            .setContentText("Monitorizare activă — " + activeCount + " aplicații urmărite")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setOngoing(true)
            .build();
    }
}
