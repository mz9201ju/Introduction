import Hero from "@resume/components/Hero";
import Experience from "@resume/components/Experience";
import Skills from "@resume/components/Skills";
import { profile } from "@resume/data/profile";   // if you moved profile.js under resume/data
import SimpleSpaceshipCursor from "@shared/SimpleSpaceshipCursor";
// remove page-level CSS import; load index.css once in main.jsx


export default function Home() {
  return (
    <>
      {/* Simple Space Cursor */}
      <SimpleSpaceshipCursor />
      <main className="container">
        <div className="grid" style={{ marginTop: "4rem" }}>
          <div>
            <Hero profile={profile} />
            <div style={{ height: 16 }} />
            <Experience profile={profile} />
          </div>
          <div>
            <Skills skills={profile.skills} />
            <div className="card" style={{ marginTop: 12 }}>
              <h2 className="h h2">Nerd Stats</h2>
              <ul className="clean">
                <li>🔭 Favorite field: distributed systems & perf tuning</li>
                <li>🛠️ Tooling: Dynatrace, Splunk, Jenkins, ADO</li>
                <li>🚀 Motto: "Measure, automate, iterate."</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer">© {new Date().getFullYear()} {profile.name} — built with React & Vite</div>
      </main>
    </>
  );
}