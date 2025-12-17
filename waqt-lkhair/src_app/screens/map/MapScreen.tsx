import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../../utils/theme';
import { useCampaignStore } from '../../store/campaign.store';
import { RootStackParamList, CollectionPoint } from '../../types/models';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.1;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MOROCCO_CENTER = {
  latitude: 33.5731,
  longitude: -7.5898,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const MapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);
  const { collectionPoints, fetchCollectionPoints, campaigns } = useCampaignStore();

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'collection' | 'distribution'>('all');

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      await fetchCollectionPoints();
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Erreur initialisation carte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllPoints = (): CollectionPoint[] => {
    const pointsFromCampaigns = campaigns.flatMap(c => c.collectionPoints);
    const allPoints = [...collectionPoints, ...pointsFromCampaigns];
    const uniquePoints = allPoints.filter(
      (point, index, self) => self.findIndex(p => p.id === point.id) === index
    );
    return uniquePoints;
  };

  const filteredPoints = getAllPoints().filter(
    point => filterType === 'all' || point.type === filterType
  );

  const handleMarkerPress = (point: CollectionPoint) => {
    setSelectedPoint(point);
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05 * ASPECT_RATIO,
      });
    }
  };

  const getMarkerColor = (type: string) => {
    return type === 'collection' ? colors.primary : colors.accent;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation ? {
          ...userLocation,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        } : MOROCCO_CENTER}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredPoints.map(point => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            onPress={() => handleMarkerPress(point)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(point.type) }]}>
              <Ionicons
                name={point.type === 'collection' ? 'arrow-down' : 'arrow-up'}
                size={16}
                color={colors.textInverse}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.overlay} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Points de collecte</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
              Tous ({getAllPoints().length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === 'collection' && styles.filterChipActive,
              filterType === 'collection' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilterType('collection')}
          >
            <Ionicons
              name="arrow-down-circle"
              size={16}
              color={filterType === 'collection' ? colors.textInverse : colors.primary}
            />
            <Text
              style={[
                styles.filterChipText,
                filterType === 'collection' && styles.filterChipTextActive,
              ]}
            >
              Collecte
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === 'distribution' && styles.filterChipActive,
              filterType === 'distribution' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setFilterType('distribution')}
          >
            <Ionicons
              name="arrow-up-circle"
              size={16}
              color={filterType === 'distribution' ? colors.textInverse : colors.accent}
            />
            <Text
              style={[
                styles.filterChipText,
                filterType === 'distribution' && styles.filterChipTextActive,
              ]}
            >
              Distribution
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={handleCenterOnUser}
      >
        <Ionicons name="locate" size={24} color={colors.primary} />
      </TouchableOpacity>

      {selectedPoint && (
        <View style={styles.pointCard}>
          <View style={styles.pointCardHeader}>
            <View
              style={[
                styles.pointTypeIcon,
                { backgroundColor: getMarkerColor(selectedPoint.type) + '15' },
              ]}
            >
              <Ionicons
                name={selectedPoint.type === 'collection' ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={24}
                color={getMarkerColor(selectedPoint.type)}
              />
            </View>
            <View style={styles.pointCardInfo}>
              <Text style={styles.pointCardName}>{selectedPoint.name}</Text>
              <Text style={styles.pointCardType}>
                {selectedPoint.type === 'collection' ? 'Point de collecte' : 'Point de distribution'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPoint(null)}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.pointCardDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.detailText}>{selectedPoint.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.detailText}>{selectedPoint.hours}</Text>
            </View>
            {selectedPoint.phone && (
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>{selectedPoint.phone}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.directionsButton}>
            <Ionicons name="navigate" size={18} color={colors.textInverse} />
            <Text style={styles.directionsButtonText}>Itinéraire</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Collecte</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>Distribution</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: spacing.md,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    ...shadows.md,
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
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    gap: 6,
    ...shadows.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.textInverse,
    ...shadows.md,
  },
  locationButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  pointCard: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  pointCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pointTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pointCardInfo: {
    flex: 1,
  },
  pointCardName: {
    ...typography.h4,
    color: colors.text,
  },
  pointCardType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointCardDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  directionsButtonText: {
    ...typography.button,
    color: colors.textInverse,
  },
  legend: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...shadows.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: 2,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default MapScreen;
