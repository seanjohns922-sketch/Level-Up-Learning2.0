import type { EconomyItem } from "@/lib/economy";

/** Premium upgradeable items: the four home styles, the Fair Ride, the trampoline and the
 * Protect the Tower set, each with four levels. ("Home" in the names is historical; the live shop rows use it.)
 * Unlocking a style and each upgrade are ordinary XP purchases, so the server
 * checks the balance and records ownership. A style's level is the highest
 * upgrade the learner owns; every copy they place shows that level. */
export const DEFENCE_STYLES = ["laser_fence", "laser_gate", "scanner", "trip_wire", "drone_pad", "guard_dog", "patrol_drone", "sentry_bot", "tower_shield"] as const;
/** The everyday keepers: free at Level 1 (they are the editor's long-standing free items), upgraded with XP. */
export const EVERYDAY_STYLES = ["lamp_post", "bench", "fence", "mailbox", "campfire"] as const;
/** City Life: everyday places, unlocked with XP. */
export const CITY_LIFE_STYLES = ["playground", "cricket_nets", "park_bbq", "cubby_house", "outdoor_setting", "bus_stop", "food_truck", "vending_kiosk"] as const;
/** City Life, set 2: bigger places to save up for, unlocked with XP (same City Life tab). */
export const CITY_PLACES_STYLES = ["servo", "car_wash", "pizza_shop", "supermarket", "police_station", "hospital", "vet_pet_shop", "dog_park"] as const;
/** Street pieces: free at Level 1 in the build picker's Street tab, upgraded with XP. */
export const STREET_STYLES = ["traffic_lights", "zebra_crossing", "wheelie_bins", "bike_rack", "hills_hoist", "water_tank", "shade_sail", "driveway_hoop"] as const;
/** Main Street: the town's buildings, unlocked with XP. */
export const MAIN_STREET_STYLES = ["corner_shop", "cafe", "library", "town_hall", "school", "fire_station"] as const;
/** Sports: playable courts and goals, unlocked with XP (the basketball court lives in the same tab). */
export const SPORTS_STYLES = ["tennis", "soccer", "footy", "netball"] as const;
/** Water: a lake explorers swim in, unlocked with XP. */
export const WATER_STYLES = ["swimming_lake"] as const;
export const PREMIUM_HOME_STYLES = ["cottage", "modern", "treehouse", "apartment", "fair", "trampoline", "basketball", ...DEFENCE_STYLES, ...EVERYDAY_STYLES, ...CITY_LIFE_STYLES, ...MAIN_STREET_STYLES, ...SPORTS_STYLES, ...WATER_STYLES, ...CITY_PLACES_STYLES, ...STREET_STYLES] as const;
export type PremiumHomeStyle = (typeof PREMIUM_HOME_STYLES)[number];
export type PremiumHomeLevel = 1 | 2 | 3 | 4;
export const PREMIUM_HOME_MAX_LEVEL: PremiumHomeLevel = 4;

type StyleSpec = {
  name: string;
  description: string;
  levels: readonly [string, string, string, string];
  /** XP to unlock (level 1), then to reach levels 2, 3 and 4. */
  prices: readonly [number, number, number, number];
  gridSize: `${number}x${number}`;
  accent: string;
  icon: string;
  /** World model key; the shop row is central_world_plot_1_<assetKey>. */
  assetKey: string;
  marketplaceCategory: "buildings" | "pools_play" | "defence" | "city_life" | "main_street" | "sports" | "water";
  upgradePrefix: string;
  /** Level 1 is free in the editor's Defence tab (it replaced a free castle piece); only upgrades cost XP. */
  free?: boolean;
  /** Not placed by the learner: it stands in a fixed spot (the Tower Shield goes round the Tower). */
  fixed?: boolean;
  /** World metres to the top of the model (name tags sit just above); homes use the default. */
  height?: number;
  /** Modelled in world metres already (the homes are modelled small and scaled up). */
  metres?: boolean;
  /** For metre models: how much bigger it stands in the hub than real life, to match the world's scale
   * (its trees are about 14 m and the Tower about 58 m). */
  scale?: number;
};
const HOME = { marketplaceCategory: "buildings", upgradePrefix: "central_world_home_upgrade_" } as const;
const SET_PIECE = { marketplaceCategory: "pools_play", upgradePrefix: "central_world_set_upgrade_" } as const;
const DEFENCE = { marketplaceCategory: "defence", upgradePrefix: "central_world_defence_upgrade_", metres: true } as const;
const EVERYDAY = { marketplaceCategory: "buildings", upgradePrefix: "central_world_everyday_upgrade_", metres: true, free: true } as const;
const CITY = { marketplaceCategory: "city_life", upgradePrefix: "central_world_city_upgrade_", metres: true } as const;
const CITY_SMALL_PRICES = [200, 200, 400, 800] as const;
const CITY_BIG_PRICES = [350, 350, 700, 1400] as const;
const CITY_SHOP_PRICES = [400, 400, 800, 1600] as const;
const CITY_CIVIC_PRICES = [500, 500, 1000, 2000] as const;
const STREET = { marketplaceCategory: "buildings", upgradePrefix: "central_world_street_upgrade_", metres: true, free: true } as const;
const STREET_PRICES = [0, 100, 200, 400] as const;
const MAIN = { marketplaceCategory: "main_street", upgradePrefix: "central_world_main_upgrade_", metres: true } as const;
const MAIN_SHOP_PRICES = [400, 400, 800, 1600] as const;
const MAIN_CIVIC_PRICES = [500, 500, 1000, 2000] as const;
const SPORT = { marketplaceCategory: "sports", upgradePrefix: "central_world_sports_upgrade_", metres: true } as const;
const SPORT_PRICES = [400, 400, 800, 1600] as const;
const WATER = { marketplaceCategory: "water", upgradePrefix: "central_world_water_upgrade_", metres: true } as const;

