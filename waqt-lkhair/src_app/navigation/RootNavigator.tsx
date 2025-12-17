import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../utils/theme';
import { useAuthStore } from '../store/auth.store';
import { RootStackParamList } from '../types/models';
import { notificationService } from '../services/notification.service';

import AuthNavigator from './AuthNavigator';
import MainTabs from './MainTabs';
import CampaignDetailsScreen from '../screens/campaigns/CampaignDetailsScreen';
import CreateCampaignScreen from '../screens/campaigns/CreateCampaignScreen';
import EngagementScreen from '../screens/campaigns/EngagementScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      await notificationService.initialize();
      setIsInitializing(false);
    };
    initialize();
  }, []);

  if (isLoading || isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="CampaignDetails"
              component={CampaignDetailsScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="CreateCampaign"
              component={CreateCampaignScreen}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="Engagement"
              component={EngagementScreen}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default RootNavigator;
