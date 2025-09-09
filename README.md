# 🗡️ 空洞骑士存档修改器
为了改变空洞骑士的存档数据，所以创建这个项目，参考资料来源于这个地址：https://bloodorca.github.io/hollow/

这是一个用于解析和编辑空洞骑士 `usr1.dat` 存档文件的现代化Web应用程序。

有问题欢迎issue，有能力的小伙伴可以开个dev尝试帮我解决某些问题，有空我会check和merge。

## ✨ 功能特性

- 🔓 **真实解密**: 基于空洞骑士实际的AES-ECB加密算法
- 📁 **文件上传**: 支持拖拽和点击选择 `.dat` 文件
- 👀 **内容查看**: 解密后以JSON格式展示存档内容
- 🔍 **高级搜索**: 类似VSCode的搜索功能，支持大小写匹配和整词匹配
- ✏️ **内容编辑**: 可以直接修改JSON内容
- 💾 **重新加密**: 修改后重新加密为 `.dat` 格式下载

## 🏗️ 项目结构

```
src/
├── components/          # React组件
│   ├── FileUpload.tsx      # 文件上传组件
│   ├── SearchBar.tsx       # 搜索栏组件
│   ├── JsonEditor.tsx      # JSON编辑器组件
│   └── NotificationMessages.tsx # 通知消息组件
├── hooks/              # 自定义React Hooks
│   ├── useSearch.ts        # 搜索功能Hook
│   └── useNotification.ts  # 通知功能Hook
├── utils/              # 工具函数
│   ├── hollowKnightCrypto.ts # 空洞骑士加密/解密工具
│   └── fileUtils.ts        # 文件处理工具
├── types/              # TypeScript类型定义
│   └── aes-js.d.ts        # aes-js库类型定义
├── App.tsx             # 主应用组件
├── App.css             # 样式文件
└── main.tsx            # 应用入口
```

## 🔧 技术栈

- **React 18** + **TypeScript** - 现代化前端框架
- **Vite** - 快速构建工具
- **AES-JS** - AES加密/解密库
- **Ant Design** - UI组件库（仅使用Tooltip）

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm run dev
```

### 构建生产版本
```bash
pnpm run build
```

## 📖 使用说明

1. **上传文件**: 点击或拖拽 `.dat` 文件到上传区域
2. **查看内容**: 文件解密后会以JSON格式显示在编辑器中
3. **搜索内容**: 使用搜索栏快速定位特定数据
   - `Enter`: 跳转到下一个匹配项
   - `Shift+Enter`: 跳转到上一个匹配项
   - `Esc`: 清除搜索
4. **编辑内容**: 直接在编辑器中修改JSON数据
5. **下载文件**: 点击"下载文件"按钮保存修改后的存档

## 🔐 加密原理

空洞骑士使用以下加密方式：
- **算法**: AES-ECB
- **密钥**: `UKu52ePUBwetZ9wNX88o54dnfKRu0T1l`
- **填充**: PKCS7填充

## 🎯 代码架构特点

### 组件化设计
- 每个功能模块都被拆分为独立的React组件
- 组件职责单一，便于维护和测试

### 自定义Hooks
- `useSearch`: 封装搜索相关的状态和逻辑
- `useNotification`: 管理错误和成功消息的显示

### 工具函数分离
- `hollowKnightCrypto.ts`: 专门处理加密/解密逻辑
- `fileUtils.ts`: 通用文件处理函数

### TypeScript支持
- 完整的类型定义
- 为第三方库提供类型声明文件

## 🛠️ 开发指南

### 添加新功能
1. 在 `components/` 目录下创建新组件
2. 在 `hooks/` 目录下创建相关的自定义Hook
3. 在 `utils/` 目录下添加工具函数
4. 更新 `App.tsx` 集成新功能

### 代码规范
- 使用TypeScript进行类型检查
- 组件使用函数式组件 + Hooks
- 遵循React最佳实践
- 保持代码模块化和可复用性

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

基于 [bloodorca.github.io/hollow](https://bloodorca.github.io/hollow/) 的真实空洞骑士存档解密实现。