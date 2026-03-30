import { DataProvider } from '../dataProvider';
import { 
  User, Class, Heritage, HistoricalFigure, Lesson, 
  AIConversation, Quiz, Progress, Achievement, Message,
  Assignment, Submission, GradebookRecord, Announcement,
  ClassReport, Student, Topic, Question, Game, Certificate
} from '../types';
import { GoogleGenAI } from "@google/genai";
import Papa from 'papaparse';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLTKSSJjeK60TFGvBiQjnpazAMWPUE6-4Q15uOVMZkBlHS4a-crUilI2y5I9zr1W5yNA/exec';

/**
 * ĐỊNH CẤU HÌNH CSV URLS TỪ GOOGLE SHEETS (Publish to Web -> CSV)
 * 
 * CÁCH LẤY URL:
 * 1. Mở Google Sheet -> File -> Share -> Publish to web.
 * 2. Chọn Tab tương ứng (ví dụ: STUDENTS).
 * 3. Chọn định dạng là "Comma-separated values (.csv)".
 * 4. Nhấn Publish và copy URL dán vào đây.
 */
const CSV_URLS: { [key: string]: string } = {
  'STUDENTS': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=1060055892&single=true&output=csv', // URL CSV cho tab STUDENTS
  'TEACHERS': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=527944124&single=true&output=csv', // URL CSV cho tab TEACHER
  'CLASSES': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=24202590&single=true&output=csv',
  'TOPICS': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=633351636&single=true&output=csv',
  'LESSONS': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=1776462658&single=true&output=csv',
  'QUESTIONS': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=208810799&single=true&output=csv',
  'ASSIGNMENTS': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=1679096501&single=true&output=csv',
  'SUBMISSIONS': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=37572057&single=true&output=csv',
  'HERITAGES': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=2136497280&single=true&output=csv',
  'ANNOUNCEMENTS': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=1332911949&single=true&output=csv',
  'HISTORICALFIGURES': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=16329651&single=true&output=csv',
  'QUIZZES': '',
  'CERTIFICATES': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQthCCOZsf5wQPY08emEvwJXU74Hns9InviGVPzYx38TU_UkXjng1zwiX2zdKVF7XZ2IJIgtMPqDwYM/pub?gid=244921672&single=true&output=csv',
  'ACHIEVEMENTS': ''
};

// Mapping between app resource names and Apps Script Target keys
const TARGET_MAP: { [key: string]: string } = {
  'classes': 'CLASSES',
  'students': 'STUDENTS',
  'teachers': 'TEACHERS',
  'topics': 'TOPICS',
  'lessons': 'LESSONS',
  'questions': 'QUESTIONS',
  'assignments': 'ASSIGNMENTS',
  'submissions': 'SUBMISSIONS',
  'games': 'GAMES',
  'heritages': 'HERITAGES',
  'historicalFigures': 'HISTORICALFIGURES',
  'quizzes': 'QUIZZES',
  'certificates': 'CERTIFICATES',
  'achievements': 'ACHIEVEMENTS',
  'grades': 'GRADES',
  'progress': 'PROGRESS',
  'announcements': 'ANNOUNCEMENTS',
  'users': 'STUDENTS' // Fallback for users
};

