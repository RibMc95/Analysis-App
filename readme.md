# Stock Analysis Dashboard

A modern React and TypeScript web app for researching stock metrics using the Finnhub API. This project also includes a backend and DynamoDB database so users can save and manage their favorite stocks.

## Quick Start

### 1. Get a Finnhub API Key

Sign up for a free Finnhub API key and add it to your environment file.

### 2. Configure Environment Variables

Create a `.env` file for the frontend:

VITE_FINNHUB_API_KEY=your_finnhub_token_here

Create a `.env` file for the backend:

PORT=5000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
DYNAMODB_ENDPOINT=http://dynamodb-local:8000

Do not upload real API keys or AWS secrets to GitHub.

## Run the Full App

This project uses Docker Compose so the frontend, backend, DynamoDB database, and DynamoDB Admin can run together.

Command to run the full project:

docker compose up --build

After it starts, open these links in your browser:

Frontend: http://localhost:5173  
Backend: http://localhost:5000  
DynamoDB Admin: http://localhost:8001  

## Features

Users can search any stock ticker and view:

- Real-time stock price
- Daily price change percentage
- Company name and industry
- P/E ratio
- 52-week high and low
- Market capitalization
- Net income from the last 2 years
- Net income growth rate
- Growth/P/E ratio

Users can also:

- Log in or create a user
- Save favorite stocks
- View saved favorite stocks
- Delete stocks from favorites
- Store user and favorites data in DynamoDB

## Database

This project uses DynamoDB Local for the database during development.

The database stores user information and favorite stock information. This makes the app more useful because users can save stocks instead of only searching them one time.

### Users Table

The users table stores user information. When someone logs in, the backend checks if the user already exists. If the user does not exist, the backend can create a new user.

### Favorites Table

The favorites table stores the stocks that a user saves. Each favorite is connected to a user so the app knows which saved stocks belong to each person.

Favorite stock data may include:

- Username or user ID
- Stock ticker
- Company name
- Current price
- Date saved

## Backend API

The backend runs on:

http://localhost:5000

Main route:

GET /

This returns:

{
  "message": "Stock app backend is running"
}

User routes:

/api/users

Favorites routes:

/api/favorites

These routes allow the frontend to communicate with the database.

## Project Structure

src/
├── components/search/
│   ├── TickerApp.tsx
│   ├── SearchPanel.tsx
│   ├── ResultsPanel.tsx
│   ├── InvalidTickerModal.tsx
│   ├── types.ts
│   └── utils.ts
├── API/
│   └── finnhubService.ts
└── styles/

backend/
├── server.js
├── routes/
│   ├── users.js
│   └── favorites.js
├── db/
│   └── dynamodb.js
└── .env

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- Finnhub API

Backend:

- Node.js
- Express
- CORS
- dotenv
- AWS SDK v3

Database:

- DynamoDB Local
- DynamoDB Admin

Tools:

- Docker
- Docker Compose

## Available Scripts

Frontend:

npm run dev
npm run build
npm run preview
npm run lint

Backend:

node server.js

Docker:

docker compose up --build
docker compose down
docker compose restart

## How to Check That Everything Works

After running:

docker compose up --build

Open the frontend:

http://localhost:5173

Open the backend:

http://localhost:5000

You should see:

{
  "message": "Stock app backend is running"
}

Open DynamoDB Admin:

http://localhost:8001

This page lets users view the DynamoDB tables and stored data.

## Troubleshooting

### Backend connection error

Make sure Docker Compose is running:

docker compose up --build

Also make sure the frontend is using the correct backend URL:

http://localhost:5000

### Port 8000 is already in use

This means DynamoDB may already be running in another container.

Run:

docker compose down

Then restart:

docker compose up --build

### API key is not working

Make sure the frontend `.env` file has:

VITE_FINNHUB_API_KEY=your_finnhub_token_here

Then restart the app.

## Deployment

For frontend-only deployment:

npm run build

Then deploy the `dist` folder to a service like Netlify or Vercel.

For full database features, the backend and database also need to be hosted.

## Finnhub API

This app uses Finnhub API endpoints for:

- Company profile information
- Real-time quote data
- Financial metrics
- Historical financial reports

## Team Access

Teammates can get the latest code with:

git pull origin main

Then run the full project with:

docker compose up --build

Each teammate should create their own `.env` files before running the project.

## License

MIT
