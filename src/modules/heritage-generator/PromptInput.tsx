import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { dataProvider } from '../../core/provider';

export const HeritageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const url = await dataProvider.generateHeritageImage(prompt);
      setGeneratedImage(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Di sản số</h2>
        <p className="text-slate-500">Mô tả di sản bạn muốn thấy, AI sẽ vẽ nó cho bạn!</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ví dụ: Một ngôi chùa cổ kính bên hồ sen, phong cách tranh thủy mặc..."
              className="w-full h-32 p-6 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all resize-none text-lg"
            />
            <div className="absolute bottom-4 right-4 text-slate-400 text-sm">
              {prompt.length}/200
            </div>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" /> Đang sáng tác...
              </>
            ) : (
              <>
                <Sparkles /> Bắt đầu vẽ
              </>
            )}
          </button>
        </form>
      </div>

      {generatedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 overflow-hidden group relative"
        >
          <img 
            src={generatedImage} 
            alt="Generated Heritage" 
            className="w-full aspect-video object-cover rounded-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button className="bg-white text-slate-800 p-4 rounded-full hover:scale-110 transition-transform shadow-lg">
              <Download size={24} />
            </button>
            <button className="bg-emerald-500 text-white p-4 rounded-full hover:scale-110 transition-transform shadow-lg">
              <RefreshCw size={24} />
            </button>
          </div>
        </motion.div>
      )}

      {!generatedImage && !isGenerating && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center">
              <ImageIcon size={32} className="text-slate-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