export const PREMIUM_HOME_SPECS: Record<PremiumHomeStyle, StyleSpec> = {
  cottage: {
    name: "Cottage",
    description: "A storybook home with shingle roofs, shutters, flower boxes and a smoking chimney.",
    levels: ["Cosy Hut", "Cottage", "Family House", "Grand Villa"],
    prices: [300, 300, 600, 1200],
    gridSize: "10x6",
    accent: "#ff5e57",
    icon: "house",
    assetKey: "home_cottage",
    ...HOME,
  },
  modern: {
    name: "Modern Home",
    description: "Flat roofs, big glass walls, timber battens, solar panels and, later, a pool.",
    levels: ["Tiny Cabin", "Modern Home", "Two-Storey with Pool", "Glass Mansion"],
    prices: [500, 400, 800, 1600],
    gridSize: "6x6",
    accent: "#3a3f4a",
    icon: "house",
    assetKey: "home_modern",
    ...HOME,
  },
  treehouse: {
    name: "Treehouse Home",
    description: "Ladders, slides and rope bridges, growing into a glowing giant tree.",
    levels: ["Platform Hut", "Treehouse with Slide", "Two Levels and a Bridge", "Glowing Giant Tree"],
    prices: [600, 450, 900, 1800],
    gridSize: "9x8",
    accent: "#48c25a",
    icon: "trees",
    assetKey: "home_treehouse",
    ...HOME,
  },
  apartment: {
    name: "Apartment Block",
    description: "Grows taller with every upgrade, from a brick walk-up to a sky tower with a rooftop pool.",
    levels: ["3-Storey Walk-up", "5 Storeys with Balconies", "8 Storeys with Rooftop Garden", "Sky Tower with Rooftop Pool"],
    prices: [800, 600, 1200, 2400],
    gridSize: "6x5",
    accent: "#7fa8c9",
    icon: "building-2",
    assetKey: "home_apartment",
    ...HOME,
  },
  fair: {
    name: "Fair Ride",
    description: "A whole fairground that grows with you: carousel, swing ride, then a towering Ferris wheel that glows at night.",
    levels: ["Grand Carousel", "Carousel and Swing Ride", "Ferris Wheel Fair", "Giant Neon Fair"],
    prices: [900, 700, 1400, 2800],
    gridSize: "25x16",
    accent: "#ff4fd8",
    icon: "ferris-wheel",
    assetKey: "ride_fair",
    ...SET_PIECE,
  },
  trampoline: {
    name: "Trampoline",
    description: "Jump on and bounce! Every upgrade bounces you higher, up to a glowing trampoline park.",
    levels: ["Mini Trampoline", "Big Trampoline", "Trampoline and Foam Pit", "Trampoline Park"],
    prices: [250, 250, 500, 1000],
    gridSize: "7x7",
    accent: "#3fd0ff",
    icon: "party-popper",
    assetKey: "play_trampoline",
    ...SET_PIECE,
  },
  basketball: {
    name: "Basketball Court",
    description: "Shoot hoops! Walk on, tap Shoot and score. Grows from a driveway hoop to a neon arena with a scoreboard.",
    levels: ["Driveway Hoop", "Half Court", "Floodlit Full Court", "Neon Arena"],
    prices: [300, 300, 600, 1200],
    gridSize: "9x9",
    accent: "#ff7a1a",
    icon: "dribbble",
    assetKey: "play_basketball",
    ...SET_PIECE,
    // Sold in the Sports tab; its upgrades keep their original keys.
    marketplaceCategory: "sports",
    height: 9,
    metres: true,
    scale: 1.2,
  },
  laser_fence: {
    name: "Laser Fence",
    description: "Lasers between posts that join up as you place them. Walk into it and you get zapped back!",
    levels: ["Red Lasers", "Triple Lasers", "Energy Wall", "Neon Laser Wall"],
    prices: [0, 300, 600, 1200],
    gridSize: "1x1",
    accent: "#ff3b4e",
    icon: "zap",
    assetKey: "defence_laser_fence",
    height: 3.8,
    ...DEFENCE,
    free: true,
  },
  laser_gate: {
    scale: 2.2,
    name: "Laser Gate",
    description: "A gate of lasers that drops when you walk up and closes behind you.",
    levels: ["Laser Bars", "Energy Curtain", "Pylon Gate", "Neon Arch"],
    prices: [0, 400, 800, 1600],
    gridSize: "6x1",
    accent: "#3fe6ff",
    icon: "door-open",
    assetKey: "defence_laser_gate",
    height: 9.5,
    ...DEFENCE,
    free: true,
  },
  scanner: {
    scale: 4.6,
    name: "Scanner Tower",
    description: "A tech tower that sweeps lasers round and locks on to anyone who comes close.",
    levels: ["Holo Scanner", "Radar Halo", "Sensor Arms", "Sky Beacon"],
    prices: [0, 400, 800, 1600],
    gridSize: "7x7",
    accent: "#3fe6ff",
    icon: "radar",
    assetKey: "defence_scanner",
    height: 30,
    ...DEFENCE,
    free: true,
  },
  trip_wire: {
    scale: 2,
    name: "Trip Wire Alarm",
    description: "Ankle-height laser wires. Step over one and the alarm goes off!",
    levels: ["One Wire", "Wires and Siren", "Laser Cross", "Laser Box"],
    prices: [250, 250, 500, 1000],
    gridSize: "4x4",
    accent: "#ff3b4e",
    icon: "siren",
    assetKey: "defence_trip_wire",
    height: 4.4,
    ...DEFENCE,
  },
  drone_pad: {
    scale: 2,
    name: "Security Drone Pad",
    description: "A landing pad with security drones that fly over and escort you.",
    levels: ["One Drone", "Drone Patrol", "Drone Squad", "Spotlight Squad"],
    prices: [500, 450, 900, 1800],
    gridSize: "3x3",
    accent: "#3fe6ff",
    icon: "plane",
    assetKey: "defence_drone_pad",
    height: 10,
    ...DEFENCE,
  },
  guard_dog: {
    scale: 1.5,
    name: "Robo Guard Dog",
    description: "Robot guard dogs that patrol round their kennel. Walk up and they bark, then wag!",
    levels: ["Robo Pup", "Guard Pair", "Scanner Dogs", "Hover Hounds"],
    prices: [400, 400, 800, 1600],
    gridSize: "4x4",
    accent: "#3fe6ff",
    icon: "dog",
    assetKey: "defence_guard_dog",
    height: 3.4,
    ...DEFENCE,
  },
  patrol_drone: {
    scale: 2,
    name: "Patrol Drone",
    description: "A drone that flies a big figure-eight patrol and swings its searchlight onto you.",
    levels: ["Patrol Drone", "Searchlight Drone", "Scanner Pair", "Jet Drones"],
    prices: [450, 400, 800, 1600],
    gridSize: "3x3",
    accent: "#3fe6ff",
    icon: "plane",
    assetKey: "defence_patrol_drone",
    height: 12,
    ...DEFENCE,
  },
  sentry_bot: {
    scale: 2,
    name: "Sentry Bot",
    description: "A friendly security robot that rolls up and down its patch and waves hello.",
    levels: ["Sentry Bot", "Siren Bot", "Hover Guard", "Shield Guard"],
    prices: [350, 350, 700, 1400],
    gridSize: "3x3",
    accent: "#3fe6ff",
    icon: "bot",
    assetKey: "defence_sentry_bot",
    height: 6.6,
    ...DEFENCE,
  },
  tower_shield: {
    name: "Tower Shield",
    description: "A giant energy shield over the whole Tower. Every upgrade makes it more amazing.",
    levels: ["Energy Shield", "Hex Shield", "Orbit Shield", "Legendary Shield"],
    prices: [800, 600, 1200, 2400],
    gridSize: "1x1",
    accent: "#ff4fd8",
    icon: "shield",
    assetKey: "defence_tower_shield",
    height: 62,
    ...DEFENCE,
    fixed: true,
  },
  // The everyday keepers keep their original world keys, so every one already placed upgrades in place.
  lamp_post: {
    scale: 1.35,
    name: "Lamp Post",
    description: "A street lamp that glows after dark, from a park lamp to a floating crystal.",
    levels: ["Park Lamp", "Double Lantern", "Smart Halo Lamp", "Crystal Lamp"],
    prices: [0, 100, 200, 400],
    gridSize: "1x1",
    accent: "#f5c451",
    icon: "lamp",
    assetKey: "lamp_post",
    height: 6.3,
    ...EVERYDAY,
  },
  bench: {
    scale: 1.2,
    name: "Bench",
    description: "A seat for your world, from a park bench to a glowing swing seat.",
    levels: ["Park Bench", "Garden Bench", "Pergola Bench", "Swing Seat"],
    prices: [0, 100, 200, 400],
    gridSize: "2x1",
    accent: "#b6763f",
    icon: "sofa",
    assetKey: "bench",
    height: 3.5,
    ...EVERYDAY,
  },
  fence: {
    name: "Fence",
    description: "A fence that joins up as you place it, from timber rails to glass and gold.",
    levels: ["Rail Fence", "Picket Fence", "Modern Slat Fence", "Crystal Fence"],
    prices: [0, 80, 160, 320],
    gridSize: "1x1",
    accent: "#c69a63",
    icon: "fence",
    assetKey: "fence",
    height: 1.8,
    ...EVERYDAY,
  },
  mailbox: {
    scale: 1.15,
    name: "Mailbox",
    description: "Your own letterbox, all the way up to a drone that brings the mail.",
    levels: ["Letterbox", "Mini House Mailbox", "Brick Pillar Mailbox", "Drone Mail Station"],
    prices: [0, 100, 200, 400],
    gridSize: "1x1",
    accent: "#d0463f",
    icon: "mailbox",
    assetKey: "mailbox",
    height: 3,
    ...EVERYDAY,
  },
  campfire: {
    name: "Campfire",
    description: "A crackling campfire to sit round, up to magic flames that change colour.",
    levels: ["Campfire", "Cosy Campfire", "Camp Circle", "Magic Campfire"],
    prices: [0, 150, 300, 600],
    gridSize: "2x2",
    accent: "#ff7a1a",
    icon: "flame",
    assetKey: "campfire",
    height: 2.6,
    ...EVERYDAY,
  },
  // City Life models live in components/world3d/premium-items/CityLifeItems.tsx.
  playground: {
    name: "Playground",
    description: "Swings, slides and climbing towers, growing into an adventure playground with a flying fox.",
    levels: ["Swing Set", "Swings & Slide", "Climbing Frame", "Adventure Playground"],
    prices: CITY_BIG_PRICES,
    gridSize: "5x5",
    accent: "#22c3b3",
    icon: "ferris-wheel",
    assetKey: "city_playground",
    height: 4.6,
    ...CITY,
  },
  cricket_nets: {
    name: "Cricket Nets",
    description: "Backyard stumps up to floodlit nets with a bowling machine that really bowls.",
    levels: ["Backyard Stumps", "Cricket Pitch", "Practice Net", "Floodlit Nets"],
    prices: CITY_BIG_PRICES,
    gridSize: "4x6",
    accent: "#2f8f4a",
    icon: "target",
    assetKey: "city_cricket_nets",
    height: 6,
    ...CITY,
  },
  park_bbq: {
    name: "Park BBQ",
    description: "An Aussie park barbie that sizzles, up to a pavilion with festoon lights.",
    levels: ["Brick BBQ", "BBQ & Table", "BBQ Shelter", "BBQ Pavilion"],
    prices: CITY_SMALL_PRICES,
    gridSize: "3x3",
    accent: "#b5553c",
    icon: "flame",
    assetKey: "city_park_bbq",
    height: 3.6,
    ...CITY,
  },
  cubby_house: {
    name: "Cubby House",
    description: "A box fort that grows into a two-storey lookout cubby with a slide.",
    levels: ["Box Fort", "Timber Cubby", "Cubby with Slide", "Lookout Cubby"],
    prices: CITY_SMALL_PRICES,
    gridSize: "3x3",
    accent: "#9a63ff",
    icon: "house",
    assetKey: "city_cubby_house",
    height: 5,
    ...CITY,
  },
  outdoor_setting: {
    name: "Outdoor Setting",
    description: "Deck chairs up to an outdoor kitchen with a glowing pizza oven.",
    levels: ["Deck Chairs", "Table & Umbrella", "Pergola", "Outdoor Kitchen"],
    prices: CITY_SMALL_PRICES,
    gridSize: "3x3",
    accent: "#c98a52",
    icon: "sofa",
    assetKey: "city_outdoor_setting",
    height: 3.4,
    ...CITY,
  },
  bus_stop: {
    name: "Bus Stop",
    description: "A bus stop with its own kerb, up to a transit hub where the bus pulls in.",
    levels: ["Bus Stop Sign", "Bus Shelter", "Smart Shelter", "Transit Hub"],
    prices: CITY_BIG_PRICES,
    gridSize: "5x3",
    accent: "#1f8f4e",
    icon: "bus",
    assetKey: "city_bus_stop",
    height: 4,
    ...CITY,
  },
  food_truck: {
    name: "Food Truck",
    description: "A coffee cart that grows into a neon night-market food truck.",
    levels: ["Coffee Cart", "Food Truck", "Truck & Seating", "Night-Market Truck"],
    prices: CITY_BIG_PRICES,
    gridSize: "4x3",
    accent: "#ff9f45",
    icon: "truck",
    assetKey: "city_food_truck",
    height: 4.4,
    ...CITY,
  },
  vending_kiosk: {
    name: "Vending & ATM",
    description: "A glowing vending machine up to a 24/7 corner kiosk with an ATM.",
    levels: ["Vending Machine", "Drinks & Snacks", "Kiosk", "24/7 Corner Kiosk"],
    prices: CITY_SMALL_PRICES,
    gridSize: "2x2",
    accent: "#d83a3a",
    icon: "store",
    assetKey: "city_vending_kiosk",
    height: 3.8,
    ...CITY,
  },
  // City Life set 2 models live in components/world3d/premium-items/CityPlacesItems.tsx.
  servo: {
    name: "Servo",
    description: "A petrol station whose pumps light up when you pull in, up to EV chargers and a glowing price pylon.",
    levels: ["Two Pumps", "Servo Shop", "Car Wash Bay", "EV Chargers"],
    prices: CITY_SHOP_PRICES,
    gridSize: "7x6",
    accent: "#e5484d",
    icon: "fuel",
    assetKey: "city_servo",
    height: 7,
    ...CITY,
  },
  car_wash: {
    name: "Car Wash",
    description: "A hose bay that grows into a neon tunnel whose brushes whirl and bubble when you go through.",
    levels: ["Hose Bay", "Brush Tunnel", "Rainbow Foam", "Neon Tunnel"],
    prices: CITY_BIG_PRICES,
    gridSize: "6x4",
    accent: "#3aa0ff",
    icon: "droplets",
    assetKey: "city_car_wash",
    height: 5,
    ...CITY,
  },
  pizza_shop: {
    name: "Pizza Shop",
    description: "A takeaway with a glowing wood-fire oven, up to a delivery scooter and a giant pizza slice on the roof.",
    levels: ["Takeaway", "Pizzeria", "Delivery Scooter", "Rooftop Slice"],
    prices: CITY_SHOP_PRICES,
    gridSize: "6x5",
    accent: "#2f8f4a",
    icon: "pizza",
    assetKey: "city_pizza_shop",
    height: 7.6,
    ...CITY,
  },
  supermarket: {
    name: "Supermarket",
    description: "A mini mart up to a big supermarket with a car park; the doors slide open as you walk up.",
    levels: ["Mini Mart", "Supermarket", "Car Park", "Solar Supermarket"],
    prices: CITY_SHOP_PRICES,
    gridSize: "9x7",
    accent: "#e5484d",
    icon: "shopping-cart",
    assetKey: "city_supermarket",
    height: 6,
    ...CITY,
  },
  police_station: {
    name: "Police Station",
    description: "A station with a blue lamp, up to a lookout tower, a rooftop helipad and patrol cars with flashing lights.",
    levels: ["Station", "Patrol Car", "Lookout Tower", "Helipad"],
    prices: CITY_CIVIC_PRICES,
    gridSize: "6x5",
    accent: "#1f4fa8",
    icon: "shield",
    assetKey: "city_police_station",
    height: 9.6,
    ...CITY,
  },
  hospital: {
    name: "Hospital",
    description: "A friendly clinic that grows into a big hospital where a rescue helicopter lands on the roof.",
    levels: ["Clinic", "Ambulance Bay", "Hospital Wing", "Roof Helipad"],
    prices: CITY_CIVIC_PRICES,
    gridSize: "8x6",
    accent: "#1aa39a",
    icon: "hospital",
    assetKey: "city_hospital",
    height: 11,
    ...CITY,
  },
  vet_pet_shop: {
    name: "Vet & Pet Shop",
    description: "Puppies tumbling in the window, up to a play yard where a puppy trots over to you.",
    levels: ["Pet Shop", "Vet", "Play Yard", "Pet Hotel"],
    prices: CITY_SHOP_PRICES,
    gridSize: "5x4",
    accent: "#ff9f45",
    icon: "paw-print",
    assetKey: "city_vet_pet_shop",
    height: 6.6,
    ...CITY,
  },
  dog_park: {
    name: "Dog Park",
    description: "A fenced park where dogs run laps and leap the jumps, up to a splash pad and a dog café.",
    levels: ["Fenced Park", "Agility Jumps", "Splash Pad", "Dog Café"],
    prices: CITY_BIG_PRICES,
    gridSize: "6x6",
    accent: "#7ac943",
    icon: "dog",
    assetKey: "city_dog_park",
    height: 3.8,
    ...CITY,
  },
  // Street models live in components/world3d/premium-items/StreetItems.tsx.
  traffic_lights: {
    name: "Traffic Lights",
    description: "Red, amber, green on a loop; they turn green as you come up. Up to smart lights with a countdown.",
    levels: ["Single Pole", "Crossing Button", "Twin Heads", "Smart Lights"],
    prices: STREET_PRICES,
    gridSize: "1x1",
    accent: "#36e07a",
    icon: "traffic-cone",
    assetKey: "street_traffic_lights",
    height: 4.4,
    ...STREET,
  },
  zebra_crossing: {
    name: "Zebra Crossing",
    description: "Stripes across a road that light up as you cross, up to flashing poles and a raised, lit crossing.",
    levels: ["Stripes", "Crossing Poles", "Flashing Lights", "Raised & Lit"],
    prices: STREET_PRICES,
    gridSize: "3x2",
    accent: "#f7f7f7",
    icon: "footprints",
    assetKey: "street_zebra_crossing",
    height: 2.8,
    ...STREET,
  },
  wheelie_bins: {
    name: "Wheelie Bins",
    description: "Red, yellow and green lids whose lids flip open when you bump them, up to a recycling station.",
    levels: ["One Bin", "All Three", "Bin Bay", "Recycling Station"],
    prices: STREET_PRICES,
    gridSize: "2x1",
    accent: "#d8282b",
    icon: "trash-2",
    assetKey: "street_wheelie_bins",
    height: 2,
    ...STREET,
  },
  bike_rack: {
    name: "Bike Rack",
    description: "A rack that fills with bright bikes, up to a covered dock with glowing scooters.",
    levels: ["Rack", "Bikes", "Covered Rack", "Scooter Dock"],
    prices: STREET_PRICES,
    gridSize: "2x1",
    accent: "#4c8dff",
    icon: "bike",
    assetKey: "street_bike_rack",
    height: 2.6,
    ...STREET,
  },
  hills_hoist: {
    name: "Hills Hoist",
    description: "The classic backyard clothesline: run into it and it spins. Up to beach towels and fairy lights.",
    levels: ["Bare Hoist", "Washing", "Beach Towels", "Fairy Lights"],
    prices: STREET_PRICES,
    gridSize: "2x2",
    accent: "#9aa4af",
    icon: "shirt",
    assetKey: "street_hills_hoist",
    height: 2.6,
    ...STREET,
  },
  water_tank: {
    name: "Water Tank",
    description: "A corrugated rainwater tank, up to twin tanks with a pump, a solar panel and a veggie garden.",
    levels: ["Small Tank", "Big Tank", "Two Tanks & Pump", "Solar & Garden"],
    prices: STREET_PRICES,
    gridSize: "2x2",
    accent: "#6f8f6a",
    icon: "droplet",
    assetKey: "street_water_tank",
    height: 3,
    ...STREET,
  },
  shade_sail: {
    name: "Shade Sail",
    description: "Bright sails on poles over a seat, up to a big three-sail canopy lit up at night.",
    levels: ["One Sail", "Two Sails", "Big Canopy", "Lit Canopy"],
    prices: STREET_PRICES,
    gridSize: "3x3",
    accent: "#ff7a1a",
    icon: "tent",
    assetKey: "street_shade_sail",
    height: 4,
    ...STREET,
  },
  driveway_hoop: {
    name: "Driveway Hoop",
    description: "A basketball ring on a pole for out the front, up to a net, lights and a score clock.",
    levels: ["Pole & Ring", "Backboard", "Net & Lights", "Score Clock"],
    prices: STREET_PRICES,
    gridSize: "1x2",
    accent: "#ff7a1a",
    icon: "dribbble",
    assetKey: "street_driveway_hoop",
    height: 4.6,
    ...STREET,
  },
  // Main Street models live in components/world3d/premium-items/MainStreetItems.tsx.
  corner_shop: {
    name: "Corner Shop",
    description: "A fruit stall that grows into a supermarket with shelves of goods behind the glass.",
    levels: ["Fruit Stall", "Corner Store", "Mini-Mart", "Supermarket"],
    prices: MAIN_SHOP_PRICES,
    gridSize: "8x7",
    accent: "#e5484d",
    icon: "store",
    assetKey: "main_corner_shop",
    height: 11.4,
    ...MAIN,
  },
  cafe: {
    name: "Café",
    description: "A coffee window that grows into a rooftop café with a neon coffee cup.",
    levels: ["Coffee Window", "Corner Café", "Café with Terrace", "Rooftop Café"],
    prices: MAIN_SHOP_PRICES,
    gridSize: "4x4",
    accent: "#1f6f5a",
    icon: "coffee",
    assetKey: "main_cafe",
    height: 10.4,
    ...MAIN,
  },
  library: {
    name: "Library",
    description: "A little free library that grows into a glass library with a glowing wall of books.",
    levels: ["Little Free Library", "Village Library", "Sandstone Library", "Glass City Library"],
    prices: MAIN_SHOP_PRICES,
    gridSize: "5x4",
    accent: "#2f6fd6",
    icon: "book",
    assetKey: "main_library",
    height: 8.6,
    ...MAIN,
  },
  town_hall: {
    name: "Town Hall",
    description: "A rotunda that grows into a domed civic centre with a clock that really turns.",
    levels: ["Rotunda", "Town Hall", "Clock Tower Hall", "Grand Civic Centre"],
    prices: MAIN_CIVIC_PRICES,
    gridSize: "10x8",
    accent: "#2f6b4f",
    icon: "landmark",
    assetKey: "main_town_hall",
    height: 18.8,
    ...MAIN,
  },
  school: {
    name: "School",
    description: "A portable classroom that grows into a big school with a COLA, a garden and solar panels.",
    levels: ["Portable Classroom", "School Block", "School with COLA", "Big School"],
    prices: MAIN_CIVIC_PRICES,
    gridSize: "12x8",
    accent: "#2f6fd6",
    icon: "school",
    assetKey: "main_school",
    height: 12.6,
    ...MAIN,
  },
  fire_station: {
    name: "Fire Station",
    description: "A hose shed that grows into a big station with flashing fire trucks and a ladder that lifts.",
    levels: ["Hose Shed", "Fire Station", "Two-Bay Station", "Big Station"],
    prices: MAIN_CIVIC_PRICES,
    gridSize: "6x5",
    accent: "#d8282b",
    icon: "siren",
    assetKey: "main_fire_station",
    height: 9.6,
    ...MAIN,
  },
  // Sports models live in components/world3d/premium-items/SportsItems.tsx; the games in lib/world3d/sports.ts.
  tennis: {
    name: "Tennis Court",
    description: "Serve and score! A hit-up wall that grows into a floodlit stadium court.",
    levels: ["Hit-up Wall", "Grass Court", "Club Court", "Stadium Court"],
    prices: SPORT_PRICES,
    gridSize: "12x6",
    accent: "#d7f04a",
    icon: "trophy",
    assetKey: "sport_tennis",
    height: 9,
    ...SPORT,
  },
  soccer: {
    name: "Soccer Pitch",
    description: "Kick for goal! Backyard goals that grow into a floodlit stadium with a crowd.",
    levels: ["Backyard Goals", "Small Pitch", "Club Pitch", "Floodlit Stadium"],
    prices: SPORT_PRICES,
    gridSize: "14x9",
    accent: "#3f8f3a",
    icon: "goal",
    assetKey: "sport_soccer",
    height: 11,
    ...SPORT,
  },
  footy: {
    name: "Footy Goals",
    description: "Kick a goal for six or a behind for one! Backyard posts that grow into a floodlit oval end.",
    levels: ["Backyard Posts", "Goal Square", "Club Ground", "Floodlit Oval End"],
    prices: SPORT_PRICES,
    gridSize: "10x8",
    accent: "#c0392b",
    icon: "goal",
    assetKey: "sport_footy",
    height: 11.5,
    ...SPORT,
  },
  netball: {
    name: "Netball Court",
    description: "Shoot goals! A driveway ring that grows into a floodlit stadium court.",
    levels: ["Driveway Ring", "Half Court", "Full Court", "Stadium Court"],
    prices: SPORT_PRICES,
    gridSize: "12x7",
    accent: "#ffcc33",
    icon: "trophy",
    assetKey: "sport_netball",
    height: 9,
    ...SPORT,
  },
  // The lake model lives in components/world3d/premium-items/WaterItems.tsx; swimming in lib/world3d/swimming.ts.
  swimming_lake: {
    name: "Swimming Lake",
    description: "Dive in and swim! A swimming hole that grows into a lagoon with a waterslide.",
    levels: ["Swimming Hole", "Beach Lake", "Patrolled Lake", "Lagoon"],
    prices: [600, 600, 1200, 2400],
    gridSize: "10x7",
    accent: "#2fa8d6",
    icon: "waves",
    assetKey: "water_swimming_lake",
    height: 6,
    ...WATER,
  },
};

