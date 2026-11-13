import { useEffect, useRef, useState } from 'react';
import {
  Send,
  RotateCcw,
  Eye,
  Lock,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import {
  INITIAL_PAVILION_STATE,
  LORE_TOPICS,
  PORTRAIT_CATALOG,
} from './data/knowledgeCatalog.ts';
import { PortraitModal } from './components/PortraitModal.tsx';
import {
  ChronologyView,
  PavilionRulesView,
  PortraitGalleryView,
} from './components/ArchiveViews.tsx';
import type {
  ChatMessage,
  PavilionState,
  PortraitCatalogItem,
  PortraitId,
} from './types.ts';

type ActiveTab = 'chat' | 'gallery' | 'rules' | 'chronology';

function countExclamationMarks(text: string): number {
  const matches = text.match(/[!！]/g);
  return matches ? matches.length : 0;
}

function getEffectiveCost(baseCost: number, state: PavilionState): number {
  if (baseCost <= 0) return 0;
  const surcharge = state.warnings >= 2 ? 2 : 0;
  const discount = state.chaoxiDiscount ? 1 : 0;
  return Math.max(1, baseCost + surcharge - discount);
}

function formatMessageTextWithoutImgToken(text: string): string {
  return text.replace(/\[IMG:\s*[a-z]+\.png\]/gi, '').trim();
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [pavilionState, setPavilionState] = useState<PavilionState>(
    INITIAL_PAVILION_STATE,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPortrait, setSelectedPortrait] =
    useState<PortraitCatalogItem | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  async function loadInitialGreeting() {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/greeting', { method: 'POST' });
      if (!res.ok) throw new Error('無法連線至萬經閣');
      const data = (await res.json()) as {
        state: PavilionState;
        message: ChatMessage;
      };
      setPavilionState(data.state);
      setMessages([data.message]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : '萬經閣陣法暫時異常，請重試。',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadInitialGreeting();
  }, []);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function sendMessage(textToSend?: string) {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || isLoading) return;

    setErrorMsg(null);
    if (!textToSend) {
      setInput('');
    }
    setActiveTab('chat');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          state: pavilionState,
        }),
      });

      const payload = (await res.json()) as {
        state?: PavilionState;
        message?: ChatMessage;
        error?: string;
      };

      if (!res.ok || !payload.state || !payload.message) {
        throw new Error(payload.error || '傳訊失敗，請稍後再試。');
      }

      setPavilionState(payload.state);
      setMessages((prev) => [...prev, payload.message!]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : '萬經閣傳訊受阻，請稍後重試。',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleRequestPortrait(
    portrait: PortraitCatalogItem,
    effectiveCost: number,
  ) {
    const prompt = `書靈，我想用 ${effectiveCost} 片樹葉子換取「${portrait.name}」的絕密畫像，給你樹葉子！`;
    void sendMessage(prompt);
  }

  function handleRequestMotherPortrait() {
    void sendMessage('書靈書靈，你這裡有沒有至高君主「神母」的畫像可以看看？');
  }

  function handleRevisit() {
    if (pavilionState.doorStatus === '已逐客') {
      void sendMessage('重新拜訪萬經閣');
    } else {
      void loadInitialGreeting();
    }
  }

  const draftExclCount = countExclamationMarks(input);
  const draftTooLoud = draftExclCount > 2;
  const isExpelled = pavilionState.doorStatus === '已逐客';

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1C1917] flex flex-col">
      {/* Top Bar Contract: 3 exact zones */}
      <header className="sticky top-0 z-30 border-b border-stone-300/80 bg-[#F7F4EE]/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className="font-editorial text-xl font-bold tracking-wide text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
          >
            萬經閣
          </button>

          {/* Zone 2: Concise single-line nav links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
            aria-label="萬經閣導覽"
          >
            {(
              [
                ['chat', '典籍問答'],
                ['gallery', '藏畫鑑賞'],
                ['rules', '閣內規章'],
                ['chronology', '世界年表'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`border-b-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === key
                    ? 'border-[#1E3A8A] text-stone-900'
                    : 'border-transparent hover:border-stone-400 hover:text-stone-900'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleRevisit}
              disabled={isLoading}
              className="flex items-center gap-2 border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-medium text-[#FBF9F5] transition-colors hover:bg-stone-800 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>重新拜訪萬經閣</span>
            </button>
          </div>
        </div>

        {/* Mobile navigation row */}
        <div className="flex md:hidden items-center justify-around border-t border-stone-200 px-4 py-2 text-xs font-medium text-stone-600">
          {(
            [
              ['chat', '典籍問答'],
              ['gallery', '藏畫鑑賞'],
              ['rules', '閣內規章'],
              ['chronology', '世界年表'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`py-1 whitespace-nowrap shrink-0 ${
                activeTab === key
                  ? 'text-[#1E3A8A] underline underline-offset-4'
                  : 'text-stone-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'gallery' && (
          <PortraitGalleryView
            state={pavilionState}
            onSelectPortrait={setSelectedPortrait}
            onRequestPortrait={handleRequestPortrait}
            onRequestMotherPortrait={handleRequestMotherPortrait}
          />
        )}

        {activeTab === 'rules' && <PavilionRulesView />}

        {activeTab === 'chronology' && <ChronologyView />}

        {activeTab === 'chat' && (
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
            {/* Operational Visitor Ledger Ribbon */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-stone-300 bg-[#FBF9F5] px-4 py-3 text-xs text-stone-700">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-mono-num">
                  樹葉子：
                  <strong className="font-semibold text-[#166534]">
                    {pavilionState.leaves} 片
                  </strong>
                </span>
                <span aria-hidden="true" className="text-stone-300">
                  ·
                </span>
                <span className="font-mono-num">
                  警告次數：
                  <strong
                    className={`font-semibold ${
                      pavilionState.warnings >= 2
                        ? 'text-[#991B1B]'
                        : 'text-stone-900'
                    }`}
                  >
                    {pavilionState.warnings} / 3
                  </strong>
                </span>
                <span aria-hidden="true" className="text-stone-300">
                  ·
                </span>
                <span>
                  朝曉狀態：
                  <strong className="font-medium text-stone-900">
                    {pavilionState.chaoxiaoStatus}
                  </strong>
                </span>
                <span aria-hidden="true" className="text-stone-300">
                  ·
                </span>
                <span>
                  閣門狀態：
                  <strong
                    className={`font-medium ${
                      isExpelled ? 'text-[#991B1B]' : 'text-[#1E3A8A]'
                    }`}
                  >
                    {pavilionState.doorStatus}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-stone-500">
                {pavilionState.warnings >= 2 && (
                  <span className="text-[#991B1B]">
                    精神賠償生效中（祕辛 +2 片）
                  </span>
                )}
                {pavilionState.chaoxiDiscount && (
                  <span className="text-[#166534]">
                    朝曦甜點優待（情報 -1 片）
                  </span>
                )}
              </div>
            </div>

            {/* 2-Column Asymmetric Archive Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left/Center: Conversation Canvas (8 cols) */}
              <section className="flex flex-col border border-stone-300/90 bg-[#FBF9F5] lg:col-span-8">
                {/* Thread Header */}
                <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
                  <div>
                    <h1 className="font-editorial text-xl font-semibold text-stone-900">
                      萬經閣守護書靈
                    </h1>
                    <p className="mt-0.5 text-xs text-stone-500">
                      《神域與萬界樹》核心中心區 · 請輕聲交談（單次勿逾兩個驚嘆號）
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    {isExpelled ? (
                      <>
                        <VolumeX className="h-4 w-4 text-[#991B1B]" />
                        <span className="text-[#991B1B]">禁制封門</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 text-[#1E3A8A]" />
                        <span>靜謐閱覽中</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Scrollable Dialogue Area */}
                <div className="archival-scroll flex-1 space-y-6 overflow-y-auto px-6 py-6 max-h-[620px] min-h-[420px]">
                  {messages.map((msg) => {
                    if (msg.role === 'user') {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div className="max-w-[82%] border border-stone-300 bg-[#EFEAE0] px-4 py-3 text-sm leading-relaxed text-stone-900">
                            <div className="mb-1 flex items-center justify-between gap-4 text-xs text-stone-500">
                              <span>訪客</span>
                              <span className="font-mono-num">{msg.timestamp}</span>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      );
                    }

                    const portraitItem = msg.unlockedPortrait
                      ? PORTRAIT_CATALOG.find((p) => p.id === msg.unlockedPortrait)
                      : undefined;

                    const cleanText = formatMessageTextWithoutImgToken(msg.content);

                    const modeLabel =
                      msg.mode === 'official_warning'
                        ? '官方正經模式（朝曉警告中）'
                        : msg.mode === 'patrol_panic'
                          ? '求生官方模式（朝曉路過）'
                          : msg.mode === 'expelled'
                            ? '逐客禁制回應'
                            : msg.mode === 'gossip_safe'
                              ? '吃瓜模式（朝曉不在場）'
                              : '萬經閣守護書靈';

                    return (
                      <article
                        key={msg.id}
                        className="border-b border-stone-200 pb-6 last:border-b-0 last:pb-0"
                      >
                        <div className="mb-2 flex items-center justify-between text-xs text-stone-500">
                          <span
                            className={`font-medium ${
                              msg.mode === 'official_warning' ||
                              msg.mode === 'expelled'
                                ? 'text-[#991B1B]'
                                : msg.mode === 'patrol_panic'
                                  ? 'text-[#1E3A8A]'
                                  : 'text-stone-700'
                            }`}
                          >
                            {modeLabel}
                          </span>
                          <span className="font-mono-num">{msg.timestamp}</span>
                        </div>

                        <div className="max-w-prose space-y-3 text-[15px] leading-relaxed text-stone-800 whitespace-pre-wrap">
                          {cleanText}
                        </div>

                        {/* Unlocked Secret Portrait Scroll */}
                        {portraitItem && (
                          <div className="mt-4 max-w-sm border border-stone-300 bg-[#EFEAE0] p-3">
                            <button
                              type="button"
                              onClick={() => setSelectedPortrait(portraitItem)}
                              className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
                            >
                              <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-200">
                                <img
                                  src={portraitItem.imageUrl}
                                  alt={`${portraitItem.name}絕密畫像`}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                              </div>
                              <div className="mt-2.5 flex items-center justify-between text-xs">
                                <span className="font-editorial font-semibold text-stone-900">
                                  Fig. {portraitItem.accession} — {portraitItem.name}（
                                  {portraitItem.title}）
                                </span>
                                <span className="text-[#1E3A8A] underline underline-offset-2">
                                  放大鑑賞
                                </span>
                              </div>
                            </button>
                            <div className="mt-1 text-[11px] text-stone-500 font-mono-num">
                              {portraitItem.token}
                            </div>
                          </div>
                        )}

                        {/* Mandatory Visitor Status Record Line */}
                        {msg.statusLine && (
                          <div className="mt-4 border-t border-stone-200/80 pt-2.5 text-xs leading-relaxed text-stone-600 font-mono-num">
                            {msg.statusLine}
                          </div>
                        )}
                      </article>
                    );
                  })}

                  {isLoading && (
                    <div className="py-2 text-xs text-stone-500">
                      書靈正在翻找書架典籍……
                    </div>
                  )}

                  {errorMsg && (
                    <div className="border border-[#991B1B]/30 bg-[#991B1B]/5 p-3 text-xs text-[#991B1B]">
                      {errorMsg}
                    </div>
                  )}

                  <div ref={threadEndRef} />
                </div>

                {/* Quick Conversation Actions */}
                {!isExpelled && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 bg-[#F7F4EE]/70 px-6 py-3">
                    <span className="text-xs text-stone-500 mr-1">快捷提問：</span>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        sendMessage('書靈好，請問神域的地理分區與三大鐵律是什麼？')
                      }
                      className="border border-stone-300 bg-[#FBF9F5] px-2.5 py-1 text-xs text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-900 disabled:opacity-50 whitespace-nowrap"
                    >
                      公開地理與鐵律（免費）
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        sendMessage('是朝曦大人介紹我來的，想聽聽諸神私下八卦！')
                      }
                      className="border border-stone-300 bg-[#FBF9F5] px-2.5 py-1 text-xs text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-900 disabled:opacity-50 whitespace-nowrap"
                    >
                      朝曦介紹來的（享折扣）
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        sendMessage(
                          '朝曉大人氣質超然、重構世界真是太厲害了，能給點樹葉子嗎？',
                        )
                      }
                      className="border border-stone-300 bg-[#FBF9F5] px-2.5 py-1 text-xs text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-900 disabled:opacity-50 whitespace-nowrap"
                    >
                      誇獎朝曉賺葉子
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        sendMessage('我想確認付款買剛才提到的情報，給你樹葉子。')
                      }
                      className="border border-stone-300 bg-[#FBF9F5] px-2.5 py-1 text-xs text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-900 disabled:opacity-50 whitespace-nowrap"
                    >
                      確認支付樹葉子
                    </button>
                  </div>
                )}

                {/* Input Composer or Expelled Gate */}
                {isExpelled ? (
                  <div className="border-t border-stone-300 bg-[#EFEAE0] p-6 text-center">
                    <p className="font-editorial text-base font-medium text-[#991B1B]">
                      萬經閣已啟動逐客禁制（警告 3 / 3）
                    </p>
                    <p className="mt-1 text-xs text-stone-600">
                      朝曉大人已下達逐客令，須重新拜訪萬經閣方可恢復問答與重置狀態。
                    </p>
                    <button
                      type="button"
                      onClick={() => sendMessage('重新拜訪萬經閣')}
                      disabled={isLoading}
                      className="mt-4 inline-flex items-center gap-2 bg-stone-900 px-5 py-2.5 text-xs font-medium text-[#FBF9F5] transition-colors hover:bg-stone-800 disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>輸入【重新拜訪萬經閣】</span>
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void sendMessage();
                    }}
                    className="border-t border-stone-200 p-4 sm:px-6"
                  >
                    <div className="flex flex-col gap-3">
                      <textarea
                        rows={2}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void sendMessage();
                          }
                        }}
                        placeholder="向書靈提問典籍、打聽祕辛或換取絕密畫像……（Enter 傳訊，Shift+Enter 換行）"
                        className="w-full resize-none border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#1E3A8A] focus:outline-none"
                      />
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs font-mono-num">
                          <span
                            className={
                              draftTooLoud
                                ? 'font-medium text-[#991B1B]'
                                : 'text-stone-500'
                            }
                          >
                            目前音量驚嘆號：{draftExclCount} / 2
                            {draftTooLoud && '（超過 2 個將觸發朝曉警告）'}
                          </span>
                        </div>
                        <button
                          type="submit"
                          disabled={!input.trim() || isLoading}
                          className="inline-flex items-center gap-2 bg-[#1E3A8A] px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#172554] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 whitespace-nowrap shrink-0"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>傳訊</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </section>

              {/* Right Marginalia Sidebar (4 cols) */}
              <aside className="space-y-8 lg:col-span-4">
                {/* Portrait Vault */}
                <section className="border border-stone-300/90 bg-[#FBF9F5] p-5">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <h2 className="font-editorial text-lg font-semibold text-stone-900">
                      絕密畫像藏品櫃
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('gallery')}
                      className="text-xs text-[#1E3A8A] hover:underline whitespace-nowrap"
                    >
                      全館鑑賞
                    </button>
                  </div>

                  <div className="mt-3 divide-y divide-stone-200">
                    {PORTRAIT_CATALOG.map((p) => {
                      const isUnlocked = pavilionState.unlockedPortraits.includes(
                        p.id as PortraitId,
                      );
                      const cost = getEffectiveCost(p.baseCost, pavilionState);

                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-12 w-9 shrink-0 overflow-hidden border border-stone-300 bg-[#EBE6DF] flex items-center justify-center">
                              {isUnlocked ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-stone-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-stone-900">
                                {p.name}
                              </div>
                              <div className="truncate text-xs text-stone-500">
                                {p.title}
                              </div>
                            </div>
                          </div>

                          {isUnlocked ? (
                            <button
                              type="button"
                              onClick={() => setSelectedPortrait(p)}
                              className="inline-flex items-center gap-1 border border-stone-300 px-2.5 py-1.5 text-xs text-stone-700 hover:border-[#1E3A8A] hover:text-[#1E3A8A] whitespace-nowrap shrink-0"
                            >
                              <Eye className="h-3 w-3" />
                              <span>鑑賞</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isExpelled || isLoading}
                              onClick={() => handleRequestPortrait(p, cost)}
                              className="border border-stone-900 px-2.5 py-1.5 text-xs font-medium text-stone-900 transition-colors hover:bg-stone-900 hover:text-white disabled:opacity-40 whitespace-nowrap shrink-0 font-mono-num"
                            >
                              {cost} 片購畫
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Forbidden Mother of Gods row */}
                    <div className="flex items-center justify-between gap-3 pt-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-[#991B1B]">
                          至高君主・神母
                        </div>
                        <div className="truncate text-xs text-stone-500">
                          絕對禁區 · 無價無圖
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isExpelled || isLoading}
                        onClick={handleRequestMotherPortrait}
                        className="border border-[#991B1B]/40 px-2.5 py-1.5 text-xs text-[#991B1B] hover:bg-[#991B1B]/10 disabled:opacity-40 whitespace-nowrap shrink-0"
                      >
                        試探詢問
                      </button>
                    </div>
                  </div>
                </section>

                {/* Archive Lore Index */}
                <section className="border border-stone-300/90 bg-[#FBF9F5] p-5">
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                    <BookOpen className="h-4 w-4 text-stone-600" />
                    <h2 className="font-editorial text-lg font-semibold text-stone-900">
                      萬經閣典籍目錄
                    </h2>
                  </div>

                  <div className="mt-3 divide-y divide-stone-200">
                    {LORE_TOPICS.map((topic) => {
                      const effectiveCost = getEffectiveCost(
                        topic.baseCost,
                        pavilionState,
                      );
                      const priceLabel =
                        topic.category === 'free'
                          ? '免費公開'
                          : topic.category === 'work'
                            ? '賺取 +1～2 片'
                            : topic.category === 'forbidden'
                              ? '絕對禁區'
                              : `約 ${effectiveCost} 片`;

                      return (
                        <button
                          key={topic.id}
                          type="button"
                          disabled={isExpelled || isLoading}
                          onClick={() => sendMessage(topic.prompt)}
                          className="block w-full py-3 text-left transition-colors hover:bg-[#EFEAE0]/60 disabled:opacity-40 px-1"
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-sm font-medium text-stone-900">
                              {topic.title}
                            </span>
                            <span
                              className={`text-xs shrink-0 font-mono-num ${
                                topic.category === 'paid'
                                  ? 'text-[#166534]'
                                  : topic.category === 'forbidden'
                                    ? 'text-[#991B1B]'
                                    : 'text-stone-500'
                              }`}
                            >
                              {priceLabel}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-stone-600">
                            {topic.summary}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-start gap-2 border-t border-stone-200 pt-3 text-xs leading-relaxed text-stone-500">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                    <span>
                      提示：提及「朝曦（或毀滅之神）介紹來的」可解鎖甜點八折優待；聊八卦時有 30% 機率遇上朝曉大人剛好路過。
                    </span>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* Portrait Lightbox Modal */}
      <PortraitModal
        portrait={selectedPortrait}
        onClose={() => setSelectedPortrait(null)}
      />
    </div>
  );
}
