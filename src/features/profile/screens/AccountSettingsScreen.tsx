import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useUserProfile, useAuthStore, useAuthActions } from '@stores/auth';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Button,
  Input,
  Spacer,
  Icon,
  Divider,
  IconButton,
} from '@shared/components';
import { useForm, required, email, minLength, matchField, compose } from '@shared/hooks';
type ModalType = 'email' | 'password' | 'delete' | null;
interface EmailFormValues {
  newEmail: string;
  password: string;
}
interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
interface DeleteFormValues {
  password: string;
  confirmation: string;
}
function SettingItem({
  icon,
  label,
  value,
  onPress,
  danger = false,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <Icon
          name={icon}
          size="md"
          color={danger ? theme.colors.error : theme.colors.textSecondary}
        />
        <View style={styles.settingText}>
          <Text
            variant="body"
            style={{ color: danger ? theme.colors.error : theme.colors.text }}
          >
            {label}
          </Text>
          {value && (
            <Text variant="caption" color="textSecondary">
              {value}
            </Text>
          )}
        </View>
      </View>
      <Icon name="forward" size="sm" color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );
}
export function AccountSettingsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const profile = useUserProfile();
  const user = useAuthStore((s) => s.user);
  const { isLoading, error } = useAuthStore();
  const { updateEmail, updatePassword, deleteAccount, clearError } = useAuthActions();
  const [modalType, setModalType] = useState<ModalType>(null);
  const emailForm = useForm<EmailFormValues>({
    initialValues: { newEmail: '', password: '' },
    validationRules: {
      newEmail: compose(required('Email is required'), email('Invalid email')),
      password: required('Password is required'),
    },
  });
  const passwordForm = useForm<PasswordFormValues>({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validationRules: {
      currentPassword: required('Current password is required'),
      newPassword: compose(
        required('New password is required'),
        minLength(8, 'Password must be at least 8 characters')
      ),
      confirmPassword: compose(
        required('Please confirm password'),
        matchField<PasswordFormValues>('newPassword', 'Passwords do not match')
      ),
    },
  });
  const deleteForm = useForm<DeleteFormValues>({
    initialValues: { password: '', confirmation: '' },
    validationRules: {
      password: required('Password is required'),
      confirmation: (value) => {
        if (value !== 'DELETE') return 'Please type DELETE to confirm';
        return undefined;
      },
    },
  });
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleChangeEmail = useCallback(() => {
    if (user?.isAnonymous) {
      Alert.alert('Not Available', 'Anonymous accounts cannot change email.');
      return;
    }
    clearError();
    emailForm.reset();
    setModalType('email');
  }, [user?.isAnonymous, clearError, emailForm]);
  const handleChangePassword = useCallback(() => {
    if (user?.isAnonymous) {
      Alert.alert('Not Available', 'Anonymous accounts cannot change password.');
      return;
    }
    clearError();
    passwordForm.reset();
    setModalType('password');
  }, [user?.isAnonymous, clearError, passwordForm]);
  const handleDeleteAccount = useCallback(() => {
    clearError();
    deleteForm.reset();
    setModalType('delete');
  }, [clearError, deleteForm]);
  const closeModal = useCallback(() => {
    setModalType(null);
  }, []);
  const handleEmailSubmit = useCallback(async () => {
    const success = await updateEmail(
      emailForm.values.newEmail,
      emailForm.values.password
    );
    if (success) {
      Alert.alert('Success', 'Your email has been updated.');
      closeModal();
    }
  }, [emailForm.values, updateEmail, closeModal]);
  const handlePasswordSubmit = useCallback(async () => {
    const success = await updatePassword(
      passwordForm.values.currentPassword,
      passwordForm.values.newPassword
    );
    if (success) {
      Alert.alert('Success', 'Your password has been updated.');
      closeModal();
    }
  }, [passwordForm.values, updatePassword, closeModal]);
  const handleDeleteSubmit = useCallback(async () => {
    Alert.alert(
      'Final Confirmation',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAccount(deleteForm.values.password);
            if (success) {
            }
          },
        },
      ]
    );
  }, [deleteForm.values, deleteAccount]);
  const renderModalContent = () => {
    switch (modalType) {
      case 'email':
        return (
          <>
            <Text variant="h4" align="center">
              Change Email
            </Text>
            <Spacer size="md" />
            <Text variant="body" color="textSecondary" align="center">
              Enter your new email and current password
            </Text>
            <Spacer size="lg" />
            {error && (
              <Animated.View
                entering={FadeIn}
                style={[styles.errorBox, { backgroundColor: theme.colors.error + '15' }]}
              >
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                  {error.message}
                </Text>
              </Animated.View>
            )}
            <Input
              label="New Email"
              placeholder="Enter new email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailForm.values.newEmail}
              onChangeText={(t) => emailForm.setValue('newEmail', t)}
              onBlur={() => emailForm.setTouched('newEmail')}
              error={emailForm.touched.newEmail ? emailForm.errors.newEmail?.message : undefined}
            />
            <Spacer size="md" />
            <Input
              label="Current Password"
              placeholder="Enter password"
              secureTextEntry
              value={emailForm.values.password}
              onChangeText={(t) => emailForm.setValue('password', t)}
              onBlur={() => emailForm.setTouched('password')}
              error={emailForm.touched.password ? emailForm.errors.password?.message : undefined}
            />
            <Spacer size="xl" />
            <Button
              onPress={emailForm.handleSubmit(handleEmailSubmit)}
              disabled={!emailForm.isValid || isLoading}
              loading={isLoading}
              fullWidth
            >
              Update Email
            </Button>
          </>
        );
      case 'password':
        return (
          <>
            <Text variant="h4" align="center">
              Change Password
            </Text>
            <Spacer size="lg" />
            {error && (
              <Animated.View
                entering={FadeIn}
                style={[styles.errorBox, { backgroundColor: theme.colors.error + '15' }]}
              >
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                  {error.message}
                </Text>
              </Animated.View>
            )}
            <Input
              label="Current Password"
              placeholder="Enter current password"
              secureTextEntry
              value={passwordForm.values.currentPassword}
              onChangeText={(t) => passwordForm.setValue('currentPassword', t)}
              onBlur={() => passwordForm.setTouched('currentPassword')}
              error={
                passwordForm.touched.currentPassword
                  ? passwordForm.errors.currentPassword?.message
                  : undefined
              }
            />
            <Spacer size="md" />
            <Input
              label="New Password"
              placeholder="Enter new password"
              secureTextEntry
              value={passwordForm.values.newPassword}
              onChangeText={(t) => passwordForm.setValue('newPassword', t)}
              onBlur={() => passwordForm.setTouched('newPassword')}
              error={
                passwordForm.touched.newPassword
                  ? passwordForm.errors.newPassword?.message
                  : undefined
              }
            />
            <Spacer size="md" />
            <Input
              label="Confirm New Password"
              placeholder="Confirm new password"
              secureTextEntry
              value={passwordForm.values.confirmPassword}
              onChangeText={(t) => passwordForm.setValue('confirmPassword', t)}
              onBlur={() => passwordForm.setTouched('confirmPassword')}
              error={
                passwordForm.touched.confirmPassword
                  ? passwordForm.errors.confirmPassword?.message
                  : undefined
              }
            />
            <Spacer size="xl" />
            <Button
              onPress={passwordForm.handleSubmit(handlePasswordSubmit)}
              disabled={!passwordForm.isValid || isLoading}
              loading={isLoading}
              fullWidth
            >
              Update Password
            </Button>
          </>
        );
      case 'delete':
        return (
          <>
            <View style={[styles.dangerIcon, { backgroundColor: theme.colors.error + '15' }]}>
              <Icon name="warning" size="xl" color={theme.colors.error} />
            </View>
            <Spacer size="md" />
            <Text variant="h4" align="center">
              Delete Account
            </Text>
            <Spacer size="sm" />
            <Text variant="body" color="textSecondary" align="center">
              This will permanently delete your account and all associated data.
            </Text>
            <Spacer size="lg" />
            {error && (
              <Animated.View
                entering={FadeIn}
                style={[styles.errorBox, { backgroundColor: theme.colors.error + '15' }]}
              >
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                  {error.message}
                </Text>
              </Animated.View>
            )}
            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={deleteForm.values.password}
              onChangeText={(t) => deleteForm.setValue('password', t)}
              onBlur={() => deleteForm.setTouched('password')}
              error={
                deleteForm.touched.password ? deleteForm.errors.password?.message : undefined
              }
            />
            <Spacer size="md" />
            <Input
              label="Type DELETE to confirm"
              placeholder="DELETE"
              autoCapitalize="characters"
              value={deleteForm.values.confirmation}
              onChangeText={(t) => deleteForm.setValue('confirmation', t)}
              onBlur={() => deleteForm.setTouched('confirmation')}
              error={
                deleteForm.touched.confirmation
                  ? deleteForm.errors.confirmation?.message
                  : undefined
              }
            />
            <Spacer size="xl" />
            <Button
              variant="danger"
              onPress={deleteForm.handleSubmit(handleDeleteSubmit)}
              disabled={!deleteForm.isValid || isLoading}
              loading={isLoading}
              fullWidth
            >
              Delete My Account
            </Button>
          </>
        );
      default:
        return null;
    }
  };
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4">Account Settings</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Security
            </Text>
            <Card variant="outlined" style={styles.settingsCard}>
              <SettingItem
                icon="email"
                label="Email Address"
                value={profile?.email ?? 'No email'}
                onPress={handleChangeEmail}
              />
              <Divider />
              <SettingItem
                icon="lock"
                label="Change Password"
                value="••••••••"
                onPress={handleChangePassword}
              />
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Danger Zone
            </Text>
            <Card variant="outlined" style={styles.settingsCard}>
              <SettingItem
                icon="delete"
                label="Delete Account"
                onPress={handleDeleteAccount}
                danger
              />
            </Card>
            <Spacer size="sm" />
            <Text variant="caption" color="textTertiary">
              Deleting your account will remove all your data permanently.
            </Text>
          </Animated.View>
        </Container>
      </ScrollView>
      <Modal
        visible={modalType !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeArea style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <IconButton icon="close" onPress={closeModal} variant="ghost" size="md" />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Container padding="lg">{renderModalContent()}</Container>
          </ScrollView>
        </SafeArea>
      </Modal>
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
  headerSpacer: {
    width: 48,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalContent: {
    flexGrow: 1,
    paddingTop: 24,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dangerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
export default AccountSettingsScreen;
