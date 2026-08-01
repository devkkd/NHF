"use client";

import { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/addressApi";
import { getMyOrders } from "@/lib/api";

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "Singapore",
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  pin: "",
  city: "",
  country: "",
  state: "",
  mobile: "",
  altMobile: "",
  isDefault: false,
  lat: null,
  lng: null,
};


const DEFAULT_CENTER = { lat: 26.9124, lng: 75.7873 }; // Jaipur

export default function MyAccountPage() {
    const router = useRouter();

const {
  user,
  loading,
  isAuthenticated,
  logout,
} = useAuth();
  const [view, setView] = useState("main"); // "main" | "addresses"
  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
 const [orders, setOrders] = useState([]);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const leafletRef = useRef(null);

  // ---------- load / persist ----------
 

 useEffect(() => {

  if (loading) return;

  if (!isAuthenticated) {

    router.replace("/login?redirect=/profile");

    return;

  }

  loadAddresses();
  
loadOrders();
}, [loading, isAuthenticated]);

  // ---------- map init ----------
  useEffect(() => {
    if (!showForm || !mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;
      leafletRef.current = L;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const startLat = formData.lat ?? DEFAULT_CENTER.lat;
      const startLng = formData.lng ?? DEFAULT_CENTER.lng;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
      }).setView([startLat, startLng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(
        map
      );

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });

      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      setTimeout(() => map.invalidateSize(), 200);
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  // ---------- reverse geocode ----------
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      const addr = data.address || {};

      setLocationLabel({
        name:
          addr.attraction ||
          addr.building ||
          addr.neighbourhood ||
          data.display_name?.split(",")[0] ||
          "Selected Location",
        full: data.display_name || "",
      });

      setFormData((prev) => ({
        ...prev,
        lat,
        lng,
        address1: prev.address1 || addr.road || addr.suburb || "",
        city: prev.city || addr.city || addr.town || addr.village || "",
        pin: prev.pin || addr.postcode || "",
        state: prev.state || addr.state || "",
        country: COUNTRIES.includes(addr.country) ? addr.country : prev.country,
      }));
    } catch (e) {
      console.error("Reverse geocode failed", e);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Unable to fetch your location. Please allow location access.");
      }
    );
  };
 const loadAddresses = async () => {
  try {
    const res = await getAddresses();

    if (res.ok) {
      setAddresses(res.data.addresses || []);
    } else {
      setAddresses([]);
      console.error(res.data?.message);
    }
  } catch (err) {
    console.error(err);
    setAddresses([]);
  }
};
const loadOrders = async () => {
  try {
    const res = await getMyOrders();

    if (res?.success) {
      setOrders(res.orders || []);
    }
  } catch (err) {
    console.error(err);
  }
};

  // ---------- form handlers ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddNewClick = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setLocationLabel(null);
    setShowForm(true);
  };

 const handleEdit = (addr) => {

  setFormData({
    ...EMPTY_FORM,
    ...addr,
  });

  setEditingId(addr._id);

  setLocationLabel(
    addr.lat && addr.lng
      ? {
          name: addr.city || "Saved Location",
          full: "",
        }
      : null
  );

  setShowForm(true);
};

const handleRemove = async (id) => {

    try{

       const res = await deleteAddress(id);

if (res.ok) {
  loadAddresses();
} else {
  alert(res.data?.message || "Unable to delete address");
}

    }

    catch(error){

        console.error(error);

    }

}

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.address1 ||
    !formData.pin ||
    !formData.city ||
    !formData.state ||
    !formData.country ||
    !formData.mobile
  ) {
    alert("Please fill all required fields.");
    return;
  }

  try {
   let res;

if (editingId) {
  res = await updateAddress(editingId, formData);
} else {
  res = await addAddress(formData);
}

if (!res.ok) {
  alert(res.data?.message || "Something went wrong");
  return;
}

await loadAddresses();

    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setLocationLabel(null);

  } catch (error) {
  console.error(error);
  alert(error?.message || "Something went wrong.");
}
};

  const handleCancelForm = () => {
    setShowForm(false);
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };
if (loading) return null;

