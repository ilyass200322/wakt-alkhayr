import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../../utils/theme';
import { useCampaignStore } from '../../store/campaign.store';
import { useAuthStore } from '../../store/auth.store';
import { RootStackParamList, Need, TimeSlot } from '../../types/models';
import {
  calculateProgress,
  getCategoryColor,
  getNeedTypeLabel,
  getNeedTypeIcon,
  formatDate,
} from '../../utils/helpers';
import ProgressBar from '../../components/ProgressBar';
import PrimaryButton from '../../components/PrimaryButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Engagement'>;

const EngagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { campaignId, needId } = route.params;

  const { user } = useAuthStore();
  const { selectedCampaign, fetchCampaignById, createEngagement, isLoading } = useCampaignStore();

  const [quantity, setQuantity] = useState('1');
  const [selectedNeedId, setSelectedNeedId] = useState(needId);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [setReminder, setSetReminder] = useState(true);

  useEffect(() => {
    fetchCampaignById(campaignId);
  }, [campaignId]);

  const selectedNeed = selectedCampaign?.needs.find(n => n.id === selectedNeedId);
  const categoryColor = selectedCampaign
    ? getCategoryColor(selectedCampaign.category)
    : colors.primary;

  const handleQuantityChange = (delta: number) => {
    const current = parseInt(quantity, 10) || 0;
    const newValue = Math.max(1, current + delta);
    if (selectedNeed) {
      const remaining = selectedNeed.quantityRequired - selectedNeed.quantityFulfilled;
      setQuantity(String(Math.min(newValue, remaining)));
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedNeed || !selectedCampaign) {
      Alert.alert('Erreur', 'Impossible de créer l\'engagement');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité valide');
      return;
    }

    if (selectedNeed.type === 'volunteer' && !selectedTimeSlot && selectedNeed.timeSlots?.length) {
      Alert.alert('Erreur', 'Veuillez sélectionner un créneau horaire');
      return;
    }

    try {
      await createEngagement({
        campaignId,
        userId: user.id,
        needId: selectedNeedId,
        type: selectedNeed.type === 'material' ? 'donation' : 'volunteer',
        quantity: qty,
        timeSlotId: selectedTimeSlot || undefined,
        status: 'confirmed',
        reminderSet: setReminder,
        reminderTime: setReminder ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
      });

      Alert.alert(
        '💚 Merci !',
        `Votre ${selectedNeed.type === 'material' ? 'don' : 'engagement'} a été enregistré. Baraka Allahou fik !`,
        [
          {
            text: 'Fermer',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  if (!selectedCampaign || !selectedNeed) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  const progress = calculateProgress(selectedNeed);
  const remaining = selectedNeed.quantityRequired - selectedNeed.quantityFulfilled;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>S'engager</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.campaignBanner, { backgroundColor: categoryColor }]}>
          <Text style={styles.campaignTitle}>{selectedCampaign.title}</Text>
          <Text style={styles.campaignCreator}>Par {selectedCampaign.creatorName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sélectionner un besoin</Text>
          {selectedCampaign.needs.map(need => {
            const needProgress = calculateProgress(need);
            const isSelected = need.id === selectedNeedId;
            const isFulfilled = needProgress >= 100;

            return (
              <TouchableOpacity
                key={need.id}
                style={[
                  styles.needOption,
                  isSelected && styles.needOptionSelected,
                  isSelected && { borderColor: categoryColor },
                  isFulfilled && styles.needOptionDisabled,
                ]}
                onPress={() => !isFulfilled && setSelectedNeedId(need.id)}
                disabled={isFulfilled}
              >
                <View style={styles.needOptionHeader}>
                  <View
                    style={[
                      styles.needIcon,
                      { backgroundColor: categoryColor + '15' },
                      isFulfilled && { backgroundColor: colors.success + '15' },
                    ]}
                  >
                    <Ionicons
                      name={isFulfilled ? 'checkmark-circle' : (getNeedTypeIcon(need.type) as any)}
                      size={20}
                      color={isFulfilled ? colors.success : categoryColor}
                    />
                  </View>
                  <View style={styles.needOptionInfo}>
                    <Text style={styles.needOptionLabel}>{need.label}</Text>
                    <Text style={styles.needOptionType}>{getNeedTypeLabel(need.type)}</Text>
                  </View>
                  {isSelected && !isFulfilled && (
                    <View style={[styles.selectedIndicator, { backgroundColor: categoryColor }]}>
                      <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                    </View>
                  )}
                </View>
                <View style={styles.needOptionProgress}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${needProgress}%`,
                          backgroundColor: isFulfilled ? colors.success : categoryColor,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      { color: isFulfilled ? colors.success : categoryColor },
                    ]}
                  >
                    {need.quantityFulfilled}/{need.quantityRequired} {need.unit}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedNeed.type === 'volunteer' && selectedNeed.timeSlots && selectedNeed.timeSlots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir un créneau</Text>
            {selectedNeed.timeSlots.map((slot: TimeSlot) => {
              const isFull = slot.volunteersAssigned >= slot.volunteersNeeded;
              const isSelected = selectedTimeSlot === slot.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlotOption,
                    isSelected && styles.timeSlotSelected,
                    isSelected && { borderColor: categoryColor },
                    isFull && styles.timeSlotDisabled,
                  ]}
                  onPress={() => !isFull && setSelectedTimeSlot(slot.id)}
                  disabled={isFull}
                >
                  <View style={styles.timeSlotInfo}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={isFull ? colors.textLight : colors.primary}
                    />
                    <View>
                      <Text style={[styles.timeSlotDate, isFull && styles.textDisabled]}>
                        {formatDate(slot.date)}
                      </Text>
                      <Text style={[styles.timeSlotTime, isFull && styles.textDisabled]}>
                        {slot.startTime} - {slot.endTime}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.timeSlotCapacity}>
                    <Text
                      style={[
                        styles.capacityText,
                        isFull ? { color: colors.error } : { color: colors.success },
                      ]}
                    >
                      {slot.volunteersAssigned}/{slot.volunteersNeeded}
                    </Text>
                    <Text style={styles.capacityLabel}>places</Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: categoryColor }]}>
                      <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Ionicons name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.quantityInputContainer}>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={text => {
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num >= 1 && num <= remaining) {
                    setQuantity(text);
                  } else if (text === '') {
                    setQuantity('');
                  }
                }}
                keyboardType="numeric"
                textAlign="center"
              />
              <Text style={styles.quantityUnit}>{selectedNeed.unit}</Text>
            </View>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.remainingText}>
            Il reste {remaining} {selectedNeed.unit} à combler
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderInfo}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <View>
                <Text style={styles.reminderTitle}>Rappel</Text>
                <Text style={styles.reminderSubtitle}>
                  Recevoir un rappel avant l'engagement
                </Text>
              </View>
            </View>
            <Switch
              value={setReminder}
              onValueChange={setSetReminder}
              trackColor={{ false: colors.border, true: categoryColor + '50' }}
              thumbColor={setReminder ? categoryColor : colors.textLight}
            />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Campagne</Text>
            <Text style={styles.summaryValue}>{selectedCampaign.title}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Besoin</Text>
            <Text style={styles.summaryValue}>{selectedNeed.label}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>{getNeedTypeLabel(selectedNeed.type)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantité</Text>
            <Text style={[styles.summaryValue, { color: categoryColor, fontWeight: '700' }]}>
              {quantity} {selectedNeed.unit}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <PrimaryButton
          title="Confirmer mon engagement"
          onPress={handleSubmit}
          loading={isLoading}
          fullWidth
          style={{ backgroundColor: categoryColor }}
          icon={<Ionicons name="heart" size={20} color={colors.textInverse} />}
        />
      </View>
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
    justifyContent: 'space-between',
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
    ...typography.h3,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  campaignBanner: {
    padding: spacing.lg,
  },
  campaignTitle: {
    ...typography.h3,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  campaignCreator: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  needOption: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  needOptionSelected: {
    backgroundColor: colors.backgroundAlt,
  },
  needOptionDisabled: {
    opacity: 0.6,
  },
  needOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  needIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  needOptionInfo: {
    flex: 1,
  },
  needOptionLabel: {
    ...typography.h4,
    color: colors.text,
  },
  needOptionType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needOptionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  timeSlotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  timeSlotSelected: {
    backgroundColor: colors.backgroundAlt,
  },
  timeSlotDisabled: {
    opacity: 0.5,
  },
  timeSlotInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeSlotDate: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  timeSlotTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  textDisabled: {
    color: colors.textLight,
  },
  timeSlotCapacity: {
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  capacityText: {
    ...typography.h4,
  },
  capacityLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  quantityInputContainer: {
    alignItems: 'center',
  },
  quantityInput: {
    ...typography.h1,
    color: colors.text,
    minWidth: 100,
  },
  quantityUnit: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  remainingText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  reminderTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  reminderSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryCard: {
    margin: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
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
});

export default EngagementScreen;
