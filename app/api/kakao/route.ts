import { NextRequest, NextResponse } from 'next/server';
import kakaoAdApi from '@/app/lib/kakaoAdApi';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  const adAccountId = searchParams.get('adAccountId');
  const campaignId = searchParams.get('campaignId');
  const adGroupId = searchParams.get('adGroupId');

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
  }

  try {
    let result;

    switch (endpoint) {
      case 'adAccounts':
        result = await kakaoAdApi.getAdAccounts();
        break;
      case 'campaigns':
        if (!adAccountId) {
          return NextResponse.json({ error: 'adAccountId parameter is required' }, { status: 400 });
        }
        console.log('API 라우트: 캠페인 조회 요청 - 계정 ID:', adAccountId);
        result = await kakaoAdApi.getCampaigns(adAccountId);
        console.log('API 라우트: 캠페인 조회 결과:', JSON.stringify(result).substring(0, 200) + '...');
        break;
      case 'adGroups':
        if (!adAccountId) {
          return NextResponse.json({ error: 'adAccountId parameter is required' }, { status: 400 });
        }
        result = await kakaoAdApi.getAdGroups(adAccountId, campaignId || undefined);
        break;
      case 'keywords':
        if (!adAccountId || !adGroupId) {
          return NextResponse.json({ error: 'adAccountId and adGroupId parameters are required' }, { status: 400 });
        }
        result = await kakaoAdApi.getKeywords(
          adAccountId, 
          adGroupId, 
          campaignId || undefined
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid endpoint parameter' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API 라우트 에러:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, adAccountId, campaignIds, adGroupIds, keywordIds, startDate, endDate, metricsGroups = ['BASIC'], timeUnit = 'DAY' } = body;

    if (!endpoint || !adAccountId) {
      return NextResponse.json(
        { error: 'endpoint and adAccountId parameters are required' },
        { status: 400 }
      );
    }

    // 날짜 준비
    const start = startDate || getDefaultStartDate();
    const end = endDate || getDefaultEndDate();
    
    // 명시적으로 metricsGroups 확인
    const metrics = Array.isArray(metricsGroups) ? metricsGroups : ['BASIC'];
    console.log(`API 요청 파라미터 - metricsGroups:`, metrics);

    let result;

    switch (endpoint) {
      case 'accountReport':
        console.log(`계정 리포트 조회: ${adAccountId} ${start} ~ ${end}, 지표:`, metrics);
        result = await kakaoAdApi.getAccountReport(adAccountId, start, end, metrics, timeUnit);
        break;
      case 'campaignReport':
        // 캠페인 리포트의 경우 캠페인 ID가 필요하지만, 새 API는 필요하지 않음
        // 헤더에 adAccountId를 넣고 호출함
        console.log(`캠페인 리포트 조회: ${adAccountId} ${start} ~ ${end} (${timeUnit})`);
        result = await kakaoAdApi.getCampaignReport(adAccountId, campaignIds || [], start, end, metrics, timeUnit);
        break;
      case 'adGroupReport':
        if (!adGroupIds || !adGroupIds.length) {
          return NextResponse.json({ error: 'adGroupIds parameter is required' }, { status: 400 });
        }
        console.log(`광고 그룹 리포트 조회: ${adAccountId} ${start} ~ ${end} (${timeUnit})`);
        // 광고 그룹 리포트 함수 사용 - campaignId 파라미터 추가
        result = await kakaoAdApi.getAdGroupReport(
          adAccountId, 
          adGroupIds, 
          start, 
          end, 
          metrics, 
          timeUnit,
          body.campaignId // 요청 바디에서 캠페인 ID 전달
        );
        break;
      case 'keywordReport':
        if (!keywordIds || !keywordIds.length) {
          return NextResponse.json({ error: 'keywordIds parameter is required' }, { status: 400 });
        }
        if (!body.campaignId) {
          return NextResponse.json({ error: 'campaignId parameter is required for keyword reports' }, { status: 400 });
        }
        console.log(`키워드 리포트 조회: ${adAccountId} ${start} ~ ${end} (${timeUnit}), 키워드: ${keywordIds.join(',')}`);
        console.log('키워드 리포트 요청 파라미터:', { 
          campaignId: body.campaignId, 
          adGroupId: body.adGroupId 
        });
        
        result = await kakaoAdApi.getKeywordReport(
          adAccountId, 
          keywordIds, 
          start, 
          end, 
          metrics, 
          timeUnit,
          body.campaignId,
          body.adGroupId
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid endpoint parameter' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API 라우트 에러:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// 기본 날짜 가져오기 - 오늘
function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}

// 기본 날짜 가져오기 - 한달 전
function getDefaultStartDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split('T')[0];
} 