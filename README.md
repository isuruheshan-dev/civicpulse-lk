# CivicPulse LK

CivicPulse LK is a smart local-issue reporting and resolution platform designed to help citizens report community problems and allow responsible authorities to manage, assign, track, and resolve those issues efficiently.

## Problem

Citizens may encounter local issues such as damaged roads, broken streetlights, waste collection problems, drainage issues, and other public infrastructure problems.

Traditional reporting methods can be inconvenient, and citizens may have limited visibility into whether their complaints have been received, assigned, or resolved.

Authorities may also face difficulties organizing reports, prioritizing problems, assigning field officers, and tracking the progress of reported issues.

## Solution

CivicPulse LK provides a centralized digital platform where citizens can submit local issues with descriptions, categories, locations, priority levels, and images.

Administrators can review submitted issues, assign them to field officers, and monitor their progress.

Field officers can view their assigned issues and update their status as work progresses.

Citizens can track their reports from submission until resolution.

## User Roles

### Citizen
- Register and login
- Report local issues
- Upload issue images
- Add location information
- View submitted reports
- Track issue status

### Admin
- View all reported issues
- Manage issue categories
- Assign issues to field officers
- Monitor issue progress
- View high-priority issues

### Field Officer
- View assigned issues
- Update issue status
- Add progress updates

## Initial Features

- User registration and login
- Role-based access
- Issue reporting
- Issue categories
- Image uploads
- Location information
- Map markers
- Priority levels
- Issue status tracking
- Status history
- Admin dashboard
- Field officer dashboard
- Issue assignment
- Comments and updates

## Issue Workflow

Submitted → Assigned → In Progress → Resolved

## Technology Stack

- Frontend: React
- Backend: Node.js + Express.js
- Database: PostgreSQL
- API: REST API
- Authentication: JWT
- Other: Image uploads and map/location integration

## Architecture

React Frontend
↓ HTTP / REST API
Node.js + Express Backend
↓ SQL Queries
PostgreSQL Database

## REST API

The CivicPulse LK backend is built with Node.js and Express and connects to PostgreSQL.

### Issue Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/issues` | Get all issues |
| GET | `/api/issues/:id` | Get a specific issue |
| POST | `/api/issues` | Create a new issue |
| PUT | `/api/issues/:id` | Update an issue |
| DELETE | `/api/issues/:id` | Delete an issue |

### Backend Structure

- Routes handle incoming API endpoints.
- Controllers contain request-handling logic.
- PostgreSQL stores application data.
- Parameterized SQL queries are used when working with dynamic values.

## Project Status

Currently under development.