import sqlite3

def normalize():
    conn = sqlite3.connect("ayursetu_dev.db")
    c = conn.cursor()
    c.execute("UPDATE forum_categories SET id = REPLACE(id, '-', '') WHERE id LIKE '%-%'")
    count = c.rowcount
    conn.commit()
    conn.close()
    print(f"Normalized {count} category UUIDs in SQLite.")

if __name__ == "__main__":
    normalize()
