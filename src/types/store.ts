import type { User, Notification, ModalState, LoginCredentials, RegisterPatientData, RegisterDoctorData } from './index';

// Auth Store Interface
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  registerPatient: (userData: RegisterPatientData) => Promise<void>;
  registerDoctor: (userData: RegisterDoctorData) => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  initialize: () => void;
}

// UI Store Interface
export interface UIState {
  isLoading: boolean;
  notifications: Notification[];
  modals: ModalState;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Modal actions
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  toggleModal: (modal: keyof ModalState) => void;
  closeAllModals: () => void;
}

// Combined Store Type
export interface RootState {
  auth: AuthState;
  ui: UIState;
}