from groq import Groq
from dotenv import load_dotenv

import os
import psycopg2
import random
import time

load_dotenv()



PROMPT = """
    Write a social media post. 
    Add related content tags and use emojis. 
    Make the post sad as possible.
    
    ONLY RETURN THE POST CONTENT.
    DONT RETURN POSTS BETWEEN DOUBLE QUOTES.
"""


def connect_to_db():
    connection = psycopg2.connect(
        database=os.environ.get("POSTGRES_DB"),
        user=os.environ.get("POSTGRES_USER"),
        host="localhost",
        password=os.environ.get("POSTGRES_PASSWORD")
    )
    return connection

def insert_post(conn, content):
    user_id = ['hyfgwx343pcjjcku', '4qwan6woz6gbkx36']
    sql_expr = """
    INSERT INTO posts (id, content, user_id, created_at)
    VALUES (gen_random_uuid(), %s, %s, CURRENT_TIMESTAMP - INTERVAL '%s days %s hours') RETURNING id;
    """
    
    db = conn.cursor()
    
    db.execute(sql_expr, 
               (content, 
                random.choice(user_id), 
                random.randint(1, 2), 
                random.randint(2, 12)
                ))
    conn.commit()
    db.close()



def get_ai_post():
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY")
    )
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": PROMPT,
            }
        ],
        model="llama3-8b-8192",
    )

    return chat_completion.choices[0].message.content
   


if __name__== "__main__":
    while True:
        print("Creating a post")
        conn = connect_to_db()
        print(conn)
        if conn is not None:
            post = get_ai_post()
            print(post)
            insert_post(conn, post)
            conn.close()
            print("Post created") 
        time.sleep(5 * 60)  