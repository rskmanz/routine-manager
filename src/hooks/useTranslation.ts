'use client'

import { useState, useEffect, useCallback } from 'react'

export type Locale = 'en' | 'ja'

type TranslationKey = keyof typeof translations.en

const translations = {
  en: {
    // Home page
    'app.title': 'Routine Manager',
    'app.loading': 'Loading...',
    'app.welcome': 'Welcome to Routine Manager',
    'app.welcome.desc': 'Create categories to organize your goals and routines.',
    'app.createFirstCategory': 'Create Your First Category',
    'app.addCategory': 'Add New Category',
    'app.addCategory.desc': 'Click to create a new category',

    // Buttons
    'button.category': 'Category',
    'button.goal': 'Goal',
    'button.save': 'Save',
    'button.run': 'Run',
    'button.settings': 'Settings',
    'button.cancel': 'Cancel',
    'button.add': 'Add',
    'button.delete': 'Delete',

    // AI Chat
    'ai.button': 'Ask AI',
    'ai.title': 'AI Assistant',
    'ai.subtitle': 'Help with categories, goals & routines',
    'ai.howCanIHelp': 'How can I help?',
    'ai.askForIdeas': 'Ask me for ideas about categories, goals, or routines to add.',
    'ai.placeholder': 'Ask AI for help...',
    'ai.thinking': 'Thinking...',
    'ai.categoryIdea': 'Category idea',
    'ai.goalIdea': 'Goal idea',
    'ai.routineIdea': 'Routine idea',
    'ai.askAnything': 'Ask me anything about this routine.',

    // Editor
    'editor.title': 'Editor',
    'editor.sources': 'Sources',
    'editor.explorer': 'Explorer',
    'editor.placeholder': '# Routine Title\n\nWrite your routine steps here...',
    'editor.routineNotFound': 'Routine not found',
    'editor.goHome': 'Go Home',

    // Quick actions
    'quick.checklist': 'Checklist',
    'quick.steps': 'Steps',
    'quick.improve': 'Improve',
    'quick.triggers': 'Triggers',

    // Sources
    'sources.title': 'Sources',
    'sources.add': 'Add Source',
    'sources.addSource': 'Add Source',
    'sources.empty': 'No sources yet',
    'sources.emptyDesc': 'Add URLs, articles, or text that you want the AI to reference when helping with this routine.',
    'sources.characters': 'characters',
    'sources.source': 'source',
    'sources.sources': 'sources',
    'sources.words': 'words',
    'sources.noContent': 'No content',
    'sources.openUrl': 'Open URL',
    'sources.removeSource': 'Remove source',
    'sources.aiWillUse': 'AI will use these sources to provide better suggestions',

    // Add Source Dialog
    'addSource.title': 'Add Source',
    'addSource.url': 'URL',
    'addSource.text': 'Text',
    'addSource.urlLabel': 'URL',
    'addSource.titleLabel': 'Title',
    'addSource.sourceTitle': 'Source title',
    'addSource.contentLabel': 'Content',
    'addSource.fetchingContent': 'Fetching content...',
    'addSource.preview': 'Preview',
    'addSource.pasteOrType': 'Paste or type your source content here...',
    'addSource.pressToAdd': 'Press',
    'addSource.toAdd': 'to add',

    // Types
    'type.web': 'Web',
    'type.text': 'Text',
    'type.file': 'File',

    // Dialogs
    'dialog.addUrl': 'Add URL',
    'dialog.pasteText': 'Paste Text',

    // Navigation
    'nav.list': 'List',
    'nav.schedule': 'Schedule',
    'nav.editor': 'Editor',

    // Schedule View
    'schedule.title': 'Schedule & Progress',
    'schedule.today': 'Today',
    'schedule.thisWeek': 'This Week',
    'schedule.thisMonth': 'This Month',
    'schedule.todayRoutines': "Today's Routines",
    'schedule.completed': 'completed',
    'schedule.noRoutines': 'No scheduled routines',
    'schedule.noRoutinesDesc': 'Add a schedule to your routines to track them here.',
    'schedule.streak': 'day streak',
    'schedule.skip': 'Skip',
    'schedule.markComplete': 'Mark complete',
    'schedule.upcoming': 'Upcoming',
    'schedule.weekOverview': 'Week Overview',

    // Schedule Config
    'scheduleConfig.title': 'Schedule Settings',
    'scheduleConfig.frequency': 'Frequency',
    'scheduleConfig.daily': 'Daily',
    'scheduleConfig.weekly': 'Weekly',
    'scheduleConfig.monthly': 'Monthly',
    'scheduleConfig.daysOfWeek': 'Days of week',
    'scheduleConfig.dayOfMonth': 'Day of month',
    'scheduleConfig.reminderTime': 'Reminder time',
    'scheduleConfig.enabled': 'Enable schedule',
  },
  ja: {
    // Home page
    'app.title': 'ルーティンマネージャー',
    'app.loading': '読み込み中...',
    'app.welcome': 'ルーティンマネージャーへようこそ',
    'app.welcome.desc': 'カテゴリを作成して、ゴールとルーティンを整理しましょう。',
    'app.createFirstCategory': '最初のカテゴリを作成',
    'app.addCategory': '新しいカテゴリを追加',
    'app.addCategory.desc': 'クリックして新しいカテゴリを作成',

    // Buttons
    'button.category': 'カテゴリ',
    'button.goal': 'ゴール',
    'button.save': '保存',
    'button.run': '実行',
    'button.settings': '設定',
    'button.cancel': 'キャンセル',
    'button.add': '追加',
    'button.delete': '削除',

    // AI Chat
    'ai.button': 'AIに相談',
    'ai.title': 'AIアシスタント',
    'ai.subtitle': 'カテゴリ、ゴール、ルーティンをサポート',
    'ai.howCanIHelp': '何かお手伝いしましょうか？',
    'ai.askForIdeas': 'カテゴリ、ゴール、ルーティンのアイデアを聞いてください。',
    'ai.placeholder': 'AIに質問...',
    'ai.thinking': '考え中...',
    'ai.categoryIdea': 'カテゴリのアイデア',
    'ai.goalIdea': 'ゴールのアイデア',
    'ai.routineIdea': 'ルーティンのアイデア',
    'ai.askAnything': 'このルーティンについて何でも聞いてください。',

    // Editor
    'editor.title': 'エディター',
    'editor.sources': 'ソース',
    'editor.explorer': 'エクスプローラー',
    'editor.placeholder': '# ルーティンタイトル\n\nここにルーティンの手順を書いてください...',
    'editor.routineNotFound': 'ルーティンが見つかりません',
    'editor.goHome': 'ホームへ戻る',

    // Quick actions
    'quick.checklist': 'チェックリスト',
    'quick.steps': 'ステップ',
    'quick.improve': '改善',
    'quick.triggers': 'トリガー',

    // Sources
    'sources.title': 'ソース',
    'sources.add': 'ソースを追加',
    'sources.addSource': 'ソースを追加',
    'sources.empty': 'ソースがありません',
    'sources.emptyDesc': 'AIに参照させたいURL、記事、テキストを追加してください。',
    'sources.characters': '文字',
    'sources.source': 'ソース',
    'sources.sources': 'ソース',
    'sources.words': '単語',
    'sources.noContent': 'コンテンツなし',
    'sources.openUrl': 'URLを開く',
    'sources.removeSource': 'ソースを削除',
    'sources.aiWillUse': 'AIはこれらのソースを使用してより良い提案を行います',

    // Add Source Dialog
    'addSource.title': 'ソースを追加',
    'addSource.url': 'URL',
    'addSource.text': 'テキスト',
    'addSource.urlLabel': 'URL',
    'addSource.titleLabel': 'タイトル',
    'addSource.sourceTitle': 'ソースのタイトル',
    'addSource.contentLabel': 'コンテンツ',
    'addSource.fetchingContent': 'コンテンツを取得中...',
    'addSource.preview': 'プレビュー',
    'addSource.pasteOrType': 'ソースのコンテンツをここに貼り付けまたは入力...',
    'addSource.pressToAdd': '',
    'addSource.toAdd': 'で追加',

    // Types
    'type.web': 'ウェブ',
    'type.text': 'テキスト',
    'type.file': 'ファイル',

    // Dialogs
    'dialog.addUrl': 'URLを追加',
    'dialog.pasteText': 'テキストを貼り付け',

    // Navigation
    'nav.list': '一覧',
    'nav.schedule': 'スケジュール',
    'nav.editor': 'エディター',

    // Schedule View
    'schedule.title': 'スケジュール・進捗',
    'schedule.today': '今日',
    'schedule.thisWeek': '今週',
    'schedule.thisMonth': '今月',
    'schedule.todayRoutines': '今日のルーティン',
    'schedule.completed': '完了',
    'schedule.noRoutines': 'スケジュールされたルーティンはありません',
    'schedule.noRoutinesDesc': 'ルーティンにスケジュールを追加して、ここで追跡しましょう。',
    'schedule.streak': '日連続',
    'schedule.skip': 'スキップ',
    'schedule.markComplete': '完了にする',
    'schedule.upcoming': '予定',
    'schedule.weekOverview': '週間概要',

    // Schedule Config
    'scheduleConfig.title': 'スケジュール設定',
    'scheduleConfig.frequency': '頻度',
    'scheduleConfig.daily': '毎日',
    'scheduleConfig.weekly': '毎週',
    'scheduleConfig.monthly': '毎月',
    'scheduleConfig.daysOfWeek': '曜日',
    'scheduleConfig.dayOfMonth': '日付',
    'scheduleConfig.reminderTime': 'リマインダー時間',
    'scheduleConfig.enabled': 'スケジュールを有効にする',
  },
} as const

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('ja')) {
      setLocale('ja')
    }
    // Check localStorage for user preference
    const saved = localStorage.getItem('locale') as Locale
    if (saved && (saved === 'en' || saved === 'ja')) {
      setLocale(saved)
    }
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[locale][key] || key
  }, [locale])

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }, [])

  return { t, locale, changeLocale }
}
