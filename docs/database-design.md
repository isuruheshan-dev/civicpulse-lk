# CivicPulse LK — Database Design

## Entity Relationship Diagram

```mermaid
erDiagram

    USERS ||--o{ ISSUES : creates
    CATEGORIES ||--o{ ISSUES : contains

    USERS ||--o{ COMMENTS : writes
    ISSUES ||--o{ COMMENTS : has

    ISSUES ||--o{ ISSUE_STATUS_HISTORY : has
    USERS ||--o{ ISSUE_STATUS_HISTORY : changes

    ISSUES ||--o{ ASSIGNMENTS : receives
    USERS ||--o{ ASSIGNMENTS : officer
    USERS ||--o{ ASSIGNMENTS : assigned_by

    USERS {
        int id PK
        varchar full_name
        varchar email
        varchar password_hash
        varchar role
        timestamp created_at
    }

    CATEGORIES {
        int id PK
        varchar name
        text description
    }

    ISSUES {
        int id PK
        int user_id FK
        int category_id FK
        varchar title
        text description
        varchar priority
        varchar status
        decimal latitude
        decimal longitude
        text image_url
        timestamp created_at
        timestamp updated_at
    }

    ISSUE_STATUS_HISTORY {
        int id PK
        int issue_id FK
        varchar status
        int changed_by FK
        text note
        timestamp changed_at
    }

    COMMENTS {
        int id PK
        int issue_id FK
        int user_id FK
        text comment
        timestamp created_at
    }

    ASSIGNMENTS {
        int id PK
        int issue_id FK
        int officer_id FK
        int assigned_by FK
        timestamp assigned_at
    }
```

## Main Relationships

- One user can create many issues.
- One category can contain many issues.
- One issue can have many comments.
- One issue can have many status-history records.
- One issue can have assignment records.
- Users can act as citizens, field officers, or administrators.

## Why Separate Tables?

CivicPulse uses separate tables to avoid duplicated data and keep the database easier to maintain.

For example, citizen information is stored once in `users`. Issues reference that user using `user_id` instead of copying the citizen's name and email into every issue.

This is part of database normalization.