import { useState, useEffect, useRef } from 'react';
import {
  Users, Search, UserPlus, Edit2, Trash2, Phone, Mail, Calendar,
  Briefcase, X, Check, AlertCircle, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { managerAPI } from '../services/api/AppApi';
import LoadingOverlay from '../common/LoadingOverlay';

interface Department {
  id: number;
  name: string;
  description: string | null;
}

interface Shift {
  id: number;
  name: string;
  label: string;
  type: 'morning' | 'evening';
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number | null;
  role: string;
  shift: number | null;
  leave_balance: number;
  created_at: string;
  works_weekend?: boolean;
  department: { id: number; name: string } | null;
}

export const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [error, setError] = useState('');

  // Données
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [employeesError, setEmployeesError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);

  // Formulaire (works_weekend ajouté)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department_id: '',
    role: 'employee',
    shift: 0,
    works_weekend: false,     // ← Nouveau champ
  });

  const isFormValid = () => {
    return formData.first_name.trim() !== '' && formData.last_name.trim() !== '';
  };

  // Charger les départements
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await managerAPI.getAllDepartment();
        if (response.data?.success && Array.isArray(response.data.data)) {
          setDepartments(response.data.data);
        }
      } catch (err: any) {
        console.error('Erreur départements:', err);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  // Charger les shifts
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoadingShifts(true);
        const response = await managerAPI.employeeShifts();

        if (response.data?.success && Array.isArray(response.data.shifts)) {
          setShifts(response.data.shifts);
        } else {
          setShifts([]);
        }
      } catch (err) {
        console.error('Erreur chargement shifts:', err);
        setShifts([]);
      } finally {
        setLoadingShifts(false);
      }
    };
    fetchShifts();
  }, []);

  // Charger les employés
  const fetchEmployees = async (page = 1) => {
    try {
      setLoadingEmployees(true);
      setEmployeesError('');

      const response = await managerAPI.employeeList(page, 6);

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error('Structure de réponse invalide');
      }

      setEmployees(response.data.data);

      const pagination = response.data.pagination;
      if (pagination && typeof pagination === 'object') {
        setCurrentPage(pagination.current_page);
        setTotalPages(pagination.last_page);
        setTotalItems(pagination.total);
      }
    } catch (err: any) {
      setEmployeesError('Impossible de charger les employés');
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
  }, []);

  const handleEmployeeAdded = () => {
    fetchEmployees(currentPage);
  };

  // Fermeture modal
  useEffect(() => {
    if (!isModalOpen) setError('');
  }, [isModalOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && setIsModalOpen(false);
    if (isModalOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  // Filtrage
  const filteredUsers = employees.filter(user => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      user.first_name.toLowerCase().includes(search) ||
      user.last_name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search);
    const deptName = user.department?.name || 'Sans service';
    const matchesDepartment = selectedDepartment === 'all' || deptName === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
      rh: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'RH' },
      manager: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Manager' },
      employee: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Employé' },
    };
    return badges[role] || badges.employee;
  };

  const getShiftDisplay = (shiftId: number | null) => {
    if (!shiftId) return { name: 'Non défini', type: '' };
    const shift = shifts.find(s => s.id === shiftId);
    return shift ? { name: shift.name, type: shift.type } : { name: 'Inconnu', type: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setError('');
    setIsSubmitting(true);
    setShowLoadingOverlay(true);

    try {
      const payload = {
        ...formData,
        department_id: formData.department_id ? Number(formData.department_id) : null,
        shift: formData.shift ? Number(formData.shift) : null,
        works_weekend: formData.works_weekend,   // ← Envoi du nouveau champ
      };

      await managerAPI.addNewEmployee(payload);

      toast.success('Employé ajouté avec succès !');
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        department_id: '',
        role: 'employee',
        shift: 0,
        works_weekend: false,
      });
      handleEmployeeAdded();
      setIsModalOpen(false);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erreur lors de la création';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setShowLoadingOverlay(false);
    }
  };

  // Pagination (inchangée)
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchEmployees(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      pages.push(<button key={1} onClick={() => goToPage(1)} className="w-10 h-10 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">1</button>);
      if (start > 2) pages.push(<span key="start-ellipsis" className="px-2">...</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`w-10 h-10 rounded-lg font-medium transition-all ${i === currentPage ? 'bg-blue-600 text-white shadow-lg scale-110' : 'hover:bg-blue-50 hover:text-blue-600'}`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="end-ellipsis" className="px-2">...</span>);
      pages.push(<button key={totalPages} onClick={() => goToPage(totalPages)} className="w-10 h-10 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">{totalPages}</button>);
    }

    return pages;
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* En-tête + Bouton ajout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion du Personnel</h1>
              <p className="text-gray-600">Liste complète des employés</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Nouvel Employé
          </button>
        </div>

        {/* Filtres + Liste */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            >
              <option value="all">Tous les services</option>
              {[...new Set(employees.map(u => u.department?.name || 'Sans service'))]
                .filter(Boolean)
                .map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
            </select>
          </div>

          {loadingEmployees ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-gray-500 mt-2">Chargement des employés...</p>
            </div>
          ) : employeesError ? (
            <div className="text-center py-12 text-red-600">{employeesError}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => {
                  const badge = getRoleBadge(user.role);
                  const deptName = user.department?.name || 'Sans service';
                  const shiftInfo = getShiftDisplay(user.shift);
                  return (
                    <div
                      key={user.id}
                      className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">{user.email}</p>

                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text} mb-4`}>
                        {badge.label}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          <span>{deptName}</span>
                        </div>
                        {user.shift && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className={`font-medium ${shiftInfo.type === 'morning' ? 'text-emerald-700' : 'text-orange-700'}`}>
                              {shiftInfo.name}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span>{user.phone || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>Embauché le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Congés restants</span>
                          <span className="text-lg font-bold text-blue-600">{user.leave_balance} jours</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredUsers.length === 0 && !loadingEmployees && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun employé trouvé</p>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="text-sm text-gray-600">
                Affichage de {(currentPage - 1) * 6 + 1} à {Math.min(currentPage * 6, totalItems)} sur {totalItems} employés
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">{renderPageNumbers()}</div>
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL AJOUT EMPLOYÉ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div ref={modalRef} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-modalSlideUp">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Nouvel Employé</h2>
                    <p className="text-blue-100">Remplissez les informations ci-dessous</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Prénom & Nom */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" placeholder="Jean" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" placeholder="Dupont" />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Téléphone
                  </label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" placeholder="+221 77 123 45 67" />
                </div>

                {/* Service */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Service
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    disabled={loadingDepartments}
                  >
                    <option value="">Sélectionner un service</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Rôle */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Rôle <span className="text-red-500">*</span>
                  </label>
                  <select required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                    <option value="employee">Employé</option>
                    <option value="manager">Manager</option>
                    <option value="rh">RH</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Quart de travail */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Quart de travail
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value ? Number(e.target.value) : 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    disabled={loadingShifts}
                  >
                    <option value={0}>
                      {loadingShifts ? 'Chargement des quarts...' : 'Aucun quart'}
                    </option>

                    {!loadingShifts && shifts.length > 0 && (
                      <>
                        <optgroup label="Matin">
                          {shifts
                            .filter(s => s.type === 'morning')
                            .map(shift => (
                              <option key={shift.id} value={shift.id}>
                                {shift.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Soir">
                          {shifts
                            .filter(s => s.type === 'evening')
                            .map(shift => (
                              <option key={shift.id} value={shift.id}>
                                {shift.name}
                              </option>
                            ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                </div>

                {/* NOUVEAU : Travail le week-end */}
                <div className="col-span-1 md:col-span-2">
                  <label className="flex items-center gap-4 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.works_weekend}
                        onChange={(e) => setFormData({ ...formData, works_weekend: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-300 rounded-full shadow-inner transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-6 peer-checked:shadow-blue-300"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Travail le week-end</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formData.works_weekend
                          ? "Cet employé travaille le samedi (et éventuellement le dimanche)"
                          : "Pas de travail le week-end"}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl font-semibold hover:bg-red-50 hover:border-red-400 transition-all">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting || loadingShifts}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Envoi en cours...' : <><Check className="w-5 h-5" /> Ajouter</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoadingOverlay && <LoadingOverlay message="Ajout de l'employé en cours..." />}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-modalSlideUp { animation: modalSlideUp 0.4s ease-out; }
      `}</style>
    </>
  );
};

export default Employees;