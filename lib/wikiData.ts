export interface OfficialDoc {
  slug: string
  title: string
  category: string
  icon: string
  description: string
  updatedAt: string
  content: string
}

export interface FreeDoc {
  id: string
  title: string
  category: string
  author: string
  updatedAt: string
  likes: number
  content: string
}

// 📘 공식 위키 뼈대 문서 (서버 기본 안내 / 규칙 / 명령어 / 시스템 개요)
export const INITIAL_OFFICIAL_DOCS: OfficialDoc[] = [
  {
    slug: 'getting-started',
    title: '서버 접속 정보 및 기본 규칙',
    category: '기본 안내',
    icon: '🏰',
    description: '라비서버 접속 주소(IP), 권장 버전, 리소스팩 설정 및 공식 규칙',
    updatedAt: '2026-11-07',
    content: `
# 🏰 라비서버(RAVI SERVER) 공식 접속 안내

> 본 문서는 라비서버 개발진이 직접 관리하는 **공식 문서**입니다. (개발자 로그인 후 수정 가능)

---

### 1. 기본 접속 정보
* **서버 주소 (IP):** \`mcravi.m-c.kr\`
* **지원 버전:** 마인크래프트 자바 에디션 (Java Edition) 1.21.x 계열
* **공식 웹사이트:** [https://mcravi.kr](https://mcravi.kr)
* **공식 디스코드:** [https://discord.com/invite/jRkzZZ9kXp](https://discord.com/invite/jRkzZZ9kXp)

---

### 2. 서버 필수 리소스팩 안내
라비서버는 고유의 3D 무기 모델링과 화려한 스킬 이펙트, 전용 UI를 제공합니다.  
멀티플레이 서버 목록에서 라비서버 편집 → **서버 리소스팩: '사용(Enabled)'**으로 설정해주세요.

---

### 3. 공식 서버 규칙
1. **비인가 프로그램 엄금**: X-Ray, 핵, 오토클릭 매크로 적발 시 경고 없이 영구 차단됩니다.
2. **버그 악용 금지**: 취약점이나 버그 발견 시 디스코드 공식 채널로 즉시 제보해야 합니다.
3. **매너 플레이 준수**: 유저 비방, 분쟁 유발, 전체 채팅 도배는 제재 대상입니다.
4. **현금 거래(RMT) 금지**: 인게임 재화의 무단 현금 거래를 금지합니다.
`
  },
  {
    slug: 'commands',
    title: '공식 핵심 명령어 모음',
    category: '시스템 가이드',
    icon: '⌨️',
    description: '인게임 기본 명령어 및 GUI 호출 명령어 목록',
    updatedAt: '2026-11-07',
    content: `
# ⌨️ 공식 핵심 명령어 안내

| 명령어 | 기능 및 설명 |
| :--- | :--- |
| \`/메뉴\` 또는 \`/menu\` | 서버 통합 GUI 메뉴 열기 (사냥터 워프, 상점, 강화 등) |
| \`/스폰\` 또는 \`/spawn\` | 중앙 마을(스폰 광장)로 즉시 귀환 |
| \`/도움말\` | 초보자를 위한 공식 가이드 안내창 열기 |
| \`/스탯\` 또는 \`/stat\` | 캐릭터 능력치 확인 및 스탯 포인트 분배 |
| \`/스킬\` | 보유한 직업 스킬 확인 및 스킬 포인트 투자 |
| \`/거래 <닉네임>\` | 인근 유저와 1:1 안전 거래 신청 |
| \`/돈\` 또는 \`/money\` | 현재 보유 중인 골드 및 재화 확인 |
`
  },
  {
    slug: 'system-overview',
    title: 'RPG 시스템 개요 (직업 / 장비 / 던전)',
    category: '시스템 가이드',
    icon: '⚔️',
    description: '라비서버의 핵심 뼈대 시스템 (직업 전직, 장비 등급, 레이드) 개요',
    updatedAt: '2026-11-07',
    content: `
# ⚔️ 라비서버 핵심 RPG 시스템 개요

---

### 1. 직업(Class) 체계
* **전사 (Warrior)**: 높은 생명력과 방어력, 근접 광역 스킬 기반 딜탱
* **마법사 (Mage)**: 강력한 원거리 폭딜 및 광역 메테오/빙결 마법
* **궁수 (Archer)**: 치명타 중심의 단일 원거리 저격과 빠른 기동성

---

### 2. 장비 및 강화(제련) 체계
* **장비 등급:** 일반(Normal) ➔ 희귀(Rare) ➔ 유물(Relic) ➔ 전설(Legendary) ➔ **에인션트(Ancient)**
* **강화 규칙:**
  * +1 ~ +5강: 100% 안전 구간
  * +6 ~ +10강: 실패 시 수치 유지 또는 1 하락
  * +11강 이상: **실패 시 장비 파괴 위험** (파괴 방지 주문서 필요)
  * +15강 달성 시: 최상위 에인션트 무기로 **'각성'** 가능

---

### 3. PVE 콘텐츠 (사냥터 & 레이드)
* 1구역부터 계단식으로 구성된 레벨별 필드 사냥터
* 파티 협동이 필수적인 인스턴스 보스 레이드
`
  }
]

// ✍️ 자유 위키 / 게시판 (더미 데이터 완전 제거: 유저가 쓴 글만 들어가는 빈 배열)
export const INITIAL_FREE_DOCS: FreeDoc[] = []
