import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctors';
import { queryKeys } from '@/lib/query-keys';
import type { DoctorFilters } from '@/types';

// Get paginated doctors list
export const useDoctors = (filters: DoctorFilters) => {
  return useQuery({
    queryKey: queryKeys.doctorsList(filters),
    queryFn: () => doctorService.getDoctors(filters),
    // Keep previous data while fetching new data (for smooth pagination)
    placeholderData: (previousData) => previousData,
    // Stale time for doctors list (they don't change frequently)
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get infinite doctors list (for infinite scrolling)
export const useDoctorsInfinite = (filters: Omit<DoctorFilters, 'page'>) => {
  return useInfiniteQuery({
    queryKey: queryKeys.doctorsInfinite(filters),
    queryFn: ({ pageParam = 1 }) => 
      doctorService.getDoctors({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const { page } = firstPage.pagination;
      return page > 1 ? page - 1 : undefined;
    },
    // Stale time for infinite query
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get specific doctor by ID
export const useDoctor = (doctorId: string, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.doctors, 'detail', doctorId],
    queryFn: () => doctorService.getDoctorById(doctorId),
    enabled: enabled && !!doctorId,
    // Individual doctor data is more stable
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get specializations list
export const useSpecializations = () => {
  return useQuery({
    queryKey: queryKeys.specializationsList(),
    queryFn: () => doctorService.getSpecializations(),
    // Specializations rarely change, cache for longer
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};