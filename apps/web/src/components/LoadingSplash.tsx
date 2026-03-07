export function LoadingSplash() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
      role="status"
      aria-busy="true"
      aria-label="Loading"
      data-testid="loading-splash"
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "4px solid #e0e0e0",
          borderTopColor: "#2e7d32",
          borderRadius: "50%",
          animation: "splash-spin 0.8s linear infinite",
        }}
      />
      <style>{`
        @keyframes splash-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          [data-testid="loading-splash"] div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
