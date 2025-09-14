Counseling AI Application
This is a full-stack web application designed to provide AI-powered career counseling. It features a React frontend for the user interface and a Django backend to manage data and interact with an Ollama-powered Large Language Model (LLM).

Project Structure
counseling-ai-app/
├── backend/
│   ├── api/
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── llm_engine.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── counseling_ai/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── venv/
│   ├── db.sqlite3
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Questionnaire.js
    │   │   ├── LoadingScreen.js
    │   │   └── ChatInterface.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   └── index.js
    └── package.json

Prerequisites
Before you begin, ensure you have the following installed on your system:

Python (version 3.10 or higher)

Node.js and npm (version 16 or higher)

Ollama: You must have the Ollama server installed and running with the llama3.1 model. Download it from ollama.com.

Backend Setup (Django)
Important: Before you start, delete your old backend folder to ensure a clean setup.

Navigate to your project root and create a new backend folder.

cd counseling-ai-app
mkdir backend
cd backend

Save all the backend files I provided into their correct locations (e.g., save models.py inside backend/api/).

Create and Activate Virtual Environment

python -m venv venv
source venv/Scripts/activate  # On Windows Git Bash
# venv\Scripts\activate      # On Windows CMD

Install Python Dependencies

pip install django djangorestframework django-cors-headers python-decouple langchain langchain-ollama

Set Up the Database

python manage.py makemigrations
python manage.py migrate

Start the Backend Server

python manage.py runserver

Leave this terminal running.

Frontend Setup (React)
Navigate to the Frontend Directory in a new terminal.

cd frontend

Save all the frontend files I provided into their correct locations.

Install JavaScript Dependencies

npm install

Start the Frontend Server

npm start

Leave this terminal running.

How to Use the Application
Make sure your Ollama server, Django server, and React server are all running.

Open your browser and go to http://localhost:3000.

The application will now work according to the new advanced conversational flow.