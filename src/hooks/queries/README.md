# React Query Hooks

This directory contains all React Query hooks for the Doctor Appointment System. The hooks are organized by feature and provide a clean interface for data fetching, caching, and mutations.

## Overview

The React Query implementation includes:

- **Optimized caching strategies** with appropriate stale times for different data types
- **Optimistic updates** for appointment status changes
- **Automatic cache invalidation** when data changes
- **Error handling** with retry logic
- **Type safety** with TypeScript

## Configuration

### QueryClient Setup

The QueryClient is configured in `src/lib/react-query.ts` with:

- **Stale Time**: 5 minutes for most queries
- **Cache Time**: 10 minutes for garbage collection
- **Retry Logic**: Smart retry based on error type (no retry for 4xx errors)
- **Background Refetching**: Enabled on reconnect, disabled on window focus

### Provider Setup

The `QueryProvider` component wraps the entire application and includes:

- QueryClient instance management
- React Query DevTools (development only)
- Error boundary integration

## Available Hooks

### Authentication Hooks (`auth.ts`)

```typescript
// Login mutation
const loginMutation = useLogin();
loginMutation.mutate({ email, password, role });

// Register patient
const registerPatient = useRegisterPatient();
registerPatient.mutate({ name, email, password, photo_url });

// Register doctor
const registerDoctor = useRegisterDoctor();
registerDoctor.mutate({ name, email, password, specialization, photo_url });

// Logout
const logout = useLogout();
logout.mutate();

// Get current user (from cache/localStorage)
const currentUser = useCurrentUser();

// Check authentication status
const isAuthenticated = useIsAuthenticated();
```

### Doctor Hooks (`doctors.ts`)

```typescript
// Get paginated doctors list
const { data, isLoading, error } = useDoctors({
  page: 1,
  limit: 10,
  search: 'Dr. Smith',
  specialization: 'Cardiology'
});

// Get infinite doctors list (for infinite scrolling)
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useDoctorsInfinite({ search: '', specialization: '' });

// Get specific doctor
const { data: doctor } = useDoctor('doctor-id');

// Get specializations
const { data: specializations } = useSpecializations();
```

### Appointment Hooks (`appointments.ts`)

```typescript
// Get patient appointments
const { data: appointments } = usePatientAppointments({
  page: 1,
  status: 'PENDING'
});

// Get doctor appointments
const { data: appointments } = useDoctorAppointments({
  page: 1,
  status: 'PENDING',
  date: '2024-01-15'
});

// Get specific appointment
const { data: appointment } = useAppointment('appointment-id');

// Create appointment
const createAppointment = useCreateAppointment();
createAppointment.mutate({
  doctorId: 'doctor-123',
  date: '2024-01-15'
});

// Update appointment status (with optimistic updates)
const updateStatus = useUpdateAppointmentStatus();
updateStatus.mutate({
  appointment_id: 'appointment-123',
  status: 'COMPLETE'
});

// Convenience hooks
const cancelAppointment = useCancelAppointment();
cancelAppointment.mutate('appointment-id');

const completeAppointment = useCompleteAppointment();
completeAppointment.mutate('appointment-id');
```

## Key Features

### 1. Optimistic Updates

Appointment status changes use optimistic updates for immediate UI feedback:

```typescript
const updateStatus = useUpdateAppointmentStatus();

// UI updates immediately, then syncs with server
updateStatus.mutate({
  appointment_id: 'appointment-123',
  status: 'COMPLETE'
});
```

### 2. Smart Caching

Different data types have optimized cache strategies:

- **Specializations**: 30 minutes (rarely change)
- **Doctors**: 10 minutes (stable data)
- **Appointments**: 2 minutes (frequently updated)
- **Individual records**: 15 minutes

### 3. Cache Invalidation

Mutations automatically invalidate related queries:

```typescript
// Creating an appointment invalidates:
// - Patient appointments
// - Doctor appointments
// - Adds new appointment to existing cache

// Updating appointment status:
// - Uses optimistic updates
// - Invalidates appointment lists
// - Updates individual appointment cache
```

### 4. Error Handling

- **Network errors**: Retry up to 3 times
- **4xx errors**: No retry (client errors)
- **5xx errors**: Retry with exponential backoff
- **Authentication errors**: Clear cache and redirect

### 5. Background Refetching

- **On reconnect**: Refetch stale data
- **On mount**: Refetch if data is stale
- **Window focus**: Disabled by default
- **Interval refetching**: Available for real-time data

## Usage Examples

### Basic Query

```typescript
function DoctorsList() {
  const { data, isLoading, error, refetch } = useDoctors({
    page: 1,
    limit: 10
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(doctor => (
        <div key={doctor.id}>{doctor.name}</div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Mutation with Loading States

```typescript
function CreateAppointmentForm() {
  const createAppointment = useCreateAppointment();

  const handleSubmit = (data) => {
    createAppointment.mutate(data, {
      onSuccess: () => {
        // Handle success
        console.log('Appointment created!');
      },
      onError: (error) => {
        // Handle error
        console.error('Failed to create appointment:', error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createAppointment.isPending}
      >
        {createAppointment.isPending ? 'Creating...' : 'Create Appointment'}
      </button>
    </form>
  );
}
```

### Conditional Queries

```typescript
function UserDashboard() {
  const currentUser = useCurrentUser();
  
  // Only fetch patient appointments if user is a patient
  const { data: patientAppointments } = usePatientAppointments(
    { page: 1 },
    { enabled: currentUser?.role === 'PATIENT' }
  );
  
  // Only fetch doctor appointments if user is a doctor
  const { data: doctorAppointments } = useDoctorAppointments(
    { page: 1 },
    { enabled: currentUser?.role === 'DOCTOR' }
  );

  return (
    <div>
      {currentUser?.role === 'PATIENT' && (
        <PatientAppointmentsList appointments={patientAppointments} />
      )}
      {currentUser?.role === 'DOCTOR' && (
        <DoctorAppointmentsList appointments={doctorAppointments} />
      )}
    </div>
  );
}
```

## Testing

All hooks are thoroughly tested with:

- **Unit tests** for individual hook behavior
- **Integration tests** for cache interactions
- **Optimistic update tests** for mutation behavior
- **Error handling tests** for failure scenarios

Run tests with:

```bash
npm run test src/__tests__/hooks/queries/
```

## Best Practices

1. **Use appropriate stale times** based on data volatility
2. **Implement optimistic updates** for better UX
3. **Handle loading and error states** in components
4. **Use query keys consistently** for cache management
5. **Invalidate related queries** after mutations
6. **Enable/disable queries** based on user state
7. **Use placeholderData** for smooth pagination
8. **Implement proper error boundaries** for fallback UI

## Cache Management

The cache utilities in `src/lib/react-query.ts` provide helpers for:

- **Invalidating queries** by pattern
- **Removing specific data** from cache
- **Updating cache data** directly
- **Managing query states** programmatically

Use these utilities when you need fine-grained cache control beyond the automatic invalidation provided by mutations.