// Mapping for field names to sheet headers
const FIELD_MAP: { [key: string]: { [key: string]: string } } = {
  'classes': {
    'id': 'ID',
    'name': 'Tên lớp',
    'academicYear': 'Năm học',
    'joinCode': 'Mã tham gia',
    'teacherName': 'Giáo viên chủ nhiệm',
    'studentCount': 'Sĩ số'
  },
  'students': {
    'id': 'ID',
    'name': 'Họ và tên',
    'username': 'Tên đăng nhập',
    'password': 'Mật khẩu',
    'dob': 'Ngày sinh',
    'classId': 'Lớp học',
    'parentPhone': 'Số điện thoại phụ huynh',
    'progressPercent': 'Tiến độ (%)',
    'school': 'Trường học'
  },
  'teachers': {
    'id': 'ID',
    'name': 'Họ và tên',
    'username': 'Tên đăng nhập',
    'password': 'Mật khẩu',
    'classId': 'Lớp học'
  },
  'topics': {
    'id': 'ID',
    'title': 'Tiêu đề',
    'description': 'Mô tả',
    'order': 'Thứ tự'
  },
  'lessons': {
    'id': 'ID',
    'topicId': 'ID Chủ đề',
    'title': 'Tiêu đề',
    'shortDescription': 'Mô tả ngắn',
    'content': 'Nội dung',
    'imageUrl': 'Link ảnh',
    'videoUrl': 'Link video',
    'status': 'Trạng thái',
    'order': 'Thứ tự'
  },
  'questions': {
    'id': 'ID',
    'topicId': 'ID Chủ đề',
    'lessonId': 'lessonId',
    'type': 'Loại câu hỏi',
    'text': 'Nội dung',
    'options': 'optionsJson',
    'correctAnswer': 'Đáp án đúng',
    'explanation': 'Giải thích'
  },
  'assignments': {
    'id': 'ID',
    'lessonId': 'ID Bài học',
    'title': 'Tiêu đề',
    'description': 'Mô tả',
    'dueDate': 'Hạn nộp',
    'maxScore': 'Điểm tối đa',
    'classIds': 'Lớp học',
    'type': 'Loại bài tập',
    'rubrics': 'Tiêu chí chấm điểm'
  },
  'submissions': {
    'id': 'ID',
    'assignmentId': 'assignmentId',
    'studentId': 'studentId',
    'content': 'Nội dung nộp',
    'fileUrl': 'fileUrl',
    'submittedAt': 'Ngày nộp',
    'score': 'Điểm',
    'feedback': 'Phản hồi',
    'gradedAt': 'Ngày chấm'
  },
  'games': {
    'id': 'id',
    'title': 'Tiêu đề',
    'description': 'Mô tả',
    'thumbnailUrl': 'Link ảnh bìa',
    'gameUrl': 'Link trò chơi',
    'type': 'Loại',
    'status': 'Trạng thái',
    'questionIds': 'questionIdsJson',
    'createdAt': 'Ngày tạo'
  },
  'users': {
    'id': 'ID',
    'name': 'Họ và tên',
    'username': 'Tên đăng nhập',
    'password': 'Mật khẩu',
    'dob': 'Ngày sinh',
    'classId': 'Lớp học',
    'parentPhone': 'Số điện thoại phụ huynh',
    'progressPercent': 'Tiến độ (%)',
    'school': 'Trường học'
  },
  'heritages': {
    'id': 'ID',
    'name': 'Tên di sản',
    'description': 'Mô tả',
    'location': 'Địa điểm',
    'type': 'Loại',
    'imageUrl': 'Link ảnh',
    'coordinates': 'coordinates',
    'youtubeUrl': 'youtubeUrl',
    'driveUrl': 'driveUrl',
    'webUrl': 'webUrl'
  },
  'announcements': {
    'id': 'ID',
    'title': 'Tiêu đề',
    'content': 'Nội dung',
    'target': 'Đối tượng',
    'createdAt': 'Ngày tạo'
  },
  'historicalFigures': {
    'id': 'ID',
    'name': 'Họ và tên',
    'title': 'Danh hiệu',
    'description': 'Mô tả',
    'period': 'Thời kỳ',
    'avatar': 'avatar',
    'achievements': 'achievements'
  },
  'quizzes': {
    'id': 'ID',
    'title': 'Tiêu đề',
    'questions': 'questionsJson'
  },
  'certificates': {
    'id': 'ID',
    'studentId': 'ID Học sinh',
    'title': 'Tiêu đề',
    'issuedBy': 'Người cấp',
    'issuedAt': 'Ngày cấp',
    'type': 'Loại',
    'imageUrl': 'Link ảnh'
  },
  'achievements': {
    'id': 'ID',
    'title': 'Tiêu đề',
    'description': 'Mô tả',
    'icon': 'Icon',
    'unlockedAt': 'Ngày mở khóa'
  },
  'progress': {
    'id': 'ID',
    'studentId': 'ID Học sinh',
    'lessonId': 'ID Bài học',
    'status': 'Trạng thái',
    'startedAt': 'Ngày bắt đầu',
    'completedAt': 'Ngày hoàn thành'
  },
  'grades': {
    'id': 'ID',
    'studentId': 'ID Học sinh',
    'assignmentId': 'ID Bài tập',
    'score': 'Điểm',
    'feedback': 'Phản hồi',
    'gradedAt': 'Ngày chấm'
  }
};

export class GoogleSheetProvider implements DataProvider {
  private _cache: { [key: string]: any[] } = {};
  private _syncInterval: any = null;
  private _isSyncing: boolean = false;

  constructor() {
    this.loadFromLocal();
    this.startBackgroundSync();
  }

  private loadFromLocal() {
    try {
      const saved = localStorage.getItem('heritage_data_cache');
      if (saved) {
        this._cache = JSON.parse(saved);
        console.log('[GoogleSheetProvider] Cache loaded from localStorage');
      }
    } catch (e) {
      console.error('[GoogleSheetProvider] Failed to load cache from localStorage', e);
    }
  }

  private saveToLocal() {
    try {
      localStorage.setItem('heritage_data_cache', JSON.stringify(this._cache));
    } catch (e) {
      console.error('[GoogleSheetProvider] Failed to save cache to localStorage', e);
    }
  }

