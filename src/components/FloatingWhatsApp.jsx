"use client";

export default function FloatingWhatsApp() {
  // ============================================
  // WHATSAPP NUMBER
  // Country code ke saath
  // Example: 919876543210
  // ============================================
  const WHATSAPP_NUMBER = "919460387858";

  // ============================================
  // DEFAULT MESSAGE
  // Customer is message ko WhatsApp me edit
  // karke kuch bhi likh sakta hai.
  // ============================================
  const DEFAULT_MESSAGE =
    "Hello, I am interested in your products. Please share more details.";

  // ============================================
  // OPEN WHATSAPP
  // ============================================
  const handleWhatsAppClick = () => {
    const encodedMessage =
      encodeURIComponent(DEFAULT_MESSAGE);

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="whatsapp-wrapper">
      {/* ========================================
          HOVER LABEL
          Desktop par cursor button ke upar aate
          hi side me slide hoga.
      ======================================== */}
      <div className="whatsapp-label">
        <span className="label-title">
          Need Help?
        </span>

        <span className="label-subtitle">
          Chat with us on WhatsApp
        </span>
      </div>

      {/* ========================================
          WHATSAPP BUTTON
      ======================================== */}
      <button
        type="button"
        className="whatsapp-button"
        onClick={handleWhatsAppClick}
        aria-label="Chat with us on WhatsApp"
      >
        {/* OUTER PULSE */}
        <span className="whatsapp-pulse" />

        {/* ICON */}
        <span className="whatsapp-icon">
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M16 3.2A12.8 12.8 0 0 0 5.04 22.64L3.2 28.8l6.32-1.8A12.8 12.8 0 1 0 16 3.2Zm0 23.3a10.46 10.46 0 0 1-5.33-1.46l-.38-.23-3.75 1.07 1.1-3.65-.25-.4a10.45 10.45 0 1 1 8.61 4.67Zm5.73-7.83c-.31-.16-1.84-.91-2.12-1.01-.28-.1-.49-.16-.7.16-.21.31-.8 1.01-.98 1.22-.18.21-.36.24-.67.08-.31-.16-1.32-.49-2.51-1.55-.93-.83-1.56-1.86-1.74-2.17-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.7-1.69-.96-2.31-.25-.61-.51-.53-.7-.54h-.6c-.21 0-.55.08-.83.39-.28.31-1.1 1.07-1.1 2.61s1.12 3.03 1.28 3.24c.16.21 2.2 3.36 5.33 4.71.75.32 1.34.51 1.8.65.76.24 1.45.2 2 .12.61-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.28-.21-.59-.37Z"
              fill="currentColor"
            />
          </svg>
        </span>

        {/* INNER HIGHLIGHT */}
        <span className="button-glow" />
      </button>

      <style jsx>{`
        /* =================================================
           WRAPPER
        ================================================= */

        .whatsapp-wrapper {
          position: fixed;
          right: 24px;
          bottom: 24px;

          z-index: 99999;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 62px;
          height: 62px;

          pointer-events: none;
        }

        /* =================================================
           HOVER LABEL
        ================================================= */

        .whatsapp-label {
          position: absolute;

          right: 73px;

          min-width: 185px;

          padding: 11px 14px;

          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 10px;

          background: #ffffff;

          color: #111111;

          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.12);

          opacity: 0;
          visibility: hidden;

          transform:
            translateX(15px)
            scale(0.96);

          transform-origin: right center;

          transition:
            opacity 0.28s ease,
            visibility 0.28s ease,
            transform 0.28s ease;

          pointer-events: none;

          white-space: nowrap;
        }

        /* ================================================
           SMALL ARROW
        ================================================= */

        .whatsapp-label::after {
          content: "";

          position: absolute;

          right: -6px;
          top: 50%;

          width: 11px;
          height: 11px;

          background: #ffffff;

          border-top: 1px solid
            rgba(0, 0, 0, 0.08);

          border-right: 1px solid
            rgba(0, 0, 0, 0.08);

          transform:
            translateY(-50%)
            rotate(45deg);
        }

        /* =================================================
           SHOW LABEL WHEN HOVERING BUTTON
        ================================================= */

        .whatsapp-wrapper:hover
          .whatsapp-label {
          opacity: 1;
          visibility: visible;

          transform:
            translateX(0)
            scale(1);
        }

        /* =================================================
           TITLE
        ================================================= */

        .label-title {
          display: block;

          margin-bottom: 2px;

          color: #111111;

          font-size: 14px;
          line-height: 1.35;

          font-weight: 700;
        }

        /* =================================================
           SUBTITLE
        ================================================= */

        .label-subtitle {
          display: block;

          color: #666666;

          font-size: 12px;
          line-height: 1.4;

          font-weight: 400;
        }

        /* =================================================
           WHATSAPP BUTTON
        ================================================= */

        .whatsapp-button {
          position: relative;

          width: 62px;
          height: 62px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          border: none;
          border-radius: 50%;

          background: #25d366;

          color: #ffffff;

          cursor: pointer;

          box-shadow:
            0 8px 25px
              rgba(0, 0, 0, 0.18);

          pointer-events: auto;

          animation:
            whatsapp-float
            3.2s
            ease-in-out
            infinite;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        /* =================================================
           BUTTON HOVER
        ================================================= */

        .whatsapp-button:hover {
          transform:
            translateY(-4px)
            scale(1.05);

          box-shadow:
            0 13px 32px
              rgba(0, 0, 0, 0.24);
        }

        /* =================================================
           BUTTON CLICK
        ================================================= */

        .whatsapp-button:active {
          transform:
            scale(0.94);
        }

        /* =================================================
           ICON
        ================================================= */

        .whatsapp-icon {
          position: relative;

          z-index: 3;

          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .whatsapp-icon svg {
          display: block;

          width: 100%;
          height: 100%;
        }

        /* =================================================
           OUTER PULSE
        ================================================= */

        .whatsapp-pulse {
          position: absolute;

          inset: -5px;

          border-radius: 50%;

          border:
            2px solid
              rgba(37, 211, 102, 0.30);

          animation:
            whatsapp-pulse
            2.4s
            ease-out
            infinite;
        }

        /* =================================================
           INNER GLOW
        ================================================= */

        .button-glow {
          position: absolute;

          inset: 0;

          z-index: 2;

          border-radius: 50%;

          background:
            radial-gradient(
              circle at 32% 28%,
              rgba(255, 255, 255, 0.28),
              transparent 38%
            );

          pointer-events: none;
        }

        /* =================================================
           SOFT FLOATING ANIMATION
        ================================================= */

        @keyframes whatsapp-float {
          0% {
            transform:
              translateY(0);
          }

          25% {
            transform:
              translateY(-3px);
          }

          50% {
            transform:
              translateY(0);
          }

          75% {
            transform:
              translateY(-3px);
          }

          100% {
            transform:
              translateY(0);
          }
        }

        /* =================================================
           PULSE
        ================================================= */

        @keyframes whatsapp-pulse {
          0% {
            opacity: 0.60;

            transform:
              scale(0.92);
          }

          65% {
            opacity: 0;

            transform:
              scale(1.30);
          }

          100% {
            opacity: 0;

            transform:
              scale(1.30);
          }
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 768px) {
          .whatsapp-wrapper {
            right: 16px;
            bottom: 18px;

            width: 58px;
            height: 58px;
          }

          .whatsapp-button {
            width: 58px;
            height: 58px;
          }

          .whatsapp-icon {
            width: 29px;
            height: 29px;
          }

          /*
           * Mobile par hover nahi hota,
           * isliye label ko completely hide
           * rakhenge.
          */

          .whatsapp-label {
            display: none;
          }
        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 480px) {
          .whatsapp-wrapper {
            right: 13px;
            bottom: 14px;

            width: 54px;
            height: 54px;
          }

          .whatsapp-button {
            width: 54px;
            height: 54px;
          }

          .whatsapp-icon {
            width: 27px;
            height: 27px;
          }

          .whatsapp-pulse {
            inset: -4px;
          }
        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {
          .whatsapp-button,
          .whatsapp-pulse {
            animation: none;
          }

          .whatsapp-label {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}