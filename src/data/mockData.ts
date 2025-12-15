import { User, AttendanceRecord, LeaveRequest, Permission } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    matricule: 'NAFA001',
    first_name: 'Amadou',
    last_name: 'Diallo',
    email: 'rh@nafa.com',
    password: 'rh123',
    role: 'rh',
    poste: 'Responsable RH',
    service: 'Ressources Humaines',
    dateEmbauche: '2020-01-15',
    phone: '+221 77 123 45 67',
    soldeConges: 30,
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: '2',
    matricule: 'NAFA002',
    first_name: 'Fatou',
    last_name: 'Sow',
    email: 'directeur@nafa.com',
    password: 'dir123',
    role: 'manager',
    poste: 'Directeur Général',
    service: 'Direction',
    dateEmbauche: '2019-03-01',
    phone: '+221 77 234 56 78',
    soldeConges: 30,
    avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: '3',
    matricule: 'NAFA003',
    first_name: 'Moussa',
    last_name: 'Ba',
    email: 'adjoint@nafa.com',
    password: 'adj123',
    role: 'employee',
    poste: 'Directeur Adjoint',
    service: 'Direction',
    dateEmbauche: '2020-06-15',
    phone: '+221 77 345 67 89',
    soldeConges: 28,
    avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: '4',
    matricule: 'NAFA004',
    first_name: 'Aïssatou',
    last_name: 'Ndiaye',
    email: 'manager@nafa.com',
    password: 'mgr123',
    role: 'employee',
    poste: 'Chef de Département',
    service: 'Commercial',
    dateEmbauche: '2021-01-10',
    phone: '+221 77 456 78 90',
    soldeConges: 25,
    avatar: 'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: '5',
    matricule: 'NAFA005',
    first_name: 'Ibrahima',
    last_name: 'Fall',
    email: 'emp1@nafa.com',
    password: 'emp123',
    role: 'employee',
    poste: 'Commercial',
    service: 'Commercial',
    dateEmbauche: '2022-03-20',
    phone: '+221 77 567 89 01',
    soldeConges: 22,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: '6',
    matricule: 'NAFA006',
    first_name: 'Mariama',
    last_name: 'Sy',
    email: 'emp2@nafa.com',
    password: 'emp123',
    role: 'employee',
    poste: 'Comptable',
    service: 'Comptabilité',
    dateEmbauche: '2021-09-01',
    phone: '+221 77 678 90 12',
    soldeConges: 20,
    avatar: 'https://images.pexels.com/photos/3756522/pexels-photo-3756522.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: '7',
    matricule: 'NAFA007',
    first_name: 'Ousmane',
    last_name: 'Gueye',
    email: 'emp3@nafa.com',
    password: 'emp123',
    role: 'employee',
    poste: 'Développeur',
    service: 'IT',
    dateEmbauche: '2022-11-15',
    phone: '+221 77 789 01 23',
    soldeConges: 18,
    avatar: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: '8',
    matricule: 'NAFA008',
    first_name: 'Khady',
    last_name: 'Mbaye',
    email: 'emp4@nafa.com',
    password: 'emp123',
    role: 'employee',
    poste: 'Assistante',
    service: 'Administration',
    dateEmbauche: '2023-02-01',
    phone: '+221 77 890 12 34',
    soldeConges: 15,
    avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=200'
  }
];

