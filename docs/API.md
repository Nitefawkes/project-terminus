# Project Terminus API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

### POST /auth/login
Login with credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

## Map Data

### GET /maps/satellite/:id
Get real-time satellite position.

**Parameters:**
- `id`: Satellite ID (e.g., "25544" for ISS)

**Response:**
```json
{
  "id": "25544",
  "name": "ISS (ZARYA)",
  "latitude": 45.1234,
  "longitude": -93.5678,
  "altitude": 408.2,
  "velocity": 7.66,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### GET /maps/satellites
Get all tracked satellites.

**Response:**
```json
{
  "satellites": [
    {
      "id": "25544",
      "name": "ISS (ZARYA)",
      "latitude": 45.1234,
      "longitude": -93.5678,
      "altitude": 408.2,
      "velocity": 7.66,
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## OSINT Data

### GET /osint/events
Get OSINT events for heat map.

**Query Parameters:**
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `bounds`: Comma-separated bbox coordinates (optional)
- `types`: Event types filter (optional)

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-93.5678, 45.1234]
      },
      "properties": {
        "id": "event_id",
        "type": "conflict",
        "severity": "medium",
        "timestamp": "2024-01-01T12:00:00Z",
        "description": "Event description",
        "source": "ACLED"
      }
    }
  ]
}
```

### GET /osint/heatmap
Get aggregated heat map data.

**Query Parameters:**
- `zoom`: Map zoom level (affects aggregation)
- `bounds`: Comma-separated bbox coordinates
- `hours`: Hours back from current time (default: 24)

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-93.5678, 45.1234]
      },
      "properties": {
        "weight": 0.8,
        "count": 5,
        "severity": "high"
      }
    }
  ]
}
```

## User Data

### GET /users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "preferences": {
    "mapStyle": "satellite",
    "layers": ["terminator", "iss", "osint"],
    "defaultZoom": 2
  },
  "pins": [
    {
      "id": "pin_id",
      "name": "Custom Location",
      "latitude": 45.1234,
      "longitude": -93.5678,
      "created": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### PUT /users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "preferences": {
    "mapStyle": "dark",
    "layers": ["terminator", "osint"]
  }
}
```

### POST /users/pins
Create a new location pin.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Custom Location",
  "latitude": 45.1234,
  "longitude": -93.5678
}
```

### DELETE /users/pins/:id
Delete a location pin.

**Headers:**
```
Authorization: Bearer <access_token>
```

## Weather Data

### GET /weather/current
Get current weather data.

**Query Parameters:**
- `lat`: Latitude
- `lon`: Longitude

**Response:**
```json
{
  "location": {
    "latitude": 45.1234,
    "longitude": -93.5678
  },
  "current": {
    "temperature": 22.5,
    "humidity": 65,
    "pressure": 1013.25,
    "windSpeed": 3.6,
    "windDirection": 230,
    "description": "Clear sky",
    "icon": "01d"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('ws://localhost:3001');
```

### Events

#### satellite_update
Real-time satellite position updates.
```json
{
  "type": "satellite_update",
  "data": {
    "id": "25544",
    "latitude": 45.1234,
    "longitude": -93.5678,
    "altitude": 408.2,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### osint_event
New OSINT events.
```json
{
  "type": "osint_event",
  "data": {
    "id": "event_id",
    "type": "conflict",
    "latitude": 45.1234,
    "longitude": -93.5678,
    "severity": "medium",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### terminator_update
Day/night terminator line updates.
```json
{
  "type": "terminator_update",
  "data": {
    "coordinates": [
      [-180, 45.1234],
      [-179, 44.9876],
      // ... more coordinates
    ],
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Rate Limiting

- **General API**: 100 requests per minute per IP
- **Authentication**: 5 login attempts per minute per IP
- **OSINT Data**: 20 requests per minute per user
- **WebSocket**: 1000 messages per minute per connection
