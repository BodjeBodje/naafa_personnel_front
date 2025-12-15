import { useState, useEffect, useRef } from 'react';
import { managerAPI } from '../services/api/AppApi';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface UserMonthlyStat {
  user_id: number;
  name: string;
  role: string;
  department: string | null;
  present_days: number;
  late_days: number;
  absent_days: number;
  permission_days: number;
}

interface ApiResponse {
  month: string;
  data: UserMonthlyStat[];
}

export const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ref pour le tableau caché à exporter en PDF
  const pdfTableRef = useRef<HTMLTableElement>(null);

  const fetchStats = async (month: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await managerAPI.getAllUsersMonthlyStats(month || undefined);
      setApiData(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedMonth);
  }, [selectedMonth]);

  const users: UserMonthlyStat[] = apiData?.data || [];
  const sortedUsers = users.length > 0 ? [...users].sort((a, b) => b.present_days - a.present_days) : [];

  const calculateGlobalStats = (usersList: UserMonthlyStat[]) => {
    if (usersList.length === 0) {
      return {
        totalPresent: 0,
        totalLate: 0,
        totalAbsent: 0,
        totalPermission: 0,
        totalWorkedDays: 0,
        attendanceRate: 0,
        punctualityRate: 0,
      };
    }

    const totalPresent = usersList.reduce((sum, u) => sum + u.present_days, 0);
    const totalLate = usersList.reduce((sum, u) => sum + u.late_days, 0);
    const totalAbsent = usersList.reduce((sum, u) => sum + u.absent_days, 0);
    const totalPermission = usersList.reduce((sum, u) => sum + u.permission_days, 0);

    const totalWorkedDays = totalPresent + totalLate + totalAbsent + totalPermission;
    const attendanceRate = totalWorkedDays > 0 ? ((totalPresent + totalLate) / totalWorkedDays) * 100 : 0;
    const punctualityRate = (totalPresent + totalLate) > 0 ? (totalPresent / (totalPresent + totalLate)) * 100 : 0;

    return {
      totalPresent,
      totalLate,
      totalAbsent,
      totalPermission,
      totalWorkedDays,
      attendanceRate,
      punctualityRate,
    };
  };

  const stats = calculateGlobalStats(users);

  // Fonction d'export PDF (uniquement le tableau propre)
  const exportToPDF = async () => {
    if (!pdfTableRef.current || users.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const canvas = await html2canvas(pdfTableRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Titre
    const monthLabel = (apiData?.month || selectedMonth).replace('-', '/');
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Rapport de Présence - ${monthLabel}`, 20, 20);

    // Sous-titre
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);

    // Ajouter le tableau
    pdf.addImage(imgData, 'PNG', 20, 45, imgWidth, imgHeight);

    // Sauvegarder
    pdf.save(`rapport-presence-${monthLabel}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600 animate-pulse">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
        <p className="font-semibold">Erreur</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Ton design original */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h2>
          <p className="text-gray-600 mt-1">Analyses et métriques de performance</p>
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-lg transform hover:scale-[1.02]"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">Exporter PDF</span>
        </button>
      </div>

      {/* Sélecteur de mois + Cartes - Identique */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Période d'analyse</h3>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Présences</p>
              <TrendingUp className="w-10 h-10 bg-green-600 rounded-lg p-2 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPresent}</p>
            <p className="text-xs text-gray-600">jours présents</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Absences</p>
              <BarChart3 className="w-10 h-10 bg-red-600 rounded-lg p-2 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalAbsent}</p>
            <p className="text-xs text-gray-600">jours absents</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Retards</p>
              <PieChart className="w-10 h-10 bg-orange-600 rounded-lg p-2 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalLate}</p>
            <p className="text-xs text-gray-600">arrivées tardives</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Permissions</p>
              <FileText className="w-10 h-10 bg-blue-600 rounded-lg p-2 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPermission}</p>
            <p className="text-xs text-gray-600">jours autorisés</p>
          </div>
        </div>
      </div>

      {/* Tableau affiché à l'écran - Ton design original */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Récapitulatif par employé ({apiData?.month?.replace('-', '/') || selectedMonth})
        </h3>

        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucune donnée disponible pour ce mois
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Employé</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Présents</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Retards</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Absences</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {user.department || 'Non défini'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                        {user.present_days}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm">
                        {user.late_days}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-lg font-semibold text-sm">
                        {user.absent_days}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-lg font-semibold 성장-sm">
                        {user.permission_days}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tableau caché uniquement pour l'export PDF (propre, sans avatar ni couleur) */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <table ref={pdfTableRef} style={{ fontFamily: 'Helvetica, sans-serif', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #374151' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Employé</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Service</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>Présents</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>Retards</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>Absences</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.user_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontSize: '13px' }}>{user.name}</td>
                <td style={{ padding: '12px', fontSize: '13px' }}>{user.department || 'Non défini'}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{user.present_days}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{user.late_days}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{user.absent_days}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{user.permission_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};