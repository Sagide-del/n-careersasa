# CareerSasa

CareerSasa is a working career-guidance system built with React on the frontend and Express on the backend.

## Working flow

1. Register a learner account.
2. Log in.
3. Verify payment to unlock the assessment.
4. Complete the 5-step assessment.
5. Submit and view generated career recommendations.

## Frontend

- Single React app in `src/App.js`
- Local session storage for auth token and assessment draft
- Screens for home, auth, dashboard, payment, assessment, and results

## Backend

- Express API in `backend/index.js`
- Local JSON persistence in `backend/data/app-data.json`
- Endpoints for auth, payment simulation, assessment submission, and results

## Run locally without Docker

Backend:

```powershell
npm.cmd run start:backend
```

Frontend:

```powershell
npm.cmd start
```

## Run with Docker

From the project root:

```powershell
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Health: `http://localhost:8080/health`

To stop the containers:

```powershell
docker compose down
```

## Deploy on Railway

Deploy this repo as two Railway services:

### 1. Backend service

- Repository root for service: `backend`
- Railway config file used: `backend/railway.json`
- Public URL example: `https://your-backend.up.railway.app`

### 2. Frontend service

- Repository root for service: project root
- Railway config file used: `railway.json`
- Set environment variable before deploy:

```bash
REACT_APP_API_BASE_URL=https://your-backend.up.railway.app
```

### Railway order

1. Create backend service from the `backend` folder.
2. Copy the backend public Railway URL.
3. Create frontend service from the repo root.
4. Set `REACT_APP_API_BASE_URL` on the frontend service to the backend URL.
5. Redeploy the frontend so the React build picks up the API URL.

## Docker notes

- `docker-compose.yml` starts both frontend and backend.
- The backend data folder is mounted to `./backend/data` so user accounts and results persist locally.
- The frontend image is built with `REACT_APP_API_BASE_URL=http://localhost:8080`.

## Frontend environment

Optional `.env.local`:

```bash
REACT_APP_API_BASE_URL=http://localhost:8080
```

## Notes

- Assessment drafts are saved in the browser.
- Backend data persists locally in `backend/data/app-data.json`.
- Payment is simulated locally through the verify-payment flow.
