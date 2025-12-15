import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://192.168.2.252:8000/api';
// const API_BASE_URL = 'http://127.0.0.1:8000/api';
export const STORAGE_BASE_URL = 'http://192.168.2.76:8000/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // 'Content-Type': 'application/json',
    'Content-Type': 'multipart/form-data',
    Accept: 'application/json',
  },
});

// 🔐 Intercepteur de requête — injection du token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ❌ Intercepteur de réponse — gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si le token est expiré ou invalide (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Rediriger vers la page de connexion seulement si on n'y est pas déjà
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Gestion des autres erreurs
    if (error.response?.status === 403) {
      console.error('Accès refusé - Permissions insuffisantes');
    }

    if (error.response?.status === 404) {
      console.error('Ressource non trouvée');
    }

    if (error.response?.status >= 500) {
      console.error('Erreur serveur');
    }

    return Promise.reject(error);
  }
);

// 📦 Méthodes HTTP avec gestion d'erreurs
const getData = async (url: string, params?: object) => {
  try {
    return await api.get(url, { params });
  } catch (error) {
    console.error(`Erreur GET ${url}:`, error);
    throw error;
  }
};

const postData = async (url: string, data?: object) => {
  try {
    return await api.post(url, data);
  } catch (error) {
    console.error(`Erreur POST ${url}:`, error);
    throw error;
  }
};

const putData = async (url: string, data?: object) => {
  try {
    return await api.put(url, data);
  } catch (error) {
    console.error(`Erreur PUT ${url}:`, error);
    throw error;
  }
};

const patchData = async (url: string, data?: object) => {
  try {
    return await api.patch(url, data);
  } catch (error) {
    console.error(`Erreur PATCH ${url}:`, error);
    throw error;
  }
};

const deleteData = async (url: string) => {
  try {
    return await api.delete(url);
  } catch (error) {
    console.error(`Erreur DELETE ${url}:`, error);
    throw error;
  }
};

// 🔑 Endpoints API
const ENDPOINTS = {
  login: '/login',
  changePassword: '/update-password',
  logout: '/logout',
  user: '/me',
  // ADMIN ROUTES
  departments: '/departments',
  teachers: '/teachers',
  supervisors: '/supervisors',
  classes: '/admin-classes',
  subjects: '/subjects',
  levels: '/levels',
  availableTeacher: '/available-head-teacher',
  classSubjects: '/class-subjects',
  schedules: '/schedules',
  schedulesByClasse: '/schedules/generateByClasse',
  schedulesByAllClasse: '/schedules/generateForAllClasse',
  schedulesDeleteByClasse: '/schedules/delete-by-classe',
  schedulesDeleteAll: '/schedules/delete-all',
  schedulesSwap: '/schedules/swap',
  adminschedulesUpdateTimeOrDay: '/schedules/update-time-or-day',
  schedulesUpdateTimeOrDay: '/supervisors-schedules/update-time-or-day',
  schedulesAvailableTeachers: '/schedules/teachers-by-subjects',
  schedulesReplaceTeacher: '/schedules/replace-teacher',
  parents: '/parents',
  evaluations: '/evaluations',
  classesWithoutSupervisor: '/classes-without-supervisor',
  assignSupervisorToclasses: '/assign-supervisor-to-class',
  deletassignedSupervisorToclasses: '/delete-assigne-supervisor-to-class',
  supervisorWithclassesCount: '/supervisor-with-classes-count',


  // SUPERVISOR ROUTES
  supervisorClasses: '/supervisor-classes',
  supervisorsSchedulesByClasse: '/supervisors-schedules/generateByClasse',
  supervisorsSchedulesByAllClasse: '/supervisors-schedules/generateForAllClasse',
  myClasses: '/supervisors/classes',
  classesWithSameLevel: '/classes/same-level',
  transfertStudent: '/students/transfer',
  schedulesForMyClasses: '/schedules/supervisor',
  supervisorsParentsByName: '/supervisors-parents-by-name',
  supervisorsFilteredClass: '/supervisors-classes-filtered',
  enrolle: '/supervisors-enrolle',
  reenrolle: '/supervisors-reenrolle',
  payment: '/supervisors-payment',
  supervisorSchedulesSwap: '/supervisors-schedules/swap',
  noEnrolleStudent: '/supervisors-no-enrolle-student',
  unpaidStudent: '/supervisors-unpaid-student',
  supervisorsYearAverages: '/supervisors-year-averages',
  supervisorsYearAveragesByStudent: '/supervisors-rescue-student',

};

