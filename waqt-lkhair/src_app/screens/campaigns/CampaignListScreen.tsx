import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../../utils/theme';
import { useCampaignStore } from '../../store/campaign.store';
import { useAuthStore } from '../../store/auth.store';
import { RootStackParamList, Campaign } from '../../types/models';
import CampaignCard from '../../components/CampaignCard';
import PrimaryButton from '../../components/PrimaryButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const statusFilters = [
  { id: 'all', label: 'Toutes' },
  { id: 'active', label: 'En cours' },
  { id: 'upcoming', label: 'À venir' },
  { id: 'completed', label: 'Terminées' },
];

const CampaignListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const {
    campaigns,
    isLoading,
    fetchCampaigns,
    searchQuery,
    setSearchQuery,
    getFilteredCampaigns,
  } = useCampaignStore();

  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  };

  const handleCampaignPress = (campaignId: string) => {
    navigation.navigate('CampaignDetails', { campaignId });
  };

  const filteredCampaigns = getFilteredCampaigns().filter(
    campaign => statusFilter === 'all' || campaign.status === statusFilter
  );

  const renderCampaignItem = ({ item }: { item: Campaign }) => (
    <CampaignCard
      campaign={item}
      onPress={() => handleCampaignPress(item.id)}
      variant={viewMode === 'compact' ? 'compact' : 'default'}
    />
  );

  const ListHeader = () => (
    <>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une campagne..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'list' ? 'compact' : 'list')}
        >
          <Ionicons
            name={viewMode === 'list' ? 'list' : 'grid'}
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        {statusFilters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              statusFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === filter.id && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredCampaigns.length} campagne{filteredCampaigns.length > 1 ? 's' : ''} trouvée{filteredCampaigns.length > 1 ? 's' : ''}
        </Text>
      </View>
    </>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="flag-outline" size={64} color={colors.textLight} />
      </View>
      <Text style={styles.emptyStateTitle}>Aucune campagne</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'Aucune campagne ne correspond à votre recherche'
          : 'Aucune campagne disponible pour le moment'}
      </Text>
      {user?.isCreator && (
        <PrimaryButton
          title="Créer une campagne"
          onPress={() => navigation.navigate('CreateCampaign', {})}
          style={styles.emptyStateButton}
          icon={<Ionicons name="add" size={20} color={colors.textInverse} />}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campagnes</Text>
        {user?.isCreator && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateCampaign', {})}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredCampaigns}
        keyExtractor={item => item.id}
        renderItem={renderCampaignItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  viewModeButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  resultsInfo: {
    marginBottom: spacing.md,
  },
  resultsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    marginTop: spacing.md,
  },
});

export default CampaignListScreen;
