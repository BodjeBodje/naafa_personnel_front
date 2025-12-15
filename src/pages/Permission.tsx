import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Check,
  X,
  Clock,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { managerAPI } from '../services/api/AppApi';
import LoadingOverlay from '../common/LoadingOverlay';
import { toast } from 'react-toastify';

interface Permission {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: number | null;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    poste?: string;
    department: {
      id: number;
      name: string;
    }
  };
  approver: {
    first_name: string;
  } | null;
}

export const Permission = () => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    permissionId: number | null;
    action: 'approve' | 'reject' | null;
  }>({
    isOpen: false,
    permissionId: null,
    action: null,
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const response = await managerAPI.employeePermissions();

        if (response.data && response.data.permissions) {
          setPermissions(response.data.permissions);
          setError(null);
        } else {
          setError('Données invalides reçues de l\'API');
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Erreur lors du chargement des permissions';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const openConfirmModal = (permissionId: number, action: 'approve' | 'reject') => {
    setConfirmModal({ isOpen: true, permissionId, action });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, permissionId: null, action: null });
  };

  const executeAction = async () => {
    if (!confirmModal.permissionId || !confirmModal.action) return;

    const { permissionId, action } = confirmModal;

    try {
      setActionLoading(true);

      if (action === 'approve') {
        await managerAPI.approvePermission(permissionId);
        setPermissions(prev =>
          prev.map(p =>
            p.id === permissionId
              ? { ...p, status: 'approved' as const, approved_by: user?.id || null }
              : p
          )
        );
        toast.success('Demande approuvée avec succès !');
      } else {
        await managerAPI.rejectPermission(permissionId);
        setPermissions(prev =>
          prev.map(p =>
            p.id === permissionId
              ? { ...p, status: 'rejected' as const, approved_by: user?.id || null }
              : p
          )
        );
        toast.error('Demande refusée');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || `Erreur lors de ${action === 'approve' ? 'l\'approbation' : 'du refus'}`;
      toast.error(msg);
    } finally {
      setActionLoading(false);
      closeConfirmModal();
    }
  };

  const filteredPermissions = permissions.filter(
    p => filterStatus === 'all' || p.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Check, label: 'Approuvé' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: X, label: 'Refusé' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return '--:--';
    return time.slice(0, 5);
  };

  const calculateDuration = (start: string | null | undefined, end: string | null | undefined): string => {
    if (!start || !end) return 'N/A';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    if ([sh, sm, eh, em].some(isNaN)) return 'Invalide';
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return '0 min';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
  };

  return (
    <>
      <LoadingOverlay loading={actionLoading} />

      <div className="space-y-6 animate-fadeIn">
        {/* Header + Bouton nouvelle demande */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Permissions</h1>
              <p className="text-gray-600">Demandes d'absences courtes et autorisations</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewRequest(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Permission
          </button>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          {/* Filtres */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {loading ? 'Chargement...' : `${filteredPermissions.length} demande(s)`}
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Refusé</option>
              </select>
            </div>
          </div>

          {/* Erreur globale */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Contenu */}
          {loading ? (
            // Skeleton
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-2 border-gray-200 rounded-xl p-6 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                      <div>
                        <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-9 w-24 bg-gray-200 rounded-lg" />
                      <div className="h-9 w-24 bg-gray-200 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPermissions.map((permission) => {
                const employee = permission.user;
                const statusBadge = getStatusBadge(permission.status);
                const StatusIcon = statusBadge.icon;
                const isPending = permission.status === 'pending';

                return (
                  <div
                    key={permission.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    {/* En-tête */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow">
                          {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                        </div>
                        <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <p className="font-bold text-gray-900">{employee.first_name} {employee.last_name}</p>
                            <span className="text-xs text-gray-500">({employee.department.name  || 'Employé'})</span>
                          </div>
                          {/* <p className="text-sm text-gray-500">({employee.department.name || 'Poste non défini'}) </p> */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{permission.reason}</p>
                        </div>
                      </div>

                      {/* Boutons */}
                      <div className="flex gap-2">
                        <button
                          disabled={!isPending}
                          onClick={() => openConfirmModal(permission.id, 'approve')}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            isPending
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          Approuver
                        </button>
                        <button
                          disabled={!isPending}
                          onClick={() => openConfirmModal(permission.id, 'reject')}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            isPending
                              ? 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <X className="w-4 h-4" />
                          Refuser
                        </button>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(permission.start_date).toLocaleDateString('fr-FR')}
                          {permission.end_date !== permission.start_date && (
                            <> → {new Date(permission.end_date).toLocaleDateString('fr-FR')}</>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Début</p>
                        <p className="font-semibold text-gray-900">{formatTime(permission.start_time)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fin</p>
                        <p className="font-semibold text-gray-900">{formatTime(permission.end_time)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Durée</p>
                        <p className="font-semibold text-gray-900">
                          {calculateDuration(permission.start_time, permission.end_time)}
                        </p>
                      </div>
                    </div>

                    {permission.approver && (
                      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                        {permission.status === 'approved' ? 'Approuvé' : 'Refusé'} par {permission.approver.first_name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Vide */}
          {!loading && filteredPermissions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune demande de permission pour le moment</p>
            </div>
          )}
        </div>

        {/* Modal nouvelle demande (inchangé) */}
        {showNewRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle Demande de Permission</h3>
              {/* ... ton formulaire existant ... */}
            </div>
          </div>
        )}

        {/* Modal de confirmation */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slideUp">
              <div className="flex items-center gap-3 mb-4">
                {confirmModal.action === 'approve' ? (
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-7 h-7 text-red-600" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {confirmModal.action === 'approve' ? 'Approuver' : 'Refuser'} la demande
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir <strong>{confirmModal.action === 'approve' ? 'approuver' : 'refuser'}</strong> cette demande ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeConfirmModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={executeAction}
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all ${
                    confirmModal.action === 'approve'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {actionLoading ? 'Traitement...' : confirmModal.action === 'approve' ? 'Approuver' : 'Refuser'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Animations */}
        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
          @keyframes slideUp { from { opacity: 0; transform: translateY(100px); } to { opacity: 1; transform: translateY(0); } }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      </div>
    </>
  );
};