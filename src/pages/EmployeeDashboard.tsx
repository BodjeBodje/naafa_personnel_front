import { Users, Clock, Calendar, TrendingUp, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers, mockAttendance, mockLeaveRequests } from '../data/mockData';

export const EmployeeDashboard = () => {
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = mockAttendance.filter(a => a.date === today);

  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const lateCount = todayAttendance.filter(a => a.status === 'retard').length;
  const absentCount = mockUsers.length - todayAttendance.length;

  const pendingLeaves = mockLeaveRequests.filter(r => r.status === 'en-attente').length;

  const stats = [
    {
      label: 'Présents',
      value: presentCount,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    },
    {
      label: 'En retard',
      value: lateCount,
      icon: AlertCircle,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      label: 'Absents',
      value: absentCount,
      icon: XCircle,
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    {
      label: 'Demandes en attente',
      value: pendingLeaves,
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
  ];

  const recentActivity = todayAttendance.slice(0, 5).map(att => {
    const employee = mockUsers.find(u => u.id === att.userId);
    return { ...att, employee };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bonjour, {user?.first_name} 👋
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
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Activité Récente</h2>
          </div>

          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow">
                      {activity.employee?.first_name.charAt(0)}{activity.employee?.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {activity.employee?.first_name} {activity.employee?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{activity.employee?.poste}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      activity.status === 'present' ? 'text-emerald-600' : 'text-orange-600'
                    }`}>
                      {activity.checkIn}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.status === 'retard' ? 'En retard' : 'À l\'heure'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune activité récente</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Demandes en Attente</h2>
          </div>

          <div className="space-y-3">
            {mockLeaveRequests.filter(r => r.status === 'en-attente').slice(0, 5).map((request) => {
              const employee = mockUsers.find(u => u.id === request.userId);
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold shadow">
                      {employee?.first_name.charAt(0)}{employee?.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {employee?.first_name} {employee?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.type === 'conge' ? 'Congé' : request.type === 'permission' ? 'Permission' : 'Jour Off'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(request.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      En attente
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
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
}
