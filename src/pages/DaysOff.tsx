import { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  User,
  Building,
  AlertCircle,
  X,
  CheckCircle,
  Edit2,
} from 'lucide-react';
import Select from 'react-select';
import { useAuth } from '../contexts/AuthContext';
import { managerAPI } from '../services/api/AppApi';
import LoadingOverlay from '../common/LoadingOverlay';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface EmployeeOption {
  value: number;
  label: string;
  employee: any;
}

interface DayOff {
  id: number;
  user_id: number;
  day_off_date: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    department: { id: number; name: string } | null;
  };
}

export const DaysOff = () => {
  const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // États pour le modal de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dayOffToDelete, setDayOffToDelete] = useState<DayOff | null>(null);

  // Form state
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeOption[]>([]);
  const [dayOffDate, setDayOffDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { user } = useAuth();

  // Charger les jours de repos
  useEffect(() => {
    const fetchDayOffs = async () => {
      try {
        setLoading(true);
        const response = await managerAPI.getEmployeeDayOff();
        if (response.data && Array.isArray(response.data)) {
          setDayOffs(response.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchDayOffs();
  }, []);

  // Charger les employés au besoin
  useEffect(() => {
    if (showAddModal && employees.length === 0) {
      const fetchEmployees = async () => {
        try {
          const response = await managerAPI.employeeListForDayOff();
          if (response.data?.data) {
            const options: EmployeeOption[] = response.data.data
              .filter((emp: any) => emp.role === 'employee')
              .map((emp: any) => ({
                value: emp.id,
                label: `${emp.first_name} ${emp.last_name} (${emp.email})`,
                employee: emp,
              }));
            setEmployees(options);
          }
        } catch (err) {
          console.error("Erreur chargement employés", err);
        }
      };
      fetchEmployees();
    }
  }, [showAddModal]);

  const openAddModal = () => {
    setSelectedEmployees([]);
    setDayOffDate('');
    setFormError(null);
    setSuccessMessage(null);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
  };

  // Ouvrir le modal de confirmation de suppression
  const openDeleteModal = (dayOff: DayOff) => {
    setDayOffToDelete(dayOff);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDayOffToDelete(null);
  };

  // Suppression confirmée
  const confirmDelete = async () => {
    if (!dayOffToDelete) return;

    setDeleting(true);
    try {
      await managerAPI.deleteEmployeeDayOff(dayOffToDelete.id);
      setDayOffs(prev => prev.filter(d => d.id !== dayOffToDelete.id));

      toast.success(
        `Jour de repos du ${formatDate(dayOffToDelete.day_off_date)} supprimé pour ${dayOffToDelete.user.first_name} ${dayOffToDelete.user.last_name}`,
        { autoClose: 4000 }
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
      closeDeleteModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (selectedEmployees.length === 0 || !dayOffDate) {
      setFormError('Veuillez sélectionner au moins un employé et une date');
      return;
    }

    setSaving(true);

    try {
      const promises = selectedEmployees.map(emp =>
        managerAPI.addNewDayOff({
          user_id: emp.value,
          day_off_date: dayOffDate,
        })
      );

      const results = await Promise.allSettled(promises);

      const failed: string[] = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const empName = selectedEmployees[index].label.split(' (')[0];
          failed.push(empName);
        }
      });

      const response = await managerAPI.getEmployeeDayOff();
      if (response.data && Array.isArray(response.data)) {
        setDayOffs(response.data);
      }

      if (failed.length === 0) {
        setSuccessMessage(`Jour de repos ajouté pour ${selectedEmployees.length} employé(s)`);
        toast.success(`Jours de repos ajoutés avec succès !`, { autoClose: 3000 });
        setTimeout(() => closeModal(), 1500);
      } else {
        setFormError(`${failed.length} échec(s) : ${failed.join(', ')}`);
        toast.warn(`${failed.length} ajout(s) ont échoué`, { autoClose: 5000 });
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <>
      <LoadingOverlay loading={saving || deleting} />
      <ToastContainer />

      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jours de Repos</h1>
              <p className="text-gray-600">Attribuer un ou plusieurs jours de repos</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter des jours de repos
          </button>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            {/* <h2 className="text-xl font-bold text-gray-900">
              {loading ? 'Chargement...' : `${dayOffs.length} jour(s) programmé(s)`}
            </h2> */}
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Contenu */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : dayOffs.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun jour de repos enregistré</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employé</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Département</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dayOffs.map((dayOff) => {
                    const emp = dayOff.user;
                    return (
                      <tr key={dayOff.id} className="hover:bg-gray-50">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow">
                              {emp.first_name[0]}{emp.last_name[0]}
                            </div>
                            <div>
                              <p className="font-semibold">{emp.first_name} {emp.last_name}</p>
                              <p className="text-sm text-gray-500">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span>{emp.department?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{formatDate(dayOff.day_off_date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center flex justify-center gap-3">

                          <button

                            className="p-2 text-gray-400 cursor-not-allowed"
                            title="Modification non disponible"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => openDeleteModal(dayOff)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajout Multiple */}
      {showAddModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative overflow-y-auto max-h-screen">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Ajouter un jour de repos (plusieurs employés)
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Sélection des employés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employés <span className="text-red-500">*</span>
          </label>
          <Select
            isMulti
            options={employees}
            value={selectedEmployees}
            onChange={(options) => setSelectedEmployees(options as EmployeeOption[])}
            placeholder="Rechercher et sélectionner un ou plusieurs employés..."
            className="react-select-container"
            classNamePrefix="react-select"
            noOptionsMessage={() => "Aucun employé trouvé"}
            isLoading={showAddModal && employees.length === 0}
          />
          {selectedEmployees.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {selectedEmployees.length} employé(s) sélectionné(s)
            </p>
          )}
        </div>

        {/* Date du jour de repos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date du jour de repos <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={dayOffDate}
            onChange={(e) => setDayOffDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]} // Empêche les dates passées (optionnel)
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
          />
        </div>

        {/* Messages d’erreur dans le modal */}
        {formError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Message de succès dans le modal */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Boutons d’action */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || selectedEmployees.length === 0 || !dayOffDate}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>Ajouter pour {selectedEmployees.length} employé(s)</>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Modal de Confirmation de Suppression */}
      {showDeleteModal && dayOffToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirmer la suppression</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le jour de repos du{' '}
              <strong>{formatDate(dayOffToDelete.day_off_date)}</strong> pour{' '}
              <strong>
                {dayOffToDelete.user.first_name} {dayOffToDelete.user.last_name}
              </strong>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles React Select */}
      <style jsx global>{`
        .react-select__control {
          border: 2px solid #e5e7eb !important;
          border-radius: 0.75rem !important;
          padding: 0.375rem !important;
        }
        .react-select__control--is-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }
        .react-select__multi-value {
          background-color: #dbeafe !important;
        }
        .react-select__multi-value__label {
          color: #1e40af !important;
        }
      `}</style>
    </>
  );
};