import { useState } from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';
import type { PortraitCatalogItem } from '../types.ts';

interface PortraitModalProps {
  portrait: PortraitCatalogItem | null;
  onClose: () => void;
}

export function PortraitModal({ portrait, onClose }: PortraitModalProps) {
  const [imgError, setImgError] = useState(false);

  if (!portrait) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${portrait.name}絕密畫像鑑賞`}
    >
      <div
        className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden border border-stone-300 bg-[#FBF9F5] shadow-2xl md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center border border-stone-300 bg-[#FBF9F5]/95 text-stone-700 transition-colors hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-[#1E3A8A]"
          aria-label="關閉畫像視窗"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Artwork Viewer */}
        <div className="flex items-center justify-center bg-[#EBE6DF] p-6 md:col-span-7 md:p-8">
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden border border-stone-300 bg-stone-200">
            {!imgError ? (
              <img
                src={portrait.imageUrl}
                alt={`${portrait.name}（${portrait.title}）絕密畫像`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-stone-100 p-6 text-center text-stone-500">
                <Sparkles className="h-8 w-8 text-stone-400" />
                <p className="font-editorial text-lg text-stone-700">{portrait.name}</p>
                <p className="text-xs">畫卷墨跡尚未顯影</p>
              </div>
            )}
          </div>
        </div>

        {/* Museum Accession Details */}
        <div className="flex flex-col justify-between p-6 md:col-span-5 md:p-8">
          <div>
            <div className="text-xs tracking-widest text-stone-500 font-mono-num">
              {portrait.accession} · 萬經閣秘藏畫卷
            </div>
            <h2 className="mt-2 font-editorial text-3xl font-semibold text-stone-900">
              {portrait.name}
            </h2>
            <p className="mt-1 text-sm text-[#1E3A8A]">{portrait.title}</p>

            <dl className="mt-6 divide-y divide-stone-200 border-y border-stone-200 text-sm">
              <div className="py-3">
                <dt className="text-xs tracking-wider text-stone-500">神階位份</dt>
                <dd className="mt-1 text-stone-800">{portrait.rank}</dd>
              </div>
              <div className="py-3">
                <dt className="text-xs tracking-wider text-stone-500">核心性格</dt>
                <dd className="mt-1 text-stone-800">{portrait.personality}</dd>
              </div>
              <div className="py-3">
                <dt className="text-xs tracking-wider text-stone-500">外貌與符號</dt>
                <dd className="mt-1 leading-relaxed text-stone-800">{portrait.appearance}</dd>
              </div>
              <div className="py-3">
                <dt className="text-xs tracking-wider text-stone-500">典籍記載</dt>
                <dd className="mt-1 leading-relaxed text-stone-700">{portrait.bio}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex items-center justify-between pt-2 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>已收錄至訪客鑑賞冊</span>
            </span>
            <span className="font-mono-num">{portrait.token}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
