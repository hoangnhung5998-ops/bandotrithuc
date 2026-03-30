import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User as UserIcon, 
  Phone, 
  Mail,
  Calendar,
  Filter,
  X,
  TrendingUp,
  MessageSquare,
  Award,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { dataProvider } from '../../core/provider';
import { User, Class } from '../../core/types';

export const StudentManagement = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    dob: '',
    classId: '',
    parentPhone: '',
    progressPercent: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allUsers = await dataProvider.getList<User>('users', { forceRealTime: true });
      const allClasses = await dataProvider.getList<Class>('classes', { forceRealTime: true });
      setStudents(allUsers.filter(u => u.role === 'student'));
      setClasses(allClasses);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu học sinh. Vui lòng kiểm tra kết nối.');
    }
  };

  const handleOpenModal = (student?: User) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        username: student.username,
        password: student.password || '',
        dob: student.dob || '',
        classId: classes.find(c => c.id === student.classId || c.name === student.classId)?.id || student.classId || '',
        parentPhone: student.parentPhone || '',
        progressPercent: student.progressPercent || 0
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        dob: '',
        classId: classes[0]?.id || '',
        parentPhone: '',
        progressPercent: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDetail = (student: User) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      await dataProvider.update('users', editingStudent.id, { ...formData, role: 'student' });
    } else {
      await dataProvider.create('users', { ...formData, role: 'student' });
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      await dataProvider.delete('users', studentToDelete);
      fetchData();
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.username.toLowerCase().includes(search.toLowerCase());
    
    // Check if classId matches the selected class ID, or if the student's classId matches the selected class name
    const selectedClassName = classes.find(c => c.id === selectedClass)?.name;
    const matchesClass = selectedClass === 'all' || 
                         s.classId === selectedClass || 
                         (selectedClassName && s.classId === selectedClassName);
                         
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý học sinh</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
        >
          <Plus size={20} /> Thêm học sinh
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc tên đăng nhập..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-48 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Học sinh</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Lớp</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">SĐT Phụ huynh</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Mật khẩu</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Tiến độ</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                        <img src={`https://picsum.photos/seed/${student.id}/100/100`} alt={student.name} referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {classes.find(c => c.id === student.classId || c.name === student.classId)?.name || student.classId || 'Chưa xếp lớp'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800 flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {student.parentPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Lock size={14} className="text-slate-400" />
                      <span className="text-sm font-mono">{student.password || '---'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${student.progressPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{student.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenDetail(student)}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Xem chi tiết tiến độ"
                      >
                        <TrendingUp size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(student)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{editingStudent ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Họ và tên</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tên đăng nhập</label>
                    <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mật khẩu</label>
                    <input type="text" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" placeholder="Nhập mật khẩu mới" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Ngày sinh</label>
                    <input type="date" required value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Lớp học</label>
                    <select required value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Số điện thoại phụ huynh</label>
                  <input type="tel" required value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">{editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border-4 border-white shadow-sm">
                    <img src={`https://picsum.photos/seed/${selectedStudent.id}/100/100`} alt={selectedStudent.name} referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h3>
                    <p className="text-sm text-emerald-600 font-medium">
                      {classes.find(c => c.id === selectedStudent.classId || c.name === selectedStudent.classId)?.name || selectedStudent.classId}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <TrendingUp size={20} />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Tiến độ học</p>
                    <p className="text-lg font-bold text-slate-800">{selectedStudent.progressPercent}%</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <MessageSquare size={20} />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Hội thoại AI</p>
                    <p className="text-lg font-bold text-slate-800">12</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Award size={20} />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Thành tích</p>
                    <p className="text-lg font-bold text-slate-800">5</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Lock size={20} />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Mật khẩu</p>
                    <p className="text-sm font-mono font-bold text-slate-800 truncate" title={selectedStudent.password}>{selectedStudent.password || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500" /> Bài học đã hoàn thành</h4>
                  <div className="space-y-2">
                    {['Văn minh Sông Hồng', 'Người anh hùng Núp', 'Thiên nhiên vùng núi phía Bắc'].map((lesson, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">{lesson}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">Hoàn thành</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsDeleteModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa</h3>
              <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn xóa học sinh này? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckCircle = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
