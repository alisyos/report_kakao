import './globals.css';
import type { Metadata } from 'next';
import Navigation from './components/Navigation';

export const metadata: Metadata = {
  title: '카카오 키워드 광고 리포트',
  description: '카카오 키워드 광고 API를 활용한 광고 성과 분석 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        <Navigation />
        <main className="py-6">{children}</main>
      </body>
    </html>
  );
} 