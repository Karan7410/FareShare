# FARE$HARE [WIP / Ongoing Project]

## Overview
FARE$hare is a full-stack, real-time ride-sharing web prototype. Unlike traditional ride-booking apps, it features a dynamic workflow where a primary host books a full ride first and can seamlessly accept co-riders in real-time mid-trip. 

## Tech Stack
* **Frontend:** React
* **Mapping & Geospatial:** Leaflet (Open-source interactive mapping), PostGIS
* **Backend:** Node.js, Express
* **Real-Time Communication:** Socket.IO
* **Database & ORM:** PostgreSQL (managed via pgAdmin 4), Prisma

## Current Features
* **Dynamic Mid-Trip Co-riding:** Primary riders can review and accept additional passengers during an active trip.
* **Real-Time Notifications:** Live event broadcasting for ride requests and host acceptances powered by Socket.IO.
* **Interactive Routing:** Custom map rendering and location tracking utilizing Leaflet.
* **Spatial Data Management:** Database architecture optimized for geospatial queries using PostgreSQL and PostGIS.

## Roadmap (Upcoming Features)
* [ ] **Security:** Implementation of JWT authentication for secure user sessions.
* [ ] **Ride History:** Dashboard for users to track previous trips and co-riders.
* [ ] **Cost Splitting:** Algorithm to dynamically calculate fare distribution when a co-rider is accepted mid-trip.

## 🛠️ Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/fareshare.git](https://github.com/yourusername/fareshare.git)
