import { NATIONALS_PITCHERS } from "../constants";
import PitcherStats from "./PitcherStats";
import PitchMovementPlot from "./PitchMovementPlot";
import PitchSummaryTable from "./PitchSummaryTable";

export default function FreeAgentsTab({
  freeAgentPitchers,
  selectedFreeAgentId,
  setSelectedFreeAgentId,
  selectedNationalsId,
  setSelectedNationalsId,
  summary,
  comparisonSummary,
  error
}) {
  return (
    <section className="panel">
      <label className="picker-label">
        Free Agent:
        <select
          className="pitcher-select"
          value={selectedFreeAgentId}
          onChange={(e) => setSelectedFreeAgentId(e.target.value)}
        >
          <option value="">– Choose a free agent –</option>
          {freeAgentPitchers.map((p) => (
            <option key={p.pitcher_id} value={p.pitcher_id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="picker-label" style={{ marginTop: "1rem" }}>
        Compare with a Nationals Starting Pitcher:
        <select
          className="pitcher-select"
          value={selectedNationalsId}
          onChange={(e) => setSelectedNationalsId(e.target.value)}
        >
          <option value="">– Choose –</option>
          {NATIONALS_PITCHERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {error && <div className="error-text">{error}</div>}

      {/* Free Agent Table */}
      {summary.length > 0 && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "600", textAlign: "center" }}>
            {freeAgentPitchers.find(p => p.pitcher_id === parseInt(selectedFreeAgentId))?.name || "Free Agent"} Pitch Summary
          </h3>
          <PitcherStats summary={summary} />
          <PitchMovementPlot summary={summary} />
          <PitchSummaryTable summary={summary} />
        </div>
      )}

      {/* Comparison Table */}
      {comparisonSummary.length > 0 && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "600", textAlign: "center" }}>
            Comparison with {NATIONALS_PITCHERS.find(p => p.id === parseInt(selectedNationalsId))?.name || "Nationals Pitcher"}
          </h3>
          <PitcherStats summary={comparisonSummary} />
          <PitchMovementPlot summary={comparisonSummary} />
          <PitchSummaryTable summary={comparisonSummary} />
        </div>
      )}

      <p className="extra-note" style={{ marginTop: "2rem", textAlign: "center" }}>
        (Extra feature) Added pitch summaries for free agents using the given
        dataset.
      </p>
    </section>
  );
}

