export type LeadStatus = 'pending' | 'assigned' | 'accepted' | 'rejected' | 'expired';

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  telegram_chat_id: string | null;
  services_offered: string[];
  lat: number;
  lon: number;
  coverage_radius_km: number;
  rating: number;
  max_daily_leads: number;
  leads_today: number;
  is_active: boolean;
  is_verified: boolean;
  credits: number;
  created_at: string;
}

export interface Lead {
  id: string;
  user_name: string;
  user_phone: string;
  user_email: string | null;
  raw_prompt: string;
  extracted_service: string | null;
  urgency_level: string | null;
  summary: string | null;
  lat: number;
  lon: number;
  status: LeadStatus;
  assigned_partner_id: string | null;
  created_at: string;
}

export interface LeadDispatchAttempt {
  id: string;
  lead_id: string;
  partner_id: string;
  status: LeadStatus;
  sent_at: string;
  responded_at: string | null;
  timeout_at: string;
}

export interface MatchedPartner {
  partner_id: string;
  partner_name: string;
  partner_email: string;
  partner_phone: string;
  partner_telegram_chat_id: string | null;
  distance_km: number;
  final_score: number;
}

export interface Qualification {
  service: string;
  urgency: 'low' | 'medium' | 'high';
  summary: string;
}

export const SERVICE_CATALOG = [
  'idraulica',
  'elettricista',
  'climatizzazione',
  'caldaia',
  'fabbro',
  'muratura',
  'tinteggiatura',
  'giardinaggio',
  'pulizie',
  'traslochi',
] as const;
