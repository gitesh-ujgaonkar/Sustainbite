import { User, Donation, NGORequest, Certificate, CERTIFICATE_MILESTONES } from './types';

// Mock Users Database
export const mockUsers: Record<string, User> = {
  donor1: {
    id: 'donor1',
    role: 'donor',
    name: 'Pizza Palace Restaurant',
    email: 'manager@pizzapalace.com',
    phone: '+1234567890',
    verified_status: 'verified',
    points: 850,
    green_score: 92,
    created_at: '2024-01-15T10:00:00Z',
    avatar_url: '/avatars/pizza-palace.jpg',
    address: '123 Main Street, Downtown',
    organization_name: 'Pizza Palace',
  },
  donor2: {
    id: 'donor2',
    role: 'donor',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    phone: '+1234567891',
    verified_status: 'verified',
    points: 450,
    green_score: 78,
    created_at: '2024-02-01T10:00:00Z',
    avatar_url: '/avatars/sarah.jpg',
    address: '456 Oak Avenue, Uptown',
    organization_name: 'Individual Donor',
  },
  volunteer1: {
    id: 'volunteer1',
    role: 'volunteer',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    phone: '+1234567892',
    verified_status: 'verified',
    points: 620,
    green_score: 85,
    created_at: '2024-01-20T10:00:00Z',
    avatar_url: '/avatars/marcus.jpg',
    address: '789 Pine Road, Midtown',
  },
  volunteer2: {
    id: 'volunteer2',
    role: 'volunteer',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    phone: '+1234567893',
    verified_status: 'verified',
    points: 380,
    green_score: 72,
    created_at: '2024-02-10T10:00:00Z',
    avatar_url: '/avatars/emily.jpg',
    address: '321 Elm Street, Downtown',
  },
  ngo1: {
    id: 'ngo1',
    role: 'ngo',
    name: 'Hope Community Center',
    email: 'contact@hopecenter.org',
    phone: '+1234567894',
    verified_status: 'verified',
    points: 0,
    green_score: 0,
    created_at: '2023-12-01T10:00:00Z',
    avatar_url: '/avatars/hope-center.jpg',
    address: '555 Charity Lane, Southside',
    organization_name: 'Hope Community Center',
  },
  ngo2: {
    id: 'ngo2',
    role: 'ngo',
    name: 'Feed the Souls Foundation',
    email: 'info@feedsouls.org',
    phone: '+1234567895',
    verified_status: 'verified',
    points: 0,
    green_score: 0,
    created_at: '2023-11-15T10:00:00Z',
    avatar_url: '/avatars/feed-souls.jpg',
    address: '999 Unity Avenue, Northside',
    organization_name: 'Feed the Souls Foundation',
  },
  admin1: {
    id: 'admin1',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@sustainbite.com',
    phone: '+1234567896',
    verified_status: 'verified',
    points: 0,
    green_score: 100,
    created_at: '2023-10-01T10:00:00Z',
    avatar_url: '/avatars/admin.jpg',
  },
};

// Mock Donations Database
export const mockDonations: Record<string, Donation> = {
  donation1: {
    id: 'donation1',
    donor_id: 'donor1',
    food_type: 'human_nonveg',
    food_name: 'Leftover Pizzas & Garlic Bread',
    quantity_kg: 12,
    status: 'available',
    pickup_address: '123 Main Street, Downtown',
    expiry_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    is_spicy: true,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    image_url: '/donations/pizza.jpg',
  },
  donation2: {
    id: 'donation2',
    donor_id: 'donor2',
    food_type: 'human_veg',
    food_name: 'Fresh Vegetables & Fruits',
    quantity_kg: 8,
    status: 'assigned',
    volunteer_id: 'volunteer1',
    pickup_address: '456 Oak Avenue, Uptown',
    delivery_address: '555 Charity Lane, Southside',
    expiry_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    is_spicy: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    image_url: '/donations/vegetables.jpg',
  },
  donation3: {
    id: 'donation3',
    donor_id: 'donor1',
    food_type: 'animal_safe',
    food_name: 'Chicken Scraps (Unseasoned)',
    quantity_kg: 5,
    status: 'picked',
    volunteer_id: 'volunteer2',
    pickup_address: '123 Main Street, Downtown',
    picked_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiry_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    is_spicy: false,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    image_url: '/donations/animal-food.jpg',
  },
  donation4: {
    id: 'donation4',
    donor_id: 'donor2',
    food_type: 'human_nonveg',
    food_name: 'Cooked Chicken & Rice',
    quantity_kg: 15,
    status: 'delivered',
    volunteer_id: 'volunteer1',
    ngo_id: 'ngo1',
    pickup_address: '456 Oak Avenue, Uptown',
    delivery_address: '555 Charity Lane, Southside',
    expiry_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    is_spicy: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    picked_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    image_url: '/donations/cooked-food.jpg',
  },
};

