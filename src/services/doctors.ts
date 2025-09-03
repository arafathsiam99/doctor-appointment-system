import { makeApiRequest } from '../lib/api';
import { responseTransformers } from '../lib/response-transformers';
import type {
  Doctor,
  Specialization,
  DoctorFilters,
  GetDoctorsResponse,
  GetSpecializationsResponse,
  PaginatedResponse,
} from '../types';

// Doctor service functions
export const doctorService = {
  /**
   * Get paginated list of doctors with optional filters
   */
  getDoctors: async (filters: DoctorFilters): Promise<PaginatedResponse<Doctor>> => {
    const response = await makeApiRequest<GetDoctorsResponse>(
      'GET',
      '/doctors',
      undefined,
      filters
    );
    
    return responseTransformers.transformPaginatedResponse(
      response.data,
      responseTransformers.transformDoctor
    );
  },

  /**
   * Get list of all available specializations
   */
  getSpecializations: async (): Promise<Specialization[]> => {
    const response = await makeApiRequest<GetSpecializationsResponse>(
      'GET',
      '/specializations'
    );
    
    return responseTransformers.transformArray(
      response.data,
      responseTransformers.transformSpecialization
    );
  },

  /**
   * Get a specific doctor by ID
   */
  getDoctorById: async (doctorId: string): Promise<Doctor> => {
    const response = await makeApiRequest<{ success: boolean; data: Doctor }>(
      'GET',
      `/doctors/${doctorId}`
    );
    
    return responseTransformers.transformDoctor(response.data);
  },
};

export default doctorService;