# Project Terminus API Client

A comprehensive TypeScript API client for the Project Terminus backend, built with Axios and featuring automatic token refresh, error handling, and type safety.

## Features

- ✅ **Type-safe**: Full TypeScript support with comprehensive type definitions
- ✅ **Auto token refresh**: Automatic JWT token refresh on expiration
- ✅ **Error handling**: Centralized error handling with custom exceptions
- ✅ **Token storage**: Secure localStorage-based token management
- ✅ **Interceptors**: Request/response interceptors for authentication
- ✅ **SSR-compatible**: Works with Next.js server-side rendering

## Installation

The API client requires `axios`, which is already installed:

```bash
npm install axios
```

## Configuration

Set the API URL in your environment variables:

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Usage

### Basic Usage

```typescript
import { api } from '@/lib/api';

// Register a new user
const response = await api.auth.register({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
});

// Login
const loginResponse = await api.auth.login({
  email: 'user@example.com',
  password: 'password123',
});

// Logout
api.auth.logout();
```

### Authentication

```typescript
import { AuthAPI } from '@/lib/api';

// Register
const authResponse = await AuthAPI.register({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'John Doe',
});
// Tokens are automatically stored

// Login
const loginResponse = await AuthAPI.login({
  email: 'user@example.com',
  password: 'securePassword123',
});

// Check authentication status
const isAuth = AuthAPI.isAuthenticated();

// Get current user
const currentUser = AuthAPI.getCurrentUser();

// Logout
AuthAPI.logout();
```

### User Profile Management

```typescript
import { UsersAPI } from '@/lib/api';

// Get user profile
const profile = await UsersAPI.getProfile();

// Update profile
const updatedProfile = await UsersAPI.updateProfile({
  name: 'Jane Doe',
  email: 'jane@example.com',
});

// Get user preferences
const preferences = await UsersAPI.getPreferences();

// Update preferences
const updatedPreferences = await UsersAPI.updatePreferences({
  mapStyle: 'dark',
  defaultZoom: 3,
  defaultCenter: { lat: 0, lng: 0 },
  enabledLayers: ['terminator', 'iss', 'space-weather'],
});
```

### Pin Management

```typescript
import { UsersAPI } from '@/lib/api';

// Get all pins
const pins = await UsersAPI.getPins();

// Create a new pin
const newPin = await UsersAPI.createPin({
  name: 'My Location',
  description: 'Important place',
  latitude: 40.7128,
  longitude: -74.0060,
});

// Update a pin
const updatedPin = await UsersAPI.updatePin(pinId, {
  name: 'Updated Name',
  description: 'New description',
});

// Delete a pin
await UsersAPI.deletePin(pinId);
```

### Error Handling

```typescript
import { api, APIException } from '@/lib/api';

try {
  await api.auth.login({
    email: 'invalid@example.com',
    password: 'wrong',
  });
} catch (error) {
  if (error instanceof APIException) {
    console.error('Status:', error.statusCode);
    console.error('Errors:', error.errors);

    // Handle specific error codes
    if (error.statusCode === 401) {
      console.log('Invalid credentials');
    } else if (error.statusCode === 404) {
      console.log('User not found');
    }
  }
}
```

### Using in React Components

```typescript
'use client';

import { useState } from 'react';
import { api, APIException } from '@/lib/api';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.login({ email, password });
      console.log('Logged in:', response.user);

      // Redirect or update UI
      window.location.href = '/dashboard';
    } catch (err) {
      if (err instanceof APIException) {
        setError(err.errors.join(', '));
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
    </div>
  );
}
```

### Advanced: Direct API Client Usage

```typescript
import { apiClient } from '@/lib/api';

// Make custom API requests
const customData = await apiClient.get('/custom/endpoint');
const result = await apiClient.post('/custom/action', { data: 'value' });

// Get the underlying axios instance for advanced usage
const axiosInstance = apiClient.getInstance();
```

## API Reference

### AuthAPI

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `register()` | `RegisterRequest` | `Promise<AuthResponse>` | Register a new user |
| `login()` | `LoginRequest` | `Promise<AuthResponse>` | Login existing user |
| `refreshToken()` | - | `Promise<RefreshTokenResponse>` | Refresh access token |
| `logout()` | - | `void` | Logout and clear tokens |
| `isAuthenticated()` | - | `boolean` | Check if user is authenticated |
| `getCurrentUser()` | - | `User | null` | Get current user from storage |

### UsersAPI

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `getProfile()` | - | `Promise<UserProfile>` | Get user profile |
| `updateProfile()` | `UpdateProfileRequest` | `Promise<UserProfile>` | Update user profile |
| `getPreferences()` | - | `Promise<UserPreferences>` | Get user preferences |
| `updatePreferences()` | `UpdatePreferencesRequest` | `Promise<UserPreferences>` | Update preferences |
| `getPins()` | - | `Promise<Pin[]>` | Get all pins |
| `getPin()` | `id: string` | `Promise<Pin>` | Get specific pin |
| `createPin()` | `CreatePinRequest` | `Promise<Pin>` | Create new pin |
| `updatePin()` | `id: string, UpdatePinRequest` | `Promise<Pin>` | Update pin |
| `deletePin()` | `id: string` | `Promise<void>` | Delete pin |

### TokenStorage

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `setAccessToken()` | `token: string` | `void` | Store access token |
| `getAccessToken()` | - | `string | null` | Get access token |
| `setRefreshToken()` | `token: string` | `void` | Store refresh token |
| `getRefreshToken()` | - | `string | null` | Get refresh token |
| `setTokens()` | `accessToken, refreshToken` | `void` | Store both tokens |
| `setUser()` | `user: any` | `void` | Store user data |
| `getUser()` | - | `any | null` | Get user data |
| `clear()` | - | `void` | Clear all stored data |
| `isAuthenticated()` | - | `boolean` | Check if authenticated |

## Type Definitions

All TypeScript types are exported from `@/lib/api/types`:

- `User`, `UserProfile`
- `RegisterRequest`, `LoginRequest`, `AuthResponse`
- `UserPreferences`, `UpdatePreferencesRequest`
- `Pin`, `CreatePinRequest`, `UpdatePinRequest`
- `APIError`, `APIException`

## Architecture

### Request Flow

1. **Request Interceptor**: Adds JWT token to Authorization header
2. **API Call**: Makes the actual HTTP request
3. **Response Interceptor**: Handles errors and token refresh
4. **Auto Refresh**: If 401 error, automatically refreshes token and retries

### Token Refresh Strategy

The client implements a queue-based token refresh strategy:

1. When a 401 error occurs, the first request triggers token refresh
2. Subsequent 401 requests are queued
3. After refresh succeeds, all queued requests are retried with the new token
4. If refresh fails, all tokens are cleared and user is redirected to login

## Best Practices

1. **Always use try-catch**: Wrap API calls in try-catch blocks
2. **Handle APIException**: Check for APIException type in error handlers
3. **Check authentication**: Use `isAuthenticated()` before protected actions
4. **Update local state**: Update user state after login/register
5. **Clear on logout**: Always call `logout()` to clear tokens properly

## Troubleshooting

### CORS Errors
Ensure the backend has the correct CORS configuration in `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

### Token Not Persisting
Check that `localStorage` is available (not in SSR context). The client checks for browser environment before accessing localStorage.

### 401 Errors After Refresh
Ensure JWT secrets in `backend/.env` are at least 32 characters long.

## Contributing

When adding new API endpoints:

1. Add types to `types.ts`
2. Create method in appropriate API class (`auth.ts`, `users.ts`, or new file)
3. Export from `index.ts`
4. Update this README with usage examples
