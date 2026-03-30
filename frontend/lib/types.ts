// User Roles
export type UserRole = 'donor' | 'volunteer' | 'ngo' | 'admin';

// User Status
export type VerifiedStatus = 'unverified' | 'verified' | 'banned';

// Donation Status
export type DonationStatus = 'available' | 'assigned' | 'picked' | 'delivered';

// Food Type
export type FoodType = 'human_veg' | 'human_nonveg' | 'animal_safe';

// NGO Hunger Status
export type HungerStatus = 'critical' | 'open' | 'full';

// User Record
export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  verified_status: VerifiedStatus;
  points: number;
  green_score: number;
  created_at: string;
  avatar_url?: string;
  address?: string;
  organization_name?: string;
}

// Donation Record (Matches updated Deliveries schema)
export interface Donation {
  id: string;
  restaurant_id: string;
  dish_name: string;
  food_category: string;
  quantity_kg: number;
  status: 'AVAILABLE' | 'ASSIGNED' | 'PICKED' | 'DELIVERED';
  cooked_time?: string;
  restaurant_remark?: string;
  pickup_otp?: string;
  volunteer_id?: string;
  ngo_id?: string;
  created_at: string;
  updated_at?: string;
  
  // Joined relation fields returned by /api/v1/deliveries/me
  volunteers?: { name: string };
  ngos?: { name: string };
}

// NGO Request Record
export interface NGORequest {
  id: string;
  ngo_id: string;
  hunger_status: HungerStatus;
  people_count: number;
  location: string;
  dietary_restrictions?: string[];
  created_at: string;
}

// Certificate Record
export interface Certificate {
  id: string;
  certificate_id: string; // UUID for public verification
  user_id: string;
  issued_date: string;
  milestone_name: string;
  total_kg_donated: number;
  badge_color: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// Milestone Thresholds
export const CERTIFICATE_MILESTONES = {
  bronze: { kg: 50, name: 'Bronze Contributor' },
  silver: { kg: 100, name: 'Silver Champion' },
  gold: { kg: 250, name: 'Gold Hero' },
  platinum: { kg: 500, name: 'Platinum Legend' },
};

// Session/Auth State (Supabase-powered)
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Context Types
export interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    role: UserRole,
    name: string,
    phone?: string,
    address?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

