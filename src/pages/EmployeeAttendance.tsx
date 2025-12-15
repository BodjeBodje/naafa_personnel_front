import { useEffect, useState } from 'react';
import {
  Clock,
  Calendar,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { employeeAPI } from '../services/api/AppApi';
import { toast } from 'react-toastify';

interface AttendanceItem {
  id: number;
  userId: number;
  first_name: string;
  last_name: string;
  checkIn: string | null;
  checkOut: string | null;
  minutesLate: number;
  status: 'present' | 'absent' | 'permission' | 'on_leave' | 'day_off';
  is_late: boolean;
  left_early: boolean;
  justification?: string;
}

export const EmployeeAttendance = () => {
  const today = new Date().toISOString().split('T')[0];

  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'date'>('day');
  const [selectedDate, setSelectedDate] = useState(today);
  const [filterStatus, setFilterStatus] = useState('all');
  const [attendances, setAttendances] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);





  const fetchAttendances = async (page: number = 1) => {
    setLoading(true);
    try {
      const params: any = { period, page };
      if (period === 'date' || period === 'day') {
        params.date = selectedDate;
      }

      const response = await employeeAPI.getMyAttendanceSummary(params);

      if (response.data.success && response.data.data?.data) {
        const rawData = response.data.data.data;
        let dataArray: any[] = Array.isArray(rawData) ? rawData : Object.values(rawData);

        const data = dataArray.map((a: any) => ({
          id: a.user_id,
          userId: a.user_id,
          first_name: a.first_name,
          last_name: a.last_name,
          checkIn: a.check_in ? a.check_in.slice(0, 5) : null,
          checkOut: a.check_out ? a.check_out.slice(0, 5) : null,
          minutesLate: a.minutes_late || 0,
          status: a.status as AttendanceItem['status'],
          is_late: a.is_late || false,
          left_early: a.left_early || false,
          justification: a.justification || '-',
        }));
        setAttendances(data);
        setCurrentPage(response.data.data.current_page || 1);
        setTotalPages(response.data.data.last_page || 1);
      } else {
        setAttendances([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur API:', error);
      setAttendances([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setCurrentPage(1);
    fetchAttendances(1);
  }, [period, selectedDate, filterStatus]);

  // === BADGES & ICÔNES ===
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'permission': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'on_leave': return <Clock className="w-5 h-5 text-purple-600" />;
      case 'day_off': return <AlertCircle className="w-5 h-5 text-cyan-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      present: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Présent' },
      absent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Absent' },
      permission: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Permission' },
      on_leave: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'En congé' },
      day_off: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Jour off' },
    };
    return badges[status] || badges.present;
  };

  const getArrivalStatus = (item: AttendanceItem) => {
    if (!item.checkIn) return { label: '-', bg: 'bg-gray-100', text: 'text-gray-600', icon: null };
    if (item.minutesLate > 0) return { label: 'En retard', bg: 'bg-orange-100', text: 'text-orange-700', icon: <AlertCircle className="w-3 h-3" /> };
    if (item.is_late && item.minutesLate === 0) return { label: 'En retard (Autorisé)', bg: 'bg-amber-100', text: 'text-amber-800', icon: <Clock className="w-3 h-3" /> };
    return { label: "À l'heure", bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> };
  };

  const getDepartureStatus = (item: AttendanceItem) => {
    if (!item.checkOut) return { label: '-', bg: 'bg-gray-100', text: 'text-gray-600', icon: null };
    return {
      label: item.left_early ? 'Parti tôt' : "À l'heure",
      bg: item.left_early ? 'bg-red-100' : 'bg-emerald-100',
      text: item.left_early ? 'text-red-700' : 'text-emerald-700',
      icon: item.left_early ? <ArrowDown className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />,
    };
  };

  const filteredAttendance = attendances.filter(a => filterStatus === 'all' || a.status === filterStatus);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);
    if (currentPage <= half) end = Math.min(totalPages, maxVisible);
    else if (currentPage + half >= totalPages) start = Math.max(1, totalPages - maxVisible + 1);

    if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header bleu */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Aujourd'hui</p>
            <p className="text-2xl font-bold">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={() => alert('Export CSV en cours...')} className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <Download className="w-4 h-4" /> Exporter
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          {(period === 'day' || period === 'date') && (
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
          )}
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select value={period} onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all">
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="date">Date précise</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all">
            <option value="all">Tous</option>
            <option value="present">Présent</option>
            <option value="absent">Absent</option>
            <option value="permission">Permission</option>
            <option value="on_leave">En congé</option>
            <option value="day_off">Jour off</option>
          </select>
        </div>
      </div>


      {/* Tableau + Pagination */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Chargement des présences...</p>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune donnée de présence pour cette période</p>
          </div>
        ) : (
          <>
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Employé</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Arrivée</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Statut Arrivée</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Départ</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Statut Départ</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Statut</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Retard (min)</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((a) => {
                  const arrivalStatus = getArrivalStatus(a);
                  const departureStatus = getDepartureStatus(a);
                  const badge = getStatusBadge(a.status);

                  return (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow">
                            {a.first_name.charAt(0)}{a.last_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{a.first_name} {a.last_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono">{a.checkIn || '--:--'}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {arrivalStatus.icon}
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${arrivalStatus.bg} ${arrivalStatus.text}`}>
                            {arrivalStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono">{a.checkOut || '--:--'}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {departureStatus.icon}
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${departureStatus.bg} ${departureStatus.text}`}>
                            {departureStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(a.status)}
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-orange-600 font-medium">
                        {a.minutesLate > 0 ? `${a.minutesLate} min` : '-'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{a.justification}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8">
                <nav className="flex items-center gap-2">
                  <button onClick={() => currentPage > 1 && fetchAttendances(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className={`p-2 rounded-lg transition-all ${currentPage === 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {getPageNumbers().map((page, i) => page === '...' ? (
                    <span key={i} className="px-3 py-2 text-gray-500">...</span>
                  ) : (
                    <button key={i} onClick={() => page !== currentPage && fetchAttendances(page as number)}
                      disabled={loading}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : 'text-gray-700 hover:bg-blue-50 hover:shadow-md hover:scale-105'}`}>
                      {page}
                    </button>
                  ))}

                  <button onClick={() => currentPage < totalPages && fetchAttendances(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className={`p-2 rounded-lg transition-all ${currentPage === totalPages ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL FILL ALL */}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(-30px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-modalPop { animation: modalPop 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
      `}</style>
    </div>
  );
};

export default EmployeeAttendance;