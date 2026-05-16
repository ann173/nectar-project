export default function Home() {
  return (
    <main style={{ display: "grid", gridTemplateColumns: "1fr 420px", minHeight: "100vh" }}>
      <section style={{ padding: "24px", background: "#f7f3eb" }}>
        <iframe
          src="PASTE_FLOURISH_EMBED_URL_HERE"
          style={{ width: "100%", height: "90vh", border: "0" }}
          allowFullScreen
        />
      </section>

      <aside style={{ padding: "32px", background: "#111", color: "white" }}>
        <h1>NECTAR</h1>
        <h2>Reverse-engineering data-sharing networks</h2>

        <p>
          This visualisation reconstructs possible data sources feeding into the
          Nectar intelligence platform.
        </p>

        <p>
          Click the segments in the Flourish visual to explore the information
          entered in the research database.
        </p>
      </aside>
    </main>
  );
}
