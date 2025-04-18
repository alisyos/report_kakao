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

// 인증 헤더를 가져오는 함수 추가
const getAuthHeaders = (adAccountId: string) => {
  return {
    'Authorization': `Bearer ${BUSINESS_ACCESS_TOKEN}`,
    'adAccountId': adAccountId
  };
};

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

// 특정 광고 그룹의 키워드 목록 조회
export const getKeywords = async (adAccountId: string, adGroupId: string, campaignId?: string) => {
  try {
    console.log(`키워드 조회 시도: 계정 ID=${adAccountId}, 광고 그룹 ID=${adGroupId}${campaignId ? `, 캠페인 ID=${campaignId}` : ''}`);
    
    // API 호출
    const response = await apiClient({
      method: 'GET',
      url: '/openapi/v1/keywords',
      headers: {
        'adAccountId': adAccountId
      },
      params: {
        adGroupId: adGroupId,
        ...(campaignId && { campaignId: campaignId }),
        size: 100 // 더 많은 키워드를 검색하기 위한 파라미터
      }
    });
    
    console.log('키워드 조회 응답 상태:', response.status);
    
    // API 응답 형식 처리 (페이지네이션 응답 또는 직접 배열)
    let keywords = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.content || []);
    
    // 키워드 데이터가 유효한지 확인
    if (keywords && keywords.length > 0) {
      console.log(`키워드 데이터 ${keywords.length}개 수신 성공`);
      
      // 키워드 정보 구조 확인 및 매핑
      const processedKeywords = keywords.map((keyword: any) => {
        // 키워드 텍스트가 keyword 혹은 text 필드에 있는지 확인
        const keywordText = keyword.keyword || keyword.text || `키워드 ${keyword.id}`;
        
        return {
          id: keyword.id,
          text: keywordText,
          keyword: keywordText, // 두 필드를 모두 설정하여 일관성 확보
          adGroupId: keyword.adGroupId || adGroupId,
          campaignId: keyword.campaignId || campaignId,
          status: keyword.status || 'UNKNOWN'
        };
      });
      
      console.log(`처리된 키워드 첫 2개 샘플:`, JSON.stringify(processedKeywords.slice(0, 2)));
      return { data: processedKeywords };
    } else {
      console.log('유효한 키워드 데이터가 없습니다.');
      return { data: [] };
    }
  } catch (error: any) {
    console.error('키워드 조회 오류:', error.response?.status, error.response?.data || error.message);
    
    // 테스트 데이터 반환
    const testKeywords = Array.from({ length: 10 }, (_, i) => ({
      id: `test-keyword-${i+1}`,
      text: `테스트 키워드 ${i+1}`,
      keyword: `테스트 키워드 ${i+1}`,
      adGroupId: adGroupId,
      campaignId: campaignId || 'unknown',
      status: 'ACTIVE'
    }));
    
    console.log('테스트 키워드 데이터 사용:', testKeywords.length);
    return { data: testKeywords };
  }
};

