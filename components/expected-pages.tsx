export function ExpectedPages() {
  return (
    <section className="section site-map" id="site-map">
      <span className="tag">Site map</span>
      <h2>Expected pages (delivery backlog)</h2>
      <p style={{ color: "var(--muted)", maxWidth: 720 }}>
        This table is the contract between product and engineering. Routes marked scaffold ship as
        placeholders; planned routes are tracked for sprint planning.
      </p>
      <div style={{ overflowX: "auto", marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Purpose</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr key="/"><td><code>/</code></td><td>Landing + site map</td><td>Scaffold</td></tr>
            <tr key="/communities"><td><code>/communities</code></td><td>Language community onboarding</td><td>Planned</td></tr>
            <tr key="/licensing"><td><code>/licensing</code></td><td>Buyer flows and license SKUs</td><td>Planned</td></tr>
            <tr key="/royalties"><td><code>/royalties</code></td><td>Payout transparency dashboard</td><td>Planned</td></tr>
            <tr key="/governance"><td><code>/governance</code></td><td>Council and moderation policy</td><td>Planned</td></tr>
            <tr key="/roadmap"><td><code>/roadmap</code></td><td>Delivery milestones</td><td>Scaffold</td></tr>
            <tr key="/docs"><td><code>/docs</code></td><td>Contributor and curator handbook</td><td>Scaffold</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
