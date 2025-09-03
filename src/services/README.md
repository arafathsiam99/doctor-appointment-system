# API Client and Services

This directory contains the API client configuration and service layer for the Doctor Appointment Management System.

## Overview

The API layer is built with the following components:

- **API Client** (`src/lib/api.ts`): Axios-based HTTP client with interceptors
- **Services** (`src/services/`): Service functions for different API endpoints
- **Error Handling** (`src/lib/error-handling.ts`): Comprehensive error handling utilities
- **Response Transformers** (`src/lib/response-transformers.ts`): Data transformation utilities

## API Client Features

### Base Configuration
- Base URL: `https://appointment-manager-node.onrender.com/api/v1`
- Timeout: 10 seconds
- JSON content type headers
- Automatic token injection from localStorage

### Request Interceptor
- Automatically adds Bearer token to requests
- Retrieves token from localStorage

### Response Interceptor
- Handles 401 errors with automatic logout and redirect
- Transforms errors to consistent ApiError format
- Logs errors for debugging
- Handles network errors gracefully

## Services

### Authentication Service (`auth.ts`)
```typescript
import { authService } from '@/services';

// Login
const { user, token } = await authService.login({
  email: 'user@example.com',
  password: 'password',
  role: 'PATIENT'
});

// Register Patient
const result = await authService.registerPatient({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password',
  photo_url: 'https://example.com/photo.jpg'
});

// Register Doctor
const result = await authService.registerDoctor({
  name: 'Dr. Smith',
  email: 'smith@example.com',
  password: 'password',
  specialization: 'Cardiology',
  photo_url: 'https://example.com/photo.jpg'
});

// Utility methods
const token = authService.getToken();
const user = authService.getUser();
const isAuth = authService.isAuthenticated();
authService.logout();
```

### Doctor Service (`doctors.ts`)
```typescript
import { doctorService } from '@/services';

// Get doctors with filters
const doctors = await doctorService.getDoctors({
  page: 1,
  limit: 10,
  search: 'John',
  specialization: 'Cardiology'
});

// Get specializations
const specializations = await doctorService.getSpecializations();

// Get doctor by ID
const doctor = await doctorService.getDoctorById('doctor-id');
```

### Appointment Service (`appointments.ts`)
```typescript
import { appointmentService } from '@/services';

// Create appointment
const appointment = await appointmentService.createAppointment({
  doctorId: 'doctor-id',
  date: '2024-01-15T10:00:00Z'
});

// Get patient appointments
const appointments = await appointmentService.getPatientAppointments({
  page: 1,
  limit: 10,
  status: 'PENDING'
});

// Get doctor appointments
const appointments = await appointmentService.getDoctorAppointments({
  page: 1,
  limit: 10,
  date: '2024-01-15',
  status: 'PENDING'
});

// Update appointment status
const updated = await appointmentService.updateAppointmentStatus({
  appointment_id: 'appointment-id',
  status: 'COMPLETE'
});

// Convenience methods
await appointmentService.cancelAppointment('appointment-id');
await appointmentService.completeAppointment('appointment-id');
```

## Error Handling

### Error Types
- `AppError`: Base error class with status and code
- `ValidationAppError`: Validation errors with field details
- `NetworkError`: Network connectivity errors
- `AuthenticationError`: Authentication failures
- `AuthorizationError`: Authorization failures

### Error Utilities
```typescript
import { errorUtils } from '@/lib/error-handling';

// Check error types
if (errorUtils.isAuthError(error)) {
  // Handle authentication error
}

if (errorUtils.isNetworkError(error)) {
  // Handle network error
}

// Extract error information
const message = errorUtils.getErrorMessage(error);
const status = errorUtils.getErrorStatus(error);
const apiError = errorUtils.toApiError(error);

// Retry with exponential backoff
const result = await errorUtils.retry(
  () => apiCall(),
  3, // max retries
  1000 // base delay
);
```

## Response Transformers

The response transformers ensure consistent data format across the application:

```typescript
import { responseTransformers } from '@/lib/response-transformers';

// Transform individual items
const user = responseTransformers.transformUser(rawUserData);
const doctor = responseTransformers.transformDoctor(rawDoctorData);
const appointment = responseTransformers.transformAppointment(rawAppointmentData);

// Transform paginated responses
const paginatedDoctors = responseTransformers.transformPaginatedResponse(
  rawResponse,
  responseTransformers.transformDoctor
);
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_API_URL=https://appointment-manager-node.onrender.com/api/v1
```

## Usage Examples

### Complete Authentication Flow
```typescript
import { authService } from '@/services';

try {
  // Login
  const { user, token } = await authService.login({
    email: 'user@example.com',
    password: 'password',
    role: 'PATIENT'
  });

  // Store authentication data
  authService.setToken(token);
  authService.setUser(user);

  // Redirect based on role
  if (user.role === 'PATIENT') {
    router.push('/patient/dashboard');
  } else {
    router.push('/doctor/dashboard');
  }
} catch (error) {
  console.error('Login failed:', errorUtils.getErrorMessage(error));
}
```

### Fetching and Displaying Doctors
```typescript
import { doctorService } from '@/services';

const [doctors, setDoctors] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getDoctors({
        page: 1,
        limit: 10
      });
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', errorUtils.getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  fetchDoctors();
}, []);
```

## Testing

The API client includes basic tests in `src/lib/__tests__/api.test.ts`. To run tests:

```bash
npm test
```

## Best Practices

1. **Always handle errors**: Use try-catch blocks and the error utilities
2. **Use response transformers**: Ensure consistent data format
3. **Implement retry logic**: For network-related operations
4. **Log errors appropriately**: Use `errorUtils.logError()` for debugging
5. **Check authentication**: Use `authService.isAuthenticated()` before API calls
6. **Transform responses**: Use the provided transformers for consistent data

## API Endpoints

The services interact with the following API endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register/patient` - Patient registration
- `POST /auth/register/doctor` - Doctor registration

### Doctors
- `GET /doctors` - Get paginated doctors list
- `GET /doctors/:id` - Get doctor by ID
- `GET /specializations` - Get all specializations

### Appointments
- `POST /appointments` - Create appointment
- `GET /appointments/patient` - Get patient appointments
- `GET /appointments/doctor` - Get doctor appointments
- `GET /appointments/:id` - Get appointment by ID
- `PATCH /appointments/update-status` - Update appointment status

## Contributing

When adding new services:

1. Create service functions in appropriate files
2. Add proper TypeScript types
3. Use response transformers for data consistency
4. Include comprehensive error handling
5. Add JSDoc comments for documentation
6. Write tests for new functionality