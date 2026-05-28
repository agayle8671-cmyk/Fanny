// Official trailers + key teaser content for GTA 6.

export const trailers = [
  {
    slug: "trailer-1",
    title: "Grand Theft Auto VI — Trailer 1",
    youtubeId: "QdBZY2fkU-0",
    releaseDate: "December 4, 2023",
    duration: "1:31",
    description:
      "The first official trailer. Lucia is introduced, Vice City is confirmed, and the world wakes up to GTA 6 with Tom Petty's 'Love Is a Long Road' as scoring.",
    thumbnail: "https://static.prod-images.emergentagent.com/jobs/133190d3-a699-44bf-a8c9-cce9bb2365f6/images/6dccb50f1f97f2f4f27319ab01773127d24f381cb080704869c46c535155b382.png",
    tags: ["Official", "Lucia", "Vice City", "Tom Petty"],
  },
  {
    slug: "trailer-2",
    title: "Grand Theft Auto VI — Trailer 2",
    youtubeId: "VQRLujxTm3c",
    releaseDate: "May 6, 2025",
    duration: "3:18",
    description:
      "Trailer 2 introduces Jason Duval at length, expands the cast (Cal Hampton, Brian Heder, Boobie Ike, Dre'Quan Priest), and finally shows the state of Leonida outside of Vice City proper.",
    thumbnail: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2",
    tags: ["Official", "Jason", "Lucia", "Leonida"],
  },
  {
    slug: "in-engine-keys",
    title: "Leonida Keys — Environment Showcase",
    youtubeId: "QdBZY2fkU-0",
    releaseDate: "Fan-curated supercut",
    duration: "0:52",
    description:
      "A curated environment supercut focused on the Mariana County / Leonida Keys footage from the official trailers. Watercraft handling, sun-bleached marinas, Card Sound Bridge.",
    thumbnail: "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c",
    tags: ["Environment", "Keys", "Watercraft"],
  },
  {
    slug: "in-engine-grassrivers",
    title: "The Grassrivers — Wetland Showcase",
    youtubeId: "VQRLujxTm3c",
    releaseDate: "Fan-curated supercut",
    duration: "0:48",
    description:
      "Grassrivers footage condensed: airboats, alligators, pythons, weather, and an environmental density the RAGE engine has not previously delivered.",
    thumbnail: "https://images.unsplash.com/photo-1582987144051-9031c6a85290",
    tags: ["Environment", "Wetlands"],
  },
];

export const getTrailer = (slug) => trailers.find((t) => t.slug === slug);