// 리포트 데이터 조회 (전체 계정 성과)
export const getAccountReport = async (
  adAccountId: string,
  startDate: string,
  endDate: string,
  metricsGroups: string[] = ['BASIC'],  // 계정 리포트는 BASIC만 지원
  timeUnit: string = 'DAY'  // 기본값으로 일단위 설정
) => {
  try {
    // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
    const start = startDate.replace(/-/g, '');
    const end = endDate.replace(/-/g, '');

    console.log('계정 리포트 조회 시도:', adAccountId, startDate, endDate, metricsGroups, timeUnit);
    
    // 요청 파라미터 구성 - 가장 기본적인 필수 파라미터만 유지
    const params: any = {
      start,
      end,
      metricsGroups: metricsGroups.join(',') // 문자열로 변환
    };
    
    // timeUnit 파라미터만 추가 (dimension 제거)
    if (timeUnit && timeUnit !== 'NONE') {
      params.timeUnit = timeUnit;
    }
    
    console.log('계정 리포트 요청 파라미터:', params);
    
    // 문서에 맞게 GET 메서드와 경로 수정
    // axios는 params 객체를 사용하면 자동으로 URL 쿼리 파라미터로 변환
    const response = await apiClient({
      method: 'GET',
      url: '/openapi/v1/adAccounts/report',
      headers: {
        'adAccountId': adAccountId
      },
      params: params
    });
    
    console.log('계정 리포트 응답 상태:', response.status);
    console.log('계정 리포트 응답 데이터:', JSON.stringify(response.data).substring(0, 500) + '...');
    
    // 응답 매핑 처리
    const reportItems = response.data?.data || [];
    console.log('계정 리포트 세부 데이터:', JSON.stringify(reportItems.slice(0, 2)));
    
    // 응용 프로그램에서 사용하는 형식으로 변환
    const formattedData = reportItems.map((item: any) => {
      const dimensions = item.dimensions || {};
      // 날짜 정보를 추출하는 방식 개선
      // API 응답에 따라 날짜 필드가 다를 수 있음
      const reportDate = dimensions.date || item.start || '';
      
      const metrics = item.metrics || {};
      
      // 디버깅용: 각 아이템의 구조 확인
      console.log('리포트 항목 처리:', { 
        date: reportDate, 
        metrics: JSON.stringify(metrics),
        imp: metrics.imp,
        click: metrics.click,
        spending: metrics.spending
      });
      
      // API에서 받은 값을 정확하게 반환하도록 함
      return {
        id: reportDate ? `account-${reportDate}` : adAccountId,
        name: reportDate || `계정 레포트`,
        date: reportDate,
        accountId: adAccountId,
        
        // 원본 필드 이름과 값 유지
        imp: metrics.imp ? parseInt(metrics.imp) : 0,
        click: metrics.click ? parseInt(metrics.click) : 0,
        spending: metrics.spending ? parseInt(metrics.spending) : 0,
        
        // 기존 필드 이름으로도 변환해서 제공 
        impressions: metrics.imp ? parseInt(metrics.imp) : 0,
        clicks: metrics.click ? parseInt(metrics.click) : 0,
        ctr: metrics.imp && metrics.click ? (parseInt(metrics.click) / parseInt(metrics.imp)) : 0,
        cpc: metrics.click && metrics.spending ? (parseInt(metrics.spending) / parseInt(metrics.click)) : 0,
        cost: metrics.spending ? parseInt(metrics.spending) : 0,
        
        // 전환 관련 필드
        conversions: 0,
        conversionRate: 0,
        costPerConversion: 0,
        conversionValue: 0,
        roas: 0
      };
    });
    
    console.log('계정 리포트 최종 데이터 개수:', formattedData.length);
    return { data: formattedData };
  } catch (error: any) {
    console.error('계정 리포트 조회 오류:', error.response?.status, error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    const testData = [];
    // 날짜 기반 테스트 데이터 생성
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const dayDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(dayDiff, 10); i++) {
      const date = new Date(startDateObj);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      testData.push({
        id: `account-${dateStr}`,
        name: dateStr,
        date: dateStr,
        accountId: adAccountId,
        impressions: 123456 * (i + 1) * 0.9,
        clicks: 5678 * (i + 1) * 0.85,
        ctr: 0.046,
        cpc: 0,  // BASIC 지표에 없음
        cost: 3295000 * (i + 1) * 0.8,
        conversions: 0,  // BASIC 지표에 없음
        conversionRate: 0,  // BASIC 지표에 없음
        costPerConversion: 0,  // BASIC 지표에 없음
        conversionValue: 0,  // BASIC 지표에 없음
        roas: 0  // BASIC 지표에 없음
      });
    }
    
    return { data: testData };
  }
};

