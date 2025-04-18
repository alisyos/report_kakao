'use client';

import { useState, useEffect } from 'react';
import DateRangePicker from './DateRangePicker';
import ReportTable from './ReportTable';
import ReportChart from './ReportChart';
import { DateFilter, ReportData, ChartData } from '../lib/types';
import axios from 'axios';

const KeywordAnalysis = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [adGroups, setAdGroups] = useState<any[]>([]);
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string>('');
  const [keywords, setKeywords] = useState<any[]>([]);
  const [keywordReportData, setKeywordReportData] = useState<ReportData[]>([]);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string>('');
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [generatedLevel, setGeneratedLevel] = useState<'account' | 'campaign' | 'adGroup' | 'keyword' | null>(null);
  const [dateReportData, setDateReportData] = useState<ReportData[]>([]);

  // 광고 계정 목록 조회
  useEffect(() => {
    const fetchAdAccounts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/kakao?endpoint=adAccounts');
        const accounts = response.data;
        setAdAccounts(accounts.data || []);
      } catch (err: any) {
        setError(err.message || '광고 계정을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdAccounts();
  }, []);

  // 선택된 계정의 캠페인 목록 조회
  useEffect(() => {
    if (!selectedAccountId) return;

    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setSelectedCampaignId(''); // 캠페인 ID 초기화
        setSelectedAdGroupId('');
        setAdGroups([]);
        setKeywords([]);
        setKeywordReportData([]);
        
        console.log('캠페인 로드 시작 - 계정 ID:', selectedAccountId);
        const response = await axios.get(`/api/kakao?endpoint=campaigns&adAccountId=${selectedAccountId}`);
        console.log('캠페인 API 응답:', response.data);
        
        // 데이터 구조 확인
        const result = response.data;
        const campaignList = result.data || [];
        console.log('캠페인 목록 데이터:', campaignList);
        
        // 유효한 데이터 필터링 (id와 name이 있는 항목만)
        const validCampaigns = campaignList.filter((camp: any) => camp && camp.id);
        console.log('유효한 캠페인 수:', validCampaigns.length);
        
        setCampaigns(validCampaigns);
      } catch (err: any) {
        console.error('캠페인 로딩 오류:', err);
        setError(err.message || '캠페인을 불러오는 중 오류가 발생했습니다.');
        setCampaigns([]); // 오류 시 빈 배열로 설정
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [selectedAccountId]);

  // 선택된 캠페인의 광고 그룹 목록 조회
  useEffect(() => {
    if (!selectedAccountId || !selectedCampaignId) return;

    console.log('캠페인 ID 변경됨, 광고 그룹 조회 시작:', selectedCampaignId);

    const fetchAdGroups = async () => {
      try {
        setLoading(true);
        setSelectedAdGroupId('');
        setKeywords([]);
        setKeywordReportData([]);
        
        const response = await axios.get(`/api/kakao?endpoint=adGroups&adAccountId=${selectedAccountId}&campaignId=${selectedCampaignId}`);
        const result = response.data;
        setAdGroups(result.data || []);
      } catch (err: any) {
        setError(err.message || '광고 그룹을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdGroups();
  }, [selectedAccountId, selectedCampaignId]);

  // 선택된 광고 그룹의 키워드 목록 조회
  useEffect(() => {
    if (!selectedAccountId || !selectedAdGroupId) return;

    const fetchKeywords = async () => {
      try {
        setLoading(true);
        setKeywordReportData([]);
        setSelectedKeywordId('');
        
        console.log(`키워드 조회 시작 - 계정: ${selectedAccountId}, 광고그룹: ${selectedAdGroupId}, 캠페인: ${selectedCampaignId}`);
        
        // 캠페인 ID도 함께 쿼리 파라미터로 전달
        const response = await axios.get(`/api/kakao?endpoint=keywords&adAccountId=${selectedAccountId}&adGroupId=${selectedAdGroupId}${selectedCampaignId ? `&campaignId=${selectedCampaignId}` : ''}`);
        
        const result = response.data;
        console.log(`키워드 응답 데이터:`, result);
        setKeywords(result.data || []);
        
        if (result.data && result.data.length > 0) {
          // 키워드 리포트 조회
          const keywordIds = result.data.map((keyword: any) => keyword.id);
          console.log('키워드 리포트 요청 - 키워드 ID 목록:', keywordIds);
          
          const keywordReportResponse = await axios.post('/api/kakao', {
            endpoint: 'keywordReport',
            adAccountId: selectedAccountId,
            keywordIds,
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
            campaignId: selectedCampaignId,
            adGroupId: selectedAdGroupId,
            timeUnit: 'DAY',
            metricsGroups: ['BASIC']
          });
          
          console.log('키워드 리포트 응답:', keywordReportResponse.data);
          const keywordReport = keywordReportResponse.data;
          
          // 키워드 이름 매핑
          const keywordMap = result.data.reduce((acc: any, keyword: any) => {
            acc[keyword.id] = keyword.keyword || keyword.text;
            return acc;
          }, {});
          
          // keywordNamesMap이 API 응답에 포함되어 있는 경우 사용
          const apiKeywordMap = keywordReport.keywordNamesMap || {};
          const combinedKeywordMap = { ...keywordMap, ...apiKeywordMap };
          
          console.log('키워드 매핑:', combinedKeywordMap);
          
          const reportWithNames = (keywordReport.data || []).map((item: any) => ({
            ...item,
            name: combinedKeywordMap[item.id] || (item.dimensions && combinedKeywordMap[item.dimensions.keywordId]) || item.id
          }));
          
          console.log('최종 키워드 리포트 데이터:', reportWithNames);
          setKeywordReportData(reportWithNames);
        }
      } catch (err: any) {
        console.error('키워드 데이터 로딩 오류:', err);
        setError(err.message || '키워드를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, [selectedAccountId, selectedAdGroupId, dateFilter, selectedCampaignId]);

  // 키워드 필터링 - 선택된 키워드 ID를 기준으로 필터링
  const filteredKeywordData = selectedKeywordId
    ? keywordReportData.filter(item => {
        const keywordId = item.id?.split('-')[0] || item.id;
        return keywordId === selectedKeywordId;
      })
    : keywordReportData;

  // 리포트 생성 함수
  const generateReport = async () => {
    if (!selectedAccountId) {
      setError('광고 계정을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    let level = 'account';

    try {
      console.log('리포트 생성 시작', {
        adAccountId: selectedAccountId,
        campaignId: selectedCampaignId,
        adGroupId: selectedAdGroupId,
        keywordId: selectedKeywordId,
        dateFilter
      });
      
      // 레벨 결정 - 키워드가 선택된 경우 최우선으로 처리
      if (selectedKeywordId) {
        level = 'keyword';
      } else if (selectedAdGroupId && selectedCampaignId) {
        level = 'adGroup';
      } else if (selectedCampaignId) {
        level = 'campaign';
      } else {
        level = 'account';
      }

      console.log(`선택된 레벨: ${level}`);

      let endpoint = 'accountReport';
      let params: any = {
        adAccountId: selectedAccountId,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        timeUnit: 'DAY',
        metricsGroups: ['BASIC']
      };
      
      // 키워드가 선택된 경우, 키워드 리포트 API 사용 - 최우선
      if (selectedKeywordId) {
        endpoint = 'keywordReport';
        params = {
          adAccountId: selectedAccountId,
          keywordIds: [selectedKeywordId],
          campaignId: selectedCampaignId,
          adGroupId: selectedAdGroupId,
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
          timeUnit: 'DAY',
          metricsGroups: ['BASIC']
        };
        console.log(`키워드 리포트 생성 요청 - 키워드: ${selectedKeywordId}, 캠페인: ${selectedCampaignId}, 광고그룹: ${selectedAdGroupId}`);
      }
      // 광고 그룹이 선택된 경우, 광고 그룹 리포트 API 사용
      else if (selectedAdGroupId && selectedCampaignId) {
        endpoint = 'adGroupReport';
        params = {
          adAccountId: selectedAccountId,
          adGroupIds: [selectedAdGroupId],
          campaignId: selectedCampaignId,
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
          timeUnit: 'DAY',
          metricsGroups: ['BASIC']
        };
        console.log(`광고 그룹 리포트 생성 요청 - 광고 그룹: ${selectedAdGroupId}`);
      }
      // 캠페인이 선택된 경우, 캠페인 리포트 API 사용
      else if (selectedCampaignId) {
        endpoint = 'campaignReport';
        params = {
          adAccountId: selectedAccountId,
          campaignIds: [selectedCampaignId],
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
          timeUnit: 'DAY',
          metricsGroups: ['BASIC']
        };
        console.log(`캠페인 리포트 생성 요청 - 캠페인: ${selectedCampaignId}`);
      } else {
        console.log(`계정 리포트 생성 요청 - 계정: ${selectedAccountId}`);
      }
      
      // API 호출
      console.log(`API 호출: ${endpoint}`, params);
      const response = await axios.post('/api/kakao', {
        endpoint,
        ...params
      });
      
      console.log('API 응답:', response.data);
      
      if (response.data && response.data.data) {
        // API 원본 데이터를 그대로 설정
        let reportData = response.data.data;
        
        // 키워드 리포트일 경우에 선택한 키워드의 데이터만 필터링
        if (endpoint === 'keywordReport' && selectedKeywordId) {
          console.log(`키워드 리포트 필터링 시도 - 선택된 키워드 ID: ${selectedKeywordId}`);
          console.log('키워드 리포트 원본 데이터:', reportData.slice(0, 2));
          
          // 원본 데이터의 구조를 확인하고 필터링
          reportData = reportData.filter((item: any) => {
            // dimensions.keywordId 또는 keywordId를 확인
            const dimensions = item.dimensions || {};
            const keywordId = dimensions.keywordId 
              ? String(dimensions.keywordId) 
              : (item.keywordId 
                  ? String(item.keywordId) 
                  : (item.id 
                      ? String(item.id).split('-')[0] 
                      : ''));
            
            const isMatch = keywordId === selectedKeywordId;
            console.log(`키워드 아이템 검사: ${keywordId} vs ${selectedKeywordId} -> ${isMatch ? '일치' : '불일치'}`);
            return isMatch;
          });
          
          console.log(`필터링 후 키워드 리포트 데이터: ${reportData.length}개 항목`);
        }
        // 광고 그룹 리포트일 경우에만 선택한 광고 그룹의 데이터만 필터링
        else if (endpoint === 'adGroupReport' && selectedAdGroupId) {
          console.log(`광고 그룹 리포트 필터링 시도 - 선택된 광고 그룹 ID: ${selectedAdGroupId}`);
          console.log('광고 그룹 리포트 원본 데이터:', reportData.slice(0, 2));
          
          // 원본 데이터의 구조를 확인하고 필터링
          reportData = reportData.filter((item: any) => {
            // dimensions.adGroupId 또는 adGroupId를 확인
            const dimensions = item.dimensions || {};
            const adGroupId = dimensions.adGroupId ? String(dimensions.adGroupId) : 
                            (item.adGroupId ? String(item.adGroupId) : '');
            
            const isMatch = adGroupId === selectedAdGroupId;
            console.log(`아이템 검사: ${adGroupId} vs ${selectedAdGroupId} -> ${isMatch ? '일치' : '불일치'}`);
            return isMatch;
          });
          
          console.log(`필터링 후 광고 그룹 리포트 데이터: ${reportData.length}개 항목`);
        }
        
        // 데이터가 비어있는지 확인
        if (reportData.length === 0) {
          console.log('경고: 리포트 데이터가 비어 있습니다.');
          setError('선택한 기간에 대한 데이터가 없습니다.');
          setReportGenerated(false);
        } else {
          setDateReportData(reportData);
          
          // 선택된 레벨에 따라 generatedLevel 설정
          setGeneratedLevel(level as 'account' | 'campaign' | 'adGroup' | 'keyword');
          setReportGenerated(true);
        }
      } else {
        setError('리포트 데이터를 불러오는데 실패했습니다.');
        setReportGenerated(false);
      }
    } catch (err: any) {
      console.error('리포트 생성 오류:', err);
      setError(err.message || '리포트를 생성하는 중 오류가 발생했습니다.');
      setReportGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-screen-xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">광고 리포트</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-1">
              광고 계정
            </label>
            <select
              id="account-select"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">광고 계정을 선택하세요</option>
              {adAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="campaign-select" className="block text-sm font-medium text-gray-700 mb-1">
              캠페인
            </label>
            <select
              id="campaign-select"
              value={selectedCampaignId}
              onChange={(e) => {
                console.log('캠페인 선택:', e.target.value);
                setSelectedCampaignId(e.target.value);
              }}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedAccountId}
            >
              <option value="">캠페인을 선택하세요</option>
              {campaigns && campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name || `캠페인 ${campaign.id}`}
                  </option>
                ))
              ) : (
                <option value="" disabled>캠페인이 없습니다</option>
              )}
            </select>
            {campaigns && campaigns.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                {campaigns.length}개의 캠페인이 로드됨
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="adgroup-select" className="block text-sm font-medium text-gray-700 mb-1">
              광고 그룹
            </label>
            <select
              id="adgroup-select"
              value={selectedAdGroupId}
              onChange={(e) => setSelectedAdGroupId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedCampaignId || adGroups.length === 0}
            >
              <option value="">광고 그룹을 선택하세요</option>
              {adGroups.map((adGroup) => (
                <option key={adGroup.id} value={adGroup.id}>
                  {adGroup.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="keyword-select" className="block text-sm font-medium text-gray-700 mb-1">
              키워드
            </label>
            <select
              id="keyword-select"
              value={selectedKeywordId}
              onChange={(e) => setSelectedKeywordId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedAdGroupId || keywords.length === 0}
            >
              <option value="">키워드를 선택하세요</option>
              {keywords.map((keyword) => (
                <option key={keyword.id} value={keyword.id}>
                  {keyword.text || keyword.keyword}
                </option>
              ))}
            </select>
            {keywords.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                {keywords.length}개의 키워드가 로드됨
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <DateRangePicker
              onChange={setDateFilter}
              initialStartDate={dateFilter.startDate}
              initialEndDate={dateFilter.endDate}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={!selectedAccountId || loading}
              className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {loading ? '처리 중...' : '리포트 생성'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {reportGenerated && !loading && !error && (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {(() => {
                  switch(generatedLevel) {
                    case 'account':
                      const accountName = adAccounts.find(a => a.id === selectedAccountId)?.name;
                      return `계정 리포트${accountName ? `: ${accountName}` : ''}`;
                    case 'campaign':
                      const campaignName = campaigns.find(c => c.id === selectedCampaignId)?.name;
                      return `캠페인 리포트${campaignName ? `: ${campaignName}` : ''}`;
                    case 'adGroup':
                      const adGroupName = adGroups.find(g => g.id === selectedAdGroupId)?.name;
                      return `광고 그룹 리포트${adGroupName ? `: ${adGroupName}` : ''}`;
                    case 'keyword':
                      const keywordText = keywords.find(k => k.id === selectedKeywordId)?.text;
                      return `키워드 리포트${keywordText ? `: ${keywordText}` : ''}`;
                    default:
                      return '리포트';
                  }
                })()}
              </h2>
              <div className="mt-2 md:mt-0 text-sm bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-medium">
                데이터 개수: {dateReportData.length}개
              </div>
            </div>
            
            <div className="mb-6">
              <ReportTable data={dateReportData} title="일자별 성과" />
              
              {dateReportData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-700">일자별 추이 그래프</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h4 className="text-base font-medium mb-2 text-gray-700">클릭 & 노출 추이</h4>
                      <ReportChart 
                        data={dateReportData}
                        title="클릭 & 노출 추이"
                        metrics={['impressions', 'clicks']}
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h4 className="text-base font-medium mb-2 text-gray-700">비용 & 전환 추이</h4>
                      <ReportChart 
                        data={dateReportData}
                        title="비용 & 전환 추이"
                        metrics={['cost', 'conversions']}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!loading && !error && !reportGenerated && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-blue-700">
            광고 계정을 선택하고 리포트 생성 버튼을 클릭하면 리포트 데이터를 확인할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default KeywordAnalysis; 