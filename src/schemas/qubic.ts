export interface QubicStats {
  timestamp: string;
  circulatingSupply: string;
  activeAddresses: number;
  price: number;
  marketCap: string;
  epoch: number;
  currentTick: number;
  ticksInCurrentEpoch: number;
  emptyTicksInCurrentEpoch: number;
  epochTickQuality: number;
  burnedQus: string;
}

export interface QubicLILoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
  };
}

export interface QubicLIScore {
  id: string;
  score: number;
  adminScore: number;
  epoch: number;
  updated: string;
  checked: string;
  identity: string;
  isComputor: boolean;
}

export interface QubicLIScoreStatistic {
  epoch: number;
  daydate: string;
  maxScore: number;
  realMinScore: number;
  minScore: number;
  avgScore: number;
}

export interface QubicLIScoresResponse {
  scores: QubicLIScore[];
  scoreStatistics: QubicLIScoreStatistic[];
  minScore: number;
  maxScore: number;
  averageScore: number;
  estimatedIts: number;
  solutionsPerHour: number;
  solutionsPerHourCalculated: number;
  difficulty: number;
  createdAt: string;
}
