"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";
import { Package, Tag, TrendingUp, ShoppingBag } from "lucide-react";

function StatCard({ label, value, loading, error, icon: Icon, color }) {
  return (
    <div className="nhf-stat-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="nhf-stat-label">{label}</div>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: color ?? "var(--nhf-olive-light)",
          color: "var(--nhf-olive)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>
      {loading ? (
        <div className="nhf-skeleton nhf-skeleton-value" />
      ) : error ? (
        <div className="nhf-stat-error">{error}</div>
      ) : (
        <div className="nhf-stat-value">{value ?? "—"}</div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(null);
  const [categoryCount, setCategoryCount] = useState(null);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingC, setLoadingC] = useState(true);
  const [errorP, setErrorP] = useState(null);
  const [errorC, setErrorC] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const [pResult, cResult] = await Promise.allSettled([
        apiFetch("/products/admin/all?limit=1"),
        apiFetch("/categories/admin/all?limit=1"),
      ]);

      if (pResult.status === "fulfilled" && pResult.value.ok) {
        setProductCount(pResult.value.data?.data?.total ?? 0);
      } else {
        setErrorP("Failed to load");
      }
      setLoadingP(false);

      if (cResult.status === "fulfilled" && cResult.value.ok) {
        setCategoryCount(cResult.value.data?.data?.total ?? 0);
      } else {
        setErrorC("Failed to load");
      }
      setLoadingC(false);
    };

    fetchStats();
  }, []);

  return (
    <AdminShell>
      <div className="nhf-page-header">
        <div>
          <h1 className="nhf-page-title">Dashboard</h1>
          <p className="nhf-page-sub">Overview of your store</p>
        </div>
      </div>

      <div className="nhf-stats-grid">
        <StatCard
          label="Total Products"
          value={productCount}
          loading={loadingP}
          error={errorP}
          icon={Package}
        />
        <StatCard
          label="Total Categories"
          value={categoryCount}
          loading={loadingC}
          error={errorC}
          icon={Tag}
        />
      </div>

      <div style={{
        background: "var(--nhf-bg-card)",
        border: "1px solid var(--nhf-border)",
        borderRadius: 12,
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        color: "var(--nhf-muted)",
        fontSize: 13
      }}>
        <TrendingUp size={20} color="var(--nhf-olive)" />
        <div>
          <div style={{ fontWeight: 600, color: "var(--nhf-text)", marginBottom: 2 }}>Quick Links</div>
          <div>Manage your <a href="/admin/categories" style={{ color: "var(--nhf-olive)" }}>categories</a> and <a href="/admin/products" style={{ color: "var(--nhf-olive)" }}>products</a> from the sidebar.</div>
        </div>
      </div>
    </AdminShell>
  );
}
