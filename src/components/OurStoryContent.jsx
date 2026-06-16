const storyParagraphs = [
  "Nikita Home Furnishings was not born in a boardroom. It was born in the knowledge that Jaipur — our city, our home — sits at the centre of one of the world's great craft traditions, and that tradition deserved a modern guardian.",
  "Established in 2006, we started as a manufacturer with a singular focus: to make home furnishings and textiles that carried the full weight of Indian craft without apology. Kantha quilting. Hand block printing. Ajrakh dyeing. Bagru printing. These were not just techniques to us — they were inheritances from generations of Rajasthani artisans whose skill was in danger of being replaced by machines that could never truly imitate them.",
  "What began in a small studio grew steadily, guided not by trends but by trust — the trust of buyers across thirty countries who kept returning because they knew that what they had found in Nikita was something the market rarely offered: genuine craft at a scale that could deliver it reliably, beautifully, every time.",
  "Today, Nikita Home Furnishings spans a full world of artisan textile living — from the bedroom to the dining table, from the wardrobe to the travel bag. But the soul of it has never changed. Every piece still begins with a skilled artisan. Every piece still carries the mark of Jaipur.",
];

const features = [
  {
    title: "Artisan-Made, Always",
    description:
      "Every piece is made using traditional Indian craft techniques: Kantha stitching, hand block printing, Ajrakh and Bagru dyeing. These are not inspired by craft; they are craft.",
  },
  {
    title: "Direct from Jaipur",
    description:
      "We manufacture in-house. When you buy from Nikita, you are buying directly from the people who made it: no margins lost to middlemen, no story diluted by distance.",
  },
  {
    title: "Made for You",
    description:
      "Every print, every palette, every size can be customised. Screen printing, hand block, indigo — our studio accommodates bespoke orders for boutiques and home-owners alike.",
  },
  {
    title: "Home & Wardrobe, Together",
    description:
      "From kantha quilts and cotton bedsheets to quilted jackets and kaftans — Nikita's collections dress both your home and your life in the same considered aesthetic.",
  },
  {
    title: "Fabrics That Last",
    description:
      "We source only the finest cotton, silk, and velvet. Every fabric is tested for comfort, longevity, and colour-fastness before a single print touches its surface.",
  },
  {
    title: "A Name That Keeps Its Promise",
    description:
      "18 years in business. Thousands of satisfied buyers worldwide. Our reputation is built one beautifully made piece at a time — and we intend to keep it that way.",
  },
];

export default function OurStoryContent() {
  return (
    <section className="w-full bg-[#fdfdf4] px-6 md:px-10 lg:px-16 py-16 md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto">
        {/* ── Our Story Intro ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 mb-20 md:mb-24 lg:mb-28">
          <div className="lg:col-span-4">
            <h2
              className="text-[#7B7F5C] font-normal leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}
            >
              Our Story
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-5 md:space-y-6">
            {storyParagraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="text-[#333333] text-[13px] md:text-[14px] leading-[185%] font-light"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* ── Why Choose Nikita ─────────────────────────────────── */}
        <div>
          <h2
            className="text-[#7B7F5C] font-normal leading-snug mb-10 md:mb-12 max-w-3xl"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            Why Homes Across, The World Choose Nikita
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-[#7B7F5C]/15">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`px-5 md:px-6 py-8 md:py-10 border-b border-[#7B7F5C]/15 ${
                  index % 2 === 0 ? "md:border-r" : "md:border-r-0"
                } ${index % 3 !== 2 ? "lg:border-r" : "lg:border-r-0"}`}
              >
                <h3
                  className="text-[#7B7F5C] font-normal mb-3 md:mb-4 leading-snug"
                  style={{ fontSize: "clamp(1.125rem, 2vw, 1.375rem)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-[#333333] text-[12.5px] md:text-[13px] leading-[185%] font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
