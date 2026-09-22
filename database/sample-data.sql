-- Categories

INSERT INTO categories (name, description)
VALUES
('Road Damage', 'Potholes and damaged roads'),
('Street Lighting', 'Broken or non-working street lights'),
('Garbage', 'Waste collection and dumping issues'),
('Drainage', 'Blocked drains and flooding'),
('Water Supply', 'Water leaks and supply problems');


-- Users
-- These password hashes are placeholders only.
-- Real password hashing will be implemented during authentication.

INSERT INTO users (full_name, email, password_hash, role)
VALUES
('Isuru Heshan', 'isuru@example.com', 'sample_hash_1', 'citizen'),
('Nimal Perera', 'nimal@example.com', 'sample_hash_2', 'field_officer'),
('Admin User', 'admin@example.com', 'sample_hash_3', 'admin');


-- Sample issue

INSERT INTO issues (
    user_id,
    category_id,
    title,
    description,
    priority,
    status,
    latitude,
    longitude
)
VALUES (
    1,
    2,
    'Broken streetlight',
    'Streetlight near Kurunegala town has not worked for three days.',
    'high',
    'assigned',
    7.4863,
    80.3623
);


-- Status history

INSERT INTO issue_status_history (
    issue_id,
    status,
    changed_by,
    note
)
VALUES
(1, 'submitted', 1, 'Issue reported by citizen'),
(1, 'assigned', 3, 'Issue assigned to field officer');


-- Assignment

INSERT INTO assignments (
    issue_id,
    officer_id,
    assigned_by
)
VALUES (
    1,
    2,
    3
);


-- Comment

INSERT INTO comments (
    issue_id,
    user_id,
    comment
)
VALUES (
    1,
    2,
    'I will inspect the reported location today.'
);