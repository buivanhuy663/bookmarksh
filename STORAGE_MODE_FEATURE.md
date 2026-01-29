# Storage Mode Toggle Feature

## Tổng quan
Tính năng cho phép chuyển đổi giữa 2 chế độ lưu trữ bookmarks:
- **JSON File Mode (○)**: Lưu vào file `.vscode/bookmarksh_data.json`
- **Workspace State Mode (□)**: Lưu vào VS Code workspace state

## Cách sử dụng

### 1. Icon trên toolbar
- **Hình tròn (○)**: Đang ở chế độ JSON File
- **Hình vuông (□)**: Đang ở chế độ Workspace State

### 2. Toggle giữa các chế độ
Click vào icon để chuyển đổi giữa 2 chế độ:
- JSON → Workspace: Dữ liệu sẽ được chuyển sang workspace state, file JSON sẽ bị xóa
- Workspace → JSON: Dữ liệu sẽ được lưu vào file JSON mới

### 3. Khởi tạo mode
Ban đầu, extension sẽ tự động detect:
- Nếu file `.vscode/bookmarksh_data.json` tồn tại → Chế độ JSON
- Nếu không tồn tại → Chế độ Workspace

## Các file đã thay đổi

### 1. Config.ts
- Thêm enum `StorageMode` với 2 giá trị: JSON và WORKSPACE
- Thêm biến static `storageMode` để lưu mode hiện tại

### 2. Icons.ts + Resources
- Thêm icon `storage_json` (hình tròn)
- Thêm icon `storage_workspace` (hình vuông)
- 4 file SVG trong `resources/light` và `resources/dark`

### 3. Commands.ts
- Thêm 2 commands: `toggleStorageModeJSON` và `toggleStorageModeWorkspace`
- Thêm 2 context variables để điều khiển hiển thị icon
- Thêm vào `view_title` để hiển thị trên toolbar

### 4. BookmarksTreeRepository.ts
- Sửa `readBookmarksFromFile()`: Đọc từ JSON hoặc Workspace tùy theo mode
- Sửa `saveBookmarksToFile()`: Lưu vào JSON hoặc Workspace tùy theo mode
- Thêm `toggleStorageMode()`: Chuyển đổi giữa 2 mode và migrate data
- Thêm `initStorageMode()`: Tự động detect mode khi khởi động

### 5. BookmarkTreeViewProvider.ts
- Thêm `onToggleStorageMode()`: Handler cho command toggle
- Thêm `updateStorageModeIcon()`: Cập nhật context để hiển thị đúng icon
- Gọi `initStorageMode()` trong method `init()`

### 6. actionSubscriber.ts
- Đăng ký command `toggleStorageMode`

## Testing
1. Khởi động extension (F5)
2. Kiểm tra icon hiển thị trên BOOKMARKS view
3. Click vào icon để toggle
4. Kiểm tra file `.vscode/bookmarksh_data.json` xuất hiện/biến mất
5. Restart extension và kiểm tra data vẫn còn
