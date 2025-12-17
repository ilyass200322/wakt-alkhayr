export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isCreator: boolean;
  avatar?: string;
  createdAt: Date;
}

export interface Need {
  id: string;
  type: 'material' | 'volunteer';
  label: string;
  quantityRequired: number;
  quantityFulfilled: number;
  unit: string;
  timeSlots?: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  volunteersNeeded: number;
  volunteersAssigned: number;
}

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'collection' | 'distribution';
  hours: string;
  phone?: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  imageUri?: string;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  objective: string;
  category: 'ramadan' | 'eid' | 'winter' | 'neighborhood' | 'other';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'upcoming';
  creatorId: string;
  creatorName: string;
  imageUri?: string;
  needs: Need[];
  collectionPoints: CollectionPoint[];
  updates: CampaignUpdate[];
  totalEngagements: number;
  createdAt: Date;
}

export interface Engagement {
  id: string;
  campaignId: string;
  userId: string;
  needId: string;
  type: 'donation' | 'volunteer';
  quantity: number;
  timeSlotId?: string;
  status: 'pending' | 'confirmed' | 'completed';
  reminderSet: boolean;
  reminderTime?: Date;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'reminder' | 'update' | 'thank_you';
  campaignId?: string;
  read: boolean;
  scheduledFor?: Date;
  createdAt: Date;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Home: undefined;
  CampaignList: undefined;
  CampaignDetails: { campaignId: string };
  CreateCampaign: { campaignId?: string };
  Engagement: { campaignId: string; needId: string };
  Map: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CampaignsTab: undefined;
  MapTab: undefined;
  ProfileTab: undefined;
};
