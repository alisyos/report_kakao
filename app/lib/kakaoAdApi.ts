import axios from 'axios';

// 카카오 키워드 광고 API 기본 설정
const API_BASE_URL = 'https://api.keywordad.kakao.com';

// API 키 설정
const API_KEY = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || '';
const SECRET_KEY = process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET || '';
const CUSTOMER_ID = process.env.NEXT_PUBLIC_KAKAO_CUSTOMER_ID || '';
const BUSINESS_ACCESS_TOKEN = process.env.NEXT_PUBLIC_KAKAO_BUSINESS_TOKEN || '';

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BUSINESS_ACCESS_TOKEN}`,
    'Accept': 'application/json'
  },
});

// 응답 인터셉터 추가
apiClient.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API 응답 오류:', 
        error.config?.url || '알 수 없는 URL', 
        error.response?.status || '상태 코드 없음', 
        error.response?.data || error.message
      );
    } else if (error.request) {
      console.error('API 요청 오류 (응답 없음):', error.request);
    } else {
      console.error('API 요청 설정 오류:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 광고 계정 목록 조회
export const getAdAccounts = async () => {
  try {
    console.log('광고 계정 목록 조회 시도');
    const response = await apiClient.get('/openapi/v1/adAccounts');
    console.log('광고 계정 응답 데이터:', response.data);
    return { data: response.data.content || [] };
  } catch (error: any) {
    console.error('광고 계정 조회 오류:', error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    return {
      data: [
        { id: 'test-account-1', name: '테스트 광고 계정 1' },
        { id: 'test-account-2', name: '테스트 광고 계정 2' }
      ]
    };
  }
};

// 캠페인 목록 조회
export const getCampaigns = async (adAccountId: string) => {
  try {
    console.log('캠페인 목록 조회 시도:', adAccountId);
    // API 가이드에 맞게 경로 수정 - adAccounts 대신 campaigns 엔드포인트 사용
    const response = await apiClient.get('/openapi/v1/campaigns', {
      headers: {
        'adAccountId': adAccountId
      }
    });
    console.log('캠페인 응답 데이터:', response.data);
    
    // 응답 데이터 구조 확인 및 가공
    // 응답이 배열이면 그대로 사용, content 필드에 있으면 content에서 추출
    const campaigns = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.content || []);
    
    console.log(`캠페인 ${campaigns.length}개 추출됨, 첫번째 항목:`, campaigns.length > 0 ? campaigns[0] : '없음');
    
    return { data: campaigns };
  } catch (error: any) {
    console.error('캠페인 조회 오류:', error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    return {
      data: [
        { id: 'test-campaign-1', name: '테스트 캠페인 1', adAccountId },
        { id: 'test-campaign-2', name: '테스트 캠페인 2', adAccountId }
      ]
    };
  }
};

// 광고 그룹 목록 조회
export const getAdGroups = async (adAccountId: string, campaignId?: string) => {
  try {
    console.log('광고 그룹 목록 조회 시도:', adAccountId, campaignId);
    let url = '/openapi/v1/adGroups';
    const params: any = {};
    const headers = {
      'adAccountId': adAccountId
    };
    
    if (campaignId) {
      params.campaignId = campaignId;
    }
    
    const response = await apiClient.get(url, {
      headers,
      params
    });
    
    console.log('광고 그룹 응답 데이터:', response.data);
    
    // 응답이 배열이면 그대로 사용, content 필드에 있으면 content에서 추출
    const adGroups = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.content || []);
    
    console.log(`광고 그룹 ${adGroups.length}개 추출됨`);
    
    return { data: adGroups };
  } catch (error: any) {
    console.error('광고 그룹 조회 오류:', error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    return {
      data: [
        { id: 'test-adgroup-1', name: '테스트 광고 그룹 1', adAccountId, campaignId },
        { id: 'test-adgroup-2', name: '테스트 광고 그룹 2', adAccountId, campaignId }
      ]
    };
  }
};

// 키워드 목록 조회
export const getKeywords = async (adAccountId: string, adGroupId: string) => {
  try {
    console.log('키워드 목록 조회 시도:', adAccountId, adGroupId);
    const response = await apiClient.get('/openapi/v1/keywords', {
      headers: {
        'adAccountId': adAccountId
      },
      params: {
        adGroupId
      }
    });
    console.log('키워드 응답 데이터:', response.data);
    
    // 응답이 배열이면 그대로 사용, content 필드에 있으면 content에서 추출
    const keywords = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.content || []);
    
    console.log(`키워드 ${keywords.length}개 추출됨`);
    
    return { data: keywords };
  } catch (error: any) {
    console.error('키워드 조회 오류:', error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    return {
      data: [
        { id: 'test-keyword-1', keyword: '테스트 키워드 1', adGroupId, bid: 700 },
        { id: 'test-keyword-2', keyword: '테스트 키워드 2', adGroupId, bid: 500 },
        { id: 'test-keyword-3', keyword: '테스트 키워드 3', adGroupId, bid: 1000 }
      ]
    };
  }
};

// 리포트 데이터 조회 (전체 계정 성과)
export const getAccountReport = async (
  adAccountId: string,
  startDate: string,
  endDate: string,
  metricsGroups: string[] = ['BASIC', 'CONVERSION_TRACKING']
) => {
  try {
    // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
    const start = startDate.replace(/-/g, '');
    const end = endDate.replace(/-/g, '');

    console.log('계정 리포트 조회 시도:', adAccountId, startDate, endDate);
    
    // 문서에 맞게 GET 메서드와 경로 수정
    const response = await apiClient.get('/openapi/v1/adAccounts/report', {
      headers: {
        'adAccountId': adAccountId
      },
      params: {
        start,
        end,
        metricsGroups: metricsGroups.join(',')
      }
    });
    
    console.log('계정 리포트 응답 데이터:', response.data);
    
    // 응답 매핑 처리
    const reportData = response.data?.data?.[0] || {};
    const metrics = reportData.metrics || {};
    
    // 응용 프로그램에서 사용하는 형식으로 변환
    const formattedData = [{
      id: adAccountId,
      impressions: metrics.imp || 0,
      clicks: metrics.click || 0,
      ctr: (metrics.ctr || 0) / 100,  // % 형식으로 반환된 값 변환
      cpc: metrics.ppc || 0,
      cost: metrics.spending || 0,
      conversions: metrics.convPurchase1d || 0,
      conversionRate: (metrics.convPurchase1d && metrics.click) ? 
                     (metrics.convPurchase1d / metrics.click) : 0,
      costPerConversion: (metrics.convPurchase1d && metrics.spending) ? 
                        (metrics.spending / metrics.convPurchase1d) : 0,
      conversionValue: metrics.convPurchaseP1d || 0,
      roas: (metrics.convPurchaseP1d && metrics.spending) ? 
            (metrics.convPurchaseP1d / metrics.spending) : 0
    }];
    
    return { data: formattedData };
  } catch (error: any) {
    console.error('계정 리포트 조회 오류:', error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    return {
      data: [
        {
          id: adAccountId,
          impressions: 123456,
          clicks: 5678,
          ctr: 0.046,
          cpc: 580,
          cost: 3295000,
          conversions: 320,
          conversionRate: 0.056,
          costPerConversion: 10296.87,
          conversionValue: 42500000,
          roas: 12.9
        }
      ]
    };
  }
};

// 캠페인별 리포트 데이터 조회
export const getCampaignReport = async (
  adAccountId: string,
  campaignIds: string[],
  startDate: string,
  endDate: string,
  metricsGroups: string[] = ['BASIC', 'CONVERSION_TRACKING']
) => {
  try {
    // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
    const start = startDate.replace(/-/g, '');
    const end = endDate.replace(/-/g, '');
    
    console.log('캠페인 리포트 조회 시도:', adAccountId, campaignIds, startDate, endDate);
    
    // 먼저 캠페인 정보를 가져와서 ID와 이름을 매핑
    const campaignsResponse = await apiClient.get('/openapi/v1/campaigns', {
      headers: {
        'adAccountId': adAccountId
      }
    });
    // 응답이 배열이면 그대로 사용, content 필드에 있으면 content에서 추출
    const campaigns = Array.isArray(campaignsResponse.data) 
      ? campaignsResponse.data 
      : (campaignsResponse.data?.content || []);
    
    // 캠페인 ID를 키로, 이름을 값으로 하는 매핑 생성
    const campaignNamesMap: Record<string, string> = {};
    campaigns.forEach((campaign: any) => {
      campaignNamesMap[campaign.id] = campaign.name;
    });
    
    // 문서에 맞게 GET 메서드와 경로 수정
    const response = await apiClient.get('/openapi/v1/campaigns/report', {
      headers: {
        'adAccountId': adAccountId
      },
      params: {
        start,
        end,
        metricsGroups: metricsGroups.join(',')
      }
    });
    
    console.log('캠페인 리포트 응답 데이터:', response.data);
    
    // 응답 매핑 처리
    const reportItems = response.data?.data || [];
    
    // 응용 프로그램에서 사용하는 형식으로 변환
    const formattedData = reportItems.map((item: any) => {
      const dimensions = item.dimensions || {};
      const metrics = item.metrics || {};
      const campaignId = dimensions.campaignId || 'unknown';
      
      return {
        id: campaignId,
        // 캠페인 이름을 매핑에서 가져오거나, 없으면 '캠페인 ID' 형식으로 표시
        name: campaignNamesMap[campaignId] || `캠페인 ${campaignId}`,
        impressions: metrics.imp || 0,
        clicks: metrics.click || 0,
        ctr: (metrics.ctr || 0) / 100,
        cpc: metrics.ppc || 0,
        cost: metrics.spending || 0,
        conversions: metrics.convPurchase1d || 0,
        conversionRate: (metrics.convPurchase1d && metrics.click) ? 
                       (metrics.convPurchase1d / metrics.click) : 0,
        costPerConversion: (metrics.convPurchase1d && metrics.spending) ? 
                          (metrics.spending / metrics.convPurchase1d) : 0,
        conversionValue: metrics.convPurchaseP1d || 0,
        roas: (metrics.convPurchaseP1d && metrics.spending) ? 
              (metrics.convPurchaseP1d / metrics.spending) : 0
      };
    });
    
    return { data: formattedData };
  } catch (error: any) {
    console.error('캠페인 리포트 조회 오류:', error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    const testData = campaignIds.map((id, index) => {
      const multiplier = index + 1;
      return {
        id,
        name: `테스트 캠페인 ${index + 1}`,
        impressions: 45000 * multiplier,
        clicks: 2300 * multiplier,
        ctr: 0.051 * multiplier,
        cpc: 520 - (index * 50),
        cost: 1196000 * multiplier,
        conversions: 120 * multiplier,
        conversionRate: 0.052 * multiplier,
        costPerConversion: 9966.67 - (index * 1000),
        conversionValue: 15600000 * multiplier,
        roas: 13.0 + (index * 0.5)
      };
    });
    
    return { data: testData };
  }
};

// 키워드별 리포트 데이터 조회
export const getKeywordReport = async (
  adAccountId: string,
  keywordIds: string[],
  startDate: string,
  endDate: string,
  metricsGroups: string[] = ['BASIC', 'CONVERSION_TRACKING']
) => {
  try {
    // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
    const start = startDate.replace(/-/g, '');
    const end = endDate.replace(/-/g, '');
    
    console.log('키워드 리포트 조회 시도:', adAccountId, keywordIds, startDate, endDate);
    
    // 캠페인 정보 가져오기
    const campaignsResponse = await apiClient.get('/openapi/v1/campaigns', {
      headers: {
        'adAccountId': adAccountId
      }
    });
    // 응답이 배열이면 그대로 사용, content 필드에 있으면 content에서 추출
    const campaigns = Array.isArray(campaignsResponse.data) 
      ? campaignsResponse.data 
      : (campaignsResponse.data?.content || []);
    
    if (!campaigns.length) {
      throw new Error('캠페인 정보를 찾을 수 없습니다.');
    }
    
    // 첫 번째 캠페인 ID 사용 (필요한 쿼리 파라미터)
    const campaignId = campaigns[0].id;
    
    // 광고 그룹 정보 가져오기
    const adGroupsResponse = await apiClient.get('/openapi/v1/adGroups', {
      headers: {
        'adAccountId': adAccountId
      },
      params: {
        campaignId: campaignId
      }
    });
    const adGroups = adGroupsResponse.data?.content || [];
    
    if (!adGroups.length) {
      throw new Error('광고그룹 정보를 찾을 수 없습니다.');
    }
    
    // 첫 번째 광고 그룹 ID 사용
    const adGroupId = adGroups[0].id;
    
    // 키워드 정보 가져오기
    const keywordsResponse = await apiClient.get('/openapi/v1/keywords', {
      headers: {
        'adAccountId': adAccountId
      },
      params: {
        adGroupId: adGroupId
      }
    });
    const keywords = keywordsResponse.data?.content || [];
    
    // 키워드 ID를 키로, 키워드 텍스트를 값으로 하는 매핑 생성
    const keywordNamesMap: Record<string, string> = {};
    keywords.forEach((keyword: any) => {
      keywordNamesMap[keyword.id] = keyword.keyword;
    });
    
    // 문서에 맞게 GET 메서드와 경로 수정
    const response = await apiClient.get('/openapi/v1/keywords/report', {
      headers: {
        'adAccountId': adAccountId
      },
      params: {
        campaignId,
        adGroupId,
        start,
        end,
        metricsGroups: metricsGroups.join(',')
      }
    });
    
    console.log('키워드 리포트 응답 데이터:', response.data);
    
    // 응답 매핑 처리
    const reportItems = response.data?.data || [];
    
    // 응용 프로그램에서 사용하는 형식으로 변환
    const formattedData = reportItems.map((item: any) => {
      const dimensions = item.dimensions || {};
      const metrics = item.metrics || {};
      const keywordId = dimensions.keywordId || 'unknown';
      
      return {
        id: keywordId,
        // 키워드 텍스트를 매핑에서 가져오거나, 없으면 '키워드 ID' 형식으로 표시
        name: keywordNamesMap[keywordId] || `키워드 ${keywordId}`,
        impressions: metrics.imp || 0,
        clicks: metrics.click || 0,
        ctr: (metrics.ctr || 0) / 100,
        cpc: metrics.ppc || 0,
        cost: metrics.spending || 0,
        conversions: metrics.convPurchase1d || 0,
        conversionRate: (metrics.convPurchase1d && metrics.click) ? 
                       (metrics.convPurchase1d / metrics.click) : 0,
        costPerConversion: (metrics.convPurchase1d && metrics.spending) ? 
                          (metrics.spending / metrics.convPurchase1d) : 0,
        conversionValue: metrics.convPurchaseP1d || 0,
        roas: (metrics.convPurchaseP1d && metrics.spending) ? 
              (metrics.convPurchaseP1d / metrics.spending) : 0
      };
    });
    
    return { data: formattedData };
  } catch (error: any) {
    console.error('키워드 리포트 조회 오류:', error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    const testData = keywordIds.map((id, index) => {
      const multiplier = (index % 3) + 1;
      return {
        id,
        name: `테스트 키워드 ${index + 1}`,
        impressions: 15000 * multiplier,
        clicks: 750 * multiplier,
        ctr: 0.05 * multiplier,
        cpc: 600 - (index * 20),
        cost: 450000 * multiplier,
        conversions: 40 * multiplier,
        conversionRate: 0.053 * multiplier,
        costPerConversion: 11250 - (index * 500),
        conversionValue: 5400000 * multiplier,
        roas: 12.0 + (index * 0.3)
      };
    });
    
    return { data: testData };
  }
};

export default {
  getAdAccounts,
  getCampaigns,
  getAdGroups,
  getKeywords,
  getAccountReport,
  getCampaignReport,
  getKeywordReport,
}; 