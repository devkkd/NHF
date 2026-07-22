"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const categories = [
  {
    title: "Kantha Bedcovers",
    image: "/images/category/1.png",
  },
  {
    title: "Quilts",
    image: "/images/category/2.png",
  },
  {
    title: "Bedsheets",
    image: "/images/category/3.png",
  },
  {
    title: "Jackets & Bathrobes",
    image: "/images/category/4.png",
  },
  {
    title: "Bags & Pouches",
    image: "/images/category/5.png",
  },
  {
    title: "Scarves",
    image: "/images/category/6.png",
  },
  {
    title: "Kaftans",
    image: "/images/category/7.png",
  },
  {
    title: "Dohar",
    image: "/images/category/8.png",
  },
  {
    title: "Throws / Gudri",
    image: "/images/category/9.png",
  },
  {
    title: "Cushion Covers",
    image: "/images/category/10.png",
  },
  {
    title: "Rugs & Dhurries",
    image: "/images/category/11.png",
  },
  {
    title: "Table Covers & Runners",
    image: "/images/category/12.png",
  },
];

export default function CollectionCategory() {
  const router = useRouter();

  return (
    <section
      style={{
        background: "#FDFFF1",
        padding: "90px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Heading */}

        <h2
          style={{
            fontFamily: "'Tobias TRIAL', serif",
            fontSize: "40px",
            fontWeight: 600,
            lineHeight: "160%",
            letterSpacing: "-0.02em",
            color: "#7B7F5C",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          ALL CATEGORY
        </h2>

        {/* Cards */}

        <div className="collection-grid">
          {categories.map((item) => (
            <div key={item.title} className="collection-card">
              <div className="image-wrapper">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>

              <h5>{item.title} →</h5>
            </div>
          ))}
        </div>

        {/* Button */}

        <div className="collection-btn-wrap">
         <button
  className="collection-btn"
  onClick={() => router.push("/new-arrivals")}
>
  SEE FULL OUR COLLECTION →
</button>
        </div>
      </div>

      <style jsx>{`
        .collection-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px 24px;
}

        .collection-card {
          text-align: center;
        }

        .image-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  margin: 0 auto;
}

        .collection-card h5 {
          margin-top: 18px;
          font-family: "Mona Sans", sans-serif;
          font-size: 24px;
          font-weight: 400;
          line-height: 160%;
          color: #7b7f5c;
        }

        .collection-btn-wrap {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .collection-btn {
          background: transparent;
          border: none;
          border-bottom: 1px solid #7b7f5c;
          padding-bottom: 8px;
          color: #7b7f5c;
          font-family: "Mona Sans", sans-serif;
          font-size: 16px;
          cursor: pointer;
          letter-spacing: 0.02em;
        }

        @media (max-width: 1024px) {
          .collection-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
  .collection-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .collection-card h5 {
    font-size: 14px;
  }

  h2 {
    font-size: 28px;
  }

  .image-wrapper {
    height: 180px;
  }
}
  @media (max-width: 480px) {
  .collection-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .image-wrapper {
    height: 150px;
  }

  .collection-card h5 {
    font-size: 12px;
    margin-top: 10px;
  }
}
      `}</style>
    </section>
  );
}