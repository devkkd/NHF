// start

const fs = require('fs');
const path = require('path');
const w = (rel, txt) => {
  const f = path.join(__dirname, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, txt.trimStart(), 'utf8');
  console.log('wrote:', rel);
};

// ════════════════════════════════════════════
// 1. ADMIN CSS
// ════════════════════════════════════════════
w('src/styles/admin.css', `
:root {
  --a-olive: #7B7F5C; --a-dark: #636649; --a-light: rgba(123,127,92,0.10);
  --a-bg: #FAFAF6; --a-card: #FFFFFF; --a-border: #EAE7DE;
  --a-text: #2C2C24; --a-muted: #888880; --a-sb: 220px; --a-tb: 56px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.nhf-admin{display:flex;min-height:100vh;background:var(--a-bg);font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--a-text);}
.nhf-sb{width:var(--a-sb);background:#1C1F17;color:#fff;display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:50;overflow-y:auto;transition:transform .25s;}
.nhf-sb-logo{padding:18px 18px 14px;border-bottom:1px solid rgba(255,255,255,.08);}
.nhf-sb-nav{flex:1;padding:10px 0;overflow-y:auto;}
.nhf-sb-group{margin-bottom:2px;}
.nhf-sb-group-label{display:block;padding:10px 18px 4px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.3);font-weight:600;}
.nhf-sb-item{display:flex;align-items:center;gap:10px;padding:9px 18px;color:rgba(255,255,255,.65);text-decoration:none;font-size:12.5px;font-weight:500;transition:all .15s;}
.nhf-sb-item:hover{color:#fff;background:rgba(255,255,255,.06);}
.nhf-sb-item.active{color:#fff;background:var(--a-olive);}
.nhf-sb-icon{width:16px;height:16px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.nhf-sb-badge{margin-left:auto;background:#e05252;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;}
.nhf-sb-footer{padding:12px 14px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px;}
.nhf-sb-avatar{width:32px;height:32px;border-radius:50%;background:var(--a-olive);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}
.nhf-sb-uname{font-size:12px;font-weight:600;color:#fff;line-height:1.3;}
.nhf-sb-urole{font-size:10px;color:rgba(255,255,255,.4);}
.nhf-sb-logout{margin-left:auto;background:none;border:none;cursor:pointer;color:rgba(255,255,255,.4);padding:4px;transition:color .15s;}
.nhf-sb-logout:hover{color:#fff;}
.nhf-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:40;}
.nhf-main{flex:1;margin-left:var(--a-sb);display:flex;flex-direction:column;min-height:100vh;}
.nhf-topbar{height:var(--a-tb);background:var(--a-card);border-bottom:1px solid var(--a-border);display:flex;align-items:center;padding:0 22px;gap:14px;position:sticky;top:0;z-index:30;}
.nhf-topbar-burger{display:none;background:none;border:none;cursor:pointer;color:var(--a-muted);padding:4px;}
.nhf-topbar-pagetitle{font-size:14px;font-weight:600;color:var(--a-text);flex:1;}
.nhf-topbar-right{display:flex;align-items:center;gap:10px;}
.nhf-topbar-user{display:flex;align-items:center;gap:8px;}
.nhf-topbar-uavatar{width:30px;height:30px;border-radius:50%;background:var(--a-olive);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;}
.nhf-topbar-uname{font-size:12px;font-weight:600;color:var(--a-text);}
.nhf-page{flex:1;padding:26px 26px 60px;overflow-y:auto;}
.nhf-dash-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:22px;flex-wrap:wrap;}
.nhf-dash-title{font-size:20px;font-weight:700;color:var(--a-text);margin:0 0 3px;}
.nhf-dash-sub{font-size:12px;color:var(--a-muted);margin:0;}
.nhf-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:all .15s;text-decoration:none;white-space:nowrap;}
.nhf-btn-primary{background:var(--a-olive);color:#fff;border-color:var(--a-olive);}
.nhf-btn-primary:hover{background:var(--a-dark);border-color:var(--a-dark);}
.nhf-btn-ghost{background:transparent;color:var(--a-text);border-color:var(--a-border);}
.nhf-btn-ghost:hover{background:var(--a-light);border-color:var(--a-olive);color:var(--a-olive);}
.nhf-btn-danger{background:#fff5f5;color:#e05252;border-color:#fecaca;}
.nhf-btn-danger:hover{background:#fef2f2;}
.nhf-btn-sm{padding:5px 10px;font-size:11px;}
.nhf-btn-icon{padding:5px 8px;}
.nhf-btn:disabled{opacity:.5;cursor:not-allowed;}
.nhf-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
.nhf-toolbar-left{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.nhf-search-box{display:flex;align-items:center;gap:8px;border:1px solid var(--a-border);border-radius:7px;padding:6px 12px;background:#fff;min-width:200px;}
.nhf-search-box input{border:none;outline:none;font-size:12px;color:var(--a-text);background:transparent;flex:1;}
.nhf-form-group{display:flex;flex-direction:column;gap:5px;}
.nhf-form-label{font-size:11px;font-weight:600;color:var(--a-muted);letter-spacing:.04em;text-transform:uppercase;}
.nhf-form-input{border:1px solid var(--a-border);border-radius:7px;padding:8px 12px;font-size:13px;color:var(--a-text);background:#fff;outline:none;width:100%;transition:border-color .15s;font-family:inherit;}
.nhf-form-input:focus{border-color:var(--a-olive);}
.nhf-form-textarea{border:1px solid var(--a-border);border-radius:7px;padding:8px 12px;font-size:13px;color:var(--a-text);background:#fff;outline:none;width:100%;resize:vertical;font-family:inherit;transition:border-color .15s;}
.nhf-form-textarea:focus{border-color:var(--a-olive);}
.nhf-form-footer{display:flex;justify-content:flex-end;gap:8px;padding-top:14px;border-top:1px solid var(--a-border);margin-top:6px;}
.nhf-toggle{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:13px;color:var(--a-text);user-select:none;}
.nhf-toggle input{display:none;}
.nhf-toggle-track{width:36px;height:20px;border-radius:10px;background:#E8E4DC;position:relative;transition:background .2s;flex-shrink:0;}
.nhf-toggle input:checked+.nhf-toggle-track{background:var(--a-olive);}
.nhf-toggle-track::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15);}
.nhf-toggle input:checked+.nhf-toggle-track::after{transform:translateX(16px);}
.nhf-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;}
.nhf-modal{background:var(--a-card);border-radius:14px;width:100%;max-width:600px;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.15);overflow:hidden;}
.nhf-modal-head{display:flex;align-items:center;justify-content:space-between;padding:16px 22px 13px;border-bottom:1px solid var(--a-border);flex-shrink:0;}
.nhf-modal-title{font-size:15px;font-weight:700;color:var(--a-text);}
.nhf-modal-close{background:none;border:none;cursor:pointer;color:var(--a-muted);padding:4px;border-radius:6px;transition:background .15s;display:flex;align-items:center;justify-content:center;}
.nhf-modal-close:hover{background:#F0EDE6;}
.nhf-modal-body{padding:20px 22px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:14px;}
.nhf-cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:13px;}
.nhf-cat-card{background:var(--a-card);border:1px solid var(--a-border);border-radius:12px;overflow:hidden;transition:box-shadow .2s;}
.nhf-cat-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.07);}
.nhf-cat-img{position:relative;height:135px;background:#F0EDE6;overflow:hidden;}
.nhf-cat-img img{width:100%;height:100%;object-fit:cover;}
.nhf-cat-img-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#C0BAB0;}
.nhf-cat-body{padding:11px 13px;}
.nhf-cat-row{display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:4px;}
.nhf-cat-name{font-size:13px;font-weight:700;color:var(--a-text);}
.nhf-cat-desc{font-size:11px;color:var(--a-muted);line-height:1.5;margin-bottom:10px;min-height:16px;}
.nhf-cat-actions{display:flex;gap:6px;}
.nhf-tag{display:inline-flex;align-items:center;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap;}
.nhf-tag-wardrobe{background:var(--a-light);color:var(--a-olive);}
.nhf-tag-inactive{background:#FEF2F2;color:#dc2626;}
.nhf-empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:70px 20px;text-align:center;color:var(--a-muted);}
.nhf-empty-icon{width:52px;height:52px;border-radius:12px;background:#F0EDE6;display:flex;align-items:center;justify-content:center;color:#C0BAB0;}
.nhf-skeleton{background:linear-gradient(90deg,#F0EDE6 25%,#E8E4DC 50%,#F0EDE6 75%);background-size:200% 100%;animation:nhfSkel 1.4s infinite;border-radius:6px;}
@keyframes nhfSkel{0%{background-position:200% 0}100%{background-position:-200% 0}}
.img-uploader{position:relative;width:100%;height:140px;border:2px dashed var(--a-border);border-radius:10px;cursor:pointer;transition:border-color .15s;overflow:hidden;background:#FAFAF6;}
.img-uploader:hover,.img-uploader.drag{border-color:var(--a-olive);background:var(--a-light);}
.img-preview-wrap{position:absolute;inset:0;}
.img-preview-overlay{position:absolute;inset:0;background:rgba(0,0,0,0);display:flex;align-items:center;justify-content:center;transition:background .2s;}
.img-uploader:hover .img-preview-overlay{background:rgba(0,0,0,.3);}
.img-preview-overlay span{color:#fff;font-size:12px;font-weight:600;opacity:0;transition:opacity .2s;}
.img-uploader:hover .img-preview-overlay span{opacity:1;}
.img-placeholder-content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;}
.img-upload-icon{width:40px;height:40px;border-radius:10px;background:var(--a-light);color:var(--a-olive);display:flex;align-items:center;justify-content:center;}
.img-upload-label{font-size:12px;color:var(--a-muted);text-align:center;}
.img-upload-label span{color:var(--a-olive);font-weight:600;text-decoration:underline;}
.img-upload-hint{font-size:10px;color:#C0BAB0;}
.nhf-login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#F5F3EE 0%,#EDE9E0 100%);padding:20px;}
.nhf-login-card{background:#fff;border-radius:16px;padding:40px;width:100%;max-width:400px;box-shadow:0 8px 40px rgba(0,0,0,.10);}
.nhf-login-logo{margin-bottom:24px;text-align:center;}
.nhf-login-title{font-size:22px;font-weight:700;color:var(--a-text);margin:0 0 4px;}
.nhf-login-sub{font-size:13px;color:var(--a-muted);margin:0 0 26px;}
.nhf-login-error{background:#fff5f5;border-left:3px solid #e05252;color:#b91c1c;font-size:12px;padding:10px 14px;border-radius:4px;margin-bottom:16px;}
.nhf-login-form{display:flex;flex-direction:column;gap:14px;}
.nhf-login-submit{width:100%;padding:12px;background:var(--a-olive);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s;letter-spacing:.04em;}
.nhf-login-submit:hover{background:var(--a-dark);}
.nhf-login-submit:disabled{opacity:.6;cursor:not-allowed;}
@media(max-width:768px){
  .nhf-sb{transform:translateX(-100%);}
  .nhf-sb.open{transform:translateX(0);}
  .nhf-overlay{display:block;}
  .nhf-main{margin-left:0;}
  .nhf-topbar-burger{display:flex;}
  .nhf-page{padding:18px 14px 40px;}
  .nhf-cat-grid{grid-template-columns:repeat(auto-fill,minmax(155px,1fr));}
}
`);

