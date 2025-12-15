import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers, mockLeaveRequests } from '../data/mockData';
import {
  Calendar, Plus, Check, X, Clock, Filter, Search,
  Users, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { LeaveRequest } from '../types';

export const Leaves = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const isAdmin = ['rh', 'manager'].includes(user?.role || '');

  const filteredLeaves = mockLeaveRequests
    .filter(leave => {
      if (isAdmin) {
        const employee = mockUsers.find(u => u.id === leave.userId);
        const matchesSearch = employee &&
          `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;
        return matchesSearch && matchesStatus;
      } else {
        return leave.userId === user?.id;
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingLeaves = filteredLeaves.filter(l => l.status === 'en-attente');
  const approvedLeaves = filteredLeaves.filter(l => l.status === 'approuve');

  const handleApprove = (leaveId: string) => {
    alert(`Demande ${leaveId} approuvée`);
  };

  const handleReject = (leaveId: string) => {
    alert(`Demande ${leaveId} refusée`);
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

  // STATISTIQUES - DESIGN IDENTIQUE À L'IMAGE
  const adminStats = [
    {
      title: 'Personnel Total',
      value: mockUsers.length,
      icon: Users,
      trend: { value: '+5 ce mois', isPositive: true },
      variant: 'default' as const,
    },
    {
      title: 'Présents Aujourd\'hui',
      value: mockUsers.length - mockLeaveRequests.filter(l => l.status === 'approuve').length,
      icon: CheckCircle,
      trend: { value: '91% taux', isPositive: true },
      variant: 'success' as const,
    },
    {
      title: 'Absences',
      value: mockLeaveRequests.filter(l => l.status === 'approuve').length,
      icon: XCircle,
      trend: { value: '-2 vs hier', isPositive: false },
      variant: 'destructive' as const,
    },
    {
      title: 'Demandes en attente',
      value: pendingLeaves.length,
      icon: AlertCircle,
      variant: 'warning' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Congés & Permissions</h2>
          <p className="text-gray-600 mt-1">Gérez vos demandes d'absence</p>
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

      {/* Solde pour employé */}
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
                    {mockLeaveRequests.filter(l => l.userId === user?.id && l.status === 'en-attente').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-600">Approuvés</p>
                  <p className="text-lg font-bold text-green-600">
                    {mockLeaveRequests.filter(l => l.userId === user?.id && l.status === 'approuve').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATISTIQUES ADMIN - DESIGN FIDÈLE À L'IMAGE + ANIMATIONS */}
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

            return (
              <div
                key={index}
                className={`
                  group relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} p-5
                  border border-transparent hover:shadow-xl hover:scale-[1.02]
                  transition-all duration-300 cursor-default
                `}
              >
                {/* Effet de lumière au survol */}
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
                      {stat.trend.isPositive ? (
                        <span className="text-xs">Up</span>
                      ) : (
                        <span className="text-xs">Down</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Liste des demandes */}
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

        <div className="space-y-4">
          {filteredLeaves.map((leave) => {
            const employee = mockUsers.find(u => u.id === leave.userId);
            const statusConfig = getStatusConfig(leave.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={leave.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    {isAdmin && employee ? (
                      employee.avatar ? (
                        <img src={employee.avatar} alt={employee.first_name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {employee.first_name[0]}{employee.last_name[0]}
                        </div>
                      )
                    ) : null}
                    <div className="flex-1">
                      {isAdmin && employee && (
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-bold text-gray-900">{employee.first_name} {employee.last_name}</p>
                          <span className="text-xs text-gray-500">({employee.poste})</span>
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
                        onClick={() => handleApprove(leave.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Approuver</span>
                      </button>
                      <button
                        onClick={() => handleReject(leave.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
      </div>

      {/* Modal Nouvelle Demande */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
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
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
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
                    alert('Demande envoyée avec succès');
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
    </div>
  );
};