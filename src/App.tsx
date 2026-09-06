import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from './store/useSettingsStore';
import { useHistoryStore } from './store/useHistoryStore';
import { useProfileStore } from './store/useProfileStore';
import { Header } from './components/Header';
import { LeftToolbar, ActiveTab } from './components/LeftToolbar';
import { ModeSelector } from './components/ModeSelector';
import { LiveStats } from './components/LiveStats';
import { TypingSurface } from './components/TypingSurface';
import { ResultsCard } from './components/ResultsCard';
import { ShortcutsBar } from './components/ShortcutsBar';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { CustomTextInput } from './components/CustomTextInput';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ProfileModal } from './components/ProfileModal';
import { ModifierPanel } from './components/ModifierPanel';
import { HistoryView } from './components/views/HistoryView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import {
  generateWordsText,
  generateTimeText,
  selectQuote,
  prepareCustomText,
} from './engine/generator';
import {
  calculateAccuracy,
  calculateBurst,
  calculateConsistency,
  calculateRawWPM,
  calculateWPM,
} from './engine/metrics';
import { evaluateTyping } from './engine/typing';
import { sound } from './engine/sound';
import {
  exportLocalData,
  parseAndValidateImport,
} from './engine/storage';
import { ExportDataPayload, TestResult } from './types';

