import { memo } from "react";
import Hero from "@resume/components/Hero";
import Experience from "@resume/components/Experience";
import Skills from "@resume/components/Skills";
import { profile } from "@resume/data/profile";
import SimpleSpaceshipCursor from "@features/SimpleSpaceshipCursor";
import Footer from "@app/nav/Footer";

const GRID_STYLE = { marginTop: "4rem" };
const SPACER_STYLE = { height: 16 };
const STATS_CARD_STYLE = { marginTop: 12 };
const NERD_STATS = [
  "🔭 Favorite field: distributed systems & perf tuning",
  "🛠️ Tooling: Dynatrace, Splunk, Jenkins, ADO",
  '🚀 Motto: "Measure, automate, iterate."',
];

function Home() {
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
          </div>
        </div>
        <Footer profile={profile} />
      </main>
    </>
  );
}

export default memo(Home);