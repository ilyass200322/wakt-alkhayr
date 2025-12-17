import { Campaign, User, Engagement, CollectionPoint, CampaignUpdate, Need } from '../types/models';
import { generateId } from '../utils/helpers';

const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Ahmed Bennani',
    email: 'ahmed.bennani@email.com',
    phone: '+212 6 12 34 56 78',
    isCreator: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user-2',
    name: 'Fatima Zahra',
    email: 'fatima.zahra@email.com',
    phone: '+212 6 98 76 54 32',
    isCreator: false,
    createdAt: new Date('2024-02-20'),
  },
];

const mockCollectionPoints: CollectionPoint[] = [
  {
    id: 'cp-1',
    name: 'Mosquée Hassan II',
    address: 'Boulevard de la Corniche, Casablanca',
    latitude: 33.6065,
    longitude: -7.6325,
    type: 'collection',
    hours: '08:00 - 20:00',
    phone: '+212 5 22 22 22 22',
  },
  {
    id: 'cp-2',
    name: 'Centre Communautaire Al Fath',
    address: 'Rue Mohammed V, Rabat',
    latitude: 34.0209,
    longitude: -6.8416,
    type: 'distribution',
    hours: '09:00 - 18:00',
    phone: '+212 5 37 37 37 37',
  },
  {
    id: 'cp-3',
    name: 'Association Entraide',
    address: 'Avenue Hassan II, Marrakech',
    latitude: 31.6295,
    longitude: -7.9811,
    type: 'collection',
    hours: '10:00 - 19:00',
  },
  {
    id: 'cp-4',
    name: 'Dar Al Ihssan',
    address: 'Quartier Hay Mohammadi, Casablanca',
    latitude: 33.5731,
    longitude: -7.5898,
    type: 'distribution',
    hours: '07:00 - 21:00',
    phone: '+212 5 22 33 44 55',
  },
];

const mockNeeds: Need[] = [
  {
    id: 'need-1',
    type: 'material',
    label: 'Repas complets',
    quantityRequired: 500,
    quantityFulfilled: 320,
    unit: 'repas',
  },
  {
    id: 'need-2',
    type: 'material',
    label: 'Bouteilles d\'eau',
    quantityRequired: 1000,
    quantityFulfilled: 750,
    unit: 'bouteilles',
  },
  {
    id: 'need-3',
    type: 'volunteer',
    label: 'Bénévoles distribution',
    quantityRequired: 50,
    quantityFulfilled: 35,
    unit: 'personnes',
    timeSlots: [
      {
        id: 'ts-1',
        date: '2024-03-15',
        startTime: '18:00',
        endTime: '21:00',
        volunteersNeeded: 20,
        volunteersAssigned: 15,
      },
      {
        id: 'ts-2',
        date: '2024-03-16',
        startTime: '18:00',
        endTime: '21:00',
        volunteersNeeded: 30,
        volunteersAssigned: 20,
      },
    ],
  },
  {
    id: 'need-4',
    type: 'material',
    label: 'Couvertures',
    quantityRequired: 200,
    quantityFulfilled: 85,
    unit: 'couvertures',
  },
  {
    id: 'need-5',
    type: 'material',
    label: 'Vêtements chauds',
    quantityRequired: 300,
    quantityFulfilled: 180,
    unit: 'pièces',
  },
  {
    id: 'need-6',
    type: 'volunteer',
    label: 'Accompagnateurs',
    quantityRequired: 30,
    quantityFulfilled: 12,
    unit: 'personnes',
    timeSlots: [
      {
        id: 'ts-3',
        date: '2024-03-20',
        startTime: '09:00',
        endTime: '12:00',
        volunteersNeeded: 15,
        volunteersAssigned: 8,
      },
    ],
  },
];

