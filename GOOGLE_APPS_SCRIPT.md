# Google Apps Script Backend for Heritage App

Copy and paste the following code into your Google Apps Script editor (Extensions -> Apps Script).

```javascript
/**
 * GOOGLE APPS SCRIPT BACKEND FOR HERITAGE APP
 * 
 * Hướng dẫn:
 * 1. Mở Google Sheet của bạn.
 * 2. Vào Tiện ích mở rộng -> Apps Script.
 * 3. Dán mã này vào và thay thế toàn bộ nội dung cũ.
 * 4. Nhấn "Triển khai" -> "Triển khai mới".
 * 5. Chọn loại là "Ứng dụng web".
 * 6. "Người có quyền truy cập" chọn "Bất kỳ ai".
 * 7. Sao chép URL ứng dụng web và dán vào biến SCRIPT_URL trong file googleSheetProvider.ts.
 * 8. Đảm bảo các Tab trong Google Sheet có tên khớp với các TARGET (STUDENTS, TEACHERS, CLASSES, ...)
 * 9. Đảm bảo các tiêu đề cột (Hàng 1) trong mỗi Tab khớp với FIELD_MAP trong googleSheetProvider.ts.
 *    Ví dụ Tab STUDENTS cần có các cột: ID, Họ và tên, Tên đăng nhập, Mật khẩu, Ngày sinh, Lớp học, Số điện thoại phụ huynh, Tiến độ (%), Trường học.
 */

const CONFIG = {
  SHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  TARGET_SHEETS: {
    'STUDENTS': 'STUDENTS',
    'TEACHERS': 'TEACHERS',
    'CLASSES': 'CLASSES',
    'TOPICS': 'TOPICS',
    'LESSONS': 'LESSONS',
    'QUESTIONS': 'QUESTIONS',
    'ASSIGNMENTS': 'ASSIGNMENTS',
    'SUBMISSIONS': 'SUBMISSIONS',
    'GAMES': 'GAMES',
    'HERITAGES': 'HERITAGES',
    'HISTORICALFIGURES': 'HISTORICALFIGURES',
    'QUIZZES': 'QUIZZES',
    'CERTIFICATES': 'CERTIFICATES',
    'ACHIEVEMENTS': 'ACHIEVEMENTS',
    'GRADES': 'GRADES',
    'PROGRESS': 'PROGRESS',
    'ANNOUNCEMENTS': 'ANNOUNCEMENTS',
    'USERS': 'STUDENTS' // Fallback for users
  }
};

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action; // Ví dụ: "READ_STUDENTS", "UPSERT_CLASSES"
    const payload = requestData.payload;

    const parts = action.split('_');
    const method = parts[0];
    const targetKey = parts.slice(1).join('_');
    const sheetName = CONFIG.TARGET_SHEETS[targetKey];

    if (!sheetName) {
      return createResponse(false, `Bảng không tồn tại cho target: ${targetKey}`);
    }

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    
    // Tự động tạo sheet nếu chưa có
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    switch (method) {
      case 'PING':
        return createResponse(true, "Pong! Apps Script is ready.");
      case 'READ':
        return createResponse(true, readData(sheet));
      case 'UPSERT':
        return createResponse(true, upsertData(sheet, payload));
      case 'DELETE':
        const deleteId = payload.id || payload.ID;
        if (!deleteId) return createResponse(false, "Thiếu ID để xóa");
        return createResponse(true, deleteData(sheet, deleteId));
      default:
        return createResponse(false, `Hành động không hợp lệ: ${method}. Các hành động hỗ trợ: READ, UPSERT, DELETE, PING`);
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function readData(sheet) {
  SpreadsheetApp.flush(); // Đảm bảo dữ liệu được ghi hết trước khi đọc
  const data = sheet.getDataRange().getValues();
  if (data.length < 1) return [];
  
  const headers = data[0].map(h => h.toString().trim());
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      if (header) {
        let val = row[index];
        // Xử lý các giá trị ngày tháng từ Google Sheet
        if (val instanceof Date) {
          val = val.toISOString();
        }
        obj[header] = val;
      }
    });
    return obj;
  }).filter(row => {
    // Kiểm tra xem hàng có dữ liệu thực sự không (không chỉ là hàng trống)
    return Object.values(row).some(v => v !== "" && v !== null && v !== undefined);
  });
}

function upsertData(sheet, payload) {
  const data = sheet.getDataRange().getValues();
  let headers = data[0];
  
  // Nếu sheet trống, ghi header trước
  if (data.length === 0 || (data.length === 1 && data[0][0] === "")) {
    headers = Object.keys(payload);
    sheet.appendRow(headers);
  }

  const idIndex = headers.indexOf('ID');
  if (idIndex === -1) throw new Error("Cột 'ID' không tồn tại trong bảng.");

  const idValue = payload['ID'];
  let rowIndex = -1;

  // Tìm hàng hiện tại có ID trùng
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == idValue) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowData = headers.map(header => {
    const val = payload[header];
    return val !== undefined ? val : "";
  });

  if (rowIndex > -1) {
    // Cập nhật
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Thêm mới
    sheet.appendRow(rowData);
  }
  
  return { success: true, id: idValue };
}

function deleteData(sheet, id) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('ID');
  
  if (idIndex === -1) return { success: false, error: "Không tìm thấy cột ID" };

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  
  return { success: false, error: "Không tìm thấy ID để xóa" };
}

function createResponse(ok, dataOrError) {
  const result = {
    ok: ok,
    [ok ? 'data' : 'error']: dataOrError
  };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```
