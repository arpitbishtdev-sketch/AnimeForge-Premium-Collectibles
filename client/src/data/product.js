/**
 * PRODUCTS DATA
 * Central data source for the anime e-commerce store.
 * Images are hosted on Cloudinary — cloud name pulled from .env via VITE_CLOUDINARY_CLOUD_NAME.
 */

export const PRODUCTS = [
  {
    id: "P001",
    name: "Shadow Katana",
    image:
      "https://res.cloudinary.com/dirixa5no/image/upload/v1772428537/Katana1_knezmf.jpg",
    price: "$89.99",
    priceRaw: 89.99,
    category: "Weapons",
    tag: "Bestseller",
    edition: "Limited Edition",
    subtitle: "Forged in Darkness",
  },
  {
    id: "P002",
    name: "Phantom Cloak",
    image:
      "https://res.cloudinary.com/dirixa5no/image/upload/v1772429440/c39646664005f13b8bc0a301c69b7a31_qtintq.jpg",
    price: "$124.99",
    priceRaw: 124.99,
    category: "Apparel",
    tag: "New",
    edition: "Collector's Edition",
    subtitle: "Born from Shadows",
  },
  {
    id: "P003",
    name: "Soul Fragment",
    image:
      "https://res.cloudinary.com/dirixa5no/image/upload/v1772429544/bbd9edbad2dd3f8f6c70f1bb3d12c804_erwqzu.jpg",
    price: "$59.99",
    priceRaw: 59.99,
    category: "Accessories",
    tag: "Popular",
    edition: "Special Edition",
    subtitle: "Resonance of Power",
  },
  {
    id: "P004",
    name: "Cursed Relic",
    image:
      "https://res.cloudinary.com/dirixa5no/image/upload/v1772429774/930cef6c9ac34dacefe67652329b3be1_cevcpr.jpg",
    price: "$149.99",
    priceRaw: 149.99,
    category: "Relics",
    tag: "Rare",
    edition: "Mythic Edition",
    subtitle: "Ancient Forbidden Power",
  },
  {
    id: "P005",
    name: "Spirit Vessel",
    image:
      "https://res.cloudinary.com/dirixa5no/image/upload/v1772429905/118e34bf945f0973e48f66b5e713549c_wz9uhu.jpg",
    price: "$74.99",
    priceRaw: 74.99,
    category: "Vessels",
    tag: "Featured",
    edition: "Ethereal Edition",
    subtitle: "Bound to the Beyond",
  },
  {
    id: "P006",
    name: "Demon Seal",
    image:
      "https://res.cloudinary.com/dirixa5no/image/upload/v1772430196/f018116bd131559a74f47eb47087de92_kjdcre.jpg",
    price: "$199.99",
    priceRaw: 199.99,
    category: "Seals",
    tag: "Ultra Rare",
    edition: "Demon King Edition",
    subtitle: "The Last Seal Broken",
  },
];
