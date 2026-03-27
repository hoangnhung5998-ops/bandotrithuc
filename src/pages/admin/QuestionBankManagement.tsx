import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter,
  CheckCircle2,
  HelpCircle,
  ListOrdered,
  Type,
  CheckSquare,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertCircle,
  FileDown,
  FileUp,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { dataProvider } from '../../core/provider';
import { Question, QuestionType, Topic } from '../../core/types';

export const QuestionBankManagement = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [formData, setFormData] = useState<Partial<Question>>({
    type: 'multiple-choice',
    text: '',
    options: ['', '', '', ''],
    matchingOptions: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 10,
    topicId: '',
    level: 'medium'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const allQuestions = await dataProvider.getList<Question>('questions');
    const allTopics = await dataProvider.getList<Topic>('topics');
    setQuestions(allQuestions);
    setTopics(allTopics);
    if (allTopics.length > 0 && !formData.topicId) {
      setFormData(prev => ({ ...prev, topicId: allTopics[0].id }));
    }
  };

  const handleOpenModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({ ...question });
    } else {
      setEditingQuestion(null);
      setFormData({
        type: 'multiple-choice',
        text: '',
        options: ['', '', '', ''],
        matchingOptions: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        points: 10,
        topicId: topics[0]?.id || '',
        level: 'medium'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      await dataProvider.update('questions', editingQuestion.id, formData);
    } else {
      await dataProvider.create('questions', formData);
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    setQuestionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (questionToDelete) {
      await dataProvider.delete('questions', questionToDelete);
      setIsDeleteModalOpen(false);
      setQuestionToDelete(null);
      fetchData();
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nội dung câu hỏi': 'Ai là người lãnh đạo cuộc khởi nghĩa Hai Bà Trưng?',
        'Loại câu hỏi': 'trac-nghiem',
        'Lựa chọn 1': 'Hai Bà Trưng',
        'Lựa chọn 2': 'Trần Hưng Đạo',
        'Lựa chọn 3': 'Lê Lợi',
        'Lựa chọn 4': 'Ngô Quyền',
        'Đáp án đúng': '1',
        'Giải thích': 'Cuộc khởi nghĩa Hai Bà Trưng do Trưng Trắc và Trưng Nhị lãnh đạo năm 40.',
        'Điểm': 10,
        'ID Chủ đề': topics[0]?.id || 't1',
        'Mức độ': 'easy'
      },
      {
        'Nội dung câu hỏi': 'Phố cổ Hội An nằm ở tỉnh Quảng Nam.',
        'Loại câu hỏi': 'dung-sai',
        'Lựa chọn 1': '',
        'Lựa chọn 2': '',
        'Lựa chọn 3': '',
        'Lựa chọn 4': '',
        'Đáp án đúng': 'Đúng',
        'Giải thích': 'Đúng, Phố cổ Hội An thuộc tỉnh Quảng Nam.',
        'Điểm': 5,
        'ID Chủ đề': topics[0]?.id || 't1',
        'Mức độ': 'easy'
      },
      {
        'Nội dung câu hỏi': 'Sông Hồng còn được gọi là sông ____.',
        'Loại câu hỏi': 'dien-khuyet',
        'Lựa chọn 1': '',
        'Lựa chọn 2': '',
        'Lựa chọn 3': '',
        'Lựa chọn 4': '',
        'Đáp án đúng': 'Cái',
        'Giải thích': 'Sông Hồng còn có tên gọi khác là sông Cái.',
        'Điểm': 10,
        'ID Chủ đề': topics[0]?.id || 't1',
        'Mức độ': 'medium'
      },
      {
        'Nội dung câu hỏi': 'Vị tướng nào đã ba lần đánh bại quân Nguyên Mông?',
        'Loại câu hỏi': 'tra-loi-ngan',
        'Lựa chọn 1': '',
        'Lựa chọn 2': '',
        'Lựa chọn 3': '',
        'Lựa chọn 4': '',
        'Đáp án đúng': 'Trần Hưng Đạo',
        'Giải thích': 'Trần Hưng Đạo là vị tướng tài ba của nhà Trần.',
        'Điểm': 15,
        'ID Chủ đề': topics[0]?.id || 't1',
        'Mức độ': 'medium'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Add a second sheet with instructions
    const instructions = [
      ['HƯỚNG DẪN NHẬP CÂU HỎI'],
      [''],
      ['1. Loại câu hỏi: trac-nghiem, tra-loi-ngan, sap-xep, dien-khuyet, dung-sai, noi-cot'],
      ['2. Đáp án đúng:'],
      ['   - Trắc nghiệm: Nhập số 1, 2, 3, 4 hoặc chữ A, B, C, D'],
      ['   - Đúng sai: Nhập Đúng/Sai hoặc True/False'],
      ['   - Điền khuyết: Nhập từ cần điền, nếu nhiều từ thì cách nhau bằng dấu phẩy'],
      ['   - Trả lời ngắn: Nhập nội dung đáp án'],
      ['   - Nối cột: Hệ thống sẽ tự động ghép cặp theo thứ tự Lựa chọn trái 1 - Lựa chọn phải 1, v.v.'],
      ['3. Mức độ: easy, medium, hard'],
      ['4. ID Chủ đề: Lấy từ danh sách chủ đề (ví dụ: t1, t2...)']
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(instructions);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sach cau hoi');
    XLSX.utils.book_append_sheet(wb, ws2, 'Huong dan');
    XLSX.writeFile(wb, 'mau_cau_hoi_ngan_hang.xlsx');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
          try {
            // Normalize keys to lowercase and remove spaces for easier matching
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
              const normalizedKey = key.toLowerCase().trim()
                .replace(/\s+/g, '')
                .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
              normalizedRow[normalizedKey] = row[key];
            });

            const text = normalizedRow['noidungcauhoi'] || normalizedRow['text'] || normalizedRow['cauhoi'];
            if (!text) continue;

            let type = (normalizedRow['loaicauhoi'] || normalizedRow['type'] || 'multiple-choice') as QuestionType;
            
            // Map Vietnamese type names to internal types
            const typeStr = String(type).toLowerCase();
            if (typeStr.includes('tracnghiem')) type = 'multiple-choice';
            else if (typeStr.includes('traloingan')) type = 'short-answer';
            else if (typeStr.includes('sapxep')) type = 'sorting';
            else if (typeStr.includes('dienkhuyet')) type = 'fill-in-the-blanks';
            else if (typeStr.includes('dungsai')) type = 'true-false';
            else if (typeStr.includes('noicot') || typeStr.includes('matching')) type = 'matching';

            let options: string[] | undefined = undefined;
            let matchingOptions: string[] | undefined = undefined;
            let correctAnswer: any = normalizedRow['dapandung'] || normalizedRow['correctanswer'] || normalizedRow['dapan'];

            if (type === 'multiple-choice' || type === 'sorting') {
              options = [
                normalizedRow['luachon1'] || normalizedRow['option1'] || normalizedRow['a'],
                normalizedRow['luachon2'] || normalizedRow['option2'] || normalizedRow['b'],
                normalizedRow['luachon3'] || normalizedRow['option3'] || normalizedRow['c'],
                normalizedRow['luachon4'] || normalizedRow['option4'] || normalizedRow['d'],
              ].filter(v => v !== undefined && v !== null && v !== '');
              
              if (type === 'multiple-choice') {
                // Handle 1-based index or letter
                if (typeof correctAnswer === 'string') {
                  const upperAns = correctAnswer.toUpperCase();
                  if (upperAns === 'A') correctAnswer = 0;
                  else if (upperAns === 'B') correctAnswer = 1;
                  else if (upperAns === 'C') correctAnswer = 2;
                  else if (upperAns === 'D') correctAnswer = 3;
                  else {
                    const num = parseInt(correctAnswer);
                    correctAnswer = !isNaN(num) ? num - 1 : 0;
                  }
                } else if (typeof correctAnswer === 'number') {
                  correctAnswer = correctAnswer - 1; // Assume 1-based
                }
                if (isNaN(correctAnswer) || correctAnswer < 0) correctAnswer = 0;
              } else {
                // Sorting: default to original order if not specified
                correctAnswer = options.map((_, i) => i);
              }
            } else if (type === 'matching') {
              options = [
                normalizedRow['luachontrai1'] || normalizedRow['optionleft1'] || normalizedRow['left1'],
                normalizedRow['luachontrai2'] || normalizedRow['optionleft2'] || normalizedRow['left2'],
                normalizedRow['luachontrai3'] || normalizedRow['optionleft3'] || normalizedRow['left3'],
                normalizedRow['luachontrai4'] || normalizedRow['optionleft4'] || normalizedRow['left4'],
              ].filter(v => v !== undefined && v !== null && v !== '');

              matchingOptions = [
                normalizedRow['luachonphai1'] || normalizedRow['optionright1'] || normalizedRow['right1'],
                normalizedRow['luachonphai2'] || normalizedRow['optionright2'] || normalizedRow['right2'],
                normalizedRow['luachonphai3'] || normalizedRow['optionright3'] || normalizedRow['right3'],
                normalizedRow['luachonphai4'] || normalizedRow['optionright4'] || normalizedRow['right4'],
              ].filter(v => v !== undefined && v !== null && v !== '');

              // Default matching is 0-0, 1-1, 2-2...
              correctAnswer = {};
              options.forEach((_, i) => {
                correctAnswer[i] = i;
              });
            } else if (type === 'true-false') {
              const val = String(correctAnswer).toLowerCase();
              correctAnswer = val === 'true' || val === 'dung' || val === '1' || val === 't' || val === 'd';
            } else if (type === 'fill-in-the-blanks') {
              correctAnswer = String(correctAnswer).split(/[,;|]/).map(s => s.trim());
            }

            const points = parseInt(normalizedRow['diem'] || normalizedRow['points']) || 10;
            const levelRaw = (normalizedRow['mucdo'] || normalizedRow['level'] || 'medium').toLowerCase();
            const level = ['easy', 'medium', 'hard'].includes(levelRaw) ? levelRaw : 'medium';
            const topicId = normalizedRow['idchude'] || normalizedRow['topicid'] || topics[0]?.id || '';

            const newQuestion: Partial<Question> = {
              text,
              type,
              options,
              matchingOptions,
              correctAnswer,
              explanation: normalizedRow['giaithich'] || normalizedRow['explanation'],
              points,
              topicId,
              level: level as any
            };

            await dataProvider.create('questions', newQuestion);
            successCount++;
          } catch (err) {
            console.error('Row import error:', err, row);
            errorCount++;
          }
        }

        alert(`Nhập hoàn tất!\n- Thành công: ${successCount}\n- Thất bại: ${errorCount}`);
        fetchData();
      } catch (error) {
        console.error('Import error:', error);
        alert('Có lỗi xảy ra khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
      } finally {
        setIsImporting(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = (q.text || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || q.type === typeFilter;
    const matchesTopic = topicFilter === 'all' || q.topicId === topicFilter;
    return matchesSearch && matchesType && matchesTopic;
  });

  const getTopicName = (id?: string) => {
    if (!id) return 'Không xác định';
    const topic = topics.find(t => t.id === id);
    return topic ? topic.title : 'Không xác định';
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'multiple-choice': return 'Trắc nghiệm';
      case 'short-answer': return 'Trả lời ngắn';
      case 'sorting': return 'Sắp xếp';
      case 'fill-in-the-blanks': return 'Điền khuyết';
      case 'true-false': return 'Đúng sai';
      case 'matching': return 'Nối cột';
      default: return type;
    }
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'multiple-choice': return <CheckCircle2 size={16} />;
      case 'short-answer': return <Type size={16} />;
      case 'sorting': return <ListOrdered size={16} />;
      case 'fill-in-the-blanks': return <HelpCircle size={16} />;
      case 'true-false': return <CheckSquare size={16} />;
      case 'matching': return <ListOrdered size={16} />;
      default: return <HelpCircle size={16} />;
    }
  };

  const renderAnswerInput = () => {
    switch (formData.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">Các lựa chọn & Đáp án đúng</label>
            <div className="grid grid-cols-1 gap-3">
              {(formData.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="correctAnswer" 
                    checked={formData.correctAnswer === idx}
                    onChange={() => setFormData({ ...formData, correctAnswer: idx })}
                    className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                  />
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={(e) => {
                      const newOpts = [...(formData.options || [])];
                      newOpts[idx] = e.target.value;
                      setFormData({ ...formData, options: newOpts });
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
                    placeholder={`Lựa chọn ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case 'true-false':
        return (
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">Đáp án đúng</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tfAnswer" 
                  checked={formData.correctAnswer === true}
                  onChange={() => setFormData({ ...formData, correctAnswer: true })}
                  className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-slate-700">Đúng</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tfAnswer" 
                  checked={formData.correctAnswer === false}
                  onChange={() => setFormData({ ...formData, correctAnswer: false })}
                  className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-slate-700">Sai</span>
              </label>
            </div>
          </div>
        );
      case 'short-answer':
        return (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Đáp án đúng</label>
            <input 
              type="text" 
              value={formData.correctAnswer || ''} 
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
              placeholder="Nhập đáp án đúng..."
            />
          </div>
        );
      case 'sorting':
        return (
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">Các mục cần sắp xếp (theo thứ tự đúng)</label>
            <div className="space-y-2">
              {(formData.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={(e) => {
                      const newOpts = [...(formData.options || [])];
                      newOpts[idx] = e.target.value;
                      setFormData({ ...formData, options: newOpts });
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
                    placeholder={`Mục ${idx + 1}`}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const newOpts = (formData.options || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, options: newOpts });
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, options: [...(formData.options || []), ''] })}
                className="text-sky-500 text-sm font-bold flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Thêm mục
              </button>
            </div>
          </div>
        );
      case 'fill-in-the-blanks':
        return (
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">Các từ cần điền (theo thứ tự)</label>
            <div className="space-y-2">
              {(Array.isArray(formData.correctAnswer) ? formData.correctAnswer : []).map((ans, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                  <input 
                    type="text" 
                    value={ans} 
                    onChange={(e) => {
                      const newAns = [...(formData.correctAnswer || [])];
                      newAns[idx] = e.target.value;
                      setFormData({ ...formData, correctAnswer: newAns });
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
                    placeholder={`Từ ${idx + 1}`}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const newAns = (formData.correctAnswer || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, correctAnswer: newAns });
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, correctAnswer: [...(Array.isArray(formData.correctAnswer) ? formData.correctAnswer : []), ''] })}
                className="text-sky-500 text-sm font-bold flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Thêm từ
              </button>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Sử dụng dấu gạch dưới (____) trong phần nội dung câu hỏi để đánh dấu vị trí cần điền.
              </p>
            </div>
          </div>
        );
      case 'matching':
        return (
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">Thiết lập các cặp nối</label>
            <div className="space-y-3">
              {(formData.options || []).map((opt, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-1 text-xs font-bold text-slate-400">{idx + 1}.</div>
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={(e) => {
                      const newOpts = [...(formData.options || [])];
                      newOpts[idx] = e.target.value;
                      setFormData({ ...formData, options: newOpts });
                    }}
                    className="col-span-5 px-4 py-2 rounded-xl border border-slate-200 text-sm"
                    placeholder="Cột trái"
                  />
                  <div className="col-span-1 flex justify-center">
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                  <input 
                    type="text" 
                    value={(formData.matchingOptions || [])[idx] || ''} 
                    onChange={(e) => {
                      const newMatchOpts = [...(formData.matchingOptions || [])];
                      newMatchOpts[idx] = e.target.value;
                      setFormData({ ...formData, matchingOptions: newMatchOpts });
                    }}
                    className="col-span-4 px-4 py-2 rounded-xl border border-slate-200 text-sm"
                    placeholder="Cột phải"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const newOpts = (formData.options || []).filter((_, i) => i !== idx);
                      const newMatchOpts = (formData.matchingOptions || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, options: newOpts, matchingOptions: newMatchOpts });
                    }}
                    className="col-span-1 text-slate-400 hover:text-red-500 flex justify-end"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  options: [...(formData.options || []), ''],
                  matchingOptions: [...(formData.matchingOptions || []), '']
                })}
                className="text-sky-500 text-sm font-bold flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Thêm cặp nối
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ngân hàng câu hỏi</h2>
          <p className="text-slate-500">Quản lý kho câu hỏi cho các bài kiểm tra</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleDownloadTemplate}
            className="bg-white text-slate-600 px-4 py-3 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <FileDown size={20} /> Tải mẫu Excel
          </button>
          <label className="bg-white text-slate-600 px-4 py-3 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer">
            {isImporting ? <Loader2 size={20} className="animate-spin" /> : <FileUp size={20} />}
            {isImporting ? 'Đang nhập...' : 'Nhập từ Excel'}
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} disabled={isImporting} />
          </label>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-sky-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-sky-600 transition-all flex items-center gap-2 shadow-lg shadow-sky-100"
          >
            <Plus size={20} /> Thêm câu hỏi mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm câu hỏi..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm"
          >
            <option value="all">Tất cả loại</option>
            <option value="multiple-choice">Trắc nghiệm</option>
            <option value="short-answer">Trả lời ngắn</option>
            <option value="sorting">Sắp xếp</option>
            <option value="fill-in-the-blanks">Điền khuyết</option>
            <option value="true-false">Đúng sai</option>
            <option value="matching">Nối cột</option>
          </select>
          <select 
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm"
          >
            <option value="all">Tất cả chủ đề</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuestions.map((q) => (
          <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {getQuestionTypeIcon(q.type)}
                    {getQuestionTypeLabel(q.type)}
                  </span>
                  <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {getTopicName(q.topicId)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    q.level === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                    q.level === 'hard' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {q.level === 'easy' ? 'Dễ' : q.level === 'hard' ? 'Khó' : 'Trung bình'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {q.points} điểm
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{q.text}</h3>
                {q.explanation && (
                  <p className="text-sm text-slate-500 italic">Giải thích: {q.explanation}</p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(q)}
                  className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            Không tìm thấy câu hỏi nào.
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{editingQuestion ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi mới'}</h3>
                  <p className="text-sm text-slate-500">Thiết lập nội dung và đáp án cho câu hỏi</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 overflow-auto flex-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Loại câu hỏi</label>
                    <select 
                      value={formData.type} 
                      onChange={(e) => {
                        const type = e.target.value as QuestionType;
                        let correctAnswer: any = 0;
                        let options: string[] | undefined = undefined;
                        
                        if (type === 'true-false') correctAnswer = true;
                        if (type === 'short-answer') correctAnswer = '';
                        if (type === 'multiple-choice') options = ['', '', '', ''];
                        if (type === 'sorting') {
                          options = ['', '', ''];
                          correctAnswer = [0, 1, 2];
                        }
                        if (type === 'fill-in-the-blanks') correctAnswer = [''];
                        if (type === 'matching') {
                          options = ['', ''];
                          const newMatchingOptions = ['', ''];
                          correctAnswer = { 0: 0, 1: 1 };
                          setFormData({ ...formData, type, correctAnswer, options, matchingOptions: newMatchingOptions });
                        } else {
                          setFormData({ ...formData, type, correctAnswer, options });
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="multiple-choice">Trắc nghiệm</option>
                      <option value="short-answer">Trả lời ngắn</option>
                      <option value="sorting">Sắp xếp</option>
                      <option value="fill-in-the-blanks">Điền khuyết</option>
                      <option value="true-false">Đúng sai</option>
                      <option value="matching">Nối cột</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Chủ đề</label>
                    <select 
                      value={formData.topicId} 
                      onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Độ khó</label>
                    <select 
                      value={formData.level} 
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Điểm số</label>
                    <input 
                      type="number" 
                      value={formData.points} 
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nội dung câu hỏi</label>
                  <textarea 
                    required 
                    value={formData.text} 
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 resize-none"
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  {renderAnswerInput()}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Giải thích đáp án (Tùy chọn)</label>
                  <textarea 
                    value={formData.explanation} 
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 resize-none"
                    placeholder="Giải thích tại sao đáp án này đúng..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all">Hủy</button>
                  <button type="submit" className="flex-[2] bg-sky-500 text-white py-3 rounded-2xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-100">
                    {editingQuestion ? 'Lưu thay đổi' : 'Tạo câu hỏi'}
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
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa</h3>
              <p className="text-slate-500 mb-8">Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                >
                  Xóa ngay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
