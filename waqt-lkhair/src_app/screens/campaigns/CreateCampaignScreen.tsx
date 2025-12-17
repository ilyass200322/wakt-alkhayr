import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../../utils/theme';
import { useCampaignStore } from '../../store/campaign.store';
import { useAuthStore } from '../../store/auth.store';
import { RootStackParamList, Need } from '../../types/models';
import { generateId, getCategoryColor } from '../../utils/helpers';
import PrimaryButton from '../../components/PrimaryButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'CreateCampaign'>;

const categories = [
  { id: 'ramadan', label: 'Ramadan', icon: 'moon' },
  { id: 'eid', label: 'Aïd', icon: 'gift' },
  { id: 'winter', label: 'Hiver', icon: 'snow' },
  { id: 'neighborhood', label: 'Quartier', icon: 'home' },
  { id: 'other', label: 'Autre', icon: 'heart' },
];

const CreateCampaignScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const campaignId = route.params?.campaignId;

  const { user } = useAuthStore();
  const { createCampaign, updateCampaign, fetchCampaignById, selectedCampaign, isLoading } = useCampaignStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [category, setCategory] = useState<string>('ramadan');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [needs, setNeeds] = useState<Need[]>([]);
  const [newNeedLabel, setNewNeedLabel] = useState('');
  const [newNeedType, setNewNeedType] = useState<'material' | 'volunteer'>('material');
  const [newNeedQuantity, setNewNeedQuantity] = useState('');
  const [newNeedUnit, setNewNeedUnit] = useState('');

  const isEditing = !!campaignId;

  useEffect(() => {
    if (campaignId) {
      fetchCampaignById(campaignId);
    }
  }, [campaignId]);

  useEffect(() => {
    if (isEditing && selectedCampaign) {
      setTitle(selectedCampaign.title);
      setDescription(selectedCampaign.description);
      setObjective(selectedCampaign.objective);
      setCategory(selectedCampaign.category);
      setStartDate(new Date(selectedCampaign.startDate));
      setEndDate(new Date(selectedCampaign.endDate));
      setNeeds(selectedCampaign.needs);
    }
  }, [isEditing, selectedCampaign]);

  const handleAddNeed = () => {
    if (!newNeedLabel.trim() || !newNeedQuantity || !newNeedUnit.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs du besoin');
      return;
    }

    const newNeed: Need = {
      id: generateId(),
      type: newNeedType,
      label: newNeedLabel.trim(),
      quantityRequired: parseInt(newNeedQuantity, 10),
      quantityFulfilled: 0,
      unit: newNeedUnit.trim(),
    };

    setNeeds([...needs, newNeed]);
    setNewNeedLabel('');
    setNewNeedQuantity('');
    setNewNeedUnit('');
  };

  const handleRemoveNeed = (needId: string) => {
    setNeeds(needs.filter(n => n.id !== needId));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Erreur', 'La description est requise');
      return;
    }
    if (needs.length === 0) {
      Alert.alert('Erreur', 'Ajoutez au moins un besoin');
      return;
    }

    const campaignData = {
      title: title.trim(),
      description: description.trim(),
      objective: objective.trim(),
      category: category as any,
      startDate,
      endDate,
      status: 'active' as const,
      creatorId: user?.id || '',
      creatorName: user?.name || '',
      needs,
      collectionPoints: [],
      updates: [],
    };

    try {
      if (isEditing && campaignId) {
        await updateCampaign(campaignId, campaignData);
        Alert.alert('Succès', 'Campagne mise à jour avec succès');
      } else {
        await createCampaign(campaignData);
        Alert.alert('Succès', 'Campagne créée avec succès');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Modifier la campagne' : 'Nouvelle campagne'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations générales</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Titre *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Iftar Solidaire 2024"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Décrivez votre campagne..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Objectif</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Quel est l'objectif de cette campagne ?"
                value={objective}
                onChangeText={setObjective}
                multiline
                numberOfLines={2}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégorie</Text>
            <View style={styles.categoriesGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.id && styles.categoryOptionActive,
                    category === cat.id && { borderColor: getCategoryColor(cat.id) },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={24}
                    color={category === cat.id ? getCategoryColor(cat.id) : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat.id && { color: getCategoryColor(cat.id) },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dates</Text>
            <View style={styles.datesRow}>
              <View style={styles.dateButton}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <View>
                  <Text style={styles.dateLabel}>Début</Text>
                  <Text style={styles.dateValue}>{startDate.toLocaleDateString('fr-FR')}</Text>
                </View>
              </View>

              <View style={styles.dateButton}>
                <Ionicons name="flag" size={20} color={colors.accent} />
                <View>
                  <Text style={styles.dateLabel}>Fin</Text>
                  <Text style={styles.dateValue}>{endDate.toLocaleDateString('fr-FR')}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Besoins *</Text>

            {needs.length > 0 && (
              <View style={styles.needsList}>
                {needs.map(need => (
                  <View key={need.id} style={styles.needItem}>
                    <View style={styles.needItemInfo}>
                      <Ionicons
                        name={need.type === 'material' ? 'cube' : 'people'}
                        size={18}
                        color={colors.primary}
                      />
                      <Text style={styles.needItemText}>
                        {need.label} - {need.quantityRequired} {need.unit}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveNeed(need.id)}>
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.addNeedForm}>
              <View style={styles.needTypeToggle}>
                <TouchableOpacity
                  style={[
                    styles.needTypeButton,
                    newNeedType === 'material' && styles.needTypeButtonActive,
                  ]}
                  onPress={() => setNewNeedType('material')}
                >
                  <Ionicons
                    name="cube"
                    size={18}
                    color={newNeedType === 'material' ? colors.textInverse : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.needTypeText,
                      newNeedType === 'material' && styles.needTypeTextActive,
                    ]}
                  >
                    Matériel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.needTypeButton,
                    newNeedType === 'volunteer' && styles.needTypeButtonActive,
                  ]}
                  onPress={() => setNewNeedType('volunteer')}
                >
                  <Ionicons
                    name="people"
                    size={18}
                    color={newNeedType === 'volunteer' ? colors.textInverse : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.needTypeText,
                      newNeedType === 'volunteer' && styles.needTypeTextActive,
                    ]}
                  >
                    Bénévolat
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="Ex: Repas complets"
                value={newNeedLabel}
                onChangeText={setNewNeedLabel}
                placeholderTextColor={colors.textLight}
              />

              <View style={styles.quantityRow}>
                <TextInput
                  style={[styles.textInput, styles.quantityInput]}
                  placeholder="Quantité"
                  value={newNeedQuantity}
                  onChangeText={setNewNeedQuantity}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
                <TextInput
                  style={[styles.textInput, styles.unitInput]}
                  placeholder="Unité (ex: repas)"
                  value={newNeedUnit}
                  onChangeText={setNewNeedUnit}
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <TouchableOpacity style={styles.addNeedButton} onPress={handleAddNeed}>
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={styles.addNeedButtonText}>Ajouter ce besoin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.submitSection}>
            <PrimaryButton
              title={isEditing ? 'Enregistrer les modifications' : 'Créer la campagne'}
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              icon={<Ionicons name="checkmark" size={20} color={colors.textInverse} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
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
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryOptionActive: {
    backgroundColor: colors.backgroundAlt,
  },
  categoryOptionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  datesRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dateValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  needsList: {
    marginBottom: spacing.md,
  },
  needItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  needItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  needItemText: {
    ...typography.body,
    color: colors.text,
  },
  addNeedForm: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  needTypeToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  needTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  needTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  needTypeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  needTypeTextActive: {
    color: colors.textInverse,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quantityInput: {
    flex: 1,
  },
  unitInput: {
    flex: 2,
  },
  addNeedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  addNeedButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  submitSection: {
    padding: spacing.lg,
  },
});

export default CreateCampaignScreen;
