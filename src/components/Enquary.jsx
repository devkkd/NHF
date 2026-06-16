"use client";

export default function BulkOrderForm() {
  return (
    <section className="bulk-section">
      <div className="container">

        <h2 className="title">
          BULK ORDER ENQUIRY - NIKITA HOME FURNISHINGS
        </h2>

        <p className="subtitle">
          Fill in this form and our export team will respond within 24 hours
          with pricing, samples, and a personalised catalogue. All fields
          marked * are required.
          <br />
          +91 9460387858 | nikitahomefurnishings@yahoo.com | Jaipur, Rajasthan, India
        </p>

        <div className="form-box">

          <h3 className="form-heading">
            Your Contact Details
          </h3>

          <form>

            <div className="grid">

              {/* LEFT */}

              <div className="column">

                <div className="field">
                  <label>Full name*</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="field">
                  <label>Business email address</label>
                  <input
                    type="email"
                    placeholder="Enter your business email address"
                  />
                </div>

                <div className="field">
                  <label>Country</label>
                  <select>
                    <option>Select Your Country</option>
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>Canada</option>
                  </select>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-title">
                    Business Type*
                    <span>Multiple choice</span>
                  </label>

                  <label><input type="checkbox" /> Wholesale Distributor</label>
                  <label><input type="checkbox" /> Retail Boutique / Store</label>
                  <label><input type="checkbox" /> Department Store</label>
                  <label><input type="checkbox" /> Interior Designer / Decorator</label>
                  <label><input type="checkbox" /> Online Retailer / eCommerce</label>
                  <label><input type="checkbox" /> Hotel / Hospitality Group</label>
                  <label><input type="checkbox" /> Export Agent / Buying House</label>
                </div>

              </div>

              {/* RIGHT */}

              <div className="column">

                <div className="field">
                  <label>Product Category*</label>
                  <select>
                    <option>Select Product Category</option>
                    <option>Bed Linen</option>
                    <option>Home Furnishing</option>
                    <option>Table Linen</option>
                    <option>Wardrobe</option>
                    <option>Accessories</option>
                  </select>
                </div>

                <div className="field">
                  <label>Product Sub Category*</label>
                  <select>
                    <option>Select Product Sub Category</option>
                    <option>Bedsheets</option>
                    <option>Quilts</option>
                    <option>Cushion Covers</option>
                    <option>Throws</option>
                    <option>Kaftans</option>
                  </select>
                </div>

                <div className="field">
                  <label>Company / Business Name*</label>
                  <input
                    type="text"
                    placeholder="Enter your company / business name"
                  />
                </div>

                <div className="field">
                  <label>Mobile / WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="Enter your mobile / WhatsApp number"
                  />
                </div>

                <div className="field">
                  <label>Message</label>
                  <textarea
                    rows={5}
                    placeholder="Enter your message..."
                  />
                </div>

              </div>

            </div>

            <div className="submit-wrap">
              <button type="submit" className="submit-btn">
                SUBMIT →
              </button>
            </div>

          </form>
        </div>

      </div>

      <style jsx>{`
        .bulk-section {
          background: #fdfff1;
          padding: 90px 30px 120px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .title {
          text-align: center;
          font-family: "Tobias TRIAL", serif;
          color: #7b7f5c;
          font-size: 38px;
          font-weight: 500;
          line-height: 1.4;
          margin-bottom: 24px;
          margin-top: 18px;
        }

        .subtitle {
          text-align: center;
          max-width: 1100px;
          margin: 0 auto 70px;
          font-family: "Mona Sans", sans-serif;
          font-size: 16px;
          line-height: 1.8;
          color: #1d1d1d;
        }

        .form-box {
          border: 1px solid #d9dccb;
        }

        .form-heading {
          text-align: center;
          font-family: "Mona Sans", sans-serif;
          font-size: 20px;
          font-weight: 700;
          padding: 50px 0;
          color: #111;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          padding: 0 90px 70px;
        }

        .field {
          margin-bottom: 28px;
        }

        .field label {
          display: block;
          margin-bottom: 10px;
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          color: #222;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          border: none;
          border-bottom: 1px solid #cfcfc0;
          background: transparent;
          padding: 10px 0;
          font-family: "Mona Sans", sans-serif;
          font-size: 15px;
          outline: none;
          color: #222;
        }

        .field textarea {
          resize: none;
        }

        .checkbox-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
        }

        .checkbox-title span {
          font-size: 12px;
          color: #a0a090;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          color: #333;
        }

        .checkbox-group input {
          width: 18px;
          height: 18px;
          accent-color: #7b7f5c;
        }

        .submit-wrap {
          border-top: 1px solid #d9dccb;
          display: flex;
          justify-content: center;
          padding: 26px 0;
        }

        .submit-btn {
          background: #858863;
          color: white;
          border: none;
          min-width: 240px;
          height: 54px;
          cursor: pointer;
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          letter-spacing: 0.03em;
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 0 30px 50px;
          }

          .title {
            font-size: 30px;
          }

          .subtitle {
            font-size: 16px;
          }
        }

        @media (max-width: 768px) {
          .bulk-section {
            padding: 60px 20px 80px;
          }

          .title {
            font-size: 26px;
          }

          .subtitle {
            font-size: 15px;
          }

          .submit-btn {
            width: 100%;
            max-width: 320px;
          }
        }
      `}</style>
    </section>
  );
}