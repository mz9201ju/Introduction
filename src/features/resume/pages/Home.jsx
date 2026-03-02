import { memo } from "react";
import Hero from "@resume/components/Hero";
import Experience from "@resume/components/Experience";
import Skills from "@resume/components/Skills";
import { profile } from "@resume/data/profile";
import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import Footer from "@app/nav/Footer";
import { usePageSeo } from "@app/hooks/usePageSeo";

const GRID_STYLE = { marginTop: "4rem" };
const SPACER_STYLE = { height: 16 };
const STATS_CARD_STYLE = { marginTop: 12 };
const AI_OPS_CARD_STYLE = { marginTop: 12 };
const NERD_STATS = [
  "🔭 Favorite field: distributed systems & perf tuning",
  "🛠️ Tooling: Dynatrace, Splunk, Jenkins, ADO, GitHub Actions",
  '🚀 Motto: "Measure, automate, iterate."',
  "📱 Latest: Android app via Capacitor on NYC LUX RIDE",
  "🤖 AI SEO: GPT-4o + Claude for 24/7 content & meta refresh",
];

function Home() {
  usePageSeo({
    title: "Omer Zahid – Chief Solution Architect & Senior Software Engineer",
    description:
      "Explore Omer Zahid’s portfolio: CSA & CTO for NYC LUX RIDE (MALIK NYC LLC), AI-powered SEO automation, Android app development, and enterprise engineering at Costco Wholesale.",
  });

  return (
    <>
      <SimpleSpaceshipCursor />
      <main className="container">
        <div className="grid" style={GRID_STYLE}>
          <div>
            <Hero profile={profile} />
            <div style={SPACER_STYLE} />
            <Experience profile={profile} />
          </div>
          <div>
            <Skills skills={profile.skills} />
            <div className="card" style={STATS_CARD_STYLE}>
              <h2 className="h h2">Nerd Stats</h2>
              <ul className="clean">
                {NERD_STATS.map((stat) => (
                  <li key={stat}>{stat}</li>
                ))}
              </ul>
            </div>
            <div className="card" style={AI_OPS_CARD_STYLE}>
              <h2 className="h h2">🤖 AI-Powered Platform Ops</h2>
              <ul className="clean">
                {(profile.experience[0].highlights ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Footer profile={profile} />
      </main>
    </>
  );
}

export default memo(Home);