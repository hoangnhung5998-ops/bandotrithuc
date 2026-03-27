import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Calendar,
  ClipboardList,
  X,
  PlusCircle,
  MinusCircle,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  ExternalLink,
  Filter,
  ChevronRight,
  FileText,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { dataProvider } from '../../core/provider';
import { Assignment, Class, Lesson, Submission, User } from '../../core/types';
import { formatDate, formatDateTime, toISODateString, ensureArray } from '../../core/utils';

export const AssignmentManagement = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [isDeleteSubmissionModalOpen, setIsDeleteSubmissionModalOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

  // Submission specific state
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradeData, setGradeData] = useState({
    score: 0,
    feedback: ''
  });

  // Form state for assignment
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classIds: [] as string[],
    lessonId: '',
    dueDate: '',
    maxScore: 10,
    type: 'essay' as 'essay' | 'file',
    rubrics: [] as { criterion: string, maxScore: number }[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allAssignments, allClasses, allLessons, allSubmissions, allUsers] = await Promise.all([
        dataProvider.getList<Assignment>('assignments', { forceRealTime: true }),
        dataProvider.getList<Class>('classes', { forceRealTime: true }),
        dataProvider.getList<Lesson>('lessons', { forceRealTime: true }),
        dataProvider.getList<Submission>('submissions', { forceRealTime: true }),
        dataProvider.getList<User>('users', { forceRealTime: true })
      ]);
      
      console.log('[AssignmentManagement] Fetched assignments:', allAssignments);
      console.log('[AssignmentManagement] Fetched classes:', allClasses);
      
      setAssignments(allAssignments);
      setClasses(allClasses);
      setLessons(allLessons);
      setSubmissions(allSubmissions);
      setStudents(allUsers.filter(u => u.role === 'student'));
      
      console.log('[AssignmentManagement] Submissions:', allSubmissions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (assignment?: any) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        classIds: ensureArray(assignment.classIds || (assignment.classId ? [assignment.classId] : [])),
        lessonId: assignment.lessonId,
        dueDate: toISODateString(assignment.dueDate),
        maxScore: assignment.maxScore,
        type: assignment.type,
        rubrics: ensureArray(assignment.rubrics).map((r: any) => ({ criterion: r.criterion, maxScore: r.maxScore }))
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        title: '',
        description: '',
        classIds: [],
        lessonId: '',
        dueDate: '',
        maxScore: 10,
        type: 'essay',
        rubrics: [
          { criterion: 'Nội dung chính xác', maxScore: 4 },
          { criterion: 'Trình bày rõ ràng', maxScore: 3 },
          { criterion: 'Sáng tạo', maxScore: 3 }
        ]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.classIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lớp!');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Vui lòng chọn hạn nộp!');
      return;
    }
    if (!formData.lessonId) {
      toast.error('Vui lòng chọn bài học!');
      return;
    }
    setIsSaving(true);
    try {
      const id = editingAssignment?.id || `ASG_${Date.now()}`;
      const totalMaxScore = formData.rubrics.reduce((sum, r) => sum + r.maxScore, 0);
      
      const assignmentData = {
        ...formData,
        id,
        maxScore: totalMaxScore,
        dueDate: new Date(formData.dueDate).getTime(),
        rubrics: ensureArray<any>(formData.rubrics).map((r, i) => ({ 
          ...r, 
          id: (r as any).id || `r${Date.now()}${i}`, 
          assignmentId: id 
        }))
      };
      
      console.log('[AssignmentManagement] Saving assignment:', assignmentData);

      if (editingAssignment) {
        await dataProvider.update('assignments', id, assignmentData);
      } else {
        await dataProvider.create('assignments', assignmentData);
      }
      await fetchData();
      setIsModalOpen(false);
      toast.success(editingAssignment ? 'Cập nhật bài tập thành công!' : 'Tạo bài tập mới thành công!');
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Có lỗi xảy ra khi lưu bài tập. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setAssignmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (assignmentToDelete) {
      try {
        await dataProvider.delete('assignments', assignmentToDelete);
        fetchData();
        setIsDeleteModalOpen(false);
        setAssignmentToDelete(null);
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const handleOpenGradeModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score || 0,
      feedback: submission.feedback || ''
    });
    setIsGradeModalOpen(true);
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissionToDelete(id);
    setIsDeleteSubmissionModalOpen(true);
  };

  const confirmDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    
    setIsSaving(true);
    try {
      await dataProvider.delete('submissions', submissionToDelete);
      toast.success('Đã xóa bài nộp thành công!');
      await fetchData();
      setIsDeleteSubmissionModalOpen(false);
      setSubmissionToDelete(null);
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Có lỗi xảy ra khi xóa bài nộp.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsSaving(true);
    try {
      await dataProvider.gradeSubmission(
        selectedSubmission.id, 
        gradeData.score, 
        gradeData.feedback
      );
      toast.success('Đã chấm bài thành công!');
      
      // Update local state optimistically
      setSubmissions(prev => prev.map(s => 
        s.id === selectedSubmission.id 
          ? { ...s, score: gradeData.score, feedback: gradeData.feedback, gradedAt: Date.now() } 
          : s
      ));
      
      setIsGradeModalOpen(false);
      // Small delay to ensure the sheet has settled (though Apps Script should be immediate)
      setTimeout(() => fetchData(), 1000);
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Có lỗi xảy ra khi chấm bài. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const addRubricRow = () => {
    setFormData({
      ...formData,
      rubrics: [...formData.rubrics, { criterion: '', maxScore: 0 }]
    });
  };

  const removeRubricRow = (index: number) => {
    setFormData({
      ...formData,
      rubrics: formData.rubrics.filter((_, i) => i !== index)
    });
  };

  const updateRubricRow = (index: number, field: 'criterion' | 'maxScore', value: string | number) => {
    const newRubrics = [...formData.rubrics];
    newRubrics[index] = { ...newRubrics[index], [field]: value };
    setFormData({ ...formData, rubrics: newRubrics });
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(s => {
    const student = students.find(st => st.id === s.studentId);
    const assignment = assignments.find(a => a.id === s.assignmentId);
    const matchesSearch = student?.name.toLowerCase().includes(search.toLowerCase()) || 
                          assignment?.title.toLowerCase().includes(search.toLowerCase());
    const matchesAssignment = selectedAssignmentFilter === 'all' || s.assignmentId === selectedAssignmentFilter;
    return matchesSearch && matchesAssignment;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý bài tập & Chấm bài</h2>
          <p className="text-slate-500">Giao bài tập, thiết lập tiêu chí và đánh giá bài làm của học sinh</p>
        </div>
        {activeTab === 'assignments' && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            <Plus size={20} /> Tạo bài tập mới
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'assignments' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText size={18} /> Danh sách bài tập
        </button>
        <button 
          onClick={() => setActiveTab('submissions')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'submissions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckSquare size={18} /> Chấm bài nộp
        </button>
      </div>

      {activeTab === 'assignments' ? (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài tập..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Bài tập</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Lớp & Bài học</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Hạn nộp</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{assignment.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{assignment.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(() => {
                          const cIds = ensureArray<string>(assignment.classIds);
                          // Fallback for singular classId
                          const singularId = (assignment as any).classId;
                          if (singularId && !cIds.includes(singularId)) {
                            cIds.push(singularId);
                          }
                          
                          if (cIds.length === 0) return <span className="text-xs text-slate-400 italic">Chưa giao lớp</span>;
                          
                          return cIds.map(cid => {
                            const cls = classes.find(c => c.id === cid || c.name === cid);
                            return (
                              <span key={cid} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">
                                {cls?.name || cid}
                              </span>
                            );
                          });
                        })()}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <BookOpen size={12} /> {lessons.find(l => l.id === assignment.lessonId || l.title === assignment.lessonId)?.title || 'Bài học chung'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={16} className="text-slate-400" />
                        {formatDate(assignment.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        assignment.type === 'essay' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {assignment.type === 'essay' ? 'Tự luận' : 'Nộp file'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(assignment)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(assignment.id)}
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
      ) : (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Tìm học sinh hoặc bài tập..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={20} className="text-slate-400" />
              <select 
                value={selectedAssignmentFilter}
                onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all text-sm min-w-[200px]"
              >
                <option value="all">Tất cả bài tập</option>
                {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Học sinh</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Bài tập</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Thời gian nộp</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Điểm</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSubmissions.map((submission) => {
                  const student = students.find(s => s.id === submission.studentId);
                  const assignment = assignments.find(a => a.id === submission.assignmentId);
                  
                  // Robust check for graded status
                  const isGraded = submission.score !== undefined && 
                                  submission.score !== null && 
                                  submission.score !== '';

                  return (
                    <tr key={submission.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                            <img src={`https://picsum.photos/seed/${student?.id}/100/100`} alt={student?.name} referrerPolicy="no-referrer" />
                          </div>
                          <span className="text-sm font-bold text-slate-800">{student?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">{assignment?.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500">
                          {formatDateTime(submission.submittedAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          isGraded ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {isGraded ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {isGraded ? 'Đã chấm' : 'Chưa chấm'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isGraded ? (
                          <span className="text-sm font-bold text-emerald-600">{submission.score} / {assignment?.maxScore}</span>
                        ) : (
                          <span className="text-sm text-slate-400 italic">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenGradeModal(submission)}
                            className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"
                          >
                            {isGraded ? 'Xem lại' : 'Chấm bài'} <ChevronRight size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSubmission(submission.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa bài nộp"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  {editingAssignment ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tiêu đề bài tập</label>
                    <input 
                      required
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nhập tiêu đề..."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">Lớp áp dụng (Có thể chọn nhiều lớp)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      {classes.map(c => (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={formData.classIds.includes(c.id)}
                            onChange={(e) => {
                              const newClassIds = e.target.checked 
                                ? [...formData.classIds, c.id]
                                : formData.classIds.filter(id => id !== c.id);
                              setFormData({ ...formData, classIds: newClassIds });
                            }}
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mô tả yêu cầu</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nhập yêu cầu chi tiết cho học sinh..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Bài học liên quan</label>
                    <select 
                      required
                      value={formData.lessonId}
                      onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Chọn bài học...</option>
                      {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Hạn nộp</label>
                    <input 
                      required
                      type="date" 
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Loại bài tập</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="essay">Tự luận</option>
                      <option value="file">Nộp file/link</option>
                    </select>
                  </div>
                </div>

                {/* Rubric Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <ClipboardList size={18} className="text-emerald-500" /> Tiêu chí chấm điểm (Rubric)
                    </label>
                    <button 
                      type="button"
                      onClick={addRubricRow}
                      className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline"
                    >
                      <PlusCircle size={14} /> Thêm tiêu chí
                    </button>
                  </div>
                  <div className="space-y-3">
                    {ensureArray<any>(formData.rubrics).map((rubric, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input 
                          required
                          type="text" 
                          placeholder="Tên tiêu chí..."
                          value={rubric.criterion}
                          onChange={(e) => updateRubricRow(index, 'criterion', e.target.value)}
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm"
                        />
                        <input 
                          required
                          type="number" 
                          placeholder="Điểm"
                          value={rubric.maxScore}
                          onChange={(e) => updateRubricRow(index, 'maxScore', parseInt(e.target.value))}
                          className="w-20 px-4 py-2 rounded-xl border border-slate-200 text-sm"
                        />
                        <button 
                          type="button"
                          onClick={() => removeRubricRow(index)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-500">
                      Tổng điểm tối đa: <span className="text-emerald-600">{formData.rubrics.reduce((sum, r) => sum + r.maxScore, 0)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Đang lưu...' : (editingAssignment ? 'Cập nhật' : 'Tạo bài tập')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grading Modal */}
      <AnimatePresence>
        {isGradeModalOpen && selectedSubmission && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Chấm bài: {students.find(s => s.id === selectedSubmission.studentId)?.name}</h3>
                  <p className="text-sm text-slate-500">{assignments.find(a => a.id === selectedSubmission.assignmentId)?.title}</p>
                </div>
                <button onClick={() => setIsGradeModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex flex-col md:flex-row gap-8">
                {/* Submission Content */}
                <div className="flex-1 space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Nội dung bài làm</h4>
                    <div className="prose prose-slate max-w-none">
                      <p className="whitespace-pre-wrap text-slate-700">{selectedSubmission.content}</p>
                    </div>
                    {selectedSubmission.fileUrl && (
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <a 
                          href={selectedSubmission.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
                        >
                          <ExternalLink size={18} /> Xem file đính kèm
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tiêu chí chấm điểm (Rubric)</h4>
                    <div className="space-y-2">
                      {ensureArray<any>(assignments.find(a => a.id === selectedSubmission.assignmentId)?.rubrics).map(r => (
                        <div key={r.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                          <span className="text-sm text-slate-700">{r.criterion}</span>
                          <span className="text-sm font-bold text-slate-500">Tối đa: {r.maxScore}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grading Form */}
                <form onSubmit={handleSaveGrade} className="w-full md:w-80 space-y-6">
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                        <Star size={18} /> Điểm số
                      </label>
                      <div className="flex items-center gap-3">
                        <input 
                          required
                          type="number" 
                          step="0.1"
                          min="0"
                          max={assignments.find(a => a.id === selectedSubmission.assignmentId)?.maxScore}
                          value={gradeData.score}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setGradeData({ ...gradeData, score: isNaN(val) ? 0 : val });
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 text-2xl font-black text-emerald-600 text-center"
                        />
                        <span className="text-xl font-bold text-emerald-400">/ {assignments.find(a => a.id === selectedSubmission.assignmentId)?.maxScore}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                        <MessageSquare size={18} /> Nhận xét của giáo viên
                      </label>
                      <textarea 
                        required
                        rows={6}
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 text-sm"
                        placeholder="Nhập lời nhận xét và góp ý cho học sinh..."
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu kết quả'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] p-6 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa</h3>
              <p className="text-slate-500 mb-6">Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
                >
                  Xóa ngay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Submission Confirmation Modal */}
      <AnimatePresence>
        {isDeleteSubmissionModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] p-6 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xóa bài nộp?</h3>
              <p className="text-slate-500 mb-6">Bạn có chắc chắn muốn xóa bài nộp này không? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteSubmissionModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDeleteSubmission}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100 disabled:opacity-50"
                >
                  {isSaving ? 'Đang xóa...' : 'Xóa bài'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
