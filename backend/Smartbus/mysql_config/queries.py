from django.test import TestCase

# Create your tests here.
# queries.py - MySQL related queries
def get_login_query():
    return """
    SELECT * FROM users WHERE email = %s AND password = %s
    """

def create_user_query():
    return """
    INSERT INTO users (email, password, user_type, name) 
    VALUES (%s, %s, %s, %s)
    """