// ==========================================
// PLACEHOLDER — akan diisi per tahap
// ==========================================

interface PlaceholderProps {
  title: string;
  description: string;
  icon: string;
}

function Placeholder({ title, description, icon }: PlaceholderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 8,
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function AdminOrdersPage() {
  return (
    <Placeholder
      icon="🛒"
      title="Manajemen Pesanan"
      description="Halaman ini akan segera tersedia. Di sini Anda bisa melihat, memfilter, dan mengelola semua pesanan."
    />
  );
}

export function AdminOrderDetailPage() {
  return (
    <Placeholder
      icon="📋"
      title="Detail Pesanan"
      description="Halaman detail pesanan akan segera tersedia."
    />
  );
}

export function AdminProductsPage() {
  return (
    <Placeholder
      icon="📦"
      title="Manajemen Produk"
      description="Halaman ini akan segera tersedia. Di sini Anda bisa menambah, mengedit, dan menghapus produk."
    />
  );
}

export function AdminContentPage() {
  return (
    <Placeholder
      icon="🖼️"
      title="Edit Landing Page"
      description="Halaman ini akan segera tersedia. Di sini Anda bisa mengedit konten halaman utama toko."
    />
  );
}

export function AdminVouchersPage() {
  return (
    <Placeholder
      icon="🏷️"
      title="Manajemen Voucher"
      description="Halaman ini akan segera tersedia. Di sini Anda bisa membuat dan mengelola voucher diskon."
    />
  );
}

export function AdminReviewsPage() {
  return (
    <Placeholder
      icon="⭐"
      title="Moderasi Review"
      description="Halaman ini akan segera tersedia. Di sini Anda bisa menyetujui atau menghapus review produk."
    />
  );
}

export function AdminWithdrawalPage() {
  return (
    <Placeholder
      icon="💰"
      title="Penarikan Dana"
      description="Halaman ini akan segera tersedia. Di sini Anda bisa mengelola rekening bank dan request penarikan."
    />
  );
}

export function AdminSettingsPage() {
  return (
    <Placeholder
      icon="⚙️"
      title="Pengaturan"
      description="Halaman ini akan segera tersedia. Di sini Anda bisa mengatur template email dan konfigurasi toko."
    />
  );
}
