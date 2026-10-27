# Flask routes serve the portfolio, accept form submissions, and expose JSON APIs.
from flask import Flask, render_template, request, redirect, flash
from flask import jsonify, send_from_directory
import json
import sqlite3
from datetime import datetime
from pathlib import Path

app = Flask(__name__)
app.secret_key = "portfolio_secret_key"

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
DATABASE = BASE_DIR / "database.db"


# ==========================
# DATABASE CONNECTION
# ==========================

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    schema_path = BASE_DIR / "schema.sql"
    conn = sqlite3.connect(DATABASE)
    with open(schema_path, encoding="utf-8") as schema_file:
        conn.executescript(schema_file.read())
    conn.close()


# ==========================
# HOME
# ==========================
# Static-file routes keep the HTML portfolio and its local assets available.

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "indexx.html")


@app.route("/style.css")
def stylesheet():
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/gaya.css")
def portfolio_stylesheet():
    return send_from_directory(BASE_DIR, "gaya.css")


@app.route("/finished-projects.css")
def finished_projects_stylesheet():
    return send_from_directory(BASE_DIR, "finished-projects.css")


@app.route("/ongoing-projects.css")
def ongoing_projects_stylesheet():
    return send_from_directory(BASE_DIR, "ongoing-projects.css")


@app.route("/scriptt.js")
def javascript():
    return send_from_directory(BASE_DIR, "scriptt.js")


@app.route("/finished-projects.html")
def finished_projects():
    return send_from_directory(BASE_DIR, "finished-projects.html")


@app.route("/ongoing-projects.html")
def ongoing_projects():
    return send_from_directory(BASE_DIR, "ongoing-projects.html")


@app.route("/image porto/<path:filename>")
def portfolio_image(filename):
    return send_from_directory(BASE_DIR / "image porto", filename)


@app.route("/backsound/<path:filename>")
def portfolio_backsound(filename):
    return send_from_directory(BASE_DIR / "backsound", filename)


@app.route("/project-source/volumekubus.java")
def cube_volume_source():
    return send_from_directory(PROJECT_DIR / "KKPG", "volumekubus.java", mimetype="text/plain")


@app.route("/api/profile")
def profile():
    with open(BASE_DIR / "data.json", encoding="utf-8") as profile_file:
        return jsonify(json.load(profile_file))


# JSON endpoints validate incoming data and write records to SQLite.
@app.route("/api/contact", methods=["POST"])
def api_contact():
    payload = request.get_json(silent=True) or request.form
    if not all(str(payload.get(field, "")).strip() for field in ("name", "email", "message")):
        return jsonify(error="Name, email, and message are required."), 400

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO contacts (name,email,subject,message,created_at) VALUES (?,?,?,?,?)",
        (payload["name"], payload["email"], payload.get("subject", ""), payload["message"], datetime.now()),
    )
    conn.commit()
    conn.close()
    return jsonify(message="Message sent successfully!"), 201


@app.route("/api/donations", methods=["POST"])
def api_donation():
    payload = request.get_json(silent=True) or request.form
    if not str(payload.get("name", "")).strip() or not str(payload.get("amount", "")).strip():
        return jsonify(error="Name and amount are required."), 400

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO donations (name,email,amount,message,created_at) VALUES (?,?,?,?,?)",
        (payload["name"], payload.get("email", ""), payload["amount"], payload.get("message", ""), datetime.now()),
    )
    conn.commit()
    conn.close()
    return jsonify(message="Thank you for your donation!"), 201


# ==========================
# CONTACT FORM
# ==========================

@app.route("/contact", methods=["POST"])
def contact():

    name = request.form.get("name")
    email = request.form.get("email")
    subject = request.form.get("subject")
    message = request.form.get("message")

    if not name or not email or not message:

        flash("Please complete all required fields.")
        return redirect("/")

    conn = get_db_connection()

    conn.execute("""
        INSERT INTO contacts
        (name,email,subject,message,created_at)
        VALUES (?,?,?,?,?)
    """, (
        name,
        email,
        subject,
        message,
        datetime.now()
    ))

    conn.commit()
    conn.close()

    flash("Message sent successfully!")

    return redirect("/")


# ==========================
# DONATION FORM
# ==========================

@app.route("/donate", methods=["POST"])
def donate():

    name = request.form.get("name")
    email = request.form.get("email")
    amount = request.form.get("amount")
    message = request.form.get("message")

    if not name or not amount:

        flash("Please fill donation information.")
        return redirect("/")

    conn = get_db_connection()

    conn.execute("""
        INSERT INTO donations
        (name,email,amount,message,created_at)
        VALUES (?,?,?,?,?)
    """, (
        name,
        email,
        amount,
        message,
        datetime.now()
    ))

    conn.commit()
    conn.close()

    flash("Thank you for your donation!")

    return redirect("/")


# ==========================
# BLOG PAGE
# ==========================

@app.route("/blog")
def blog():

    conn = get_db_connection()

    blogs = conn.execute("""
        SELECT *
        FROM blog_posts
        ORDER BY created_at DESC
    """).fetchall()

    conn.close()

    return render_template(
        "blog.html",
        blogs=blogs
    )


# ==========================
# SINGLE BLOG
# ==========================

@app.route("/blog/<int:id>")
def blog_detail(id):

    conn = get_db_connection()

    blog = conn.execute(
        "SELECT * FROM blog_posts WHERE id=?",
        (id,)
    ).fetchone()

    conn.close()

    if blog is None:
        return "Article not found"

    return render_template(
        "blog_detail.html",
        blog=blog
    )


# ==========================
# ADMIN DASHBOARD
# ==========================

@app.route("/admin")
def admin():

    conn = get_db_connection()

    contacts = conn.execute(
        "SELECT * FROM contacts ORDER BY id DESC"
    ).fetchall()

    donations = conn.execute(
        "SELECT * FROM donations ORDER BY id DESC"
    ).fetchall()

    blogs = conn.execute(
        "SELECT * FROM blog_posts ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return render_template(
        "admin.html",
        contacts=contacts,
        donations=donations,
        blogs=blogs
    )


# ==========================
# CREATE BLOG
# ==========================

@app.route("/add-blog", methods=["POST"])
def add_blog():

    title = request.form.get("title")
    image = request.form.get("image")
    content = request.form.get("content")

    conn = get_db_connection()

    conn.execute("""
        INSERT INTO blog_posts
        (title,image,content,created_at)
        VALUES (?,?,?,?)
    """, (
        title,
        image,
        content,
        datetime.now()
    ))

    conn.commit()
    conn.close()

    flash("Blog added successfully.")

    return redirect("/admin")


# ==========================
# DELETE BLOG
# ==========================

@app.route("/delete-blog/<int:id>")
def delete_blog(id):

    conn = get_db_connection()

    conn.execute(
        "DELETE FROM blog_posts WHERE id=?",
        (id,)
    )

    conn.commit()
    conn.close()

    flash("Blog deleted.")

    return redirect("/admin")


# ==========================
# RUN APP
# ==========================

if __name__ == "__main__":
    initialize_database()
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )