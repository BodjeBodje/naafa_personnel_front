import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Calendar,
  FileText,
  UserCircle,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronDown,
  CalendarX
} from 'lucide-react';

type UserRole = 'admin' | 'rh' | 'manager' | 'employee';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  roles: UserRole[];
}

// 🔹 Définition des menus selon rôle
const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: 'manager-dashboard', roles: ['admin', 'rh', 'manager',] },
  { icon: LayoutDashboard, label: 'Tableau de bord', path: 'employee-dashboard', roles: ['employee',] },
  { icon: Users, label: 'Personnel', path: 'employees', roles: ['admin', 'rh'] },
  { icon: CalendarX, label: 'Days off', path: 'days_off', roles: ['admin', 'rh', 'manager', ] },
  { icon: ClipboardCheck, label: 'Présences', path: 'attendance', roles: ['admin', 'rh', 'manager',] },
  { icon: ClipboardCheck, label: 'Présences', path: 'employee-attendance', roles: ['employee'] },
  { icon: Calendar, label: 'Permissions', path: 'permission', roles: ['admin', 'rh', 'manager',] },
  { icon: Calendar, label: 'Congés', path: 'leaves', roles: ['admin', 'rh', 'manager',] },
  { icon: Calendar, label: 'Mes demandes', path: 'employee-permissions', roles: ['employee',] },
  { icon: Calendar, label: 'Mes Congés', path: 'employee-leaves', roles: ['employee'] },
  { icon: FileText, label: 'Rapports', path: 'reports', roles: ['admin', 'rh', 'manager'] },
  { icon: UserCircle, label: 'Mon Profil', path: 'profile', roles: ['admin', 'rh', 'manager', 'employee'] },
];

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // 🔹 Filtrer les menus selon le rôle de l'utilisateur
  const filteredNavItems = navItems.filter(item =>
    user && item.roles.includes(user.role as UserRole)
  );

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: 'bg-red-100 text-red-700',
      rh: 'bg-purple-100 text-purple-700',
      manager: 'bg-blue-100 text-blue-700',
      employee: 'bg-green-100 text-green-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NAFA</h1>
                <p className="text-xs text-gray-500">Gestion RH</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer / Menu utilisateur */}
          <div className="p-4 border-t border-gray-200 relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.first_name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.first_name[0]}{user?.last_name[0]}
                </div>
              )}
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 text-sm">{user?.first_name} {user?.last_name}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(user?.role as UserRole)}`}>
                  {user?.role}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setUserMenuOpen(false);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="font-medium">Mon Profil</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="lg:ml-72">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {filteredNavItems.find(item => item.path === currentPage)?.label || 'NAFA'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.first_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-blue-500">
                  {user?.first_name[0]}{user?.last_name[0]}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
