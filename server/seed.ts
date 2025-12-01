import { db } from "./db";
import { packs } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if packs already exist
  const existingPacks = await db.select().from(packs);
  if (existingPacks.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Insert subscription packs
  await db.insert(packs).values([
    {
      name: "Budget",
      subtitle: "Economy & Compact",
      priceMonthly: "299.00",
      priceYearly: "2990.00",
      mileageLimit: 1500,
      features: [
        "Economy and compact vehicles",
        "1,500 miles per month",
        "Basic insurance included",
        "24/7 roadside assistance",
        "1 free vehicle swap per month",
        "Standard maintenance",
      ],
      isPopular: false,
    },
    {
      name: "Midrange",
      subtitle: "Sedans & SUVs",
      priceMonthly: "499.00",
      priceYearly: "4990.00",
      mileageLimit: 2500,
      features: [
        "Premium sedans and SUVs",
        "2,500 miles per month",
        "Comprehensive insurance",
        "Priority roadside assistance",
        "2 free vehicle swaps per month",
        "Premium maintenance",
        "Dedicated support line",
      ],
      isPopular: true,
    },
    {
      name: "Luxury",
      subtitle: "Premium & Sports",
      priceMonthly: "899.00",
      priceYearly: "8990.00",
      mileageLimit: null, // Unlimited
      features: [
        "Luxury and sports vehicles",
        "Unlimited mileage",
        "Full coverage insurance",
        "VIP roadside assistance",
        "Unlimited vehicle swaps",
        "White-glove service",
        "Concierge support 24/7",
        "Airport delivery available",
      ],
      isPopular: false,
    },
  ]);

  console.log("Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
