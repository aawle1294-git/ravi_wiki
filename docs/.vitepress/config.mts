import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ko-KR',
  title: '라비서버 위키',
  description: '마인크래프트 정통 RPG 라비서버(RAVI SERVER) 공식 위키 & 공략 가이드',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#7c3aed' }]
  ],

  themeConfig: {
    siteTitle: '라비서버 위키',
    logo: '⚔️',

    nav: [
      { text: '홈', link: '/' },
      { text: '시작 가이드', link: '/guide/getting-started' },
      { text: '직업 & 스킬', link: '/classes/' },
      { text: '장비 & 강화', link: '/equipment/weapons' },
      { text: '사냥터 & 레이드', link: '/hunting/fields' },
      { text: '생활 & 경제', link: '/life/mining' },
      {
        text: '외부 링크',
        items: [
          { text: '공식 웹사이트', link: 'https://mcravi.kr' },
          { text: '공식 디스코드', link: 'https://discord.com/invite/qeZCRqqbhs' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '시작 가이드',
          items: [
            { text: '서버 접속 및 기본 룰', link: '/guide/getting-started' },
            { text: '핵심 명령어 모음', link: '/guide/commands' },
            { text: '자주 묻는 질문 (FAQ)', link: '/guide/faq' }
          ]
        }
      ],
      '/classes/': [
        {
          text: '직업 및 스킬 시스템',
          items: [
            { text: '직업 시스템 개요', link: '/classes/' },
            { text: '전사 (Warrior)', link: '/classes/warrior' },
            { text: '마법사 (Mage)', link: '/classes/mage' },
            { text: '궁수 (Archer)', link: '/classes/archer' }
          ]
        }
      ],
      '/equipment/': [
        {
          text: '장비 및 아이템',
          items: [
            { text: '무기 및 에인션트 장비', link: '/equipment/weapons' },
            { text: '장비 각성 & 강화 시스템', link: '/equipment/enhancement' },
            { text: '소비 아이템 & 재료', link: '/equipment/items' }
          ]
        }
      ],
      '/hunting/': [
        {
          text: '사냥터 및 던전',
          items: [
            { text: '필드 사냥터 가이드', link: '/hunting/fields' },
            { text: '인스턴스 던전', link: '/hunting/dungeons' },
            { text: '월드 보스 & 레이드', link: '/hunting/raids' }
          ]
        }
      ],
      '/life/': [
        {
          text: '생활 및 경제 시스템',
          items: [
            { text: '광산 & 채광 시스템', link: '/life/mining' },
            { text: '낚시 & 요리', link: '/life/fishing-cooking' },
            { text: '서버 화폐 & 유저 거래', link: '/life/economy' }
          ]
        }
      ]
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '검색',
                buttonAriaLabel: '문서 검색'
              },
              modal: {
                noResultsText: '검색 결과가 없습니다',
                resetButtonTitle: '검색 지우기',
                footer: {
                  selectText: '선택',
                  navigateText: '이동',
                  closeText: '닫기'
                }
              }
            }
          }
        }
      }
    },

    socialLinks: [
      { icon: 'discord', link: 'https://discord.com/invite/qeZCRqqbhs' }
    ],

    footer: {
      message: '마인크래프트 RPG 라비서버 (mcravi.m-c.kr) 공식 위키',
      copyright: 'Copyright © 2026 RAVI SERVER & Wiki Contributors'
    }
  }
})

