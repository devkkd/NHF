export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#FDFFF1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Decorative background text */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: '"Tobias TRIAL", serif',
            fontSize: "clamp(220px, 34vw, 460px)",
            lineHeight: "0.8",
            fontWeight: 400,
            letterSpacing: "-0.08em",
            color: "rgba(123, 127, 92, 0.055)",
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          404
        </div>

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Small label */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "28px",
              fontFamily: '"Mona Sans", sans-serif',
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "#7B7F5C",
            }}
          >
            <span
              style={{
                display: "block",
                width: "32px",
                height: "1px",
                background: "#858763",
              }}
            />

            ERROR 404

            <span
              style={{
                display: "block",
                width: "32px",
                height: "1px",
                background: "#858763",
              }}
            />
          </div>

          {/* Main 404 */}
          <div
            style={{
              fontFamily: '"Tobias TRIAL", serif',
              fontSize: "clamp(150px, 23vw, 260px)",
              lineHeight: "0.72",
              fontWeight: 400,
              letterSpacing: "-0.065em",
              color: "#7B7F5C",
              marginBottom: "42px",
            }}
          >
            404
          </div>

          {/* Divider */}
          <div
            style={{
              width: "52px",
              height: "1px",
              background: "#D8D8CC",
              margin: "0 auto 30px",
            }}
          />

          {/* Heading */}
          <h1
            style={{
              margin: "0 0 16px",
              fontFamily: '"Tobias TRIAL", serif',
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: "1.15",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "#7B7F5C",
            }}
          >
            Page Not Found
          </h1>

          {/* Description */}
          <p
            style={{
              maxWidth: "520px",
              margin: "0 auto",
              fontFamily: '"Mona Sans", sans-serif',
              fontSize: "17px",
              lineHeight: 1.75,
              fontWeight: 400,
              color: "#333",
            }}
          >
            The page you are looking for doesn't exist or may have been
            moved. Please check the address and try again.
          </p>

          {/* Bottom brand line */}
          <div
            style={{
              marginTop: "65px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "18px",
            }}
          >
            <span
              style={{
                width: "70px",
                height: "1px",
                background: "#D8D8CC",
              }}
            />

            <span
              style={{
                fontFamily: '"Mona Sans", sans-serif',
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                color: "#9A9C84",
                whiteSpace: "nowrap",
              }}
            >
              NIKITA HOME FURNISHINGS
            </span>

            <span
              style={{
                width: "70px",
                height: "1px",
                background: "#D8D8CC",
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile adjustments */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 767px) {
              .nhf-404-mobile {
                padding: 50px 20px !important;
              }
            }
          `,
        }}
      />
    </main>
  );
}