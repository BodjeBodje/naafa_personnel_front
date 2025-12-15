export type UserRole = 'rh' | 'manager' | 'admin' | 'employee';

export interface User {
  id: string;
  matricule: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
  poste: string;
  service: string;
  dateEmbauche: string;
  phone: string;
  soldeConges: number;
  avatar?: string;
  must_change_password?: number;
  mustChangePassword?: boolean;

}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'retard' | 'permission';
  justification?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'conge' | 'permission' | 'jour-off';
  dateDebut: string;
  dateFin: string;
  motif: string;
  status: 'en-attente' | 'approuve' | 'refuse';
  validatedBy?: string;
  createdAt: string;
  nbJours: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    leave_balance: number;
    poste?: string; // optionnel si pas dans l'API
    department:{
      id:number;
      name: string;
      description: string;
    }
  }
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasAccess: (requiredRoles: UserRole[]) => boolean;

}


export interface Permission {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedBy?: string;
}

export interface Department {
  id: number;
  name: string;
  description: string | null;
}
