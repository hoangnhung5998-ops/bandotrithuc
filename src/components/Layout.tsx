import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Map as MapIcon, 
  Award, 
  MessageSquare, 
  Gamepad2,
  LogOut,
  Menu,
  X,
  Sparkles,
  History,
  Gamepad,
  BarChart,
  FileText,
  CheckSquare,
  ClipboardList,
  Star,
  Bell,
  Database,
  User,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { dataProvider } from '../core/provider';
import { User as UserType } from '../core/types';

interface SidebarItemProps {
  key?: string;
  to: string;
  icon: any;
  label: string;
  onClick?: () => void;
}

const SidebarItem = ({ to, icon: Icon, label, onClick }: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${isActive 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'}
      `}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export const MainLayout = ({ role }: { role: 'admin' | 'app' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const toastId = toast.loading('Đang đồng bộ dữ liệu...');
    
    try {
      await dataProvider.sync();
      toast.success('Đồng bộ dữ liệu thành công!', { id: toastId });
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Đồng bộ thất bại. Vui lòng thử lại.', { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Initialize sidebar state based on screen size
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }

    const fetchUser = async () => {
      const currentUser = await dataProvider.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await dataProvider.logout();
    navigate('/login');
  };

  const menuItems = role === 'admin' 
    ? [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
        { to: '/admin/classes', icon: Users, label: 'Quản lý lớp học' },
        { to: '/admin/students', icon: Users, label: 'Quản lý học sinh' },
        { to: '/admin/lessons', icon: BookOpen, label: 'Quản lý bài học' },
        { to: '/admin/questions', icon: Database, label: 'Ngân hàng câu hỏi' },
        { to: '/admin/assignments', icon: FileText, label: 'Quản lý bài tập' },
        { to: '/admin/games', icon: Gamepad2, label: 'Quản lý trò chơi' },
        { to: '/admin/heritage', icon: MapIcon, label: 'Di sản số' },
        { to: '/admin/gradebook', icon: ClipboardList, label: 'Sổ điểm lớp' },
        { to: '/admin/reports', icon: BarChart, label: 'Báo cáo tiến độ' },
        { to: '/admin/announcements', icon: Bell, label: 'Thông báo' },
      ]
    : [
        { to: '/app/home', icon: LayoutDashboard, label: 'Trang chủ' },
        { to: '/app/lessons', icon: BookOpen, label: 'Bài học của em' },
        { to: '/app/assignments', icon: FileText, label: 'Bài tập của em' },
        { to: '/app/digital-heritage', icon: History, label: 'Di sản số' },
        { to: '/app/games', icon: Gamepad2, label: 'Trò chơi học tập' },
        { to: '/app/profile', icon: User, label: 'Hồ sơ & Thành tích' },
        { to: '/app/announcements', icon: Bell, label: 'Thông báo' },
      ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
          transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">
              Bản đồ <br /> Tri thức
            </h1>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.to} 
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
              />
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="mt-6 flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>

          {/* Developer Credit */}
          <div className="mt-8 pt-6 border-t border-slate-100 px-2">
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
              Tác giả <span className="text-emerald-600">Hoàng Nhung - TH Tân Long</span>
            </p>
            <div className="flex flex-col gap-1 mt-2 text-[9px] font-bold text-slate-400">
              <a href="https://zalo.me/0967414304" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
                Zalo: <span className="text-emerald-600">0967414304</span>
              </a>
              <span>Facebook: <a href="https://www.facebook.com/share/1FjbHBoioi/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="text-emerald-600 hover:opacity-80 transition-opacity">Hoàng Nhung</a></span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${isSyncing 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95'}
              `}
              title="Đồng bộ dữ liệu từ Google Sheets"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name || 'Người dùng'}</p>
              <p className="text-xs text-slate-500">
                {user?.role === 'teacher' || user?.role === 'admin' ? 'Giáo viên' : `Học sinh ${user?.classId ? `lớp ${user.classId}` : ''}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm overflow-hidden">
              <img src={`https://picsum.photos/seed/${user?.id || 'user'}/100/100`} alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
