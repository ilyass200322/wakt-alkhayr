import { format, formatDistanceToNow, isAfter, isBefore, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Campaign, Need } from '../types/models';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'd MMMM yyyy', { locale: fr });
};

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'd MMM', { locale: fr });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm', { locale: fr });
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
};

export const getCampaignStatus = (campaign: Campaign): 'active' | 'completed' | 'upcoming' => {
  const now = new Date();
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);

  if (isBefore(now, startDate)) return 'upcoming';
  if (isAfter(now, endDate)) return 'completed';
  return 'active';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: 'En cours',
    completed: 'Terminée',
    upcoming: 'À venir',
    pending: 'En attente',
    confirmed: 'Confirmé',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: '#4CAF50',
    completed: '#6B6B6B',
    upcoming: '#FF9800',
    pending: '#FF9800',
    confirmed: '#4CAF50',
  };
  return colors[status] || '#6B6B6B';
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    ramadan: 'Ramadan',
    eid: 'Aïd',
    winter: 'Hiver',
    neighborhood: 'Quartier',
    other: 'Autre',
  };
  return labels[category] || category;
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    ramadan: 'moon',
    eid: 'gift',
    winter: 'snow',
    neighborhood: 'home',
    other: 'heart',
  };
  return icons[category] || 'heart';
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    ramadan: '#1E5631',
    eid: '#C9A227',
    winter: '#5B7C99',
    neighborhood: '#8B6914',
    other: '#2D5A3D',
  };
  return colors[category] || '#2D5A3D';
};

export const calculateProgress = (need: Need): number => {
  if (need.quantityRequired === 0) return 0;
  return Math.min((need.quantityFulfilled / need.quantityRequired) * 100, 100);
};

export const calculateCampaignProgress = (campaign: Campaign): number => {
  if (campaign.needs.length === 0) return 0;
  
  const totalProgress = campaign.needs.reduce((sum, need) => {
    return sum + calculateProgress(need);
  }, 0);
  
  return totalProgress / campaign.needs.length;
};

export const getNeedTypeLabel = (type: 'material' | 'volunteer'): string => {
  return type === 'material' ? 'Don matériel' : 'Bénévolat';
};

export const getNeedTypeIcon = (type: 'material' | 'volunteer'): string => {
  return type === 'material' ? 'cube' : 'people';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+212|0)[5-7]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

export const isRamadanPeriod = (): boolean => {
  return false;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
