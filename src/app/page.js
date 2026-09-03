import CollectionCollage from "@/components/CollectionCollage";
import Hero from "@/components/Hero.jsx";
import OurStorySection from "@/components/OurStorySection";
import CollectionCategory from "@/components/CollectionCategory";
import ProductShowcase from "@/components/ProductShowcase";
import WardrobeSection from "@/components/WardrobeSection";
import VirtualExperience from "@/components/VirtualExperience";
import NewArrivals from "@/components/NewArrivals";
import NewArrivalsGrid from "@/components/NewArrivalsGrid";
import TestimonialsSection from "@/components/TestimonialsSection";
import {
  getAllCategories,
  getWardrobeCategories,
  getFeaturedProducts,
  getNewArrivalProducts,
} from "@/lib/api";
import ProVideoHero from "@/components/ProVideoHero";
import SaleProductsGrid from "@/components/SaleProductsGrid";

export default async function Home() {
  // Fetch data in parallel — all fall back gracefully to [] on failure
  const [allCategories, wardrobeCategories, featuredProducts, newArrivalProducts] =
    await Promise.all([
      getAllCategories(),
      getWardrobeCategories(),
      getFeaturedProducts(),
      getNewArrivalProducts(),
    ]);

  return (
    <>
      <Hero />
      <OurStorySection />
      <CollectionCollage />
      {/* <ProVideoHero /> */}
      <CollectionCategory categories={allCategories.slice(0, 3)} />
      <ProductShowcase />
      <SaleProductsGrid />
      {/* <WardrobeSection categories={wardrobeCategories.slice(0, 3)} /> */}
      <VirtualExperience />
      <NewArrivals />
      <NewArrivalsGrid products={newArrivalProducts.slice(0, 6)} />
      <TestimonialsSection />
    </>
  );
}
