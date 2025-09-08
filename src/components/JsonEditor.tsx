import React, { useRef, useImperativeHandle, forwardRef } from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export interface JsonEditorRef {
  scrollToPosition: (index: number, searchTermLength: number) => void;
  focus: () => void;
}

export const JsonEditor = forwardRef<JsonEditorRef, JsonEditorProps>(
  ({ value, onChange }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      scrollToPosition: (index: number, searchTermLength: number) => {
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          
          // 确保textarea获得焦点
          textarea.focus();
          
          // 使用setTimeout确保焦点设置完成后再设置选择
          setTimeout(() => {
            // 设置选择范围（这会自动高亮选中的文本）
            textarea.setSelectionRange(index, index + searchTermLength);
            
            // 计算行号
            const textBeforeMatch = value.substring(0, index);
            const lineNumber = textBeforeMatch.split('\n').length - 1; // 0-based行号
            
            // 获取textarea的实际样式信息
            const computedStyle = window.getComputedStyle(textarea);
            const lineHeight = parseInt(computedStyle.lineHeight) || 20;
            const paddingTop = parseInt(computedStyle.paddingTop) || 0;
            
            // 计算目标滚动位置，让匹配行显示在视口中央
            const textareaHeight = textarea.clientHeight;
            const visibleLines = Math.floor(textareaHeight / lineHeight);
            const targetLine = Math.max(0, lineNumber - Math.floor(visibleLines / 2));
            const scrollTop = targetLine * lineHeight - paddingTop;
            
            // 设置滚动位置
            textarea.scrollTop = Math.max(0, scrollTop);
            
            // 再次确保选择范围正确设置
            setTimeout(() => {
              textarea.setSelectionRange(index, index + searchTermLength);
            }, 10);
          }, 10);
        }
      },
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    return (
      <div className="editor-container">
        <textarea 
          ref={textareaRef}
          className="json-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="JSON内容将在这里显示..."
        />
      </div>
    );
  }
);

JsonEditor.displayName = 'JsonEditor';