// 🛠️ Fonctions utilitaires pour les API calls
const authAPI = {
  login: (credentials: { login: string; password: string }) =>
    postData(ENDPOINTS.login, credentials),
    changePassword: (credentials: { password: string }) =>
    postData(ENDPOINTS.changePassword, credentials),
  logout: () => postData(ENDPOINTS.logout),
  getCurrentUser: () => getData(ENDPOINTS.user),
};

const managerAPI = {
  getAllDepartment: () => getData(ENDPOINTS.departments),
  getById: (id: number) => getData(`${ENDPOINTS.departments}/${id}`),
  addNewEmployee: (data: object) => postData('/users', data),
  employeeList: (page = 1, perPage = 6) => getData(`/users?page=${page}&per_page=${perPage}`),
  employeePermissions: () => getData(`/permissions`),
  approvePermission: (id: number) => postData(`/permissions/${id}/approve`),
  rejectPermission: (id: number) => postData(`/permissions/${id}/reject`),
  employeeShifts: () => getData(`/shifts`),
  update: (id: number, data: object) => putData(`${ENDPOINTS.departments}/${id}`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.departments}/${id}`),
  getAttendanceSummary: (params?: { period?: string; date?: string; page?: number; per_page?: number }) => {
    let query = '?';
    if (params?.period) query += `period=${params.period}&`;
    if (params?.date) query += `date=${params.date}&`;
    if (params?.page) query += `page=${params.page}&`;
    if (params?.per_page) query += `per_page=${params.per_page}&`;
    return getData(`/attendances/summary${query}`);
  },

  getRequestedLeaves: (page: number = 1, per_page: number = 5) => {
    return getData(`/leaves?page=${page}&per_page=${per_page}`);
  },

  approveLeave: (id: number) => postData(`/leaves/${id}/approve`),
  rejectLeave: (id: number) => postData(`/leaves/${id}/reject`),

  fillAllAttendances: (data: object) => postData('/attendances/auto-fill', data),
  employeeListForDayOff: () => getData(`/user-for-day-offs`),
  addNewDayOff: (data: object) => postData('/weekly-day-offs', data),
  getEmployeeDayOff: () => getData(`/weekly-day-offs`),
  deleteEmployeeDayOff: (id: number) => deleteData(`/weekly-day-offs/${id}}`),

  getAllUsersMonthlyStats: (month?: string) => {
    let query = '';
    if (month) query = `?month=${month}`;
    return getData(`/monthly-stats${query}`);
  },

  getMonthlyAttendanceSummary: (month?: string) => {
    let query = '';
    if (month) query = `?month=${month}`;
    return getData(`/monthly-attendance-summary${query}`);
  },

  todaySituation: () => getData(`/todaySituation`),


};

const employeeAPI = {
  getMyAttendanceSummary: (params?: { period?: string; date?: string; page?: number; per_page?: number }) => {
    let query = '?';
    if (params?.period) query += `period=${params.period}&`;
    if (params?.date) query += `date=${params.date}&`;
    if (params?.page) query += `page=${params.page}&`;
    if (params?.per_page) query += `per_page=${params.per_page}&`;
    return getData(`/attendances/my-summary${query}`);
  },
  requestLeave: (data: object) => postData('/request-leaves', data),
  myLeave: () => getData(`/leaves/me`),
  requestPermission: (data: object) => postData('/permissions', data),
  getMyPermissions: (month?: string) => {
    let query = '';
    if (month) query = `?month=${month}`;
    return getData(`/my-permissions${query}`);
  },

};

const adminSupervisorsAPI = {
  getAll: (params?: object) => getData(ENDPOINTS.supervisors, params),
  getById: (id: number) => getData(`${ENDPOINTS.supervisors}/${id}`),
  create: (data: object) => postData(ENDPOINTS.supervisors, data),
  update: (id: number, data: object) => putData(`${ENDPOINTS.supervisors}/${id}`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.supervisors}/${id}`),
  assignSupervisorToclass: (data: object) => postData(ENDPOINTS.assignSupervisorToclasses, data),
  deleteassignedSupervisorToclass: (data: object) => postData(ENDPOINTS.deletassignedSupervisorToclasses, data),
  getAllSupervisorWithclassesCount: () => getData(ENDPOINTS.supervisorWithclassesCount),

};

