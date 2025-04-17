'use client';

import React from 'react';

// 간단하게 작성된 ReportTable 컴포넌트
// API 응답의 원본 필드(imp, click, spending)를 사용합니다

interface ReportTableProps {
  data: any[];
  title?: string;
}

const ReportTable: React.FC<ReportTableProps> = ({ data, title = '리포트' }) => {
  // 디버깅용 로그
  console.log('ReportTable 데이터:', data);
  
  if (!data || data.length === 0) {
    return <div className="text-center p-4">데이터가 없습니다.</div>;
  }

  // 첫 번째 데이터의 모든 키 추출
  const firstItem = data[0];
  console.log('첫 번째 항목:', firstItem);

  // 메트릭스 데이터 확인
  const metrics = firstItem.metrics || {};
  console.log('메트릭스 데이터:', metrics);

  // 데이터 날짜 또는 ID 정보
  const dateOrId = firstItem.start || firstItem.id || '';
  console.log('날짜/ID 데이터:', dateOrId);
  
  // 숫자 포맷팅 함수
  const formatNumber = (num: any) => {
    if (typeof num === 'undefined' || num === null) return '-';
    if (typeof num === 'string') {
      num = parseFloat(num) || 0;
    }
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 비용 포맷팅 함수
  const formatCurrency = (amount: any) => {
    if (typeof amount === 'undefined' || amount === null) return '-';
    if (typeof amount === 'string') {
      amount = parseFloat(amount) || 0;
    }
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  // 퍼센트 포맷팅 함수
  const formatPercent = (value: any) => {
    if (typeof value === 'undefined' || value === null) return '-';
    return (parseFloat(value) * 100).toFixed(2) + '%';
  };

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              날짜
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              노출(IMP)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              클릭(CLICK)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              비용(SPENDING)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CTR
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CPC
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.date || item.start || ''}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatNumber(item.imp || item.metrics?.imp)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatNumber(item.click || item.metrics?.click)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(item.spending || item.metrics?.spending)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPercent(item.ctr)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.cpc ? formatCurrency(item.cpc) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable; 