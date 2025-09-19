# Prototype — Vision-Track (Counseling AI)

> **Prototype for the Vision-Track app** — a hackathon–ready, full‑stack counselling AI application with a React frontend, Django REST backend, and local LLM integration (Ollama).

---

## Table of contents

* [Project overview](#project-overview)
* [Demo / Screenshot ideas](#demo--screenshot-ideas)
* [Tech stack](#tech-stack)
* [Prerequisites](#prerequisites)
* [Repository structure](#repository-structure)
* [Quick start (recommended)](#quick-start-recommended)

  * [Clone repository](#clone-repository)
  * [Backend setup (Django)](#backend-setup-django)
  * [Frontend setup (React)](#frontend-setup-react)
  * [Start everything](#start-everything)
* [Environment variables / `.env` examples](#environment-variables--env-examples)
* [Ollama (LLM) — install & configuration](#ollama-llm---install--configuration)
* [API endpoints & usage examples](#api-endpoints--usage-examples)
* [Development tips & debugging](#development-tips--debugging)
* [Docker (optional)](#docker-optional)
* [Testing](#testing)
* [Deployment notes](#deployment-notes)
* [Contributing](#contributing)
* [License & contact](#license--contact)

---

## Project overview

This repository contains a prototype of **Vision-Track / Counseling AI** — an application that provides an interactive AI-powered career-counseling experience. It consists of:

* A **Django** backend that exposes REST endpoints and orchestrates the LLM calls.
* A **React** frontend that handles the user flow (questionnaire, chat UI, loading screens).
* Integration with **Ollama**, a local LLM server used to run the language model (e.g., `llama3.1`).

This README is written for a hackathon: fast to run, easy to demo, and easy to extend.

---

## Demo / Screenshot ideas

Add screenshots or short GIFs to the `frontend/public` folder and reference them here. Typical demo flow:

1. Start Ollama (local LLM) and ensure model `llama3.1` (or another compatible model) is pulled.
2. Start Django backend and React frontend.
3. Visit `http://localhost:3000` and walk through the questionnaire and chat.

---

## Tech stack

* Frontend: React, Tailwind CSS (config included), plain JS components
* Backend: Django, Django REST Framework
* LLM: Ollama (local service, default port `11434`) with `llama3.1` or compatible model
* Data: SQLite (default for prototype)
* Other: `langchain`, `langchain-ollama`, `django-cors-headers`

---

## Prerequisites

* Git
* Python 3.10+
* Node.js 16+ and npm
* [Ollama](https://ollama.com/) installed and accessible locally (see section below)
* (Optional) Docker & Docker Compose if you prefer containerized runs

---

## Repository structure

```
counseling-ai-app/
├── backend/
│   ├── api/                # django app: models, views, serializers
│   ├── counseling_ai/      # django project settings
│   ├── venv/               # example venv (don't commit your venv)
│   ├── db.sqlite3
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

> Note: The repository already includes a working skeleton for both backend and frontend. Follow the Quick start below to run locally.

---

## Quick start (recommended)

Follow these steps in order. Use separate terminals for frontend, backend and Ollama.

### 1) Clone repository

```bash
git clone https://github.com/Ayanokouji-sama/Prototype.git
cd Prototype
```

### 2) Backend setup (Django)

Open a terminal at `Prototype/backend`.

#### Unix / macOS

```bash
cd backend
python -m venv .venv      # create venv
source .venv/bin/activate
pip install --upgrade pip
# if a requirements.txt exists:
pip install -r requirements.txt
# otherwise install the main deps:
pip install django djangorestframework django-cors-headers python-decouple langchain langchain-ollama
```

#### Windows (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

#### DB setup & migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### Create superuser (optional, for Django admin)

```bash
python manage.py createsuperuser
```

#### Run Django server

```bash
python manage.py runserver 8000
```

By default the backend will run at `http://127.0.0.1:8000/` (adjust if necessary).

> Keep this terminal running.

### 3) Frontend setup (React)

Open a new terminal at `Prototype/frontend`.

```bash
cd frontend
npm install
npm start
```

The dev server will usually open `http://localhost:3000` in your browser. If not, open it manually.

> Keep this terminal running.

### 4) Start Ollama (local LLM)

Follow the dedicated [Ollama section](#ollama-llm---install--configuration) below. The important part: ensure Ollama is running and `llama3.1` (or another compatible model) is pulled.

---

## Environment variables / `.env` examples

Below are recommended `.env` variables for both backend and frontend. Place them in `backend/.env` and `frontend/.env` or follow your preferred local config strategy.

### Backend (`backend/.env`)

```
# Django
DJANGO_SECRET_KEY=replace_this_with_a_secure_key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

# Ollama
OLLAMA_HOST=127.0.0.1:11434   # default; change if you serve Ollama elsewhere
OLLAMA_MODEL=llama3.1         # model name used by your code

# Database (prototype uses sqlite by default so this is optional)
# DATABASE_URL=sqlite:///db.sqlite3
```

### Frontend (`frontend/.env`)

```
# Example used by React to call the backend API
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

> Reminder: Never commit secrets into the repo. Use a `.gitignore` to exclude `.env` files.

---

## Ollama (LLM) — install & configuration

This project expects a locally running Ollama server to power the chat/counseling LLM.

1. Download & install Ollama: [https://ollama.com/download](https://ollama.com/download) (follow OS instructions).
2. Pull the model you want, for example `llama3.1` (or another supported model):

```bash
ollama pull llama3.1
```

3. Start the Ollama server (default binding is `127.0.0.1:11434`):

```bash
ollama serve
```

* Default HTTP API host: `http://127.0.0.1:11434`.
* If you need to change host/port, set `OLLAMA_HOST` environment variable before `ollama serve` (e.g. `OLLAMA_HOST=0.0.0.0:11435 ollama serve`).

Quick test (curl):

```bash
curl http://127.0.0.1:11434/v1/list
# or test OpenAI-compatible endpoint
curl http://127.0.0.1:11434/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"llama3.1","messages":[{"role":"user","content":"hi"}]}'
```

If your backend code uses `langchain-ollama`, it will connect to the running Ollama endpoint — ensure the host/port match your backend config.

---

## API endpoints & usage examples

The backend exposes REST endpoints to communicate with the LLM and manage conversations. The exact routes are in `backend/api/urls.py`; common endpoints likely look like:

* `GET /api/` — health / info
* `POST /api/chat/` — send a user message and receive a response
* `GET /api/models/` — (optional) list available models

### Example `curl` to backend (replace with actual endpoint paths from the code)

```bash
curl -X POST http://127.0.0.1:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message":"I want career advice for becoming a software developer","context":{}}'
```

### Example: calling Ollama directly (for debugging)

```bash
curl http://127.0.0.1:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.1","messages":[{"role":"system","content":"You are a helpful career counselor."},{"role":"user","content":"How should I prepare for internships?"}]}'
```

> Tip: Inspect `backend/api/llm_engine.py` (or similar) to confirm the backend’s expected request/response format.

---

## Development tips & debugging

* If the frontend shows CORS errors, ensure `django-cors-headers` is configured and `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`.
* If the backend cannot reach Ollama, confirm `ollama serve` is running and that `OLLAMA_HOST`/URL match the backend settings.
* Use `python manage.py runserver 0.0.0.0:8000` if you want the backend accessible externally (remember to adjust Django’s `ALLOWED_HOSTS`).
* For fast iteration: enable Django debug and use React hot reload.

---

## Docker (optional)

You can containerize the app — the repo does not include a `docker-compose.yml` by default, but a minimal example follows.

**docker-compose.yml (example)**

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - '8000:8000'
    env_file: ./backend/.env
    volumes:
      - ./backend:/app
  frontend:
    build: ./frontend
    ports:
      - '3000:3000'
    env_file: ./frontend/.env
    volumes:
      - ./frontend:/app
  ollama:
    image: ollama/ollama
    ports:
      - '11434:11434'
    volumes:
      - ollama_data:/root/.ollama
volumes:
  ollama_data:
```

Notes:

* Official Ollama images and licensing may apply. Confirm current Ollama Docker image usage and authentication before deploying.

---

## Testing

* Backend: add Django unit tests for `api` views and serializers. Run:

```bash
python manage.py test
```

* Frontend: add basic Jest/React Testing Library tests, run `npm test`.

---

## Deployment notes

* Production Django: use a real DB (Postgres), set `DEBUG=False`, secure `SECRET_KEY`, serve behind Gunicorn + Nginx.
* Ollama: if you need remote hosting, run Ollama on a secured server and set `OLLAMA_HOST` accordingly. Remember the default Ollama port is `11434`.
* Environment and secrets: use a secrets manager or environment variables (don’t commit `.env`).

---

## Troubleshooting

* `Connection refused` to Ollama: check `ollama serve` is running and `OLLAMA_HOST` matches.
* CORS errors: add the frontend origin to `CORS_ALLOWED_ORIGINS` in Django settings.
* `ModuleNotFoundError`: check Python venv is active and dependencies installed.

---

## Contributing

1. Fork the repo
2. Create a feature branch `git checkout -b feat/your-feature`
3. Commit changes and push
4. Open a pull request describing your changes

Add useful labels: `hackathon`, `feature`, `bug`, `docs`.

---
