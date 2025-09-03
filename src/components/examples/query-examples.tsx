'use client';

import React from 'react';
import {
  useDoctors,
  useSpecializations,
  usePatientAppointments,
  useCreateAppointment,
  useUpdateAppointmentStatus,
  useLogin,
  useCurrentUser,
} from '@/hooks/queries';

/**
 * Example component demonstrating React Query hooks usage
 * This is for demonstration purposes and shows how to use the hooks
 */
export function QueryExamples() {
  const currentUser = useCurrentUser();
  
  // Example: Fetch doctors with filters
  const {
    data: doctorsData,
    isLoading: doctorsLoading,
    error: doctorsError,
    refetch: refetchDoctors,
  } = useDoctors({
    page: 1,
    limit: 10,
    search: '',
    specialization: '',
  });

  // Example: Fetch specializations
  const {
    data: specializations,
    isLoading: specializationsLoading,
  } = useSpecializations();

  // Example: Fetch patient appointments (only if user is a patient)
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
  } = usePatientAppointments({ page: 1, status: 'PENDING' });

  // Example: Login mutation
  const loginMutation = useLogin();

  // Example: Create appointment mutation
  const createAppointmentMutation = useCreateAppointment();

  // Example: Update appointment status mutation
  const updateStatusMutation = useUpdateAppointmentStatus();

  const handleLogin = () => {
    loginMutation.mutate({
      email: 'patient@example.com',
      password: 'password123',
      role: 'PATIENT',
    });
  };

  const handleCreateAppointment = () => {
    createAppointmentMutation.mutate({
      doctorId: 'doctor-123',
      date: '2024-01-15',
    });
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    updateStatusMutation.mutate({
      appointment_id: appointmentId,
      status: 'COMPLETE',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">React Query Examples</h2>
      
      {/* Current User */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold">Current User:</h3>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      </div>

      {/* Doctors List */}
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold">Doctors List:</h3>
        {doctorsLoading && <p>Loading doctors...</p>}
        {doctorsError && <p className="text-red-500">Error loading doctors</p>}
        {doctorsData && (
          <div>
            <p>Found {doctorsData.pagination.total} doctors</p>
            <button 
              onClick={() => refetchDoctors()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Refetch Doctors
            </button>
          </div>
        )}
      </div>

      {/* Specializations */}
      <div className="bg-green-50 p-4 rounded">
        <h3 className="font-semibold">Specializations:</h3>
        {specializationsLoading && <p>Loading specializations...</p>}
        {specializations && (
          <p>Found {specializations.length} specializations</p>
        )}
      </div>

      {/* Patient Appointments */}
      {currentUser?.role === 'PATIENT' && (
        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-semibold">Patient Appointments:</h3>
          {appointmentsLoading && <p>Loading appointments...</p>}
          {appointmentsData && (
            <div>
              <p>Found {appointmentsData.pagination.total} appointments</p>
              {appointmentsData.data.map((appointment) => (
                <div key={appointment.id} className="mt-2 p-2 border rounded">
                  <p>Date: {appointment.date}</p>
                  <p>Status: {appointment.status}</p>
                  {appointment.status === 'PENDING' && (
                    <button
                      onClick={() => handleCompleteAppointment(appointment.id)}
                      disabled={updateStatusMutation.isPending}
                      className="mt-1 px-3 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      {updateStatusMutation.isPending ? 'Updating...' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mutation Examples */}
      <div className="bg-purple-50 p-4 rounded">
        <h3 className="font-semibold">Mutation Examples:</h3>
        <div className="space-x-2 mt-2">
          <button
            onClick={handleLogin}
            disabled={loginMutation.isPending}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login Example'}
          </button>
          
          <button
            onClick={handleCreateAppointment}
            disabled={createAppointmentMutation.isPending}
            className="px-4 py-2 bg-indigo-500 text-white rounded"
          >
            {createAppointmentMutation.isPending ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
        
        {/* Mutation Status */}
        {loginMutation.isError && (
          <p className="text-red-500 mt-2">Login failed</p>
        )}
        {loginMutation.isSuccess && (
          <p className="text-green-500 mt-2">Login successful!</p>
        )}
        
        {createAppointmentMutation.isError && (
          <p className="text-red-500 mt-2">Failed to create appointment</p>
        )}
        {createAppointmentMutation.isSuccess && (
          <p className="text-green-500 mt-2">Appointment created successfully!</p>
        )}
      </div>
    </div>
  );
}