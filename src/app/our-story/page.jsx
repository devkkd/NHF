import Image from "next/image";
import OurStoryContent from "@/components/OurStoryContent";
import OurStoryTrust from "@/components/OurStoryTrust";
import Established from "@/components/Established";
export const metadata = {
  title: "Our Story | Nikita Home Furnishings",
  description:
    "A craft story that began in Jaipur in 2006 — and has never stopped being made by hand.",
};

export default function OurStoryPage() {
  return (
    <>
      {/* ── Intro Text ──────────────────────────────────────────── */}
      <section className="w-full bg-[#fdfdf4] text-center px-6 pt-10 pb-14 md:pt-14 md:pb-16 lg:pt-32 lg:pb-14">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3 md:gap-6">
          <h1
            className="text-[#7B7F5C] uppercase  font-normal"
            style={{ fontSize: "clamp(1.25rem, 4.5vw, 2.15rem)" }}
          >
            Our Story
          </h1>

          <p
            className="text-[#7B7F5C] font-light leading-snug "
            style={{ fontSize: "clamp(1.125rem, 2.2vw, 1.425rem)" }}
          >
            A Craft Story That Began, In Jaipur, In 2006
          </p>

          <p
            className="text-black font-light leading-snug"
            style={{ fontSize: "clamp(1rem, 2vw, 1.1rem)" }}
          >
            And Has Never Stopped Being Made By Hand.
          </p>
        </div>
      </section>

      {/* ── Hero Image ──────────────────────────────────────────── */}
      <section className="relative w-full h-[48vh] min-h-[320px] md:min-h-[420px] lg:min-h-[420px]">
        <Image
          src="/images/product/bedsheet.jpg"
          alt="A cozy bedroom styled with Nikita Home Furnishings textiles"
          fill
          priority
          className="object-cover object-center"
          sizes="90vw"
        />
      </section>
      <Established />
      <OurStoryContent />
      <OurStoryTrust />
     
     
    </>
  );
}
