# INF653 Final Project - US States REST API

This project is a Node.js REST API built with Express and MongoDB that provides information about US states, including capitals, populations, admission dates, nicknames, and user-generated fun facts.

---

## 🚀 Live Demo
https://inf653kylegibsonfinal.onrender.com

---

## 📦 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- dotenv
- CORS

---

## 📁 Project Structure
project-root/
│
├── controllers/
│ └── statesController.js
│
├── data/
│ └── statesData.json
│
├── models/
│ └── States.js
│
├── routes/
│ └── states.js
│
├── index.html
├── server.js
├── package.json
└── .env

---

## ⚙️ Installation

1. Clone the repository:
https://github.com/kgibson4/INF653KyleGibsonFinal

2. Install dependencies:
npm install

3. Create a `.env` file:
DATABASEURI=mongoDB_Connection_String

4. Start the server:
npm start

## 🌐 API Base URL
/states/

---

## 📌 API Endpoints

### GET Requests

| Endpoint | Description |
|----------|-------------|
| `/states/` | Get all states |
| `/states/?contig=true` | Get contiguous states only |
| `/states/?contig=false` | Get non-contiguous states only |
| `/states/:state` | Get full data for a state |
| `/states/:state/capital` | Get state capital |
| `/states/:state/nickname` | Get state nickname |
| `/states/:state/population` | Get state population |
| `/states/:state/admission` | Get state admission date |
| `/states/:state/funfact` | Get random fun fact |

---

### POST Requests
#### Add Fun Facts
POST /states/:state/funfact

**Body:**
{
  "funfacts": [
    "Fun fact 1",
    "Fun fact 2"
  ]
}

---

### PATCH Requests
####Update Fun Fact
PATCH /states/:state/funfact

**Body:**
{
  "index": 1,
  "funfact": "Updated fun fact"
}

---

### DELETE Requests
#### Delete Fun Fact
DELETE /states/:state/funfact

**Body:**
{
  "index": 1
}