import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  PhotoFile,
  CameraRuntimeError,
} from 'react-native-vision-camera';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Text, Button, Icon, Spacer } from '@shared/components';
export interface PhotoVerificationProps {
  onPhotoConfirmed: () => void;
  onSkip?: () => void;
  onCancel: () => void;
  activityName: string;
  activityColor: string;
  isRequired?: boolean;
}
export type CameraPosition = 'front' | 'back';
export function PhotoVerification({
  onPhotoConfirmed,
  onSkip,
  onCancel,
  activityName,
  activityColor,
  isRequired = false,
}: PhotoVerificationProps) {
  const { theme } = useTheme();
  const cameraRef = useRef<Camera>(null);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(cameraPosition);
  const shutterScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);
  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));
  const toggleCameraPosition = useCallback(() => {
    setCameraPosition((prev: CameraPosition) => (prev === 'back' ? 'front' : 'back'));
  }, []);
  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current || isCapturing || !cameraReady) return;
    try {
      setIsCapturing(true);
      shutterScale.value = withSequence(
        withSpring(0.9, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
      flashOpacity.value = withSequence(
        withSpring(0.8, { damping: 20 }),
        withSpring(0, { damping: 20 })
      );
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
        enableShutterSound: true,
      });
      setCapturedPhoto(photo);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      Alert.alert(
        'Eroare',
        'Nu s-a putut captura fotografia. Te rog incearca din nou.'
      );
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, cameraReady, shutterScale, flashOpacity]);
  const recapturePhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);
  const confirmPhoto = useCallback(() => {
    onPhotoConfirmed();
  }, [onPhotoConfirmed]);
  const handleSkip = useCallback(() => {
    if (isRequired) {
      Alert.alert(
        'Verificare Obligatorie',
        'Aceasta activitate necesita verificare prin fotografie pentru a fi completata.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    onSkip?.();
  }, [isRequired, onSkip]);
  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);
  if (!hasPermission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContainer}>
          <View style={[styles.permissionIcon, { backgroundColor: activityColor + '20' }]}>
            <Icon name="camera" size="xl" color={activityColor} />
          </View>
          <Spacer size="lg" />
          <Text variant="h3" align="center">
            Acces la Camera Necesar
          </Text>
          <Spacer size="sm" />
          <Text variant="body" color="textSecondary" align="center" style={styles.permissionText}>
            Pentru a verifica completarea activitatii, aplicatia are nevoie de acces la camera.
            Fotografia nu va fi salvata.
          </Text>
          <Spacer size="xl" />
          <Button
            variant="primary"
            onPress={requestPermission}
            style={{ backgroundColor: activityColor }}
          >
            Permite Accesul
          </Button>
          <Spacer size="md" />
          <Button variant="ghost" onPress={openSettings}>
            Deschide Setarile
          </Button>
          {!isRequired && onSkip && (
            <>
              <Spacer size="md" />
              <Button variant="ghost" onPress={handleSkip}>
                Omite Verificarea
              </Button>
            </>
          )}
          <Spacer size="md" />
          <Button variant="ghost" onPress={onCancel}>
            Anuleaza
          </Button>
        </View>
      </View>
    );
  }
  if (!device) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContainer}>
          <View style={[styles.permissionIcon, { backgroundColor: theme.colors.error + '20' }]}>
            <Icon name="camera" size="xl" color={theme.colors.error} />
          </View>
          <Spacer size="lg" />
          <Text variant="h3" align="center">
            Camera Indisponibila
          </Text>
          <Spacer size="sm" />
          <Text variant="body" color="textSecondary" align="center" style={styles.permissionText}>
            Nu s-a detectat o camera pe acest dispozitiv. Verificarea foto nu este posibila.
          </Text>
          <Spacer size="xl" />
          {!isRequired && onSkip ? (
            <Button
              variant="primary"
              onPress={handleSkip}
              style={{ backgroundColor: activityColor }}
            >
              Continua fara Verificare
            </Button>
          ) : (
            <Button variant="primary" onPress={onCancel} style={{ backgroundColor: activityColor }}>
              Inapoi
            </Button>
          )}
        </View>
      </View>
    );
  }
  if (capturedPhoto) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.previewContainer}>
          {}
          <View style={styles.previewHeader}>
            <Text variant="h3" align="center">
              Confirma Verificarea
            </Text>
            <Spacer size="xs" />
            <Text variant="body" color="textSecondary" align="center">
              {activityName}
            </Text>
          </View>
          <Spacer size="lg" />
          {}
          <View style={[styles.photoPreview, { borderColor: activityColor }]}>
            <Image
              source={{ uri: `file://${capturedPhoto.path}` }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={[styles.verifiedBadge, { backgroundColor: activityColor }]}>
              <Icon name="check" size="sm" color="#fff" />
            </View>
          </View>
          <Spacer size="lg" />
          {}
          <View style={styles.infoBox}>
            <Icon name="info" size="sm" color={theme.colors.textSecondary} />
            <Text
              variant="caption"
              color="textSecondary"
              style={styles.infoText}
            >
              Fotografia este folosita doar pentru verificare si va fi stearsa imediat.
            </Text>
          </View>
          <Spacer size="xl" />
          {}
          <Button
            variant="primary"
            onPress={confirmPhoto}
            style={{ backgroundColor: activityColor }}
          >
            Confirma Verificarea
          </Button>
          <Spacer size="md" />
          <Button variant="outline" onPress={recapturePhoto}>
            Recaptureaza
          </Button>
          <Spacer size="md" />
          <Button variant="ghost" onPress={onCancel}>
            Anuleaza
          </Button>
        </Animated.View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setCameraReady(true)}
        onError={(error: CameraRuntimeError) => {
          console.error('Camera error:', error);
          Alert.alert('Eroare Camera', 'A aparut o eroare la initializarea camerei.');
        }}
      />
      {}
      <Animated.View
        style={[styles.flashOverlay, { backgroundColor: '#fff' }, flashStyle]}
        pointerEvents="none"
      />
      {}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.cameraHeader}
      >
        <View style={styles.headerBackground}>
          <Text variant="body" style={styles.headerText}>
            Captureaza o fotografie pentru a verifica completarea activitatii
          </Text>
          <Text variant="caption" style={styles.headerSubtext}>
            {activityName}
          </Text>
        </View>
      </Animated.View>
      {}
      <View style={styles.cameraControls}>
        {}
        <TouchableOpacity
          style={[styles.sideButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={onCancel}
        >
          <Icon name="close" size="md" color="#fff" />
        </TouchableOpacity>
        {}
        <Animated.View style={shutterStyle}>
          <TouchableOpacity
            style={[styles.captureButton, { borderColor: activityColor }]}
            onPress={capturePhoto}
            disabled={isCapturing || !cameraReady}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.captureButtonInner,
                { backgroundColor: isCapturing ? activityColor : '#fff' },
              ]}
            />
          </TouchableOpacity>
        </Animated.View>
        {}
        <TouchableOpacity
          style={[styles.sideButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={toggleCameraPosition}
        >
          <Icon name="camera" size="md" color="#fff" />
        </TouchableOpacity>
      </View>
      {}
      {!isRequired && onSkip && (
        <View style={styles.skipContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text variant="body" style={styles.skipText}>
              Omite Verificarea
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    maxWidth: 280,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  previewHeader: {
    alignItems: 'center',
  },
  photoPreview: {
    width: 280,
    height: 280,
    borderRadius: 20,
    borderWidth: 4,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    maxWidth: 300,
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerBackground: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  skipContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  skipText: {
    color: '#fff',
  },
});
export default PhotoVerification;