export const App: React.FC = () => {
  const settings = useSettingsStore();
  const {
    mode,
    wordCount,
    timeDuration,
    quoteLength,
    modifiers,
    setMode,
  } = settings;

  const { addResult, pbs, history, importHistory, loadForProfile: loadHistoryForProfile } = useHistoryStore();
  const { recordSession, importProfile, id: activeProfileId } = useProfileStore();
  const loadSettingsForProfile = useSettingsStore((state) => state.loadForProfile);

  useEffect(() => {
    loadHistoryForProfile(activeProfileId);
    loadSettingsForProfile(activeProfileId);
  }, [activeProfileId, loadHistoryForProfile, loadSettingsForProfile]);

  // Test state
  const [status, setStatus] = useState<'ready' | 'typing' | 'completed'>('ready');
  const [targetText, setTargetText] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [customText, setCustomText] = useState<string>(
    'The rhythm of the loom is like the quiet breath of the mind. Every thread finds its place in the pattern.'
  );
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  // Timing state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(timeDuration);
  const [secondBySecondWpm, setSecondBySecondWpm] = useState<number[]>([]);
  const lastSampleSecRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const finalizeTimeoutRef = useRef<number | null>(null);
  const testRunIdRef = useRef(0);
  const isFinalizingRef = useRef<boolean>(false);

  // Live metrics
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);
  const [liveBurst, setLiveBurst] = useState<number>(0);

  // Modals, Panels & Navigation Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('types');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isModifierPanelOpen, setIsModifierPanelOpen] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Import handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImportData, setPendingImportData] = useState<ExportDataPayload | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState<boolean>(false);

  // Show temporary toast message
  const showToast = useCallback((msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3200);
  }, []);

  // Generate target text based on active mode
  const initTestText = useCallback(() => {
    let text = '';
    if (mode === 'words') {
      text = generateWordsText(wordCount, modifiers);
    } else if (mode === 'time') {
      text = generateTimeText(timeDuration, modifiers);
    } else if (mode === 'quote') {
      const q = selectQuote(quoteLength);
      text = q.text;
    } else if (mode === 'custom') {
      text = prepareCustomText(customText);
      if (!text) {
        text = 'The rhythm of the loom weaves threads of quiet concentration.';
      }
    }
    return text;
  }, [mode, wordCount, timeDuration, quoteLength, modifiers, customText]);

  // Restart or initialize test
  const restartTest = useCallback(() => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (finalizeTimeoutRef.current) {
      window.clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = null;
    }
    testRunIdRef.current += 1;
    isFinalizingRef.current = false;
    const newText = initTestText();
    setTargetText(newText);
    setInput('');
    setStatus('ready');
    setStartTime(null);
    setTimeRemaining(timeDuration);
    setSecondBySecondWpm([]);
    lastSampleSecRef.current = 0;
    setLiveWpm(0);
    setLiveAccuracy(100);
    setLiveBurst(0);
  }, [initTestText, timeDuration]);

  // Initial load
  useEffect(() => {
    restartTest();
  }, [restartTest]);

  // Finish and save test run
  const finalizeTest = useCallback(() => {
    if (isFinalizingRef.current || status === 'completed') return;
    isFinalizingRef.current = true;

    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const now = Date.now();
    const start = startTime || now;
    const elapsed = Math.max(1, Math.round((now - start) / 1000));

    const { correctCount, errorCount } = evaluateTyping(targetText, input, modifiers);

    const finalWpm = calculateWPM(correctCount, elapsed);
    const finalRawWpm = calculateRawWPM(input.length, elapsed);
    const finalAccuracy = calculateAccuracy(correctCount, errorCount);
    const finalConsistency = calculateConsistency(secondBySecondWpm);
    const finalBurst = calculateBurst(secondBySecondWpm);

    // Mode-specific length label
    let lengthLabel: string | number = '';
    if (mode === 'words') lengthLabel = wordCount;
    else if (mode === 'time') lengthLabel = timeDuration;
    else if (mode === 'quote') lengthLabel = quoteLength;
    else lengthLabel = 'custom';

    // Persist result
    const saved = addResult({
      mode,
      length: lengthLabel,
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      consistency: finalConsistency,
      errors: errorCount,
      burst: finalBurst,
      elapsedSeconds: elapsed,
      charCount: input.length,
      correctCount,
      secondBySecondWpm: secondBySecondWpm.length > 0 ? secondBySecondWpm : [finalWpm],
      modifiers,
    });

    recordSession(elapsed);

    // Play personal best fanfare or gentle completion chord
    if (saved.isPb) {
      sound.playPersonalBest();
    } else {
      sound.playCompletion();
    }

    setLastResult(saved);
    setStatus('completed');
    finalizeTimeoutRef.current = null;
  }, [
    status,
    startTime,
    targetText,
    input,
    modifiers,
    secondBySecondWpm,
    mode,
    wordCount,
    timeDuration,
    quoteLength,
    addResult,
    recordSession,
  ]);

  // Start typing trigger
  const handleStartTyping = useCallback(() => {
    if (status === 'ready') {
      const now = Date.now();
      setStartTime(now);
      setStatus('typing');
      lastSampleSecRef.current = 0;
    }
  }, [status]);

  // Timer loop when typing
  useEffect(() => {
    if (status !== 'typing' || !startTime) return;

    timerIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsedTotal = Math.max(0.1, (now - startTime) / 1000);
      const wholeSeconds = Math.floor(elapsedTotal);

      // Handle time-mode countdown
      if (mode === 'time') {
        const remaining = Math.max(0, timeDuration - wholeSeconds);
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          finalizeTest();
          return;
        }
      }

      // Sample per-second WPM for sparkline and burst calculation
      if (wholeSeconds > lastSampleSecRef.current) {
        lastSampleSecRef.current = wholeSeconds;
        const { correctCount } = evaluateTyping(targetText, input, modifiers);
        const currentInstantWpm = calculateWPM(correctCount, elapsedTotal);
        setSecondBySecondWpm((prev) => [...prev, currentInstantWpm]);
      }

      // Update live metrics
      const { correctCount, errorCount } = evaluateTyping(targetText, input, modifiers);
      const currWpm = calculateWPM(correctCount, elapsedTotal);
      const currAcc = calculateAccuracy(correctCount, errorCount);
      setLiveWpm(currWpm);
      setLiveAccuracy(currAcc);
      setLiveBurst(calculateBurst(secondBySecondWpm));
    }, 150);

    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, [
    status,
    startTime,
    mode,
    timeDuration,
    finalizeTest,
    targetText,
    input,
    modifiers,
    secondBySecondWpm,
  ]);

  // Handle character input from TypingSurface
  const handleInputChange = useCallback(
    (newInput: string) => {
      if (status === 'completed') return;

      setInput(newInput);

      // In Time mode: dynamically stream extra words if user approaches buffer end
      if (mode === 'time' && targetText.length - newInput.length < 180) {
        const extraWords = generateWordsText(40, modifiers);
        if (extraWords) {
          setTargetText((prev) => prev + ' ' + extraWords);
        }
      }

      // Check if test reached end of text in Words, Quote, or Custom mode
      if (mode !== 'time' && newInput.length >= targetText.length && targetText.length > 0) {
        // Immediate completion when last character is typed
        const runId = testRunIdRef.current;
        if (finalizeTimeoutRef.current) window.clearTimeout(finalizeTimeoutRef.current);
        finalizeTimeoutRef.current = window.setTimeout(() => {
          if (runId === testRunIdRef.current) finalizeTest();
        }, 10);
      }
    },
    [status, mode, targetText.length, finalizeTest, modifiers]
  );

  // Check if any modal/overlay is currently active
  const isAnyModalOpen = Boolean(
    isSettingsOpen ||
    isHistoryOpen ||
    isCustomModalOpen ||
    isProfileOpen ||
    isModifierPanelOpen ||
    showImportConfirm
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing inside textarea or inputs (except hidden input)
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'TEXTAREA' ||
          (target.tagName === 'INPUT' && target.id !== 'typeloom-hidden-input'))
      ) {
        return;
      }

      // If any modal or display is open, only handle Escape to dismiss and prevent any test/shortcut triggers
      if (isAnyModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (showImportConfirm) setShowImportConfirm(false);
          else if (isProfileOpen) setIsProfileOpen(false);
          else if (isModifierPanelOpen) setIsModifierPanelOpen(false);
          else if (isCustomModalOpen) setIsCustomModalOpen(false);
          else if (isHistoryOpen) setIsHistoryOpen(false);
          else if (isSettingsOpen) setIsSettingsOpen(false);
        }
        return;
      }

      // Escape: toggle preferences or close open modal
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
        return;
      }

      // Cmd / Ctrl + K: open Preferences / settings
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      // Cmd / Ctrl + P: open Profile modal
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setIsProfileOpen(true);
        return;
      }

      // Cmd / Ctrl + M: open Modifiers modal
      if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setIsModifierPanelOpen(true);
        return;
      }

      // Cmd / Ctrl + E: export data
      if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        exportLocalData(settings, useProfileStore.getState(), history, pbs);
        showToast('Local backup exported successfully.');
        return;
      }

      // Cmd / Ctrl + I: import backup
      if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        return;
      }

      // 1-4 Mode shortcuts when not actively typing a test
      if (status !== 'typing') {
        if (e.key === '1') {
          e.preventDefault();
          setMode('words');
          restartTest();
        } else if (e.key === '2') {
          e.preventDefault();
          setMode('time');
          restartTest();
        } else if (e.key === '3') {
          e.preventDefault();
          setMode('quote');
          restartTest();
        } else if (e.key === '4') {
          e.preventDefault();
          setMode('custom');
          setIsCustomModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isProfileOpen,
    isModifierPanelOpen,
    isCustomModalOpen,
    isHistoryOpen,
    isSettingsOpen,
    status,
    settings,
    history,
    pbs,
    setMode,
    restartTest,
    showToast,
  ]);

  // Export Trigger
  const handleExport = () => {
    exportLocalData(settings, useProfileStore.getState(), history, pbs);
    showToast('Backup JSON downloaded to your device.');
  };

  // Import File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseAndValidateImport(text);
        setPendingImportData(parsed);
        setShowImportConfirm(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to import backup file.';
        showToast(msg);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!pendingImportData) return;
    try {
      if (pendingImportData.settings) {
        settings.importSettings(pendingImportData.settings);
      }
      if (pendingImportData.history) {
        importHistory(pendingImportData.history, pendingImportData.pbs || {});
      }
      if (pendingImportData.profile) {
        importProfile(pendingImportData.profile);
      }
      showToast('Backup restored successfully.');
      restartTest();
    } catch {
      showToast('Error applying imported backup.');
    } finally {
      setPendingImportData(null);
      setShowImportConfirm(false);
    }
  };

  // Word Progress for LiveStats
  const currentWordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const totalTargetWords = targetText.trim() ? targetText.trim().split(/\s+/).length : wordCount;

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[var(--accent)] selection:text-[var(--bg)] pb-16 sm:pb-0">
      {/* Hidden File Input for Backup Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Left Rounded Floating Toolbar */}
      <LeftToolbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'types' && status === 'typing') {
            restartTest();
          }
        }}
        isTyping={status === 'typing' && activeTab === 'types'}
      />

      {/* Main Header */}
      <Header
        isTyping={status === 'typing' && activeTab === 'types'}
        onNavigateHome={() => setActiveTab('types')}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenHistory={() => setActiveTab('history')}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Dynamic Tab Views */}
      <main className="flex-1 flex flex-col justify-center py-4 sm:py-8 pl-20 sm:pl-28 md:pl-32 lg:pl-36 xl:pl-40 pr-4 sm:pr-8 md:pr-12 lg:pr-16">
        {activeTab === 'history' ? (
          <HistoryView
            onExport={handleExport}
            onTriggerImport={() => fileInputRef.current?.click()}
            onSwitchToTyping={() => setActiveTab('types')}
          />
        ) : activeTab === 'profile' ? (
          <ProfileView onSwitchToTyping={() => setActiveTab('types')} />
        ) : activeTab === 'settings' ? (
          <SettingsView
            onExport={handleExport}
            onTriggerImport={() => fileInputRef.current?.click()}
          />
        ) : status === 'completed' && lastResult ? (
          <ResultsCard
            result={lastResult}
            onRestart={restartTest}
            onOpenHistory={() => setActiveTab('history')}
          />
        ) : (
          <div className="w-full flex flex-col">
            {/* Mode & Modifier Selector */}
            <ModeSelector
              isTyping={status === 'typing'}
              onSelectModeChange={restartTest}
              onOpenCustomModal={() => setIsCustomModalOpen(true)}
              onOpenModifierPanel={() => setIsModifierPanelOpen(true)}
            />

            {/* Live Metrics Header */}
            <LiveStats
              mode={mode}
              timeRemaining={timeRemaining}
              wordProgress={{
                current: currentWordCount,
                total: mode === 'words' ? wordCount : totalTargetWords,
              }}
              liveWpm={liveWpm}
              liveAccuracy={liveAccuracy}
              liveBurst={liveBurst}
              isTyping={status === 'typing'}
              onRestart={restartTest}
            />

            {/* Primary Typing Surface with Smooth Caret */}
            <TypingSurface
              targetText={targetText}
              input={input}
              isTyping={status === 'typing'}
              isCompleted={status === 'completed'}
              onInputChange={handleInputChange}
              onStartTyping={handleStartTyping}
              onRestart={restartTest}
              fontSize={settings.fontSize}
              largeText={settings.largeText}
              highContrast={settings.highContrast}
              reducedMotion={settings.reducedMotion}
              caretStyle={settings.caretStyle}
              caretSpeed={settings.caretSpeed}
              highlightCurrentWord={settings.highlightCurrentWord}
              modifiers={modifiers}
              liveWpm={liveWpm}
              liveAccuracy={liveAccuracy}
              recentErrors={liveAccuracy < 100 ? 1 : 0}
              disabled={isAnyModalOpen}
            />
          </div>
        )}
      </main>

      {/* Bottom Keyboard Shortcuts Guide */}
      {activeTab === 'types' && (
        <ShortcutsBar
          isTyping={status === 'typing'}
          onOpenSettings={() => setActiveTab('settings')}
        />
      )}

      {/* Profile & Account Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Modifier Setup Modal */}
      <ModifierPanel
        isOpen={isModifierPanelOpen}
        onClose={() => setIsModifierPanelOpen(false)}
      />

      {/* Settings / Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onExport={handleExport}
        onTriggerImport={() => fileInputRef.current?.click()}
      />

      {/* History & Personal Bests Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onExport={handleExport}
        onTriggerImport={() => fileInputRef.current?.click()}
      />

      {/* Custom Text Input Modal */}
      <CustomTextInput
        isOpen={isCustomModalOpen}
        initialText={customText}
        onSaveAndStart={(newText) => {
          setCustomText(newText);
          setMode('custom');
          setTargetText(newText);
          setInput('');
          setStatus('ready');
          setStartTime(null);
          setTimeRemaining(timeDuration);
          setSecondBySecondWpm([]);
        }}
        onClose={() => setIsCustomModalOpen(false)}
      />

      {/* Import Replacement Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showImportConfirm}
        title="Restore data from backup?"
        description="This backup file will replace your current settings, history, and personal bests with the data from the backup."
        confirmLabel="Restore backup"
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportData(null);
        }}
      />

      {/* Discreet Feedback Toast */}
      {feedbackToast && (
        <div
          id="typeloom-toast"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl border text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
          role="status"
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
          {feedbackToast}
        </div>
      )}
    </div>
  );
};

export default App;
