package com.appblocker.modules;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.provider.Settings;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.Calendar;
import java.util.List;
import java.util.Map;

/**
 * Modul nativ care accesează UsageStatsManager pentru a obține
 * timpul de utilizare al fiecărei aplicații.
 */
public class AppUsageModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public AppUsageModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return "AppUsageModule";
    }

    /**
     * Verifică dacă permisiunea USAGE_ACCESS este acordată.
     */
    @ReactMethod
    public void hasUsagePermission(Promise promise) {
        try {
            AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
            int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.getPackageName()
            );
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Deschide setările pentru a acorda permisiunea Usage Access.
     */
    @ReactMethod
    public void requestUsagePermission() {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    /**
     * Returnează statisticile de utilizare pentru ziua curentă.
     * Fiecare intrare conține: packageName, appName, totalTimeInForeground (ms).
     */
    @ReactMethod
    public void getTodayUsageStats(Promise promise) {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager)
                reactContext.getSystemService(Context.USAGE_STATS_SERVICE);

            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            long startOfDay = calendar.getTimeInMillis();
            long now = System.currentTimeMillis();

            Map<String, UsageStats> statsMap = usageStatsManager.queryAndAggregateUsageStats(startOfDay, now);
            PackageManager pm = reactContext.getPackageManager();

            WritableArray result = Arguments.createArray();

            for (Map.Entry<String, UsageStats> entry : statsMap.entrySet()) {
                UsageStats stats = entry.getValue();
                if (stats.getTotalTimeInForeground() == 0) continue;

                WritableMap appData = Arguments.createMap();
                appData.putString("packageName", stats.getPackageName());

                String appName;
                try {
                    ApplicationInfo appInfo = pm.getApplicationInfo(stats.getPackageName(), 0);
                    appName = pm.getApplicationLabel(appInfo).toString();
                } catch (PackageManager.NameNotFoundException e) {
                    appName = stats.getPackageName();
                }

                appData.putString("appName", appName);
                appData.putDouble("totalTimeInForeground", stats.getTotalTimeInForeground());
                result.pushMap(appData);
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Returnează lista tuturor aplicațiilor instalate (non-sistem).
     */
    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            List<ApplicationInfo> apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);

            WritableArray result = Arguments.createArray();

            for (ApplicationInfo app : apps) {
                // Filtrăm aplicațiile de sistem
                if ((app.flags & ApplicationInfo.FLAG_SYSTEM) != 0) continue;

                WritableMap appData = Arguments.createMap();
                appData.putString("packageName", app.packageName);
                appData.putString("appName", pm.getApplicationLabel(app).toString());
                result.pushMap(appData);
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
