# 카카오 광고 리포트 대시보드

카카오 비즈니스 API를 활용한 광고 성과 분석 대시보드 애플리케이션입니다. 이 애플리케이션은 Next.js, React와 TailwindCSS를 사용하여 개발되었습니다.

## 주요 기능

- 카카오 광고 계정 연동 및 데이터 조회
- 계정 레벨 광고 성과 대시보드
- 캠페인별 성과 분석
- 키워드 분석 도구

## 설치 방법

1. 저장소 클론:
   ```bash
   git clone https://github.com/yourusername/report_kakao.git
   cd report_kakao
   ```

2. 의존성 패키지 설치:
   ```bash
   npm install
   ```

3. 환경 변수 설정:
   `.env.example` 파일을 `.env.local`로 복사하고 카카오 비즈니스 API 키와 토큰 정보를 입력합니다.
   ```bash
   cp .env.example .env.local
   ```

4. 개발 서버 실행:
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:3000`으로 접속합니다.

## 카카오 API 설정

1. [Kakao Developers](https://developers.kakao.com/) 에서 애플리케이션을 생성합니다.
2. 비즈니스 앱으로 전환하고, 카카오 비즈니스 API 사용 권한을 신청합니다.
3. 발급받은 API 키와 토큰을 `.env.local` 파일에 입력합니다.

## 빌드 및 배포

프로덕션용 빌드:
```bash
npm run build
npm start
``` 