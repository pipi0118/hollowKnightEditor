import { useState, useCallback } from 'react';

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
}

export interface SearchResult {
  searchTerm: string;
  results: number[];
  currentIndex: number;
}

/**
 * 搜索功能的自定义Hook
 */
export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(-1);
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [wholeWord, setWholeWord] = useState<boolean>(false);

  const performSearch = useCallback((term: string, text: string, options?: Partial<SearchOptions>): void => {
    const isCaseSensitive = options?.caseSensitive ?? caseSensitive;
    const isWholeWord = options?.wholeWord ?? wholeWord;

    if (!term.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const results: number[] = [];
    let escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 如果启用整词匹配，使用更精确的边界匹配
    if (isWholeWord) {
      // 检查搜索词是否为纯数字
      const isNumber = /^\d+$/.test(term);
      if (isNumber) {
        // 对于数字，确保前后不是数字或字母
        escapedTerm = `(?<!\\w)${escapedTerm}(?!\\w)`;
      } else {
        // 对于单词，使用标准词边界
        escapedTerm = `\\b${escapedTerm}\\b`;
      }
    }
    
    // 根据大小写敏感设置标志
    const flags = isCaseSensitive ? 'g' : 'gi';
    
    try {
      const searchRegex = new RegExp(escapedTerm, flags);
      let match;

      while ((match = searchRegex.exec(text)) !== null) {
        results.push(match.index);
        // 防止无限循环
        if (match.index === searchRegex.lastIndex) {
          searchRegex.lastIndex++;
        }
      }
    } catch (error) {
      // 如果正则表达式无效，清空结果
      console.warn('Invalid regex pattern:', error);
    }

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }, [caseSensitive, wholeWord]);

  const goToNextMatch = useCallback((): number => {
    if (searchResults.length === 0) return -1;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    return searchResults[nextIndex];
  }, [searchResults, currentSearchIndex]);

  const goToPrevMatch = useCallback((): number => {
    if (searchResults.length === 0) return -1;
    const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
    return searchResults[prevIndex];
  }, [searchResults, currentSearchIndex]);

  const clearSearch = useCallback((): void => {
    setSearchTerm('');
    setSearchResults([]);
    setCurrentSearchIndex(-1);
  }, []);

  const toggleCaseSensitive = useCallback((): void => {
    setCaseSensitive(prev => !prev);
  }, []);

  const toggleWholeWord = useCallback((): void => {
    setWholeWord(prev => !prev);
  }, []);

  return {
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
  };
};