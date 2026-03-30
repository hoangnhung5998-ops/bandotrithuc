import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';

export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await dataProvider.login(username, password);
      if (user.role === 'teacher' || user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/app/home');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row min-h-[600px] max-h-[90vh]"
      >
        {/* Left Side - Artistic Illustration */}
        <div className="hidden md:block md:w-[50%] relative overflow-hidden bg-[#eef2f7] flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent z-10" />
            <img 
              src="https://lh3.googleusercontent.com/d/1Uebe03dN2MbG8GGXrczhzP6P70pAURHY" 
              alt="Knowledge Journey Illustration" 
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm border-t border-slate-100 flex flex-col items-center gap-1">
            <p className="text-slate-400 text-[10px]">
              <span className="font-semibold text-slate-500">Tác giả:</span> <span className="text-emerald-600 font-bold">Hoàng Nhung - TH Tân Long</span>
            </p>
            <div className="flex gap-4">
              <p className="text-slate-400 text-[10px]">
                <span className="font-semibold text-slate-500">Zalo:</span> 
                <a href="tel:0967414304" className="text-emerald-600 font-bold hover:underline">0967414304</a>
              </p>
              <p className="text-slate-400 text-[10px]">
                <span className="font-semibold text-slate-500">Facebook:</span> 
                <a href="https://www.facebook.com/search/top?q=Hoàng Nhung" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline">Hoàng Nhung</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-[50%] p-6 sm:p-10 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <img 
                  src="https://lh3.googleusercontent.com/d/1VWaxXcAIO58YPKVWb6wKeiBtDcIF65OM" 
                  alt="Bản đồ Tri thức Logo" 
                  className="w-full h-full object-contain relative z-10"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-3xl font-black text-[#1a202c] mb-1 tracking-tight">Bản đồ Tri thức</h1>
              <p className="text-[#718096] font-bold text-base">Đăng nhập để tiếp tục hành trình</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Tên đăng nhập</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    required
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-slate-700 font-medium text-sm placeholder:text-slate-300"
                    placeholder="student hoặc teacher"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 ml-1">Mật khẩu</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-slate-700 font-medium text-sm placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-2 border-slate-200 text-emerald-500 focus:ring-emerald-500 transition-all cursor-pointer" 
                  />
                  <span className="text-xs text-slate-500 font-bold group-hover:text-slate-700 transition-colors">Ghi nhớ</span>
                </label>
                <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Quên mật khẩu?</button>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#10b981] text-white rounded-2xl font-black text-lg hover:bg-[#059669] transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
              >
                {loading ? 'Đang xử lý...' : (
                  <>Đăng nhập <ArrowRight size={22} /></>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400 font-bold text-sm">Vui lòng liên hệ giáo viên để nhận tài khoản</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
