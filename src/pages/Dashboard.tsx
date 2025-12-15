import { Users, Clock, Calendar, TrendingUp, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { managerAPI } from '../services/api/AppApi';
import { useState, useEffect } from 'react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  department?: { name: string };
}

interface Attendance {
  id: number;
  user_id: number;
  date: string;
  check_in: string;
  minutes_late: number;
  user: User;
}

interface LeaveRequest {
  id: number;
  user_id: number;
  type?: string;
  start_date: string;
  end_date?: string;
  user: User;
}

interface TodaySituation {
  success: boolean;
  attendances_today: Attendance[];
  pending_permissions: LeaveRequest[];
  pending_leaves: LeaveRequest[];
  statistics: {
    present: number;
    late: number;
    absent: number;
    total_pending_requests_today: number;
  };
}

export const Dashboard = () => {
  const { user } = useAuth();

  const [situation, setSituation] = useState<TodaySituation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTodaySituation = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await managerAPI.todaySituation();

        const data = result?.data || result;

        console.log('Données reçues :', data);

        if (data?.success === true) {
          setSituation(data);
        } else {
          setError('Réponse invalide de l\'API');
        }
      } catch (err: any) {
        console.error('Erreur API:', err);
        setError(err?.response?.data?.message || 'Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySituation();
  }, []);

  // Statistiques
  const presentCount = situation?.statistics.present || 0;
  const lateCount = situation?.statistics.late || 0;
  const absentCount = situation?.statistics.absent || 0;
  const pendingRequestsCount = situation?.statistics.total_pending_requests_today || 0;

  const stats = [
    {
      label: 'Présents',
      value: presentCount,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    {
      label: 'En retard',
      value: lateCount,
      icon: AlertCircle,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200',
    },
    {
      label: 'Absents',
      value: absentCount,
      icon: XCircle,
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    {
      label: 'Demandes en attente',
      value: pendingRequestsCount,
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
  ];

  const todayAttendances = situation?.attendances_today?.filter(a => a.date === today) || [];

  const allPendingRequests = [
    ...(situation?.pending_permissions || []),
    ...(situation?.pending_leaves || []),
  ].slice(0, 5);

  const formatRequestType = (type?: string) => {
    if (!type) return 'Permission';
    switch (type.toLowerCase()) {
      case 'conge': return 'Congé';
      case 'messing':
      case 'permission': return 'Permission';
      case 'jour-off': return 'Jour Off';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-500">Chargement du tableau de bord...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bonjour, {user?.first_name}
          </h1>
          <p className="text-gray-600">Voici un aperçu de la situation aujourd'hui</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Aujourd'hui</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} border-2 ${stat.borderColor} rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
              <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité Récente */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Activité Récente</h2>
          </div>

          <div className="space-y-3">
            {todayAttendances.length > 0 ? (
              todayAttendances.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow">
                      {activity.user.first_name.charAt(0)}{activity.user.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {activity.user.first_name} {activity.user.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.user.department?.name || 'Département non défini'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${activity.minutes_late > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {activity.check_in}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.minutes_late > 0 ? 'En retard' : "À l'heure"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune activité récente aujourd'hui</p>
            )}
          </div>
        </div>

        {/* Demandes en Attente */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Demandes en Attente</h2>
          </div>

          <div className="space-y-3">
            {allPendingRequests.length > 0 ? (
              allPendingRequests.map((request) => {
                const employee = request.user;
                const isMultiDay = request.end_date && request.start_date !== request.end_date;

                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold shadow">
                        {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {isMultiDay ? 'Congé' : formatRequestType(request.type)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(request.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        {isMultiDay && (
                          <> → {new Date(request.end_date!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</>
                        )}
                      </p>
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        En attente
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune demande en attente</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};