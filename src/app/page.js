import CollectionCollage from "@/components/CollectionCollage";
import Hero from "@/components/Hero.jsx";
import OurStorySection from "@/components/OurStorySection";
import CollectionCategory from "@/components/CollectionCategory";
import ProductShowcase from "@/components/ProductShowcase";
import WardrobeSection from "@/components/WardrobeSection";
import VirtualExperience from "@/components/VirtualExperience";


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


    </>
  );
}
