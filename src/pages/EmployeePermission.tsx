import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Clock,
  Check,
  X,
  Filter,
  AlertCircle,
  Clock3,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { employeeAPI } from '../services/api/AppApi';
import Swal from 'sweetalert2';
import LoadingOverlay from '../common/LoadingOverlay';

interface MyPermission {
  id: number;
  user_id: number;
  type: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  approver: { first_name: string } | null;
}

export const EmployeePermission = () => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Filtre par mois
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  const [permissions, setPermissions] = useState<MyPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    reason: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const isFormValid =
    formData.type !== '' &&
    formData.start_date !== '' &&
    formData.reason.trim().length >= 5 &&
    (!formData.end_date || formData.end_date >= formData.start_date);

  useEffect(() => {
    fetchMyPermissions();
  }, []);

  const fetchMyPermissions = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getMyPermissions();

      if (response.data?.success && Array.isArray(response.data.permissions)) {
        setPermissions(response.data.permissions);
        setError(null);
      } else {
        setError('Données invalides reçues de l\'API');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de vos permissions');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage combiné : statut + mois
  const filteredPermissions = permissions
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .filter(p => p.start_date.slice(0, 7) === selectedMonth);

  const formatMonthLabel = (yyyyMm: string) => {
    const date = new Date(yyyyMm + '-01');
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Check, label: 'Approuvée' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: X, label: 'Refusée' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'late': return <Clock3 className="w-4 h-4" />;
      case 'early_leave': return <Calendar className="w-4 h-4" />;
      case 'messing': return <MessageSquare className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'late': return 'Retard';
      case 'early_leave': return 'Départ anticipé';
      case 'messing': return 'Absence courte';
      default: return 'Autre';
    }
  };

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return '--:--';
    return time.slice(0, 5);
  };

  const calculateDuration = (start: string | null, end: string | null): string => {
    if (!start || !end) return 'Journée entière';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    if ([sh, sm, eh, em].some(isNaN)) return 'Invalide';
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return '0 min';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
  };

  const handleSubmitPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);

    try {
      await employeeAPI.requestPermission({
        type: formData.type as 'late' | 'early_leave' | 'messing',
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        reason: formData.reason.trim(),
      });

      await fetchMyPermissions();

      setShowNewRequest(false);
      setFormData({
        type: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        reason: '',
      });

      Swal.fire({
        icon: 'success',
        title: 'Demande envoyée !',
        text: 'Votre demande de permission a été transmise avec succès.',
        confirmButtonText: 'Compris',
        confirmButtonColor: '#3B82F6',
      });
    } catch (err: any) {
      console.error('Erreur envoi demande:', err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.errors?.[0] ||
                          'Une erreur est survenue lors de l\'envoi de votre demande.';

      Swal.fire({
        icon: 'error',
        title: 'Échec de l\'envoi',
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

      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Permissions</h1>
              <p className="text-gray-600">Suivi de vos demandes d'autorisation</p>
            </div>
          </div>

          <button
            onClick={() => setShowNewRequest(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nouvelle demande
          </button>
        </div>

        {/* Liste des permissions */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {loading
                ? 'Chargement...'
                : `${filteredPermissions.length} demande(s) — ${formatMonthLabel(selectedMonth)}`}
            </h2>

            {/* Filtres alignés horizontalement : Mois + Statut */}
            <div className="flex items-center gap-4">
              {/* Filtre par mois */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer text-sm"
                />
              </div>

              {/* Filtre par statut */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvées</option>
                  <option value="rejected">Refusées</option>
                </select>
              </div>
            </div>
          </div>

          {/* Le reste du JSX reste 100% identique */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-2 border-gray-200 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-64 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mt-2" />
                </div>
              ))}
            </div>
          ) : filteredPermissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Aucune demande de permission pour {formatMonthLabel(selectedMonth)}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPermissions.map((permission) => {
                const statusBadge = getStatusBadge(permission.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <div
                    key={permission.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {getTypeIcon(permission.type)}
                              {getTypeLabel(permission.type)}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                          </div>

                          <p className="font-semibold text-gray-900 text-lg">
                            {new Date(permission.start_date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                            {permission.end_date && permission.end_date !== permission.start_date && (
                              <> → {new Date(permission.end_date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}</>
                            )}
                          </p>
                          <p className="text-gray-600 mt-2">{permission.reason}</p>
                        </div>
                      </div>
                    </div>

                    {(permission.start_time || permission.end_time) && (
                      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200 text-sm">
                        <div>
                          <span className="text-gray-500">Début</span>
                          <p className="font-medium text-gray-900">{formatTime(permission.start_time)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Fin</span>
                          <p className="font-medium text-gray-900">{formatTime(permission.end_time)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Durée</span>
                          <p className="font-medium text-gray-900">
                            {calculateDuration(permission.start_time, permission.end_time)}
                          </p>
                        </div>
                      </div>
                    )}

                    {permission.approver && (
                      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                        {permission.status === 'approved' ? 'Approuvée' : 'Refusée'} par{' '}
                        <span className="font-medium text-gray-900">
                          {permission.approver.first_name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Nouvelle demande - inchangée */}
        {showNewRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Nouvelle Demande de Permission
              </h3>

              <form onSubmit={handleSubmitPermission} className="space-y-5">
                {/* ... tout le formulaire identique ... */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de permission <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    required
                  >
                    <option value="" disabled>Sélectionner un type</option>
                    <option value="late">Retard</option>
                    <option value="messing">Absence courte</option>
                    <option value="early_leave">Départ anticipé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    min={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optionnel – laisser vide si même jour</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heure de début</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heure de fin</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none"
                    placeholder="Expliquez clairement la raison de votre demande..."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewRequest(false);
                      setFormData({
                        type: '',
                        start_date: '',
                        end_date: '',
                        start_time: '',
                        end_time: '',
                        reason: '',
                      });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-red-100 hover:text-red-700 transition-all duration-200"
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
                    {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }

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