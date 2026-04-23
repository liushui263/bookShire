import time
import psycopg2

while True:
    try:
        conn = psycopg2.connect(
            host="db",
            user="book",
            password="book",
            dbname="bookdb"
        )
        conn.close()
        print("DB is ready")
        break
    except Exception as e:
        print("Waiting for DB...", e)
        time.sleep(1)