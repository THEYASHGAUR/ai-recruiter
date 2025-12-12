resume analyser + ai interview questions Agent

frontend - html,css,js 
-
backend - fastapi , langchain
-

**How to Start Frontend and Backend**

- **Frontend (Next.js)**: open PowerShell in the `frontend` folder, install dependencies and start the dev server:

```powershell
cd frontend
npm install
npm run dev
```


- **Backend (FastAPI)**: open PowerShell in the `backend` folder, create/activate a virtual environment, install requirements, and run with Uvicorn:

```powershell
cd backend
# create a virtual environment (only if you don't already have one)
python -m venv .venv
# activate the venv in PowerShell
.\.venv\Scripts\Activate.ps1
# install dependencies
pip install -r requirements.txt
# start the server (development mode with auto-reload)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000` and the frontend at `http://localhost:3000` by default.
vector database = chromaDB
-


FEATURE 1 
- put the resume and job descrption of the job and get the match score , pros and cons , missing keywords , should u apply for this job or not..!?

FEATURE 2 
- get past interview questions and interview experiences from other candidates scrapped from the web.
- get insider tips for better chances of selection.
- using tavily search for extracting into from the web.


FEATURE 3 
- coming soon.....