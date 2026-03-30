import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Filter, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { dataProvider } from '../../core/provider';
import { GradebookRecord, Assignment, Class, User } from '../../core/types';
import { formatDate } from '../../core/utils';

export const Gradebook = () => {
  const [gradebook, setGradebook] = useState<GradebookRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const fetchData = async () => {
    try {
      const classId = selectedClass === 'all' ? undefined : selectedClass;
      const [records, allAssignments, allClasses, allUsers] = await Promise.all([
        dataProvider.getGradebook(classId),
        dataProvider.getList<Assignment>('assignments'),
        dataProvider.getList<Class>('classes'),
        dataProvider.getList<User>('users')
      ]);
      setGradebook(records);
      setAssignments(allAssignments);
      setClasses(allClasses);
      setStudents(allUsers.filter(u => u.role === 'student'));
    } catch (error) {
      console.error('Error fetching gradebook:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = gradebook.filter(record => 
    record.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const classAssignments = assignments.filter(a => 
    selectedClass === 'all' || (a.classIds && a.classIds.includes(selectedClass))
  );

  const handleExport = () => {
    const exportData = filteredRecords.map(record => {
      const row: any = {
        'Học sinh': record.studentName
      };
      
      classAssignments.forEach(a => {
        row[a.title] = record.scores[a.id] ?? '--';
      });
      
      row['Trung bình'] = record.averageScore?.toFixed(1) || '0';
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gradebook");
    
    const className = selectedClass === 'all' ? 'Tat_ca_cac_lop' : classes.find(c => c.id === selectedClass)?.name || 'Lop_hoc';
    XLSX.writeFile(workbook, `So_diem_${className}_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`);
  };

  const stats = {
    avgScore: gradebook.length > 0 ? (gradebook.reduce((acc, r) => acc + r.averageScore, 0) / gradebook.length).toFixed(1) : 0,
    totalStudents: gradebook.length,
    totalAssignments: classAssignments.length
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sổ điểm lớp học</h2>
          <p className="text-slate-500">Theo dõi tiến độ và kết quả học tập của học sinh</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
        >
          <Download size={20} /> Xuất file Excel
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Điểm TB cả lớp</p>
            <p className="text-2xl font-black text-slate-800">{stats.avgScore}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Tổng số học sinh</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Số bài tập</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalAssignments}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm tên học sinh..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={20} className="text-slate-400" />
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-w-[200px]"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-white z-10 min-w-[200px]">Học sinh</th>
                {classAssignments.map(a => (
                  <th key={a.id} className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-center min-w-[120px]">
                    <span className="block truncate max-w-[100px]" title={a.title}>{a.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Max: {a.maxScore}đ</span>
                  </th>
                ))}
                <th className="px-6 py-4 text-sm font-bold text-emerald-600 uppercase tracking-wider text-center sticky right-0 bg-white z-10 min-w-[100px]">Trung bình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((record) => (
                <tr key={record.studentId} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${record.studentId}/100/100`} alt={record.studentName} referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{record.studentName}</span>
                    </div>
                  </td>
                  {classAssignments.map(a => {
                    const score = record.scores[a.id];
                    const isLow = score !== undefined && score < (a.maxScore * 0.5);
                    return (
                      <td key={a.id} className="px-6 py-4 text-center">
                        {score !== undefined ? (
                          <span className={`text-sm font-bold ${isLow ? 'text-red-500' : 'text-slate-700'}`}>
                            {score}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs italic">--</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-black text-emerald-600">{record.averageScore?.toFixed(1) || '0'}</span>
                      {record.averageScore >= 8 ? (
                        <TrendingUp size={14} className="text-emerald-500" />
                      ) : record.averageScore < 5 ? (
                        <TrendingDown size={14} className="text-red-500" />
                      ) : null}
                    </div>
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
