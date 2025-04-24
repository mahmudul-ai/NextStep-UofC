# Title: NextStep UofC: A Job Portal Website

## Setting up Database
For this project, we have used the PostgreSQL database.

Create a file named `.env` in the `backend` directory declaring the following values:

    DB_HOST = ""        # database address
    DB_PORT = ""        # database port number
    DB_NAME = ""        # database name
    DB_USER = ""        # database username
    DB_PASSWORD = ""    # database password        

## Setting up Backend

Create a vitual environment:

    python -m venv .venv

Activate vitual environment (windows):

    .venv\Scripts\activate

Activate vitual environment  (Mac):

    source .venv/bin/activate

Move to the backend directory:

    cd backend
    
Install dependencies:

    pip install -r requirements.txt

Set up and migrate data to the database:

    python manage.py makemigrations
    python manage.py migrate

Run backend server:

    python manage.py runserver


## Setting up Frontend

Move to the frontend directory:

    cd ..\frontend

Install dependencies:

    npm install

Start Frontend Server:

    npm start