import { Lock, Eye, AlertTriangle, ShieldAlert } from 'lucide-react';
import {
  CHRONOLOGY_EVENTS,
  DIVINE_RANKS,
  PORTRAIT_CATALOG,
} from '../data/knowledgeCatalog.ts';
import type { PavilionState, PortraitCatalogItem, PortraitId } from '../types.ts';

interface GalleryViewProps {
  state: PavilionState;
  onSelectPortrait: (portrait: PortraitCatalogItem) => void;
  onRequestPortrait: (portrait: PortraitCatalogItem, effectiveCost: number) => void;
  onRequestMotherPortrait: () => void;
}

function getEffectiveCost(baseCost: number, state: PavilionState): number {
  const surcharge = state.warnings >= 2 ? 2 : 0;
  const discount = state.chaoxiDiscount ? 1 : 0;
  return Math.max(1, baseCost + surcharge - discount);
}

export function PortraitGalleryView({
  state,
  onSelectPortrait,
  onRequestPortrait,
  onRequestMotherPortrait,
}: GalleryViewProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="border-b border-stone-300 pb-6">
        <div className="text-xs tracking-widest text-stone-500 font-mono-num">
          萬經閣鎮閣秘藏 · 絕密畫像圖鑑
        </div>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-stone-900 text-balance">
          原初神與國師畫卷鑑賞
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          書靈私下珍藏的四幅神域核心人物畫卷。支付足額「樹葉子」並經書靈點頭成交後，畫卷即可在此展開全幅細賞；唯獨至高君主神母乃絕對禁區，無價亦無圖。
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {PORTRAIT_CATALOG.map((item) => {
          const isUnlocked = state.unlockedPortraits.includes(item.id as PortraitId);
          const cost = getEffectiveCost(item.baseCost, state);
          const canAfford = state.leaves >= cost;
          const isExpelled = state.doorStatus === '已逐客';

          return (
            <article
              key={item.id}
              className="flex flex-col justify-between border border-stone-200 bg-[#FBF9F5]"
            >
              <div>
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EBE6DF]">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => onSelectPortrait(item)}
                      className="group relative h-full w-full text-left focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
                    >
                      <img
                        src={item.imageUrl}
                        alt={`${item.name}畫像`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <span className="absolute right-3 bottom-3 flex items-center gap-1.5 bg-stone-900/80 px-2.5 py-1 text-xs text-stone-100">
                        <Eye className="h-3.5 w-3.5" />
                        <span>細賞全圖</span>
                      </span>
                    </button>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                      <Lock className="h-6 w-6 text-stone-400" />
                      <p className="mt-3 font-editorial text-lg text-stone-700">
                        畫卷尚未解封
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        需向書靈支付 {cost} 片樹葉子
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-mono-num">
                    <span>{item.accession}</span>
                    <span>{isUnlocked ? '已藏錄' : `${cost} 片樹葉子`}</span>
                  </div>
                  <h2 className="mt-2 font-editorial text-xl font-semibold text-stone-900">
                    {item.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#1E3A8A]">{item.title}</p>
                  <p className="mt-3 text-xs leading-relaxed text-stone-600">
                    {item.riskNote}
                  </p>
                </div>
              </div>

              <div className="border-t border-stone-200 px-5 py-3">
                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => onSelectPortrait(item)}
                    className="w-full py-2 text-center text-xs font-medium text-[#1E3A8A] transition-colors hover:bg-[#1E3A8A]/5 whitespace-nowrap"
                  >
                    打開鑑賞視窗
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isExpelled}
                    onClick={() => onRequestPortrait(item, cost)}
                    className="w-full bg-stone-900 py-2 text-center text-xs font-medium text-[#FBF9F5] transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 whitespace-nowrap"
                  >
                    {isExpelled
                      ? '閣門已閉'
                      : canAfford
                        ? `向書靈求購（${cost} 片）`
                        : `餘額不足（需 ${cost} 片）`}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Forbidden Zone: Mother of Gods */}
      <div className="mt-10 flex flex-col items-start justify-between gap-6 border border-stone-300 bg-[#EFEAE0] p-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#991B1B]">
            <ShieldAlert className="h-4 w-4" />
            <span>絕對禁區 · 無價／無圖</span>
          </div>
          <h3 className="mt-1 font-editorial text-xl font-semibold text-stone-900">
            至高君主・神母（Mother of Gods）
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-700">
            眾神之王，周身環繞璀璨金光，有著無溫度的雙眼與微笑唇，曾以凡人時間八天抹殺半數神明。書靈絕不敢私繪或收藏其畫像。
          </p>
        </div>
        <button
          type="button"
          disabled={state.doorStatus === '已逐客'}
          onClick={onRequestMotherPortrait}
          className="shrink-0 border border-[#991B1B]/40 px-4 py-2 text-xs font-medium text-[#991B1B] transition-colors hover:bg-[#991B1B]/10 disabled:opacity-40 whitespace-nowrap"
        >
          試探索取神母畫像
        </button>
      </div>
    </section>
  );
}

export function PavilionRulesView() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="border-b border-stone-300 pb-6">
        <div className="text-xs tracking-widest text-stone-500 font-mono-num">
          神域律法與閣規 · 免費公開典籍
        </div>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-stone-900">
          萬經閣規章、三大鐵律與五大神階
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          入閣訪客皆須遵守創造之神朝曉大人與秩序之神准序大人所立之律法。輕則被請出閣門，重則於刑懲殿受抽魂鞭乃至神魂俱滅。
        </p>
      </div>

      {/* Acoustic Warning Rules */}
      <div className="mt-8">
        <h2 className="font-editorial text-xl font-semibold text-stone-900">
          一、萬經閣靜謐條例（驚嘆號判定）
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">
          單次訊息（不論訪客或書靈自身）累計出現超過 2 個驚嘆號（即 3 個以上，含「！」與「!」），即判定為「講話太大聲」，累計 3 次將直接封門逐客。
        </p>
        <div className="mt-4 divide-y divide-stone-200 border border-stone-200 bg-[#FBF9F5]">
          <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-12">
            <div className="text-xs font-medium text-stone-500 font-mono-num md:col-span-3">
              警告 1 / 3
            </div>
            <div className="text-sm text-stone-800 md:col-span-9">
              朝曉於裡殿出聲：「萬經閣內，禁止喧嘩。」書靈立刻收起所有顏文字切換為官方正經模式。
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-12">
            <div className="text-xs font-medium text-[#991B1B] font-mono-num md:col-span-3">
              警告 2 / 3
            </div>
            <div className="text-sm text-stone-800 md:col-span-9">
              朝曉持沾有星光墨水的毛筆現身冷眼警告：「再吵，就一起出去。」此後所有付費祕辛與畫像定價全面漲價 2 片樹葉子。
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-12">
            <div className="text-xs font-medium text-[#991B1B] font-mono-num md:col-span-3">
              警告 3 / 3（驅逐）
            </div>
            <div className="text-sm text-stone-800 md:col-span-9">
              朝曉下達逐客令：「請回吧。」禁制啟動關閉閣門，須輸入「重新拜訪萬經閣」方可重開對話。
            </div>
          </div>
        </div>
      </div>

      {/* Three Iron Laws */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#991B1B]" />
          <h2 className="font-editorial text-xl font-semibold text-stone-900">
            二、神域三大鐵律（觸犯者執行神魂俱滅）
          </h2>
        </div>
        <ol className="mt-4 divide-y divide-stone-200 border border-stone-200 bg-[#FBF9F5] text-sm">
          <li className="p-4">
            <span className="font-medium text-stone-900">1. 禁侵本體：</span>
            <span className="text-stone-700">
              嚴禁任何傷害萬界樹樹幹、根系與核心花園之行為。
            </span>
          </li>
          <li className="p-4">
            <span className="font-medium text-stone-900">2. 禁物下凡：</span>
            <span className="text-stone-700">
              嚴禁將中心區與花園之任何物品帶入凡間世界。神明可展現神蹟，但若神力過濃改造出「準神產物」，凡間法則將自動將該物彈回神域固定接收點。
            </span>
          </li>
          <li className="p-4">
            <span className="font-medium text-stone-900">3. 禁損邊界：</span>
            <span className="text-stone-700">
              嚴禁破壞或私自毀損十二邊界柱之封印陣法。
            </span>
          </li>
        </ol>
      </div>

      {/* Five Divine Ranks */}
      <div className="mt-10">
        <h2 className="font-editorial text-xl font-semibold text-stone-900">
          三、五大神階體系與晉升機制
        </h2>
        <div className="mt-4 overflow-x-auto border border-stone-200 bg-[#FBF9F5]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-[#EFEAE0] text-xs text-stone-600">
                <th className="px-4 py-3 font-medium">神階名稱</th>
                <th className="px-4 py-3 font-medium">神力來源與晉升條件</th>
                <th className="px-4 py-3 font-medium">權力職能與法律地位</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {DIVINE_RANKS.map((row) => (
                <tr key={row.rank}>
                  <td className="px-4 py-3 align-top font-medium text-stone-900 whitespace-nowrap">
                    {row.rank}
                    <div className="text-xs font-normal text-stone-500">
                      {row.english}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-stone-700">{row.source}</td>
                  <td className="px-4 py-3 align-top text-stone-700">{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function ChronologyView() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="border-b border-stone-300 pb-6">
        <div className="text-xs tracking-widest text-stone-500 font-mono-num">
          諸天史冊 · 歷史編年史
        </div>
        <h1 className="mt-2 font-editorial text-3xl font-semibold text-stone-900">
          神域歷史編年與重大事件紀要
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          從受冕制度尚未確立的第一次神戰，到紊霜採花案、米賽·拉尼亞盜繭案、雙重清洗，直至雙界融合危機與鐵三角飛升。詳細內幕可在問答閣向書靈付費打聽。
        </p>
      </div>

      <div className="mt-8 divide-y divide-stone-200 border border-stone-200 bg-[#FBF9F5]">
        {CHRONOLOGY_EVENTS.map((ev, idx) => (
          <article key={ev.title} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-12">
            <div className="md:col-span-3">
              <div className="text-xs text-stone-400 font-mono-num">
                0{idx + 1} / {ev.era}
              </div>
            </div>
            <div className="md:col-span-9">
              <h2 className="font-editorial text-lg font-semibold text-stone-900">
                {ev.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {ev.detail}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
