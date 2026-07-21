export default function NumberNexusSharedPreviewLoading() {
  return (
    <main
      aria-live="polite"
      style={{
        width: "100vw",
        height: "100vh",
        background: "#020810",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(94,234,212,0.72)",
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.2em",
      }}
    >
      INITIALISING NUMBER NEXUS PREVIEW…
    </main>
  );
}
