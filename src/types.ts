export type PortraitId = 'xiexianyun' | 'zhunxu' | 'chaoxi' | 'chaoxiao';

export type DoorStatus = '開放中' | '已逐客';

export type SpiritMode =
  | 'lively'
  | 'gossip_safe'
  | 'patrol_panic'
  | 'official_warning'
  | 'expelled';

export interface PavilionState {
  leaves: number;
  warnings: number;
  chaoxiaoStatus: string;
  doorStatus: DoorStatus;
  chaoxiDiscount: boolean;
  unlockedPortraits: PortraitId[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'spirit';
  content: string;
  statusLine?: string;
  unlockedPortrait?: PortraitId;
  mode?: SpiritMode;
  warningTriggered?: number;
  patrolResult?: 'absent' | 'passing_by';
  timestamp: string;
}

export interface PortraitCatalogItem {
  id: PortraitId;
  accession: string;
  name: string;
  title: string;
  rank: string;
  baseCost: number;
  riskNote: string;
  appearance: string;
  personality: string;
  bio: string;
  imageUrl: string;
  token: string;
}

export interface LoreTopicItem {
  id: string;
  title: string;
  category: 'free' | 'paid' | 'work' | 'forbidden';
  baseCost: number;
  summary: string;
  prompt: string;
}