const today = new Date();
const getDateString = (daysOffset: number = 0): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const mockAttendance: AttendanceRecord[] = [
  { id: '1', userId: '1', date: getDateString(0), checkIn: '08:15', checkOut: '17:30', status: 'present' },
  { id: '2', userId: '2', date: getDateString(0), checkIn: '08:00', checkOut: '17:45', status: 'present' },
  { id: '3', userId: '3', date: getDateString(0), checkIn: '08:30', checkOut: '17:15', status: 'present' },
  { id: '4', userId: '4', date: getDateString(0), checkIn: '09:10', checkOut: '18:00', status: 'retard' },
  { id: '5', userId: '5', date: getDateString(0), checkIn: '08:20', status: 'present' },
  { id: '6', userId: '6', date: getDateString(0), status: 'absent', justification: 'Maladie' },
  { id: '7', userId: '7', date: getDateString(0), checkIn: '08:05', checkOut: '17:20', status: 'present' },
  { id: '8', userId: '8', date: getDateString(0), checkIn: '08:25', checkOut: '16:30', status: 'permission', justification: 'RDV médical' },

  { id: '9', userId: '1', date: getDateString(-1), checkIn: '08:10', checkOut: '17:25', status: 'present' },
  { id: '10', userId: '2', date: getDateString(-1), checkIn: '08:05', checkOut: '17:50', status: 'present' },
  { id: '11', userId: '3', date: getDateString(-1), checkIn: '08:20', checkOut: '17:10', status: 'present' },
  { id: '12', userId: '4', date: getDateString(-1), checkIn: '08:15', checkOut: '18:05', status: 'present' },
  { id: '13', userId: '5', date: getDateString(-1), checkIn: '08:30', checkOut: '17:30', status: 'present' },
  { id: '14', userId: '6', date: getDateString(-1), checkIn: '08:10', checkOut: '17:15', status: 'present' },
  { id: '15', userId: '7', date: getDateString(-1), checkIn: '08:25', checkOut: '17:35', status: 'present' },
  { id: '16', userId: '8', date: getDateString(-1), checkIn: '09:15', checkOut: '17:00', status: 'retard' },
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '5',
    type: 'conge',
    dateDebut: getDateString(10),
    dateFin: getDateString(17),
    motif: 'Congés annuels',
    status: 'en-attente',
    createdAt: new Date().toISOString(),
    nbJours: 7
  },
  {
    id: '2',
    userId: '6',
    type: 'permission',
    dateDebut: getDateString(2),
    dateFin: getDateString(2),
    motif: 'Rendez-vous médical',
    status: 'approuve',
    validatedBy: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    nbJours: 0.5
  },
  {
    id: '3',
    userId: '7',
    type: 'jour-off',
    dateDebut: getDateString(5),
    dateFin: getDateString(5),
    motif: 'Événement familial',
    status: 'en-attente',
    createdAt: new Date().toISOString(),
    nbJours: 1
  },
  {
    id: '4',
    userId: '8',
    type: 'conge',
    dateDebut: getDateString(15),
    dateFin: getDateString(20),
    motif: 'Vacances',
    status: 'en-attente',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    nbJours: 5
  },
  {
    id: '5',
    userId: '4',
    type: 'permission',
    dateDebut: getDateString(-2),
    dateFin: getDateString(-2),
    motif: 'Démarches administratives',
    status: 'approuve',
    validatedBy: '2',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    nbJours: 0.5
  },
  {
    id: '6',
    userId: '5',
    type: 'jour-off',
    dateDebut: getDateString(-5),
    dateFin: getDateString(-5),
    motif: 'Raisons personnelles',
    status: 'refuse',
    validatedBy: '1',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    nbJours: 1
  }
];

export const mockPermissions: Permission[] = [
  {
    id: 'perm1',
    userId: '5',
    date: '2025-11-11',
    startTime: '14:00',
    endTime: '16:00',
    reason: 'Rendez-vous bancaire',
    status: 'approved',
    requestDate: '2025-11-09',
    approvedBy: '4',
  },
  {
    id: 'perm2',
    userId: '7',
    date: '2025-11-12',
    startTime: '10:00',
    endTime: '11:30',
    reason: 'Démarches administratives',
    status: 'pending',
    requestDate: '2025-11-10',
  },
  {
    id: 'perm3',
    userId: '6',
    date: '2025-11-08',
    startTime: '15:00',
    endTime: '17:00',
    reason: 'Urgence familiale',
    status: 'approved',
    requestDate: '2025-11-08',
    approvedBy: '3',
  },
];
