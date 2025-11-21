export default function StuffScoreTab({ stuffScoreData, error }) {
  return (
    <section className="panel">
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
          What is the Stuff Score?
        </h2>
        <div style={{ 
          backgroundColor: "#f5f5f5", 
          padding: "1.5rem", 
          borderRadius: "8px",
          lineHeight: "1.6",
          fontSize: "0.95rem"
        }}>
          <p style={{ marginBottom: "1rem" }}>
            The Stuff Score is a single metric I designed to summarize a free-agent pitcher's raw pitch quality using the pitch-level information in this dataset. Because each pitcher throws multiple pitch types with different movement, velocity, and batted-ball outcomes, the goal of this score is to collapse all that information into one number that can be compared across pitchers.
          </p>
          
          <p style={{ marginBottom: "0.5rem" }}>
            The score uses six components:
          </p>
          <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem" }}>
            <li>Average fastball/overall velocity</li>
            <li>Total horizontal movement (magnitude)</li>
            <li>Total vertical movement (magnitude)</li>
            <li>Average spin rate</li>
            <li>Average exit velocity allowed</li>
            <li>Average launch angle allowed</li>
          </ul>
          <p style={{ marginBottom: "1.5rem" }}>
            It is not meant to measure command or sequencing—just the physical quality of the arsenal and how it tends to affect contact.
          </p>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem", marginTop: "1rem" }}>
              1. Usage-Weighted Pitch Averages
            </h3>
            <p style={{ marginBottom: "0.5rem" }}>
              Each pitcher's repertoire is first summarized into usage-weighted averages, so more frequently used pitches contribute more to the final profile.
            </p>
            <p style={{ marginBottom: "0.5rem" }}>
              For each pitcher, I compute usage-weighted averages for:
            </p>
            <ul style={{ marginLeft: "1.5rem", marginBottom: "0.5rem" }}>
              <li>Velocity (mph)</li>
              <li>Horizontal Break (inches, absolute value)</li>
              <li>Induced Vertical Break (inches, absolute value)</li>
              <li>Spin Rate (rpm)</li>
              <li>Exit Velocity Allowed (mph)</li>
              <li>Launch Angle Allowed (degrees)</li>
            </ul>
            <p style={{ marginTop: "0.5rem" }}>
              For horizontal and vertical break, I use the absolute value. A slider with –15 inches of glove-side sweep and a changeup with +15 inches of arm-side run both represent elite movement—they just move in opposite directions. Similarly, a fastball with +18 inches of ride and a curveball with –18 inches of drop are both high-movement pitches. Since this metric is intended to measure raw stuff, it rewards movement magnitude, not the sign.
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem", marginTop: "1rem" }}>
              2. Standardizing Across Pitchers
            </h3>
            <p style={{ marginBottom: "0.5rem" }}>
              These six stats all live on different scales, so I convert them into Z-scores across all free-agent pitchers:
            </p>
            <p style={{ 
              fontFamily: "monospace", 
              backgroundColor: "#e8e8e8", 
              padding: "0.5rem", 
              borderRadius: "4px",
              marginBottom: "0.5rem",
              textAlign: "center"
            }}>
              Z = (value – free-agent mean) / free-agent standard deviation
            </p>
            <p style={{ marginBottom: "0.5rem" }}>
              This puts everything on a comparable scale, where:
            </p>
            <ul style={{ marginLeft: "1.5rem", marginBottom: "0.5rem" }}>
              <li>Z = 0 → free-agent average</li>
              <li>Z = +1 → one standard deviation better than free-agent average</li>
              <li>Z = –1 → one standard deviation below free-agent average</li>
            </ul>
            <p style={{ marginTop: "0.5rem" }}>
              For contact metrics, lower values are better (weaker contact and lower launch angles), so I flip them so that higher Z still means better:
            </p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
              <li>Exit velocity Z-score is based on (mean EV – pitcher EV)</li>
              <li>Launch angle Z-score is based on (mean LA – pitcher LA)</li>
            </ul>
            <p style={{ marginTop: "0.5rem" }}>
              This way, pitchers who consistently allow softer, lower contact get positive contributions to their Stuff Score.
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem", marginTop: "1rem" }}>
              3. Weighted Combination into a Single Score
            </h3>
            <p style={{ marginBottom: "0.5rem" }}>
              Finally, the standardized components are combined into one Stuff Score using weights that reflect how strongly each factor contributes to raw pitch quality:
            </p>
            <div style={{ 
              fontFamily: "monospace", 
              backgroundColor: "#e8e8e8", 
              padding: "0.75rem", 
              borderRadius: "4px",
              marginBottom: "0.75rem",
              lineHeight: "1.8"
            }}>
              StuffScore<sub>raw</sub> =<br />
              &nbsp;&nbsp;&nbsp;&nbsp;0.25 × Z<sub>Speed</sub><br />
              &nbsp;+ 0.20 × Z<sub>Spin</sub><br />
              &nbsp;+ 0.20 × Z<sub>IVB</sub><br />
              &nbsp;+ 0.15 × Z<sub>HB</sub><br />
              &nbsp;+ 0.10 × Z<sub>EV</sub><br />
              &nbsp;+ 0.10 × Z<sub>LA</sub>
            </div>
            <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
              Why these weights?
            </p>
            <ul style={{ marginLeft: "1.5rem" }}>
              <li><strong>Velocity (25%)</strong> – Fast pitches are generally harder to hit.</li>
              <li><strong>Spin (20%)</strong> – Higher spin supports more ride, depth, and late movement.</li>
              <li><strong>Vertical movement (20%)</strong> – Both ride and sink are key parts of modern pitching "stuff."</li>
              <li><strong>Horizontal movement (15%)</strong> – Sweeping sliders and heavy arm-side run are valuable shapes.</li>
              <li><strong>Exit velocity (10%)</strong> – Pitchers who consistently allow weaker contact get a bump.</li>
              <li><strong>Launch angle (10%)</strong> – Lower average launch angles suggest more ground balls and fewer ideal HR trajectories.</li>
            </ul>
            <p style={{ marginTop: "0.5rem", fontStyle: "italic", color: "#666" }}>
              I use the raw value for internal calculations and optionally rescale it for display (for example, centering around 50 with most pitchers falling between roughly 40 and 60).
            </p>
          </div>

          <div style={{ 
            marginTop: "1.5rem", 
            padding: "0.75rem", 
            backgroundColor: "#e8f4f8", 
            borderRadius: "4px"
          }}>
            <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
              How to Interpret the Stuff Score
            </p>
            <ul style={{ marginLeft: "1.5rem", marginBottom: "0.5rem" }}>
              <li><strong>Higher Stuff Score = better overall stuff</strong>, according to this model.</li>
              <li>A pitcher with a score above the free-agent average combines:
                <ul style={{ marginLeft: "1.5rem", marginTop: "0.25rem" }}>
                  <li>above-average velocity,</li>
                  <li>strong movement (horizontally and/or vertically),</li>
                  <li>and a track record of weaker, lower contact.</li>
                </ul>
              </li>
              <li>A lower score doesn't necessarily mean the pitcher is ineffective; it may reflect a profile that relies more on command, sequencing, or deception than on pure raw stuff.</li>
            </ul>
            <p style={{ marginTop: "0.5rem" }}>
              This metric gives a single, consistent way to compare free-agent pitchers using the data available in this assignment and helps highlight which arms might have the most physically dominant arsenals.
            </p>
          </div>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

          {/* Stuff Score Leaderboard */}
      {stuffScoreData?.leaderboard && stuffScoreData.leaderboard.length > 0 && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "600", textAlign: "center" }}>
            Free Agent Stuff Score Leaderboard
          </h3>
          <div className="table-wrapper">
            <table className="summary-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>Rank</th>
                  <th style={{ textAlign: "left" }}>Pitcher</th>
                  <th style={{ textAlign: "right" }}>Stuff Score</th>
                </tr>
              </thead>
              <tbody>
                {stuffScoreData.leaderboard.map((pitcher, idx) => (
                  <tr key={pitcher.pitcher_id}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td style={{ textAlign: "left" }}>{pitcher.name}</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>{pitcher.stuff_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!stuffScoreData || !stuffScoreData.leaderboard || stuffScoreData.leaderboard.length === 0) && !error && (
        <div style={{ 
          textAlign: "center", 
          padding: "2rem", 
          color: "#666",
          fontSize: "0.95rem"
        }}>
          Loading Stuff Score leaderboard...
        </div>
      )}
    </section>
  );
}

