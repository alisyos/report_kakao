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
        result = await kakaoAdApi.getCampaigns(adAccountId);
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
        result = await kakaoAdApi.getKeywords(adAccountId, adGroupId);
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
    const { endpoint, adAccountId, campaignIds, keywordIds, startDate, endDate, metricsGroups } = body;

    if (!endpoint || !adAccountId) {
      return NextResponse.json(
        { error: 'endpoint and adAccountId parameters are required' },
        { status: 400 }
      );
    }

    // 날짜 준비
    const start = startDate || getDefaultStartDate();
    const end = endDate || getDefaultEndDate();
    const metrics = metricsGroups || ['BASIC'];

    let result;

    switch (endpoint) {
      case 'accountReport':
        console.log(`계정 리포트 조회: ${adAccountId} ${start} ~ ${end}`);
        result = await kakaoAdApi.getAccountReport(adAccountId, start, end, metrics);
        break;
      case 'campaignReport':
        // 캠페인 리포트의 경우 캠페인 ID가 필요하지만, 새 API는 필요하지 않음
        // 헤더에 adAccountId를 넣고 호출함
        console.log(`캠페인 리포트 조회: ${adAccountId} ${start} ~ ${end}`);
        result = await kakaoAdApi.getCampaignReport(adAccountId, campaignIds || [], start, end, metrics);
        break;
      case 'keywordReport':
        if (!keywordIds || !keywordIds.length) {
          return NextResponse.json({ error: 'keywordIds parameter is required' }, { status: 400 });
        }
        console.log(`키워드 리포트 조회: ${adAccountId} ${start} ~ ${end}`);
        result = await kakaoAdApi.getKeywordReport(adAccountId, keywordIds, start, end, metrics);
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