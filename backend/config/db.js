const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMockDB = false;
const MOCK_DB_PATH = path.join(__dirname, '..', 'data', 'mock_db.json');

const getDefaultStadiumPoints = () => [
  {
    id: "gate_a",
    name: "Gate A (North Entrance)",
    type: "gate",
    x: 250,
    y: 50,
    crowdLevel: 75,
    queueSize: 220,
    status: "congested",
    accessible: true,
    description: "Main north entry gate. Near VIP lounge and North parking.",
    typeIcon: "LogOut"
  },
  {
    id: "gate_b",
    name: "Gate B (South Entrance)",
    type: "gate",
    x: 250,
    y: 450,
    crowdLevel: 25,
    queueSize: 45,
    status: "clear",
    accessible: true,
    description: "South entry gate. Nearest to the subway terminal link.",
    typeIcon: "LogOut"
  },
  {
    id: "gate_c",
    name: "Gate C (East Entrance)",
    type: "gate",
    x: 450,
    y: 250,
    crowdLevel: 45,
    queueSize: 110,
    status: "moderate",
    accessible: true,
    description: "East gate entrance. Connects to East parking lot and rideshare zone.",
    typeIcon: "LogOut"
  },
  {
    id: "gate_d",
    name: "Gate D (West Entrance)",
    type: "gate",
    x: 50,
    y: 250,
    crowdLevel: 90,
    queueSize: 340,
    status: "critical",
    accessible: false,
    description: "West gate entrance. Currently seeing high congestion due to ticket scanning delays.",
    typeIcon: "LogOut"
  },
  {
    id: "restroom_n1",
    name: "Restroom Block - North Tier 1",
    type: "restroom",
    x: 180,
    y: 120,
    crowdLevel: 65,
    queueSize: 14,
    status: "moderate",
    accessible: true,
    description: "Unisex restroom near Food Stall A. Elevator accessible.",
    typeIcon: "Coffee"
  },
  {
    id: "restroom_s1",
    name: "Restroom Block - South Tier 1",
    type: "restroom",
    x: 180,
    y: 380,
    crowdLevel: 20,
    queueSize: 3,
    status: "clear",
    accessible: true,
    description: "ADA-compliant restroom near Sector S4.",
    typeIcon: "Coffee"
  },
  {
    id: "restroom_e1",
    name: "Restroom Block - East Tier 1",
    type: "restroom",
    x: 380,
    y: 180,
    crowdLevel: 85,
    queueSize: 28,
    status: "congested",
    accessible: false,
    description: "Stairs-only access restroom. Currently busy.",
    typeIcon: "Coffee"
  },
  {
    id: "restroom_w1",
    name: "Restroom Block - West Tier 1",
    type: "restroom",
    x: 120,
    y: 280,
    crowdLevel: 40,
    queueSize: 8,
    status: "clear",
    accessible: true,
    description: "Accessible restroom block near Sector W2.",
    typeIcon: "Coffee"
  },
  {
    id: "food_tacos",
    name: "Taco Kickoff Concession",
    type: "food",
    x: 320,
    y: 120,
    crowdLevel: 55,
    queueSize: 18,
    status: "moderate",
    accessible: true,
    description: "Tacos, Nachos and soft drinks. Wheelchair friendly ramp.",
    typeIcon: "Utensils"
  },
  {
    id: "food_burgers",
    name: "Golden Boot Burgers",
    type: "food",
    x: 320,
    y: 380,
    crowdLevel: 88,
    queueSize: 42,
    status: "congested",
    accessible: true,
    description: "Gourmet burgers and fries. Very popular during half-time.",
    typeIcon: "Utensils"
  },
  {
    id: "food_vegan",
    name: "Green Fields Vegan",
    type: "food",
    x: 120,
    y: 180,
    crowdLevel: 30,
    queueSize: 6,
    status: "clear",
    accessible: true,
    description: "Vegan wraps, salads, and healthy smoothies. Step-free access.",
    typeIcon: "Utensils"
  },
  {
    id: "food_merch",
    name: "FIFA Official Merch Stall",
    type: "food",
    x: 380,
    y: 320,
    crowdLevel: 70,
    queueSize: 25,
    status: "moderate",
    accessible: true,
    description: "Official merchandise, jerseys, flags, and programs.",
    typeIcon: "Utensils"
  }
];

const getDefaultAlerts = () => [
  {
    id: "alert_1",
    type: "warning",
    message: "Gate D West Entrance experiencing extremely high congestion. All incoming fans are advised to reroute to Gate B (South Entrance) or Gate C (East Entrance).",
    timestamp: new Date().toISOString(),
    active: true,
    source: "AI Dispatch"
  },
  {
    id: "alert_2",
    type: "info",
    message: "Elevator EL-3 in the East Sector is fully operational. Wheelchair users can access upper decks through this node.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    active: true,
    source: "System Log"
  }
];

let isInitialized = false;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    mongoose.set('strictQuery', false);
    // Use short timeout to fallback quickly in development
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB Connected successfully.');
  } catch (err) {
    console.warn(`MongoDB Connection Failed: ${err.message}. Initializing local JSON fallback database...`);
    isMockDB = true;
    initializeMockDB();
  } finally {
    isInitialized = true;
  }
};

const initializeMockDB = () => {
  const dir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const initialData = {
      users: [],
      stadiumPoints: getDefaultStadiumPoints(),
      alerts: getDefaultAlerts()
    };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialData, null, 2));
    console.log('Initialized mock JSON database at', MOCK_DB_PATH);
  } else {
    console.log('Using existing mock JSON database at', MOCK_DB_PATH);
  }
};

// Database operation wrappers
const readMockDB = () => {
  if (!isMockDB) return null;
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
  } catch (err) {
    console.error('Error reading mock DB', err);
    return { users: [], stadiumPoints: [], alerts: [] };
  }
};

const writeMockDB = (data) => {
  if (!isMockDB) return;
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing mock DB', err);
  }
};

module.exports = {
  connectDB,
  isMockDB: () => isMockDB,
  isInitialized: () => isInitialized,
  readMockDB,
  writeMockDB,
  getDefaultStadiumPoints,
  getDefaultAlerts
};
