import CollectionCollage from "@/components/CollectionCollage";
import Hero from "@/components/Hero.jsx";
import OurStorySection from "@/components/OurStorySection";
import CollectionCategory from "@/components/CollectionCategory";
import ProductShowcase from "@/components/ProductShowcase";
import WardrobeSection from "@/components/WardrobeSection";
import VirtualExperience from "@/components/VirtualExperience";
import NewArrivals from "@/components/NewArrivals";
import NewArrivalsGrid from "@/components/NewArrivalsGrid";
import Reviem from "@/components/TestimonialsSection"
import TestimonialsSection from "@/components/TestimonialsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <OurStorySection/>
      <CollectionCollage/>
      <CollectionCategory />
      <ProductShowcase />
       <WardrobeSection />
             <VirtualExperience />
             <NewArrivals />
             <NewArrivalsGrid />
             <TestimonialsSection />


    </>
  );
}
