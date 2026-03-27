import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Search, 
  Play, 
  Trophy, 
  Clock, 
  Star,
  ArrowRight,
  Gamepad
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { dataProvider } from '../../core/provider';
import { getGoogleDriveDirectLink } from '../../core/utils';
import { Game } from '../../core/types';

export const LearningGames = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const allGames = await dataProvider.getList<Game>('games');
        // Only show active games for students
        setGames(allGames.filter(g => g.status === 'active'));
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const filteredGames = games.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) || 
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  const getGameTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return 'Trắc nghiệm';
      case 'puzzle': return 'Ghép hình';
      case 'adventure': return 'Phiêu lưu';
      default: return 'Khác';
    }
  };

  const handlePlayGame = (game: Game) => {
    if (game.type === 'quiz' && game.gameUrl.startsWith('/app/games/quiz/')) {
      // If it's our internal quiz game
      navigate(game.gameUrl);
    } else if (game.gameUrl && game.gameUrl !== '#') {
      // If it's an external link
      window.open(game.gameUrl, '_blank');
    } else {
      // Default to our quiz game for now if no URL
      navigate('/app/games/quiz/default');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-widest border border-white/30">
            <Gamepad2 size={16} /> Thế giới trò chơi
          </div>
          <h2 className="text-5xl font-black leading-tight">Vừa học vừa chơi, khơi nguồn sáng tạo!</h2>
          <p className="text-indigo-50 text-lg font-medium opacity-90">
            Khám phá kho tàng trò chơi giáo dục được thiết kế riêng để giúp em ôn tập kiến thức một cách thú vị nhất.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Trophy className="text-yellow-300" />
              </div>
              <div>
                <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Thành tích</p>
                <p className="text-xl font-black">12 Huy hiệu</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Star className="text-pink-300" />
              </div>
              <div>
                <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Điểm thưởng</p>
                <p className="text-xl font-black">2,450 XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full translate-y-1/2 blur-3xl"></div>
        <Gamepad className="absolute -bottom-10 -right-10 w-80 h-80 text-white/5 -rotate-12" />
      </div>

      {/* Search Section */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm trò chơi em yêu thích..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-3xl border border-slate-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-slate-100 rounded-[40px] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group"
            >
              <div className="h-56 relative overflow-hidden">
                <img 
                  src={getGoogleDriveDirectLink(game.thumbnailUrl) || `https://picsum.photos/seed/${game.id}/600/400`} 
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-indigo-600 shadow-sm">
                    {getGameTypeLabel(game.type)}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handlePlayGame(game)}
                    className="w-16 h-16 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300"
                  >
                    <Play size={32} fill="currentColor" />
                  </button>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {game.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
                    {game.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">10 Phút</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star size={16} className="text-yellow-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">50 XP</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePlayGame(game)}
                    className="flex items-center gap-2 text-indigo-600 font-black text-sm group/btn"
                  >
                    Chơi ngay <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredGames.length === 0 && (
        <div className="py-20 text-center bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Gamepad2 size={48} className="text-slate-200" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">Không tìm thấy trò chơi nào</h3>
            <p className="text-slate-500">Thầy cô sẽ sớm cập nhật thêm nhiều trò chơi thú vị cho em nhé!</p>
          </div>
        </div>
      )}
    </div>
  );
};
