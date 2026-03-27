import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Application Error:', error);

  let errorMessage = 'Đã có lỗi xảy ra ngoài ý muốn.';
  let errorDetail = '';

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
    errorDetail = error.data?.message || error.data || '';
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetail = error.stack || '';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl border border-slate-100 p-10 text-center space-y-8">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
          <AlertTriangle size={40} />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-slate-800">Lỗi ứng dụng!</h1>
          <p className="text-slate-500 font-medium">
            {errorMessage}
          </p>
          {errorDetail && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl text-left overflow-auto max-h-40">
              <code className="text-[10px] text-slate-400 font-mono whitespace-pre">
                {errorDetail}
              </code>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            <RefreshCcw size={18} /> Thử lại
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Home size={18} /> Trang chủ
          </button>
        </div>
        
        <p className="text-[10px] text-slate-400 pt-4">
          Nếu lỗi vẫn tiếp diễn, vui lòng liên hệ quản trị viên hoặc thử tắt Google Translate nếu đang bật.
        </p>
      </div>
    </div>
  );
};
