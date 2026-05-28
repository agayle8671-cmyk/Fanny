// Locations across the State of Leonida — verified from the GTA 6 Knowledge Base.

export const locations = [
  {
    slug: "vice-beach",
    name: "Vice Beach",
    region: "Vice City — Urban Core",
    analog: "Miami Beach / South Beach",
    tagline: "Neon, salt, and money you can hear from a block away.",
    image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2",
    coverImage: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2",
    description:
      "Vice Beach is the postcard. High-density pedestrian zones, art-deco hotels, and a shoreline rendered with dynamic sand and water interactions that Digital Foundry has already called a generational leap. The Tropics Hotel at 1550 Collins Ave anchors the strip; pastel facades and palm shadows do the rest.",
    facts: [
      { label: "District Type", value: "Tourist / High-Density Urban" },
      { label: "Anchors", value: "Tropics Hotel, Collins Ave strip" },
      { label: "Vibe", value: "Art deco, pastel, neon at night" },
      { label: "Activities", value: "Beach combat, foot pursuits, vehicle showcases" },
    ],
    relatedLocations: ["little-cuba", "tequesta", "port-vc"],
  },
  {
    slug: "little-cuba",
    name: "Little Cuba",
    region: "Vice City — Urban Core",
    analog: "Little Havana",
    tagline: "Culture, contraband, and the densest criminal networks in the city.",
    image: "https://images.unsplash.com/photo-1589066724013-06f34f2cc17c",
    coverImage: "https://images.unsplash.com/photo-1589066724013-06f34f2cc17c",
    description:
      "A culturally dense enclave anchored by José Martí Park and small businesses that have been there longer than the skyscrapers north of them. Little Cuba is one of Vice City's most active street-level crime hubs — and one of the few places where local reputation will follow you for hours.",
    facts: [
      { label: "Landmark", value: "José Martí Park" },
      { label: "Specialty", value: "Street-level criminal networks" },
      { label: "Ambient AI", value: "Strong local-reputation memory" },
    ],
    relatedLocations: ["vice-beach", "stockyard"],
  },
  {
    slug: "tequesta",
    name: "Tequesta",
    region: "Vice City — Urban Core",
    analog: "Brickell / Financial District",
    tagline: "Vertical city. Enterable towers. The money runs straight up.",
    image: "https://images.unsplash.com/photo-1628027927481-a528c344ae7b",
    coverImage: "https://images.unsplash.com/photo-1628027927481-a528c344ae7b",
    description:
      "Tequesta is GTA's most ambitious vertical city to date. Enterable skyscrapers, executive penthouses, and the Tequesta Station transit hub stack the financial district into a playground for heists, chase sequences, and verticality the franchise has previously avoided.",
    facts: [
      { label: "District Type", value: "Financial / Vertical Urban" },
      { label: "Transit", value: "Tequesta Station" },
      { label: "Feature", value: "Enterable skyscrapers, rooftop traversal" },
    ],
    relatedLocations: ["vice-beach", "north-vice-city"],
  },
  {
    slug: "stockyard",
    name: "Stockyard",
    region: "Vice City — Urban Core",
    analog: "Industrial West Miami",
    tagline: "Liquor stores, transit junctions, freight, and nothing pretty.",
    image: "https://images.pexels.com/photos/5322558/pexels-photo-5322558.jpeg",
    coverImage: "https://images.pexels.com/photos/5322558/pexels-photo-5322558.jpeg",
    description:
      "The Stockyard is Vice City's industrial spine. Heavy-commercial corridors, residential markers tucked between freight yards, and a density of low-end robberies that the systemic robbery system is built to exploit.",
    facts: [
      { label: "District Type", value: "Heavy Industrial / Commercial" },
      { label: "Robbery Density", value: "High — liquor stores, gas, freight" },
    ],
    relatedLocations: ["little-cuba", "port-vc"],
  },
  {
    slug: "north-vice-city",
    name: "North Vice City",
    region: "Vice City — Urban Core",
    analog: "North Miami / Aventura",
    tagline: "Shopping plazas, suburban sprawl, the city losing its accent.",
    image: "https://images.unsplash.com/photo-1670811456186-e73d0ace9454",
    coverImage: "https://images.unsplash.com/photo-1670811456186-e73d0ace9454",
    description:
      "North Vice City is the transition zone — the moment the city stops being Miami and starts being everywhere else. Expansive shopping malls, residential sprawl, and the rare quiet streets in the urban core.",
    facts: [
      { label: "District Type", value: "Suburban Commercial" },
      { label: "Anchors", value: "Mall complexes, residential sprawl" },
    ],
    relatedLocations: ["tequesta", "port-vc"],
  },
  {
    slug: "port-vc",
    name: "Port VC",
    region: "Vice City — Urban Core",
    analog: "Port Miami",
    tagline: "Cruise Terminal D and the shipping containers that built the skyline.",
    image: "https://images.unsplash.com/photo-1611601147557-cdc89476ec4a",
    coverImage: "https://images.unsplash.com/photo-1611601147557-cdc89476ec4a",
    description:
      "Port VC is the infrastructure heart of Vice City. Cruise Terminal D, container yards, and freight cranes are confirmed in trailer footage, and the area is positioned as a major mission location for high-stakes heists.",
    facts: [
      { label: "District Type", value: "Logistics / Infrastructure" },
      { label: "Anchors", value: "Cruise Terminal D, container yards" },
    ],
    relatedLocations: ["stockyard", "vice-beach"],
  },
  {
    slug: "mariana-county",
    name: "Mariana County",
    region: "State of Leonida — Coastal Islands",
    analog: "Monroe County / Florida Keys",
    tagline: "Leonida Keys. Card Sound Bridge. Brian's Marina. Where the game starts.",
    image: "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c",
    coverImage: "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c",
    description:
      "Mariana County is the island chain south of Vice City — the Leonida Keys, Key Lento, and the Card Sound Bridge connecting it to the mainland. Brian's Marina and the surrounding smuggling network make this the launchpad for Jason's storyline.",
    facts: [
      { label: "Region Type", value: "Island Chain / Coastal" },
      { label: "Anchors", value: "Brian's Marina, Card Sound Bridge, Key Lento" },
      { label: "Specialty", value: "Watercraft traversal, smuggling missions" },
    ],
    relatedLocations: ["grassrivers", "vice-beach"],
  },
  {
    slug: "kelly-county",
    name: "Kelly County",
    region: "State of Leonida — Inland Rural",
    analog: "Inland Florida",
    tagline: "Mount Kalaga foothills, Lake Leonida, the Starlet Motel.",
    image: "https://images.unsplash.com/photo-1666032800277-607511d3869a",
    coverImage: "https://images.unsplash.com/photo-1666032800277-607511d3869a",
    description:
      "Kelly County is the rural, inland heart of Leonida. Home to Mount Kalaga, Lake Leonida, and a constellation of roadside motels — the Starlet Motel chief among them — Kelly County is where the game slows down and the conspiracy thickens.",
    facts: [
      { label: "Region Type", value: "Inland / Rural" },
      { label: "Anchors", value: "Mount Kalaga, Lake Leonida, Starlet Motel" },
    ],
    relatedLocations: ["mount-kalaga-park", "ambrosia-county"],
  },
  {
    slug: "grassrivers",
    name: "Grassrivers",
    region: "State of Leonida — Wetlands",
    analog: "The Everglades",
    tagline: "Airboats, alligators, pythons, and the sky cut down to size.",
    image: "https://images.unsplash.com/photo-1582987144051-9031c6a85290",
    coverImage: "https://images.unsplash.com/photo-1582987144051-9031c6a85290",
    description:
      "Grassrivers is GTA's Everglades — a vast wetland of airboat transit, specialized wildlife (alligators, pythons), and the kind of horizon-stretching environmental work the RAGE engine has been quietly retooled to render.",
    facts: [
      { label: "Region Type", value: "Wetlands / Marsh" },
      { label: "Wildlife", value: "Alligators, pythons, wading birds" },
      { label: "Traversal", value: "Airboats, fan-skiffs, foot at your own risk" },
    ],
    relatedLocations: ["mariana-county", "ambrosia-county"],
  },
  {
    slug: "port-gellhorn",
    name: "Port Gellhorn",
    region: "State of Leonida — Coastal Industrial",
    analog: "Panama City / Sebring",
    tagline: "Secondary city. PGH Motel. Don Panoz–style racing tracks.",
    image: "https://images.unsplash.com/photo-1629935389411-1bb0ae0d1ffe",
    coverImage: "https://images.unsplash.com/photo-1629935389411-1bb0ae0d1ffe",
    description:
      "Port Gellhorn is the game's significant secondary city — a coastal industrial town with a tourism overlay, the PGH Motel, and high-performance racing facilities loosely modeled on Sebring's Don Panoz Gallery of Legends. Trailers confirm it as a major story beat.",
    facts: [
      { label: "Region Type", value: "Coastal Industrial / Secondary City" },
      { label: "Anchors", value: "PGH Motel, race circuits" },
    ],
    relatedLocations: ["ambrosia-county", "kelly-county"],
  },
  {
    slug: "ambrosia-county",
    name: "Ambrosia County",
    region: "State of Leonida — Agricultural",
    analog: "Central Florida Sugar Belt",
    tagline: "Sugar farms, dirt airstrips, and the country station that owns it.",
    image: "https://images.unsplash.com/photo-1629935635086-1855c8d125cc",
    coverImage: "https://images.unsplash.com/photo-1629935635086-1855c8d125cc",
    description:
      "Ambrosia County is Leonida's agricultural heart. Sugar farms, rural airstrips, the town of Ambrosia, and a Caloosahatchee-style canal carving through the landscape. Expect crop-duster missions and the kind of long, golden-hour drives the franchise has been waiting to render.",
    facts: [
      { label: "Region Type", value: "Agricultural / Rural" },
      { label: "Anchors", value: "Town of Ambrosia, sugar fields, rural airstrips" },
    ],
    relatedLocations: ["mount-kalaga-park", "port-gellhorn"],
  },
  {
    slug: "mount-kalaga-park",
    name: "Mount Kalaga National Park",
    region: "State of Leonida — Wilderness",
    analog: "Northern Florida wilderness, scaled up",
    tagline: "Verticality, forest cover, and the closest thing Leonida has to a Chiliad.",
    image: "https://images.unsplash.com/photo-1629934844513-df3e988a0157",
    coverImage: "https://images.unsplash.com/photo-1629934844513-df3e988a0157",
    description:
      "Mount Kalaga National Park is the northern wilderness anchor of the map — significant verticality, dense forestation, and the location most likely to host the franchise's next 'Chiliad Mystery'-style mythology.",
    facts: [
      { label: "Region Type", value: "Wilderness / Verticality" },
      { label: "Anchors", value: "Mount Kalaga summit, dense forest cover" },
      { label: "Mythology", value: "Suspected Chiliad-style mystery analog" },
    ],
    relatedLocations: ["kelly-county", "ambrosia-county"],
  },
];

export const getLocation = (slug) => locations.find((l) => l.slug === slug);
