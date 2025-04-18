'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ReportChartProps {
  data: any[] | any;
  title?: string;
  metrics?: string[];
}

const ReportChart: React.FC<ReportChartProps> = ({ 
  data, 
  title = '리포트 그래프',
  metrics = ['impressions', 'clicks', 'cost']
}) => {
  // 데이터 상세 로깅 (디버깅용)
  if (data) {
    console.log('ReportChart 데이터 타입:', typeof data, Array.isArray(data) ? '배열임' : '배열 아님');
    if (Array.isArray(data) && data.length > 0) {
      console.log('ReportChart 첫 번째 데이터 항목:', data[0]);
      console.log('ReportChart 데이터에 impressions 필드 있음:', 'impressions' in data[0]);
      console.log('ReportChart 데이터에 clicks 필드 있음:', 'clicks' in data[0]);
      console.log('ReportChart 데이터에 cost 필드 있음:', 'cost' in data[0]);
    } else if (!Array.isArray(data)) {
      console.log('ReportChart 데이터 (배열 아님):', data);
    }
  } else {
    console.log('ReportChart에 전달된 데이터가 없습니다.');
  }

  // 데이터 배열 확인 및 변환
  const dataArray = Array.isArray(data) ? data : (data ? [data] : []);

  if (!dataArray || dataArray.length === 0) {
    console.log('ReportChart: 변환 후 데이터 배열이 비어있습니다.');
    return <div className="text-center p-4">차트를 위한 데이터가 없습니다.</div>;
  }

  console.log(`ReportChart: 변환 후 데이터 배열 길이: ${dataArray.length}`);

  // 날짜를 기준으로 정렬
  const sortedData = [...dataArray].sort((a, b) => {
    return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
  });

  console.log(`ReportChart: 정렬 후 데이터 배열 길이: ${sortedData.length}`);
  if (sortedData.length > 0) {
    console.log('ReportChart: 정렬 후 첫 데이터:', sortedData[0]);
    console.log('ReportChart: 정렬 후 마지막 데이터:', sortedData[sortedData.length - 1]);
  }

  // x축 레이블 (날짜)
  const labels = sortedData.map(item => item.date);

  // 차트 데이터 생성
  const chartData = {
    labels,
    datasets: [
      // 노출수 데이터셋
      {
        label: '노출수',
        data: sortedData.map(item => item.impressions),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
        hidden: !metrics.includes('impressions'),
      },
      // 클릭수 데이터셋
      {
        label: '클릭수',
        data: sortedData.map(item => item.clicks),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
        hidden: !metrics.includes('clicks'),
      },
      // 비용 데이터셋
      {
        label: '비용(원)',
        data: sortedData.map(item => item.cost),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y1',
        hidden: !metrics.includes('cost'),
      },
      // 전환수 데이터셋
      {
        label: '전환수',
        data: sortedData.map(item => item.conversions || 0),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        yAxisID: 'y',
        hidden: !metrics.includes('conversions'),
      },
      // 전환가치 데이터셋
      {
        label: '전환가치(원)',
        data: sortedData.map(item => item.conversionValue || 0),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        yAxisID: 'y1',
        hidden: !metrics.includes('conversionValue'),
      }
    ]
  };

  // 차트 옵션
  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // 비용과 전환가치는 통화 형식으로 표시
              if (label.includes('비용') || label.includes('전환가치')) {
                label += new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW'
                }).format(context.parsed.y);
              } else {
                label += new Intl.NumberFormat('ko-KR').format(context.parsed.y);
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '날짜'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '노출수/클릭수/전환수'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '비용/전환가치(원)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default ReportChart; 