import * as aes from 'aes-js';

/**
 * 空洞骑士存档加密/解密工具
 * 基于真实的游戏实现
 */

// 空洞骑士固定密钥
const HOLLOW_KNIGHT_KEY = 'UKu52ePUBwetZ9wNX88o54dnfKRu0T1l';

/**
 * 移除C#头部信息
 * @param data 原始数据
 * @returns 移除头部后的数据
 */
const removeHeader = (data: Uint8Array): Uint8Array => {
  const cSharpHeader = [0, 1, 0, 0, 0, 255, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0];
  
  // 检查是否有C#头部
  let headerFound = true;
  for (let i = 0; i < cSharpHeader.length && i < data.length; i++) {
    if (data[i] !== cSharpHeader[i]) {
      headerFound = false;
      break;
    }
  }
  
  if (headerFound) {
    // 跳过头部，然后读取长度前缀
    let offset = cSharpHeader.length;
    
    // 读取字符串长度（7位变长编码）
    let length = 0;
    let shift = 0;
    
    while (offset < data.length) {
      const byte = data[offset++];
      length |= (byte & 0x7F) << shift;
      shift += 7;
      
      // 如果最高位为0，表示这是最后一个字节
      if ((byte & 0x80) === 0) {
        break;
      }
    }
    
    console.log(`Header found, length: ${length}, offset: ${offset}`);
    
    // 返回实际数据部分（长度为length的数据）
    return data.slice(offset, offset + length);
  }
  
  return data;
};

/**
 * Base64解码
 * @param data Base64编码的数据
 * @returns 解码后的二进制数据
 */
const base64Decode = (data: Uint8Array): Uint8Array => {
  const base64String = new TextDecoder('utf-8').decode(data);
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
};

/**
 * AES解密并移除PKCS7填充
 * @param data 加密的数据
 * @returns 解密后的数据
 */
const aesDecrypt = (data: Uint8Array): Uint8Array => {
  const keyBytes = aes.utils.utf8.toBytes(HOLLOW_KNIGHT_KEY);
  const aesCtr = new aes.ModeOfOperation.ecb(keyBytes);
  const decryptedBytes = aesCtr.decrypt(data);
  
  // 移除PKCS7填充
  const lastByte = decryptedBytes[decryptedBytes.length - 1];
  const paddingLength = lastByte;
  
  // 验证填充
  if (paddingLength > 0 && paddingLength <= 16) {
    for (let i = decryptedBytes.length - paddingLength; i < decryptedBytes.length; i++) {
      if (decryptedBytes[i] !== paddingLength) {
        // 填充无效，返回原始数据
        return decryptedBytes;
      }
    }
    // 填充有效，移除填充
    return decryptedBytes.slice(0, decryptedBytes.length - paddingLength);
  }
  
  return decryptedBytes;
};

/**
 * 解密空洞骑士存档文件
 * @param data 加密的二进制数据
 * @returns 解密后的JSON字符串
 */
