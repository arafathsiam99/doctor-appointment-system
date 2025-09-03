// Authentication hooks
export {
  useLogin,
  useRegisterPatient,
  useRegisterDoctor,
  useLogout,
  useCurrentUser,
  useIsAuthenticated,
} from './auth';

// Doctor hooks
export {
  useDoctors,
  useDoctorsInfinite,
  useDoctor,
  useSpecializations,
} from './doctors';

// Appointment hooks
export {
  usePatientAppointments,
  useDoctorAppointments,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointmentStatus,
  useCancelAppointment,
  useCompleteAppointment,
} from './appointments';