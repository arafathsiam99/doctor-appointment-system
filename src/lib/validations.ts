import { z } from 'zod';

// Authentication Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PATIENT', 'DOCTOR'], {
    message: 'Please select a role',
  }),
});

export const registerPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  photo_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export const registerDoctorSchema = registerPatientSchema.extend({
  specialization: z.string().min(1, 'Specialization is required'),
});

// Appointment Schemas
export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor selection is required'),
  date: z.string().min(1, 'Date is required').refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'Date must be today or in the future'),
});

export const updateAppointmentStatusSchema = z.object({
  appointment_id: z.string().min(1, 'Appointment ID is required'),
  status: z.enum(['COMPLETE', 'CANCELLED'], {
    message: 'Status is required',
  }),
});

// Filter Schemas
export const doctorFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  specialization: z.string().optional(),
});

export const appointmentFiltersSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const doctorAppointmentFiltersSchema = appointmentFiltersSchema.extend({
  date: z.string().optional(),
});

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterPatientFormData = z.infer<typeof registerPatientSchema>;
export type RegisterDoctorFormData = z.infer<typeof registerDoctorSchema>;
export type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusFormData = z.infer<typeof updateAppointmentStatusSchema>;
export type DoctorFiltersFormData = z.infer<typeof doctorFiltersSchema>;
export type AppointmentFiltersFormData = z.infer<typeof appointmentFiltersSchema>;
export type DoctorAppointmentFiltersFormData = z.infer<typeof doctorAppointmentFiltersSchema>;