// 캠페인별 리포트 데이터 조회
export const getCampaignReport = async (
  adAccountId: string,
  campaignIds: string[],
  startDate: string,
  endDate: string,
  metricsGroups: string[] = ['BASIC', 'CONVERSION_TRACKING'],
  timeUnit: string = 'DAY'  // 기본값으로 일단위 설정
) => {
  try {
    // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
    const start = startDate.replace(/-/g, '');
    const end = endDate.replace(/-/g, '');
    
    console.log('캠페인 리포트 조회 시도:', adAccountId, campaignIds, startDate, endDate, timeUnit, metricsGroups);
    
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
    
    // 요청 파라미터 구성
    const params: any = {
      start,
      end,
      metricsGroups: metricsGroups.join(',') // 문자열로 변환
    };
    
    // 날짜별 데이터가 필요한 경우에만 timeUnit만 추가(dimension 제거)
    if (timeUnit !== 'NONE') {
      params.timeUnit = timeUnit;
    }
    
    // 캠페인 ID를 쿼리 파라미터로 추가 (선택 사항)
    if (campaignIds && campaignIds.length > 0) {
      params.campaignIds = campaignIds.join(','); // 모든 캠페인 ID를 콤마로 구분하여 넣기
    }
    
    console.log('캠페인 리포트 요청 파라미터:', params);
    
    // 문서에 맞게 GET 메서드와 경로 수정
    const response = await apiClient({
      method: 'GET',
      url: '/openapi/v1/campaigns/report',
      headers: {
        'adAccountId': adAccountId
      },
      params: params
    });
    
    console.log('캠페인 리포트 응답 상태:', response.status);
    console.log('캠페인 리포트 응답 데이터:', JSON.stringify(response.data).substring(0, 500) + '...');
    
    // 응답 매핑 처리
    const reportItems = response.data?.data || [];
    console.log('캠페인 리포트 세부 데이터:', JSON.stringify(reportItems.slice(0, 2)));
    
    // 응용 프로그램에서 사용하는 형식으로 변환
    const formattedData = reportItems.map((item: any) => {
      const dimensions = item.dimensions || {};
      const metrics = item.metrics || {};
      const campaignId = dimensions.campaignId || 'unknown';
      const reportDate = dimensions.date || item.start || '';
      
      // 리포트 항목 로깅 - 계정 리포트와 동일한 방식으로 로그 출력
      console.log('리포트 항목 처리:', { 
        date: reportDate, 
        metrics: JSON.stringify(metrics),
        imp: metrics.imp,
        click: metrics.click,
        spending: metrics.spending
      });
      
      return {
        id: reportDate ? `${campaignId}-${reportDate}` : campaignId,
        name: reportDate || campaignNamesMap[campaignId] || `캠페인 ${campaignId}`,
        date: reportDate,
        campaignName: campaignNamesMap[campaignId] || `캠페인 ${campaignId}`,
        // API 원본 필드 이름과 값 유지 - 계정 리포트와 동일하게
        imp: metrics.imp ? parseInt(metrics.imp) : 0,
        click: metrics.click ? parseInt(metrics.click) : 0,
        spending: metrics.spending ? parseInt(metrics.spending) : 0,
        
        // 다른 필드도 유지
        impressions: metrics.imp ? parseInt(metrics.imp) : 0,
        clicks: metrics.click ? parseInt(metrics.click) : 0,
        ctr: (metrics.ctr || 0) / 100,
        cpc: metrics.ppc || 0,
        cost: metrics.spending ? parseInt(metrics.spending) : 0,
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
    
    console.log('캠페인 리포트 최종 데이터 개수:', formattedData.length);
    return { data: formattedData };
  } catch (error: any) {
    console.error('캠페인 리포트 조회 오류:', error.response?.status, error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    const testData = campaignIds.map((id, index) => {
      const multiplier = index + 1;
      // 테스트 데이터에도 날짜 추가
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      return {
        id: `${id}-${dateStr}`,
        name: dateStr,
        date: dateStr,
        campaignName: `테스트 캠페인 ${index + 1}`,
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

// 광고 그룹별 리포트 데이터 조회
export const getAdGroupReport = async (
  adAccountId: string,
  adGroupIds: string[],
  startDate: string,
  endDate: string,
  metricsGroups: string[] = ['BASIC', 'CONVERSION_TRACKING'],
  timeUnit: string = 'DAY',
  campaignId?: string
) => {
  try {
    // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
    const start = startDate.replace(/-/g, '');
    const end = endDate.replace(/-/g, '');
    
    console.log('광고 그룹 리포트 조회 시도:', adAccountId, adGroupIds, startDate, endDate, metricsGroups, timeUnit, campaignId);
    
    // campaignId가 필수이므로 확인
    if (!campaignId) {
      console.error('광고 그룹 리포트 오류: 캠페인 ID가 없습니다.');
      throw new Error('캠페인 ID가 필요합니다. 캠페인을 먼저 선택해주세요.');
    }
    
    // 요청 파라미터 구성 - 계정 리포트와 동일한 방식으로
    const params: any = {
      start,
      end,
      metricsGroups: metricsGroups.join(','), // 문자열로 변환
      campaignId // 필수 파라미터
    };
    
    // 날짜별 데이터가 필요한 경우에만 timeUnit만 추가
    if (timeUnit && timeUnit !== 'NONE') {
      params.timeUnit = timeUnit;
    }
    
    // 광고 그룹 ID를 쿼리 파라미터로 추가할 필요가 있다면
    if (adGroupIds && adGroupIds.length > 0) {
      params.adGroupIds = adGroupIds.join(','); // 모든 광고 그룹 ID를 콤마로 구분하여 넣기
    }
    
    console.log('광고 그룹 리포트 요청 파라미터:', params);
    
    // API 호출 - 계정 리포트와 유사하게 구성
    const response = await apiClient({
      method: 'GET',
      url: '/openapi/v1/adGroups/report',
      headers: {
        'adAccountId': adAccountId
      },
      params: params
    });
    
    console.log('광고 그룹 리포트 응답 상태:', response.status);
    console.log('광고 그룹 리포트 응답 데이터:', JSON.stringify(response.data).substring(0, 500) + '...');
    
    // 응답 매핑 처리
    const reportItems = response.data?.data || [];
    console.log('광고 그룹 리포트 원본 데이터 개수:', reportItems.length);
    if (reportItems.length > 0) {
      console.log('광고 그룹 리포트 첫 번째 항목:', JSON.stringify(reportItems[0]));
    }
    
    // adGroupIds로 필터링
    let filteredItems = reportItems;
    if (adGroupIds && adGroupIds.length > 0) {
      const adGroupIdSet = new Set(adGroupIds.map(id => String(id)));
      console.log(`필터링할 광고 그룹 ID: ${Array.from(adGroupIdSet).join(', ')}`);
      
      filteredItems = reportItems.filter((item: any) => {
        const dimensions = item.dimensions || {};
        const adGroupId = dimensions.adGroupId ? String(dimensions.adGroupId) : '';
        const isIncluded = adGroupIdSet.has(adGroupId);
        
        if (!isIncluded) {
          console.log(`광고 그룹 필터링: ${adGroupId} (일치하지 않음)`);
        }
        
        return isIncluded;
      });
      
      console.log(`필터링 후 광고 그룹 리포트 데이터: ${filteredItems.length}개`);
    }
    
    // 이름 매핑을 위해 광고 그룹 데이터 조회 (필요한 경우에만)
    let adGroupNamesMap: Record<string, string> = {};
    try {
      const adGroupsResponse = await apiClient.get('/openapi/v1/adGroups', {
        headers: {
          'adAccountId': adAccountId
        },
        params: {
          campaignId // 캠페인 ID로 필터링
        }
      });
      
      const adGroups = Array.isArray(adGroupsResponse.data) 
        ? adGroupsResponse.data 
        : (adGroupsResponse.data?.content || []);
      
      // 광고 그룹 ID를 키로, 이름을 값으로 하는 매핑 생성
      adGroups.forEach((adGroup: any) => {
        adGroupNamesMap[adGroup.id] = adGroup.name;
      });
    } catch (error) {
      console.warn('광고 그룹 정보 조회 실패 (이름 매핑 불가):', error);
    }
    
    // 응용 프로그램에서 사용하는 형식으로 변환
    const formattedData = filteredItems.map((item: any) => {
      const dimensions = item.dimensions || {};
      const metrics = item.metrics || {};
      const adGroupId = dimensions.adGroupId || 'unknown';
      const reportDate = dimensions.date || item.start || '';
      
      // 리포트 항목 로깅
      console.log('리포트 항목 처리:', { 
        date: reportDate, 
        metrics: JSON.stringify(metrics),
        imp: metrics.imp,
        click: metrics.click,
        spending: metrics.spending
      });
      
      return {
        id: reportDate ? `${adGroupId}-${reportDate}` : adGroupId,
        name: reportDate || adGroupNamesMap[adGroupId] || `광고 그룹 ${adGroupId}`,
        date: reportDate,
        adGroupId: adGroupId,
        adGroupName: adGroupNamesMap[adGroupId] || `광고 그룹 ${adGroupId}`,
        campaignId: campaignId,
        
        // API 원본 필드 이름과 값 유지
        imp: metrics.imp ? parseInt(metrics.imp) : 0,
        click: metrics.click ? parseInt(metrics.click) : 0,
        spending: metrics.spending ? (typeof metrics.spending === 'string' ? parseFloat(metrics.spending) : metrics.spending) : 0,
        
        // 다른 필드도 유지
        impressions: metrics.imp ? parseInt(metrics.imp) : 0,
        clicks: metrics.click ? parseInt(metrics.click) : 0,
        ctr: (metrics.ctr || 0) / 100,
        cpc: metrics.ppc || 0,
        cost: metrics.spending ? (typeof metrics.spending === 'string' ? parseFloat(metrics.spending) : metrics.spending) : 0,
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
    
    console.log('광고 그룹 리포트 최종 데이터 개수:', formattedData.length);
    return { data: formattedData };
  } catch (error: any) {
    console.error('광고 그룹 리포트 조회 오류:', error.response?.status, error.response?.data || error.message);
    // 임시 테스트 데이터 반환
    const testData = adGroupIds.map((id, index) => {
      const multiplier = index + 1;
      // 테스트 데이터에도 날짜 추가
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      return {
        id: `${id}-${dateStr}`,
        name: dateStr,
        date: dateStr,
        adGroupId: id,
        adGroupName: `테스트 광고 그룹 ${index + 1}`,
        campaignId: campaignId || '',
        imp: 25000 * multiplier,
        click: 1200 * multiplier,
        spending: 720000 * multiplier,
        impressions: 25000 * multiplier,
        clicks: 1200 * multiplier,
        ctr: 0.048 * multiplier,
        cpc: 600 - (index * 30),
        cost: 720000 * multiplier,
        conversions: 80 * multiplier,
        conversionRate: 0.066 * multiplier,
        costPerConversion: 9000 - (index * 800),
        conversionValue: 9600000 * multiplier,
        roas: 13.3 + (index * 0.4)
      };
    });
    
    return { data: testData };
  }
};

// 리포트 데이터 형식화 함수
function formatReportData(data: any, keywordNamesMap: Record<string, string>) {
  try {
    // 응답 매핑 처리
    const reportItems = data?.data || [];
    console.log('리포트 세부 데이터:', JSON.stringify(reportItems.slice(0, 2)));
    
    // 응용 프로그램에서 사용하는 형식으로 변환
    const formattedData = reportItems.map((item: any) => {
      // 원본 API 응답 로깅
      console.log('리포트 아이템 원본:', JSON.stringify(item));
      
      const dimensions = item.dimensions || {};
      const metrics = item.metrics || {};
      
      // 메트릭 데이터 로깅
      console.log('리포트 아이템 메트릭:', JSON.stringify(metrics));
      
      const keywordId = dimensions.keywordId || '';
      // 날짜 정보 추출
      const reportDate = dimensions.date || item.start || '';
      
      console.log(`키워드 ID: ${keywordId}, 날짜: ${reportDate}, 노출: ${metrics.imp}, 클릭: ${metrics.click}`);
      
      return {
        id: reportDate ? `${keywordId}-${reportDate}` : keywordId,
        name: keywordNamesMap[keywordId] || `키워드 ${keywordId}`,
        date: reportDate,
        keywordName: keywordNamesMap[keywordId] || `키워드 ${keywordId}`,
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
    
    console.log(`변환된 데이터 개수: ${formattedData.length}`);
    return { data: formattedData };
  } catch (error) {
    console.error('데이터 형식화 오류:', error);
    return { data: [] };
  }
}

// 테스트 키워드 리포트 데이터 생성 함수
function getTestKeywordReport(keywordIds: string[], startDate: string, endDate: string) {
  const testData = keywordIds.map((id, index) => {
    const multiplier = (index % 3) + 1;
    // 테스트 데이터에도 날짜 추가
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];
    
    return {
      id: `${id}-${dateStr}`,
      name: dateStr,
      date: dateStr,
      keywordName: `테스트 키워드 ${index + 1}`,
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

// 키워드별 리포트 데이터 조회
export async function getKeywordReport(
  adAccountId: string,
  keywordIds: string[],
  startDate: string,
  endDate: string,
  metricsGroups: string[] = ['BASIC'],
  timeUnit: string = 'DAY',
  campaignId?: string,
  adGroupId?: string
): Promise<any> {
  try {
    console.log('키워드 리포트 요청:', { adAccountId, keywordIds, startDate, endDate, metricsGroups, timeUnit, campaignId, adGroupId });
    
    if (!keywordIds || keywordIds.length === 0) {
      throw new Error('키워드 ID가 제공되지 않았습니다.');
    }
    
    if (!campaignId) {
      throw new Error('캠페인 ID는 키워드 리포트 조회에 필수 파라미터입니다.');
    }
    
    // 날짜 형식 변환 (YYYY-MM-DD → YYYYMMDD)
    const formattedStartDate = startDate.replace(/-/g, '');
    const formattedEndDate = endDate.replace(/-/g, '');
    
    // 인증 헤더 가져오기
    const headers = getAuthHeaders(adAccountId);
    
    // 키워드 정보 가져오기 시도
    const keywordNamesMap: Record<string, string> = {};
    try {
      if (keywordIds.length > 0) {
        console.log('키워드 정보 조회 시도:', keywordIds);
        
        // API 호출하여 키워드 정보 가져오기
        const keywordResponse = await apiClient({
          method: 'GET',
          url: '/openapi/v1/keywords',
          headers: headers,
          params: {
            keywordIds: keywordIds.join(','),
            campaignId,
            adGroupId
          }
        });
        
        const keywordData = Array.isArray(keywordResponse.data) 
          ? keywordResponse.data 
          : (keywordResponse.data?.content || []);
        
        console.log('키워드 정보 조회 성공:', keywordData);
        
        // 키워드 ID → 텍스트 매핑 생성
        keywordData.forEach((keyword: any) => {
          if (keyword.id) {
            keywordNamesMap[keyword.id] = keyword.keyword || keyword.text || `키워드 ${keyword.id}`;
          }
        });
        
        console.log('키워드 이름 매핑:', keywordNamesMap);
      }
    } catch (error) {
      console.error('키워드 정보 조회 중 오류:', error);
    }
    
    // 요청 파라미터 구성
    const params: any = {
      campaignId: campaignId, // 필수 파라미터
      start: formattedStartDate,
      end: formattedEndDate,
      metricsGroups: metricsGroups.join(',')
    };
    
    // 키워드 ID 파라미터 추가
    if (keywordIds && keywordIds.length > 0) {
      params.keywordIds = keywordIds.join(',');
    }
    
    // 광고 그룹 ID 추가 (선택 사항)
    if (adGroupId) {
      params.adGroupId = adGroupId;
    }
    
    // 날짜별 데이터가 필요한 경우에만 timeUnit 추가
    if (timeUnit !== 'NONE') {
      params.timeUnit = timeUnit;
    }
    
    console.log('키워드 리포트 API 요청 파라미터:', params);
    
    // 키워드 리포트 API 호출
    const response = await apiClient({
      method: 'GET',
      url: '/openapi/v1/keywords/report',
      headers: headers,
      params: params
    });
    
    console.log('키워드 리포트 API 응답 상태:', response.status);
    
    if (response.status >= 200 && response.status < 300) {
      const data = response.data;
      console.log('키워드 리포트 API 응답:', JSON.stringify(data).substring(0, 200) + '...');
      
      // 응답 데이터 형식화
      const formattedData = formatKeywordReportData(data, keywordNamesMap, keywordIds);
      console.log('최종 키워드 리포트 데이터:', JSON.stringify(formattedData).substring(0, 200) + '...');
      return formattedData;
    } else {
      throw new Error(`키워드 리포트 API 오류: ${response.status}`);
    }
  } catch (error) {
    console.error('키워드 리포트 가져오기 오류:', error);
    // 에러 발생 시 테스트 데이터 반환
    return getTestKeywordReport(keywordIds, startDate, endDate);
  }
}

// 키워드 리포트 데이터 형식화 함수
function formatKeywordReportData(data: any, keywordNamesMap: Record<string, string>, keywordIds: string[]) {
  try {
    // 응답 매핑 처리
    const reportItems = data?.data || [];
    console.log('키워드 리포트 원본 데이터 개수:', reportItems.length);
    if (reportItems.length > 0) {
      console.log('리포트 아이템 첫번째 샘플:', JSON.stringify(reportItems[0]));
    }
    
    // 결과 데이터가 없는 경우, 요청한 키워드 ID에 맞는 빈 결과 생성
    if (reportItems.length === 0) {
      console.log('키워드 리포트 데이터가 없습니다. 빈 결과를 생성합니다.');
      const emptyResults = keywordIds.map(keywordId => ({
        id: keywordId,
        keywordId: keywordId,
        name: keywordNamesMap[keywordId] || `키워드 ${keywordId}`,
        keywordName: keywordNamesMap[keywordId] || `키워드 ${keywordId}`,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        cost: 0,
        conversions: 0,
        conversionRate: 0,
        costPerConversion: 0,
        conversionValue: 0,
        roas: 0
      }));
      
      return { 
        data: emptyResults,
        keywordNamesMap: keywordNamesMap
      };
    }
    
    // 응용 프로그램에서 사용하는 형식으로 변환
    const formattedData = reportItems.map((item: any) => {
      const dimensions = item.dimensions || {};
      const metrics = item.metrics || {};
      
      // 키워드 ID 추출 - API 가이드에 따라 dimensions.keywordId 필드 사용
      let keywordId = dimensions.keywordId || '';
      
      // ID에서 날짜 부분 제거 (있는 경우)
      if (!keywordId && item.id && item.id.includes('-')) {
        keywordId = item.id.split('-')[0];
      }
      
      // 날짜 정보 추출
      const reportDate = dimensions.date || item.date || item.start || '';
      
      // 각 지표 확인 및 로깅
      console.log(`리포트 항목 처리: ID=${keywordId}, 날짜=${reportDate}, 노출=${metrics.imp}, 클릭=${metrics.click}`);
      
      return {
        id: reportDate ? `${keywordId}-${reportDate}` : keywordId,
        name: keywordNamesMap[keywordId] || `키워드 ${keywordId}`,
        date: reportDate,
        keywordId: keywordId,
        keywordName: keywordNamesMap[keywordId] || `키워드 ${keywordId}`,
        
        // API 응답 필드 매핑 (카카오 API 가이드 기준)
        imp: metrics.imp ? parseInt(metrics.imp) : 0,
        click: metrics.click ? parseInt(metrics.click) : 0,
        ctr: metrics.ctr ? parseFloat(metrics.ctr) / 100 : 0, // API 응답 CTR은 백분율
        ppc: metrics.ppc || 0, // 평균 클릭당 비용
        spending: metrics.spending ? parseFloat(metrics.spending) : 0,
        
        // 애플리케이션 내부 사용 필드 (기존 필드명과 호환)
        impressions: metrics.imp ? parseInt(metrics.imp) : 0,
        clicks: metrics.click ? parseInt(metrics.click) : 0,
        cpc: metrics.ppc || 0, // ppc 필드 사용
        cost: metrics.spending ? parseFloat(metrics.spending) : 0,
        
        // 전환 관련 필드 (필드명 매핑)
        conversions: metrics.convPurchase1d || 0, // 1일 전환 사용
        conversionRate: (metrics.convPurchase1d && metrics.click) ? 
                      (parseInt(metrics.convPurchase1d) / parseInt(metrics.click)) : 0,
        costPerConversion: (metrics.convPurchase1d && metrics.spending) ? 
                         (parseFloat(metrics.spending) / parseInt(metrics.convPurchase1d)) : 0,
        conversionValue: metrics.convPurchaseP1d || 0, // 1일 전환 금액 사용
        roas: (metrics.convPurchaseP1d && metrics.spending) ?
             (parseFloat(metrics.convPurchaseP1d) / parseFloat(metrics.spending)) * 100 : 0
      };
    });
    
    console.log(`키워드 리포트 최종 데이터 개수: ${formattedData.length}`);
    return { 
      data: formattedData,
      keywordNamesMap: keywordNamesMap // 키워드 이름 매핑도 함께 반환
    };
  } catch (error) {
    console.error('키워드 리포트 데이터 형식화 오류:', error);
    return { data: [] };
  }
}

export default {
  getAdAccounts,
  getCampaigns,
  getAdGroups,
  getKeywords,
  getAccountReport,
  getCampaignReport,
  getAdGroupReport,
  getKeywordReport,
}; 