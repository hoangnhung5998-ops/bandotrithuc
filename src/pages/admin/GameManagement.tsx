import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  X,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  ListOrdered,
  Type,
  CheckSquare,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { getGoogleDriveDirectLink } from '../../core/utils';
import { Game, Question, QuestionType, Lesson, Topic } from '../../core/types';
import { toast } from 'sonner';

export const GameManagement = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    gameUrl: '',
    type: 'quiz' as const,
    status: 'active' as const,
    questionIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamesData, questionsData, topicsData, lessonsData] = await Promise.all([
        dataProvider.getList<Game>('games'),
        dataProvider.getList<Question>('questions'),
        dataProvider.getList<Topic>('topics'),
        dataProvider.getList<Lesson>('lessons')
      ]);
      setGames(gamesData);
      setQuestions(questionsData);
      setTopics(topicsData);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  const handleOpenModal = (game?: Game) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        title: game.title,
        description: game.description,
        thumbnailUrl: game.thumbnailUrl,
        gameUrl: game.gameUrl,
        type: game.type,
        status: game.status,
        questionIds: game.questionIds || []
      });
      setSelectedQuestionIds(game.questionIds || []);
    } else {
      setEditingGame(null);
      setFormData({
        title: '',
        description: '',
        thumbnailUrl: '',
        gameUrl: '',
        type: 'quiz',
        status: 'active',
        questionIds: []
      });
      setSelectedQuestionIds([]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const thumbnailUrl = getGoogleDriveDirectLink(formData.thumbnailUrl);
      
      if (editingGame) {
        const dataToSave = {
          ...formData,
          thumbnailUrl,
          questionIds: selectedQuestionIds,
          gameUrl: formData.type === 'quiz' && !formData.gameUrl.startsWith('http') 
            ? `/app/games/quiz/${editingGame.id}` 
            : formData.gameUrl
        };
        await dataProvider.update('games', editingGame.id, dataToSave);
        toast.success('Cập nhật trò chơi thành công');
      } else {
        const dataToSave = {
          ...formData,
          thumbnailUrl,
          questionIds: selectedQuestionIds,
          createdAt: Date.now()
        };
        const newGame = await dataProvider.create<Game>('games', dataToSave);
        
        // Update gameUrl with the new ID if it's a quiz and no custom URL provided
        if (newGame.type === 'quiz' && (!newGame.gameUrl || newGame.gameUrl === '/app/games/quiz/internal')) {
          await dataProvider.update('games', newGame.id, {
            ...newGame,
            gameUrl: `/app/games/quiz/${newGame.id}`
          });
        }
        
        toast.success('Tạo trò chơi mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error('Có lỗi xảy ra khi lưu trò chơi');
    }
  };

  const handleDelete = (id: string) => {
    setGameToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (gameToDelete) {
      try {
        await dataProvider.delete('games', gameToDelete);
        toast.success('Xóa trò chơi thành công');
        fetchData();
        setIsDeleteModalOpen(false);
        setGameToDelete(null);
      } catch (error) {
        console.error('Error deleting game:', error);
        toast.error('Không thể xóa trò chơi');
      }
    }
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const filteredGames = games.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) || 
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(questionSearch.toLowerCase())
  );

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'multiple-choice': return <CheckCircle2 size={14} />;
      case 'short-answer': return <Type size={14} />;
      case 'sorting': return <ListOrdered size={14} />;
      case 'fill-in-the-blanks': return <HelpCircle size={14} />;
      case 'true-false': return <CheckSquare size={14} />;
      case 'matching': return <ListOrdered size={14} />;
      default: return <HelpCircle size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý trò chơi</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            <Plus size={20} /> Thêm trò chơi mới
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên trò chơi..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <motion.div 
            key={game.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={getGoogleDriveDirectLink(game.thumbnailUrl) || 'https://picsum.photos/seed/game/400/300'} 
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  game.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                }`}>
                  {game.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                </span>
                <span className="bg-white/90 backdrop-blur-sm text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                  {game.type === 'quiz' ? 'Trắc nghiệm' : 
                   game.type === 'puzzle' ? 'Ghép hình' : 
                   game.type === 'adventure' ? 'Phiêu lưu' : 'Khác'}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{game.title}</h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 h-10">{game.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(game)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(game.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <a 
                  href={game.gameUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Mở trò chơi <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">{editingGame ? 'Cập nhật trò chơi' : 'Thêm trò chơi mới'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Tên trò chơi</label>
                      <input 
                        type="text" 
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ví dụ: Thử thách Lịch sử"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Loại trò chơi</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="quiz">Trắc nghiệm</option>
                        <option value="puzzle">Ghép hình</option>
                        <option value="adventure">Phiêu lưu</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Trạng thái</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Tạm dừng</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Ảnh bìa (URL)</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="url" 
                          required
                          value={formData.thumbnailUrl}
                          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    {formData.type !== 'quiz' && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Đường dẫn trò chơi (URL)</label>
                        <div className="relative">
                          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            required
                            value={formData.gameUrl}
                            onChange={(e) => setFormData({ ...formData, gameUrl: e.target.value })}
                            placeholder="/app/games/quiz/internal"
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 italic">Dùng "/app/games/quiz/internal" cho trò chơi trắc nghiệm nội bộ</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mô tả trò chơi</label>
                  <textarea 
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nhập mô tả ngắn về trò chơi..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  ></textarea>
                </div>

                {formData.type === 'quiz' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <HelpCircle size={18} className="text-emerald-500" /> Chọn câu hỏi từ ngân hàng ({selectedQuestionIds.length})
                      </label>
                      <div className="relative w-48">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                          type="text"
                          placeholder="Tìm câu hỏi..."
                          value={questionSearch}
                          onChange={(e) => setQuestionSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                      {filteredQuestions.map(q => (
                        <div 
                          key={q.id}
                          onClick={() => toggleQuestionSelection(q.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            selectedQuestionIds.includes(q.id)
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-white bg-white hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                            selectedQuestionIds.includes(q.id)
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300'
                          }`}>
                            {selectedQuestionIds.includes(q.id) && <CheckCircle2 size={12} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{q.text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                {getQuestionTypeIcon(q.type)} {q.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                  >
                    {editingGame ? 'Lưu thay đổi' : 'Tạo trò chơi'}
                  </button>
                </div>
              </form>
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
              <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn xóa trò chơi này? Hành động này không thể hoàn tác.</p>
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
