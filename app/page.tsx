import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ExpectedPages } from "@/components/expected-pages";

export default function HomePage() {
  return (
    <>
      <section className="landing-hero">
        <div className="landing-orbs" aria-hidden />
        <div className="landing-hero-inner">
          <BrandLogo className="landing-logo" aria-label="LinguaLayer logo" />
          <span className="tag">Language rights · Royalties · Stellar</span>
          <h1 className="hero-headline">Your language. Your data. Your share.</h1>
          <p
            className="landing-lead"
            dangerouslySetInnerHTML={{ __html: "LinguaLayer builds <strong>transparent licensing and royalty splits</strong> for African and underrepresented languages\u2014so communities earn when their voices power the next wave of AI." }}
          />
          <div className="landing-cta-row">
            <Link href="/roadmap" className="cta">See the roadmap</Link>
            <Link href="/licensing" className="cta-secondary">Explore licensing</Link>
          </div>
          <ul className="landing-stats">
            <li>Dataset provenance</li>
            <li>License SKUs on-chain</li>
            <li>Contributor-first economics</li>
          </ul>
        </div>
      </section>

      <section className="landing-pillars">
        <article className="landing-pillar">
          <div className="landing-pillar-icon" aria-hidden>◆</div>
          <h3>Registry & shares</h3>
          <p>Who contributed what—immutable lineage for datasets.</p>
        </article>
        <article className="landing-pillar">
          <div className="landing-pillar-icon" aria-hidden>◇</div>
          <h3>License router</h3>
          <p>Commercial terms that buyers can actually enforce.</p>
        </article>
        <article className="landing-pillar">
          <div className="landing-pillar-icon" aria-hidden>○</div>
          <h3>Royalty splitter</h3>
          <p>Splits that reconcile with real payouts—not spreadsheets.</p>
        </article>
      </section>

      <p className="landing-trust">Designed with linguists, startups, and public-interest funders in mind.</p>

      <ExpectedPages />
    </>
  );
}
