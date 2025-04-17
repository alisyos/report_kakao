'use client';

import { useState } from 'react';
import { ReportData } from '../lib/types';

interface ReportTableProps {
  data: ReportData[];
  title?: string;
}

const ReportTable = ({ data, title = '성과 리포트' }: ReportTableProps) => {
  const [sortField, setSortField] = useState<keyof ReportData>('impressions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 데이터가 비어있으면 빈 테이블 렌더링
  if (!data || data.length === 0) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500">표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  // 정렬 핸들러
  const handleSort = (field: keyof ReportData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 데이터 정렬
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField] as any;
    const bValue = b[sortField] as any;

    if (aValue === bValue) return 0;
    
    const compareResult = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? compareResult : -compareResult;
  });

  // 숫자 포맷팅 함수
  const formatNumber = (value: number): string => {
    return value?.toLocaleString('ko-KR') || '0';
  };

  // 비율 포맷팅 함수 (예: CTR, 전환율)
  const formatPercent = (value: number): string => {
    return `${((value || 0) * 100).toFixed(2)}%`;
  };

  // 금액 포맷팅 함수
  const formatCurrency = (value: number): string => {
    return `₩${(value || 0).toLocaleString('ko-KR')}`;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {data[0]?.name && (
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                이름
                {sortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            )}
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('impressions')}
            >
              노출수
              {sortField === 'impressions' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('clicks')}
            >
              클릭수
              {sortField === 'clicks' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('ctr')}
            >
              CTR
              {sortField === 'ctr' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('cpc')}
            >
              CPC
              {sortField === 'cpc' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('cost')}
            >
              비용
              {sortField === 'cost' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('conversions')}
            >
              전환수
              {sortField === 'conversions' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('conversionRate')}
            >
              전환율
              {sortField === 'conversionRate' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('costPerConversion')}
            >
              전환당 비용
              {sortField === 'costPerConversion' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('roas')}
            >
              ROAS
              {sortField === 'roas' && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50">
              {item.name && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(item.impressions)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(item.clicks)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercent(item.ctr)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.cpc)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.cost)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(item.conversions)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercent(item.conversionRate)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.costPerConversion)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercent(item.roas)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable; 