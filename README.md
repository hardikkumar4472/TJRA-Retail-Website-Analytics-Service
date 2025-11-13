# Website Analytics Service

## Overview
```
This project implements a backend service to capture and analyze website analytics events. It consists of two main modules:

1. Ingestion Service – Receives analytics events from clients and quickly stores them for processing.
2. Analytics Service – Provides summarized and aggregated analytics data via APIs.

The ingestion service is optimized for **high throughput** and does not block clients while writing to the database.
```
---

## Project Structure
```
backend/
│
├─ ingestion/ # Module for receiving analytics events
│ ├─ index.js
│ └─ package.json
│
├─ analytics/ # Module for querying summarized analytics
│ ├─ index.js
│ └─ package.json
│
├─ reporting/ # Reporting scripts
│ └─ report.js
│
├─ README.md
└─ package.json
```
yaml


---

## Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/hardikkumar4472/TJRA-Retail-Website-Analytics-Service
cd project-root
Install dependencies

bash
npm install
Database setup

Ensure your SQL or NoSQL database is running.

Apply any required indexes for faster queries.

Example SQL index (if using MySQL/Postgres):

sql
CREATE INDEX idx_event_type ON events(event_type);
CREATE INDEX idx_timestamp ON events(timestamp);
Run services
```
bash
# Run ingestion service
npm run start-ingestion

# Run analytics service
npm run start-analytics

# Run reporting script
```
node reporting/report.js
API Endpoints
Ingestion Service
POST /event

Body: { "eventType": "click", "userId": "123", "timestamp": "2025-11-13T00:00:00Z", "metadata": {} }

Stores the analytics event asynchronously.

Analytics Service
GET /api/events/stats

Query parameters: startDate, endDate, eventType

Returns summarized analytics for the requested period.
```
Scripts
npm run report – Runs the reporting script in reporting/report.js.

#dotEnv Structure
```
# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
QUEUE_KEY=events_queue

# Postgres
PG_HOST=127.0.0.1
PG_PORT=5432
PG_DATABASE=analytics
PG_USER=postgres
PG_PASSWORD=

# Ports
INGEST_PORT=3000
REPORT_PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD
DB_NAME=filesure


```