if (!isAuthenticated) return null;
  // ---------- render ----------
  return (
    <div className="acc-page">
      <div className="acc-container">
        {view === "main" && (
          <>
            <div className="acc-headrow">
              <h1 className="acc-title">My Account</h1>
             <button
  className="acc-logout"
  type="button"
 onClick={async () => {
  await logout();
  window.location.href = "/";
}}
>
                LOG OUT
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="acc-divider" />
            <div className="acc-row">
  <span className="acc-row-label">Name</span>
  <span className="acc-row-value">
    {user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`}
  </span>
</div>

<div className="acc-divider" />

<div className="acc-row">
  <span className="acc-row-label">Email</span>
  <span className="acc-row-value">
    {user?.email}
  </span>
</div>

<div className="acc-divider" />

<div className="acc-row">
  <span className="acc-row-label">Mobile</span>
  <span className="acc-row-value">
    {user?.phone || user?.mobile || "-"}
  </span>
</div>

<div className="acc-divider" />

            <div className="acc-row">
              <span className="acc-row-label">Order History</span>
              <div style={{ textAlign: "right" }}>
  <div className="acc-row-value">
    {orders.length === 0
      ? "YOU HAVEN'T PLACED ANY ORDERS YET"
      : `${orders.length} ORDER(S)`}
  </div>

  {orders.length > 0 && (
    <button
      className="acc-link"
      type="button"
      onClick={() => router.push("/profile/orders")}
    >
      View Orders →
    </button>
  )}
</div>
            </div>
            <div className="acc-divider" />

            <div className="acc-row">
              <span className="acc-row-label">Account Details</span>
              <button
                className="acc-link"
                type="button"
                onClick={() => setView("addresses")}
              >
                View Addresses ({addresses.length}) →
              </button>
            </div>
            <div className="acc-divider" />
          </>
        )}

        {view === "addresses" && (
          <>
            <div className="acc-headrow">
              <h1 className="acc-title">My Account</h1>
              <button
                className="acc-btn-primary"
                type="button"
                onClick={handleAddNewClick}
              >
                + ADD NEW ADDRESS
              </button>
            </div>
            <div className="acc-divider" />

            <button
              className="acc-back"
              type="button"
              onClick={() => {
                setView("main");
                setShowForm(false);
              }}
            >
              ← Return to Account Details
            </button>

            <h2 className="acc-subtitle">Your Addresses</h2>

            {showForm ? (
              <div className="acc-form-grid">
                <form className="acc-form-card" onSubmit={handleSubmit}>
                  <h3 className="acc-form-title">
                    {editingId ? "Edit Address" : "Add a New Address"}
                  </h3>

                  <div className="acc-form-row">
                    <div className="acc-field">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="acc-field">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="acc-form-row">
                    <div className="acc-field">
                      <label>Address 1</label>
                      <input
                        type="text"
                        name="address1"
                        placeholder="Enter your house number, street name"
                        value={formData.address1}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="acc-field">
                      <label>Address 2</label>
                      <input
                        type="text"
                        name="address2"
                        placeholder="Enter your area, nearby landmark"
                        value={formData.address2}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="acc-form-row">
                    <div className="acc-field">
                      <label>Pin / Zip / Postal Code</label>
                      <input
                        type="text"
                        name="pin"
                        placeholder="Enter your Pin / Zip / Postal Code"
                        value={formData.pin}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="acc-field">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="Enter you city name"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="acc-form-row">
                    <div className="acc-field">
                      <label>Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      >
                        <option value="">Select Your Country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="acc-field">
                      <label>State/Province</label>
                      <input
                        type="text"
                        name="state"
                        placeholder="Select Your State/Province"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="acc-form-row">
                    <div className="acc-field">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        name="mobile"
                        placeholder="Enter your Mobile Number"
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="acc-field">
                      <label>Alternative Mobile Number</label>
                      <input
                        type="tel"
                        name="altMobile"
                        placeholder="Enter your Alternative Mobile Number"
                        value={formData.altMobile}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <label className="acc-checkbox">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleChange}
                    />
                    <span className="acc-checkbox-mark" />
                    Set as default address
                  </label>

                  <div className="acc-form-actions">
                    <button type="submit" className="acc-btn-primary acc-btn-block">
                      {editingId ? "SAVE ADDRESS" : "+ ADD NEW ADDRESS"}
                    </button>
                    <button
                      type="button"
                      className="acc-btn-ghost"
                      onClick={handleCancelForm}
                    >
                      CANCEL
                    </button>
                  </div>
                </form>

                <div className="acc-map-card">
                  <button
                    type="button"
                    className="acc-btn-location"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
                    </svg>
                    {locating ? "Locating..." : "Use your Current Location"}
                  </button>

                  <div className="acc-map" ref={mapRef} />

                  {locationLabel && (
                    <div className="acc-map-info">
                      <p className="acc-map-name">{locationLabel.name}</p>
                      {locationLabel.full && (
                        <p className="acc-map-address">{locationLabel.full}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              addresses.length > 0 && (
                <div className="acc-address-grid">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="acc-address-card">
                      <div className="acc-address-head">
                        <h4>
                          {addr.firstName} {addr.lastName}
                        </h4>
                        {addr.isDefault && (
                          <span className="acc-badge">Default</span>
                        )}
                        {!addr.isDefault && (
  <button
    type="button"
    className="acc-link"
    onClick={async () => {
      try {
       const res = await setDefaultAddress(addr._id);

if (res?.ok) {
  loadAddresses();
} else {
  alert(res.data?.message || "Unable to set default address");
}
      } catch (error) {
        console.error(error);
      }
    }}
  >
    Set as Default
  </button>
)}
                      </div>
                      <p className="acc-address-line">
                        {addr.address1}
                        {addr.address2 ? `, ${addr.address2}` : ""}, {addr.city}
                      </p>
                      <p className="acc-address-line">
                        {addr.state}
                        {addr.state ? "," : ""}
                      </p>
                      <p className="acc-address-line">{addr.pin}</p>
                      <p className="acc-address-line">{addr.country}</p>
                      <p className="acc-address-line">
                        Mobile Number {addr.mobile}
                      </p>

                      <div className="acc-address-actions">
                        <button type="button" onClick={() => handleEdit(addr)}>
                          EDIT
                        </button>
                        <button
                          type="button"
                         onClick={() => handleRemove(addr._id)}
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      <style>{`
        .acc-page {
          background: #FEFFF5;
          min-height: 100vh;
          width: 100%;
          font-family: 'Mona Sans', sans-serif;
          color: #241C10;
        }

        .acc-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 108px 32px 80px;
        }

        .acc-headrow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .acc-title {
          font-family: 'Tobias TRIAL', 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 500;
          letter-spacing: 0.2px;
          margin: 0;
        }

        .acc-logout {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-family: 'Mona Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 0.08em;
          font-weight: 600;
          color: #241C10;
          cursor: pointer;
          padding: 8px 4px;
        }

        .acc-divider {
          height: 1px;
          background: rgba(36, 28, 16, 0.12);
          margin: 20px 0;
        }

        .acc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 0;
        }

        .acc-row-label {
          font-family: 'Tobias TRIAL', 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 500;
        }

        .acc-row-value {
          font-size: 12px;
          letter-spacing: 0.06em;
          font-weight: 500;
          color: #241C10;
          opacity: 0.75;
          text-align: right;
        }

        .acc-link {
          background: none;
          border: none;
          font-size: 13px;
          letter-spacing: 0.05em;
          font-weight: 700;
          color: #241C10;
          cursor: pointer;
          padding: 0;
        }

        .acc-btn-primary {
          background: #7B7F5C;
          color: #FEFFF5;
          border: none;
          border-radius: 999px;
          padding: 13px 22px;
          font-size: 12px;
          letter-spacing: 0.08em;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s ease;
        }

        .acc-btn-primary:hover {
          opacity: 0.88;
        }

        .acc-btn-block {
          width: 100%;
        }

        .acc-btn-ghost {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(36, 28, 16, 0.25);
          border-radius: 999px;
          padding: 13px 22px;
          font-size: 12px;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: #241C10;
          cursor: pointer;
          margin-top: 10px;
        }

        .acc-back {
          background: none;
          border: none;
          font-size: 12px;
          letter-spacing: 0.05em;
          font-weight: 600;
          color: #241C10;
          opacity: 0.8;
          cursor: pointer;
          padding: 4px 0;
          margin-top: 4px;
        }

        .acc-subtitle {
          font-family: 'Tobias TRIAL', 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 500;
          margin: 20px 0 24px;
        }

        /* ---------- form + map ---------- */
        .acc-form-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .acc-form-card {
          background: #FFFDF6;
          border: 1px solid rgba(36, 28, 16, 0.12);
          border-radius: 18px;
          padding: 32px;
        }

        .acc-form-title {
          font-family: 'Tobias TRIAL', 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 22px;
        }

        .acc-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .acc-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .acc-field label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .acc-field input,
        .acc-field select {
          font-family: 'Mona Sans', sans-serif;
          font-size: 13px;
          padding: 13px 14px;
          border-radius: 10px;
          border: 1px solid rgba(36, 28, 16, 0.2);
          background: #FEFFF5;
          color: #241C10;
          outline: none;
          width: 100%;
        }

        .acc-field input::placeholder {
          color: rgba(36, 28, 16, 0.45);
        }

        .acc-field input:focus,
        .acc-field select:focus {
          border-color: #7B7F5C;
        }

        .acc-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          cursor: pointer;
          margin: 6px 0 26px;
        }

        .acc-checkbox input {
          display: none;
        }

        .acc-checkbox-mark {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1px solid rgba(36, 28, 16, 0.35);
          display: inline-block;
          position: relative;
          flex-shrink: 0;
        }

        .acc-checkbox input:checked + .acc-checkbox-mark {
          border-color: #7B7F5C;
          background: #7B7F5C;
        }

        .acc-checkbox input:checked + .acc-checkbox-mark::after {
          content: "";
          position: absolute;
          top: 5px;
          left: 5px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FEFFF5;
        }

        .acc-form-actions {
          display: flex;
          flex-direction: column;
        }

        .acc-map-card {
          background: #FFFDF6;
          border: 1px solid rgba(36, 28, 16, 0.12);
          border-radius: 18px;
          padding: 20px;
          position: sticky;
          top: 24px;
        }

        .acc-btn-location {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #241C10;
          color: #FEFFF5;
          border: none;
          border-radius: 999px;
          padding: 13px 18px;
          font-size: 12px;
          letter-spacing: 0.04em;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 16px;
        }

        .acc-btn-location:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .acc-map {
          width: 100%;
          height: 340px;
          border-radius: 12px;
          overflow: hidden;
          background: #eee;
        }

        .acc-map-info {
          margin-top: 14px;
        }

        .acc-map-name {
          font-weight: 700;
          font-size: 14px;
          margin: 0 0 4px;
        }

        .acc-map-address {
          font-size: 13px;
          opacity: 0.75;
          margin: 0;
        }

        /* ---------- address list ---------- */
        .acc-address-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 320px));
          gap: 20px;
        }

        .acc-address-card {
          background: #FFFDF6;
          border: 1px solid rgba(36, 28, 16, 0.12);
          border-radius: 16px;
          overflow: hidden;
        }

        .acc-address-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 22px 0;
        }

        .acc-address-head h4 {
          font-family: 'Tobias TRIAL', 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          margin: 0;
        }

        .acc-badge {
          background: #7B7F5C;
          color: #FEFFF5;
          font-size: 11px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 999px;
        }

        .acc-address-line {
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
          padding: 0 22px;
          opacity: 0.85;
        }

        .acc-address-card .acc-address-line:last-of-type {
          margin-bottom: 20px;
        }

        .acc-address-actions {
          display: flex;
          border-top: 1px solid rgba(36, 28, 16, 0.12);
        }

        .acc-address-actions button {
          flex: 1;
          background: none;
          border: none;
          padding: 15px 0;
          font-size: 12px;
          letter-spacing: 0.05em;
          font-weight: 600;
          cursor: pointer;
          color: #241C10;
        }

        .acc-address-actions button:first-child {
          border-right: 1px solid rgba(36, 28, 16, 0.12);
        }

        /* ---------- responsive ---------- */
        @media (max-width: 900px) {
          .acc-container {
            padding: 36px 20px 60px;
          }

          .acc-form-grid {
            grid-template-columns: 1fr;
          }

          .acc-map-card {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .acc-title {
            font-size: 22px;
          }

          .acc-row-label {
            font-size: 17px;
          }

          .acc-subtitle {
            font-size: 19px;
          }

          .acc-form-card {
            padding: 22px;
          }

          .acc-address-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .acc-container {
            padding: 28px 20px 48px;
          }

          .acc-headrow {
            flex-wrap: wrap;
            gap: 12px;
          }

          .acc-title {
            font-size: 19px;
          }

          .acc-btn-primary {
            padding: 11px 16px;
            font-size: 11px;
          }

          .acc-logout {
            font-size: 12px;
          }

          .acc-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .acc-row-value {
            text-align: left;
          }

          .acc-row-label {
            font-size: 16px;
          }

          .acc-subtitle {
            font-size: 17px;
          }

          .acc-form-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .acc-form-card {
            padding: 18px;
          }

          .acc-form-title {
            font-size: 16px;
          }

          .acc-map {
            height: 260px;
          }

          .acc-address-head h4 {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}