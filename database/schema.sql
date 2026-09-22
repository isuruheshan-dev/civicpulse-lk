CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('citizen', 'admin', 'field_officer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE issues (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    priority VARCHAR(20) DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),

    status VARCHAR(30) DEFAULT 'submitted'
        CHECK (
            status IN (
                'submitted',
                'assigned',
                'in_progress',
                'resolved'
            )
        ),

    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),

    image_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id),

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
);

CREATE TABLE issue_status_history (
    id SERIAL PRIMARY KEY,

    issue_id INTEGER NOT NULL,

    status VARCHAR(30) NOT NULL
        CHECK (
            status IN (
                'submitted',
                'assigned',
                'in_progress',
                'resolved'
            )
        ),

    changed_by INTEGER,
    note TEXT,

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (issue_id)
        REFERENCES issues(id),

    FOREIGN KEY (changed_by)
        REFERENCES users(id)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,

    issue_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    comment TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (issue_id)
        REFERENCES issues(id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,

    issue_id INTEGER NOT NULL,
    officer_id INTEGER NOT NULL,
    assigned_by INTEGER NOT NULL,

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (issue_id)
        REFERENCES issues(id),

    FOREIGN KEY (officer_id)
        REFERENCES users(id),

    FOREIGN KEY (assigned_by)
        REFERENCES users(id)
);