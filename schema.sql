-- =====================================
-- Tables used by the portfolio backend; app.py applies this schema at startup.
-- =====================================

-- Published blog content shown by the blog routes.
CREATE TABLE IF NOT EXISTS blog_posts (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,

    image TEXT,

    content TEXT NOT NULL,

    category TEXT DEFAULT 'General',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Certificate records for a future or admin-managed certificate view.
CREATE TABLE IF NOT EXISTS certificates (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    certificate_name TEXT NOT NULL,

    issuer TEXT NOT NULL,

    credential_id TEXT,

    issue_date DATE,

    image TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Messages submitted through the contact form/API.
CREATE TABLE IF NOT EXISTS contacts (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    email TEXT NOT NULL,

    subject TEXT,

    message TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Donation records submitted through the donation endpoint.
CREATE TABLE IF NOT EXISTS donations (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    email TEXT,

    amount REAL NOT NULL,

    message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Optional account records for a future protected admin login.
CREATE TABLE IF NOT EXISTS users (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT NOT NULL UNIQUE,

    email TEXT NOT NULL UNIQUE,

    password TEXT NOT NULL,

    role TEXT DEFAULT 'admin',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);