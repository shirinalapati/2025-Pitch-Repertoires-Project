import sqlite3
from pathlib import Path
import numpy as np

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Path to pitches.db (assumes it's in the same folder as main.py)
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "pitches.db"

app = FastAPI()

# Enable CORS so React (localhost:5173) can call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # okay for assignment
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------- MAIN PITCHERS -------------------------

MAIN_PITCHER_NAMES = [
    "Logan Webb",
    "Carlos Rodón",
    "Garrett Crochet",
    "Zac Gallen",
    "Max Fried",
    "Jake Irvin",
    "MacKenzie Gore",
    "Brad Lord",
    "Jose A. Ferrer",
    "Matt Waldron",
]

# ------------------------- FREE AGENTS — YOUR LIST -------------------------

FREE_AGENT_NAMES = [
    "Dylan Cease",
    "Framber Valdez",
    "Ranger Suárez",
    "Nick Martinez",
    "Chris Bassitt",
    "Michael King",
    "Zac Gallen",
    "Merrill Kelly",
    "Zack Littell",
    "Patrick Corbin",
    "Erick Fedde",
    "Justin Verlander",
    "Zach Eflin",
    "Miles Mikolas",
    "Nestor Cortes",
    "Adrian Houser",
    "Tyler Mahle",
    "Lucas Giolito",
    "Andrew Heaney",
    "Michael Lorenzen",
    "Jose Quintana",
    "Aaron Civale",
    "Chris Paddack",
    "Tyler Anderson",
    "Michael Soroka",
    "Jon Gray",
    "Martín Pérez",
    "Griffin Canning",
    "Chris Flexen",
    "Marcus Stroman",
    "Max Scherzer",
    "Austin Gomber",
    "Cal Quantrill",
    "Dustin May",
    "Paul Blackburn",
    "Jordan Montgomery",
    "JT Brubaker",
    "Germán Márquez",
    "Tomoyuki Sugano",
    "José Ureña",
    "José Urquidy",
    "Tony Gonsolin",
    "Kenta Maeda",
    "Mike Clevinger",
    "Wade Miley",
    "Walker Buehler",
    "Anthony DeSclafani",
]

def get_db():
    """Open DB connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ------------------------- MAIN /pitchers ENDPOINT -------------------------

@app.get("/pitchers")
def list_pitchers():
    """Return the 10 assigned pitchers who have pitch data."""
    conn = get_db()
    cur = conn.cursor()

    placeholders = ", ".join("?" for _ in MAIN_PITCHER_NAMES)

    cur.execute(
        f"""
        SELECT DISTINCT
            pl.player_id AS pitcher_id,
            pl.name_use || ' ' || pl.name_last AS name
        FROM players pl
        INNER JOIN pitches pt ON pl.player_id = pt.pitcher_id
        WHERE pl.name_use || ' ' || pl.name_last IN ({placeholders})
        ORDER BY name;
        """,
        MAIN_PITCHER_NAMES,
    )

    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

# ------------------------- FREE AGENTS ENDPOINT -------------------------

@app.get("/free_agents")
def list_free_agents():
    """Return free agent pitchers from the FREE_AGENT_NAMES list who have pitch data."""
    conn = get_db()
    cur = conn.cursor()

    placeholders = ", ".join("?" for _ in FREE_AGENT_NAMES)

    cur.execute(
        f"""
        SELECT DISTINCT
            pl.player_id AS pitcher_id,
            pl.name_use || ' ' || pl.name_last AS name
        FROM players pl
        INNER JOIN pitches pt ON pl.player_id = pt.pitcher_id
        WHERE pl.name_use || ' ' || pl.name_last IN ({placeholders})
        ORDER BY name;
        """,
        FREE_AGENT_NAMES,
    )

    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


# ------------------------- SUMMARY ENDPOINT -------------------------

@app.get("/pitchers/{pitcher_id}/summary")
def pitcher_summary(pitcher_id: int):
    """Return pitch-type summary for a pitcher."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        WITH pitcher_pitches AS (
            SELECT *
            FROM pitches
            WHERE pitcher_id = :pitcher_id
        ),
        tot AS (
            SELECT COUNT(*) AS total_pitches
            FROM pitcher_pitches
        )
        SELECT
            pp.pitch_type,
            COUNT(*) AS pitch_count,
            ROUND(100.0 * COUNT(*) / tot.total_pitches, 1) AS usage_pct,
            ROUND(AVG(pp.release_speed), 1) AS avg_speed,
            ROUND(AVG(pp.horizontal_break), 2) AS avg_horizontal_break,
            ROUND(AVG(pp.induced_vertical_break), 2) AS avg_induced_vertical_break,
            ROUND(AVG(pp.spin_rate), 0) AS avg_spin_rate,
            ROUND(AVG(pp.hit_exit_speed), 1) AS avg_hit_exit_speed,
            ROUND(AVG(pp.hit_launch_angle), 1) AS avg_hit_launch_angle
        FROM pitcher_pitches pp
        CROSS JOIN tot
        GROUP BY pp.pitch_type, tot.total_pitches
        ORDER BY pitch_count DESC;
        """,
        {"pitcher_id": pitcher_id},
    )

    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

# ------------------------- STUFF SCORE ENDPOINT -------------------------

@app.get("/free_agents/stuff_score")
def free_agents_stuff_score():
    """
    Calculate Stuff Score for all free agent pitchers.
    Uses usage-weighted averages, Z-scores, and weighted combination.
    """
    conn = get_db()
    cur = conn.cursor()
    
    # Get all free agent pitchers
    placeholders = ", ".join("?" for _ in FREE_AGENT_NAMES)
    
    cur.execute(
        f"""
        SELECT DISTINCT
            pl.player_id AS pitcher_id,
            pl.name_use || ' ' || pl.name_last AS name
        FROM players pl
        INNER JOIN pitches pt ON pl.player_id = pt.pitcher_id
        WHERE pl.name_use || ' ' || pl.name_last IN ({placeholders})
        ORDER BY name;
        """,
        FREE_AGENT_NAMES,
    )
    
    free_agents = cur.fetchall()
    
    if len(free_agents) < 2:
        conn.close()
        return {"error": "Need at least 2 pitchers for Stuff Score calculation"}
    
    # Step 1: Calculate usage-weighted averages for each pitcher
    pitcher_stats = []
    
    for agent in free_agents:
        pitcher_id = agent[0]
        name = agent[1]
        
        # Get pitch-type summary for this pitcher
        cur.execute(
            """
            WITH pitcher_pitches AS (
                SELECT *
                FROM pitches
                WHERE pitcher_id = :pitcher_id
            ),
            tot AS (
                SELECT COUNT(*) AS total_pitches
                FROM pitcher_pitches
            )
            SELECT
                pp.pitch_type,
                COUNT(*) AS pitch_count,
                ROUND(100.0 * COUNT(*) / tot.total_pitches, 1) AS usage_pct,
                AVG(pp.release_speed) AS avg_speed,
                AVG(pp.horizontal_break) AS avg_horizontal_break,
                AVG(pp.induced_vertical_break) AS avg_induced_vertical_break,
                AVG(pp.spin_rate) AS avg_spin_rate,
                AVG(pp.hit_exit_speed) AS avg_hit_exit_speed,
                AVG(pp.hit_launch_angle) AS avg_hit_launch_angle
            FROM pitcher_pitches pp
            CROSS JOIN tot
            GROUP BY pp.pitch_type, tot.total_pitches
            ORDER BY pitch_count DESC;
            """,
            {"pitcher_id": pitcher_id},
        )
        
        pitch_summary = cur.fetchall()
        
        if not pitch_summary:
            continue
        
        # Calculate usage-weighted averages
        weighted_speed = 0.0
        weighted_hb = 0.0
        weighted_ivb = 0.0
        weighted_spin = 0.0
        weighted_exit_velo = 0.0
        weighted_launch_angle = 0.0
        
        for pitch in pitch_summary:
            usage_pct = pitch[2] or 0
            usage_weight = usage_pct / 100.0
            
            if pitch[3] is not None:  # avg_speed
                weighted_speed += usage_weight * pitch[3]
            if pitch[4] is not None:  # avg_horizontal_break
                weighted_hb += usage_weight * abs(pitch[4])  # absolute value
            if pitch[5] is not None:  # avg_induced_vertical_break
                weighted_ivb += usage_weight * abs(pitch[5])  # absolute value
            if pitch[6] is not None:  # avg_spin_rate
                weighted_spin += usage_weight * pitch[6]
            if pitch[7] is not None:  # avg_hit_exit_speed
                weighted_exit_velo += usage_weight * pitch[7]
            if pitch[8] is not None:  # avg_hit_launch_angle
                weighted_launch_angle += usage_weight * pitch[8]
        
        pitcher_stats.append({
            "pitcher_id": pitcher_id,
            "name": name,
            "speed": weighted_speed,
            "hb": weighted_hb,
            "ivb": weighted_ivb,
            "spin": weighted_spin,
            "exit_velo": weighted_exit_velo,
            "launch_angle": weighted_launch_angle,
        })
    
    conn.close()
    
    if len(pitcher_stats) < 2:
        return {"error": "Insufficient data for Stuff Score calculation"}
    
    # Step 2: Calculate mean and std across all free agents
    speeds = [p["speed"] for p in pitcher_stats if p["speed"] > 0]
    hbs = [p["hb"] for p in pitcher_stats if p["hb"] > 0]
    ivbs = [p["ivb"] for p in pitcher_stats if p["ivb"] != 0]
    spins = [p["spin"] for p in pitcher_stats if p["spin"] > 0]
    exit_velos = [p["exit_velo"] for p in pitcher_stats if p["exit_velo"] > 0]
    launch_angles = [p["launch_angle"] for p in pitcher_stats if p["launch_angle"] != 0]
    
    mean_speed = np.mean(speeds) if speeds else 0
    std_speed = np.std(speeds) if speeds and len(speeds) > 1 else 1
    
    mean_hb = np.mean(hbs) if hbs else 0
    std_hb = np.std(hbs) if hbs and len(hbs) > 1 else 1
    
    mean_ivb = np.mean(ivbs) if ivbs else 0
    std_ivb = np.std(ivbs) if ivbs and len(ivbs) > 1 else 1
    
    mean_spin = np.mean(spins) if spins else 0
    std_spin = np.std(spins) if spins and len(spins) > 1 else 1
    
    mean_ev = np.mean(exit_velos) if exit_velos else 0
    std_ev = np.std(exit_velos) if exit_velos and len(exit_velos) > 1 else 1
    
    mean_la = np.mean(launch_angles) if launch_angles else 0
    std_la = np.std(launch_angles) if launch_angles and len(launch_angles) > 1 else 1
    
    # Step 3: Calculate Z-scores and final Stuff Score for each pitcher
    result = []
    for pitcher in pitcher_stats:
        # Calculate Z-scores
        z_speed = (pitcher["speed"] - mean_speed) / std_speed if std_speed > 0 else 0
        z_hb = (pitcher["hb"] - mean_hb) / std_hb if std_hb > 0 else 0
        z_ivb = (pitcher["ivb"] - mean_ivb) / std_ivb if std_ivb > 0 else 0
        z_spin = (pitcher["spin"] - mean_spin) / std_spin if std_spin > 0 else 0
        
        # Flipped for exit velocity and launch angle (lower is better)
        z_ev = (mean_ev - pitcher["exit_velo"]) / std_ev if std_ev > 0 and pitcher["exit_velo"] > 0 else 0
        z_la = (mean_la - pitcher["launch_angle"]) / std_la if std_la > 0 and pitcher["launch_angle"] != 0 else 0
        
        # Calculate final Stuff Score
        stuff_score = (
            0.25 * z_speed +
            0.20 * z_spin +
            0.20 * z_ivb +
            0.15 * z_hb +
            0.10 * z_ev +
            0.10 * z_la
        )
        
        result.append({
            "pitcher_id": pitcher["pitcher_id"],
            "name": pitcher["name"],
            "stuff_score": round(stuff_score, 3),
            "z_speed": round(z_speed, 3),
            "z_spin": round(z_spin, 3),
            "z_ivb": round(z_ivb, 3),
            "z_hb": round(z_hb, 3),
            "z_ev": round(z_ev, 3),
            "z_la": round(z_la, 3),
        })
    
    # Sort by Stuff Score (highest is best)
    result.sort(key=lambda x: x["stuff_score"], reverse=True)
    
    return {
        "leaderboard": result,
        "league_stats": {
            "mean_speed": round(mean_speed, 2),
            "std_speed": round(std_speed, 2),
            "mean_hb": round(mean_hb, 2),
            "std_hb": round(std_hb, 2),
            "mean_ivb": round(mean_ivb, 2),
            "std_ivb": round(std_ivb, 2),
            "mean_spin": round(mean_spin, 0),
            "std_spin": round(std_spin, 0),
            "mean_ev": round(mean_ev, 2),
            "std_ev": round(std_ev, 2),
            "mean_la": round(mean_la, 2),
            "std_la": round(std_la, 2),
        }
    }

# ------------------------- RUNNING SERVER -------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
