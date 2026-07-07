# Smart Attendance System

A production-ready Smart Attendance System with:
- React frontend
- Flask backend
- MySQL database
- Socket.IO real-time updates
- JWT authentication
- Camera capture and face verification

## Folder structure

- `backend/`: Flask server, API routes, models, services
- `frontend/`: React SPA, responsive UI
- `database/`: MySQL schema

## Setup

### Backend

1. Create a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. Install backend dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```
3. Create `.env` from `backend/.env.example` and update values.
4. Initialize MySQL database using `database/schema.sql`.
5. Start backend server:
   ```powershell
   cd backend
   python app.py
   ```

### Frontend

1. Install React dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start frontend development server:
   ```bash
   npm start
   ```

## Deployment

### Render

- Backend: deploy `backend/` as a Python service.
- Set `START_COMMAND`: `python backend/app.py`
- Set environment variables from `.env.example`.
- Mount `backend/uploads` as persistent storage if needed.

- Frontend: deploy `frontend/` as a static site.
- Set build command: `npm run build`
- Set publish directory: `build`

### Railway

- Create two services: one for backend, one for frontend.
- Use `requirements.txt` and `package.json`.
- Configure environment variables from `.env.example`.
- Connect to a MySQL plugin or external database.

## Notes

- Face recognition runs using OpenCV and LBPH only. No `face_recognition` or `dlib` dependency is required.
- Use real student registration before attendance marking.