export const premiumHomeAssetKey = (style: PremiumHomeStyle) => PREMIUM_HOME_SPECS[style].assetKey;
export const premiumHomeItemKey = (style: PremiumHomeStyle) => `central_world_plot_1_${premiumHomeAssetKey(style)}`;
export const premiumHomeUpgradeKey = (style: PremiumHomeStyle, level: 2 | 3 | 4) => `${PREMIUM_HOME_SPECS[style].upgradePrefix}${style}_${level}`;

const STYLE_BY_ASSET = new Map(PREMIUM_HOME_STYLES.map((style) => [premiumHomeAssetKey(style), style]));
export function premiumHomeStyle(assetKey: unknown): PremiumHomeStyle | null {
  return typeof assetKey === "string" ? STYLE_BY_ASSET.get(assetKey) ?? null : null;
}
export function isPremiumHome(assetKey: unknown): boolean {
  return premiumHomeStyle(assetKey) !== null;
}

/** The level a learner has reached for one style; 1 once unlocked. */
export function premiumHomeLevel(style: PremiumHomeStyle, ownedItemKeys: ReadonlySet<string>): PremiumHomeLevel {
  for (const level of [4, 3, 2] as const) if (ownedItemKeys.has(premiumHomeUpgradeKey(style, level))) return level;
  return 1;
}
export function premiumHomeLevels(ownedItemKeys: ReadonlySet<string>): Record<PremiumHomeStyle, PremiumHomeLevel> {
  return Object.fromEntries(PREMIUM_HOME_STYLES.map((style) => [style, premiumHomeLevel(style, ownedItemKeys)])) as Record<PremiumHomeStyle, PremiumHomeLevel>;
}
/** The next upgrade to buy, or null at Legendary. */
export function nextPremiumHomeUpgrade(style: PremiumHomeStyle, ownedItemKeys: ReadonlySet<string>) {
  const current = premiumHomeLevel(style, ownedItemKeys);
  if (current >= PREMIUM_HOME_MAX_LEVEL) return null;
  const level = (current + 1) as 2 | 3 | 4;
  const spec = PREMIUM_HOME_SPECS[style];
  return { level, itemKey: premiumHomeUpgradeKey(style, level), name: spec.levels[level - 1], price: spec.prices[level - 1] };
}

