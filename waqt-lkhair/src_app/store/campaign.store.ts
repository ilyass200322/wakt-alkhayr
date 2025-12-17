import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Campaign, Engagement, CollectionPoint, Need, CampaignUpdate } from '../types/models';
import { fakeApi } from '../services/fakeApi';
import { notificationService } from '../services/notification.service';
import { generateId } from '../utils/helpers';

const CAMPAIGNS_CACHE_KEY = '@waqt_lkhair_campaigns';
const ENGAGEMENTS_KEY = '@waqt_lkhair_engagements';

interface CampaignState {
  campaigns: Campaign[];
  userEngagements: Engagement[];
  collectionPoints: CollectionPoint[];
  selectedCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  fetchCampaigns: () => Promise<void>;
  fetchCampaignById: (id: string) => Promise<Campaign | null>;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'totalEngagements'>) => Promise<Campaign | null>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<boolean>;
  deleteCampaign: (id: string) => Promise<boolean>;
  createEngagement: (engagement: Omit<Engagement, 'id' | 'createdAt'>) => Promise<Engagement | null>;
  fetchUserEngagements: (userId: string) => Promise<void>;
  fetchCollectionPoints: () => Promise<void>;
  addCampaignUpdate: (campaignId: string, update: Omit<CampaignUpdate, 'id' | 'createdAt'>) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  clearError: () => void;
  getFilteredCampaigns: () => Campaign[];
  updateNeedProgress: (campaignId: string, needId: string, quantity: number) => void;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  userEngagements: [],
  collectionPoints: [],
  selectedCampaign: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,

  fetchCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      const cached = await AsyncStorage.getItem(CAMPAIGNS_CACHE_KEY);
      if (cached) {
        set({ campaigns: JSON.parse(cached) });
      }

      const campaigns = await fakeApi.getCampaigns();
      await AsyncStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(campaigns));
      set({ campaigns, isLoading: false });
    } catch (error) {
      set({ error: 'Erreur de chargement des campagnes', isLoading: false });
    }
  },

  fetchCampaignById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const campaign = await fakeApi.getCampaignById(id);
      set({ selectedCampaign: campaign, isLoading: false });
      return campaign;
    } catch (error) {
      set({ error: 'Erreur de chargement de la campagne', isLoading: false });
      return null;
    }
  },

  createCampaign: async (campaignData) => {
    set({ isLoading: true, error: null });
    try {
      const campaign = await fakeApi.createCampaign(campaignData);
      set(state => ({
        campaigns: [campaign, ...state.campaigns],
        isLoading: false,
      }));
      await AsyncStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(get().campaigns));
      return campaign;
    } catch (error) {
      set({ error: 'Erreur de création de campagne', isLoading: false });
      return null;
    }
  },

  updateCampaign: async (id: string, updates: Partial<Campaign>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await fakeApi.updateCampaign(id, updates);
      if (updated) {
        set(state => ({
          campaigns: state.campaigns.map(c => (c.id === id ? updated : c)),
          selectedCampaign: state.selectedCampaign?.id === id ? updated : state.selectedCampaign,
          isLoading: false,
        }));
        await AsyncStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(get().campaigns));
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Erreur de mise à jour', isLoading: false });
      return false;
    }
  },

  deleteCampaign: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const success = await fakeApi.deleteCampaign(id);
      if (success) {
        set(state => ({
          campaigns: state.campaigns.filter(c => c.id !== id),
          isLoading: false,
        }));
        await AsyncStorage.setItem(CAMPAIGNS_CACHE_KEY, JSON.stringify(get().campaigns));
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Erreur de suppression', isLoading: false });
      return false;
    }
  },

  createEngagement: async (engagementData) => {
    set({ isLoading: true, error: null });
    try {
      const engagement = await fakeApi.createEngagement(engagementData);
      
      set(state => ({
        userEngagements: [...state.userEngagements, engagement],
        isLoading: false,
      }));

      get().updateNeedProgress(engagement.campaignId, engagement.needId, engagement.quantity);

      const campaign = get().campaigns.find(c => c.id === engagement.campaignId);
      const need = campaign?.needs.find(n => n.id === engagement.needId);
      
      if (campaign && need) {
        await notificationService.sendThankYouNotification(
          campaign.title,
          engagement.type === 'donation' ? 'don' : 'engagement bénévole'
        );

        if (engagement.reminderSet && engagement.reminderTime) {
          await notificationService.scheduleEngagementReminder(
            campaign.title,
            need.label,
            engagement.reminderTime,
            campaign.id
          );
        }
      }

      const stored = await AsyncStorage.getItem(ENGAGEMENTS_KEY);
      const engagements = stored ? JSON.parse(stored) : [];
      engagements.push(engagement);
      await AsyncStorage.setItem(ENGAGEMENTS_KEY, JSON.stringify(engagements));

      return engagement;
    } catch (error) {
      set({ error: 'Erreur de création d\'engagement', isLoading: false });
      return null;
    }
  },

  fetchUserEngagements: async (userId: string) => {
    try {
      const stored = await AsyncStorage.getItem(ENGAGEMENTS_KEY);
      if (stored) {
        const engagements = JSON.parse(stored) as Engagement[];
        set({ userEngagements: engagements.filter(e => e.userId === userId) });
      }
    } catch (error) {
      console.error('Erreur chargement engagements:', error);
    }
  },

  fetchCollectionPoints: async () => {
    try {
      const points = await fakeApi.getCollectionPoints();
      set({ collectionPoints: points });
    } catch (error) {
      console.error('Erreur chargement points de collecte:', error);
    }
  },

  addCampaignUpdate: async (campaignId: string, updateData) => {
    try {
      const update = await fakeApi.addCampaignUpdate(campaignId, updateData);
      
      set(state => ({
        campaigns: state.campaigns.map(c => {
          if (c.id === campaignId) {
            return { ...c, updates: [update, ...c.updates] };
          }
          return c;
        }),
        selectedCampaign: state.selectedCampaign?.id === campaignId
          ? { ...state.selectedCampaign, updates: [update, ...state.selectedCampaign.updates] }
          : state.selectedCampaign,
      }));

      const campaign = get().campaigns.find(c => c.id === campaignId);
      if (campaign) {
        await notificationService.sendUpdateNotification(
          campaign.title,
          update.title,
          campaignId
        );
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setSelectedCategory: (category: string | null) => set({ selectedCategory: category }),

  clearError: () => set({ error: null }),

  getFilteredCampaigns: () => {
    const { campaigns, searchQuery, selectedCategory } = get();
    
    return campaigns.filter(campaign => {
      const matchesSearch = !searchQuery || 
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || campaign.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  },

  updateNeedProgress: (campaignId: string, needId: string, quantity: number) => {
    set(state => ({
      campaigns: state.campaigns.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            needs: campaign.needs.map(need => {
              if (need.id === needId) {
                return {
                  ...need,
                  quantityFulfilled: need.quantityFulfilled + quantity,
                };
              }
              return need;
            }),
            totalEngagements: campaign.totalEngagements + 1,
          };
        }
        return campaign;
      }),
      selectedCampaign: state.selectedCampaign?.id === campaignId
        ? {
            ...state.selectedCampaign,
            needs: state.selectedCampaign.needs.map(need => {
              if (need.id === needId) {
                return {
                  ...need,
                  quantityFulfilled: need.quantityFulfilled + quantity,
                };
              }
              return need;
            }),
            totalEngagements: state.selectedCampaign.totalEngagements + 1,
          }
        : state.selectedCampaign,
    }));
  },
}));

export default useCampaignStore;
