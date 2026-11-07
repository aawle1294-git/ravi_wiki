# ⚔️ 라비서버(RAVI SERVER) 공식 위키 웹 애플리케이션

마인크래프트 정통 RPG **라비서버 (`mcravi.m-c.kr`)**를 위한 현대적이고 직관적인 위키 & 커뮤니티 플랫폼입니다.

---

## 🌟 주요 특징

1. **초간편 로그인 & 참여 방식**
   - **디스코드(Discord) 원클릭 로그인**: 마인크래프트 유저라면 별도 회원가입 없이 디스코드 계정으로 1초 만에 로그인
   - **게스트 닉네임 즉시 참여**: 로그인조차 귀찮은 유저는 인게임 닉네임만 적으면 즉시 위키 댓글 및 꿀팁 등록 가능!
2. **유저 꿀팁 & Q&A 커뮤니티 (`/community`)**
   - 질문/답변, 공략/팁, 레이드 파티 구인, 자유게시판 및 추천(좋아요) 기능 탑재
3. **위키 문서 실시간 수정 & 한 줄 제보 (`/wiki/[slug]`)**
   - 웹 에디터를 통해 브라우저에서 바로 문서를 보완하고 수정 가능
   - 각 문서 하단에 유저 실시간 제보 및 꿀팁 댓글창 기본 탑재
4. **완벽한 하이브리드 아키텍처**
   - Supabase DB가 없어도 **로컬 모드로 100% 즉시 정상 작동**
   - Supabase 환경변수를 넣으면 클라우드 DB 및 디스코드 OAuth와 자동 연동
5. **Vercel 원클릭 무료 배포 지원**
   - GitHub에 올리고 Vercel에 연결하면 1분 만에 글로벌 무료 배포 완료

---

## 🚀 로컬 실행 방법

```bash
# 1. 의존성 설치 (완료됨)
npm install

# 2. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하면 바로 위키를 사용하실 수 있습니다!

---

## ☁️ Vercel(버셀)에 1분 만에 무료 배포하기

1. 현재 프로젝트 폴더를 GitHub 레포지토리에 푸시(Push)합니다.
   ```bash
   git init
   git add .
   git commit -m "feat: 라비서버 위키 초기 셋업"
   git branch -M main
   git remote add origin <본인의 깃허브 레포 주소>
   git push -u origin main
   ```
2. [Vercel](https://vercel.com)에 로그인하고 **[Add New...] -> [Project]**를 누릅니다.
3. 방금 푸시한 GitHub 레포지토리를 선택하고 **[Deploy]** 버튼을 누르면 1분 만에 전 세계에 무료로 배포됩니다! 🎉

---

## 🗄️ Supabase(슈파베이스) 연동 방법 (선택 사항)

> 💡 **안내**: Supabase를 연동하지 않아도 로컬 스토리지 모드로 모든 위키 조회, 수정, 댓글, 커뮤니티 기능이 완벽히 작동합니다. 클라우드 DB에 영구 저장하고 디스코드 로그인을 활성화하고 싶을 때만 진행하세요.

1. [Supabase](https://supabase.com)에 접속하여 무료 새 프로젝트를 생성합니다.
2. 좌측 메뉴 **[SQL Editor]**를 열고, 본 프로젝트의 `supabase/schema.sql` 파일 내용을 그대로 붙여넣고 **[Run]**을 실행합니다.
3. 좌측 메뉴 **[Project Settings] -> [API]**에서 `Project URL`과 `anon public key`를 복사합니다.
4. 프로젝트 루트에 `.env.local` 파일을 만들고 아래와 같이 입력합니다:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=여기에_프로젝트_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key
   ```
5. **디스코드 로그인 활성화**:
   - Supabase 대시보드 **[Authentication] -> [Providers] -> [Discord]**를 켭니다.
   - [Discord Developer Portal](https://discord.com/developers/applications)에서 앱을 만들고 Client ID와 Secret을 넣어주면 끝!

