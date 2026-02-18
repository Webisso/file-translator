import React, { useEffect, useState, useRef } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

const THEME_STORAGE_KEY = 'file-translator-theme';
const SETTINGS_STORAGE_KEY = 'file-translator-settings';


const DEFAULT_BASE_LANGUAGE = 'en-US';
const DEFAULT_TARGET_LANGUAGE = 'tr';

const TRANSLATION_MODES = {
  PER_LINE: 'per-line',
  WHOLE_FILE: 'whole-file',
};

const VIEW_MODES = {
  ORIGINAL: 'original',
  TRANSLATED: 'translated',
  DIFF: 'diff',
};

const BASE_LANGUAGES = [
  { code: 'en-US', label: 'English (en-US)' },
  { code: 'tr', label: 'Turkish (tr)' },
  { code: 'de-DE', label: 'German (de-DE)' },
  { code: 'fr-FR', label: 'French (fr-FR)' },
  { code: 'es-ES', label: 'Spanish (es-ES)' },
  { code: 'ru', label: 'Russian (ru)' },
  { code: 'zh-Hans', label: 'Chinese Simplified (zh-Hans)' },
  // Add more as needed
];

const TARGET_LANGUAGES = [
  { code: 'ar-SA', label: 'Arabic (ar-SA)' },
  { code: 'ca', label: 'Catalan (ca)' },
  { code: 'zh-Hans', label: 'Chinese Simplified (zh-Hans)' },
  { code: 'zh-Hant', label: 'Chinese Traditional (zh-Hant)' },
  { code: 'hr', label: 'Croatian (hr)' },
  { code: 'cs', label: 'Czech (cs)' },
  { code: 'da', label: 'Danish (da)' },
  { code: 'nl-NL', label: 'Dutch (nl-NL)' },
  { code: 'en-AU', label: 'English (en-AU)' },
  { code: 'en-CA', label: 'English (en-CA)' },
  { code: 'en-GB', label: 'English (en-GB)' },
  { code: 'en-US', label: 'English (en-US)' },
  { code: 'fi', label: 'Finnish (fi)' },
  { code: 'fr-FR', label: 'French (fr-FR)' },
  { code: 'fr-CA', label: 'French (fr-CA)' },
  { code: 'de-DE', label: 'German (de-DE)' },
  { code: 'el', label: 'Greek (el)' },
  { code: 'he', label: 'Hebrew (he)' },
  { code: 'hi', label: 'Hindi (hi)' },
  { code: 'hu', label: 'Hungarian (hu)' },
  { code: 'id', label: 'Indonesian (id)' },
  { code: 'it', label: 'Italian (it)' },
  { code: 'ja', label: 'Japanese (ja)' },
  { code: 'ko', label: 'Korean (ko)' },
  { code: 'ms', label: 'Malay (ms)' },
  { code: 'no', label: 'Norwegian (no)' },
  { code: 'pl', label: 'Polish (pl)' },
  { code: 'sl', label: 'Slovene (sl)' },
  { code: 'pt', label: 'Portuguese (pt)' },
  { code: 'fa', label: 'Persian (fa)' },
  { code: 'pa', label: 'Punjabi (pa)' },
  { code: 'pt-BR', label: 'Portuguese (pt-BR)' },
  { code: 'pt-PT', label: 'Portuguese (pt-PT)' },
  { code: 'ro', label: 'Romanian (ro)' },
  { code: 'ru', label: 'Russian (ru)' },
  { code: 'sk', label: 'Slovak (sk)' },
  { code: 'es-MX', label: 'Spanish (es-MX)' },
  { code: 'es-ES', label: 'Spanish (es-ES)' },
  { code: 'sv', label: 'Swedish (sv)' },
  { code: 'th', label: 'Thai (th)' },
  { code: 'tr', label: 'Turkish (tr)' },
  { code: 'uk', label: 'Ukrainian (uk)' },
  { code: 'vi', label: 'Vietnamese (vi)' },
];

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return THEMES.DARK;
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
    return stored;
  }

  const prefersDark = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return prefersDark ? THEMES.DARK : THEMES.LIGHT;
};

