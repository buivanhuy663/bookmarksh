# Bug Fixes - Storage Mode

## Vấn đề đã phát hiện

### 1. File JSON bị tạo khi ở chế độ Workspace
**Nguyên nhân:**
- `saveBookmarksToFile()` luôn gọi `exportAllBookmark()` nếu `Config.autoBackupJson = true`
- Không phân biệt giữa chế độ JSON và Workspace

**Giải pháp:**
- Chỉ backup ra JSON khi đang ở chế độ **Workspace** VÀ có enable `autoBackupJson`
- Khi ở chế độ JSON, không cần backup vì đã lưu trực tiếp vào JSON rồi

### 2. initViewEditor() đọc file JSON sai logic
**Nguyên nhân:**
- `initViewEditor()` đọc file JSON khi `autoBackupJson = true` mà không kiểm tra `storageMode`
- Dẫn đến conflict giữa dữ liệu JSON và Workspace

**Giải pháp:**
- Chỉ đọc autoBackupJson khi ở chế độ **Workspace** VÀ có enable `autoBackupJson`
- Thêm check `Config.storageMode === StorageMode.WORKSPACE`

### 3. Lỗi đường dẫn `__root__/__root__`
**Nguyên nhân:**
- Method `fromJsonImport()` chỉ replace `__root__` một lần
- Nếu dữ liệu cũ đã bị lưu sai (có nhiều `__root__`), sẽ không xóa hết

**Giải pháp:**
- Dùng regex với flag `g` (global) để replace tất cả `__root__`
- `replace(new RegExp(\`__root__${path.sep.replace('\\\\', '\\\\\\\\')}\`, 'g'), '')`

## Các file đã sửa

### 1. BookmarksTreeRepository.ts
```typescript
async saveBookmarksToFile(context: vscode.ExtensionContext, bookmarks: SetBookmark): Promise<void> {
    // ...
    if (Config.storageMode === StorageMode.JSON) {
        // Lưu vào JSON
    } else {
        // Lưu vào Workspace
        fileHelper.writeWorkspace(context, fileHelper.BOOKMARKS_WORKSPACE, jsonAll)
        
        // CHỈ backup ra JSON nếu đang ở chế độ Workspace VÀ có enable autoBackupJson
        if (Config.autoBackupJson) {
            this.exportAllBookmark(bookmarks, `bookmarksh_data`, false)
        }
    }
}
```

### 2. BookmarkTreeViewProvider.ts
```typescript
async initViewEditor() {
    try {
        // CHỈ đọc từ autoBackupJson khi ở chế độ Workspace và có enable autoBackupJson
        if (Config.storageMode === StorageMode.WORKSPACE && Config.autoBackupJson) {
            const data = await fileHelper.readJsonFile(...)
            // ...
        }
        await this.getBookmarksLocal()
        // ...
    }
}
```

### 3. Bookmark.ts
```typescript
public static fromJsonImport(data: any): Bookmark {
    // ...
    parent = new Bookmark({
        // Replace TẤT CẢ __root__ (dùng regex với flag 'g')
        path: (data.path as string)
            .replace(/\\/g, path.sep)
            .replace(new RegExp(`__root__${path.sep.replace('\\', '\\\\')}`, 'g'), ''),
        // ...
    })
}
```

## Testing

1. **Chế độ JSON:**
   - ✅ Không tạo file backup khi thêm/sửa bookmark
   - ✅ Dữ liệu lưu trực tiếp vào `.vscode/bookmarksh_data.json`

2. **Chế độ Workspace:**
   - ✅ Không tạo file JSON nếu `autoBackupJson = false`
   - ✅ Tạo file backup nếu `autoBackupJson = true`
   - ✅ Dữ liệu lưu vào workspace state

3. **Import dữ liệu cũ:**
   - ✅ Xóa hết các `__root__` duplicate trong path
   - ✅ Không còn lỗi `Unable to resolve nonexistent file`
