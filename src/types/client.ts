export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  socialMedia: string;
  messengers: string;
  status: 'new' | 'called' | 'callback' | 'interested' | 'not_interested';
  comment: string;
  fullContent: string;
  lastCallDate?: string;
  createdAt: string;
}

export interface CallScript {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  totalClients: number;
  calledClients: number;
  successfulCalls: number;
  scriptId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalClients: number;
  callsToday: number;
  successRate: number;
  activeCampaigns: number;
}
