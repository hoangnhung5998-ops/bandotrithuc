import { DataProvider } from '../dataProvider';
import { 
  User, Class, Heritage, HistoricalFigure, Lesson, 
  AIConversation, Quiz, Progress, Achievement, Message,
  Assignment, Submission, Rubric, GradebookRecord, Announcement,
  ClassReport, Student, Topic, Question, Game, Certificate
} from '../types';
import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY = 'dai_su_di_san_data';

interface MockDB {
  users: User[];
  classes: Class[];
  heritages: Heritage[];
  historicalFigures: HistoricalFigure[];
  lessons: Lesson[];
  quizzes: Quiz[];
  progress: Progress[];
  achievements: Achievement[];
  conversations: AIConversation[];
  assignments: Assignment[];
  submissions: Submission[];
  announcements: Announcement[];
  topics: Topic[];
  questions: Question[];
  games: Game[];
  certificates: Certificate[];
}

const initialData: MockDB = {
  users: [
    { id: 'u1', name: 'Nguyễn Văn A', role: 'teacher', username: 'teacher' },
    { 
      id: 'u2', 
      name: 'hs', 
      role: 'student', 
      username: 'hs', 
      password: '123',
      classId: 'c1',
      dob: '2014-05-15',
      parentPhone: '4987654',
      progressPercent: 0,
      school: 'Trường Tiểu học Tân Long'
    },
    { 
      id: 'u3', 
      name: 'Trần Văn D', 
      role: 'student', 
      username: 'student2', 
      classId: 'c1',
      dob: '2014-08-20',
      parentPhone: '0907654321',
      progressPercent: 70,
      school: 'Trường Tiểu học Tân Long'
    },
  ],
  classes: [
    { id: 'c1', name: 'Lớp 4A', teacherId: 'u1', teacherName: 'Nguyễn Văn A', studentCount: 35, academicYear: '2025-2026', joinCode: 'L4A2025' },
    { id: 'c2', name: 'Lớp 4B', teacherId: 'u1', teacherName: 'Nguyễn Văn A', studentCount: 32, academicYear: '2025-2026', joinCode: 'L4B2025' },
    { id: 'c3', name: 'Lớp 4C', teacherId: 'u1', teacherName: 'Nguyễn Văn A', studentCount: 30, academicYear: '2025-2026', joinCode: 'L4C2025' },
  ],
  historicalFigures: [
    { 
      id: 'f1', 
      name: 'Anh hùng Núp', 
      title: 'Người con của núi rừng Tây Nguyên', 
      description: 'Đinh Núp là một nhân vật lịch sử Việt Nam, người dân tộc Ba Na, đã lãnh đạo dân làng Kông Hoa đứng lên chống thực dân Pháp.',
      period: 'Kháng chiến chống Pháp',
      avatar: 'https://picsum.photos/seed/nup/200/200',
      achievements: ['Huân chương Quân công hạng Nhất', 'Anh hùng Lực lượng vũ trang nhân dân']
    },
    { 
      id: 'f2', 
      name: 'Hai Bà Trưng', 
      title: 'Nữ vương đầu tiên của Việt Nam', 
      description: 'Trưng Trắc và Trưng Nhị là hai chị em, anh hùng dân tộc Việt Nam đã phất cờ khởi nghĩa chống lại ách đô hộ của nhà Đông Hán.',
      period: 'Thời kỳ Bắc thuộc lần 1',
      avatar: 'https://picsum.photos/seed/trung/200/200',
      achievements: ['Khởi nghĩa thắng lợi năm 40', 'Xưng vương đóng đô ở Mê Linh']
    },
    { 
      id: 'f3', 
      name: 'Trần Hưng Đạo', 
      title: 'Hưng Đạo Đại Vương', 
      description: 'Vị tướng tài ba của nhà Trần, người đã lãnh đạo quân dân Đại Việt ba lần đánh bại quân xâm lược Nguyên Mông.',
      period: 'Thời Nhà Trần',
      avatar: 'https://picsum.photos/seed/tran/200/200',
      achievements: ['Tác giả Hịch tướng sĩ', 'Chiến thắng Bạch Đằng 1288']
    }
  ],
  heritages: [
    { 
      id: 'h1', 
      name: 'Khu di tích Tân Trào', 
      description: 'Thủ đô kháng chiến, nơi diễn ra những sự kiện lịch sử quan trọng quyết định vận mệnh dân tộc Việt Nam.',
      location: 'Sơn Dương, Tuyên Quang',
      type: 'historical',
      imageUrl: 'https://picsum.photos/seed/tantrao/800/600',
      coordinates: { lat: 21.7833, lng: 105.4833 },
      driveUrl: 'https://drive.google.com',
      webUrl: 'https://vi.wikipedia.org/wiki/T%C3%A2n_Tr%C3%A0o'
    },
    { 
      id: 'h2', 
      name: 'Hồ Na Hang', 
      description: 'Nơi giao thoa của hai dòng sông Gâm và sông Năng, với vẻ đẹp sơn thủy hữu tình, được ví như Hạ Long trên cạn.',
      location: 'Na Hang, Tuyên Quang',
      type: 'natural',
      imageUrl: 'https://picsum.photos/seed/nahang/800/600',
      coordinates: { lat: 22.3456, lng: 105.4321 },
      driveUrl: 'https://drive.google.com',
      webUrl: 'https://tuyenquang.gov.vn'
    },
    { 
      id: 'h3', 
      name: 'Thác Mơ Na Hang', 
      description: 'Một trong những thác nước đẹp nhất Tuyên Quang với 3 tầng thác hùng vĩ giữa rừng nguyên sinh.',
      location: 'Na Hang, Tuyên Quang',
      type: 'natural',
      imageUrl: 'https://picsum.photos/seed/thacmo/800/600',
      coordinates: { lat: 22.3500, lng: 105.4400 }
    },
    { 
      id: 'h4', 
      name: 'Hát Then Tuyên Quang', 
      description: 'Một loại hình diễn xướng dân gian đặc sắc của người Tày, Nùng, Thái, được UNESCO công nhận là Di sản văn hóa phi vật thể đại diện của nhân loại.',
      location: 'Tuyên Quang',
      type: 'music',
      imageUrl: 'https://picsum.photos/seed/hatthen/800/600',
      coordinates: { lat: 21.8234, lng: 105.2134 },
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      driveUrl: 'https://drive.google.com',
      webUrl: 'https://unesco.org'
    },
    { 
      id: 'h5', 
      name: 'Lễ hội Thành Tuyên', 
      description: 'Lễ hội Trung thu có quy mô lớn nhất Việt Nam với những mô hình đèn lồng khổng lồ, rực rỡ sắc màu.',
      location: 'TP. Tuyên Quang',
      type: 'cultural',
      imageUrl: 'https://picsum.photos/seed/lehoi/800/600',
      coordinates: { lat: 21.8167, lng: 105.2167 }
    },
    { 
      id: 'h6', 
      name: 'Nghề dệt thổ cẩm Lâm Bình', 
      description: 'Nghề truyền thống của người dân tộc Tày, Dao tại huyện Lâm Bình, tạo ra những sản phẩm tinh xảo, đậm đà bản sắc.',
      location: 'Lâm Bình, Tuyên Quang',
      type: 'craft',
      imageUrl: 'https://picsum.photos/seed/det/800/600',
      coordinates: { lat: 22.4500, lng: 105.3500 }
    }
  ],
  lessons: [
    {
      id: 'l1',
      topicId: 't2',
      title: 'Văn minh Sông Hồng và các vua Hùng',
      shortDescription: 'Tìm hiểu về nguồn gốc dân tộc Việt Nam qua thời kỳ các vua Hùng dựng nước.',
      content: '<p>Văn minh sông Hồng là một trong những nền văn minh sớm nhất của nhân loại. Đây là cái nôi của người Việt cổ, nơi hình thành nhà nước Văn Lang đầu tiên...</p>',
      imageUrl: 'https://picsum.photos/seed/lesson1/800/400',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      relatedHeritageIds: ['h3'],
      relatedHistoricalFigureIds: ['f2'],
      status: 'published',
      order: 1,
      createdAt: Date.now()
    },
    {
      id: 'l2',
      topicId: 't1',
      title: 'Thiên nhiên vùng núi phía Bắc',
      shortDescription: 'Khám phá vẻ đẹp hùng vĩ và đa dạng sinh học của vùng núi phía Bắc Việt Nam.',
      content: '<p>Vùng núi phía Bắc có địa hình hiểm trở nhưng vô cùng hùng vĩ với những dãy núi cao, thung lũng sâu và hệ sinh thái phong phú...</p>',
      imageUrl: 'https://picsum.photos/seed/lesson2/800/400',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      relatedHeritageIds: ['h2'],
      relatedHistoricalFigureIds: ['f1'],
      status: 'published',
      order: 1,
      createdAt: Date.now()
    },
    {
      id: 'l3',
      topicId: 't3',
      title: 'Lễ hội Lồng Tồng',
      shortDescription: 'Tìm hiểu về lễ hội xuống đồng lớn nhất của người Tày.',
      content: '<p>Lễ hội Lồng Tồng là ngày hội quan trọng nhất của người Tày, cầu cho mưa thuận gió hòa, mùa màng bội thu...</p>',
      imageUrl: 'https://picsum.photos/seed/lesson3/800/400',
      status: 'published',
      order: 1,
      createdAt: Date.now()
    },
    {
      id: 'l4',
      topicId: 't4',
      title: 'Nghệ thuật Hát Then',
      shortDescription: 'Di sản văn hóa phi vật thể đại diện của nhân loại.',
      content: '<p>Hát Then là loại hình diễn xướng dân gian đặc sắc, kết hợp giữa âm nhạc, lời ca và điệu múa...</p>',
      imageUrl: 'https://picsum.photos/seed/lesson4/800/400',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      status: 'published',
      order: 1,
      createdAt: Date.now()
    },
    {
      id: 'l5',
      topicId: 't5',
      title: 'Nghề dệt thổ cẩm',
      shortDescription: 'Bàn tay khéo léo của người phụ nữ vùng cao.',
      content: '<p>Nghề dệt thổ cẩm không chỉ là tạo ra trang phục mà còn là nơi gửi gắm tâm hồn và bản sắc văn hóa...</p>',
      imageUrl: 'https://picsum.photos/seed/lesson5/800/400',
      status: 'published',
      order: 1,
      createdAt: Date.now()
    }
  ],
  quizzes: [
    {
      id: 'q1',
      title: 'Thử thách Văn minh Sông Hồng',
      questions: [
        {
          id: '1',
          type: 'multiple-choice',
          text: 'Vị vua nào được coi là tổ tiên của dân tộc Việt Nam?',
          options: ['Vua Hùng', 'An Dương Vương', 'Lý Nam Đế', 'Ngô Quyền'],
          correctAnswer: 0,
          explanation: 'Các vua Hùng là những người đầu tiên dựng nước Văn Lang, mở đầu thời kỳ dựng nước của dân tộc ta.'
        },
        {
          id: '2',
          type: 'matching',
          text: 'Hãy nối các địa danh sau với đặc điểm tương ứng:',
          options: ['Sông Hồng', 'Đền Hùng', 'Thành Cổ Loa'],
          matchingOptions: ['Phú Thọ', 'Hà Nội', 'Nơi bồi đắp đồng bằng Bắc Bộ'],
          correctAnswer: { 0: 2, 1: 0, 2: 1 },
          explanation: 'Sông Hồng bồi đắp đồng bằng Bắc Bộ. Đền Hùng ở Phú Thọ. Thành Cổ Loa ở Đông Anh, Hà Nội.'
        },
        {
          id: '3',
          type: 'multiple-choice',
          text: 'Sông Hồng còn có tên gọi khác là gì?',
          options: ['Sông Đà', 'Sông Cái', 'Sông Lô', 'Sông Cầu'],
          correctAnswer: 1,
          explanation: 'Sông Hồng là con sông lớn nhất miền Bắc, nên người xưa còn gọi là sông Cái (sông mẹ).'
        }
      ]
    }
  ],
  progress: [],
  achievements: [
    { id: 'ac1', title: 'Nhà thám hiểm nhí', description: 'Khám phá 5 địa danh trên bản đồ', icon: 'Map' },
    { id: 'ac2', title: 'Sử gia tương lai', description: 'Hoàn thành 3 bài học lịch sử', icon: 'Book' }
  ],
  conversations: [],
  assignments: [
    {
      id: 'a1',
      title: 'Tìm hiểu về trống đồng Đông Sơn',
      description: 'Em hãy viết một đoạn văn ngắn (150-200 chữ) mô tả về các hoa văn trên trống đồng Đông Sơn và ý nghĩa của chúng.',
      classIds: ['c1'],
      lessonId: 'l1',
      dueDate: Date.now() + 86400000 * 3,
      maxScore: 10,
      type: 'essay',
      rubrics: [
        { id: 'r1', assignmentId: 'a1', criterion: 'Nội dung chính xác', maxScore: 4 },
        { id: 'r2', assignmentId: 'a1', criterion: 'Trình bày rõ ràng', maxScore: 3 },
        { id: 'r3', assignmentId: 'a1', criterion: 'Sáng tạo', maxScore: 3 }
      ]
    }
  ],
  submissions: [],
  announcements: [
    {
      id: 'ann1',
      title: 'Chào mừng các em đến với năm học mới!',
      content: 'Chúc các em có một năm học thật vui vẻ và gặt hái được nhiều kiến thức bổ ích về lịch sử và địa lí.',
      target: 'all',
      createdAt: Date.now() - 86400000 * 5,
      createdBy: 'u1'
    },
    {
      id: 'ann2',
      title: 'Thông báo về bài học Văn minh sông Hồng',
      content: 'Tuần này lớp 4A sẽ học bài Văn minh sông Hồng. Các em cần hoàn thành bài học trước thứ Sáu.',
      target: 'students',
      createdAt: Date.now() - 86400000,
      createdBy: 'u1'
    }
  ],
  topics: [
    { id: 't1', title: 'Thiên nhiên', description: 'Khám phá rừng núi, sông suối và hệ sinh thái đặc trưng', icon: 'Leaf' },
    { id: 't2', title: 'Lịch sử', description: 'Tìm hiểu quá khứ hào hùng, các di tích lịch sử và con người vùng đất', icon: 'Scroll' },
    { id: 't3', title: 'Văn hóa', description: 'Trải nghiệm lễ hội, phong tục tập quán và nền văn hóa đa dạng', icon: 'Theater' },
    { id: 't4', title: 'Âm nhạc', description: 'Lắng nghe then Tày, dân ca và âm nhạc truyền thống địa phương', icon: 'Music' },
    { id: 't5', title: 'Thủ công', description: 'Học nghề thủ công truyền thống, tạo nên bản sắc văn hóa vùng miền', icon: 'Scissors' },
  ],
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      text: 'Ai là người lãnh đạo cuộc khởi nghĩa Hai Bà Trưng?',
      options: ['Hai Bà Trưng', 'Trần Hưng Đạo', 'Lê Lợi', 'Ngô Quyền'],
      correctAnswer: 0,
      explanation: 'Cuộc khởi nghĩa Hai Bà Trưng do Trưng Trắc và Trưng Nhị lãnh đạo năm 40.',
      points: 10,
      topicId: 't1',
      level: 'easy'
    },
    {
      id: 'q2',
      type: 'true-false',
      text: 'Phố cổ Hội An nằm ở tỉnh Quảng Nam.',
      correctAnswer: true,
      explanation: 'Đúng, Phố cổ Hội An thuộc tỉnh Quảng Nam.',
      points: 5,
      topicId: 't3',
      level: 'easy'
    },
    {
      id: 'q3',
      type: 'short-answer',
      text: 'Vị tướng nào đã ba lần đánh bại quân Nguyên Mông?',
      correctAnswer: 'Trần Hưng Đạo',
      explanation: 'Trần Hưng Đạo (Trần Quốc Tuấn) là vị tướng tài ba đã lãnh đạo quân dân nhà Trần ba lần kháng chiến chống Nguyên Mông thắng lợi.',
      points: 15,
      topicId: 't1',
      level: 'medium'
    },
    {
      id: 'q4',
      type: 'sorting',
      text: 'Hãy sắp xếp các triều đại sau theo thứ tự thời gian:',
      options: ['Nhà Lý', 'Nhà Trần', 'Nhà Lê', 'Nhà Nguyễn'],
      correctAnswer: [0, 1, 2, 3],
      explanation: 'Thứ tự đúng là: Lý -> Trần -> Lê -> Nguyễn.',
      points: 20,
      topicId: 't1',
      level: 'hard'
    },
    {
      id: 'q5',
      type: 'fill-in-the-blanks',
      text: 'Sông Hồng còn được gọi là sông ____.',
      correctAnswer: ['Cái'],
      explanation: 'Sông Hồng còn có tên gọi khác là sông Cái.',
      points: 10,
      topicId: 't2',
      level: 'medium'
    }
  ],
  games: [
    {
      id: 'g1',
      title: 'Thử thách Văn minh Sông Hồng',
      description: 'Kiểm tra kiến thức của bạn về cội nguồn dân tộc và các vua Hùng qua trò chơi trắc nghiệm thú vị.',
      thumbnailUrl: 'https://picsum.photos/seed/history/400/300',
      gameUrl: '/app/games/quiz/q1',
      type: 'quiz',
      status: 'active',
      createdAt: Date.now()
    },
    {
      id: 'g2',
      title: 'Ghép hình Di sản',
      description: 'Thử tài khéo léo và trí nhớ bằng cách ghép các mảnh hình ảnh về danh lam thắng cảnh.',
      thumbnailUrl: 'https://picsum.photos/seed/puzzle/400/300',
      gameUrl: 'https://puzzlegame.example.com',
      type: 'puzzle',
      status: 'active',
      createdAt: Date.now()
    },
    {
      id: 'g3',
      title: 'Hành trình di sản',
      description: 'Tham gia chuyến phiêu lưu ảo khám phá các địa danh lịch sử nổi tiếng.',
      thumbnailUrl: 'https://picsum.photos/seed/adventure/400/300',
      gameUrl: 'https://adventure.example.com',
      type: 'adventure',
      status: 'active',
      createdAt: Date.now()
    }
  ],
  certificates: [
    {
      id: 'cert-1',
      studentId: 'u2',
      title: 'Đại sứ Di sản',
      issuedBy: 'Sở Giáo dục và Đào tạo',
      issuedAt: Date.now() - 86400000 * 30,
      type: 'achievement',
      description: 'Đã có thành tích xuất sắc trong việc tìm hiểu và quảng bá di sản văn hóa địa phương.',
      imageUrl: 'https://picsum.photos/seed/cert1/800/600'
    },
    {
      id: 'cert-2',
      studentId: 'u2',
      title: 'Học sinh Giỏi môn Lịch sử',
      issuedBy: 'Trường Tiểu học Tân Long',
      issuedAt: Date.now() - 86400000 * 60,
      type: 'academic',
      description: 'Đạt thành tích xuất sắc trong học kỳ I năm học 2025-2026.',
      imageUrl: 'https://picsum.photos/seed/cert2/800/600'
    }
  ]
};

