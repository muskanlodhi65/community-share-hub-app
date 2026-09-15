export interface SampleItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  condition: string;
  is_available: boolean;
  is_verified: boolean;
  location: string;
  max_borrow_days: number;
  deposit_amount: number;
  listing_type: string;
  price: number;
  created_at: string;
  owner_id: string;
  categories: { name: string };
  owner: {
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
    bio: string;
  };
}

export const sampleItems: SampleItem[] = [
  {
    id: 'drill-01',
    title: 'DeWalt 20V Max Cordless Drill Kit',
    description: 'High-power 20V cordless drill with 2 lithium-ion rechargeable batteries, fast charger, and a complete 24-piece titanium drill bit set. Ideal for home repair, furniture assembly, and woodworking.',
    image_url: '/items/drill.jpg',
    condition: 'like_new',
    is_available: true,
    is_verified: true,
    location: 'Green Park, South Delhi',
    max_borrow_days: 7,
    deposit_amount: 500,
    listing_type: 'borrow',
    price: 0,
    created_at: '2026-09-14T10:00:00.000Z',
    owner_id: 'user-01',
    categories: { name: 'Tools' },
    owner: {
      full_name: 'Rahul Mehta',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      is_verified: true,
      bio: 'Mechanical engineer & DIY maker. Passionate about community sharing and zero waste.'
    }
  },
  {
    id: 'camera-02',
    title: 'Canon EOS DSLR Camera 4K with 18-55mm IS Lens',
    description: 'Professional 24.2 MP DSLR camera with 18-55mm IS STM lens, 64GB ultra-speed SD card, padded carry bag, and backup battery. Perfect for family portraits, events, and YouTube filming.',
    image_url: '/items/camera.jpg',
    condition: 'good',
    is_available: true,
    is_verified: true,
    location: 'Hauz Khas, New Delhi',
    max_borrow_days: 5,
    deposit_amount: 2000,
    listing_type: 'rent',
    price: 150,
    created_at: '2026-09-14T09:30:00.000Z',
    owner_id: 'user-02',
    categories: { name: 'Electronics' },
    owner: {
      full_name: 'Priya Sharma',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      is_verified: true,
      bio: 'Freelance photographer & visual designer. Please handle lens elements with microfiber cloth.'
    }
  },
  {
    id: 'controller-03',
    title: 'RedGear Pro Wireless Dual-Vibration Gamepad',
    description: 'Ergonomic 2.4GHz wireless gamepad with textured grips, dual rumble motors, and 10 hours of rechargeable play. Plug and play for Windows PC, Android TV, and gaming setups.',
    image_url: '/items/controller.jpg',
    condition: 'like_new',
    is_available: true,
    is_verified: true,
    location: 'Saket, New Delhi',
    max_borrow_days: 14,
    deposit_amount: 400,
    listing_type: 'rent',
    price: 80,
    created_at: '2026-09-14T08:15:00.000Z',
    owner_id: 'user-03',
    categories: { name: 'Electronics' },
    owner: {
      full_name: 'Arjun Kapoor',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      is_verified: true,
      bio: 'Software engineer & casual gamer. Controller is sanitized and comes with wireless nano dongle.'
    }
  },
  {
    id: 'books-04',
    title: 'Atomic Habits & Psychology of Money Bestseller Set',
    description: 'Paperback edition of James Clear\'s Atomic Habits and Morgan Housel\'s The Psychology of Money. Clean pages, no highlights, pristine spine. Free to borrow for community book lovers.',
    image_url: '/items/books.jpg',
    condition: 'like_new',
    is_available: true,
    is_verified: true,
    location: 'Lajpat Nagar, New Delhi',
    max_borrow_days: 21,
    deposit_amount: 100,
    listing_type: 'borrow',
    price: 0,
    created_at: '2026-09-13T16:00:00.000Z',
    owner_id: 'user-04',
    categories: { name: 'Books' },
    owner: {
      full_name: 'Sneha Roy',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      is_verified: true,
      bio: 'Content strategist & avid reader. Sharing books to promote reading habits in our neighbourhood.'
    }
  },
  {
    id: 'tent-05',
    title: 'Quechua 4-Person Waterproof Camping Tent & Lantern',
    description: 'Double-walled dome tent engineered to resist 50 km/h winds and tropical downpours. Includes waterproof ground tarp, lightweight alloy poles, 12 stakes, and rechargeable LED tent lantern.',
    image_url: '/categories/outdoors.jpg',
    condition: 'like_new',
    is_available: true,
    is_verified: true,
    location: 'Connaught Place, Central Delhi',
    max_borrow_days: 7,
    deposit_amount: 1500,
    listing_type: 'rent',
    price: 100,
    created_at: '2026-09-13T11:20:00.000Z',
    owner_id: 'user-05',
    categories: { name: 'Outdoors' },
    owner: {
      full_name: 'Vikram Malhotra',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      is_verified: true,
      bio: 'Himalayan trekker. Great tent for weekend getaways to Rishikesh or Kasol.'
    }
  },
  {
    id: 'mower-06',
    title: 'Bosch 1400W Electric Lawn Mower & Trimmer Kit',
    description: 'Rotak 32 electric lawn mower with hardened steel blade, 31-liter grass collector, and ergonomic handles. Comes with a 15-meter outdoor heavy-duty extension cord for easy garden coverage.',
    image_url: '/categories/gardening.jpg',
    condition: 'good',
    is_available: true,
    is_verified: true,
    location: 'Vasant Kunj, New Delhi',
    max_borrow_days: 3,
    deposit_amount: 600,
    listing_type: 'borrow',
    price: 0,
    created_at: '2026-09-12T14:45:00.000Z',
    owner_id: 'user-06',
    categories: { name: 'Gardening' },
    owner: {
      full_name: 'Ananya Joshi',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      is_verified: true,
      bio: 'Gardening enthusiast. Let us keep our neighbourhood green, clean, and beautiful!'
    }
  },
  {
    id: 'mixer-07',
    title: 'Philips 1000W Stand Mixer & Food Processor',
    description: 'Multi-speed kitchen stand mixer with 4L stainless steel mixing bowl, dough kneader, wire whisk, flat beater, and 1.5L multi-purpose blender attachment. Great for festive baking and parties.',
    image_url: '/categories/kitchen.jpg',
    condition: 'like_new',
    is_available: true,
    is_verified: true,
    location: 'Dwarka, West Delhi',
    max_borrow_days: 5,
    deposit_amount: 1000,
    listing_type: 'rent',
    price: 90,
    created_at: '2026-09-12T10:10:00.000Z',
    owner_id: 'user-07',
    categories: { name: 'Kitchen' },
    owner: {
      full_name: 'Sunita Verma',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      is_verified: true,
      bio: 'Home chef & baker. All attachments are thoroughly sterilized after every use.'
    }
  },
  {
    id: 'toolkit-08',
    title: 'Taparia 120-Piece Heavy Duty Hardware Toolkit',
    description: 'Chrome vanadium alloy steel mechanic and handyman toolkit. Includes 1/4 and 1/2 inch drive ratchet sockets, combination wrenches, precision screwdrivers, claw hammer, pliers, and voltage tester.',
    image_url: '/categories/hardware.jpg',
    condition: 'good',
    is_available: true,
    is_verified: true,
    location: 'Noida Sector 62',
    max_borrow_days: 7,
    deposit_amount: 500,
    listing_type: 'borrow',
    price: 0,
    created_at: '2026-09-11T17:30:00.000Z',
    owner_id: 'user-08',
    categories: { name: 'Hardware' },
    owner: {
      full_name: 'Aman Gupta',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      is_verified: true,
      bio: 'Civil engineer & builder. Never buy a tool you only use twice a year — borrow it instead!'
    }
  }
];