// ════════════════════════════════════════════
// 2. ADMIN ROUTE GROUP
// ════════════════════════════════════════════
w('src/app/(admin)/layout.js', `
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import "@/styles/admin.css";
export const metadata = { title: "Admin — NHF" };
export default function AdminLayout({ children }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
`);
w('src/app/(admin)/admin/page.js', `
import { redirect } from "next/navigation";
export default function AdminRoot() { redirect("/admin/dashboard"); }
`);
w('src/app/(admin)/admin/login/page.js', `
import AdminLoginPage from "@/components/admin/AdminLoginPage";
export const metadata = { title: "Login — NHF Admin" };
export default function LoginPage() { return <AdminLoginPage />; }
`);
w('src/app/(admin)/admin/dashboard/page.js', `
import AdminGuard from "@/components/admin/AdminGuard";
import AdminDashboard from "@/components/admin/AdminDashboard";
export const metadata = { title: "Dashboard — NHF Admin" };
export default function Page() { return <AdminGuard><AdminDashboard /></AdminGuard>; }
`);
w('src/app/(admin)/admin/categories/page.js', `
import AdminGuard from "@/components/admin/AdminGuard";
import AdminCategories from "@/components/admin/AdminCategories";
export const metadata = { title: "Categories — NHF Admin" };
export default function Page() { return <AdminGuard><AdminCategories /></AdminGuard>; }
`);
w('src/app/(admin)/admin/products/page.js', `
import AdminGuard from "@/components/admin/AdminGuard";
import AdminProducts from "@/components/admin/AdminProducts";
export const metadata = { title: "Products — NHF Admin" };
export default function Page() { return <AdminGuard><AdminProducts /></AdminGuard>; }
`);

// ════════════════════════════════════════════
// 3. AdminGuard
// ════════════════════════════════════════════
w('src/components/admin/AdminGuard.jsx', `
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthContext } from "@/context/AdminAuthContext";
export default function AdminGuard({ children }) {
  const { user, loading } = useAdminAuthContext();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace("/admin/login"); }, [user, loading, router]);
  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#FAFAF6",color:"#7B7F5C",fontSize:13,gap:8,fontFamily:"sans-serif"}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      Loading...
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
  if (!user) return null;
  return children;
}
`);
