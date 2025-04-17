'use client';

import { useState, useEffect } from 'react';
import DateRangePicker from './DateRangePicker';
import ReportTable from './ReportTable';
import ReportChart from './ReportChart';
import { DateFilter, ReportData, ChartData } from '../lib/types';
import axios from 'axios';

const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [campaignReportData, setCampaignReportData] = useState<ReportData[]>([]);

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

  // 선택된 계정의 리포트 데이터 조회
  useEffect(() => {
    if (!selectedAccountId) return;

    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 계정 레벨 리포트 조회
        const accountReportResponse = await axios.post('/api/kakao', {
          endpoint: 'accountReport',
          adAccountId: selectedAccountId,
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate
        });
        
        if (accountReportResponse.data && accountReportResponse.data.data) {
          setReportData(accountReportResponse.data.data || []);
        } else {
          setReportData([]);
          console.warn('계정 리포트 데이터 형식이 예상과 다릅니다:', accountReportResponse.data);
        }

        // 계정의 캠페인 목록 조회
        const campaignsResponse = await axios.get(`/api/kakao?endpoint=campaigns&adAccountId=${selectedAccountId}`);
        
        let campaigns = [];
        if (campaignsResponse.data && campaignsResponse.data.data) {
          campaigns = campaignsResponse.data.data || [];
        } else {
          console.warn('캠페인 목록 데이터 형식이 예상과 다릅니다:', campaignsResponse.data);
        }
        
        if (campaigns && campaigns.length > 0) {
          try {
            // 캠페인 리포트 조회
            const campaignIds = campaigns.map((campaign: any) => campaign.id);
            const campaignReportResponse = await axios.post('/api/kakao', {
              endpoint: 'campaignReport',
              adAccountId: selectedAccountId,
              campaignIds,
              startDate: dateFilter.startDate,
              endDate: dateFilter.endDate
            });
            
            if (campaignReportResponse.data && campaignReportResponse.data.data) {
              setCampaignReportData(campaignReportResponse.data.data || []);
            } else {
              setCampaignReportData([]);
              console.warn('캠페인 리포트 데이터 형식이 예상과 다릅니다:', campaignReportResponse.data);
            }
          } catch (err: any) {
            console.error('캠페인 리포트 조회 오류:', err);
            setCampaignReportData([]);
            setError(`캠페인 리포트 조회 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
          }
        } else {
          setCampaignReportData([]);
        }
      } catch (err: any) {
        console.error('리포트 데이터 조회 오류:', err);
        setError(err.message || '리포트 데이터를 불러오는 중 오류가 발생했습니다.');
        setReportData([]);
        setCampaignReportData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedAccountId, dateFilter]);

  // 클릭 차트 데이터 준비
  const prepareClicksChartData = (): ChartData => {
    if (!campaignReportData || campaignReportData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: '클릭수',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }
        ]
      };
    }
    
    // 최대 10개 캠페인만 사용
    const topCampaigns = [...campaignReportData]
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10);
    
    return {
      labels: topCampaigns.map(item => item.name || ''),
      datasets: [
        {
          label: '클릭수',
          data: topCampaigns.map(item => item.clicks || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    };
  };

  // 비용 차트 데이터 준비
  const prepareCostChartData = (): ChartData => {
    if (!campaignReportData || campaignReportData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: '비용',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          }
        ]
      };
    }
    
    // 최대 10개 캠페인만 사용
    const topCampaigns = [...campaignReportData]
      .sort((a, b) => (b.cost || 0) - (a.cost || 0))
      .slice(0, 10);
    
    return {
      labels: topCampaigns.map(item => item.name || ''),
      datasets: [
        {
          label: '비용',
          data: topCampaigns.map(item => item.cost || 0),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    };
  };

  // 전환 차트 데이터 준비
  const prepareConversionChartData = (): ChartData => {
    if (!campaignReportData || campaignReportData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: '전환수',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          }
        ]
      };
    }
    
    // 최대 10개 캠페인만 사용
    const topCampaigns = [...campaignReportData]
      .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
      .slice(0, 10);
    
    return {
      labels: topCampaigns.map(item => item.name || ''),
      datasets: [
        {
          label: '전환수',
          data: topCampaigns.map(item => item.conversions || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
  };

  return (
    <div className="container mx-auto p-4 max-w-screen-xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">카카오 광고 성과 대시보드</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/3">
            <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-1">
              광고 계정 선택
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
          
          <div className="w-full md:w-2/3">
            <DateRangePicker
              onChange={setDateFilter}
              initialStartDate={dateFilter.startDate}
              initialEndDate={dateFilter.endDate}
            />
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

      {!loading && !error && reportData.length === 0 && selectedAccountId && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            선택한 기간 동안 리포트 데이터가 없습니다. 다른 기간을 선택해 보세요.
          </p>
        </div>
      )}

      {!loading && !error && !selectedAccountId && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-blue-700">
            광고 계정을 선택하면 성과 데이터를 확인할 수 있습니다.
          </p>
        </div>
      )}

      {!loading && reportData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">총 노출수</h3>
              <p className="text-3xl font-bold text-blue-600">
                {(reportData[0]?.impressions || 0).toLocaleString('ko-KR')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">총 클릭수</h3>
              <p className="text-3xl font-bold text-green-600">
                {(reportData[0]?.clicks || 0).toLocaleString('ko-KR')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">총 비용</h3>
              <p className="text-3xl font-bold text-red-600">
                ₩{(reportData[0]?.cost || 0).toLocaleString('ko-KR')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">평균 CTR</h3>
              <p className="text-3xl font-bold text-purple-600">
                {((reportData[0]?.ctr || 0) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">총 전환수</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {(reportData[0]?.conversions || 0).toLocaleString('ko-KR')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ROAS</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {((reportData[0]?.roas || 0) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          {campaignReportData.length > 0 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">캠페인별 클릭수</h3>
                  <ReportChart type="bar" data={prepareClicksChartData()} height={300} />
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">캠페인별 비용</h3>
                  <ReportChart type="bar" data={prepareCostChartData()} height={300} />
                </div>
              </div>

              <div className="mb-8">
                <ReportTable data={campaignReportData} title="캠페인별 성과" />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard; 