function AppInner() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [lines, setLines] = useState([]);
  const [baseLanguage, setBaseLanguage] = useState(DEFAULT_BASE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
    const handleBaseLanguageChange = (event) => {
      setBaseLanguage(event.target.value);
    };
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedLines, setTranslatedLines] = useState([]);
  const [currentTranslatingLine, setCurrentTranslatingLine] = useState(-1);
  const [isTranslationComplete, setIsTranslationComplete] = useState(false);
  const [viewMode, setViewMode] = useState(VIEW_MODES.ORIGINAL);
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [n8nUrl, setN8nUrl] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [translationMode, setTranslationMode] = useState(TRANSLATION_MODES.PER_LINE);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.n8nUrl === 'string') {
        setN8nUrl(parsed.n8nUrl);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const nextLines = fileContent.split(/\r?\n/);
    setLines(nextLines);
  }, [fileContent]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleN8nUrlChange = (event) => {
    const value = event.target.value;
    setN8nUrl(value);
    try {
      const next = { n8nUrl: value };
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const handleTranslationModeChange = (event) => {
    const value = event.target.value;
    if (
      value === TRANSLATION_MODES.PER_LINE ||
      value === TRANSLATION_MODES.WHOLE_FILE
    ) {
      setTranslationMode(value);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = typeof e.target?.result === 'string' ? e.target.result : '';
      setFileContent(text);
      setTranslatedLines([]);
    };
    reader.readAsText(file);
  };

  const handleTargetLanguageChange = (event) => {
    setTargetLanguage(event.target.value);
  };

  const handleTranslate = async () => {
    if (!fileContent.trim()) return;
    if (!n8nUrl) {
      alert('Please configure n8n endpoint URL in Settings first.');
      return;
    }

    setIsTranslating(true);
    setIsTranslationComplete(false);
    setTranslatedLines([]);
    setCurrentTranslatingLine(-1);
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      if (translationMode === TRANSLATION_MODES.PER_LINE) {
        // Per-line: send individual requests for each line
        const translatedResults = [];
        
        for (let i = 0; i < lines.length; i++) {
          // Check if aborted
          if (signal.aborted) {
            break;
          }
          
          const line = lines[i];
          setCurrentTranslatingLine(i);
          
          if (!line.trim()) {
            translatedResults.push('');
            setTranslatedLines([...translatedResults]);
            continue;
          }

          const requestBody = {
            mode: 'per-line',
            fileName: fileName || 'untitled.txt',
            lineIndex: i,
            lineText: line,
            baseLanguage,
            targetLanguage,
            metadata: {
              totalLines: lines.length,
            },
          };

          const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal,
          });

          if (!response.ok) {
            throw new Error(`Request failed for line ${i + 1}: ${response.status}`);
          }

          const data = await response.json();
          translatedResults.push(data.translatedText || line);
          setTranslatedLines([...translatedResults]);
        }

        if (!signal.aborted) {
          setIsTranslationComplete(true);
          setViewMode(VIEW_MODES.TRANSLATED);
        }
      } else {
        // Whole-file: send a single request with the entire file content
        setCurrentTranslatingLine(0); // Show first line as active during whole-file translation
        
        const requestBody = {
          mode: 'whole-file',
          fileName: fileName || 'untitled.txt',
          content: fileContent,
          baseLanguage,
          targetLanguage,
        };

        const response = await fetch(n8nUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        const translatedContent = data.translatedContent || '';
        const translatedLinesResult = translatedContent.split(/\r?\n/);
        setTranslatedLines(translatedLinesResult);
        setIsTranslationComplete(true);
        setViewMode(VIEW_MODES.TRANSLATED);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Translation stopped by user');
      } else {
        console.error('Translation error:', error);
        alert(`Translation failed: ${error.message}`);
      }
    } finally {
      setIsTranslating(false);
      setCurrentTranslatingLine(-1);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCopy = async () => {
    const content = translatedLines.join('\n');
    try {
      await navigator.clipboard.writeText(content);
      alert('Translated content copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const content = translatedLines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'translated.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      'Reset workspace? This will clear the selected file and all translated content.'
    );
    if (!confirmed) {
      return;
    }

    setFileName('');
    setFileSize('');
    setFileContent('');
    setLines([]);
    setTranslatedLines([]);
    setIsTranslationComplete(false);
    setViewMode(VIEW_MODES.ORIGINAL);
    
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <Link
            to="/"
            className="app-logo"
          >
            <span className="app-logo-mark">FT</span>
            <span className="app-logo-text">
              <span className="app-logo-title">File Translator</span>
              <span className="app-logo-subtitle">Open-source file translation UI</span>
            </span>
          </Link>
        </div>

        <nav className="app-nav">
          <Link to="/" className="app-nav-link">
            Overview
          </Link>
          <Link to="/docs" className="app-nav-link">
            Docs
          </Link>
        </nav>

        <div className="app-header-right">
          <div className="theme-toggle" onClick={handleThemeToggle}>
            <button
              type="button"
              className={`theme-toggle-switch theme-toggle-switch--${theme}`}
              aria-label="Toggle color theme"
            >
              <span className="theme-toggle-thumb" />
              <span className="theme-toggle-icons">
                <span className="theme-icon theme-icon--light">☀</span>
                <span className="theme-icon theme-icon--dark">🌙</span>
              </span>
            </button>
          </div>

          <button
            type="button"
            className="button button--settings"
            onClick={openSettings}
          >
            Settings
          </button>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <section id="overview" className="content-section">
                <div className="app-single-panel">
                  <div className="panel-header">
                    <h2 className="panel-title">File Translator</h2>
                    <p className="panel-description">
                      Upload a file, configure translation settings, and translate.
                    </p>
                  </div>

                  <div className="upload-area">
                    <label className="upload-dropzone">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="upload-input"
                        onChange={handleFileChange}
                      />
                      <div className="upload-visual">
                        <div className="upload-icon">⬆</div>
                        <div className="upload-text">
                          <span className="upload-primary">Drop your file here</span>
                          <span className="upload-secondary">
                            or click to browse from your computer
                          </span>
                        </div>
                      </div>
                    </label>

                    <div className="file-meta">
                      {fileName ? (
                        <div className="file-meta-line">
                          <span className="file-meta-label">Selected file</span>
                          <span className="file-meta-value">
                            {fileName}
                            {fileSize && <span className="file-meta-size"> · {fileSize}</span>}
                          </span>
                          <button type="button" className="file-meta-clear" onClick={handleClear}>
                            Clear
                          </button>
                        </div>
                      ) : (
                        <div className="file-meta-placeholder">
                          No file selected yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="control-card">
                    <div className="control-row control-row--inline">
                      <div className="control-field">
                        <label className="field-label" htmlFor="base-language">
                          Base language
                        </label>
                        <select
                          id="base-language"
                          className="select"
                          value={baseLanguage}
                          onChange={handleBaseLanguageChange}
                        >
                          {BASE_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="control-field">
                        <label className="field-label" htmlFor="target-language">
                          Target language
                        </label>
                        <select
                          id="target-language"
                          className="select"
                          value={targetLanguage}
                          onChange={handleTargetLanguageChange}
                        >
                          {TARGET_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="control-field">
                        <span className="field-label">Mode</span>
                        <select
                          className="select"
                          value={translationMode}
                          onChange={handleTranslationModeChange}
                        >
                          <option value={TRANSLATION_MODES.PER_LINE}>Per-line</option>
                          <option value={TRANSLATION_MODES.WHOLE_FILE}>Whole-file</option>
                        </select>
                      </div>
                    </div>

                    <div className="control-row control-row--actions">
                      {isTranslating ? (
                        <>
                          <button
                            type="button"
                            className="button button--primary button--loading"
                            disabled
                          >
                            <span className="loading-spinner" />
                            Translating… ({translatedLines.length}/{lines.length})
                          </button>
                          <button
                            type="button"
                            className="button button--danger"
                            onClick={handleStop}
                          >
                            Stop
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="button button--primary"
                            onClick={handleTranslate}
                            disabled={!fileContent.trim()}
                          >
                            Translate file
                          </button>
                          <button
                            type="button"
                            className="button button--ghost"
                            onClick={handleClear}
                            disabled={!fileContent.trim()}
                          >
                            Reset workspace
                          </button>
                          {isTranslationComplete && translatedLines.length > 0 && (
                            <>
                              <button
                                type="button"
                                className="button button--secondary"
                                onClick={handleCopy}
                              >
                                Copy
                              </button>
                              <button
                                type="button"
                                className="button button--secondary"
                                onClick={handleDownload}
                              >
                                Download
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="editor-card">
                    <div className="editor-header">
                      <div className="editor-title-group">
                        <span className="editor-title">
                          {viewMode === VIEW_MODES.ORIGINAL && 'Original content'}
                          {viewMode === VIEW_MODES.TRANSLATED && 'Translated content'}
                          {viewMode === VIEW_MODES.DIFF && 'Diff view'}
                        </span>
                        <span className="editor-subtitle">
                          {viewMode === VIEW_MODES.DIFF 
                            ? 'Red = original, Green = translated'
                            : 'Read-only preview with line numbers'}
                        </span>
                      </div>
                      
                      <div className="editor-header-right">
                        {isTranslationComplete && translatedLines.length > 0 && (
                          <div className="view-mode-toggle">
                            <button
                              type="button"
                              className={`view-mode-btn${viewMode === VIEW_MODES.ORIGINAL ? ' view-mode-btn--active' : ''}`}
                              onClick={() => setViewMode(VIEW_MODES.ORIGINAL)}
                            >
                              Original
                            </button>
                            <button
                              type="button"
                              className={`view-mode-btn${viewMode === VIEW_MODES.TRANSLATED ? ' view-mode-btn--active' : ''}`}
                              onClick={() => setViewMode(VIEW_MODES.TRANSLATED)}
                            >
                              Translated
                            </button>
                            <button
                              type="button"
                              className={`view-mode-btn${viewMode === VIEW_MODES.DIFF ? ' view-mode-btn--active' : ''}`}
                              onClick={() => setViewMode(VIEW_MODES.DIFF)}
                            >
                              Diff
                            </button>
                          </div>
                        )}
                        <span className="editor-badge">
                          {lines.length ? `${lines.length} lines` : 'Waiting for file'}
                        </span>
                      </div>
                    </div>

                    <div className={`editor-shell${viewMode === VIEW_MODES.DIFF ? ' editor-shell--diff' : isTranslating || viewMode === VIEW_MODES.TRANSLATED ? ' editor-shell--translated' : ''}`}>
                      <div className="editor-toolbar">
                        <span className="editor-dot editor-dot--red" />
                        <span className="editor-dot editor-dot--yellow" />
                        <span className="editor-dot editor-dot--green" />
                        <span className="editor-filename">
                          {fileName || 'no-file-selected.txt'}
                          {viewMode === VIEW_MODES.TRANSLATED && ` → ${targetLanguage.toUpperCase()}`}
                          {viewMode === VIEW_MODES.DIFF && ' (diff)'}
                        </span>
                      </div>

                      <div className="editor-body">
                        {viewMode === VIEW_MODES.DIFF ? (
                          <>
                            <div className="editor-gutter editor-gutter--diff">
                              {lines.map((originalLine, index) => {
                                const translatedLine = translatedLines[index] || '';
                                const isChanged = originalLine !== translatedLine;
                                
                                if (!isChanged) {
                                  return (
                                    <div key={index} className="diff-gutter-line diff-gutter-line--unchanged">
                                      <span className="diff-line-number">{index + 1}</span>
                                      <span className="diff-line-number">{index + 1}</span>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <div key={index} className="diff-gutter-block">
                                    <div className="diff-gutter-line diff-gutter-line--removed">
                                      <span className="diff-line-number diff-line-number--old">{index + 1}</span>
                                      <span className="diff-line-number"></span>
                                    </div>
                                    <div className="diff-gutter-line diff-gutter-line--added">
                                      <span className="diff-line-number"></span>
                                      <span className="diff-line-number diff-line-number--new">{index + 1}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <pre className="editor-content editor-content--diff">
                              {lines.map((originalLine, index) => {
                                const translatedLine = translatedLines[index] || '';
                                const isChanged = originalLine !== translatedLine;
                                
                                if (!isChanged) {
                                  return (
                                    <div key={index} className="diff-line diff-line--unchanged">
                                      <span className="diff-prefix"> </span>
                                      <span>{originalLine || '\u00A0'}</span>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <div key={index} className="diff-block">
                                    <div className="diff-line diff-line--removed">
                                      <span className="diff-prefix">-</span>
                                      <span>{originalLine || '\u00A0'}</span>
                                    </div>
                                    <div className="diff-line diff-line--added">
                                      <span className="diff-prefix">+</span>
                                      <span>{translatedLine || '\u00A0'}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </pre>
                          </>
                        ) : (
                          <>
                            <div className="editor-gutter">
                              {lines.length ? (
                                lines.map((_, index) => (
                                  <div key={index} className={`editor-line-number${currentTranslatingLine === index ? ' editor-line-number--active' : ''}`}>
                                    {index + 1}
                                  </div>
                                ))
                              ) : (
                                <div className="editor-line-number editor-line-number--empty">1</div>
                              )}
                            </div>

                            <pre className="editor-content">
                              {lines.length ? (
                                lines.map((originalLine, index) => {
                                  // During translation or when viewing translated: show translated lines as they come in
                                  const isLineTranslated = translatedLines[index] !== undefined;
                                  const showTranslated = (isTranslating || viewMode === VIEW_MODES.TRANSLATED) && isLineTranslated;
                                  const displayLine = showTranslated ? translatedLines[index] : originalLine;
                                  const isActive = currentTranslatingLine === index;
                                  const isTranslatedLine = showTranslated && originalLine !== translatedLines[index];
                                  
                                  return (
                                    <div 
                                      key={index} 
                                      className={`editor-line${isActive ? ' editor-line--active' : ''}${isTranslatedLine ? ' editor-line--translated' : ''}`}
                                    >
                                      {displayLine || '\u00A0'}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="editor-line editor-line--placeholder">
                                  Upload a file to inspect its content here.
                                </div>
                              )}
                            </pre>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            }
          />

          <Route
            path="/docs"
            element={
              <section id="docs" className="content-section content-section--docs">
                <div className="docs-card">
                  <div className="docs-layout">
                    <div>
                      <h2 className="docs-title">n8n Integration</h2>
                      <p className="docs-text">
                        The examples below show the format of HTTP requests sent from this UI to your n8n endpoint.
                        All requests use <strong>POST</strong> method with <strong>JSON body</strong> by default.
                      </p>
                    </div>

                    <div className="docs-grid">
                      <section className="docs-section">
                        <div>
                          <h3 className="docs-section-title">Per-line Requests</h3>
                          <p className="docs-section-text">
                            A single request is sent for each line. Your n8n flow translates the line and returns the result.
                          </p>
                        </div>

                        <div className="docs-meta-row">
                          <span className="docs-http-method docs-http-method--post">POST</span>
                          <span className="docs-url">
                            {n8nUrl || 'https://your-n8n-instance.com/webhook/file-translator'}
                          </span>
                          <span className="docs-tag">application/json</span>
                        </div>

                        <div className="modal-code-block">
                          <div className="modal-code-label">Request body</div>
                          <pre className="modal-code">
{`{
  "mode": "per-line",
  "fileName": "example.txt",
  "lineIndex": 0,
  "lineText": "Original line content",
  "baseLanguage": "en-US",
  "targetLanguage": "tr-TR",
  "metadata": {
    "totalLines": 120,
    "path": "src/messages/en.json"
  }
}`}
                          </pre>
                        </div>

                        <div className="modal-code-block">
                          <div className="modal-code-label">Response body</div>
                          <pre className="modal-code">
{`{
  "translatedText": "Translated line content",
  "meta": {
    "model": "gpt-4.1",
    "latencyMs": 420
  }
}`}
                          </pre>
                        </div>
                      </section>

                      <section className="docs-section">
                        <div>
                          <h3 className="docs-section-title">Whole-file Requests</h3>
                          <p className="docs-section-text">
                            The entire file is sent at once. Your n8n flow produces the complete translation and returns it as a single text.
                          </p>
                        </div>

                        <div className="docs-meta-row">
                          <span className="docs-http-method docs-http-method--post">POST</span>
                          <span className="docs-url">
                            {n8nUrl || 'https://your-n8n-instance.com/webhook/file-translator'}
                          </span>
                          <span className="docs-tag">application/json</span>
                        </div>

                        <div className="modal-code-block">
                          <div className="modal-code-label">Request body</div>
                          <pre className="modal-code">
{`{
  "mode": "whole-file",
  "fileName": "example.txt",
  "content": "Full file content as a single string",
  "baseLanguage": "en-US",
  "targetLanguage": "tr-TR"
}`}
                          </pre>
                        </div>

                        <div className="modal-code-block">
                          <div className="modal-code-label">Response body</div>
                          <pre className="modal-code">
{`{
  "translatedContent": "Fully translated file content",
  "meta": {
    "model": "gpt-4.1",
    "segments": 12
  }
}`}
                          </pre>
                        </div>
                      </section>
                    </div>

                    <div className="docs-divider" />

                    <div className="docs-guide">
                      <h2 className="docs-title">n8n Flow Setup</h2>
                      <p className="docs-text">
                        Follow the steps below to create your translation flow in n8n.
                        This flow translates each incoming line using AI and returns the result.
                      </p>

                      <div className="docs-steps">
                        <div className="docs-step">
                          <div className="docs-step-header">
                            <span className="docs-step-number">1</span>
                            <h3 className="docs-step-title">Add Webhook Node</h3>
                          </div>
                          <p className="docs-step-text">
                            Add a <strong>Webhook</strong> node to your flow and configure it as follows:
                          </p>
                          <div className="docs-config-table">
                            <div className="docs-config-row">
                              <span className="docs-config-key">HTTP Method</span>
                              <span className="docs-config-value">POST</span>
                            </div>
                            <div className="docs-config-row">
                              <span className="docs-config-key">Authentication</span>
                              <span className="docs-config-value">None</span>
                            </div>
                            <div className="docs-config-row">
                              <span className="docs-config-key">Respond</span>
                              <span className="docs-config-value">Using &apos;Respond to Webhook&apos; Node</span>
                            </div>
                          </div>
                        </div>

                        <div className="docs-step">
                          <div className="docs-step-header">
                            <span className="docs-step-number">2</span>
                            <h3 className="docs-step-title">Connect AI Agent Node</h3>
                          </div>
                          <p className="docs-step-text">
                            After the Webhook, add an <strong>AI Agent</strong> node.
                            You can connect any AI model you prefer (GPT-4, Claude, etc.).
                          </p>
                          
                          <div className="modal-code-block">
                            <div className="modal-code-label">Prompt</div>
                            <pre className="modal-code modal-code--prompt">
{`The current language of the sentence to be translated: {{ $json.body['baseLanguage'] }}
The sentence to be translated: {{ $json.body.lineText }}
The target language: {{ $json.body['targetLanguage'] }}`}
                            </pre>
                          </div>

                          <div className="modal-code-block">
                            <div className="modal-code-label">System Message</div>
                            <pre className="modal-code modal-code--system">
{`You are a translator. You will translate the given sentence into the specified language. In your response, write only the translation. Do not write anything else. Do not write any HTML tags, only the translation. Never use tags such as \\n.`}
                            </pre>
                          </div>
                        </div>

                        <div className="docs-step">
                          <div className="docs-step-header">
                            <span className="docs-step-number">3</span>
                            <h3 className="docs-step-title">Add Code Node</h3>
                          </div>
                          <p className="docs-step-text">
                            After the AI Agent, add a <strong>Code</strong> node.
                            This node transforms the AI output into the correct format.
                          </p>
                          <p className="docs-step-note">
                            <strong>Note:</strong> The <code>meta</code> field is optional and manually written.
                            You can add information about the model and latency here.
                          </p>
                          
                          <div className="modal-code-block">
                            <div className="modal-code-label">JavaScript</div>
                            <pre className="modal-code modal-code--js">
{`const translatedText = $input.first().json.output;

return [
  {
    json: {
      translatedText: translatedText,
      meta: {
        model: "gpt-4.1",
        latencyMs: 420
      }
    }
  }
];`}
                            </pre>
                          </div>
                        </div>

                        <div className="docs-step">
                          <div className="docs-step-header">
                            <span className="docs-step-number">4</span>
                            <h3 className="docs-step-title">Add Respond to Webhook Node</h3>
                          </div>
                          <p className="docs-step-text">
                            Finally, add a <strong>Respond to Webhook</strong> node.
                          </p>
                          <div className="docs-config-table">
                            <div className="docs-config-row">
                              <span className="docs-config-key">Respond With</span>
                              <span className="docs-config-value">First Incoming Item</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="docs-flow-diagram">
                        <div className="docs-flow-title">Flow Structure</div>
                        <div className="docs-flow-nodes">
                          <div className="docs-flow-node docs-flow-node--webhook">
                            <span className="docs-flow-node-icon">🔗</span>
                            <span className="docs-flow-node-label">Webhook</span>
                          </div>
                          <div className="docs-flow-arrow">→</div>
                          <div className="docs-flow-node docs-flow-node--ai">
                            <span className="docs-flow-node-icon">🤖</span>
                            <span className="docs-flow-node-label">AI Agent</span>
                          </div>
                          <div className="docs-flow-arrow">→</div>
                          <div className="docs-flow-node docs-flow-node--code">
                            <span className="docs-flow-node-icon">⚡</span>
                            <span className="docs-flow-node-label">Code</span>
                          </div>
                          <div className="docs-flow-arrow">→</div>
                          <div className="docs-flow-node docs-flow-node--response">
                            <span className="docs-flow-node-icon">↩️</span>
                            <span className="docs-flow-node-label">Respond</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            }
          />
        </Routes>
      </main>

      {isSettingsOpen && (
        <div className="modal-backdrop" onClick={closeSettings}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="settings-title" className="modal-title">
                Settings
              </h2>
              <button
                type="button"
                className="modal-close"
                aria-label="Close settings"
                onClick={closeSettings}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="control-row">
                <label className="field-label" htmlFor="n8n-url">
                  n8n endpoint URL
                </label>
                <input
                  id="n8n-url"
                  type="url"
                  className="text-input"
                  placeholder="https://your-n8n-instance.com/webhook/file-translator"
                  value={n8nUrl}
                  onChange={handleN8nUrlChange}
                />
                <p className="control-hint">
                  Provide the full URL to your own n8n workflow or webhook. The app will send
                  requests to this endpoint during translation.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="button button--ghost" onClick={closeSettings}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <div className="app-footer-inner">
          <div className="footer-links">
            <a
              href="https://github.com/webisso/file-translator"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
            <a
              href="https://github.com/webisso/file-translator/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              License
            </a>
            <a
              href="https://webisso.com"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              Webisso Website
            </a>
            <a
              href="https://webisso.com/contact-us"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              Contact Us
            </a>
          </div>
          <span className="footer-text">
            Made with ❤️ by{' '}
            <a
              href="https://github.com/webisso"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              Webisso
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  );
}

export default App;