const adminSubjectsAPI = {
  getAll: (params?: object) => getData(ENDPOINTS.subjects, params),
  getMySchoolSubject: () => getData(`/my-school-subjects`),
  create: (data: object) => postData(ENDPOINTS.subjects, data),
  update: (id: number, data: object) => putData(`${ENDPOINTS.subjects}/${id}`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.subjects}/${id}`),
};

const adminLevelsAPI = {
  getAll: (params?: object) => getData(ENDPOINTS.levels, params),
  getById: (id: number) => getData(`${ENDPOINTS.levels}/${id}`),
  create: (data: object) => postData(ENDPOINTS.levels, data),
  update: (id: number, data: object) => putData(`${ENDPOINTS.levels}/${id}`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.levels}/${id}`),
};

const adminClassesAPI = {
  getAll: (params?: object) => getData(ENDPOINTS.classes, params),
  getById: (id: number) => getData(`${ENDPOINTS.classes}/${id}`),
  create: (data: object) => postData(ENDPOINTS.classes, data),
  update: (id: number, data: object) => putData(`${ENDPOINTS.classes}/${id}`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.classes}/${id}`),

  getAvailableClass: (year: number = new Date().getFullYear()) =>
  getData(ENDPOINTS.classesWithoutSupervisor, { year }),
};


const adminClassSubjectAPI = {
  getAll: (params?: object) => getData(ENDPOINTS.classSubjects, params),
  create: (data: { class_id: number; subject_id: number; coefficient_id: number; weekly_hours: number, composition_subject: number }) =>
    postData(ENDPOINTS.classSubjects, data),
  update: (classId: number, data: { subject_id: number; coefficient_id: number; weekly_hours: number }) =>
    putData(`${ENDPOINTS.classSubjects}/${classId}`, data),
  delete: (classId: number, subjectId: number) =>
    deleteData(`${ENDPOINTS.classSubjects}/${classId}/subjects/${subjectId}`),
};
const adminSchedulesAPI = {
  getAll: (params?: object) => getData(ENDPOINTS.schedules, params),
  getById: (id: number) => getData(`${ENDPOINTS.schedules}/${id}`),
  create: (data: object) => postData(ENDPOINTS.schedules, data),
  createByClasse: (data: object) => postData(ENDPOINTS.schedulesByClasse, data),
  createByAllClasse: () => postData(ENDPOINTS.schedulesByClasse),
  update: (id: number, data: object) => putData(`${ENDPOINTS.schedules}/${id}`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.schedules}/${id}`),
  deleteByClasse: (classId: number) => deleteData(`${ENDPOINTS.schedulesDeleteByClasse}/${classId}`),
  deleteAll: () => deleteData(ENDPOINTS.schedulesDeleteAll),
  swap: (data: object) => postData(ENDPOINTS.schedulesSwap, data),
  updateTimeOrDay: (data: object) => postData(ENDPOINTS.adminschedulesUpdateTimeOrDay, data),
  getAvailableTeachers: (teacherId: number) => getData(`${ENDPOINTS.schedulesAvailableTeachers}/${teacherId}`),
  replaceTeacher: (data: object) => postData(ENDPOINTS.schedulesReplaceTeacher, data),
};