export class MockProvider implements DataProvider {
  private db: MockDB;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.db = { ...initialData, ...parsed };
      } catch (e) {
        console.error('Error parsing saved data:', e);
        this.db = initialData;
      }
    } else {
      this.db = initialData;
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  async getList<T>(resource: string): Promise<T[]> {
    return (this.db as any)[resource] || [];
  }

  async getOne<T>(resource: string, id: string): Promise<T> {
    const list = await this.getList<any>(resource);
    const item = list.find(i => i.id === id);
    if (!item) throw new Error(`Resource ${resource} with id ${id} not found`);
    return item;
  }

  async create<T>(resource: string, data: any): Promise<T> {
    const newItem = { ...data, id: Math.random().toString(36).substr(2, 9) };
    if (!(this.db as any)[resource]) {
      (this.db as any)[resource] = [];
    }
    (this.db as any)[resource].push(newItem);
    this.save();
    return newItem;
  }

  async update<T>(resource: string, id: string, data: any): Promise<T> {
    const list = (this.db as any)[resource] || [];
    const index = list.findIndex((i: any) => i.id === id);
    if (index === -1) throw new Error(`Resource ${resource} with id ${id} not found`);
    list[index] = { ...list[index], ...data };
    this.save();
    return list[index];
  }

  async delete(resource: string, id: string): Promise<void> {
    (this.db as any)[resource] = ((this.db as any)[resource] || []).filter((i: any) => i.id !== id);
    this.save();
  }

  // AI Actions
  async startAIConversation(characterId: string): Promise<AIConversation> {
    const character = (this.db.historicalFigures || []).find(f => f.id === characterId);
    const newConv: AIConversation = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'u2',
      characterId,
      messages: [
        { 
          id: 'm1', 
          role: 'assistant', 
          content: `Chào cháu! Ta là ${character?.name}. Ta rất vui được trò chuyện cùng cháu về lịch sử dân tộc.`, 
          timestamp: Date.now() 
        }
      ]
    };
    if (!this.db.conversations) this.db.conversations = [];
    this.db.conversations.push(newConv);
    this.save();
    return newConv;
  }

  async sendMessageToCharacter(conversationId: string, message: string): Promise<Message> {
    const conv = (this.db.conversations || []).find(c => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: message, timestamp: Date.now() };
    if (!conv.messages) conv.messages = [];
    conv.messages.push(userMsg);

    // Mock AI Response using Gemini if available, or static
    let aiResponse = "Đó là một câu hỏi rất hay! Để ta kể cho cháu nghe...";
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const character = (this.db.historicalFigures || []).find(f => f.id === conv.characterId);
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: `Bạn đang đóng vai nhân vật lịch sử Việt Nam: ${character?.name}. 
          Mô tả nhân vật: ${character?.description}. 
          Hãy trả lời câu hỏi của học sinh lớp 4 một cách thân thiện, dễ hiểu, bằng tiếng Việt. 
          Câu hỏi: ${message}`,
        });
        aiResponse = response.text || aiResponse;
      }
    } catch (e) {
      console.error("AI Error:", e);
    }

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResponse, timestamp: Date.now() };
    conv.messages.push(aiMsg);
    this.save();
    return aiMsg;
  }

  async generateHeritageImage(prompt: string): Promise<string> {
    // Mock image generation
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/600`;
  }

  async getInteractiveMapData(): Promise<Heritage[]> {
    return this.db.heritages || [];
  }

  async submitQuiz(quizId: string, answers: number[]): Promise<{ score: number; total: number }> {
    return { score: answers.length, total: answers.length }; // Mock
  }

  async getStudentProgress(studentId: string): Promise<Progress[]> {
    return this.db.progress.filter(p => p.studentId === studentId);
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return this.db.achievements || []; // Mock all for now
  }

  // Announcements
  async getAnnouncements(target?: 'students' | 'parents' | 'all'): Promise<Announcement[]> {
    const announcements = this.db.announcements || [];
    if (!target) return announcements;
    return announcements.filter(a => a.target === target || a.target === 'all');
  }

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const newAnnouncement: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title || '',
      content: data.content || '',
      target: data.target || 'all',
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || 'Admin',
      ...data
    } as Announcement;
    this.db.announcements.push(newAnnouncement);
    this.save();
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const index = this.db.announcements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Không tìm thấy thông báo');
    this.db.announcements[index] = { ...this.db.announcements[index], ...data };
    this.save();
    return this.db.announcements[index];
  }

  async deleteAnnouncement(id: string): Promise<void> {
    this.db.announcements = (this.db.announcements || []).filter(a => a.id !== id);
    this.save();
  }

  // Reports
  async getClassReport(classId: string): Promise<ClassReport> {
    const students = (this.db.users || []).filter(u => u.role === 'student' && u.classId === classId);
    const lessons = this.db.lessons || [];
    const assignments = (this.db.assignments || []).filter(a => a.classIds.includes(classId));
    const submissions = (this.db.submissions || []).filter(s => assignments.some(a => a.id === s.assignmentId));

    const totalStudents = students.length || 35; // Default to 35 if no students
    const totalLessons = lessons.length || 12;
    const totalAssignments = assignments.length || 5;

    // Progress stats
    const completedLessonsCount = students.reduce((acc, student) => {
      const studentProgress = (this.db.progress || []).filter(p => p.studentId === student.id && p.status === 'completed');
      return acc + studentProgress.length;
    }, 0);

    const onTimeSubmissions = submissions.filter(s => {
      const assignment = assignments.find(a => a.id === s.assignmentId);
      return assignment && s.submittedAt <= assignment.dueDate;
    }).length;

    const studentScores = students.map(student => {
      const studentSubmissions = submissions.filter(s => s.studentId === student.id);
      const scores = studentSubmissions.filter(s => s.score !== undefined).map(s => s.score as number);
      const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const completionRate = assignments.length > 0 ? (studentSubmissions.length / assignments.length) * 100 : 0;
      
      return {
        id: student.id,
        name: student.name,
        classId: student.classId || '',
        completionRate: Math.round(completionRate),
        averageScore: average
      };
    });

    // Mock data if no real data
    const finalStudentScores = studentScores.length > 0 ? studentScores : [
      { id: 'u1', name: 'Nguyễn Văn A', classId, completionRate: 85, averageScore: 8.5 },
      { id: 'u2', name: 'Lê Thị B', classId, completionRate: 90, averageScore: 7.8 },
      { id: 'u3', name: 'Trần Văn C', classId, completionRate: 70, averageScore: 5.5 }
    ];

    const totalAverageScore = finalStudentScores.reduce((acc, s) => acc + s.averageScore, 0) / finalStudentScores.length;
    const totalCompletionRate = finalStudentScores.reduce((acc, s) => acc + s.completionRate, 0) / finalStudentScores.length;

    const scoreDistribution = [
      { range: '0-2', count: finalStudentScores.filter(s => s.averageScore < 2).length },
      { range: '2-4', count: finalStudentScores.filter(s => s.averageScore >= 2 && s.averageScore < 4).length },
      { range: '4-6', count: finalStudentScores.filter(s => s.averageScore >= 4 && s.averageScore < 6).length },
      { range: '6-8', count: finalStudentScores.filter(s => s.averageScore >= 6 && s.averageScore < 8).length },
      { range: '8-10', count: finalStudentScores.filter(s => s.averageScore >= 8).length }
    ];

    return {
      totalStudents,
      totalLessons,
      completedLessons: completedLessonsCount || 8,
      totalAssignments,
      onTimeSubmissionRate: submissions.length > 0 ? onTimeSubmissions / submissions.length : 0.85,
      averageScore: totalAverageScore || 7.5,
      completionRate: Math.round(totalCompletionRate) || 82,
      scoreDistribution: scoreDistribution.some(d => d.count > 0) ? scoreDistribution : [
        { range: '0-2', count: 1 },
        { range: '2-4', count: 2 },
        { range: '4-6', count: 5 },
        { range: '6-8', count: 15 },
        { range: '8-10', count: 12 }
      ],
      studentScores: finalStudentScores,
      progressStats: {
        completed: 25,
        inProgress: 8,
        notStarted: 2
      },
      submissionStats: {
        onTime: onTimeSubmissions || 30,
        late: (submissions.length - onTimeSubmissions) || 3,
        notSubmitted: (totalStudents - submissions.length) || 2
      }
    };
  }

  async getAtRiskStudents(classId: string): Promise<Student[]> {
    const students = (this.db.users || []).filter(u => u.role === 'student' && u.classId === classId);
    const assignments = (this.db.assignments || []).filter(a => a.classIds.includes(classId));
    
    const atRisk = students.map(student => {
      const studentSubmissions = (this.db.submissions || []).filter(s => s.studentId === student.id);
      
      // Late submissions
      const lateCount = studentSubmissions.filter(s => {
        const assignment = assignments.find(a => a.id === s.assignmentId);
        return assignment && s.submittedAt > assignment.dueDate;
      }).length;

      // Average score
      const scores = studentSubmissions.filter(s => s.score !== undefined).map(s => s.score as number);
      const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      if (lateCount > 2 || (scores.length > 0 && average < 5)) {
        return {
          id: student.id,
          name: student.name,
          lateSubmissions: lateCount,
          averageScore: average
        };
      }
      return null;
    }).filter((s): s is Student => s !== null);

    // If no real data, return some mock at-risk students for demonstration
    if (atRisk.length === 0) {
      return [
        { id: 'u3', name: 'Trần Văn D', averageScore: 4.5, lateSubmissions: 3 },
        { id: 'u4', name: 'Phạm Văn E', averageScore: 5.2, lateSubmissions: 4 }
      ];
    }

    return atRisk;
  }

  // Assignments & Submissions
  async submitAssignment(studentId: string, assignmentId: string, content: string, fileUrl?: string): Promise<Submission> {
    const newSubmission: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      assignmentId,
      content,
      fileUrl,
      submittedAt: Date.now()
    };
    if (!this.db.submissions) this.db.submissions = [];
    this.db.submissions.push(newSubmission);
    this.save();
    return newSubmission;
  }

  async gradeSubmission(submissionId: string, score: number, feedback: string): Promise<Submission> {
    const submission = this.db.submissions.find(s => s.id === submissionId);
    if (!submission) throw new Error('Submission not found');
    submission.score = score;
    submission.feedback = feedback;
    submission.gradedAt = Date.now();
    this.save();
    return submission;
  }

  async getAssignmentsByClass(classId: string): Promise<Assignment[]> {
    return this.db.assignments.filter(a => a.classIds.includes(classId));
  }

  async getStudentSubmissions(studentId: string): Promise<Submission[]> {
    return (this.db.submissions || []).filter(s => s.studentId === studentId);
  }

  async getGradebook(classId?: string): Promise<GradebookRecord[]> {
    const students = (this.db.users || []).filter(u => u.role === 'student' && (!classId || u.classId === classId));
    const assignments = (this.db.assignments || []).filter(a => !classId || a.classIds.includes(classId));
    
    return students.map(student => {
      const studentSubmissions = (this.db.submissions || []).filter(s => s.studentId === student.id);
      const scores: { [key: string]: number | undefined } = {};
      
      assignments.forEach(a => {
        const sub = studentSubmissions.find(s => s.assignmentId === a.id);
        scores[a.id] = sub?.score;
      });

      const validScores = Object.values(scores).filter(v => v !== undefined) as number[];
      const average = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        scores,
        averageScore: parseFloat(average.toFixed(1))
      };
    });
  }

  // Auth
  async login(username: string, password: string): Promise<User> {
    const user = this.db.users.find(u => u.username === username && (u.password === password || password === '123456'));
    if (!user) throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
    localStorage.setItem('heritage_current_user', JSON.stringify(user));
    return user;
  }

  async register(data: Partial<User> & { password?: string }): Promise<User> {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Người dùng mới',
      role: data.role || 'student',
      username: data.username || '',
      password: data.password || '123456',
      ...data
    } as User;
    this.db.users.push(newUser);
    this.save();
    localStorage.setItem('heritage_current_user', JSON.stringify(newUser));
    return newUser;
  }

  async getCurrentUser(): Promise<User | null> {
    const saved = localStorage.getItem('heritage_current_user');
    return saved ? JSON.parse(saved) : null;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('heritage_current_user');
  }

  async sync(): Promise<void> {
    // Mock sync does nothing
    return Promise.resolve();
  }

  seedData() {
    this.db = initialData;
    this.save();
  }
}

export const mockProvider = new MockProvider();
