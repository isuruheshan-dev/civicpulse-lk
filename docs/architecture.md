# CivicPulse LK Architecture

```mermaid
flowchart TD

    Citizen[Citizen]
    Admin[Admin]
    Officer[Field Officer]

    Frontend[React Frontend]
    API[Node.js + Express REST API]
    Auth[JWT Authentication & Authorization]
    Database[(PostgreSQL Database)]
    Storage[Image Storage]
    Maps[Maps / Location Service]

    Citizen --> Frontend
    Admin --> Frontend
    Officer --> Frontend

    Frontend -->|HTTP Requests| API

    API --> Auth
    API --> Database
    API --> Storage

    Frontend --> Maps