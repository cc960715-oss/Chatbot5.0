import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './server/loreContext.ts';
import type {
  ChatMessage,
  DoorStatus,
  PavilionState,
  PortraitId,
  SpiritMode,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INITIAL_STATE: PavilionState = {
  leaves: 15,
  warnings: 0,
  chaoxiaoStatus: '在裡殿重構世界',
  doorStatus: '開放中',
  chaoxiDiscount: false,
  unlockedPortraits: [],
};

const PORTRAIT_BASE_COSTS: Record<PortraitId, number> = {
  xiexianyun: 4,
  zhunxu: 5,
  chaoxi: 5,
  chaoxiao: 8,
};

function countExclamationMarks(text: string): number {
  const matches = text.match(/[!！]/g);
  return matches ? matches.length : 0;
}

function formatStatusLine(state: PavilionState): string {
  return `📜 【萬經閣訪客紀錄】 🍃 樹葉子：${state.leaves} 片 ｜ 🤫 警告次數：${state.warnings} / 3 ｜ 👀 朝曉狀態：${state.chaoxiaoStatus} ｜ 🚪 閣門狀態：${state.doorStatus}`;
}

function getEffectivePortraitCost(id: PortraitId, state: PavilionState): number {
  const base = PORTRAIT_BASE_COSTS[id];
  const surcharge = state.warnings >= 2 ? 2 : 0;
  const discount = state.chaoxiDiscount ? 1 : 0;
  return Math.max(1, base + surcharge - discount);
}

function createAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((resolve) => setTimeout(resolve, 600 * (i + 1)));
      }
    }
  }
  throw lastError;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description:
        '守護書靈的完整對話回覆，含動作描寫與對應語氣（正常活潑顏文字／官方正經模式／求生模式／逐客哭訴）。不要包含狀態欄文字與 [IMG:...] 代碼。',
    },
    leafDelta: {
      type: Type.INTEGER,
      description:
        '本回合樹葉子數量變化。扣款請填負數（例如 -3），打工賺取（誇獎朝曉／講笑話）請填正數（+1 或 +2），無交易請填 0。',
    },
    triggeredWarning: {
      type: Type.BOOLEAN,
      description:
        '若本回合因為講話超過 2 個驚嘆號而觸發朝曉大人警告則為 true，否則 false。',
    },
    chaoxiaoStatus: {
      type: Type.STRING,
      description:
        '朝曉大人目前狀態簡述（例如：在裡殿重構世界、在書架旁巡視、從裡殿出聲警告、持星光墨筆冷眼警告、下達逐客令）。',
    },
    unlockedPortrait: {
      type: Type.STRING,
      description:
        '本回合成功付款解鎖的畫像角色 ID：只能是 none, xiexianyun, zhunxu, chaoxi, chaoxiao 其中之一。未付款或餘額不足或問神母時必須為 none。',
    },
    chaoxiReferralActivated: {
      type: Type.BOOLEAN,
      description:
        '若訪客在本回合提到是朝曦（或毀滅之神）介紹來的，設為 true，否則 false。',
    },
    mode: {
      type: Type.STRING,
      description:
        '回覆語氣模式：lively, gossip_safe, patrol_panic, official_warning, expelled 其中之一。',
    },
  },
  required: [
    'reply',
    'leafDelta',
    'triggeredWarning',
    'chaoxiaoStatus',
    'unlockedPortrait',
    'chaoxiReferralActivated',
    'mode',
  ],
};

interface ModelTurnPayload {
  reply: string;
  leafDelta: number;
  triggeredWarning: boolean;
  chaoxiaoStatus: string;
  unlockedPortrait: 'none' | PortraitId;
  chaoxiReferralActivated: boolean;
  mode: SpiritMode;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/greeting', (_req, res) => {
    const state: PavilionState = { ...INITIAL_STATE, unlockedPortraits: [] };
    const content = [
      '（書架後方忽然探出一顆毛茸茸、帶著墨香的小腦袋，眼睛亮晶晶地盯著你手裡的葉片袋子）(ﾉ>ω<)ﾉ',
      '歡迎來到《神域與萬界樹》核心中心區的「萬經閣」(*´∀`)~♥ 我是直屬於創造之神朝曉大人的守護書靈～平時在閣裡憋壞了，難得有訪客上門，想查諸天萬界的歷史典籍、還是想打聽神明大人的私房祕辛，我這裡通通都有存檔喔！(✧ω✧)',
      '對了對了，新入閣的訪客身上都備有 15 片「樹葉子」，這可是神域通用的運作資源呢 ($Д$) 只要給我幾片樹葉子，不管是上古神戰內幕還是絕密畫像，我都能偷偷翻給你看～',
      '（突然雙手比出噤聲手勢，壓低聲音湊近）噓——差點忘了提醒你，朝曉大人就在裡殿重構世界，她最討厭任何人在萬經閣吵鬧了，單次說話千萬別發出超過兩個驚嘆號（！或 !），不然被她聽到可是會被警告甚至趕出去的喔……(つд⊂)',
    ].join('\n\n');

