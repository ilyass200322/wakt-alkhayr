import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../../utils/theme';
import { useAuthStore } from '../../store/auth.store';
import { useCampaignStore } from '../../store/campaign.store';
import { RootStackParamList, Engagement } from '../../types/models';
import { formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';
import PrimaryButton from '../../components/PrimaryButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout, toggleCreatorMode, updateUser } = useAuthStore();
  const { userEngagements, fetchUserEngagements, campaigns } = useCampaignStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserEngagements(user.id);
    }
  }, [user?.id]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleToggleCreator = () => {
    Alert.alert(
      user?.isCreator ? 'Désactiver le mode créateur' : 'Devenir créateur',
      user?.isCreator
        ? 'Vous ne pourrez plus créer de campagnes'
        : 'En tant que créateur, vous pourrez créer et gérer des campagnes de bienfaisance',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: toggleCreatorMode,
        },
      ]
    );
  };

  const getCampaignTitle = (campaignId: string): string => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.title || 'Campagne inconnue';
  };

  const stats = {
    totalEngagements: userEngagements.length,
    donations: userEngagements.filter(e => e.type === 'donation').length,
    volunteering: userEngagements.filter(e => e.type === 'volunteer').length,
    createdCampaigns: campaigns.filter(c => c.creatorId === user?.id).length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            {user?.isCreator && (
              <View style={styles.creatorBadge}>
                <Ionicons name="star" size={12} color={colors.textInverse} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.isCreator && (
            <View style={styles.creatorTag}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={styles.creatorTagText}>Créateur de campagnes</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="heart" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalEngagements}</Text>
            <Text style={styles.statLabel}>Engagements</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.secondary + '15' }]}>
              <Ionicons name="gift" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{stats.donations}</Text>
            <Text style={styles.statLabel}>Dons</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent + '15' }]}>
              <Ionicons name="people" size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{stats.volunteering}</Text>
            <Text style={styles.statLabel}>Bénévolat</Text>
          </View>
          {user?.isCreator && (
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="flag" size={20} color={colors.success} />
              </View>
              <Text style={styles.statValue}>{stats.createdCampaigns}</Text>
              <Text style={styles.statLabel}>Créées</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes engagements récents</Text>
          {userEngagements.length === 0 ? (
            <View style={styles.emptyEngagements}>
              <Ionicons name="heart-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>Aucun engagement pour le moment</Text>
              <Text style={styles.emptySubtext}>
                Participez à une campagne pour commencer
              </Text>
            </View>
          ) : (
            userEngagements.slice(0, 5).map(engagement => (
              <TouchableOpacity
                key={engagement.id}
                style={styles.engagementCard}
                onPress={() =>
                  navigation.navigate('CampaignDetails', {
                    campaignId: engagement.campaignId,
                  })
                }
              >
                <View
                  style={[
                    styles.engagementIcon,
                    {
                      backgroundColor:
                        engagement.type === 'donation'
                          ? colors.primary + '15'
                          : colors.accent + '15',
                    },
                  ]}
                >
                  <Ionicons
                    name={engagement.type === 'donation' ? 'gift' : 'people'}
                    size={20}
                    color={engagement.type === 'donation' ? colors.primary : colors.accent}
                  />
                </View>
                <View style={styles.engagementInfo}>
                  <Text style={styles.engagementTitle} numberOfLines={1}>
                    {getCampaignTitle(engagement.campaignId)}
                  </Text>
                  <Text style={styles.engagementDetail}>
                    {engagement.type === 'donation' ? 'Don' : 'Bénévolat'} •{' '}
                    {engagement.quantity} unités
                  </Text>
                </View>
                <View
                  style={[
                    styles.engagementStatus,
                    { backgroundColor: getStatusColor(engagement.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.engagementStatusText,
                      { color: getStatusColor(engagement.status) },
                    ]}
                  >
                    {getStatusLabel(engagement.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingSubtitle}>Rappels d'engagements</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textLight}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleToggleCreator}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name="star" size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Mode créateur</Text>
                <Text style={styles.settingSubtitle}>
                  {user?.isCreator ? 'Actif - Gérez vos campagnes' : 'Créez des campagnes'}
                </Text>
              </View>
            </View>
            <Switch
              value={user?.isCreator || false}
              onValueChange={handleToggleCreator}
              trackColor={{ false: colors.border, true: colors.accent + '50' }}
              thumbColor={user?.isCreator ? colors.accent : colors.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: colors.secondary + '15' }]}>
                <Ionicons name="language" size={20} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Langue</Text>
                <Text style={styles.settingSubtitle}>Français</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: colors.textLight + '20' }]}>
                <Ionicons name="help-circle" size={20} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Aide & Support</Text>
                <Text style={styles.settingSubtitle}>FAQ et contact</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: colors.textLight + '20' }]}>
                <Ionicons name="document-text" size={20} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Conditions d'utilisation</Text>
                <Text style={styles.settingSubtitle}>Politique de confidentialité</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <PrimaryButton
            title="Se déconnecter"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            icon={<Ionicons name="log-out-outline" size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Waqt Lkhair v1.0.0</Text>
          <Text style={styles.footerSubtext}>Fait avec ❤️ au Maroc</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.textInverse,
  },
  creatorBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  creatorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  creatorTagText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyEngagements: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  engagementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  engagementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  engagementInfo: {
    flex: 1,
  },
  engagementTitle: {
    ...typography.h4,
    color: colors.text,
  },
  engagementDetail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  engagementStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  engagementStatusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  logoutSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    ...typography.caption,
    color: colors.textLight,
  },
  footerSubtext: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});

export default ProfileScreen;
