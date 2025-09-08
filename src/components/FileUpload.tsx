import React, { useRef } from 'react';
import type { FileInfo } from '../utils/fileUtils';
import { formatFileSize, isValidFileType } from '../utils/fileUtils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  fileInfo: FileInfo | null;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  fileInfo,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="file-section">
      <div 
        className={`upload-area ${isDragOver ? 'dragover' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleClick}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <h3>选择存档文件</h3>
          <p>点击或拖拽 .dat 文件到此处</p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".dat,.json" 
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button className="btn btn-primary">
            选择文件
          </button>
        </div>
      </div>
      
      {fileInfo && (
        <div className="file-info">
          <h4>文件信息</h4>
          <p><strong>文件名:</strong> {fileInfo.name}</p>
          <p><strong>文件大小:</strong> {formatFileSize(fileInfo.size)}</p>
          <p><strong>最后修改:</strong> {new Date(fileInfo.lastModified).toLocaleString()}</p>
        </div>
      )}
    </section>
  );
};