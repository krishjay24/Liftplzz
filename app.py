import sqlite3
import requests
import isodate
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from config import Config
from models import *

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rideshare.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'  # Required for sessions

# Initialize extensions
CORS(app)  # Allow Cross-Origin requests
#db = SQLAlchemy(app)
db.init_app(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = "login"  # Redirect users to login page if not authenticated

# Initialize SocketIO
socketio = SocketIO(app)

# Constants
API_KEY = "YOUR_YOUTUBE_API_KEY"
GMAP_API = "AIzaSyC29T2vPK3EjZyymCOpxg05aMJYdVJuboc"
VIDEO_DURATION = 180  # 3 minutes in seconds
POINTS_PER_VIDEO = 10  # Points awarded per video

# Initialize database tables
with app.app_context():
    db.create_all()

# Initialize SQLite database for routes
def init_db():
    conn = sqlite3.connect('routes.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS pickers_route (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            pickers_id INTEGER NOT NULL
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS riders_route (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            riders_id INTEGER NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Flask-Login user loader
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))  # Fetch user by ID

# Routes

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if not all(k in data for k in ('username', 'email', 'phone', 'password')):
        return jsonify({"error": "Missing required fields"}), 400

    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400
    if User.query.filter_by(name=data['username']).first():
        return jsonify({"error": "Username already taken"}), 400

    # Create new user
    new_user = User(
        name=data['username'],
        email=data['email'],
        phone=data['phone']
    )
    new_user.set_password(data['password'])

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

@app.route('/driver_signup', methods=['POST'])
def driver_signup():
    data = request.json

    # Validate required fields
    required_fields = {'name', 'email', 'phone', 'password', 'vehicle_model', 'license_plate', 'capacity'}
    if not required_fields.issubset(data):
        return jsonify({"error": "Missing required fields"}), 400

    # Check if driver already exists
    if Driver.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400
    if Driver.query.filter_by(phone=data['phone']).first():
        return jsonify({"error": "Phone number already registered"}), 400

    # Create Vehicle first
    new_vehicle = Vehicle(
        model=data['vehicle_model'],
        license_plate=data['license_plate'],
        capacity=data['capacity']
    )
    db.session.add(new_vehicle)
    db.session.commit()  # Commit to generate vehicle ID

    # Create Driver
    new_driver = Driver(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        vehicle_id=new_vehicle.id  # Assign the generated vehicle ID
    )
    new_driver.set_password(data['password'])

    db.session.add(new_driver)
    db.session.commit()

    return jsonify({"message": "Driver registered successfully!"}),201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(name=data['username']).first()
    
    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/driver_login', methods=['POST'])
def driver_login():
    data = request.json

    # Validate required fields
    if not all(k in data for k in ('email', 'password')):
        return jsonify({"error": "Missing email or password"}), 400

    # Check if driver exists
    driver = Driver.query.filter_by(email=data['email']).first()
    if not driver:
        return jsonify({"error": "Invalid email or password"}), 401

    # Check password
    if not driver.check_password(data['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    login_user(driver)

    return jsonify({
        "message": "Login successful",
        "driver_id": driver.id,
        "name": driver.name,
        "email": driver.email,
        "phone": driver.phone,
        "vehicle_id": driver.vehicle_id,
        "income_generated": driver.income_generated,
        "created_at": driver.created_at
    }),200

@app.route('/logout', methods=['POST'])  # Use POST for security
@login_required
def logout():
    logout_user()
    session.clear()  # Ensure session data is cleared
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/driver_logout', methods=['POST'])  # Use POST for security
@login_required
def driver_logout():  # Changed function name to 'driver_logout'
    logout_user()
    session.clear()  # Ensure session data is cleared
    return jsonify({'message': 'Driver logged out successfully'}), 200

@app.route('/protected')
@login_required
def protected():
    return jsonify({'message': f'Hello, {current_user.username}'}), 200

@app.route('/watch-video', methods=['POST'])
@login_required
def watch_video():
    data = request.json
    watched_duration = data.get('watched_duration')  # in seconds

    if not watched_duration:
        return jsonify({"error": "Missing watched_duration"}), 400

    # Check if the user watched at least 3 minutes
    if watched_duration < VIDEO_DURATION:
        return jsonify({"error": "Video not watched completely"}), 400

    # Cooldown period to prevent abuse
    now = datetime.now()
    if current_user.last_video_watch_time:
        time_diff = now - current_user.last_video_watch_time
        if time_diff < timedelta(minutes=3):
            return jsonify({"error": "Please wait before watching another video"}), 403

    # Increment points
    current_user.points += POINTS_PER_VIDEO
    current_user.last_video_watch_time = now
    db.session.commit()

    return jsonify({"message": "Points added successfully", "points": current_user.points})

# @app.route("/get_location", methods=["POST"])
# def get_location():
#     data = request.json
#     if not data or "lat" not in data or "lng" not in data:
#         return jsonify({"error": "Missing latitude or longitude"}), 400

#     lat, lng = data["lat"], data["lng"]
#     url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={GMAP_API}"

#     response = requests.get(url).json()
#     if response.get("status") == "OK":
#         location_name = response["results"][0]["formatted_address"]
#         return jsonify({"location": location_name})
#     else:
#         return jsonify({"error": "Could not retrieve location"}), 500

@app.route('/test_db')
def test_db():
    try:
        db.session.execute('SELECT 1')  # Simple query to check connection
        return "Database connected successfully!"
    except Exception as e:
        return f"Error: {e}"

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    new_user = User(
        username=data['username'],
        email=data['email'],
        phone=data['phone']
    )
    new_user.set_password(data['password'])

    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User added successfully!"}), 201

@app.route('/rider', methods=['GET'])
def get_rider_location():
    try:
        conn = sqlite3.connect('routes.db')
        c = conn.cursor()
        c.execute('SELECT lat, lng FROM riders_route ORDER BY ROWID ASC LIMIT 1')
        first_row = c.fetchone()

        c.execute('SELECT lat, lng FROM riders_route ORDER BY ROWID DESC LIMIT 1')
        last_row = c.fetchone()
        conn.close()

        if first_row and last_row:
            data = [{"lat": first_row[0], "lng": first_row[1]}, {"lat": last_row[0], "lng": last_row[1]}]
            return jsonify({"current_route": data}), 200
        else:
            return jsonify({"current_route": []}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred while processing the request."}),500

@app.route('/rider', methods=['POST'])
def update_rider_location():
    try:
        data = request.get_json()
        route_details = data.get('routeDetails')
        
        if not route_details or 'coordinates' not in route_details or not isinstance(route_details['coordinates'], list):
            return jsonify({"error": "Invalid routeDetails format"}), 400

        coordinates = route_details['coordinates']
        for coord in coordinates:
            if not isinstance(coord, dict) or 'lat' not in coord or 'lng' not in coord:
                return jsonify({"error": "Invalid coordinate format"}), 400

        rider_id = current_user.id  # Get the authenticated user's ID

        conn = sqlite3.connect('routes.db')
        c = conn.cursor()
        
        # Clear existing data for this specific rider
        c.execute('DELETE FROM riders_route WHERE riders_id = ?', (rider_id,))
        
        # Insert new coordinates associated with the rider's ID
        c.executemany(
            'INSERT INTO riders_route (lat, lng, riders_id) VALUES (?, ?, ?)',
            [(coord['lat'], coord['lng'], rider_id) for coord in coordinates]
        )
        
        conn.commit()
        conn.close()

        return jsonify({"message": "Rider location updated successfully"}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred while processing the request."}),500
    
@app.route('/picker', methods=['GET'])
def get_picker_location():
    try:
        conn = sqlite3.connect('routes.db')
        c = conn.cursor()
        c.execute('SELECT lat, lng FROM pickers_route ORDER BY ROWID ASC LIMIT 1')
        first_row = c.fetchone()

        c.execute('SELECT lat, lng FROM pickers_route ORDER BY ROWID DESC LIMIT 1')
        last_row = c.fetchone()
        conn.close()

        if first_row and last_row:
            data = [{"lat": first_row[0], "lng": first_row[1]}, {"lat": last_row[0], "lng": last_row[1]}]
            return jsonify({"current_route": data}), 200
        else:
            return jsonify({"current_route": []}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred while processing the request."}),500

@app.route('/all_picker', methods=['GET'])
def get_all_pickers_routes():
    try:
        conn = sqlite3.connect('routes.db')
        c = conn.cursor()

        # Get all unique pickers_id
        c.execute('SELECT DISTINCT pickers_id FROM pickers_route')
        pickers = c.fetchall()

        pickers_data = []

        for picker in pickers:
            picker_id = picker[0]

            # Get first recorded location for this picker
            c.execute('SELECT lat, lng FROM pickers_route WHERE pickers_id = ? ORDER BY ROWID ASC LIMIT 1', (picker_id,))
            first_row = c.fetchone()

            # Get last recorded location for this picker
            c.execute('SELECT lat, lng FROM pickers_route WHERE pickers_id = ? ORDER BY ROWID DESC LIMIT 1', (picker_id,))
            last_row = c.fetchone()

            if first_row and last_row:
                pickers_data.append({
                    "pickers_id": picker_id,
                    "route": [
                        {"lat": first_row[0], "lng": first_row[1]}, 
                        {"lat": last_row[0], "lng": last_row[1]}
                    ]
                })

        conn.close()

        return jsonify({"pickers_routes": pickers_data}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred while processing the request."}),500

@app.route('/picker', methods=['POST'])
def update_picker_location():
    try:
        # Extract the JSON data from the request
        data = request.get_json()
        
        # Retrieve routeDetails and validate its structure
        route_details = data.get('routeDetails')
        if not route_details or 'coordinates' not in route_details or not isinstance(route_details['coordinates'], list):
            return jsonify({"error": "Invalid routeDetails format"}), 400

        # Validate each coordinate
        coordinates = route_details['coordinates']
        for coord in coordinates:
            if not isinstance(coord, dict) or 'lat' not in coord or 'lng' not in coord:
                return jsonify({"error": "Invalid coordinate format"}), 400

        picker_id = current_user.id  # Get the authenticated user's ID

        conn = sqlite3.connect('routes.db')
        c = conn.cursor()

        # Clear existing data for this specific picker
        c.execute('DELETE FROM pickers_route WHERE pickers_id = ?', (picker_id,))
        
        # Insert new coordinates associated with the picker's ID
        c.executemany(
            'INSERT INTO pickers_route (lat, lng, pickers_id) VALUES (?, ?, ?)',
            [(coord['lat'], coord['lng'], picker_id) for coord in coordinates]
        )
        
        conn.commit()
        conn.close()

        return jsonify({"message": "Picker location updated successfully"}), 200
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred while processing the request."}),500
    
@app.route("/get_location", methods=["POST"])
def get_location():
    data = request.json
    if not data or "lat" not in data or "lng" not in data:
        return jsonify({"error": "Missing latitude or longitude"}), 400
    
    lat, lng = data["lat"], data["lng"]
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={GMAP_API}"
    
    response = requests.get(url).json()
    if response.get("status") == "OK":
        location_name = response["results"][0]["formatted_address"]
        return jsonify({"location": location_name})
    else:
        return jsonify({"error": "Could not retrieve location"}),500
    
@app.route('/ride/request', methods=['POST'])
def request_ride():
    try:
        data = request.get_json()

        # Extract required fields
        driver_id = data.get('driver_id')
        pickup_location = data.get('pickup_location')
        dropoff_location = data.get('dropoff_location')
        fare = data.get('fare')

        # Validate required fields
        if not all([driver_id, pickup_location, dropoff_location, fare]):
            return jsonify({"error": "Missing required fields"}), 400

        # Create a new ride request
        new_ride = Ride(
            user_id=current_user.id,
            driver_id=driver_id,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            fare=fare,
            request_to_ride=True,  # User is requesting a ride
            status='pending',
            created_at=datetime.utcnow()
        )

        db.session.add(new_ride)
        db.session.commit()

        return jsonify({"message": "Ride request sent successfully!", "ride_id": new_ride.id}), 201

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred while processing the ride request."}),500

@app.route('/ride/accept/<int:ride_id>', methods=['POST'])
def accept_ride(ride_id):
    try:
        # Find the ride request
        ride = Ride.query.get(ride_id)

        if not ride:
            return jsonify({"error": "Ride not found"}), 404

        if ride.status != 'pending':
            return jsonify({"error": "Ride is no longer available"}), 400

        # Only the assigned driver can accept
        if ride.driver_id != current_user.id:
            return jsonify({"error": "Unauthorized action"}), 403

        # Update ride status to accepted
        ride.status = 'accepted'
        ride.request_to_ride=False
        db.session.commit()

        return jsonify({"message": "Ride accepted successfully!"}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "An error occurred while accepting the ride."}),500

@app.route('/driver/rides', methods=['GET'])
def get_driver_rides():
    driver_id = request.args.get('driver_id')  # Assuming driver_id is passed as a query param
    
    if not driver_id:
        return jsonify({"error": "Driver ID is required"}), 400
    
    rides = Ride.query.filter_by(driver_id=driver_id, request_to_ride=True).all()
    
    ride_list = [
        {
            "id": ride.id,
            "user_id": ride.user_id,
            "pickup_location": ride.pickup_location,
            "dropoff_location": ride.dropoff_location,
            "fare": ride.fare,
            "status": ride.status,
            "created_at": ride.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for ride in rides
    ]
    
    return jsonify({"ride_requests":ride_list})

@app.route('/ride_status/<int:ride_id>', methods=['GET'])
def check_ride_status(ride_id):
    ride = Ride.query.get(ride_id)
    
    if not ride:
        return jsonify({'error': 'Ride not found'}), 404

    response = {
        'ride_id': ride.id,
        'user_id': ride.user_id,
        'driver_id': ride.driver_id,
        'pickup_location': ride.pickup_location,
        'dropoff_location': ride.dropoff_location,
        'fare': ride.fare,
        'request_to_ride': ride.request_to_ride,
        'status': ride.status,  # pending, accepted, completed, canceled
        'created_at': ride.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify(response),200

# Run the application
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000,debug=True)
