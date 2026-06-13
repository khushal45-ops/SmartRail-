import random
random.seed(42)

stations = [
    ('New Delhi', 28.6139, 77.2090),
    ('Mumbai', 19.0760, 72.8777),
    ('Chennai', 13.0827, 80.2707),
    ('Kolkata', 22.5726, 88.3639),
    ('Bangalore', 12.9716, 77.5946),
    ('Hyderabad', 17.3850, 78.4867),
    ('Ahmedabad', 23.0225, 72.5714),
    ('Jaipur', 26.9124, 75.7873),
    ('Lucknow', 26.8467, 80.9462),
    ('Patna', 25.5941, 85.1376),
    ('Bhopal', 23.2599, 77.4126),
    ('Pune', 18.5204, 73.8567)
]

trains = []
for i in range(31):
    status = 'ontime'
    if i < 8: status = 'delayed'
    elif i < 11: status = 'critical'
    
    st1 = random.choice(stations)
    st2 = random.choice(stations)
    while st1 == st2:
        st2 = random.choice(stations)
        
    lat = st1[1] + random.uniform(-1.0, 1.0)
    lng = st1[2] + random.uniform(-1.0, 1.0)
    
    # ensure total delayed is 8 and critical is 3, total ontime is 20
    
    trains.append(f'''  {{ id: "{10000+i}", name: "{st1[0]}-{st2[0]} Exp", lat: {lat:.4f}, lng: {lng:.4f}, from: "{st1[0][:3].upper()}", to: "{st2[0][:3].upper()}", currentStation: "{st1[0]}", nextStation: "{st2[0]}", speed: {random.randint(60, 120)}, eta: "12:00", delay: {0 if status == 'ontime' else random.randint(15, 60)}, occupancy: {random.randint(60, 95)}, platform: 1, status: "{status}", zone: "nr", aiPrediction: "System Note" }},''')

print("\n".join(trains))
