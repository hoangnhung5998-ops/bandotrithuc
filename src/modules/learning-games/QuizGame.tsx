import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Trophy, ArrowRight, HelpCircle, ListOrdered, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGoogleDriveDirectLink } from '../../core/utils';
import { Question, Quiz, Game } from '../../core/types';
import { dataProvider } from '../../core/provider';

export const QuizGame = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [sortingItems, setSortingItems] = useState<any[]>([]);
  const [fillBlanks, setFillBlanks] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<Record<number, number>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const game = await dataProvider.getOne<Game>('games', quizId!);
        if (game && game.questionIds && game.questionIds.length > 0) {
          const allQuestions = await dataProvider.getList<Question>('questions');
          const gameQuestions = allQuestions.filter(q => game.questionIds?.includes(q.id));
          
          setQuiz({
            id: game.id,
            title: game.title,
            questions: gameQuestions
          });
        } else {
          // Fallback to quizzes collection if game not found or has no questions
          const allQuizzes = await dataProvider.getList<Quiz>('quizzes');
          const foundQuiz = allQuizzes.find(q => q.id === quizId) || allQuizzes[0];
          setQuiz(foundQuiz);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        // Fallback
        try {
          const allQuizzes = await dataProvider.getList<Quiz>('quizzes');
          setQuiz(allQuizzes[0]);
        } catch (e) {
          console.error('Final fallback failed:', e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions[currentStep]) {
      const question = quiz.questions[currentStep];
      if (question.type === 'sorting') {
        setSortingItems([...(question.options || [])].sort(() => Math.random() - 0.5));
      } else if (question.type === 'fill-in-the-blanks') {
        const blankCount = question.text.match(/\[\.\.\.\]/g)?.length || 0;
        setFillBlanks(new Array(blankCount).fill(''));
      }
    }
  }, [quiz, currentStep]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <HelpCircle size={48} className="mx-auto text-slate-200" />
        <p className="text-slate-500 font-bold">Không tìm thấy dữ liệu trò chơi!</p>
        <button onClick={() => navigate('/app/games')} className="text-emerald-600 font-bold hover:underline">Quay lại</button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentStep];

  const handleSelect = (index: any) => {
    if (isAnswered) return;
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
      setSelectedOption(index);
    }
  };

  const moveSortingItem = (from: number, to: number) => {
    if (isAnswered) return;
    const newItems = [...sortingItems];
    const [movedItem] = newItems.splice(from, 1);
    newItems.splice(to, 0, movedItem);
    setSortingItems(newItems);
  };

  const handleMatch = (leftIdx: number, rightIdx: number) => {
    if (isAnswered) return;
    setMatchingPairs(prev => ({
      ...prev,
      [leftIdx]: rightIdx
    }));
  };

  const handleCheck = () => {
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
      if (selectedOption === null) return;
      setIsAnswered(true);
      if (selectedOption === currentQuestion.correctAnswer) {
        setScore(score + 1);
      }
    } else if (currentQuestion.type === 'short-answer') {
      if (!shortAnswer.trim()) return;
      setIsAnswered(true);
      const isCorrect = shortAnswer.trim().toLowerCase() === String(currentQuestion.correctAnswer).toLowerCase();
      if (isCorrect) setScore(score + 1);
    } else if (currentQuestion.type === 'sorting') {
      setIsAnswered(true);
      const isCorrect = sortingItems.every((item, idx) => item === currentQuestion.options?.[currentQuestion.correctAnswer[idx]]);
      if (isCorrect) setScore(score + 1);
    } else if (currentQuestion.type === 'fill-in-the-blanks') {
      if (fillBlanks.some(b => !b.trim())) return;
      setIsAnswered(true);
      const isCorrect = fillBlanks.every((val, idx) => val.trim().toLowerCase() === currentQuestion.correctAnswer[idx].toLowerCase());
      if (isCorrect) setScore(score + 1);
    } else if (currentQuestion.type === 'matching') {
      if (Object.keys(matchingPairs).length < (currentQuestion.options?.length || 0)) return;
      setIsAnswered(true);
      const isCorrect = Object.entries(currentQuestion.correctAnswer).every(([k, v]) => matchingPairs[Number(k)] === v);
      if (isCorrect) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < quiz.questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setShortAnswer('');
      setMatchingPairs({});
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
      case 'true-false':
        const options = currentQuestion.type === 'true-false' ? ['Đúng', 'Sai'] : currentQuestion.options;
        return (
          <div className="grid grid-cols-1 gap-4">
            {options?.map((option, index) => {
              let statusClass = 'border-slate-100 hover:border-emerald-200 hover:bg-emerald-50';
              if (isAnswered) {
                if (index === currentQuestion.correctAnswer) {
                  statusClass = 'border-emerald-500 bg-emerald-50 text-emerald-700';
                } else if (index === selectedOption) {
                  statusClass = 'border-red-500 bg-red-50 text-red-700';
                } else {
                  statusClass = 'border-slate-100 opacity-50';
                }
              } else if (index === selectedOption) {
                statusClass = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border-2 text-left font-medium transition-all flex items-center justify-between ${statusClass}`}
                >
                  <span>{option}</span>
                  {isAnswered && index === currentQuestion.correctAnswer && <CheckCircle2 size={20} />}
                  {isAnswered && index === selectedOption && index !== currentQuestion.correctAnswer && <XCircle size={20} />}
                </button>
              );
            })}
          </div>
        );
      case 'short-answer':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              disabled={isAnswered}
              placeholder="Nhập câu trả lời của bạn..."
              className={`w-full p-4 rounded-2xl border-2 font-medium transition-all outline-none
                ${isAnswered 
                  ? (shortAnswer.trim().toLowerCase() === String(currentQuestion.correctAnswer).toLowerCase()
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-red-500 bg-red-50 text-red-700')
                  : 'border-slate-100 focus:border-emerald-500 focus:bg-emerald-50'
                }
              `}
            />
            {isAnswered && shortAnswer.trim().toLowerCase() !== String(currentQuestion.correctAnswer).toLowerCase() && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-sm text-emerald-800">
                  <strong>Đáp án đúng:</strong> {currentQuestion.correctAnswer}
                </p>
              </div>
            )}
          </div>
        );
      case 'sorting':
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 italic mb-2">Sắp xếp các mục theo thứ tự đúng:</p>
            {sortingItems.map((item, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all
                  ${isAnswered 
                    ? (item === currentQuestion.options?.[currentQuestion.correctAnswer[idx]]
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-red-500 bg-red-50 text-red-700')
                    : 'border-slate-100 bg-white shadow-sm'
                  }
                `}
              >
                <div className="flex flex-col gap-1">
                  <button 
                    disabled={isAnswered || idx === 0}
                    onClick={() => moveSortingItem(idx, idx - 1)}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-0"
                  >
                    <ArrowRight className="-rotate-90" size={14} />
                  </button>
                  <button 
                    disabled={isAnswered || idx === sortingItems.length - 1}
                    onClick={() => moveSortingItem(idx, idx + 1)}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-0"
                  >
                    <ArrowRight className="rotate-90" size={14} />
                  </button>
                </div>
                <span className="font-medium">{item}</span>
                {isAnswered && item === currentQuestion.options?.[currentQuestion.correctAnswer[idx]] && <CheckCircle2 size={18} className="ml-auto" />}
                {isAnswered && item !== currentQuestion.options?.[currentQuestion.correctAnswer[idx]] && <XCircle size={18} className="ml-auto" />}
              </div>
            ))}
          </div>
        );
      case 'fill-in-the-blanks':
        const parts = currentQuestion.text.split(/\[\.\.\.\]/);
        return (
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 leading-loose text-lg">
            {parts.map((part, idx) => (
              <React.Fragment key={idx}>
                {part}
                {idx < parts.length - 1 && (
                  <input
                    type="text"
                    value={fillBlanks[idx] || ''}
                    onChange={(e) => {
                      const newBlanks = [...fillBlanks];
                      newBlanks[idx] = e.target.value;
                      setFillBlanks(newBlanks);
                    }}
                    disabled={isAnswered}
                    className={`mx-2 px-3 py-1 rounded-lg border-2 w-32 text-center transition-all outline-none
                      ${isAnswered 
                        ? (fillBlanks[idx]?.trim().toLowerCase() === currentQuestion.correctAnswer[idx].toLowerCase()
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-red-500 bg-red-50 text-red-700')
                        : 'border-slate-300 focus:border-emerald-500'
                      }
                    `}
                  />
                )}
              </React.Fragment>
            ))}
            {isAnswered && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-sm text-emerald-800">
                  <strong>Đáp án đúng:</strong> {currentQuestion.correctAnswer.join(', ')}
                </p>
              </div>
            )}
          </div>
        );
      case 'matching':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cột A</p>
                {currentQuestion.options?.map((opt, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium min-h-[60px] flex items-center">
                    {idx + 1}. {opt}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cột B</p>
                {currentQuestion.options?.map((_, idx) => (
                  <select
                    key={idx}
                    disabled={isAnswered}
                    value={matchingPairs[idx] ?? ''}
                    onChange={(e) => handleMatch(idx, Number(e.target.value))}
                    className={`w-full p-4 rounded-2xl border-2 text-sm font-medium min-h-[60px] transition-all outline-none
                      ${isAnswered 
                        ? (matchingPairs[idx] === currentQuestion.correctAnswer[idx] 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-red-500 bg-red-50 text-red-700')
                        : 'border-slate-100 focus:border-emerald-500 focus:bg-emerald-50'
                      }
                    `}
                  >
                    <option value="" disabled>Chọn đáp án...</option>
                    {currentQuestion.matchingOptions?.map((mOpt, mIdx) => (
                      <option key={mIdx} value={mIdx}>{mOpt}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
            {isAnswered && (
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Đáp án đúng:</p>
                <div className="space-y-1">
                  {currentQuestion.options?.map((opt, idx) => (
                    <div key={idx} className="text-sm text-slate-700">
                      <span className="font-bold">{opt}</span> nối với <span className="font-bold">{currentQuestion.matchingOptions?.[currentQuestion.correctAnswer[idx]]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <div className="p-8 text-center text-slate-400 italic">Loại câu hỏi này đang được cập nhật...</div>;
    }
  };

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6"
      >
        <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Chúc mừng bạn!</h2>
        <p className="text-slate-500 text-lg">Bạn đã hoàn thành thử thách với số điểm:</p>
        <div className="text-6xl font-black text-emerald-500">
          {score} / {quiz.questions.length}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200"
          >
            Chơi lại
          </button>
          <button 
            onClick={() => navigate('/app/games')}
            className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all"
          >
            Thoát
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/games')}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="text-emerald-500" /> {quiz.title}
          </h2>
        </div>
        <span className="bg-slate-100 px-4 py-1 rounded-full text-sm font-bold text-slate-500">
          Câu {currentStep + 1} / {quiz.questions.length}
        </span>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
        <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
          {currentQuestion.text}
        </h3>

        {renderQuestionContent()}

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-blue-50 rounded-2xl border border-blue-100"
            >
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Giải thích:</strong> {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4">
          {!isAnswered ? (
            <button
              onClick={handleCheck}
              disabled={
                currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false'
                  ? selectedOption === null 
                  : currentQuestion.type === 'matching'
                    ? Object.keys(matchingPairs).length < (currentQuestion.options?.length || 0)
                    : currentQuestion.type === 'short-answer'
                      ? !shortAnswer.trim()
                      : currentQuestion.type === 'fill-in-the-blanks'
                        ? fillBlanks.some(b => !b.trim())
                        : false
              }
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-xl shadow-emerald-200"
            >
              Kiểm tra đáp án
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
            >
              {currentStep < quiz.questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'} <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