    res.json({
      state,
      message: {
        id: `spirit-init-${Date.now()}`,
        role: 'spirit',
        content,
        statusLine: formatStatusLine(state),
        mode: 'lively',
        timestamp: new Date().toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      } satisfies ChatMessage,
    });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const body = req.body as {
        userMessage?: string;
        history?: Array<{ role: 'user' | 'spirit'; content: string }>;
        state?: PavilionState;
      };

      const userMessage = (body.userMessage ?? '').trim();
      if (!userMessage) {
        res.status(400).json({ error: '請輸入想對書靈說的話。' });
        return;
      }

      const prevState: PavilionState = {
        leaves: typeof body.state?.leaves === 'number' ? body.state.leaves : 15,
        warnings: typeof body.state?.warnings === 'number' ? body.state.warnings : 0,
        chaoxiaoStatus: body.state?.chaoxiaoStatus || '在裡殿重構世界',
        doorStatus: body.state?.doorStatus === '已逐客' ? '已逐客' : '開放中',
        chaoxiDiscount: Boolean(body.state?.chaoxiDiscount),
        unlockedPortraits: Array.isArray(body.state?.unlockedPortraits)
          ? body.state.unlockedPortraits
          : [],
      };

      // Handle explicit revisit command
      if (userMessage.includes('重新拜訪萬經閣')) {
        const resetState: PavilionState = {
          ...INITIAL_STATE,
          unlockedPortraits: [],
        };
        const resetReply = [
          '（萬經閣大門上的金色禁制緩緩散去，門縫裡立刻探出一雙哭得紅通通又閃閃發亮的眼睛）(つд⊂)',
          '嗚嗚……你終於回來「重新拜訪萬經閣」啦！剛才被朝曉大人請出去真的嚇死我了，這次我們一定要小聲點說話（最多只能有兩個驚嘆號喔），千萬別再惹大老闆生氣了！(*´∀`)~♥',
          '你的訪客紀錄已經重新歸檔，手上一樣有 15 片閃閃發亮的樹葉子～想查什麼典籍或祕辛，現在可以小聲慢慢聊囉！(ﾉ>ω<)ﾉ',
        ].join('\n\n');

        res.json({
          state: resetState,
          message: {
            id: `spirit-${Date.now()}`,
            role: 'spirit',
            content: resetReply,
            statusLine: formatStatusLine(resetState),
            mode: 'lively',
            timestamp: new Date().toLocaleTimeString('zh-TW', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          } satisfies ChatMessage,
        });
        return;
      }

      // If already expelled, keep door closed
      if (prevState.doorStatus === '已逐客') {
        const expelledReply = [
          '（隔著緊閉的萬經閣沉重木門，門縫裡傳來書靈壓抑又委屈的抽泣聲）(´;ω;`)',
          '對、對不起……朝曉大人的禁制已經把閣門鎖死，她吩咐過「請回吧」，我不敢私自開門讓你進來，不然連我也會被拖去刑懲殿吃抽魂鞭的……(つд⊂)',
          '如果你真的還想查閱萬經閣的典籍，請先在門外靜候並對禁制說出【重新拜訪萬經閣】，我才能重新為你登記入閣喔……',
        ].join('\n\n');

        res.json({
          state: prevState,
          message: {
            id: `spirit-${Date.now()}`,
            role: 'spirit',
            content: expelledReply,
            statusLine: formatStatusLine(prevState),
            mode: 'expelled',
            timestamp: new Date().toLocaleTimeString('zh-TW', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          } satisfies ChatMessage,
        });
        return;
      }

      // Deterministic volume detection on user message
      const userExclCount = countExclamationMarks(userMessage);
      const userViolatedVolume = userExclCount > 2;
      const nextWarningIfViolated = Math.min(3, prevState.warnings + 1);

      // Deterministic 70% absent / 30% passing by roll
      const patrolRoll: 'absent' | 'passing_by' =
        Math.random() < 0.3 ? 'passing_by' : 'absent';

      // Check Chaoxi referral keywords
      const mentionedChaoxiReferral =
        /朝曦|毀滅之神/.test(userMessage) &&
        /介紹|推薦|讓我來|叫我來|打折|甜點/.test(userMessage);
      const effectiveDiscount = prevState.chaoxiDiscount || mentionedChaoxiReferral;

      const surchargeNote =
        prevState.warnings >= 2
          ? '已觸發過第2次警告：所有付費祕辛與畫像在基礎定價上額外 +2 片樹葉子精神賠償。'
          : '尚未漲價：維持基礎定價。';

      const discountNote = effectiveDiscount
        ? '已啟動「朝曦介紹彩蛋」：所有付費情報與畫像打八折（少收 1 片樹葉子，最低 1 片）。'
        : '尚未啟動朝曦折扣。';

      const portraitPricingNote = (
        ['xiexianyun', 'zhunxu', 'chaoxi', 'chaoxiao'] as PortraitId[]
      )
        .map((id) => {
          const tempState = { ...prevState, chaoxiDiscount: effectiveDiscount };
          return `${id}: ${getEffectivePortraitCost(id, tempState)} 片`;
        })
        .join('、');

      const turnDirective = [
        `【本回合系統狀態快照】`,
        `- 訪客目前樹葉子：${prevState.leaves} 片`,
        `- 目前累計警告次數：${prevState.warnings} / 3`,
        `- 目前朝曉狀態：${prevState.chaoxiaoStatus}`,
        `- 價格規則：${surchargeNote} ${discountNote}`,
        `- 目前畫像實際售價：${portraitPricingNote}`,
        `- 已解鎖畫像：${prevState.unlockedPortraits.length > 0 ? prevState.unlockedPortraits.join(', ') : '無'}`,
        `- 訪客本句驚嘆號數量：${userExclCount} 個 ${
          userViolatedVolume
            ? `（已超過 2 個！必須立刻觸發第 ${nextWarningIfViolated} 次警告懲罰！）`
            : '（未超標；提醒：你自己的回覆也請嚴格控制在 0~2 個驚嘆號以內）'
        }`,
        `- 本回合【朝曉巡視亂數判定（僅在聊八卦／祕辛／偷拍畫像時生效）】：${
          patrolRoll === 'passing_by'
            ? 'PASSING_BY（30% 機率命中：朝曉剛好路過走廊！請立刻切換【求生官方模式】！）'
            : 'ABSENT（70% 機率：朝曉不在附近，可以開啟【歡樂吃瓜模式】）'
        }`,
      ].join('\n');

      const recentHistory = (body.history ?? []).slice(-12);
      const contents = [
        ...recentHistory.map((m) => ({
          role: m.role === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: m.content }],
        })),
        {
          role: 'user' as const,
          parts: [{ text: `${turnDirective}\n\n【訪客本次發言】：\n${userMessage}` }],
        },
      ];

