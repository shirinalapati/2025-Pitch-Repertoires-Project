// src/App.jsx
import { useEffect, useState } from "react";
import "./App.css";
import { API_BASE } from "./constants";
import PitcherStats from "./components/PitcherStats";
import PitchMovementPlot from "./components/PitchMovementPlot";
import PitchSummaryTable from "./components/PitchSummaryTable";
import FreeAgentsTab from "./components/FreeAgentsTab";
import StuffScoreTab from "./components/StuffScoreTab";
import AboutPageTab from "./components/AboutPageTab";

// ---------- Main App ----------
export default function App() {
  const [mainPitchers, setMainPitchers] = useState([]);
  const [freeAgentPitchers, setFreeAgentPitchers] = useState([]);
  const [activeTab, setActiveTab] = useState("about"); // "about", "main", "free_agents", or "stuff_score"

  const [selectedMainId, setSelectedMainId] = useState("");
  const [selectedFreeAgentId, setSelectedFreeAgentId] = useState("");
  const [selectedNationalsId, setSelectedNationalsId] = useState("");

  const [summary, setSummary] = useState([]);
  const [comparisonSummary, setComparisonSummary] = useState([]);
  const [stuffScoreData, setStuffScoreData] = useState(null);
  const [error, setError] = useState("");

  // Fetch main pitchers
  useEffect(() => {
    async function loadMainPitchers() {
      try {
        console.log("Fetching main pitchers from", `${API_BASE}/pitchers`);
        const res = await fetch(`${API_BASE}/pitchers`);
        if (!res.ok) {
          throw new Error(`Pitchers request failed: ${res.status}`);
        }
        const data = await res.json();
        console.log("Main pitchers response:", data);
        setMainPitchers(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load pitchers from backend.");
      }
    }
    loadMainPitchers();
  }, []);

  // Fetch free agent pitchers
  useEffect(() => {
    async function loadFreeAgentPitchers() {
      try {
        console.log("Fetching free agents from", `${API_BASE}/free_agents`);
        const res = await fetch(`${API_BASE}/free_agents`);
        if (!res.ok) {
          throw new Error(`Free agents request failed: ${res.status}`);
        }
        const data = await res.json();
        console.log("Free agents response:", data);
        setFreeAgentPitchers(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load free agents from backend.");
      }
    }
    loadFreeAgentPitchers();
  }, []);

  // Helper to fetch summary by pitcher id
  async function fetchSummary(pitcherId) {
    if (!pitcherId) return;
    try {
      setError("");
      console.log("Fetching summary for pitcher", pitcherId);
      const res = await fetch(`${API_BASE}/pitchers/${pitcherId}/summary`);
      if (!res.ok) {
        throw new Error(`Summary request failed: ${res.status}`);
      }
      const data = await res.json();
      console.log("Summary response:", data);
      setSummary(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pitch summary from backend.");
      setSummary([]);
    }
  }

  // Fetch Stuff Score leaderboard
  useEffect(() => {
    if (activeTab === "stuff_score") {
      async function loadStuffScore() {
        try {
          setError("");
          console.log("Fetching Stuff Score leaderboard");
          const res = await fetch(`${API_BASE}/free_agents/stuff_score`);
          if (!res.ok) {
            throw new Error(`Stuff Score request failed: ${res.status}`);
          }
          const data = await res.json();
          console.log("Stuff Score response:", data);
          setStuffScoreData(data);
        } catch (err) {
          console.error(err);
          setError("Failed to load Stuff Score from backend.");
          setStuffScoreData(null);
        }
      }
      loadStuffScore();
    }
  }, [activeTab]);

  // Reset selections when switching tabs
  useEffect(() => {
    if (activeTab === "about") {
      // Reset all selections when switching to about tab
      setSelectedMainId("");
      setSelectedFreeAgentId("");
      setSelectedNationalsId("");
      setSummary([]);
      setComparisonSummary([]);
    } else if (activeTab === "main") {
      // Reset free agent selections when switching to main tab
      setSelectedFreeAgentId("");
      setSelectedNationalsId("");
      setComparisonSummary([]);
    } else if (activeTab === "free_agents") {
      // Reset main selection when switching to free agents tab
      setSelectedMainId("");
      setSummary([]);
    } else if (activeTab === "stuff_score") {
      // Reset other selections when switching to stuff score tab
      setSelectedMainId("");
      setSelectedFreeAgentId("");
      setSelectedNationalsId("");
      setSummary([]);
      setComparisonSummary([]);
    }
  }, [activeTab]);

  // Load summary whenever main selection changes
  useEffect(() => {
    if (activeTab === "main" && selectedMainId) {
      fetchSummary(selectedMainId);
    } else if (activeTab === "main") {
      setSummary([]);
    }
  }, [activeTab, selectedMainId]);

  // Load summary whenever free-agent selection changes
  useEffect(() => {
    if (activeTab === "free_agents" && selectedFreeAgentId) {
      fetchSummary(selectedFreeAgentId);
    } else if (activeTab === "free_agents") {
      setSummary([]);
    }
  }, [activeTab, selectedFreeAgentId]);

  // Load comparison summary whenever Nationals pitcher selection changes
  useEffect(() => {
    if (activeTab === "free_agents" && selectedNationalsId) {
      async function loadComparison() {
        try {
          setError("");
          console.log("Fetching comparison summary for pitcher", selectedNationalsId);
          const res = await fetch(`${API_BASE}/pitchers/${selectedNationalsId}/summary`);
          if (!res.ok) {
            throw new Error(`Summary request failed: ${res.status}`);
          }
          const data = await res.json();
          console.log("Comparison summary response:", data);
          setComparisonSummary(data);
        } catch (err) {
          console.error(err);
          setComparisonSummary([]);
        }
      }
      loadComparison();
    } else {
      setComparisonSummary([]);
    }
  }, [activeTab, selectedNationalsId]);

  return (
    <div className="app">
      <header className="page-header">
        <h1>2025 Pitch Repertoires</h1>
        <p>
          
        </p>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={
            "tab" + (activeTab === "about" ? " tab-active" : "")
          }
          onClick={() => setActiveTab("about")}
        >
          About Page
        </button>
        <button
          className={
            "tab" + (activeTab === "main" ? " tab-active" : "")
          }
          onClick={() => setActiveTab("main")}
        >
          Main
        </button>
        <button
          className={
            "tab" + (activeTab === "free_agents" ? " tab-active" : "")
          }
          onClick={() => setActiveTab("free_agents")}
        >
          Free Agents
        </button>
        <button
          className={
            "tab" + (activeTab === "stuff_score" ? " tab-active" : "")
          }
          onClick={() => setActiveTab("stuff_score")}
        >
          Stuff Score
        </button>
      </div>

      {/* ABOUT PAGE TAB */}
      {activeTab === "about" && <AboutPageTab />}

      {/* MAIN TAB */}
      {activeTab === "main" && (
        <section className="panel">
          <label className="picker-label">
            Pitcher:
            <select
              className="pitcher-select"
              value={selectedMainId}
              onChange={(e) => setSelectedMainId(e.target.value)}
            >
              <option value="">– Choose a pitcher –</option>
              {mainPitchers.map((p) => (
                <option key={p.pitcher_id} value={p.pitcher_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          {error && <div className="error-text">{error}</div>}

          {/* Show stats, plot, and table for main pitcher */}
          {summary.length > 0 && (
            <>
              <PitcherStats summary={summary} />
              <PitchMovementPlot summary={summary} />
          <PitchSummaryTable summary={summary} />
            </>
          )}
        </section>
      )}

      {/* FREE AGENTS TAB */}
      {activeTab === "free_agents" && (
        <FreeAgentsTab
          freeAgentPitchers={freeAgentPitchers}
          selectedFreeAgentId={selectedFreeAgentId}
          setSelectedFreeAgentId={setSelectedFreeAgentId}
          selectedNationalsId={selectedNationalsId}
          setSelectedNationalsId={setSelectedNationalsId}
          summary={summary}
          comparisonSummary={comparisonSummary}
          error={error}
        />
      )}

      {/* STUFF SCORE TAB */}
      {activeTab === "stuff_score" && (
        <StuffScoreTab
          stuffScoreData={stuffScoreData}
          error={error}
        />
      )}
    </div>
  );
}