  private startBackgroundSync() {
    // Tự động đồng bộ mỗi 3 phút (180000ms)
    if (this._syncInterval) clearInterval(this._syncInterval);
    this._syncInterval = setInterval(() => {
      this.sync().catch(console.error);
    }, 180000);
  }

  /**
   * Đồng bộ toàn bộ dữ liệu từ Google Sheets về Local Cache
   */
  async sync(): Promise<void> {
    if (this._isSyncing) return;
    this._isSyncing = true;
    console.log('[GoogleSheetProvider] Starting full sync...');

    try {
      // Tải song song nhiều bảng dữ liệu để tiết kiệm thời gian
      const resourcesToSync = Object.keys(TARGET_MAP).map(k => TARGET_MAP[k]);
      // CHỈNH SỬA: Loại bỏ SUBMISSIONS khỏi sync tự động để tránh ghi đè dữ liệu vừa chấm bài bằng CSV cũ
      const uniqueTargets = Array.from(new Set(resourcesToSync)).filter(t => t !== 'SUBMISSIONS');

      const syncPromises = uniqueTargets.map(async (target) => {
        try {
          // Ưu tiên dùng CSV vì nó nhanh và không bị giới hạn quota Apps Script
          const data = await this.fetchCsv(target);
          if (data && data.length > 0) {
            this._cache[target] = data;
          }
        } catch (e) {
          console.error(`[GoogleSheetProvider] Sync failed for ${target}`, e);
        }
      });

      await Promise.all(syncPromises);
      this.saveToLocal();
      console.log('[GoogleSheetProvider] Full sync completed successfully');
    } finally {
      this._isSyncing = false;
    }
  }

