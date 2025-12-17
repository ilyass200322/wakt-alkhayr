import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Campaign } from '../types/models';
import { colors, borderRadius, typography, shadows, spacing } from '../utils/theme';
import {
  formatDateShort,
  getCategoryLabel,
  getCategoryColor,
  getCategoryIcon,
  getStatusLabel,
  getStatusColor,
  calculateCampaignProgress,
  truncateText,
} from '../utils/helpers';
import ProgressBar from './ProgressBar';

interface CampaignCardProps {
  campaign: Campaign;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onPress,
  variant = 'default',
}) => {
  const progress = calculateCampaignProgress(campaign);
  const categoryColor = getCategoryColor(campaign.category);
  const statusColor = getStatusColor(campaign.status);

  const totalNeeded = campaign.needs.reduce((sum, n) => sum + n.quantityRequired, 0);
  const totalFulfilled = campaign.needs.reduce((sum, n) => sum + n.quantityFulfilled, 0);

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.compactIcon, { backgroundColor: categoryColor + '20' }]}>
          <Ionicons
            name={getCategoryIcon(campaign.category) as any}
            size={24}
            color={categoryColor}
          />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {campaign.title}
          </Text>
          <Text style={styles.compactCreator}>{campaign.creatorName}</Text>
          <View style={styles.compactProgress}>
            <View style={styles.compactProgressTrack}>
              <View
                style={[
                  styles.compactProgressFill,
                  { width: `${progress}%`, backgroundColor: categoryColor },
                ]}
              />
            </View>
            <Text style={[styles.compactProgressText, { color: categoryColor }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={styles.featuredContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.featuredGradient, { backgroundColor: categoryColor }]}>
          <View style={styles.featuredHeader}>
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
              <Text style={styles.statusBadgeText}>{getStatusLabel(campaign.status)}</Text>
            </View>
          </View>

          <Text style={styles.featuredTitle}>{campaign.title}</Text>
          <Text style={styles.featuredDescription} numberOfLines={2}>
            {campaign.description}
          </Text>

          <View style={styles.featuredFooter}>
            <View style={styles.featuredStat}>
              <Ionicons name="people" size={16} color={colors.textInverse} />
              <Text style={styles.featuredStatText}>
                {campaign.totalEngagements} engagés
              </Text>
            </View>
            <View style={styles.featuredProgressContainer}>
              <View style={styles.featuredProgressTrack}>
                <View
                  style={[
                    styles.featuredProgressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.featuredProgressText}>{Math.round(progress)}%</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.categoryTag, { backgroundColor: categoryColor + '15' }]}>
          <Ionicons
            name={getCategoryIcon(campaign.category) as any}
            size={14}
            color={categoryColor}
          />
          <Text style={[styles.categoryTagText, { color: categoryColor }]}>
            {getCategoryLabel(campaign.category)}
          </Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{getStatusLabel(campaign.status)}</Text>
        </View>
      </View>

      <Text style={styles.title}>{campaign.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {truncateText(campaign.description, 100)}
      </Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>{campaign.creatorName}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {formatDateShort(campaign.startDate)} - {formatDateShort(campaign.endDate)}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <ProgressBar
          progress={progress}
          current={totalFulfilled}
          total={totalNeeded}
          unit="besoins"
          color={categoryColor}
          height={8}
          showPercentage={false}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.engagementInfo}>
          <Ionicons name="heart" size={16} color={colors.primary} />
          <Text style={styles.engagementText}>
            {campaign.totalEngagements} engagement{campaign.totalEngagements > 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.needsCount}>
          <Text style={styles.needsCountText}>
            {campaign.needs.length} besoin{campaign.needs.length > 1 ? 's' : ''}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  categoryTagText: {
    ...typography.caption,
    fontWeight: '600',
  },
  statusIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  engagementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  needsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  needsCountText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  compactIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  compactCreator: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  compactProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  compactProgressText: {
    ...typography.caption,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  featuredContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  featuredGradient: {
    padding: spacing.lg,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  featuredTitle: {
    ...typography.h2,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  featuredDescription: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.md,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredStatText: {
    ...typography.bodySmall,
    color: colors.textInverse,
  },
  featuredProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredProgressTrack: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  featuredProgressFill: {
    height: '100%',
    backgroundColor: colors.textInverse,
    borderRadius: borderRadius.full,
  },
  featuredProgressText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
});

export default CampaignCard;