const baseItem = {
  category: "decoration" as const,
  realm_id: null,
  active: true,
  purchasable: true,
  discoverable: true,
};

/** Shop rows that unlock each style (placed from the Owned tray like other buildings).
 * Free styles have none: their Level 1 is in the Defence tab. */
export const PREMIUM_HOME_SHOP_ITEMS: EconomyItem[] = PREMIUM_HOME_STYLES.filter((style) => !PREMIUM_HOME_SPECS[style].free).map((style, index) => {
  const spec = PREMIUM_HOME_SPECS[style];
  const assetKey = premiumHomeAssetKey(style);
  return {
    ...baseItem,
    item_key: premiumHomeItemKey(style),
    name: spec.name,
    description: spec.fixed ? `${spec.description} Unlock it once and upgrade it through four levels.` : `${spec.description} Unlock once, place as many as you like, and upgrade it through four levels.`,
    rarity: style === "fair" || style === "tower_shield" ? "legendary" : index < 2 || style === "trampoline" || spec.prices[0] < 500 ? "rare" : "epic",
    price: spec.prices[0],
    icon: spec.icon,
    accent: spec.accent,
    sort_order: 5 + index,
    metadata: {
      // A fixed style (the Tower Shield) is never placed, so it carries no plot details.
      ...(spec.fixed
        ? { premiumFixed: true }
        : { slot: "world_plot_1", worldPlotId: "customisation-plot-1", worldAssetKey: assetKey, worldArea: spec.marketplaceCategory, worldCollection: "country", gridSize: spec.gridSize, tier: 1 }),
      marketplaceCategory: spec.marketplaceCategory, premiumHome: style,
      marketplace_visual: { type: "asset", src: `/marketplace/world-renders/${assetKey}.webp`, alt: `${spec.name}: the actual world model`, previewMode: "world" },
    },
  };
});