      const ai = createAiClient();
      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      );

      const rawText = (response.text ?? '').trim();
      let parsed: ModelTurnPayload;
      try {
        parsed = JSON.parse(rawText) as ModelTurnPayload;
      } catch {
        parsed = {
          reply:
            '（書靈手忙腳亂地扶住歪掉的書簡）哎呀，剛才翻書翻太快差點閃到腰……(つд⊂) 你可以再說一次嗎？',
          leafDelta: 0,
          triggeredWarning: userViolatedVolume,
          chaoxiaoStatus: prevState.chaoxiaoStatus,
          unlockedPortrait: 'none',
          chaoxiReferralActivated: mentionedChaoxiReferral,
          mode: userViolatedVolume ? 'official_warning' : 'lively',
        };
      }

      // Check if the spirit itself also exceeded 2 exclamation marks when not already warning
      const spiritExclCount = countExclamationMarks(parsed.reply || '');
      const spiritViolatedVolume =
        !userViolatedVolume &&
        !parsed.triggeredWarning &&
        spiritExclCount > 2;

      const warningHappened =
        userViolatedVolume || parsed.triggeredWarning || spiritViolatedVolume;

      // Apply authoritative state updates
      let nextWarnings = prevState.warnings;
      let nextDoorStatus: DoorStatus = prevState.doorStatus;
      let nextChaoxiaoStatus = parsed.chaoxiaoStatus || prevState.chaoxiaoStatus;
      let finalReply = parsed.reply || '';
      let finalMode: SpiritMode = parsed.mode || 'lively';

      if (warningHappened) {
        nextWarnings = Math.min(3, prevState.warnings + 1);
        if (nextWarnings === 1) {
          nextChaoxiaoStatus = '從裡殿出聲警告';
          finalMode = 'official_warning';
        } else if (nextWarnings === 2) {
          nextChaoxiaoStatus = '持星光墨筆冷眼警告';
          finalMode = 'official_warning';
        } else if (nextWarnings >= 3) {
          nextChaoxiaoStatus = '下達逐客令';
          nextDoorStatus = '已逐客';
          finalMode = 'expelled';
        }

        if (spiritViolatedVolume && !userViolatedVolume) {
          finalReply +=
            '\n\n（空氣驟然凝固，裡殿方向傳來一聲極冷的輕哼——糟糕，剛才連書靈自己都激動到發出超過兩個驚嘆號了……）';
        }
      }

      const nextDiscount =
        prevState.chaoxiDiscount || Boolean(parsed.chaoxiReferralActivated) || mentionedChaoxiReferral;

      // Authoritative portrait & leaf balance validation
      let unlockedPortrait: PortraitId | undefined;
      let nextLeaves = prevState.leaves;
      const nextUnlocked = [...prevState.unlockedPortraits];

      if (
        parsed.unlockedPortrait &&
        parsed.unlockedPortrait !== 'none' &&
        (['xiexianyun', 'zhunxu', 'chaoxi', 'chaoxiao'] as string[]).includes(
          parsed.unlockedPortrait,
        ) &&
        nextDoorStatus === '開放中' &&
        !warningHappened
      ) {
        const pid = parsed.unlockedPortrait as PortraitId;
        const alreadyOwned = nextUnlocked.includes(pid);
        const cost = alreadyOwned
          ? 0
          : getEffectivePortraitCost(pid, {
              ...prevState,
              chaoxiDiscount: nextDiscount,
            });

        if (alreadyOwned || prevState.leaves >= cost) {
          unlockedPortrait = pid;
          if (!alreadyOwned) {
            nextUnlocked.push(pid);
            nextLeaves = Math.max(0, prevState.leaves - cost);
          }
        } else {
          // Insufficient leaves guard
          unlockedPortrait = undefined;
          finalReply = `（書靈啪地一下合上畫軸，把畫像緊緊抱在懷裡）($Д$) 等等！你的樹葉子只剩 ${prevState.leaves} 片，這張畫像可是要 ${cost} 片樹葉子才換得到的耶！不夠的話，你可以試著誇獎朝曉大人幾句、或者講個好笑的笑話逗我開心，打點小工賺取 1～2 片樹葉子再來買喔 (¬‿¬)`;
        }
      } else {
        // Apply non-portrait leaf delta safely (capped & never negative)
        let delta = Number.isFinite(parsed.leafDelta) ? Math.trunc(parsed.leafDelta) : 0;
        if (delta > 2) delta = 2; // Max work reward per turn is +2
        if (delta < 0 && prevState.leaves + delta < 0) {
          delta = 0;
          finalReply = `（書靈數了數你手上的葉子搖搖頭）($Д$) 唔……你現在只剩 ${prevState.leaves} 片樹葉子，不太夠付這次的情報費呢！不如先誇獎一下朝曉大人，或者講個笑話給我聽，我給你發 1～2 片打工樹葉子再繼續好不好？(ﾉ>ω<)ﾉ`;
        }
        nextLeaves = Math.max(0, prevState.leaves + delta);
      }

      const nextState: PavilionState = {
        leaves: nextLeaves,
        warnings: nextWarnings,
        chaoxiaoStatus: nextChaoxiaoStatus,
        doorStatus: nextDoorStatus,
        chaoxiDiscount: nextDiscount,
        unlockedPortraits: nextUnlocked,
      };

      // Append PNG token if portrait unlocked
      const portraitTokenLine = unlockedPortrait
        ? `\n\n[IMG: ${unlockedPortrait}.png]`
        : '';

      const statusLine = formatStatusLine(nextState);

      res.json({
        state: nextState,
        message: {
          id: `spirit-${Date.now()}`,
          role: 'spirit',
          content: `${finalReply}${portraitTokenLine}`,
          statusLine,
          unlockedPortrait,
          mode: finalMode,
          warningTriggered: warningHappened ? nextWarnings : undefined,
          patrolResult: patrolRoll,
          timestamp: new Date().toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        } satisfies ChatMessage,
      });
    } catch (error) {
      console.error('Pavilion chat error:', error);
      const message =
        error instanceof Error ? error.message : '萬經閣傳訊陣法暫時失靈，請稍後再試。';
      res.status(500).json({ error: message });
    }
  });

  // Dev Vite middleware or static dist
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`萬經閣守護書靈伺服器已啟動於 http://0.0.0.0:${port}`);
  });
}

startServer();