const adminParentsAPI = {
  getAll: (page: number = 1) => getData(ENDPOINTS.parents, { params: { page } }),
  getById: (id: number) => getData(`${ENDPOINTS.parents}/${id}`),
  create: (data: object) => postData(ENDPOINTS.parents, data),
  update: (id: number, data: object) => putData(`${ENDPOINTS.parents}/${id}`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.parents}/${id}`),
};

const evaluationAPI = {
  // Admin
  create: (data: object) => postData(ENDPOINTS.evaluations, data),
  getNoteBySemesterAndClass: (semester: number, params?: object) => getData(`${ENDPOINTS.evaluations}/semester/${semester}`, params),
  getByClass: (classId: number, params?: object) => getData(`${ENDPOINTS.evaluations}/class/${classId}`, params),
  getByStudent: (studentId: number, params?: object) => getData(`${ENDPOINTS.evaluations}/student/${studentId}`, params),
  updateScore: (id: number, data: object) => putData(`${ENDPOINTS.evaluations}/${id}/score`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.evaluations}/${id}`),

  //Parent
  getMyChildreenGrade: (semester: number, params?: object) => getData(`parents/evaluations/semester/${semester}`, params),

};

const adminBulletinsAPI = {
  getBulletinBySemesterAndClass: (semester: number, params?: object) => getData(`/semester-averages/${semester}`, params),
  create: (data: object) => postData(ENDPOINTS.evaluations, data),
  getByClass: (classId: number, params?: object) => getData(`${ENDPOINTS.evaluations}/class/${classId}`, params),
  getByStudent: (studentId: number, params?: object) => getData(`${ENDPOINTS.evaluations}/student/${studentId}`, params),
  updateScore: (id: number, data: object) => putData(`${ENDPOINTS.evaluations}/${id}/score`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.evaluations}/${id}`),
};


// SUPERVISOR PART
const supervisorAPI = {
  getBulletinBySemesterAndClass: (semester: number, params?: object) => getData(`/semester-averages/${semester}`, params),
  getMyClass: (data: object) => postData(ENDPOINTS.myClasses, data),
  transfertStudent: (data: object) => postData(ENDPOINTS.transfertStudent, data),
  getSchedulesForMyClasses: (data: object) => postData(ENDPOINTS.schedulesForMyClasses, data),
  getAllClasse: (params?: object) => getData(ENDPOINTS.supervisorClasses, params),
  getClassesWithSameLevel: (name: string) => getData(`${ENDPOINTS.classesWithSameLevel}/${name}`),
  swap: (data: object) => postData(ENDPOINTS.supervisorSchedulesSwap, data),
  updateTimeOrDay: (data: object) => postData(ENDPOINTS.schedulesUpdateTimeOrDay, data),
  getAvailableTeachers: (teacherId: number) => getData(`${ENDPOINTS.schedulesAvailableTeachers}/${teacherId}`),
  replaceTeacher: (data: object) => postData(ENDPOINTS.schedulesReplaceTeacher, data),
  createByClasse: (data: object) => postData(ENDPOINTS.supervisorsSchedulesByClasse, data),
  createByAllClasse: (data: object) => postData(ENDPOINTS.supervisorsSchedulesByAllClasse, data),
  getAllParentByName: (lastName: string) =>  getData(`${ENDPOINTS.supervisorsParentsByName}/${lastName}`),
  getAllFilteredClass: () => getData(ENDPOINTS.supervisorsFilteredClass),
  getNoEnrolleStudent: () => getData(ENDPOINTS.noEnrolleStudent),
  getUnpaidStudent: () => getData(ENDPOINTS.unpaidStudent),
  enrolleNewStudent: (data: object) => postData(ENDPOINTS.enrolle, data),
  renrolleStudent: (data: object) => postData(ENDPOINTS.reenrolle, data),
  studentPayment: (data: object) => postData(ENDPOINTS.payment, data),
  update: (id: number, data: object) => putData(`${ENDPOINTS.schedules}/${id}`, data),
  delete: (id: number) => deleteData(`${ENDPOINTS.schedules}/${id}`),
  deleteByClasse: (classId: number) => deleteData(`${ENDPOINTS.schedulesDeleteByClasse}/${classId}`),
  deleteAll: () => deleteData(ENDPOINTS.schedulesDeleteAll),
  // transfertStudent: (classId: number, params?: object) => getData(`${ENDPOINTS.evaluations}/class/${classId}`, params),
  updateScore: (id: number, data: object) => putData(`${ENDPOINTS.evaluations}/${id}/score`, data),
  // delete: (id: number) => deleteData(`${ENDPOINTS.evaluations}/${id}`),
  yearAverageAndPassToNextClass: (class_id: number) => postData(ENDPOINTS.supervisorsYearAverages, { class_id }),
  yearAverageAndPassToNextClassByStudent: (class_id: number, student_id: number) => postData(ENDPOINTS.supervisorsYearAveragesByStudent, { class_id, student_id }),
};

const missingsAPI = {
  recordMissing: (data: object) => postData('/missings', data),
  getMissingsAllClassBySemester: () => getData(`/missings/all-classes`),
  getMissingsByClass: (classId: number) => getData(`/missings/class/${classId}`),
  getMissingsByUser: (userId: number) => getData(`/missings/user/${userId}`),
  getMissingsBySubject: (subjectId: number) => getData(`/missings/subject/${subjectId}`),
  getMissingsByDate: (date: string) => getData(`/missings/date/${date}`),

  // Teacher
  getMissingStudents: () => postData('/teachers/messings'),

   // Parent
   getMissingChildreen: () => postData('/parents/messings'),

};

const latesAPI = {
  recordLate: (data: object) => postData('/lates', data),
  getLatesAllClassBySemester: () => getData(`/lates/all-classes`),
  getLatesByClass: (classId: number) => getData(`/lates/class/${classId}`),
  getLatesByUser: (userId: number) => getData(`/lates/user/${userId}`),
  getLatesBySubject: (subjectId: number) => getData(`/lates/subject/${subjectId}`),
  getLatesByDate: (date: string) => getData(`/lates/date/${date}`),
};

const teacherAPI = {
  myClasses: () => postData(`/teachers/classes`),
  getLatesAllClassBySemester: () => getData(`/lates/all-classes`),
  getLatesByClass: (classId: number) => getData(`/lates/class/${classId}`),
  getLatesByUser: (userId: number) => getData(`/lates/user/${userId}`),
  getLatesBySubject: (subjectId: number) => getData(`/lates/subject/${subjectId}`),
  getLatesByDate: (date: string) => getData(`/lates/date/${date}`),
  addStudentMark: (data: object) => postData('/teachers/addMark', data),
  getStudentMark: (data: object) => postData('/teachers/getMark', data),
  mySchedules: () => postData('/teachers/schedules'),
};


const parentAPI = {
  childrenSchedules: () => postData(`/parents/schedules`),
  childrenMessings: () => postData(`/parents/messings/subject`),
  childrenLates: () => postData(`/parents/lates/subject`),
  getChildPayment: () => getData(`/parents/childreen/payment`),
  getChildBulletinBySemester: (semester: number) => getData(`/parents/averages/${semester}`),
};


const studentAPI = {
  mySchedules: () => postData(`/students/schedules`),
  myMissings: () => postData(`/students/messings`),
  myLates: () => postData(`/students/lates/subject`),
  myPayment: () => getData(`/students/student/payment`),
  myGrades: (semester: number, params?: object) => getData(`students/evaluations/semester/${semester}`, params),
  getBulletinBySemester: (semester: number) => getData(`/students/averages/${semester}`),

};

const superAdminAPI = {
  addNewSchool: (data: object) => postData('/setup-new-school', data),
  allSchool: () => getData(`/all-school`),
  toggleSchoolStatus: (id: number) => patchData(`/schools/${id}/toggle-status`),
};

export {
  api,
  getData,
  postData,
  putData,
  patchData,
  deleteData,
  ENDPOINTS,
  API_BASE_URL,
  authAPI,
  managerAPI,
  employeeAPI,
  adminSupervisorsAPI,
  adminSubjectsAPI,
  adminLevelsAPI,
  adminClassesAPI,
  adminClassSubjectAPI,
  adminSchedulesAPI,
  adminParentsAPI,
  evaluationAPI,
  adminBulletinsAPI,

  // SUPERVISOR
  supervisorAPI,
  missingsAPI,
  latesAPI,
  teacherAPI,
  parentAPI,
  studentAPI,
  superAdminAPI
};