// 광고 계정 타입
export interface AdAccount {
  id: string;
  name: string;
  status: string;
  billingType: string;
  budget: number;
  dailyBudget?: number;
}

// 캠페인 타입
export interface Campaign {
  id: string;
  name: string;
  status: string;
  adAccountId: string;
  objective: string;
  budget: number;
  dailyBudget?: number;
  createdAt: string;
  updatedAt: string;
}

// 광고 그룹 타입
export interface AdGroup {
  id: string;
  name: string;
  status: string;
  adAccountId: string;
  campaignId: string;
  bidStrategy: string;
  budget: number;
  dailyBudget?: number;
  createdAt: string;
  updatedAt: string;
}

// 키워드 타입
export interface Keyword {
  id: string;
  keyword: string;
  adGroupId: string;
  bid: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 리포트 기본 메트릭 타입
export interface BasicMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cost: number;
}

// 전환 메트릭 타입
export interface ConversionMetrics {
  conversions: number;
  conversionRate: number;
  costPerConversion: number;
  conversionValue: number;
  roas: number;
}

// 리포트 데이터 타입
export interface ReportData extends BasicMetrics, ConversionMetrics {
  id: string;
  name?: string;
  date?: string;
  type?: string;
  
  // API 원래 필드 이름들
  imp?: number;
  click?: number;
  spending?: number;
}

// 리포트 응답 타입
export interface ReportResponse {
  data: ReportData[];
  meta: {
    total: number;
    startDate: string;
    endDate: string;
  };
}

// 기간 필터 타입
export interface DateFilter {
  startDate: string;
  endDate: string;
}

// 차트 데이터 타입
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
} 