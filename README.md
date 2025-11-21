# 2025 Pitch Repertoires

A web application for analyzing baseball pitcher pitch data based on the given pitchers in the assignment and current starting pitchers on the 2025 free agent market.

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** and **npm** (for frontend)
- SQLite database (`pitches.db`) in the `backend/` directory

## Database Setup

**Important:** The `pitches.db` database file (302 MB) is not included in this repository due to GitHub's file size limit of 100 MB.

To run this application, you need to obtain the `pitches.db` file separately and place it in the `backend/` directory.

Once you have the database file, ensure it is located at:
```
backend/pitches.db
```

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment if not already created
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Step 1: Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment if not already activated:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

3. Start the FastAPI server:
   ```bash
   python main.py
   ```

   The backend server will start on `http://127.0.0.1:8000`

   You should see output like:
   ```
   INFO:     Started server process
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://127.0.0.1:8000
   ```

### Step 2: Start the Frontend Development Server

1. Open a new terminal window or tab

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` or another port if 5173 is in use

   You should see output like:
   ```
   VITE v7.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

### Step 3: Access the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

## Dependencies

### Backend Dependencies

The backend uses the following Python packages that are listed in `backend/requirements.txt`:

- **fastapi** - Modern web framework for building APIs
- **uvicorn[standard]** - ASGI server for running FastAPI
- **numpy** - Numerical computing library for Stuff Score calculations

### Frontend Dependencies

The frontend uses the following key packages that are listed in `frontend/package.json`:

**Production Dependencies:**
- **react** (^19.2.0) - React library
- **react-dom** (^19.2.0) - React DOM rendering
- **recharts** (^3.4.1) - Charting library for pitch movement visualizations

**Development Dependencies:**
- **vite** (^7.2.2) - Build tool and development server
- **@vitejs/plugin-react** - Vite plugin for React

## API Endpoints

The backend provides the following endpoints:

- `GET /pitchers` - Get list of main pitchers
- `GET /free_agents` - Get list of free-agent pitchers
- `GET /pitchers/{pitcher_id}/summary` - Get pitch summary for a specific pitcher
- `GET /free_agents/stuff_score` - Get Stuff Score leaderboard for free agents

## Troubleshooting

### Backend Issues

- **Port 8000 already in use**: If you see "Address already in use", another process is using port 8000. Either stop that process or modify `main.py` to use a different port.

- **Database not found**: Ensure `pitches.db` exists in the `backend/` directory. The database file is not included in this repository due to size limitations. See the "Database Setup" section above for instructions on obtaining the database file.


- **Module not found errors**: Make sure you've activated the virtual environment and installed dependencies with `pip install -r requirements.txt`.

### Frontend Issues

- **Port 5173 already in use**: Vite will automatically try the next available port like 5174, 5175, and so on. Check the terminal output for the actual port number.

- **Cannot connect to backend**: Ensure the backend server is running on `http://127.0.0.1:8000`. Check `src/constants.js` if you need to change the API base URL.

- **Module not found errors**: Run `npm install` in the `frontend/` directory to install all dependencies.
