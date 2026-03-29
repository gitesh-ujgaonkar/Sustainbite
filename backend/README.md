# The Hunger Signal — Backend API

FastAPI backend for the AI-driven surplus food redistribution logistics platform.

## Quick Start

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment
python -m venv .venv

# 3. Activate the virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 6. Run the development server
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Redirect to API docs |
| `GET` | `/docs` | Swagger UI documentation |
| `GET` | `/redoc` | ReDoc documentation |
| `GET` | `/api/v1/health` | Service health check |

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py   # Router aggregator
│   │       └── endpoints/
│   │           └── health.py # Health check endpoint
│   ├── core/
│   │   └── config.py        # Pydantic Settings
│   └── models/               # Pydantic schemas
├── requirements.txt
├── .env.example
└── README.md
```
