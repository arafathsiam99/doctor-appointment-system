// Import services
import { authService } from './auth';
import { doctorService } from './doctors';
import { appointmentService } from './appointments';

// Export all services
export { authService } from './auth';
export { doctorService } from './doctors';
export { appointmentService } from './appointments';

// Re-export for convenience
export const services = {
  auth: authService,
  doctors: doctorService,
  appointments: appointmentService,
};

export default services;