/** Shop rows for levels 2 to 4. Bought from the upgrade button in the world, never listed in the Marketplace. */
export const PREMIUM_HOME_UPGRADE_ITEMS: EconomyItem[] = PREMIUM_HOME_STYLES.flatMap((style) =>
  ([2, 3, 4] as const).map((level) => {
    const spec = PREMIUM_HOME_SPECS[style];
    return {
      ...baseItem,
      item_key: premiumHomeUpgradeKey(style, level),
      name: `${spec.name}: ${spec.levels[level - 1]}`,
      description: `Upgrades every ${spec.name} you place to level ${level}: ${spec.levels[level - 1]}.`,
      rarity: level === 4 ? "legendary" : level === 3 ? "epic" : "rare",
      price: spec.prices[level - 1],
      icon: spec.icon,
      accent: spec.accent,
      sort_order: 900 + level,
      metadata: { marketplaceCategory: "home_upgrades", marketplaceHidden: true, premiumHome: style, premiumHomeLevel: level },
    } satisfies EconomyItem;
  }),
);

export const PREMIUM_HOME_ITEM_KEYS = new Set([...PREMIUM_HOME_SHOP_ITEMS, ...PREMIUM_HOME_UPGRADE_ITEMS].map((item) => item.item_key));

/** Trampoline bounce by level: how far from the centre it catches the avatar (world metres) and how high it throws. */
export const TRAMPOLINE_BOUNCE: Record<PremiumHomeLevel, { radius: number; power: number }> = {
  1: { radius: 2.0, power: 1.6 },
  2: { radius: 3.0, power: 2.0 },
  3: { radius: 4.0, power: 2.4 },
  4: { radius: 5.2, power: 3.0 },
};
/** Bounce power at a spot, given the trampolines placed in the world and the learner's trampoline level. */
export function trampolineBounceAt(x: number, z: number, trampolines: readonly { x: number; z: number }[], level: PremiumHomeLevel) {
  const { radius, power } = TRAMPOLINE_BOUNCE[level];
  return trampolines.some((t) => (x - t.x) ** 2 + (z - t.z) ** 2 <= radius * radius) ? power : 0;
}
