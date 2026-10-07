import { REALM_BUILDING_SHOP_ITEMS } from "./realm-building-collections";
import { TRAIN_DESIGNS } from "./train-catalogue";
// Generated from the actual models via /demo-review/marketplace-art.
export const WORLD_SHOP_ART: Record<string, {src:string;alt:string}> = {
  ...Object.fromEntries(REALM_BUILDING_SHOP_ITEMS.map(item=>[item.item_key,{src:`/marketplace/world-renders/${item.metadata.worldAssetKey}.webp`,alt:`${item.name} — actual world model`}])),
  ...Object.fromEntries(TRAIN_DESIGNS.map(d=>[d.key,{src:`/marketplace/world-renders/${d.key}.webp`,alt:d.name+" — actual world model"}])),
  "central_world_plot_1_clubhouse": {
    "src": "/marketplace/world-renders/clubhouse.webp",
    "alt": "Queenslander — actual world model"
  },
  "central_world_plot_1_games_room": {
    "src": "/marketplace/world-renders/games_room.webp",
    "alt": "Milk Bar Arcade — actual world model"
  },
  "central_world_plot_1_treehouse": {
    "src": "/marketplace/world-renders/treehouse.webp",
    "alt": "Gum Tree Cubby — actual world model"
  },
  "central_world_plot_2_training_centre": {
    "src": "/marketplace/world-renders/training_centre.webp",
    "alt": "Footy Training Shed — actual world model"
  },
  "central_world_plot_2_workshop": {
    "src": "/marketplace/world-renders/workshop.webp",
    "alt": "Surf Life Saving Club — actual world model"
  },
  "central_world_plot_2_observatory": {
    "src": "/marketplace/world-renders/observatory.webp",
    "alt": "Sydney Tower Eye — actual world model"
  },
  "central_world_plot_3_puppy_yard": {
    "src": "/marketplace/world-renders/puppy_yard.webp",
    "alt": "Blue Heeler Yard — actual world model"
  },
  "central_world_plot_3_bunny_garden": {
    "src": "/marketplace/world-renders/bunny_garden.webp",
    "alt": "Bilby Burrows — actual world model"
  },
  "central_world_plot_3_pony_paddock": {
    "src": "/marketplace/world-renders/pony_paddock.webp",
    "alt": "Brumby Paddock — actual world model"
  },
  "central_world_plot_4_farmyard": {
    "src": "/marketplace/world-renders/farmyard.webp",
    "alt": "Outback Homestead — actual world model"
  },
  "central_world_plot_4_wildlife_habitat": {
    "src": "/marketplace/world-renders/wildlife_habitat.webp",
    "alt": "Koala Gum Trees — actual world model"
  },
  "central_world_plot_5_backyard_pool": {
    "src": "/marketplace/world-renders/backyard_pool.webp",
    "alt": "Backyard Pool — actual world model"
  },
  "central_world_plot_5_splash_pool": {
    "src": "/marketplace/world-renders/splash_pool.webp",
    "alt": "Splash Pool — actual world model"
  },
  "central_world_plot_5_water_park": {
    "src": "/marketplace/world-renders/water_park.webp",
    "alt": "Lagoon Pool — actual world model"
  },
  "central_world_plot_6_adventure_playground": {
    "src": "/marketplace/world-renders/adventure_playground.webp",
    "alt": "Adventure Playground — actual world model"
  },
  "central_world_plot_6_trampoline_park": {
    "src": "/marketplace/world-renders/trampoline_park.webp",
    "alt": "Trampoline Park — actual world model"
  },
  "central_world_plot_7_sports_stadium": {
    "src": "/marketplace/world-renders/sports_stadium.webp",
    "alt": "AFL Oval — actual world model"
  },
  "central_world_plot_7_cinema": {
    "src": "/marketplace/world-renders/cinema.webp",
    "alt": "Drive-In Cinema — actual world model"
  },
  "central_world_plot_7_arcade": {
    "src": "/marketplace/world-renders/arcade.webp",
    "alt": "Arcade — actual world model"
  },
  "central_world_plot_8_party_house": {
    "src": "/marketplace/world-renders/party_house.webp",
    "alt": "Aussie BBQ Backyard — actual world model"
  },
  "central_world_plot_8_pet_sanctuary": {
    "src": "/marketplace/world-renders/pet_sanctuary.webp",
    "alt": "Kangaroo Sanctuary — actual world model"
  },
  "central_world_plot_1_village_cottage": {
    "src": "/marketplace/world-renders/village_cottage.webp",
    "alt": "Village Cottage — actual world model"
  },
  "central_world_plot_1_village_family_house": {
    "src": "/marketplace/world-renders/village_family_house.webp",
    "alt": "Family House — actual world model"
  },
  "central_world_plot_1_village_townhouse": {
    "src": "/marketplace/world-renders/village_townhouse.webp",
    "alt": "Village Townhouse — actual world model"
  },
  "central_world_plot_1_village_manor": {
    "src": "/marketplace/world-renders/village_manor.webp",
    "alt": "Grand Manor — actual world model"
  },
  "central_world_plot_1_village_store": {
    "src": "/marketplace/world-renders/village_store.webp",
    "alt": "General Store — actual world model"
  },
  "central_world_plot_1_village_cafe": {
    "src": "/marketplace/world-renders/village_cafe.webp",
    "alt": "Village Café — actual world model"
  },
  "central_world_plot_1_village_library": {
    "src": "/marketplace/world-renders/village_library.webp",
    "alt": "Village Library — actual world model"
  },
  "central_world_plot_1_village_town_hall": {
    "src": "/marketplace/world-renders/village_town_hall.webp",
    "alt": "Town Hall — actual world model"
  },
  "central_world_plot_1_village_apartments": {
    "src": "/marketplace/world-renders/village_apartments.webp",
    "alt": "City Apartment Tower — actual world model"
  },
  "central_world_plot_7_opera_house": {
    "src": "/marketplace/world-renders/opera_house.webp",
    "alt": "Sydney Opera House — actual world model"
  },
  "central_world_plot_7_harbour_bridge": {
    "src": "/marketplace/world-renders/harbour_bridge.webp",
    "alt": "Harbour Bridge — actual world model"
  },
  "central_world_plot_2_lighthouse": {
    "src": "/marketplace/world-renders/lighthouse.webp",
    "alt": "Coastal Lighthouse — actual world model"
  },
  "central_world_plot_1_beach_huts": {
    "src": "/marketplace/world-renders/beach_huts.webp",
    "alt": "Beach Bathing Boxes — actual world model"
  },
  "central_world_plot_2_railway_station": {
    "src": "/marketplace/world-renders/railway_station.webp",
    "alt": "Outback Railway Station — actual world model"
  },
  "central_world_plot_1_country_bakery": {
    "src": "/marketplace/world-renders/country_bakery.webp",
    "alt": "Country Bakery — actual world model"
  },
  "central_world_plot_4_platypus_creek": {
    "src": "/marketplace/world-renders/platypus_creek.webp",
    "alt": "Platypus Creek — actual world model"
  },
  "central_world_plot_3_wombat_burrows": {
    "src": "/marketplace/world-renders/wombat_burrows.webp",
    "alt": "Wombat Burrows — actual world model"
  },
  "central_world_plot_4_cockatoo_aviary": {
    "src": "/marketplace/world-renders/cockatoo_aviary.webp",
    "alt": "Cockatoo Aviary — actual world model"
  },
  "central_world_plot_8_wildlife_rescue": {
    "src": "/marketplace/world-renders/wildlife_rescue.webp",
    "alt": "Wildlife Rescue Centre — actual world model"
  },
  "central_world_plot_8_windmill_garden": {
    "src": "/marketplace/world-renders/windmill_garden.webp",
    "alt": "Country Windmill — actual world model"
  },
  "central_world_plot_6_bush_camp": {
    "src": "/marketplace/world-renders/bush_camp.webp",
    "alt": "Bush Explorer Camp — actual world model"
  }
};
