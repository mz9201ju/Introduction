import Starfield from "./components/Starfield";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import SpaceshipCursor from "./components/SpaceshipCursor";
import { profile } from "./data/profile";
import "./index.css";


export default function App() {
  return (
    <>
      <SpaceshipCursor />
      <Starfield />
      <main className="container">
        <div className="grid">
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