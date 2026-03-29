export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#FAF8F3",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "2rem", marginBottom: "12px" }}>404</h1>
        <p style={{ marginBottom: "16px" }}>Page not found.</p>
        <a href="/dashboard">Go to Dashboard</a>
      </div>
    </div>
  );
}

