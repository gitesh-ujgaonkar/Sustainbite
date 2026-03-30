import { User, Donation, NGORequest, Certificate, CERTIFICATE_MILESTONES } from './types';

// Mock Users Database
export const mockUsers: Record<string, User> = {
  donor1: {
    id: 'donor1',
    role: 'donor',
    name: 'Haldiram\'s Nagpur',
    email: 'manager@haldirams-nagpur.com',
    phone: '+91 712 2561234',
    verified_status: 'verified',
    points: 850,
    green_score: 92,
    created_at: '2024-01-15T10:00:00Z',
    avatar_url: '/avatars/haldirams.jpg',
    address: 'Dharampeth, Nagpur, Maharashtra 440010',
    organization_name: 'Haldiram\'s Nagpur',
  },
  donor2: {
    id: 'donor2',
    role: 'donor',
    name: 'Priya Meshram',
    email: 'priya@example.com',
    phone: '+91 99211 45678',
    verified_status: 'verified',
    points: 450,
    green_score: 78,
    created_at: '2024-02-01T10:00:00Z',
    avatar_url: '/avatars/priya.jpg',
    address: 'Shankar Nagar, Nagpur, Maharashtra 440010',
    organization_name: 'Individual Donor',
  },
  volunteer1: {
    id: 'volunteer1',
    role: 'volunteer',
    name: 'Aarav Deshmukh',
    email: 'aarav@example.com',
    phone: '+91 88056 78901',
    verified_status: 'verified',
    points: 620,
    green_score: 85,
    created_at: '2024-01-20T10:00:00Z',
    avatar_url: '/avatars/aarav.jpg',
    address: 'Sitabuldi, Nagpur, Maharashtra 440012',
  },
  volunteer2: {
    id: 'volunteer2',
    role: 'volunteer',
    name: 'Sneha Borkar',
    email: 'sneha@example.com',
    phone: '+91 70287 34567',
    verified_status: 'verified',
    points: 380,
    green_score: 72,
    created_at: '2024-02-10T10:00:00Z',
    avatar_url: '/avatars/sneha.jpg',
    address: 'Laxmi Nagar, Nagpur, Maharashtra 440022',
  },
  ngo1: {
    id: 'ngo1',
    role: 'ngo',
    name: 'Nagpur Seva Sadan',
    email: 'contact@nagpursevasadan.org',
    phone: '+91 712 2745890',
    verified_status: 'verified',
    points: 0,
    green_score: 0,
    created_at: '2023-12-01T10:00:00Z',
    avatar_url: '/avatars/seva-sadan.jpg',
    address: 'Mahal, Nagpur, Maharashtra 440002',
    organization_name: 'Nagpur Seva Sadan',
  },
  ngo2: {
    id: 'ngo2',
    role: 'ngo',
    name: 'Annapurna Foundation Nagpur',
    email: 'info@annapurnangp.org',
    phone: '+91 712 2530456',
    verified_status: 'verified',
    points: 0,
    green_score: 0,
    created_at: '2023-11-15T10:00:00Z',
    avatar_url: '/avatars/annapurna.jpg',
    address: 'Sadar, Nagpur, Maharashtra 440001',
    organization_name: 'Annapurna Foundation Nagpur',
  },
  admin1: {
    id: 'admin1',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@sustainbite.com',
    phone: '+91 712 2001234',
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
    restaurant_id: 'donor1',
    food_category: 'Vegetarian',
    dish_name: 'Poha, Sabudana Vada & Jalebi',
    quantity_kg: 12,
    status: 'AVAILABLE',
    is_spicy: true,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    cooked_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    restaurant_remark: 'Pickup from front counter.',
    pickup_address: 'Dharampeth, Nagpur, Maharashtra 440010',
  } as unknown as Donation, // Using type assertion to mock smoothly since this is a mock db
  donation2: {
    id: 'donation2',
    restaurant_id: 'donor2',
    food_category: 'Vegetarian',
    dish_name: 'Fresh Oranges & Seasonal Vegetables',
    quantity_kg: 8,
    status: 'ASSIGNED',
    volunteer_id: 'volunteer1',
    is_spicy: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    cooked_time: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  } as unknown as Donation,
  donation3: {
    id: 'donation3',
    restaurant_id: 'donor1',
    food_category: 'Non-Vegetarian',
    dish_name: 'Saoji Chicken Curry & Bhakri',
    quantity_kg: 5,
    status: 'PICKED',
    volunteer_id: 'volunteer2',
    is_spicy: true,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  } as unknown as Donation,
  donation4: {
    id: 'donation4',
    restaurant_id: 'donor2',
    food_category: 'Vegetarian',
    dish_name: 'Tarri Poha & Samosa',
    quantity_kg: 15,
    status: 'DELIVERED',
    volunteer_id: 'volunteer1',
    ngo_id: 'ngo1',
    is_spicy: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  } as unknown as Donation,
};

// Mock NGO Requests Database
export const mockNGORequests: Record<string, NGORequest> = {
  request1: {
    id: 'request1',
    ngo_id: 'ngo1',
    hunger_status: 'open',
    people_count: 120,
    location: 'Mahal, Nagpur, Maharashtra 440002',
    dietary_restrictions: ['vegetarian', 'jain'],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  request2: {
    id: 'request2',
    ngo_id: 'ngo2',
    hunger_status: 'critical',
    people_count: 250,
    location: 'Sadar, Nagpur, Maharashtra 440001',
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
      d => d.status === 'AVAILABLE' || d.status === 'ASSIGNED'
    );
  },

  getDonationsByDonor: (donorId: string): Donation[] => {
    return Object.values(mockDonations).filter(d => d.restaurant_id === donorId);
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
      .filter(d => d.status === 'DELIVERED')
      .reduce((sum, d) => sum + d.quantity_kg, 0);
  },

  getTotalDonatedByUser: (userId: string): number => {
    return Object.values(mockDonations)
      .filter(d => d.restaurant_id === userId)
      .reduce((sum, d) => sum + d.quantity_kg, 0);
  },

  getUserStats: (userId: string) => {
    const user = mockUsers[userId];
    if (!user) return null;

    const donations = Object.values(mockDonations).filter(d => d.restaurant_id === userId);
    const totalDonated = donations.reduce((sum, d) => sum + d.quantity_kg, 0);
    const deliveredCount = donations.filter(d => d.status === 'DELIVERED').length;
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
