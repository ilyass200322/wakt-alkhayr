import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../../utils/theme';
import { useCampaignStore } from '../../store/campaign.store';
import { useAuthStore } from '../../store/auth.store';
import { RootStackParamList, Need, CollectionPoint, CampaignUpdate } from '../../types/models';
import {
  formatDate,
  formatRelativeTime,
  getCategoryLabel,
  getCategoryColor,
  getCategoryIcon,
  getStatusLabel,
  getStatusColor,
  calculateProgress,
  getNeedTypeLabel,
  getNeedTypeIcon,
} from '../../utils/helpers';
import ProgressBar from '../../components/ProgressBar';
import PrimaryButton from '../../components/PrimaryButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'CampaignDetails'>;

const CampaignDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { campaignId } = route.params;

  const { user } = useAuthStore();
  const {
    selectedCampaign,
    isLoading,
    fetchCampaignById,
    deleteCampaign,
    addCampaignUpdate,
  } = useCampaignStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');

  useEffect(() => {
    fetchCampaignById(campaignId);
  }, [campaignId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCampaignById(campaignId);
    setRefreshing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la campagne',
      'Êtes-vous sûr de vouloir supprimer cette campagne ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteCampaign(campaignId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handlePostUpdate = async () => {
    if (!updateTitle.trim() || !updateContent.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    await addCampaignUpdate(campaignId, {
      campaignId,
      title: updateTitle,
      content: updateContent,
    });

    setUpdateTitle('');
    setUpdateContent('');
    setShowUpdateModal(false);
  };

  if (!selectedCampaign) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  const campaign = selectedCampaign;
  const isCreator = user?.id === campaign.creatorId || user?.isCreator;
  const categoryColor = getCategoryColor(campaign.category);
  const statusColor = getStatusColor(campaign.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {campaign.title}
        </Text>
        {isCreator && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateCampaign', { campaignId: campaign.id })}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.heroSection, { backgroundColor: categoryColor }]}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <View style={styles.categoryBadge}>
                <Ionicons
                  name={getCategoryIcon(campaign.category) as any}
                  size={14}
                  color={colors.textInverse}
                />
                <Text style={styles.categoryBadgeText}>
                  {getCategoryLabel(campaign.category)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusBadgeText}>
                  {getStatusLabel(campaign.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{campaign.title}</Text>
            <Text style={styles.heroCreator}>
              Par {campaign.creatorName}
            </Text>
          </View>
        </View>

        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <View>
              <Text style={styles.infoCardLabel}>Début</Text>
              <Text style={styles.infoCardValue}>{formatDate(campaign.startDate)}</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="flag" size={20} color={colors.accent} />
            <View>
              <Text style={styles.infoCardLabel}>Fin</Text>
              <Text style={styles.infoCardValue}>{formatDate(campaign.endDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{campaign.description}</Text>
          <View style={styles.objectiveBox}>
            <Ionicons name="bulb" size={20} color={colors.accent} />
            <Text style={styles.objectiveText}>{campaign.objective}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Besoins</Text>
            <Text style={styles.needsCount}>
              {campaign.needs.length} besoin{campaign.needs.length > 1 ? 's' : ''}
            </Text>
          </View>

          {campaign.needs.map((need: Need) => {
            const progress = calculateProgress(need);
            return (
              <TouchableOpacity
                key={need.id}
                style={styles.needCard}
                onPress={() =>
                  navigation.navigate('Engagement', {
                    campaignId: campaign.id,
                    needId: need.id,
                  })
                }
              >
                <View style={styles.needHeader}>
                  <View style={[styles.needTypeIcon, { backgroundColor: categoryColor + '15' }]}>
                    <Ionicons
                      name={getNeedTypeIcon(need.type) as any}
                      size={20}
                      color={categoryColor}
                    />
                  </View>
                  <View style={styles.needInfo}>
                    <Text style={styles.needLabel}>{need.label}</Text>
                    <Text style={styles.needType}>{getNeedTypeLabel(need.type)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </View>
                <ProgressBar
                  progress={progress}
                  current={need.quantityFulfilled}
                  total={need.quantityRequired}
                  unit={need.unit}
                  color={categoryColor}
                  height={10}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {campaign.collectionPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Points de collecte</Text>
            {campaign.collectionPoints.map((point: CollectionPoint) => (
              <View key={point.id} style={styles.pointCard}>
                <View style={[styles.pointIcon, { backgroundColor: point.type === 'collection' ? colors.primary + '15' : colors.accent + '15' }]}>
                  <Ionicons
                    name={point.type === 'collection' ? 'arrow-down-circle' : 'arrow-up-circle'}
                    size={24}
                    color={point.type === 'collection' ? colors.primary : colors.accent}
                  />
                </View>
                <View style={styles.pointInfo}>
                  <Text style={styles.pointName}>{point.name}</Text>
                  <Text style={styles.pointAddress}>{point.address}</Text>
                  <View style={styles.pointMeta}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.pointHours}>{point.hours}</Text>
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.viewMapButton}
              onPress={() => navigation.navigate('Map')}
            >
              <Ionicons name="map" size={18} color={colors.primary} />
              <Text style={styles.viewMapText}>Voir sur la carte</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mises à jour</Text>
            {isCreator && (
              <TouchableOpacity
                style={styles.addUpdateButton}
                onPress={() => setShowUpdateModal(true)}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={styles.addUpdateText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>

          {campaign.updates.length === 0 ? (
            <View style={styles.noUpdates}>
              <Ionicons name="newspaper-outline" size={32} color={colors.textLight} />
              <Text style={styles.noUpdatesText}>Aucune mise à jour pour le moment</Text>
            </View>
          ) : (
            campaign.updates.map((update: CampaignUpdate) => (
              <View key={update.id} style={styles.updateCard}>
                <View style={styles.updateHeader}>
                  <Text style={styles.updateTitle}>{update.title}</Text>
                  <Text style={styles.updateDate}>
                    {formatRelativeTime(update.createdAt)}
                  </Text>
                </View>
                <Text style={styles.updateContent}>{update.content}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.engagementStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{campaign.totalEngagements}</Text>
            <Text style={styles.statLabel}>Engagements</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="location" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{campaign.collectionPoints.length}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="list" size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{campaign.needs.length}</Text>
            <Text style={styles.statLabel}>Besoins</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <PrimaryButton
          title="S'engager maintenant"
          onPress={() =>
            navigation.navigate('Engagement', {
              campaignId: campaign.id,
              needId: campaign.needs[0]?.id || '',
            })
          }
          fullWidth
          icon={<Ionicons name="heart" size={20} color={colors.textInverse} />}
        />
      </View>

      <Modal
        visible={showUpdateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle mise à jour</Text>
              <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Titre</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Titre de la mise à jour"
                value={updateTitle}
                onChangeText={setUpdateTitle}
              />

              <Text style={styles.inputLabel}>Contenu</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Décrivez la mise à jour..."
                value={updateContent}
                onChangeText={setUpdateContent}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalFooter}>
              <PrimaryButton
                title="Publier"
                onPress={handlePostUpdate}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    flex: 1,
    ...typography.h4,
    color: colors.text,
    marginHorizontal: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  heroContent: {},
  heroBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  categoryBadgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  heroTitle: {
    ...typography.h1,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  heroCreator: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  infoCards: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    gap: spacing.md,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  infoCardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoCardValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  needsCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  objectiveBox: {
    flexDirection: 'row',
    backgroundColor: colors.accent + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  objectiveText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.text,
    fontStyle: 'italic',
  },
  needCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  needHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  needTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  needInfo: {
    flex: 1,
  },
  needLabel: {
    ...typography.h4,
    color: colors.text,
  },
  needType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pointCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pointIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    ...typography.h4,
    color: colors.text,
  },
  pointAddress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pointMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointHours: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  viewMapText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  addUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addUpdateText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  noUpdates: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.lg,
  },
  noUpdatesText: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  updateCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  updateTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  updateDate: {
    ...typography.caption,
    color: colors.textLight,
  },
  updateContent: {
    ...typography.body,
    color: colors.textSecondary,
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalFooter: {
    paddingHorizontal: spacing.lg,
  },
});

export default CampaignDetailsScreen;
