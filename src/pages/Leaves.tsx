import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { managerAPI } from '../services/api/AppApi';
import {
  Calendar, Plus, Check, X, Clock, Filter, Search,
  Users, CheckCircle, XCircle, AlertCircle, Loader2, FileText
} from 'lucide-react';
import { LeaveRequest } from '../types';
import { toast } from 'react-toastify';

interface ApiLeave {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    leave_balance: number;
    department: {
      id: number;
      name: string;
      description: string;
    }
  };
}

export const Leaves = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    leaveId: string | null;
    action: 'approve' | 'reject' | null;
    employeeName: string;
  }>({
    isOpen: false,
    leaveId: null,
    action: null,
    employeeName: ''
  });

  const isAdmin = ['rh', 'manager'].includes(user?.role || '');

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await managerAPI.getRequestedLeaves(currentPage, 10);

        if (response.data.success && response.data?.leaves) {
          const mappedLeaves: LeaveRequest[] = response.data.leaves.data.map((item: ApiLeave) => ({
            id: item.id.toString(),
            userId: item.user_id.toString(),
            dateDebut: item.start_date,
            dateFin: item.end_date,
            motif: item.reason,
            status: item.status === 'pending' ? 'en-attente' :
                    item.status === 'approved' ? 'approuve' : 'refuse',
            nbJours: Math.ceil(
              (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 3600 * 24)
            ) + 1,
            createdAt: item.created_at,
            type: item.reason.toLowerCase().includes('permission') ? 'permission' :
                  item.reason.toLowerCase().includes('jour off') ? 'jour-off' : 'conge',
            user: {
              id: item.user.id.toString(),
              first_name: item.user.first_name,
              last_name: item.user.last_name,
              poste: item.user.department.name,
              avatar: null,
              soldeConges: item.user.leave_balance,
            }
          }));

          setLeaves(mappedLeaves);
          setTotalPages(response.data.leaves.last_page || 1);
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Erreur lors du chargement des demandes';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [currentPage]);

  const filteredLeaves = leaves
    .filter(leave => {
      if (!isAdmin) {
        return leave.userId === user?.id;
      }
      const employeeName = `${leave.user?.first_name || ''} ${leave.user?.last_name || ''}`.toLowerCase();
      const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingLeaves = filteredLeaves.filter(l => l.status === 'en-attente');

  const openConfirmModal = (leaveId: string, action: 'approve' | 'reject', employeeName: string) => {
    setConfirmModal({ isOpen: true, leaveId, action, employeeName });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, leaveId: null, action: null, employeeName: '' });
  };

  const executeAction = async () => {
    if (!confirmModal.leaveId || !confirmModal.action) return;

    try {
      setActionLoading(true);

      if (confirmModal.action === 'approve') {
        await managerAPI.approveLeave(parseInt(confirmModal.leaveId));
        setLeaves(prev =>
          prev.map(l => l.id === confirmModal.leaveId ? { ...l, status: 'approuve' } : l)
        );
        toast.success(`Demande de ${confirmModal.employeeName} approuvée !`);
      } else {
        await managerAPI.rejectLeave(parseInt(confirmModal.leaveId));
        setLeaves(prev =>
          prev.map(l => l.id === confirmModal.leaveId ? { ...l, status: 'refuse' } : l)
        );
        toast.error(`Demande de ${confirmModal.employeeName} refusée`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
      closeConfirmModal();
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; label: string; icon: any }> = {
      'en-attente': { color: 'text-orange-600', bg: 'bg-orange-50', label: 'En attente', icon: Clock },
      'approuve': { color: 'text-green-600', bg: 'bg-green-50', label: 'Approuvé', icon: Check },
      'refuse': { color: 'text-red-600', bg: 'bg-red-50', label: 'Refusé', icon: X },
    };
    return configs[status] || configs['en-attente'];
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'conge': 'Congé',
      'permission': 'Permission',
      'jour-off': 'Jour Off',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'conge': 'bg-blue-100 text-blue-700',
      'permission': 'bg-purple-100 text-purple-700',
      'jour-off': 'bg-cyan-100 text-cyan-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const totalEmployees = leaves.reduce((acc, leave) => {
    const userId = leave.userId;
    return acc.includes(userId) ? acc : [...acc, userId];
  }, [] as string[]).length;

  const approvedToday = leaves.filter(l =>
    l.status === 'approuve' &&
    new Date(l.dateDebut).toDateString() === new Date().toDateString()
  ).length;

  const adminStats = [
    {
      title: 'En congés',
      value: (totalEmployees || 0) - approvedToday,
      icon: CheckCircle,
      trend: { value: `${Math.round(((totalEmployees || 0) - approvedToday) / (totalEmployees || 1) * 100)}% taux`, isPositive: true },
      variant: 'success' as const,
    },
    {
      title: 'Demandes Totales',
      value: totalEmployees || 0,
      icon: Users,
      trend: { value: '+5 ce mois', isPositive: true },
      variant: 'default' as const,
    },
    {
      title: 'Demandes en attente',
      value: pendingLeaves.length,
      icon: AlertCircle,
      variant: 'warning' as const,
    },
    {
      title: 'Demandes Refusés',
      value: approvedToday,
      icon: XCircle,
      trend: { value: '-2 vs hier', isPositive: false },
      variant: 'destructive' as const,
    },
  ];

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* === HEADER === */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Congés</h1>
              <p className="text-gray-600">Gérez les demandes de congés</p>
            </div>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-lg transform hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nouvelle demande</span>
            </button>
          )}
        </div>

        {/* === SOLDE EMPLOYÉ === */}
        {!isAdmin && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Solde de congés</p>
                  <p className="text-4xl font-bold text-gray-900">{user?.soldeConges || 0}</p>
                  <p className="text-sm text-gray-600">jours restants</p>
                </div>
              </div>
              <div className="text-right">
                <div className="space-y-2">
                  <div className="bg-white rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-600">En attente</p>
                    <p className="text-lg font-bold text-orange-600">
                      {leaves.filter(l => l.userId === user?.id && l.status === 'en-attente').length}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-600">Approuvés</p>
                    <p className="text-lg font-bold text-green-600">
                      {leaves.filter(l => l.userId === user?.id && l.status === 'approuve').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === STATISTIQUES ADMIN === */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStats.map((stat, index) => {
              const Icon = stat.icon;
              const trendColor = stat.trend?.isPositive ? 'text-green-600' : 'text-red-600';
              const bgGradient =
                stat.variant === 'default' ? 'from-blue-50 to-blue-100' :
                stat.variant === 'success' ? 'from-green-50 to-green-100' :
                stat.variant === 'destructive' ? 'from-red-50 to-red-100' :
                'from-orange-50 to-orange-100';

              const iconBg =
                stat.variant === 'default' ? 'bg-blue-200' :
                stat.variant === 'success' ? 'bg-green-200' :
                stat.variant === 'destructive' ? 'bg-red-200' :
                'bg-orange-200';

              const iconColor =
                stat.variant === 'default' ? 'text-blue-700' :
                stat.variant === 'success' ? 'text-green-700' :
                stat.variant === 'destructive' ? 'text-red-700' :
                'text-orange-700';

              const borderColor =
                stat.variant === 'default' ? 'border-blue-200' :
                stat.variant === 'success' ? 'border-emerald-200' :
                stat.variant === 'destructive' ? 'border-rose-200' :
                'border-amber-200';

              return (
                <div
                  key={index}
                  className={`
                    group relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} p-5
                    border ${borderColor} hover:shadow-xl hover:scale-[1.02]
                    transition-all duration-300 cursor-default
                  `}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
                    <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.trend && (
                      <p className={`text-sm font-medium ${trendColor} flex items-center space-x-1`}>
                        <span>{stat.trend.value}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* === CONTENU PRINCIPAL === */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en-attente">En attente</option>
                  <option value="approuve">Approuvés</option>
                  <option value="refuse">Refusés</option>
                </select>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
              <p className="text-gray-500">Chargement des demandes...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-300" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {filteredLeaves.map((leave) => {
                const employee = leave.user;
                const statusConfig = getStatusConfig(leave.status);
                const StatusIcon = statusConfig.icon;
                const employeeName = `${employee?.first_name} ${employee?.last_name}`;

                return (
                  <div key={leave.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        {isAdmin && employee ? (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </div>
                        ) : null}
                        <div className="flex-1">
                          {isAdmin && employee && (
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-bold text-gray-900">{employee.first_name} {employee.last_name}</p>
                              <span className="text-xs text-gray-500">({employee.poste || 'Employé'})</span>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getTypeColor(leave.type)}`}>
                              {getTypeLabel(leave.type)}
                            </span>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} flex items-center space-x-1`}>
                              <StatusIcon className="w-3 h-3" />
                              <span>{statusConfig.label}</span>
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{leave.motif}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Du {new Date(leave.dateDebut).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Au {new Date(leave.dateFin).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="font-semibold text-blue-600">
                              {leave.nbJours} jour{leave.nbJours > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isAdmin && leave.status === 'en-attente' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openConfirmModal(leave.id, 'approve', employeeName)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md"
                          >
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Approuver</span>
                          </button>
                          <button
                            onClick={() => openConfirmModal(leave.id, 'reject', employeeName)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md"
                          >
                            <X className="w-4 h-4" />
                            <span className="text-sm font-medium">Refuser</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredLeaves.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Aucune demande trouvée</p>
                </div>
              )}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>

        {/* === MODAL NOUVELLE DEMANDE === */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slideUp">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nouvelle demande</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de demande</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option value="conge">Congé</option>
                    <option value="permission">Permission</option>
                    <option value="jour-off">Jour Off</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motif</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="Décrivez la raison de votre demande..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.success('Demande envoyée avec succès !');
                      setShowModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === MODAL DE CONFIRMATION === */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
              <div className="flex items-center gap-4 mb-6">
                {confirmModal.action === 'approve' ? (
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {confirmModal.action === 'approve' ? 'Approuver' : 'Refuser'} la demande
                  </h3>
                  <p className="text-gray-600">de <strong>{confirmModal.employeeName}</strong></p>
                </div>
              </div>

              <p className="text-gray-600 mb-8">
                Êtes-vous sûr de vouloir <strong>{confirmModal.action === 'approve' ? 'approuver' : 'refuser'}</strong> cette demande de congé ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeConfirmModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={executeAction}
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold flex items-center justify-center gap-2 ${
                    confirmModal.action === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : confirmModal.action === 'approve' ? 'Approuver' : 'Refuser'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === ANIMATIONS (identiques à Permission) === */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};