import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useUserProfile, useCurrentUser, useAuthActions } from '@stores/auth';
import {
  SafeArea,
  Container,
  Text,
  Button,
  Input,
  Spacer,
  Icon,
  Avatar,
  IconButton,
} from '@shared/components';
import { useForm, required, minLength, maxLength, compose } from '@shared/hooks';
interface EditProfileFormValues {
  displayName: string;
  bio: string;
}
export function EditProfileScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const profile = useUserProfile();
  const user = useCurrentUser();
  const { updateProfile } = useAuthActions();
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<EditProfileFormValues>({
    initialValues: {
      displayName: profile?.displayName ?? '',
      bio: '',
    },
    validationRules: {
      displayName: compose(
        required('Display name is required'),
        minLength(2, 'Name must be at least 2 characters'),
        maxLength(50, 'Name must be at most 50 characters')
      ),
      bio: maxLength(150, 'Bio must be at most 150 characters'),
    },
    validateOnBlur: true,
  });
  const handleSave = useCallback(async () => {
    if (!form.isValid) return;
    setIsSaving(true);
    try {
      const success = await updateProfile({
        displayName: form.values.displayName,
      });
      if (success) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  }, [form.values, form.isValid, updateProfile, navigation]);
  const handleBack = useCallback(() => {
    if (form.isDirty) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [form.isDirty, navigation]);
  const handleChangePhoto = useCallback(() => {
    Alert.alert(
      'Change Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => console.log('Take photo') },
        { text: 'Choose from Library', onPress: () => console.log('Choose photo') },
        { text: 'Remove Photo', style: 'destructive', onPress: () => console.log('Remove photo') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton
          icon="close"
          onPress={handleBack}
          variant="ghost"
          size="md"
        />
        <Text variant="h4">Edit Profile</Text>
        <Button
          variant="ghost"
          size="sm"
          onPress={handleSave}
          disabled={!form.isDirty || !form.isValid || isSaving}
          loading={isSaving}
        >
          Save
        </Button>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Container padding="lg">
            <Animated.View
              entering={FadeInDown.duration(400)}
              style={styles.photoSection}
            >
              <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8}>
                <Avatar
                  size="xl"
                  source={profile?.photoURL ? { uri: profile.photoURL } : undefined}
                  name={form.values.displayName || profile?.displayName}
                />
                <View
                  style={[
                    styles.cameraButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Icon name="camera" size="sm" color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Spacer size="sm" />
              <TouchableOpacity onPress={handleChangePhoto}>
                <Text variant="body" color="primary">
                  Change Photo
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <Spacer size="xl" />
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <Input
                label="Display Name"
                placeholder="Enter your name"
                autoCapitalize="words"
                returnKeyType="next"
                value={form.values.displayName}
                onChangeText={(text) => form.setValue('displayName', text)}
                onBlur={() => form.setTouched('displayName')}
                error={
                  form.touched.displayName
                    ? form.errors.displayName?.message
                    : undefined
                }
                maxLength={50}
              />
              <Spacer size="md" />
              <Input
                label="Bio"
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={form.values.bio}
                onChangeText={(text) => form.setValue('bio', text)}
                onBlur={() => form.setTouched('bio')}
                error={form.touched.bio ? form.errors.bio?.message : undefined}
                maxLength={150}
                style={styles.bioInput}
              />
              <Text
                variant="caption"
                color="textTertiary"
                style={styles.charCount}
              >
                {form.values.bio.length}/150
              </Text>
            </Animated.View>
            <Spacer size="xl" />
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <Text variant="label" color="textSecondary" style={styles.label}>
                Email
              </Text>
              <View
                style={[
                  styles.readOnlyField,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text variant="body" color="textSecondary">
                  {profile?.email ?? 'No email'}
                </Text>
                {!user?.isAnonymous && (
                  <Icon name="lock" size="sm" color={theme.colors.textTertiary} />
                )}
              </View>
              <Text variant="caption" color="textTertiary" style={styles.helperText}>
                Email can be changed in Account Settings
              </Text>
            </Animated.View>
            <Spacer size="xl" />
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Text variant="label" color="textSecondary" style={styles.label}>
                Account Information
              </Text>
              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" color="textSecondary">
                    Member since
                  </Text>
                  <Text variant="bodySmall">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </Text>
                </View>
                <View style={[styles.infoRow, styles.infoRowLast]}>
                  <Text variant="bodySmall" color="textSecondary">
                    Account type
                  </Text>
                  <Text variant="bodySmall">
                    {user?.isAnonymous
                      ? 'Anonymous'
                      : profile?.subscription?.isPremium
                      ? 'Premium'
                      : 'Free'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  photoSection: {
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bioInput: {
    height: 80,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 4,
  },
  label: {
    marginBottom: 8,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 4,
  },
  infoCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
});
export default EditProfileScreen;
