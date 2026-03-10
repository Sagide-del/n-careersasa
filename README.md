# CareerSasa

CareerSasa is a working local career-guidance system built with React on the frontend and Express on the backend.

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
