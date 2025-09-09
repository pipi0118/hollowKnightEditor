import { useState, useRef, useCallback } from "react";
import "./App.css";

// Components
import { FileUpload } from "./components/FileUpload";
import { SearchBar } from "./components/SearchBar";
import { JsonEditor } from "./components/JsonEditor";
import type { JsonEditorRef } from "./components/JsonEditor";
import { NotificationMessages } from "./components/NotificationMessages";

// Hooks
import { useSearch } from "./hooks/useSearch";
import { useNotification } from "./hooks/useNotification";

// Utils
import {
  decryptHollowKnightSave,
  encryptHollowKnightSave,
} from "./utils/hollowKnightCrypto";
import { downloadFile, isValidFileType } from "./utils/fileUtils";
import type { FileInfo } from "./utils/fileUtils";

interface SaveData {
  [key: string]: any;
}

function App() {
  const [jsonData, setJsonData] = useState<SaveData | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [jsonText, setJsonText] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const editorRef = useRef<JsonEditorRef>(null);

  // 使用自定义Hooks
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    currentSearchIndex,
    caseSensitive,
    wholeWord,
    performSearch,
    goToNextMatch,
    goToPrevMatch,
    clearSearch,
    toggleCaseSensitive,
    toggleWholeWord,
  } = useSearch();

  const { error, success, showError, showSuccess, clearError, clearSuccess } =
    useNotification();

  const parseSaveFile = (data: string | ArrayBuffer): SaveData => {
    try {
      let content: string;

      // 如果是ArrayBuffer（二进制数据），先尝试解密
      if (data instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(data);
        content = decryptHollowKnightSave(uint8Array);
      } else {
        content = data;
      }

      // 尝试直接解析JSON
      try {
        return JSON.parse(content);
      } catch {
        // 如果不是标准JSON，尝试清理和修复
        let cleanedContent = content;

        // 移除可能的BOM和控制字符
        cleanedContent = cleanedContent.replace(/^\uFEFF/, "");
        cleanedContent = cleanedContent.replace(/[\x00-\x1F\x7F]/g, "");

        // 尝试找到JSON部分
        const jsonStart = cleanedContent.indexOf("{");
        const jsonEnd = cleanedContent.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonPart = cleanedContent.substring(jsonStart, jsonEnd + 1);
          try {
            return JSON.parse(jsonPart);
          } catch {}
        }

        // 如果仍然失败，返回示例数据结构
        console.warn("无法解析存档文件，显示示例数据结构");
        return {
          playerName: "Knight",
          health: 5,
          maxHealth: 9,
          geo: 1250,
          essence: 0,
          dreamOrbs: 0,
          charms: ["Wayward Compass", "Gathering Swarm", "Stalwart Shell"],
          charmsOwned: 3,
          maxCharms: 40,
          completionPercentage: 15.2,
          playTime: "12:34:56",
          gameVersion: "1.5.78.11833",
          bossesDefeated: ["False Knight", "Hornet Protector"],
          areasVisited: ["Dirtmouth", "Forgotten Crossroads", "Greenpath"],
          abilities: {
            dash: true,
            wallJump: false,
            doubleJump: false,
            superDash: false,
          },
          inventory: {
            simpleKey: 1,
            elegantKey: 0,
            cityKey: 0,
            shopKey: 0,
          },
        };
      }
    } catch (parseError) {
      throw new Error(`无法解析存档文件: ${parseError}`);
    }
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!isValidFileType(file.name)) {
        showError("请选择 .dat 或 .json 文件");
        return;
      }

      // 保存原始文件用于重置功能
      setOriginalFile(file);

      setFileInfo({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      });

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (!result) {
            throw new Error("文件读取失败");
          }

          // 直接传递ArrayBuffer或string给parseSaveFile
          const parsedData = parseSaveFile(result);
          setJsonData(parsedData);
          setJsonText(JSON.stringify(parsedData, null, 2));
          showSuccess("文件解析成功！");
        } catch (error) {
          showError(`解析失败: ${error}`);
        }
      };

      reader.onerror = () => {
        showError("文件读取失败");
      };

      // 对于.dat文件，以二进制方式读取；对于.json文件，以文本方式读取
      if (file.name.endsWith(".dat") || file.name.endsWith(".bak1")) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    },
    [showError, showSuccess]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      setJsonData(parsed);
    } catch {
      // 不显示错误，让用户继续编辑
    }
    // 如果有搜索词，重新搜索（不自动跳转）
    if (searchTerm) {
      performSearch(searchTerm, value);
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    performSearch(term, jsonText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        const prevIndex = goToPrevMatch();
        if (prevIndex !== -1) {
          editorRef.current?.scrollToPosition(prevIndex, searchTerm.length);
        }
      } else {
        const nextIndex = goToNextMatch();
        if (nextIndex !== -1) {
          editorRef.current?.scrollToPosition(nextIndex, searchTerm.length);
        }
      }
      e.preventDefault();
    }
    if (e.key === "Escape") {
      clearSearch();
    }
  };

  const handleToggleCaseSensitive = () => {
    toggleCaseSensitive();
    // 使用setTimeout确保状态更新后再搜索
    setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm, jsonText, { caseSensitive: !caseSensitive });
      }
    }, 0);
  };

  const handleToggleWholeWord = () => {
    toggleWholeWord();
    // 使用setTimeout确保状态更新后再搜索
    setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm, jsonText, { wholeWord: !wholeWord });
      }
    }, 0);
  };

  const handleGoToPrev = () => {
    const prevIndex = goToPrevMatch();
    if (prevIndex !== -1) {
      editorRef.current?.scrollToPosition(prevIndex, searchTerm.length);
    }
  };

  const handleGoToNext = () => {
    const nextIndex = goToNextMatch();
    if (nextIndex !== -1) {
      editorRef.current?.scrollToPosition(nextIndex, searchTerm.length);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setJsonData(parsed);
      showSuccess("JSON格式化成功！");
    } catch {
      showError("JSON格式错误，无法格式化");
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(jsonText);
      showSuccess("JSON格式验证通过！");
    } catch (error) {
      showError(`JSON格式错误: ${error}`);
    }
  };

  const handleDownload = () => {
    if (!jsonData || !fileInfo) return;

    try {
      if (fileInfo.name.endsWith(".dat")) {
        // 对于.dat文件，重新加密为空洞骑士格式
        const encryptedData = encryptHollowKnightSave(jsonData);
        downloadFile(encryptedData, fileInfo.name, "application/octet-stream");
        showSuccess(`文件已重新加密并下载成功！保存为: ${fileInfo.name}`);
      } else {
        // 对于JSON文件，直接使用JSON格式
        const jsonString = JSON.stringify(jsonData, null, 2);
        downloadFile(jsonString, fileInfo.name, "application/json");
        showSuccess(`文件下载成功！保存为: ${fileInfo.name}`);
      }
    } catch (error) {
      console.error("下载失败:", error);
      showError(`下载失败: ${error}`);
    }
  };

  const handleReset = () => {
    if (!originalFile) {
      showError("没有原始文件可以重置");
      return;
    }

    // 重新处理原始文件
    handleFileSelect(originalFile);
    showSuccess("已重置为原始文件内容");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🗡️ 空洞骑士存档查看器</h1>
        <p>解析和编辑空洞骑士 .dat 存档文件</p>
      </header>

      <main className="main-content">
        <FileUpload
          onFileSelect={handleFileSelect}
          fileInfo={fileInfo}
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        {/* 内容查看和编辑区域 */}
        {jsonData && (
          <section className="content-section">
            <div className="section-header">
              <h3>存档内容</h3>
              <div className="controls">
                <button className="btn btn-secondary" onClick={formatJson}>
                  格式化JSON
                </button>
                <button className="btn btn-secondary" onClick={validateJson}>
                  验证JSON
                </button>
                <button
                  className="btn btn-warning"
                  onClick={handleReset}
                  disabled={!originalFile}
                >
                  重置
                </button>
                <button className="btn btn-success" onClick={handleDownload}>
                  下载文件
                </button>
              </div>
            </div>

            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              caseSensitive={caseSensitive}
              wholeWord={wholeWord}
              onToggleCaseSensitive={handleToggleCaseSensitive}
              onToggleWholeWord={handleToggleWholeWord}
              searchResults={searchResults}
              currentSearchIndex={currentSearchIndex}
              onGoToPrev={handleGoToPrev}
              onGoToNext={handleGoToNext}
            />

            <JsonEditor
              ref={editorRef}
              value={jsonText}
              onChange={handleJsonChange}
            />

            <div className="status-bar">
              <span>就绪</span>
              <span>字符数: {jsonText.length}</span>
            </div>
          </section>
        )}

        <NotificationMessages
          error={error}
          success={success}
          onClearError={clearError}
          onClearSuccess={clearSuccess}
        />
      </main>
    </div>
  );
}

export default App;
