-- =========================================================
-- 라비서버 위키 (RAVI SERVER WIKI) Supabase 데이터베이스 스키마
-- Supabase 대시보드의 [SQL Editor]에 복사하여 [Run]을 누르세요.
-- =========================================================

-- 1. 📘 공식 위키 문서 테이블 (개발자 전용)
CREATE TABLE IF NOT EXISTS public.official_docs (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '기본 안내',
    icon TEXT DEFAULT '📜',
    description TEXT,
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ✍️ 자유 위키 & 게시판 테이블 (플레이어 자유 참여)
CREATE TABLE IF NOT EXISTS public.free_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL DEFAULT '공략/팁',
    author TEXT NOT NULL DEFAULT '라비 유저',
    content TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 기존 free_docs 테이블이 이미 생성되어 있을 경우를 위한 안전 컬럼 추가문
ALTER TABLE public.free_docs ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- 초기 공식 문서 시드 데이터 삽입 (기존 데이터가 없을 경우에만)
INSERT INTO public.official_docs (slug, title, category, icon, description, content)
VALUES 
(
  'getting-started',
  '서버 접속 정보 및 기본 규칙',
  '기본 안내',
  '🏰',
  '라비서버 접속 주소(IP), 권장 버전, 리소스팩 설정 및 공식 규칙',
  '# 🏰 라비서버(RAVI SERVER) 공식 접속 안내\n\n> 본 문서는 라비서버 개발진이 직접 관리하는 **공식 문서**입니다.\n\n### 1. 기본 접속 정보\n* **서버 주소 (IP):** `mcravi.m-c.kr`\n* **지원 버전:** 마인크래프트 자바 에디션 1.21.x 계열\n* **공식 웹사이트:** https://mcravi.kr\n* **공식 디스코드:** https://discord.com/invite/jRkzZZ9kXp\n\n### 2. 서버 리소스팩 안내\n라비서버는 전용 3D 무기와 스킬 이펙트를 위해 리소스팩이 필수입니다. 멀티플레이 서버 목록에서 리소스팩을 **사용(Enabled)**으로 설정해주세요.\n\n### 3. 공식 서버 규칙\n1. 비인가 프로그램(핵/X-Ray/매크로) 사용 시 영구 차단됩니다.\n2. 버그 악용을 금지하며 발견 시 디스코드로 제보해주세요.\n3. 타인 비방 및 욕설 금지.'
),
(
  'commands',
  '공식 핵심 명령어 모음',
  '시스템 가이드',
  '⌨️',
  '인게임 기본 명령어 및 GUI 호출 명령어 목록',
  '# ⌨️ 공식 핵심 명령어 안내\n\n| 명령어 | 설명 |\n| :--- | :--- |\n| `/메뉴` | 서버 통합 GUI 메뉴 열기 |\n| `/스폰` | 중앙 스폰 광장으로 즉시 귀환 |\n| `/도움말` | 공식 가이드 안내창 열기 |\n| `/스탯` | 스탯 포인트 확인 및 분배 |\n| `/스킬` | 직업 스킬 확인 및 레벨업 |\n| `/거래 <닉네임>` | 1:1 유저 안전 거래 |\n| `/돈` | 보유 골드 확인 |'
),
(
  'system-overview',
  'RPG 시스템 개요 (직업 / 장비 / 던전)',
  '시스템 가이드',
  '⚔️',
  '라비서버의 핵심 뼈대 시스템 (직업 전직, 장비 등급, 레이드) 개요',
  '# ⚔️ 라비서버 핵심 RPG 시스템 개요\n\n### 1. 직업(Class) 체계\n* **전사 (Warrior)**: 생명력과 방어력이 높은 근접 딜탱\n* **마법사 (Mage)**: 강력한 원거리 폭딜 및 광역 메테오/빙결 마법\n* **궁수 (Archer)**: 치명타 중심의 원거리 저격 딜러\n\n### 2. 장비 및 강화 체계\n* 장비 등급: 일반 ➔ 희귀 ➔ 유물 ➔ 전설 ➔ **에인션트(Ancient)**\n* 강화: +1~+5강 안전, +11강 이상 파괴 위험 (파괴 방지권 권장)\n* +15강 달성 시 에인션트 장비로 각성 가능\n\n### 3. PVE 사냥터 & 레이드\n* 계단식 필드 사냥터 및 파티 협동 보스 레이드'
)
ON CONFLICT (slug) DO NOTHING;

-- RLS (보안 정책) 활성화
ALTER TABLE public.official_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_docs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 읽기 허용
CREATE POLICY "Allow public read official_docs" ON public.official_docs FOR SELECT USING (true);
CREATE POLICY "Allow public read free_docs" ON public.free_docs FOR SELECT USING (true);

-- 모든 사용자 쓰기(수정/추가/삭제) 허용 (앱 내에서 개발자 비밀번호 및 작성자 검증으로 제어)
CREATE POLICY "Allow public write official_docs" ON public.official_docs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update official_docs" ON public.official_docs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete official_docs" ON public.official_docs FOR DELETE USING (true);
CREATE POLICY "Allow public write free_docs" ON public.free_docs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update free_docs" ON public.free_docs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete free_docs" ON public.free_docs FOR DELETE USING (true);
