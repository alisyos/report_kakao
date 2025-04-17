'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { ChartData } from '../lib/types';

// Chart.js 등록
Chart.register(...registerables);

interface ReportChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData;
  height?: number;
  width?: number;
  options?: any;
}

const ReportChart = ({ type, data, height = 300, width = 600, options = {} }: ReportChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // 유효한 데이터 확인
  const isValidData = data && 
                     data.labels && 
                     data.labels.length > 0 && 
                     data.datasets && 
                     data.datasets.length > 0;

  useEffect(() => {
    if (!chartRef.current || !isValidData) return;

    // 기존 차트 인스턴스가 있으면 제거
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 새 차트 생성
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  const label = context.dataset.label || '';
                  const value = context.raw;
                  return `${label}: ${value.toLocaleString()}`;
                }
              }
            }
          },
          ...options
        }
      });
    }

    // 컴포넌트 언마운트 시 차트 인스턴스 정리
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, options, isValidData]);

  // 유효하지 않은 데이터일 경우 메시지 표시
  if (!isValidData) {
    return (
      <div style={{ width: '100%', height: `${height}px` }} className="flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">차트 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ReportChart; 