/**
 * app/(site)/page.js — Homepage (Server Component)
 *
 * All API calls happen here on the server (ISR cached).
 * Data is passed as props to client components — zero
 * client-side waterfalls, no loading spinners on first paint.
 */

import CollectionCollage from "@/components/CollectionCollage";
import Hero from "@/components/Hero.jsx";
import OurStorySection from "@/components/OurStorySection";
import CollectionCategory from "@/components/CollectionCategory";
import ProductShowcase from "@/components/ProductShowcase";
import WardrobeSection from "@/components/WardrobeSection";
import VirtualExperience from "@/components/VirtualExperience";
import NewArrivals from "@/components/NewArrivals";
import NewArrivalsGrid from "@/components/NewArrivalsGrid";
import { getAllCategories, getWardrobeCategories } from "@/lib/api";

export const revalidate = 60; // ISR: revalidate page every 60 seconds

export default async function Home() {
  // Fetch both in parallel — single round trip
  const [allCategories, wardrobeCategories] = await Promise.all([
    getAllCategories(),
    getWardrobeCategories(),
  ]);

  return (
    <>
      <Hero />
      <OurStorySection />
      <CollectionCollage />
      <CollectionCategory categories={allCategories} />
      <ProductShowcase />
      <WardrobeSection categories={wardrobeCategories} />
      <VirtualExperience />
      <NewArrivals />
      <NewArrivalsGrid />
    </>
  );
}
