import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../../utils/theme';
import { useAuthStore } from '../../store/auth.store';
import { useCampaignStore } from '../../store/campaign.store';
import { RootStackParamList, Campaign } from '../../types/models';
import { getGreeting, getCategoryLabel, getCategoryColor, getCategoryIcon } from '../../utils/helpers';
import CampaignCard from '../../components/CampaignCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const categories = [
  { id: 'all', label: 'Tout', icon: 'apps' },
  { id: 'ramadan', label: 'Ramadan', icon: 'moon' },
  { id: 'eid', label: 'Aïd', icon: 'gift' },
  { id: 'winter', label: 'Hiver', icon: 'snow' },
  { id: 'neighborhood', label: 'Quartier', icon: 'home' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const {
    campaigns,
    isLoading,
    fetchCampaigns,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    getFilteredCampaigns,
  } = useCampaignStore();

  const [refreshing, setRefreshing] = useState(false);

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

  const filteredCampaigns = getFilteredCampaigns();
  const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active');
  const featuredCampaign = activeCampaigns[0];

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalEngagements: campaigns.reduce((sum, c) => sum + c.totalEngagements, 0),
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Bienvenue'} 👋</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
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
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="flag" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalCampaigns}</Text>
            <Text style={styles.statLabel}>Campagnes</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="pulse" size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.activeCampaigns}</Text>
            <Text style={styles.statLabel}>Actives</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent + '15' }]}>
              <Ionicons name="heart" size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{stats.totalEngagements}</Text>
            <Text style={styles.statLabel}>Engagements</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                (selectedCategory === category.id || (category.id === 'all' && !selectedCategory)) &&
                  styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id === 'all' ? null : category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={
                  (selectedCategory === category.id || (category.id === 'all' && !selectedCategory))
                    ? colors.textInverse
                    : colors.primary
                }
              />
              <Text
                style={[
                  styles.categoryChipText,
                  (selectedCategory === category.id || (category.id === 'all' && !selectedCategory)) &&
                    styles.categoryChipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {featuredCampaign && !searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>À la une</Text>
              <Ionicons name="star" size={18} color={colors.accent} />
            </View>
            <CampaignCard
              campaign={featuredCampaign}
              onPress={() => handleCampaignPress(featuredCampaign.id)}
              variant="featured"
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Résultats' : 'Campagnes actives'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CampaignList')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {filteredCampaigns.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={colors.textLight} />
              <Text style={styles.emptyStateText}>Aucune campagne trouvée</Text>
              <Text style={styles.emptyStateSubtext}>
                Essayez avec d'autres mots-clés
              </Text>
            </View>
          ) : (
            filteredCampaigns
              .filter(c => c.id !== featuredCampaign?.id || searchQuery)
              .slice(0, 5)
              .map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onPress={() => handleCampaignPress(campaign.id)}
                />
              ))
          )}
        </View>

        {user?.isCreator && (
          <TouchableOpacity
            style={styles.createCampaignBanner}
            onPress={() => navigation.navigate('CreateCampaign', {})}
          >
            <View style={styles.createBannerContent}>
              <View style={styles.createBannerIcon}>
                <Ionicons name="add" size={24} color={colors.textInverse} />
              </View>
              <View style={styles.createBannerText}>
                <Text style={styles.createBannerTitle}>Créer une campagne</Text>
                <Text style={styles.createBannerSubtitle}>
                  Lancez une initiative de bienfaisance
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.card,
  },
  searchContainer: {
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
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
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.textInverse,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  createCampaignBanner: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    borderStyle: 'dashed',
    ...shadows.sm,
  },
  createBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  createBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBannerText: {
    flex: 1,
  },
  createBannerTitle: {
    ...typography.h4,
    color: colors.text,
  },
  createBannerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default HomeScreen;
