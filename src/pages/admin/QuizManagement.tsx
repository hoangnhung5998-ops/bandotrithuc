import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  HelpCircle, 
  Gamepad2, 
  CheckCircle2,
  X,
  PlusCircle,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { Quiz } from '../../core/types';

export const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    questions: [] as any[]
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const data = await dataProvider.getList<Quiz>('quizzes');
    setQuizzes(data);
  };

  const handleOpenModal = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title,
        questions: quiz.questions || []
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        title: '',
        questions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: Math.random().toString(36).substr(2, 9),
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: ''
        }
      ]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuiz) {
      await dataProvider.update('quizzes', editingQuiz.id, formData);
    } else {
      await dataProvider.create('quizzes', formData);
    }
    setIsModalOpen(false);
    fetchQuizzes();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bộ câu hỏi này?')) {
      await dataProvider.delete('quizzes', id);
      fetchQuizzes();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Quiz & Trò chơi</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
        >
          <Plus size={20} /> Tạo bộ câu hỏi mới
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm bộ câu hỏi..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <motion.div 
            key={quiz.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <HelpCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{quiz.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{quiz.questions.length} câu hỏi trắc nghiệm</p>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-100">Lịch sử</span>
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-blue-100">Lớp 4</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => handleOpenModal(quiz)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 size={18} /></button>
              <button onClick={() => handleDelete(quiz.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{editingQuiz ? 'Cập nhật bộ câu hỏi' : 'Tạo bộ câu hỏi mới'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-auto">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tiêu đề bộ câu hỏi</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800">Danh sách câu hỏi</h4>
                    <button type="button" onClick={handleAddQuestion} className="text-emerald-600 text-sm font-bold flex items-center gap-1"><PlusCircle size={16} /> Thêm câu hỏi</button>
                  </div>
                  <div className="space-y-6">
                    {formData.questions.map((q, qIndex) => (
                      <div key={q.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 relative">
                        <button type="button" onClick={() => {
                          const newQs = [...formData.questions];
                          newQs.splice(qIndex, 1);
                          setFormData({ ...formData, questions: newQs });
                        }} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Câu hỏi {qIndex + 1}</label>
                          <input type="text" required value={q.text} onChange={(e) => {
                            const newQs = [...formData.questions];
                            newQs[qIndex].text = e.target.value;
                            setFormData({ ...formData, questions: newQs });
                          }} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {q.options.map((opt: string, oIndex: number) => (
                            <div key={oIndex} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Đáp án {String.fromCharCode(65 + oIndex)}</label>
                                <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === oIndex} onChange={() => {
                                  const newQs = [...formData.questions];
                                  newQs[qIndex].correctAnswer = oIndex;
                                  setFormData({ ...formData, questions: newQs });
                                }} />
                              </div>
                              <input type="text" required value={opt} onChange={(e) => {
                                const newQs = [...formData.questions];
                                newQs[qIndex].options[oIndex] = e.target.value;
                                setFormData({ ...formData, questions: newQs });
                              }} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 sticky bottom-0 bg-white">
                  <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">{editingQuiz ? 'Lưu thay đổi' : 'Tạo bộ câu hỏi'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
