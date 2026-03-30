import React, { useState, useEffect } from 'react';
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  Users, 
  BookOpen, 
  AlertCircle, 
  ChevronRight,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { ClassReport, Student } from '../../core/types';

export const AdminReports = () => {
  const [report, setReport] = useState<ClassReport | null>(null);
  const [atRiskStudents, setAtRiskStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('4A');

  useEffect(() => {
    fetchReportData();
  }, [selectedClass]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [reportData, atRiskData] = await Promise.all([
        dataProvider.getClassReport(selectedClass),
        dataProvider.getAtRiskStudents(selectedClass)
      ]);
      setReport(reportData);
      setAtRiskStudents(atRiskData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold">Đang tổng hợp báo cáo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Báo cáo học tập</h1>
          <p className="text-slate-500 font-medium">Theo dõi tiến độ và kết quả của lớp {selectedClass}</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-slate-200 px-4 py-3 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            <option value="4A">Lớp 4A</option>
            <option value="4B">Lớp 4B</option>
            <option value="4C">Lớp 4C</option>
          </select>
          <button className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-all">
            <Download size={20} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Điểm trung bình" 
          value={report?.averageScore?.toFixed(1) || '0'} 
          icon={<TrendingUp className="text-emerald-600" />} 
          color="bg-emerald-50"
          trend="+0.5"
          trendUp={true}
        />
        <StatCard 
          title="Tỷ lệ hoàn thành" 
          value={`${report?.completionRate || 0}%`} 
          icon={<BookOpen className="text-blue-600" />} 
          color="bg-blue-50"
          trend="+2%"
          trendUp={true}
        />
        <StatCard 
          title="Tổng số học sinh" 
          value={report?.totalStudents?.toString() || '0'} 
          icon={<Users className="text-purple-600" />} 
          color="bg-purple-50"
        />
        <StatCard 
          title="Học sinh cần hỗ trợ" 
          value={atRiskStudents.length.toString()} 
          icon={<AlertCircle className="text-red-600" />} 
          color="bg-red-50"
          trend={atRiskStudents.length > 0 ? "Cần chú ý" : "Tốt"}
          trendUp={atRiskStudents.length === 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Distribution Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800">Phân bố điểm số</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="w-3 h-3 bg-emerald-500 rounded-full" />
              Số lượng học sinh
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report?.scoreDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="range" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(report?.scoreDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* At Risk Students */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800">Học sinh cần hỗ trợ</h3>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">
              {atRiskStudents.length} em
            </span>
          </div>
          <div className="space-y-4">
            {atRiskStudents.length > 0 ? atRiskStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 group hover:bg-red-100 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-600 font-black shadow-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{student.name}</p>
                    <p className="text-xs text-slate-500 font-medium">Điểm TB: {student.averageScore?.toFixed(1) || '0'}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-red-400 group-hover:translate-x-1 transition-transform" />
              </div>
            )) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                  <CheckSquare size={32} />
                </div>
                <p className="text-slate-500 font-bold">Tất cả học sinh đều đạt kết quả tốt!</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all text-sm">
            Xem tất cả danh sách
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-slate-800">Danh sách chi tiết</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên học sinh..."
              className="pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Học sinh</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Lớp</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Hoàn thành</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Điểm TB</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Xếp loại</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(report?.studentScores || []).map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">{student.classId}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${student.completionRate}%` }} 
                        />
                      </div>
                      <span className="text-xs font-black text-slate-700">{student.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`font-black ${(student.averageScore || 0) >= 8 ? 'text-emerald-600' : (student.averageScore || 0) >= 5 ? 'text-blue-600' : 'text-red-600'}`}>
                      {student.averageScore?.toFixed(1) || '0'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      (student.averageScore || 0) >= 8 ? 'bg-emerald-50 text-emerald-600' : 
                      (student.averageScore || 0) >= 5 ? 'bg-blue-50 text-blue-600' : 
                      'bg-red-50 text-red-600'
                    }`}>
                      {(student.averageScore || 0) >= 9 ? 'Xuất sắc' : (student.averageScore || 0) >= 8 ? 'Giỏi' : (student.averageScore || 0) >= 6.5 ? 'Khá' : (student.averageScore || 0) >= 5 ? 'Trung bình' : 'Yếu'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend, trendUp }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-black ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      )}
    </div>
    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-800">{value}</h3>
  </div>
);

const CheckSquare = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
