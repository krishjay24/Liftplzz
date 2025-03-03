import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://rideuser:ridepassword@localhost/rideshare_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
