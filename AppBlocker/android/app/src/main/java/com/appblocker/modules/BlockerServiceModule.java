package com.appblocker.modules;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.Context;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

/**
 * Bridge React Native pentru controlul BlockerService.
 * Permite pornirea/oprirea serviciului și configurarea din JS.
 * Suportă atât limită globală (metoda veche) cât și limite per-app.
 */
public class BlockerServiceModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public BlockerServiceModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return "BlockerServiceModule";
    }

    /**
     * Pornește blocarea cu o limită globală de timp (compatibilitate cu API-ul vechi).
     *
     * @param packageNames Array de package names de blocat
     * @param timeLimitMinutes Limita de timp în minute (aceeași pentru toate)
     */
    @ReactMethod
    public void startBlocking(ReadableArray packageNames, int timeLimitMinutes, Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();

            Set<String> packages = new HashSet<>();
            for (int i = 0; i < packageNames.size(); i++) {
                packages.add(packageNames.getString(i));
            }

            editor.putStringSet("blockedPackages", packages);
            editor.putLong("timeLimitMs", (long) timeLimitMinutes * 60 * 1000);
            // Șterge limitele per-app pentru a folosi limita globală
            editor.remove("packageLimitsJson");
            editor.apply();

            startService();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Pornește blocarea cu limite de timp diferite per aplicație.
     *
     * @param packageLimits ReadableMap: { "com.instagram.android": 30, "com.tiktok": 15, ... }
     *                      unde valorile sunt minute
     */
    @ReactMethod
    public void startBlockingWithLimits(ReadableMap packageLimits, Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();

            JSONObject limitsJson = new JSONObject();
            Set<String> packages = new HashSet<>();

            ReadableMapKeySetIterator iterator = packageLimits.keySetIterator();
            while (iterator.hasNextKey()) {
                String pkg = iterator.nextKey();
                int minutes = packageLimits.getInt(pkg);
                long limitMs = (long) minutes * 60 * 1000;
                limitsJson.put(pkg, limitMs);
                packages.add(pkg);
            }

            editor.putString("packageLimitsJson", limitsJson.toString());
            editor.putStringSet("blockedPackages", packages);
            editor.apply();

            startService();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Oprește BlockerService.
     */
    @ReactMethod
    public void stopBlocking(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, BlockerService.class);
            reactContext.stopService(serviceIntent);

            // Marchează ca inactiv
            SharedPreferences prefs = reactContext.getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE);
            prefs.edit().putBoolean("serviceActive", false).apply();

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Verifică dacă serviciul de blocare este activ.
     */
    @ReactMethod
    public void isServiceRunning(Promise promise) {
        try {
            android.app.ActivityManager manager =
                (android.app.ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
            for (android.app.ActivityManager.RunningServiceInfo service :
                    manager.getRunningServices(Integer.MAX_VALUE)) {
                if (BlockerService.class.getName().equals(service.service.getClassName())) {
                    promise.resolve(true);
                    return;
                }
            }
            promise.resolve(false);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Pornește serviciul de blocare.
     */
    private void startService() {
        Intent serviceIntent = new Intent(reactContext, BlockerService.class);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            reactContext.startForegroundService(serviceIntent);
        } else {
            reactContext.startService(serviceIntent);
        }
    }
}
