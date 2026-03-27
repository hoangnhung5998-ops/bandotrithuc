import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataProvider } from '../../core/provider';
import { HistoricalFigure, Message } from '../../core/types';

export const AIChat = () => {
  const [figures, setFigures] = useState<HistoricalFigure[]>([]);
  const [selectedFigure, setSelectedFigure] = useState<HistoricalFigure | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dataProvider.getList<HistoricalFigure>('historicalFigures').then(setFigures);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartChat = async (figure: HistoricalFigure) => {
    setSelectedFigure(figure);
    const conv = await dataProvider.startAIConversation(figure.id);
    setConversationId(conv.id);
    setMessages(conv.messages);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const aiMsg = await dataProvider.sendMessageToCharacter(conversationId, input);
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  if (!selectedFigure) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Nhân vật Lịch sử</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {figures.map(figure => (
            <motion.div
              key={figure.id}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleStartChat(figure)}
            >
              <img 
                src={figure.avatar || undefined} 
                alt={figure.name} 
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-emerald-50 object-cover"
                referrerPolicy="no-referrer"
              />
              <h3 className="text-lg font-bold text-center text-slate-800">{figure.name}</h3>
              <p className="text-sm text-center text-emerald-600 font-medium mb-2">{figure.title}</p>
              <p className="text-xs text-slate-500 text-center line-clamp-2">{figure.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-emerald-50">
        <button 
          onClick={() => setSelectedFigure(null)}
          className="text-emerald-600 font-medium hover:underline"
        >
          Quay lại
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
          <img src={selectedFigure.avatar || undefined} alt={selectedFigure.name} referrerPolicy="no-referrer" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{selectedFigure.name}</h3>
          <p className="text-xs text-emerald-600">Đang trực tuyến</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                  {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-500 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 italic">
                {selectedFigure.name} đang trả lời...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi về lịch sử..."
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-100"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
