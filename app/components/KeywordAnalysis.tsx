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
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 광고 계정 목록 조회
  useEffect(() => {
    const fetchAdAccounts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/kakao?endpoint=adAccounts');
        const accounts = response.data;
        setAdAccounts(accounts.data || []);
        
        if (accounts.data && accounts.data.length > 0) {
          setSelectedAccountId(accounts.data[0].id);
        }
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
        
        if (validCampaigns.length > 0) {
          const firstCampaignId = validCampaigns[0].id;
          console.log('첫번째 캠페인 ID 설정:', firstCampaignId);
          setSelectedCampaignId(firstCampaignId);
        }
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
        
        if (result.data && result.data.length > 0) {
          setSelectedAdGroupId(result.data[0].id);
        }
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
        
        const response = await axios.get(`/api/kakao?endpoint=keywords&adAccountId=${selectedAccountId}&adGroupId=${selectedAdGroupId}`);
        const result = response.data;
        setKeywords(result.data || []);
        
        if (result.data && result.data.length > 0) {
          // 키워드 리포트 조회
          const keywordIds = result.data.map((keyword: any) => keyword.id);
          const keywordReportResponse = await axios.post('/api/kakao', {
            endpoint: 'keywordReport',
            adAccountId: selectedAccountId,
            keywordIds,
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate
          });
          const keywordReport = keywordReportResponse.data;
          
          // 키워드 이름 매핑
          const keywordMap = result.data.reduce((acc: any, keyword: any) => {
            acc[keyword.id] = keyword.keyword;
            return acc;
          }, {});
          
          const reportWithNames = (keywordReport.data || []).map((item: any) => ({
            ...item,
            name: keywordMap[item.id] || item.id
          }));
          
          setKeywordReportData(reportWithNames);
        }
      } catch (err: any) {
        setError(err.message || '키워드를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, [selectedAccountId, selectedAdGroupId, dateFilter]);

  // 키워드 필터링
  const filteredKeywordData = keywordReportData.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 클릭 차트 데이터 준비 (상위 10개)
  const prepareClicksChartData = (): ChartData => {
    const sortedData = [...filteredKeywordData].sort((a, b) => b.clicks - a.clicks).slice(0, 10);
    return {
      labels: sortedData.map(item => item.name || ''),
      datasets: [
        {
          label: '클릭수',
          data: sortedData.map(item => item.clicks),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    };
  };

  // CTR 차트 데이터 준비 (상위 10개)
  const prepareCtrChartData = (): ChartData => {
    const sortedData = [...filteredKeywordData].sort((a, b) => b.ctr - a.ctr).slice(0, 10);
    return {
      labels: sortedData.map(item => item.name || ''),
      datasets: [
        {
          label: 'CTR (%)',
          data: sortedData.map(item => item.ctr * 100),
          backgroundColor: 'rgba(255, 205, 86, 0.5)',
          borderColor: 'rgb(255, 205, 86)',
          borderWidth: 1
        }
      ]
    };
  };

  // 전환율 차트 데이터 준비 (상위 10개)
  const prepareConversionRateChartData = (): ChartData => {
    const sortedData = [...filteredKeywordData]
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);
    return {
      labels: sortedData.map(item => item.name || ''),
      datasets: [
        {
          label: '전환율 (%)',
          data: sortedData.map(item => item.conversionRate * 100),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
  };

  return (
    <div className="container mx-auto p-4 max-w-screen-xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">키워드 분석</h1>
      
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
            <label htmlFor="keyword-search" className="block text-sm font-medium text-gray-700 mb-1">
              키워드 검색
            </label>
            <input
              id="keyword-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="키워드 검색..."
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <DateRangePicker
            onChange={setDateFilter}
            initialStartDate={dateFilter.startDate}
            initialEndDate={dateFilter.endDate}
          />
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

      {!loading && !error && filteredKeywordData.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">클릭수 상위 키워드</h3>
              <ReportChart type="bar" data={prepareClicksChartData()} height={300} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">CTR 상위 키워드</h3>
              <ReportChart type="bar" data={prepareCtrChartData()} height={300} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">전환율 상위 키워드</h3>
              <ReportChart type="bar" data={prepareConversionRateChartData()} height={300} />
            </div>
          </div>

          <div className="mb-8">
            <ReportTable data={filteredKeywordData} title="키워드별 상세 성과" />
          </div>
        </>
      )}

      {!loading && !error && filteredKeywordData.length === 0 && keywords.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            선택한 기간 동안 키워드 성과 데이터가 없습니다. 다른 기간을 선택하거나 다른 광고 그룹을 선택해 보세요.
          </p>
        </div>
      )}

      {!loading && !error && (!selectedAdGroupId || keywords.length === 0) && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-blue-700">
            광고 계정, 캠페인, 광고 그룹을 선택하면 키워드 분석 데이터를 확인할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default KeywordAnalysis; 