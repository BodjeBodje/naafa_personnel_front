import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { employeeAPI } from '../services/api/AppApi';
import {
  Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle, Loader2, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import LoadingOverlay from '../common/LoadingOverlay';

interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  nbJours: number;
  created_at: string | null;
}

export const EmployeeLeaves = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
  });

  // Validation conforme à ton Validator Laravel
  const today = new Date().toISOString().split('T')[0];
  const isFormValid =
    formData.start_date !== '' &&
    formData.end_date !== '' &&
    formData.start_date >= today &&
    formData.end_date >= formData.start_date;

  // Calcul du nombre de jours (inclusif)
  const calculateDuration = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  useEffect(() => {
    if (user?.id) fetchMyLeaves();
  }, [user?.id]);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeeAPI.myLeave();

      if (response.data?.success && Array.isArray(response.data.leaves)) {
        const mapped: LeaveRequest[] = response.data.leaves.map((item: any) => {
          const start = new Date(item.start_date);
          const end = new Date(item.end_date);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const nbJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          return {
            id: item.id.toString(),
            start_date: item.start_date,
            end_date: item.end_date,

            status: item.status,
            nbJours,
            created_at: item.created_at,
          };
        });

        setLeaves(mapped);
      } else {
        setError('Données invalides reçues');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de vos congés');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedLeaves = [...leaves].sort(
    (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  );

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; label: string; icon: any }> = {
      pending: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'En attente', icon: Clock },
      approved: { color: 'text-green-600', bg: 'bg-green-50', label: 'Approuvé', icon: CheckCircle },
      rejected: { color: 'text-red-600', bg: 'bg-red-50', label: 'Refusé', icon: XCircle },
    };
    return configs[status] || configs.pending;
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);

    try {
      await employeeAPI.requestLeave({
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: 'Congé annuel',
      });

      await fetchMyLeaves();

      setShowModal(false);
      setFormData({ start_date: '', end_date: '' });

      Swal.fire({
        icon: 'success',
        title: 'Demande envoyée !',
        text: `Votre demande de congé du ${new Date(formData.start_date).toLocaleDateString('fr-FR')} au ${new Date(formData.end_date).toLocaleDateString('fr-FR')} (${calculateDuration()} jour${calculateDuration() > 1 ? 's' : ''}) a été transmise avec succès.`,
        confirmButtonText: 'Compris',
        confirmButtonColor: '#3B82F6',
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.start_date?.[0] ||
        err.response?.data?.errors?.end_date?.[0] ||
        'Une erreur est survenue lors de l’envoi de votre demande.';

      Swal.fire({
        icon: 'error',
        title: 'Échec de l’envoi',
        text: errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <LoadingOverlay loading={submitting} />

      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Congés</h1>
              <p className="text-gray-600">Suivez vos demandes de congés</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nouvelle demande
          </button>
        </div>

        {/* Liste des congés */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Chargement de vos congés...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-300" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Aucune demande de congé pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLeaves.map((leave) => {
                const statusConfig = getStatusConfig(leave.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={leave.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            <Calendar className="w-3 h-3" />
                            Congé
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </div>

                        <p className="font-semibold text-gray-900 text-lg">
                          Du {new Date(leave.start_date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })} → au {new Date(leave.end_date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>

                        <div className="flex items-center gap-6 mt-3 text-sm">
                          <span className="text-gray-600">
                            <strong className="text-blue-600">{leave.nbJours}</strong> jour{leave.nbJours > 1 ? 's' : ''}
                          </span>
                          {leave.reason && leave.reason.trim() && (
                            <span className="text-gray-500 italic">– {leave.reason}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Nouvelle demande */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Nouvelle Demande de Congé
              </h3>

              <form onSubmit={handleSubmitLeave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={formData.start_date || today}
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    required
                  />
                </div>

                {/* Affichage durée */}
                {formData.start_date && formData.end_date && isFormValid && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-5 py-4 text-center">
                    <p className="text-sm text-blue-600 font-medium">
                      Durée totale :
                      <span className="block text-2xl font-bold text-blue-700 mt-1">
                        {calculateDuration()} jour{calculateDuration() > 1 ? 's' : ''}
                      </span>
                    </p>
                  </div>
                )}

                {/* Erreur validation */}
                {formData.end_date && formData.end_date < (formData.start_date || today) && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-600">
                    La date de fin doit être postérieure ou égale à la date de début
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ start_date: '', end_date: '' });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-red-100 hover:text-red-700 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || submitting}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isFormValid && !submitting
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? 'Envoi...' : 'Envoyer la demande'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(100px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      </div>
    </>
  );
};