// Mock NGO Requests Database
export const mockNGORequests: Record<string, NGORequest> = {
  request1: {
    id: 'request1',
    ngo_id: 'ngo1',
    hunger_status: 'open',
    people_count: 120,
    location: '555 Charity Lane, Southside',
    dietary_restrictions: ['halal', 'vegetarian'],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  request2: {
    id: 'request2',
    ngo_id: 'ngo2',
    hunger_status: 'critical',
    people_count: 250,
    location: '999 Unity Avenue, Northside',
    dietary_restrictions: [],
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
};

// Mock Certificates Database
export const mockCertificates: Record<string, Certificate> = {
  cert1: {
    id: 'cert1',
    certificate_id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: 'donor1',
    issued_date: '2024-01-20T10:00:00Z',
    milestone_name: 'Gold Hero',
    total_kg_donated: 256,
    badge_color: 'gold',
  },
  cert2: {
    id: 'cert2',
    certificate_id: '550e8400-e29b-41d4-a716-446655440001',
    user_id: 'volunteer1',
    issued_date: '2024-02-05T10:00:00Z',
    milestone_name: 'Silver Champion',
    total_kg_donated: 125,
    badge_color: 'silver',
  },
};

// Simulated API Functions (for testing)
export const db = {
  // Users
  getUserById: (id: string): User | undefined => {
    return mockUsers[id];
  },

  getUserByEmail: (email: string): User | undefined => {
    return Object.values(mockUsers).find(u => u.email === email);
  },

  getAllUsers: (): User[] => {
    return Object.values(mockUsers);
  },

  // Donations
  getDonationById: (id: string): Donation | undefined => {
    return mockDonations[id];
  },

  getActiveDonations: (): Donation[] => {
    return Object.values(mockDonations).filter(
      d => d.status === 'available' || d.status === 'assigned'
    );
  },

  getDonationsByDonor: (donorId: string): Donation[] => {
    return Object.values(mockDonations).filter(d => d.donor_id === donorId);
  },

  getDonationsByVolunteer: (volunteerId: string): Donation[] => {
    return Object.values(mockDonations).filter(d => d.volunteer_id === volunteerId);
  },

  getDonationsByStatus: (status: string): Donation[] => {
    return Object.values(mockDonations).filter(d => d.status === status);
  },

  // NGO Requests
  getNGORequestById: (id: string): NGORequest | undefined => {
    return mockNGORequests[id];
  },

  getNGORequestByNGOId: (ngoId: string): NGORequest | undefined => {
    return Object.values(mockNGORequests).find(r => r.ngo_id === ngoId);
  },

  getAllNGORequests: (): NGORequest[] => {
    return Object.values(mockNGORequests);
  },

  // Certificates
  getCertificateById: (id: string): Certificate | undefined => {
    return mockCertificates[id];
  },

  getCertificateByCertificateId: (certificateId: string): Certificate | undefined => {
    return Object.values(mockCertificates).find(c => c.certificate_id === certificateId);
  },

  getCertificatesByUser: (userId: string): Certificate[] => {
    return Object.values(mockCertificates).filter(c => c.user_id === userId);
  },

  // Stats
  getMealsSavedCount: (): number => {
    return Object.values(mockDonations)
      .filter(d => d.status === 'delivered')
      .reduce((sum, d) => sum + d.quantity_kg, 0);
  },

  getTotalDonatedByUser: (userId: string): number => {
    return Object.values(mockDonations)
      .filter(d => d.donor_id === userId)
      .reduce((sum, d) => sum + d.quantity_kg, 0);
  },

  getUserStats: (userId: string) => {
    const user = mockUsers[userId];
    if (!user) return null;

    const donations = Object.values(mockDonations).filter(d => d.donor_id === userId);
    const totalDonated = donations.reduce((sum, d) => sum + d.quantity_kg, 0);
    const deliveredCount = donations.filter(d => d.status === 'delivered').length;
    const certificates = Object.values(mockCertificates).filter(c => c.user_id === userId);

    return {
      user,
      totalDonated,
      deliveredCount,
      certificates,
      points: user.points,
      greenScore: user.green_score,
    };
  },
};
