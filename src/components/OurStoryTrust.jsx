const trustPoints = [
  {
    title: "We say what we make, and make what we say",
    description:
      "Hand block printed means hand block printed. Kantha stitched means kantha stitched. No approximations, no marketing language that overstates. What is on the label is in your hands.",
  },
  {
    title: "Direct manufacturer — no hidden layers",
    description:
      "Buying directly from the maker means you understand exactly where your piece came from, who made it, and why it costs what it costs. There is nothing to hide here — and we prefer it that way.",
  },
  {
    title: "Post purchase, we're still here",
    description:
      "Our relationship with customers doesn't end at the checkout. Questions about care, customisation for a next order, or advice on how to style a piece — we are available, always.",
  },
];

export default function OurStoryTrust() {
  return (
    <section className="w-full bg-[#fdfdf4] px-6 md:px-10 lg:px-16 pb-16 md:pb-20 lg:pb-24">
      <div className="max-w-6xl mx-auto">
        {/* ── Brand Legacy & Quality Promise ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0 mb-20 md:mb-24 lg:mb-28">
          <div className="lg:pr-10 xl:pr-14 lg:border-r border-[#7B7F5C]/15">
            <h2
              className="text-[#7B7F5C] font-normal leading-tight mb-6 md:mb-8"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)" }}
            >
              Brand Legacy
            </h2>
            <div className="space-y-5 text-[#333333] text-[13px] md:text-[14px] leading-[185%] font-light">
              <p>
                Eighteen years is not a long time in the context of Indian craft
                – but it is long enough to know your own standards. At Nikita,
                our legacy is a quiet one: built order by order, relationship
                by relationship, stitch by stitch. We are known in the markets
                that matter for reliability, for beauty, and for the kind of
                quality that does not require a conversation – because the
                product speaks immediately for itself.
              </p>
              <p>
                Our address in Govind Nagar, Jaipur, is the same as it has
                always been. The artisan families we work with are the same ones
                who opened our first samples. This continuity is not incidental
                – it is the backbone of everything we make.
              </p>
            </div>
          </div>

          <div className="lg:pl-10 xl:pl-14">
            <h2
              className="text-[#7B7F5C] font-normal leading-tight mb-6 md:mb-8"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)" }}
            >
              Quality Promise
            </h2>
            <div className="space-y-5 text-[#333333] text-[13px] md:text-[14px] leading-[185%] font-light">
              <p>
                We do not compromise on materials. The cotton we choose is
                selected for thread count, breathability, and dye absorption. The
                silk in our kantha quilts is sourced for its lustre and drape.
                The velvet in our bags is tested for softness before a single
                zipper is attached.
              </p>
              <p>
                Every finished piece passes through hands that know exactly what
                it should feel and look like. There are no shortcuts in this
                process – not because shortcuts don&apos;t exist, but because we
                made a promise a long time ago that Nikita would never take
                them. If it leaves our studio, it is right. That is our
                commitment to you.
              </p>
            </div>
          </div>
        </div>

        {/* ── Why Customers Trust Us ─────────────────────────────── */}
        <div>
          <h2
            className="text-[#7B7F5C] font-normal leading-snug mb-10 md:mb-12"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            Why Customers Trust Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#7B7F5C]/15">
            {trustPoints.map((point, index) => (
              <div
                key={point.title}
                className={`px-5 md:px-6 py-8 md:py-10 border-b border-[#7B7F5C]/15 ${
                  index !== 2 ? "md:border-r" : ""
                }`}
              >
                <h3
                  className="text-[#7B7F5C] font-normal mb-3 md:mb-4 leading-snug"
                  style={{ fontSize: "clamp(1.125rem, 2vw, 1.375rem)" }}
                >
                  {point.title}
                </h3>
                <p className="text-[#333333] text-[12.5px] md:text-[13px] leading-[185%] font-light">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