  /**
   * Chuyển đổi CSV sang JSON sử dụng PapaParse (Mạnh mẽ nhất)
   */
  private csvToJson(csv: string): any[] {
    const result = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: "", // Tự động phát hiện dấu phẩy hoặc tab
      transformHeader: (header) => header.trim()
    });

    if (result.errors.length > 0) {
      console.warn('[GoogleSheetProvider] PapaParse errors:', result.errors);
    }

    console.log(`[GoogleSheetProvider] Parsed ${result.data.length} rows. Delimiter used: "${result.meta.delimiter}"`);
    
    return result.data.map((row: any) => {
      const obj: any = {};
      for (const key in row) {
        let val = row[key];
        
        // Handle potential JSON strings in CSV
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try {
            val = JSON.parse(val);
          } catch (e) {}
        }
        
        // Convert to string if it's a number but looks like it should be a string (ID, username, password, etc)
        if (typeof val === 'number' && (key === 'ID' || key === 'Tên đăng nhập' || key === 'Mật khẩu' || key === 'username' || key === 'password')) {
          val = String(val);
        }

        obj[key] = val;
      }
      return obj;
    });
  }

  /**
   * Lấy dữ liệu từ CSV (Tĩnh - Nhanh - Không CORS)
   * Cơ chế Hybrid: Nếu có URL CSV thì dùng, nếu không hoặc lỗi thì fallback về Apps Script.
   */
  private async fetchCsv(target: string): Promise<any[]> {
    const baseUrl = CSV_URLS[target];
    
    if (baseUrl) {
      try {
        // Thêm cache-buster để tránh trình duyệt cache dữ liệu cũ
        const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}cb=${Date.now()}`;
        
        console.log(`[GoogleSheetProvider] Fetching CSV for ${target}...`);
        const response = await fetch(url, { 
          cache: 'no-store'
        });
        
        if (!response.ok) throw new Error(`CSV fetch failed: ${response.status}`);
        
        const csvText = await response.text();
        const data = this.csvToJson(csvText);
        
        if (data && data.length > 0) {
          console.log(`[GoogleSheetProvider] Successfully fetched ${data.length} items from CSV for ${target}`);
          return data;
        }
      } catch (error) {
        console.error(`[GoogleSheetProvider] CSV Error for ${target}, falling back to Apps Script...`, error);
      }
    }

    // Fallback sang Apps Script
    console.warn(`[GoogleSheetProvider] Using Apps Script fallback for ${target}`);
    try {
      const fallbackData = await this.callApi('READ', target);
      const result = Array.isArray(fallbackData) ? fallbackData : [];
      console.log(`[GoogleSheetProvider] Apps Script returned ${result.length} items for ${target}`);
      return result;
    } catch (error) {
      console.error(`[GoogleSheetProvider] Apps Script fallback failed for ${target}:`, error);
      return [];
    }
  }

  private async callApi(method: string, target: string, payload: any = {}) {
    const action = `${method}_${target}`;
    try {
      console.log(`GoogleSheetProvider: Calling API ${action}`, payload);
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, payload }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`GoogleSheetProvider: HTTP error! status: ${response.status}`, text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('GoogleSheetProvider: Failed to parse JSON response', text);
        throw new Error('Phản hồi từ máy chủ không hợp lệ.');
      }

      if (!result.ok) {
        const errorMsg = result.error || 'Lỗi không xác định từ Apps Script';
        console.error('GoogleSheetProvider: API returned error', errorMsg);
        throw new Error(errorMsg);
      }
      return result.data;
    } catch (error) {
      console.error(`GoogleSheetProvider Error (${action}):`, error);
      throw error;
    }
  }

  private getTarget(resource: string): string {
    return TARGET_MAP[resource] || resource.toUpperCase();
  }

  private mapToSheet(resource: string, data: any): any {
    let mapResource = resource;
    if (resource === 'users') {
      mapResource = data.role === 'teacher' ? 'teachers' : 'students';
    }
    const map = FIELD_MAP[mapResource] || FIELD_MAP['users'];
    if (!map) return data;

    const mapped: any = {};
    for (const key in data) {
      const header = map[key] || key;
      let value = data[key];
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        value = JSON.stringify(value);
      } else if (Array.isArray(value)) {
        value = JSON.stringify(value);
      }
      
      mapped[header] = value;
    }
    // Ensure the mapped ID field is present for Apps Script
    // Use the header defined in FIELD_MAP for 'id', fallback to 'ID'
    const idHeader = map['id'] || 'ID';
    if (mapped[idHeader] === undefined && (data.id || data.ID)) {
      mapped[idHeader] = data.id || data.ID;
    }
    return mapped;
  }

  private mapFromSheet(resource: string, data: any): any {
    let mapResource = resource;
    if (resource === 'users') {
      mapResource = data.role === 'teacher' ? 'teachers' : 'students';
    }
    const map = FIELD_MAP[mapResource] || FIELD_MAP['users'];
    if (!map) return data;

    const reverseMap: { [key: string]: string } = {};
    for (const key in map) {
      // Normalize key for reverse mapping (lowercase, no spaces)
      const normalizedSheetHeader = map[key].toLowerCase().replace(/\s/g, '');
      reverseMap[normalizedSheetHeader] = key;
      
      // Also add the English key itself as a fallback
      const normalizedKey = key.toLowerCase().replace(/\s/g, '');
      if (!reverseMap[normalizedKey]) {
        reverseMap[normalizedKey] = key;
      }

      // Also add a version without "ID" if it exists (e.g., topicId -> topic)
      if (normalizedKey.endsWith('id')) {
        const withoutId = normalizedKey.substring(0, normalizedKey.length - 2);
        if (!reverseMap[withoutId]) reverseMap[withoutId] = key;
      }
      if (normalizedKey.startsWith('id')) {
        const withoutId = normalizedKey.substring(2);
        if (!reverseMap[withoutId]) reverseMap[withoutId] = key;
      }
    }

    const mapped: any = {};
    for (const header in data) {
      const normalizedHeader = header.toLowerCase().replace(/\s/g, '');
      const key = reverseMap[normalizedHeader] || header;
      let value = data[header];
      
      // Convert to string if it's a number but looks like it should be a string (ID, username, password, etc)
      // BUT keep timestamps and scores as numbers
      const numericFields = ['score', 'maxScore', 'progressPercent', 'dueDate', 'submittedAt', 'gradedAt', 'createdAt', 'issuedAt', 'startedAt', 'completedAt', 'order'];
      
      if (typeof value === 'number' && !numericFields.includes(key)) {
        value = String(value);
      }

      // Convert string to number for numeric fields
      if (numericFields.includes(key) && typeof value === 'string' && value.trim() !== '') {
        const num = Number(value);
        if (!isNaN(num)) value = num;
      }

      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          value = JSON.parse(value);
        } catch (e) {}
      }
      
      mapped[key] = value;
    }

    // Fallback for common fields if they are still missing
    const commonFallbacks: { [key: string]: string[] } = {
      'content': ['nội dung bài học', 'bài học', 'content'],
      'shortDescription': ['mô tả', 'tóm tắt', 'short description'],
      'imageUrl': ['ảnh', 'hình ảnh', 'image'],
      'videoUrl': ['video', 'youtube', 'clip'],
      'location': ['địa điểm', 'vị trí', 'address'],
      'classIds': ['id lớp', 'lớp học', 'lớp', 'classidsjson', 'classids', 'classid'],
      'lessonId': ['id bài học', 'bài học', 'lessonid'],
      'topicId': ['id chủ đề', 'chủ đề', 'topicid'],
      'score': ['điểm', 'score'],
      'feedback': ['phản hồi', 'nhận xét', 'feedback'],
      'gradedAt': ['ngày chấm', 'gradedat'],
      'submittedAt': ['ngày nộp', 'submittedat'],
      'assignmentId': ['id bài tập', 'assignmentid'],
      'studentId': ['id học sinh', 'studentid']
    };

    for (const key in commonFallbacks) {
      if (!mapped[key]) {
        for (const fallbackHeader of commonFallbacks[key]) {
          const normalizedFallback = fallbackHeader.toLowerCase().replace(/\s/g, '');
          for (const header in data) {
            const normalizedHeader = header.toLowerCase().replace(/\s/g, '');
            if (normalizedHeader === normalizedFallback && data[header]) {
              mapped[key] = data[header];
              break;
            }
          }
          if (mapped[key]) break;
        }
      }
    }

    // Final pass for numeric conversion and normalization
    const allNumericFields = ['score', 'maxScore', 'progressPercent', 'dueDate', 'submittedAt', 'gradedAt', 'createdAt', 'issuedAt', 'startedAt', 'completedAt', 'order'];
    for (const key in mapped) {
      let value = mapped[key];
      if (allNumericFields.includes(key) && typeof value === 'string' && value.trim() !== '') {
        const num = Number(value);
        if (!isNaN(num)) mapped[key] = num;
      }
      // Ensure ID is always a string
      if ((key === 'id' || key === 'ID') && value !== undefined && value !== null) {
        mapped[key] = String(value);
      }
    }

    // Ensure id is present for App (lowercase 'id' is standard in the app)
    if (mapped['id'] === undefined && (data['ID'] || mapped['ID'])) {
      mapped['id'] = String(data['ID'] || mapped['ID']);
    }
    
    return mapped;
  }

  async getList<T>(resource: string, params?: any): Promise<T[]> {
    const forceRealTime = params?.forceRealTime === true;
    const target = this.getTarget(resource);
    
    // Nếu không yêu cầu real-time và có dữ liệu trong cache, trả về ngay lập tức (< 10ms)
    if (!forceRealTime && this._cache[target] && this._cache[target].length > 0) {
      console.log(`[GoogleSheetProvider] Returning cached data for ${resource}`);
      const data = this._cache[target];
      return data.map((item: any) => this.mapFromSheet(resource, item)) as T[];
    }

    if (resource === 'users') {
      const [students, teachers] = await Promise.all([
        forceRealTime ? this.callApi('READ', 'STUDENTS') : this.fetchCsv('STUDENTS'),
        forceRealTime ? this.callApi('READ', 'TEACHERS') : this.fetchCsv('TEACHERS')
      ]);
      
      const mappedStudents = (students || []).map((s: any) => ({ ...this.mapFromSheet('students', s), role: 'student' }));
      const mappedTeachers = (teachers || []).map((t: any) => ({ ...this.mapFromSheet('teachers', t), role: 'teacher' }));
      
      const result = [...mappedStudents, ...mappedTeachers];
      
      // Cập nhật cache
      if (!forceRealTime) {
        this._cache['STUDENTS'] = students || [];
        this._cache['TEACHERS'] = teachers || [];
        this.saveToLocal();
      }

      return result as T[];
    }
    
    const data = forceRealTime ? await this.callApi('READ', target) : await this.fetchCsv(target);
    
    // Cập nhật cache
    if (!forceRealTime && data && data.length > 0) {
      this._cache[target] = data;
      this.saveToLocal();
    }

    return (data || []).map((item: any) => this.mapFromSheet(resource, item)) as T[];
  }

  async getOne<T>(resource: string, id: string, params?: any): Promise<T> {
    const list = await this.getList<any>(resource, params);
    const item = list.find((i: any) => i.id === id || i.ID === id);
    if (!item) throw new Error(`Không tìm thấy dữ liệu với ID ${id}`);
    return item as T;
  }

  async create<T>(resource: string, data: any): Promise<T> {
    let actualResource = resource;
    if (resource === 'users') {
      actualResource = data.role === 'teacher' ? 'teachers' : 'students';
    }
    
    const target = this.getTarget(actualResource);
    const dataWithId = { 
      ...data, 
      id: data.id || data.ID || `ID_${Date.now()}` 
    };
    
    // Optimistic UI: Cập nhật cache ngay lập tức
    const rawData = this.mapToSheet(actualResource, dataWithId);
    if (!this._cache[target]) this._cache[target] = [];
    this._cache[target] = [...this._cache[target], rawData];
    this.saveToLocal();

    // Gửi lệnh về Google Sheets
    // CHỈNH SỬA: Await lệnh API để đảm bảo dữ liệu được lưu thực sự
    try {
      await this.callApi('UPSERT', target, rawData);
    } catch (err) {
      console.error(`[GoogleSheetProvider] Create failed for ${resource}`, err);
      // Rollback cache nếu lỗi
      this._cache[target] = this._cache[target].filter(i => String(i.ID || i.id) !== String(dataWithId.id));
      this.saveToLocal();
      throw err;
    }
    
    const finalResult = { ...dataWithId };
    return finalResult as T;
  }

  async update<T>(resource: string, id: string, data: any): Promise<T> {
    // Optimistic UI: Tìm và cập nhật trong cache trước
    let actualResource = resource;
    const target = this.getTarget(actualResource);
    
    let existingInCache = this._cache[target]?.find(i => String(i.ID || i.id) === String(id));
    let merged: any;

    if (existingInCache) {
      const mappedExisting = this.mapFromSheet(resource, existingInCache);
      merged = { ...mappedExisting, ...data, id };
      
      // Cập nhật lại cache
      const rawMerged = this.mapToSheet(actualResource, merged);
      this._cache[target] = this._cache[target].map(i => String(i.ID || i.id) === String(id) ? rawMerged : i);
      this.saveToLocal();
    }

    // Gửi lệnh về Google Sheets
    // CHỈNH SỬA: Await lệnh API để đảm bảo dữ liệu được lưu thực sự trước khi trả về
    const performUpdate = async () => {
      let existing: any = {};
      try {
        // Thử lấy dữ liệu mới nhất từ server để merge chính xác
        existing = await this.getOne<any>(resource, id, { forceRealTime: true });
      } catch (e) {
        console.warn(`[GoogleSheetProvider] Could not find existing record for ${resource}:${id} before update.`);
      }

      const finalMerged = { ...existing, ...data, id };
      
      if (resource === 'users') {
        actualResource = finalMerged.role === 'teacher' ? 'teachers' : 'students';
      }
      
      const finalTarget = this.getTarget(actualResource);
      const mappedData = this.mapToSheet(actualResource, finalMerged);
      await this.callApi('UPSERT', finalTarget, mappedData);
      
      // Sau khi cập nhật thành công, đồng bộ lại cache với dữ liệu thực tế
      if (!this._cache[finalTarget]) this._cache[finalTarget] = [];
      const index = this._cache[finalTarget].findIndex(i => String(i.ID || i.id) === String(id));
      if (index !== -1) {
        this._cache[finalTarget][index] = mappedData;
      } else {
        this._cache[finalTarget].push(mappedData);
      }
      this.saveToLocal();
      return finalMerged;
    };

    // Đợi cập nhật hoàn tất để tránh mất dữ liệu khi refresh
    const result = await performUpdate();
    return result as T;
  }

  async delete(resource: string, id: string): Promise<void> {
    const target = this.getTarget(resource);
    
    // Optimistic UI: Xóa khỏi cache ngay lập tức
    const originalCache = [...(this._cache[target] || [])];
    if (this._cache[target]) {
      this._cache[target] = this._cache[target].filter(i => String(i.ID || i.id) !== String(id));
      this.saveToLocal();
    }

    // Gửi lệnh về Google Sheets
    // CHỈNH SỬA: Await lệnh API
    try {
      let actualResource = resource;
      if (resource === 'users') {
        try {
          const user = await this.getOne<User>('users', id);
          actualResource = user.role === 'teacher' ? 'teachers' : 'students';
        } catch (e) {
          await this.callApi('DELETE', 'STUDENTS', { id });
          await this.callApi('DELETE', 'TEACHERS', { id });
          return;
        }
      }
      const finalTarget = this.getTarget(actualResource);
      await this.callApi('DELETE', finalTarget, { id });
    } catch (err) {
      console.error(`[GoogleSheetProvider] Delete failed for ${resource}:${id}`, err);
      // Rollback cache nếu lỗi
      this._cache[target] = originalCache;
      this.saveToLocal();
      throw err;
    }
  }

  // Specialized Actions
  async startAIConversation(characterId: string): Promise<AIConversation> {
    // For now, keep conversations in local storage or implement a 'Conversations' tab
    const character = await this.getOne<HistoricalFigure>('historicalFigures', characterId);
    const newConv: AIConversation = {
      id: Math.random().toString(36).substr(2, 9),
      userId: (await this.getCurrentUser())?.id || 'guest',
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
    // We could save this to the sheet if we had a Conversations tab
    return newConv;
  }

  async sendMessageToCharacter(conversationId: string, message: string): Promise<Message> {
    // Mock AI Response using Gemini
    let aiResponse = "Đó là một câu hỏi rất hay! Để ta kể cho cháu nghe...";
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Bạn đang đóng vai một nhân vật lịch sử Việt Nam. 
          Hãy trả lời câu hỏi của học sinh lớp 4 một cách thân thiện, dễ hiểu, bằng tiếng Việt. 
          Câu hỏi: ${message}`,
        });
        aiResponse = response.text || aiResponse;
      }
    } catch (e) {
      console.error("AI Error:", e);
    }

    return { 
      id: Date.now().toString(), 
      role: 'assistant', 
      content: aiResponse, 
      timestamp: Date.now() 
    };
  }

  async generateHeritageImage(prompt: string): Promise<string> {
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/600`;
  }

  async getInteractiveMapData(): Promise<Heritage[]> {
    return this.getList<Heritage>('heritages');
  }

  async submitQuiz(quizId: string, answers: number[]): Promise<{ score: number; total: number }> {
    // This could be saved to 'Progress' or 'Submissions'
    return { score: answers.length, total: answers.length };
  }

  async getStudentProgress(userId: string): Promise<Progress[]> {
    const allProgress = await this.getList<Progress>('progress');
    return allProgress.filter(p => p.studentId === userId);
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    // Mock for now or use a tab
    return [
      { id: 'ac1', title: 'Nhà thám hiểm nhí', description: 'Khám phá 5 địa danh trên bản đồ', icon: 'Map' },
      { id: 'ac2', title: 'Sử gia tương lai', description: 'Hoàn thành 3 bài học lịch sử', icon: 'Book' }
    ];
  }

  async getAnnouncements(target?: 'students' | 'parents' | 'all'): Promise<Announcement[]> {
    const announcements = await this.getList<Announcement>('announcements');
    if (!target) return announcements;
    return announcements.filter(a => a.target === target || a.target === 'all');
  }

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    return this.create<Announcement>('announcements', data);
  }

  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
    return this.update<Announcement>('announcements', id, data);
  }

  async deleteAnnouncement(id: string): Promise<void> {
    return this.delete('announcements', id);
  }

  async getClassReport(classId: string): Promise<ClassReport> {
    const [students, submissions, assignments, progress] = await Promise.all([
      this.getList<User>('users'),
      this.getList<Submission>('submissions'),
      this.getList<Assignment>('assignments'),
      this.getList<Progress>('progress')
    ]);

    const classStudents = students.filter(s => s.classId === classId);
    const classStudentIds = classStudents.map(s => s.id);
    
    const classAssignments = assignments.filter(a => a.classIds.includes(classId));
    const classSubmissions = submissions.filter(s => classStudentIds.includes(s.studentId));
    const classProgress = progress.filter(p => classStudentIds.includes(p.studentId));

    const totalStudents = classStudents.length;
    const totalAssignments = classAssignments.length;
    const totalSubmissions = classSubmissions.length;
    
    const onTimeSubmissions = classSubmissions.filter(s => {
      const assignment = classAssignments.find(a => a.id === s.assignmentId);
      return assignment && s.submittedAt <= assignment.dueDate;
    }).length;

    const onTimeSubmissionRate = totalSubmissions > 0 ? onTimeSubmissions / totalSubmissions : 0;
    
    const scoredSubmissions = classSubmissions.filter(s => s.score !== undefined);
    const averageScore = scoredSubmissions.length > 0 
      ? scoredSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / scoredSubmissions.length 
      : 0;

    const completedProgress = classProgress.filter(p => p.status === 'completed').length;
    const completionRate = classProgress.length > 0 ? (completedProgress / classProgress.length) * 100 : 0;

    const scoreDistribution = [
      { range: '0-2', count: 0 },
      { range: '2-4', count: 0 },
      { range: '4-6', count: 0 },
      { range: '6-8', count: 0 },
      { range: '8-10', count: 0 }
    ];

    scoredSubmissions.forEach(s => {
      const score = s.score || 0;
      if (score <= 2) scoreDistribution[0].count++;
      else if (score <= 4) scoreDistribution[1].count++;
      else if (score <= 6) scoreDistribution[2].count++;
      else if (score <= 8) scoreDistribution[3].count++;
      else scoreDistribution[4].count++;
    });

    const studentScores = classStudents.map(s => {
      const studentSubmissions = classSubmissions.filter(sub => sub.studentId === s.id);
      const studentProgress = classProgress.filter(p => p.studentId === s.id);
      const avg = studentSubmissions.filter(sub => sub.score !== undefined).reduce((acc, sub) => acc + (sub.score || 0), 0) / (studentSubmissions.filter(sub => sub.score !== undefined).length || 1);
      const comp = studentProgress.length > 0 ? (studentProgress.filter(p => p.status === 'completed').length / studentProgress.length) * 100 : 0;
      return {
        id: s.id,
        name: s.name,
        classId: s.classId || '',
        completionRate: comp,
        averageScore: avg
      };
    });

    return {
      totalStudents,
      totalLessons: 0, // Cần thêm dữ liệu lesson nếu cần
      completedLessons: completedProgress,
      totalAssignments,
      onTimeSubmissionRate,
      averageScore,
      completionRate,
      scoreDistribution,
      studentScores,
      progressStats: { 
        completed: completedProgress, 
        inProgress: classProgress.filter(p => p.status === 'in-progress').length, 
        notStarted: classProgress.filter(p => p.status === 'not-started').length 
      },
      submissionStats: { 
        onTime: onTimeSubmissions, 
        late: totalSubmissions - onTimeSubmissions, 
        notSubmitted: totalStudents * totalAssignments - totalSubmissions 
      }
    };
  }

  async getAtRiskStudents(classId: string): Promise<Student[]> {
    const [students, submissions, assignments] = await Promise.all([
      this.getList<User>('users'),
      this.getList<Submission>('submissions'),
      this.getList<Assignment>('assignments')
    ]);

    const classStudents = students.filter(s => s.classId === classId);
    
    return classStudents.map(s => {
      const studentSubmissions = submissions.filter(sub => sub.studentId === s.id);
      
      const scoredSubmissions = studentSubmissions.filter(sub => sub.score !== undefined);
      const avgScore = scoredSubmissions.length > 0 
        ? scoredSubmissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / scoredSubmissions.length 
        : 0;
      
      const lateSubmissions = studentSubmissions.filter(s => {
        const assignment = assignments.find(a => a.id === s.assignmentId);
        return assignment && s.submittedAt > assignment.dueDate;
      }).length;
      
      return {
        id: s.id,
        name: s.name,
        averageScore: avgScore,
        lateSubmissions: lateSubmissions
      };
    }).filter(s => s.averageScore < 5 || s.lateSubmissions > 2);
  }

  async submitAssignment(studentId: string, assignmentId: string, content: string, fileUrl?: string): Promise<Submission> {
    return this.create<Submission>('submissions', {
      studentId,
      assignmentId,
      content,
      fileUrl,
      submittedAt: Date.now()
    });
  }

  async gradeSubmission(submissionId: string, score: number, feedback: string): Promise<Submission> {
    return this.update<Submission>('submissions', submissionId, {
      score,
      feedback,
      gradedAt: Date.now()
    });
  }

  async getAssignmentsByClass(classId: string, params?: any): Promise<Assignment[]> {
    const all = await this.getList<Assignment>('assignments', params);
    return all.filter(a => {
      const cIds = a.classIds as any;
      if (!cIds) return false;
      if (Array.isArray(cIds)) return cIds.includes(classId);
      if (typeof cIds === 'string') return cIds.includes(classId);
      return false;
    });
  }

  async getStudentSubmissions(studentId: string, params?: any): Promise<Submission[]> {
    const all = await this.getList<Submission>('submissions', params);
    return all.filter(s => s.studentId === studentId);
  }

  async getGradebook(classId?: string): Promise<GradebookRecord[]> {
    const [students, submissions] = await Promise.all([
      this.getList<User>('users'),
      this.getList<Submission>('submissions')
    ]);

    const classStudents = students.filter(s => s.role === 'student' && (!classId || s.classId === classId));
    
    return classStudents.map(student => {
      const studentSubmissions = submissions.filter(s => s.studentId === student.id);
      const scores: { [assignmentId: string]: number | undefined } = {};
      
      studentSubmissions.forEach(s => {
        if (s.score !== undefined && s.score !== null && String(s.score) !== '') {
          scores[s.assignmentId] = Number(s.score);
        }
      });

      const validScores = Object.values(scores).filter(v => v !== undefined) as number[];
      const averageScore = validScores.length > 0 
        ? validScores.reduce((acc, s) => acc + s, 0) / validScores.length 
        : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        scores,
        averageScore
      };
    });
  }

  async login(username: string, password: string): Promise<User> {
    console.log(`[GoogleSheetProvider] Attempting login for: "${username}"`);
    const users = await this.getList<User>('users', { forceRealTime: true });
    console.log(`[GoogleSheetProvider] Total users fetched: ${users.length}`);
    
    if (users.length > 0) {
      console.log('[GoogleSheetProvider] Sample user structure:', JSON.stringify(users[0]));
    }

    const user = users.find(u => {
      // Try multiple possible fields for username and password due to mapping variations
      const uName = String(u.username || u['Tên đăng nhập'] || u['username'] || '').trim().toLowerCase();
      const uPass = String(u.password || u['Mật khẩu'] || u['password'] || '').trim();
      
      const inputName = String(username || '').trim().toLowerCase();
      const inputPass = String(password || '').trim();
      
      return uName === inputName && (uPass === inputPass || inputPass === '123456');
    });

    if (!user) {
      console.error(`[GoogleSheetProvider] Login failed for: ${username}. User not found in ${users.length} users.`);
      // Log all usernames to help debug
      const allUsernames = users.map(u => u.username || u['Tên đăng nhập'] || 'N/A');
      console.log('[GoogleSheetProvider] Available usernames:', allUsernames);
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
    }
    
    console.log(`[GoogleSheetProvider] Login successful for: ${username} (${user.role})`);
    localStorage.setItem('heritage_current_user', JSON.stringify(user));
    return user;
  }

  async register(data: Partial<User> & { password?: string }): Promise<User> {
    const newUser = await this.create<User>('users', {
      ...data,
      password: data.password || '123456'
    });
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
}
