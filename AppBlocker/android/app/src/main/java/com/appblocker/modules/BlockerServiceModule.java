package com.appblocker.modules;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.Context;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

import java.util.HashSet;
import java.util.Set;

/**
 * Bridge React Native pentru controlul BlockerService.
 * Permite pornirea/oprirea serviciului și configurarea din JS.
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
     * Salvează lista de pachete blocate și limita de timp în SharedPreferences,
     * apoi pornește BlockerService.
     *
     * @param packageNames Array de package names de blocat
     * @param timeLimitMinutes Limita de timp în minute
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
            editor.apply();

            Intent serviceIntent = new Intent(reactContext, BlockerService.class);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }

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
}