const mockUpdates: CampaignUpdate[] = [
  {
    id: 'update-1',
    campaignId: 'camp-1',
    title: 'Merci pour votre générosité !',
    content: 'Grâce à vous, nous avons déjà collecté plus de 300 repas. Continuons ensemble !',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'update-2',
    campaignId: 'camp-1',
    title: 'Nouveau point de collecte',
    content: 'Un nouveau point de collecte a été ajouté à Hay Mohammadi pour faciliter vos dons.',
    createdAt: new Date('2024-03-08'),
  },
  {
    id: 'update-3',
    campaignId: 'camp-2',
    title: 'Distribution réussie',
    content: '150 familles ont été aidées ce week-end. Votre soutien fait la différence !',
    createdAt: new Date('2024-03-05'),
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Iftar Solidaire 2024',
    description: 'Distribution de repas aux personnes dans le besoin pendant le mois sacré du Ramadan.',
    objective: 'Nourrir 500 personnes chaque jour du Ramadan dans les quartiers défavorisés de Casablanca.',
    category: 'ramadan',
    startDate: new Date('2024-03-11'),
    endDate: new Date('2024-04-10'),
    status: 'active',
    creatorId: 'user-1',
    creatorName: 'Ahmed Bennani',
    needs: [mockNeeds[0], mockNeeds[1], mockNeeds[2]],
    collectionPoints: [mockCollectionPoints[0], mockCollectionPoints[3]],
    updates: [mockUpdates[0], mockUpdates[1]],
    totalEngagements: 45,
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'camp-2',
    title: 'Hiver au Chaud',
    description: 'Collecte de vêtements et couvertures pour les sans-abris.',
    objective: 'Distribuer 500 couvertures et 1000 vêtements chauds aux personnes vulnérables.',
    category: 'winter',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    status: 'active',
    creatorId: 'user-1',
    creatorName: 'Ahmed Bennani',
    needs: [mockNeeds[3], mockNeeds[4], mockNeeds[5]],
    collectionPoints: [mockCollectionPoints[1], mockCollectionPoints[2]],
    updates: [mockUpdates[2]],
    totalEngagements: 28,
    createdAt: new Date('2023-12-20'),
  },
  {
    id: 'camp-3',
    title: 'Aïd El Fitr - Joie Partagée',
    description: 'Distribution de cadeaux et vêtements neufs aux enfants défavorisés pour l\'Aïd.',
    objective: 'Offrir un Aïd joyeux à 200 enfants avec des vêtements neufs et des jouets.',
    category: 'eid',
    startDate: new Date('2024-04-05'),
    endDate: new Date('2024-04-12'),
    status: 'upcoming',
    creatorId: 'user-2',
    creatorName: 'Fatima Zahra',
    needs: [
      {
        id: 'need-7',
        type: 'material',
        label: 'Vêtements enfants',
        quantityRequired: 200,
        quantityFulfilled: 45,
        unit: 'ensembles',
      },
      {
        id: 'need-8',
        type: 'material',
        label: 'Jouets',
        quantityRequired: 200,
        quantityFulfilled: 60,
        unit: 'jouets',
      },
    ],
    collectionPoints: [mockCollectionPoints[0]],
    updates: [],
    totalEngagements: 12,
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'camp-4',
    title: 'Nettoyage Quartier Al Fida',
    description: 'Journée de nettoyage et d\'embellissement du quartier Al Fida.',
    objective: 'Mobiliser 100 bénévoles pour nettoyer et embellir notre quartier.',
    category: 'neighborhood',
    startDate: new Date('2024-03-25'),
    endDate: new Date('2024-03-25'),
    status: 'upcoming',
    creatorId: 'user-1',
    creatorName: 'Ahmed Bennani',
    needs: [
      {
        id: 'need-9',
        type: 'volunteer',
        label: 'Bénévoles nettoyage',
        quantityRequired: 100,
        quantityFulfilled: 42,
        unit: 'personnes',
        timeSlots: [
          {
            id: 'ts-4',
            date: '2024-03-25',
            startTime: '08:00',
            endTime: '14:00',
            volunteersNeeded: 100,
            volunteersAssigned: 42,
          },
        ],
      },
      {
        id: 'need-10',
        type: 'material',
        label: 'Sacs poubelle',
        quantityRequired: 500,
        quantityFulfilled: 200,
        unit: 'sacs',
      },
    ],
    collectionPoints: [mockCollectionPoints[3]],
    updates: [],
    totalEngagements: 42,
    createdAt: new Date('2024-03-10'),
  },
];

let engagements: Engagement[] = [
  {
    id: 'eng-1',
    campaignId: 'camp-1',
    userId: 'user-2',
    needId: 'need-1',
    type: 'donation',
    quantity: 20,
    status: 'confirmed',
    reminderSet: true,
    reminderTime: new Date('2024-03-15T16:00:00'),
    createdAt: new Date('2024-03-05'),
  },
];

export const fakeApi = {
  async login(email: string, password: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      return user;
    }
    return {
      id: generateId(),
      name: 'Utilisateur',
      email: email,
      phone: '+212 6 00 00 00 00',
      isCreator: false,
      createdAt: new Date(),
    };
  },

  async quickLogin(): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers[0];
  },

  async getCampaigns(): Promise<Campaign[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockCampaigns;
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCampaigns.find(c => c.id === id) || null;
  },

  async getActiveCampaigns(): Promise<Campaign[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCampaigns.filter(c => c.status === 'active');
  },

  async getCampaignsByCategory(category: string): Promise<Campaign[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCampaigns.filter(c => c.category === category);
  },

  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'totalEngagements'>): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCampaign: Campaign = {
      ...campaign,
      id: generateId(),
      totalEngagements: 0,
      createdAt: new Date(),
    };
    mockCampaigns.push(newCampaign);
    return newCampaign;
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) return null;
    mockCampaigns[index] = { ...mockCampaigns[index], ...updates };
    return mockCampaigns[index];
  },

  async deleteCampaign(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) return false;
    mockCampaigns.splice(index, 1);
    return true;
  },

  async createEngagement(engagement: Omit<Engagement, 'id' | 'createdAt'>): Promise<Engagement> {
    await new Promise(resolve => setTimeout(resolve, 700));
    const newEngagement: Engagement = {
      ...engagement,
      id: generateId(),
      createdAt: new Date(),
    };
    engagements.push(newEngagement);

    const campaign = mockCampaigns.find(c => c.id === engagement.campaignId);
    if (campaign) {
      const need = campaign.needs.find(n => n.id === engagement.needId);
      if (need) {
        need.quantityFulfilled += engagement.quantity;
      }
      campaign.totalEngagements += 1;
    }

    return newEngagement;
  },

  async getUserEngagements(userId: string): Promise<Engagement[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return engagements.filter(e => e.userId === userId);
  },

  async getCollectionPoints(): Promise<CollectionPoint[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCollectionPoints;
  },

  async addCampaignUpdate(campaignId: string, update: Omit<CampaignUpdate, 'id' | 'createdAt'>): Promise<CampaignUpdate> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newUpdate: CampaignUpdate = {
      ...update,
      id: generateId(),
      createdAt: new Date(),
    };
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.updates.unshift(newUpdate);
    }
    return newUpdate;
  },

  async searchCampaigns(query: string): Promise<Campaign[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const lowercaseQuery = query.toLowerCase();
    return mockCampaigns.filter(
      c =>
        c.title.toLowerCase().includes(lowercaseQuery) ||
        c.description.toLowerCase().includes(lowercaseQuery)
    );
  },
};

export default fakeApi;
