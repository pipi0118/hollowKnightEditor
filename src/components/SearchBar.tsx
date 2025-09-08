import React from 'react';
import { Tooltip } from 'antd';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  caseSensitive: boolean;
  wholeWord: boolean;
  onToggleCaseSensitive: () => void;
  onToggleWholeWord: () => void;
  searchResults: number[];
  currentSearchIndex: number;
  onGoToPrev: () => void;
  onGoToNext: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onKeyDown,
  caseSensitive,
  wholeWord,
  onToggleCaseSensitive,
  onToggleWholeWord,
  searchResults,
  currentSearchIndex,
  onGoToPrev,
  onGoToNext,
}) => {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="搜索内容... (Enter: 下一个, Shift+Enter: 上一个, Esc: 清除)"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="search-controls">
        <Tooltip 
          title={
            <div>
              <div><strong>大小写匹配</strong></div>
              <div>开启后区分大小写进行搜索</div>
              <div>例如：搜索"Geo"不会匹配"geo"</div>
            </div>
          }
          placement="bottom"
        >
          <button 
            className={`search-option-btn ${caseSensitive ? 'active' : ''}`}
            onClick={onToggleCaseSensitive}
          >
            Aa
          </button>
        </Tooltip>
        <Tooltip 
          title={
            <div>
              <div><strong>整词匹配</strong></div>
              <div>只匹配完整的单词或数字</div>
              <div>例如：搜索"geo"不会匹配"geometry"</div>
            </div>
          }
          placement="bottom"
        >
          <button 
            className={`search-option-btn ${wholeWord ? 'active' : ''}`}
            onClick={onToggleWholeWord}
          >
            Ab
          </button>
        </Tooltip>
        {searchResults.length > 0 && (
          <span className="search-info">
            {currentSearchIndex + 1} / {searchResults.length}
          </span>
        )}
        <Tooltip title="上一个匹配项 (Shift+Enter)" placement="bottom">
          <button 
            className="search-btn" 
            onClick={onGoToPrev}
            disabled={searchResults.length === 0}
          >
            ↑
          </button>
        </Tooltip>
        <Tooltip title="下一个匹配项 (Enter)" placement="bottom">
          <button 
            className="search-btn" 
            onClick={onGoToNext}
            disabled={searchResults.length === 0}
          >
            ↓
          </button>
        </Tooltip>
      </div>
    </div>
  );
};