import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius, typography } from '../utils/theme';

interface ProgressBarProps {
  progress: number;
  current: number;
  total: number;
  unit: string;
  label?: string;
  showPercentage?: boolean;
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  current,
  total,
  unit,
  label,
  showPercentage = true,
  height = 12,
  color = colors.primary,
  backgroundColor = colors.borderLight,
  animated = true,
  style,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated]);

  const getProgressColor = () => {
    if (clampedProgress >= 100) return colors.success;
    if (clampedProgress >= 75) return colors.primaryLight;
    if (clampedProgress >= 50) return color;
    if (clampedProgress >= 25) return colors.warning;
    return color;
  };

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>
          <Text style={styles.currentValue}>{current}</Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.totalValue}>{total}</Text>
          <Text style={styles.unit}> {unit}</Text>
        </Text>
        {showPercentage && (
          <Text style={[styles.percentage, { color: getProgressColor() }]}>
            {Math.round(clampedProgress)}%
          </Text>
        )}
      </View>

      <View style={[styles.track, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolation,
              backgroundColor: getProgressColor(),
              height,
            },
          ]}
        />
        {clampedProgress >= 100 && (
          <View style={styles.completeIndicator}>
            <Text style={styles.completeText}>✓</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    ...typography.bodySmall,
  },
  currentValue: {
    ...typography.h4,
    color: colors.primary,
  },
  separator: {
    color: colors.textLight,
  },
  totalValue: {
    color: colors.textSecondary,
  },
  unit: {
    color: colors.textLight,
  },
  percentage: {
    ...typography.button,
    fontSize: 14,
  },
  track: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
  completeIndicator: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  completeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default ProgressBar;
