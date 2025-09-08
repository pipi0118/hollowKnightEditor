/**
 * 文件处理工具函数
 */

export interface FileInfo {
  name: string;
  size: number;
  lastModified: number;
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 下载文件
 * @param data 文件数据
 * @param filename 文件名
 * @param mimeType MIME类型
 */
export const downloadFile = (data: Uint8Array | string, filename: string, mimeType: string): void => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 验证文件类型
 * @param filename 文件名
 * @returns 是否为支持的文件类型
 */
export const isValidFileType = (filename: string): boolean => {
  return filename.endsWith('.dat') || filename.endsWith('.json');
};