import { useAuth } from '../contexts/AuthContext';
import { mockAttendance, mockLeaveRequests } from '../data/mockData';
import { User, Mail, Phone, Briefcase, Calendar, MapPin, Edit, Key, Bell } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  const userAttendance = mockAttendance.filter(a => a.userId === user?.id);
  const userLeaves = mockLeaveRequests.filter(r => r.userId === user?.id);
  const approvedLeaves = userLeaves.filter(r => r.status === 'approuve').length;
  const pendingLeaves = userLeaves.filter(r => r.status === 'en-attente').length;

  const presentDays = userAttendance.filter(a => a.status === 'present').length;
  const lateDays = userAttendance.filter(a => a.status === 'retard').length;

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      RH: 'bg-purple-100 text-purple-700',
      Directeur: 'bg-red-100 text-red-700',
      Adjoint: 'bg-orange-100 text-orange-700',
      Manager: 'bg-blue-100 text-blue-700',
      Employe: 'bg-green-100 text-green-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.first_name} className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg" />
          ) : (
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold shadow-lg">
              {user?.first_name[0]}{user?.last_name[0]}
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user?.first_name} {user?.last_name}</h1>
            <p className="text-blue-100 text-lg mb-3">{user?.poste}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getRoleBadgeColor(user?.role!)} bg-opacity-90`}>
                {user?.role}
              </span>
              <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">
                Matricule: {user?.matricule}
              </span>
            </div>
          </div>

          <button className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg transition-all border border-white border-opacity-30">
            <Edit className="w-4 h-4" />
            <span className="font-medium">Modifier</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Solde Congés</h3>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-blue-600">{user?.soldeConges}</p>
          <p className="text-sm text-gray-600 mt-1">jours restants</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Présences</h3>
            <User className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-green-600">{presentDays}</p>
          <p className="text-sm text-gray-600 mt-1">jours ce mois</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Demandes</h3>
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-4xl font-bold text-orange-600">{pendingLeaves}</p>
          <p className="text-sm text-gray-600 mt-1">en attente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Informations personnelles</h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                <p className="text-sm font-medium text-gray-900">{user?.phone}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Poste</p>
                <p className="text-sm font-medium text-gray-900">{user?.poste}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Service</p>
                <p className="text-sm font-medium text-gray-900">{user?.service}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Date d'embauche</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user?.dateEmbauche!).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Statistiques</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Jours présents</p>
                  <p className="text-2xl font-bold text-green-600">{presentDays}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Retards</p>
                  <p className="text-2xl font-bold text-orange-600">{lateDays}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Congés approuvés</p>
                  <p className="text-2xl font-bold text-blue-600">{approvedLeaves}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>

            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Edit className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Modifier mes informations</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Key className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Changer mon mot de passe</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Préférences de notification</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
