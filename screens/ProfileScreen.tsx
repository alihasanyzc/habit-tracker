import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import ProfileThemeCard from '../components/ProfileThemeCard';
import {
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';
import { useLanguage, type AppLanguage } from '../providers/LanguageProvider';

const LANG_OPTIONS: Array<{ value: AppLanguage; label: string }> = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' },
];

export default function ProfileScreen() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { t, language, setLanguage } = useLanguage();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [editingSection, setEditingSection] = useState<'profile' | 'security' | null>(null);

  const PROFILE_FIELDS = useMemo(() => [
    { icon: 'user' as const, label: t('profile.fullName'), key: 'name' as const, placeholder: t('profile.fullNamePlaceholder'), keyboard: 'default' as const },
    { icon: 'mail' as const, label: t('profile.email'), key: 'email' as const, placeholder: t('profile.emailPlaceholder'), keyboard: 'email-address' as const },
    { icon: 'phone' as const, label: t('profile.phone'), key: 'phone' as const, placeholder: t('profile.phonePlaceholder'), keyboard: 'phone-pad' as const },
  ], [t]);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const updateField = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleCancel = () => {
    setEditingSection(null);
  };

  const handleSave = () => {
    // TODO: persist
    setEditingSection(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={t('profile.profile')} subtitle={t('profile.subtitle')} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.basicInfo')}</Text>
            <TouchableOpacity
              onPress={() => setEditingSection(editingSection === 'profile' ? null : 'profile')}
              hitSlop={8}
            >
              <Feather
                name={editingSection === 'profile' ? 'x' : 'edit-2'}
                size={16}
                color={colors.muted}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {PROFILE_FIELDS.map((field, index) => (
              <View
                key={field.label}
                style={[
                  styles.row,
                  editingSection === 'profile' && styles.rowEditing,
                  index < PROFILE_FIELDS.length - 1 && styles.rowBorder,
                ]}
              >
                <View style={[styles.rowIcon, editingSection === 'profile' && styles.rowIconEditing]}>
                  <Feather name={field.icon} size={16} color={colors.orange} />
                </View>

                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>{field.label}</Text>
                  {editingSection === 'profile' ? (
                    <TextInput
                      value={form[field.key]}
                      onChangeText={(v) => updateField(field.key, v)}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.muted}
                      keyboardType={field.keyboard}
                      autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                      style={styles.input}
                    />
                  ) : (
                    <Text style={[styles.rowValue, form[field.key] && styles.rowValueFilled]}>
                      {form[field.key] || t('profile.notAdded')}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {editingSection === 'profile' && (
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.appearance')}</Text>
          <ProfileThemeCard />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('profile.security')}</Text>
            <TouchableOpacity
              onPress={() => setEditingSection(editingSection === 'security' ? null : 'security')}
              hitSlop={8}
            >
              <Feather
                name={editingSection === 'security' ? 'x' : 'edit-2'}
                size={16}
                color={colors.muted}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {editingSection === 'security' ? (
              <>
                <View style={[styles.row, styles.rowEditing, styles.rowBorder]}>
                  <View style={[styles.rowIcon, styles.rowIconEditing]}>
                    <Feather name="lock" size={16} color={colors.orange} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowLabel}>{t('profile.currentPassword')}</Text>
                    <TextInput
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder={t('profile.currentPasswordPlaceholder')}
                      placeholderTextColor={colors.muted}
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                </View>
                <View style={[styles.row, styles.rowEditing]}>
                  <View style={[styles.rowIcon, styles.rowIconEditing]}>
                    <Feather name="key" size={16} color={colors.orange} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowLabel}>{t('profile.newPassword')}</Text>
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder={t('profile.newPasswordPlaceholder')}
                      placeholderTextColor={colors.muted}
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                    <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>{t('common.save')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Feather name="lock" size={16} color={colors.orange} />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>{t('profile.password')}</Text>
                  <Text style={styles.rowValue}>••••••••</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          <View style={styles.listCard}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Feather name="globe" size={16} color={colors.orange} />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowLabel}>{t('profile.language')}</Text>
              </View>
              <View style={styles.langToggle}>
                {LANG_OPTIONS.map((option) => {
                  const selected = option.value === language;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => void setLanguage(option.value)}
                      activeOpacity={0.7}
                      style={[styles.langBtn, selected && styles.langBtnSelected]}
                    >
                      <Text style={[styles.langBtnLabel, selected && styles.langBtnLabelSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 18,
    },
    section: {
      gap: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.muted,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowEditing: {
      alignItems: 'flex-start',
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    rowIconEditing: {
      marginTop: 23,
    },
    rowCopy: {
      flex: 1,
    },
    rowLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    rowValue: {
      marginTop: 2,
      fontSize: 13,
      color: colors.muted,
    },
    rowValueFilled: {
      color: colors.text,
    },
    input: {
      marginTop: 4,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center' as const,
    },
    cancelBtnText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.muted,
    },
    saveBtn: {
      flex: 1,
      backgroundColor: colors.orange,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center' as const,
    },
    saveBtnText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: '#fff',
    },
    langToggle: {
      flexDirection: 'row' as const,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      padding: 3,
      gap: 2,
    },
    langBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    langBtnSelected: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#F2E2D4',
    },
    langBtnLabel: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.muted,
    },
    langBtnLabelSelected: {
      color: colors.orange,
    },
  });
}
