// In-game stock markets. Two exchanges, mirroring the GTA V conceit.
// Prices/changes are static seed data — your scraper / live API can override later.

const spark = (...nums) => nums;

export const lcnStocks = [
  { ticker: "AUG", name: "Augury", sector: "Analytics", price: 412.55, change: 6.24, sparkline: spark(380, 384, 390, 388, 401, 404, 412), volume: "2.1M" },
  { ticker: "VAP", name: "Vapid Motor Co.", sector: "Automotive", price: 188.20, change: 2.10, sparkline: spark(176, 178, 181, 184, 182, 186, 188), volume: "4.8M" },
  { ticker: "HKL", name: "Hawk & Little", sector: "Firearms", price: 76.42, change: -1.85, sparkline: spark(80, 79, 78, 79, 77, 78, 76), volume: "1.2M" },
  { ticker: "BAW", name: "Bawsaq Brands Inc.", sector: "Holding", price: 921.10, change: 14.40, sparkline: spark(890, 895, 902, 908, 911, 916, 921), volume: "850K" },
  { ticker: "GRT", name: "Grotti", sector: "Luxury Auto", price: 1248.00, change: -22.50, sparkline: spark(1290, 1284, 1276, 1270, 1262, 1255, 1248), volume: "320K" },
  { ticker: "SPD", name: "Speedophile Marine", sector: "Watercraft", price: 64.80, change: 4.20, sparkline: spark(60, 61, 60, 62, 63, 64, 64), volume: "2.6M" },
  { ticker: "TVR", name: "Tequesta Tower Realty", sector: "Real Estate", price: 314.55, change: 1.10, sparkline: spark(310, 312, 311, 313, 312, 314, 314), volume: "740K" },
  { ticker: "ORR", name: "Only Raw Records", sector: "Music", price: 28.40, change: -0.85, sparkline: spark(30, 29, 30, 29, 28, 29, 28), volume: "1.4M" },
];

export const bawsaqStocks = [
  { ticker: "JCH", name: "Jack of Hearts Hospitality", sector: "Entertainment", price: 142.10, change: 8.40, sparkline: spark(122, 128, 132, 136, 138, 140, 142), volume: "3.2M" },
  { ticker: "MRW", name: "Merryweather Security", sector: "Defense", price: 488.20, change: 12.10, sparkline: spark(465, 470, 475, 480, 482, 486, 488), volume: "1.8M" },
  { ticker: "BTL", name: "Bilkinton Research", sector: "Pharma", price: 84.15, change: -3.40, sparkline: spark(92, 90, 88, 87, 86, 85, 84), volume: "2.4M" },
  { ticker: "DBP", name: "Debonaire Cigarettes", sector: "Consumer", price: 56.20, change: -2.10, sparkline: spark(60, 59, 58, 58, 57, 57, 56), volume: "950K" },
  { ticker: "PØS", name: "Pißwasser Beverages", sector: "Consumer", price: 38.40, change: 1.85, sparkline: spark(36, 37, 36, 37, 38, 38, 38), volume: "5.1M" },
  { ticker: "FRT", name: "Fruit Computers Inc.", sector: "Tech", price: 1888.00, change: 24.20, sparkline: spark(1840, 1855, 1862, 1870, 1875, 1882, 1888), volume: "1.2M" },
  { ticker: "ECF", name: "E-Cola", sector: "Consumer", price: 412.50, change: -5.40, sparkline: spark(425, 421, 419, 417, 415, 413, 412), volume: "880K" },
  { ticker: "LFI", name: "Lifeinvader", sector: "Social Media", price: 12.80, change: -0.45, sparkline: spark(15, 14, 14, 13, 13, 13, 12), volume: "6.4M" },
  { ticker: "BSE", name: "BillingsGate Equestrian", sector: "Sports", price: 89.20, change: 4.80, sparkline: spark(82, 84, 85, 86, 87, 88, 89), volume: "410K" },
  { ticker: "RGC", name: "Redwood Cigarettes", sector: "Consumer", price: 24.40, change: 0.20, sparkline: spark(24, 24, 24, 24, 24, 24, 24), volume: "720K" },
];

export const marketIndices = [
  { name: "LCN Composite", value: 4288.40, change: 0.87, status: "open" },
  { name: "BAWSAQ Index", value: 5944.20, change: 1.42, status: "open" },
  { name: "Leonida Realty Index", value: 1124.55, change: -0.34, status: "open" },
  { name: "Crime Activity Index", value: 312.80, change: 3.21, status: "live" },
];