export const decryptHollowKnightSave = (data: Uint8Array): string => {
  console.log('开始解密，原始数据长度:', data.length);
  console.log('前32字节:', Array.from(data.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join(' '));
  
  try {
    // 步骤1: 移除C#头部
    console.log('步骤1: 移除C#头部');
    let processedData = removeHeader(data);
    console.log('移除头部后数据长度:', processedData.length);
    console.log('前32字节:', Array.from(processedData.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // 步骤2: Base64解码
    console.log('步骤2: Base64解码');
    processedData = base64Decode(processedData);
    console.log('Base64解码后数据长度:', processedData.length);
    console.log('前32字节:', Array.from(processedData.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // 步骤3: AES解密
    console.log('步骤3: AES解密');
    processedData = aesDecrypt(processedData);
    console.log('AES解密后数据长度:', processedData.length);
    console.log('前32字节:', Array.from(processedData.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // 步骤4: 转换为UTF-8字符串
    console.log('步骤4: 转换为UTF-8字符串');
    const jsonString = aes.utils.utf8.fromBytes(Array.from(processedData));
    console.log('JSON字符串长度:', jsonString.length);
    console.log('前100个字符:', jsonString.substring(0, 100));
    
    // 验证是否为有效JSON
    JSON.parse(jsonString);
    console.log('JSON验证成功');
    return jsonString;
    
  } catch (error) {
    console.error('标准解密流程失败:', error);
    
    // 如果标准流程失败，尝试其他方法
    try {
      console.log('尝试方法1: 直接UTF-8解码');
      const decoded = new TextDecoder('utf-8').decode(data);
      if (decoded.includes('{') && decoded.includes('}')) {
        JSON.parse(decoded); // 验证JSON
        console.log('方法1成功');
        return decoded;
      }
    } catch (e) {
      console.log('方法1失败:', e);
    }
    
    // 方法2: 尝试跳过头部后直接Base64解码
    try {
      console.log('尝试方法2: 跳过头部后直接Base64解码');
      const withoutHeader = removeHeader(data);
      const base64String = new TextDecoder('utf-8').decode(withoutHeader);
      const decoded = atob(base64String);
      if (decoded.includes('{') && decoded.includes('}')) {
        JSON.parse(decoded); // 验证JSON
        console.log('方法2成功');
        return decoded;
      }
    } catch (e) {
      console.log('方法2失败:', e);
    }
    
    throw new Error('无法解密存档文件，可能文件格式不正确');
  }
};

/**
 * 添加C#头部信息
 * @param data 数据
 * @returns 添加头部后的数据
 */
const addHeader = (data: Uint8Array): Uint8Array => {
  const cSharpHeader = [0, 1, 0, 0, 0, 255, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0];
  
  // 计算长度编码（变长编码）
  const length = data.length;
  const lengthBytes: number[] = [];
  
  let tempLength = length;
  while (tempLength >= 0x80) {
    lengthBytes.push((tempLength & 0x7F) | 0x80);
    tempLength >>>= 7;
  }
  lengthBytes.push(tempLength & 0x7F);
  
  // 组合头部 + 长度 + 数据
  const result = new Uint8Array(cSharpHeader.length + lengthBytes.length + data.length);
  let offset = 0;
  
  // 添加C#头部
  result.set(cSharpHeader, offset);
  offset += cSharpHeader.length;
  
  // 添加长度编码
  result.set(lengthBytes, offset);
  offset += lengthBytes.length;
  
  // 添加数据
  result.set(data, offset);
  
  return result;
};

/**
 * Base64编码
 * @param data 二进制数据
 * @returns Base64编码的数据
 */
const base64Encode = (data: Uint8Array): Uint8Array => {
  let binaryString = '';
  for (let i = 0; i < data.length; i++) {
    binaryString += String.fromCharCode(data[i]);
  }
  
  const base64String = btoa(binaryString);
  return new TextEncoder().encode(base64String);
};

/**
 * AES加密并添加PKCS7填充
 * @param data 原始数据
 * @returns 加密后的数据
 */
const aesEncrypt = (data: Uint8Array): Uint8Array => {
  const keyBytes = aes.utils.utf8.toBytes(HOLLOW_KNIGHT_KEY);
  
  // 添加PKCS7填充
  const remainder = data.length % 16;
  let paddedBytes: Uint8Array = data;
  if (remainder !== 0) {
    const paddingLength = 16 - remainder;
    paddedBytes = new Uint8Array(data.length + paddingLength);
    paddedBytes.set(data);
    // 使用PKCS7填充
    for (let i = data.length; i < paddedBytes.length; i++) {
      paddedBytes[i] = paddingLength;
    }
  }
  
  // 使用AES-ECB模式加密
  const aesCtr = new aes.ModeOfOperation.ecb(keyBytes);
  const encryptedBytes = aesCtr.encrypt(paddedBytes);
  
  return new Uint8Array(encryptedBytes);
};

/**
 * 加密JSON数据为空洞骑士存档格式
 * @param jsonData JSON对象
 * @returns 加密后的二进制数据
 */
export const encryptHollowKnightSave = (jsonData: any): Uint8Array => {
  try {
    // 步骤1: JSON转换为UTF-8字节
    const jsonString = JSON.stringify(jsonData);
    const jsonBytes = aes.utils.utf8.toBytes(jsonString);
    
    // 步骤2: AES加密
    let processedData = aesEncrypt(new Uint8Array(jsonBytes));
    
    // 步骤3: Base64编码
    processedData = base64Encode(processedData);
    
    // 步骤4: 添加C#头部
    processedData = addHeader(processedData);
    
    return processedData;
  } catch (error) {
    throw new Error(`加密失败: ${error}`);
  }
};