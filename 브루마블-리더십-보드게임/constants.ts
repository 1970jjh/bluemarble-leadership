import { BoardSquare, GameCard, SquareType, Team, TeamColor } from './types';

export const BOARD_SIZE = 32;

// Layout for a 9x9 grid (counting corners)
export const BOARD_SQUARES: BoardSquare[] = [
  // Bottom Row (Right to Left)
  { index: 0, type: SquareType.Start, name: '오리엔테이션 (Start)' },
  { index: 1, type: SquareType.City, name: '자기 인식 (Self-Awareness)', module: 'Self' },
  { index: 2, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 3, type: SquareType.City, name: '적극적 경청 (Active Listening)', module: 'Follower' },
  { index: 4, type: SquareType.City, name: '심리적 안전감 (Psy. Safety)', module: 'Team' },
  { index: 5, type: SquareType.City, name: '명확한 지시 (Directing)', module: 'Leader' },
  { index: 6, type: SquareType.City, name: '감정 조절 (Emotional Control)', module: 'Self' },
  { index: 7, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 8, type: SquareType.Island, name: '번아웃 (Burnout)' },
  
  // Left Column (Bottom to Top)
  { index: 9, type: SquareType.City, name: '능동적 수행 (Proactivity)', module: 'Follower' },
  { index: 10, type: SquareType.City, name: '갈등 관리 (Conflict Mgmt)', module: 'Team' },
  { index: 11, type: SquareType.City, name: '동기 부여 (Motivation)', module: 'Leader' },
  { index: 12, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 13, type: SquareType.City, name: '시간 관리 (Time Mgmt)', module: 'Self' },
  { index: 14, type: SquareType.City, name: '비판적 사고 (Critical Thinking)', module: 'Follower' },
  { index: 15, type: SquareType.City, name: '다양성 포용 (Diversity)', module: 'Team' },
  
  // Top Row (Left to Right)
  { index: 16, type: SquareType.WorldTour, name: '핵심 가치 (Core Values)' },
  { index: 17, type: SquareType.City, name: '임파워먼트 (Empowerment)', module: 'Leader' },
  { index: 18, type: SquareType.City, name: '회복 탄력성 (Resilience)', module: 'Self' },
  { index: 19, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 20, type: SquareType.City, name: '피드백 수용 (Feedback)', module: 'Follower' },
  { index: 21, type: SquareType.City, name: '상호 책임 (Accountability)', module: 'Team' },
  { index: 22, type: SquareType.City, name: '의사결정 (Decision Making)', module: 'Leader' },
  { index: 23, type: SquareType.City, name: '지속 학습 (Learning Agility)', module: 'Self' },
  
  // Right Column (Top to Bottom)
  { index: 24, type: SquareType.Space, name: '혁신 프로젝트 (Challenge)' },
  { index: 25, type: SquareType.City, name: '조직 몰입 (Commitment)', module: 'Follower' },
  { index: 26, type: SquareType.City, name: '협업 툴 활용 (Collaboration)', module: 'Team' },
  { index: 27, type: SquareType.Fund, name: '사내 벤처 (Innovation)' },
  { index: 28, type: SquareType.City, name: '코칭 (Coaching)', module: 'Leader' },
  { index: 29, type: SquareType.City, name: '비전 제시 (Visioning)', module: 'Self' },
  { index: 30, type: SquareType.City, name: '서번트 리더십 (Servant)', module: 'Leader' },
  { index: 31, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
];

export const INITIAL_RESOURCES = {
  capital: 100,  // Starts at 100
  energy: 5,     // Starts at 5, Goal 100
  reputation: 5, // Starts at 5, Goal 100
  trust: 5,      // Starts at 5, Goal 100
  competency: 5, // Starts at 5, Goal 100
  insight: 5,    // Starts at 5, Goal 100
};

export const INITIAL_TEAMS: Team[] = []; // Initialized dynamically in App.tsx

// Updated Cards
export const SAMPLE_CARDS: GameCard[] = [
  // --- LEADERSHIP (MANAGER) ---
  {
    id: 'L-001',
    type: 'Leader',
    title: '저성과자의 딜레마',
    situation: '팀 내 분위기는 좋지만 실적이 계속 저조한 팀원이 있습니다. 이번 인사평가에서 D등급을 주면 연봉이 삭감되고 팀 분위기가 나빠질 수 있습니다. 하지만 공정성을 위해서는 낮게 평가해야 합니다.',
    learningPoint: '성과 관리와 관계 관리의 균형',
    choices: [
      { id: 'A', text: '원칙대로 D등급 부여 및 냉정한 피드백 (비용 없음)' },
      { id: 'B', text: '팀 분위기 고려해 C등급 부여 (인건비 예산 초과 위험)' },
      { id: 'C', text: 'D등급 부여하되, 유료 외부 교육/멘토링 지원 [Capital -5 예상]' },
    ],
  },
  
  // --- CORE VALUE (Dilemma) ---
  {
    id: 'V-001',
    type: 'CoreValue',
    title: '품질인가 속도인가',
    situation: '고객에게 약속한 출시일이 내일입니다. 하지만 테스트 중 치명적이지는 않으나 사용자 경험을 해치는 버그가 발견되었습니다. 수정하려면 3일이 더 필요합니다.',
    learningPoint: '핵심 가치 기반 의사결정',
    choices: [
      { id: 'A', text: '[약속 준수/신속성] 버그는 추후 패치하기로 하고, 약속된 일정에 맞춰 출시한다.' },
      { id: 'B', text: '[최고 지향/완벽성] 고객에게 사과하고 일정을 연기하더라도 완벽한 제품을 출시한다.' },
      { id: 'C', text: '[투명성/소통] 고객에게 상황을 솔직히 알리고, 고객의 선택에 따른다.' },
    ],
  },

  // --- INNOVATION CHALLENGE (Open-Ended) ---
  {
    id: 'C-001',
    type: 'Challenge',
    title: '혁신 우선순위 제안',
    situation: '우리 회사가 다음 단계로 도약하기 위해 가장 시급하게 혁신해야 할 분야는 무엇이며, 그 이유는 무엇이라고 생각하십니까? (자유롭게 서술하시오)',
    learningPoint: '전략적 사고와 비전 제시',
    choices: [], // Empty choices means Open Ended Input
  },

  // --- INTERNAL VENTURE (FUND) ---
  {
    id: 'I-001',
    type: 'Event',
    title: '사내 벤처: 피벗(Pivot)의 기로',
    situation: '야심차게 시작한 사내 벤처의 초기 아이템이 시장에서 반응이 없습니다. 팀은 방향을 완전히 바꾸는 피벗(Pivot)을 원하지만, 이는 초기 투자금을 포기하는 것입니다.',
    learningPoint: '매몰 비용과 민첩한 의사결정',
    choices: [
      { id: 'A', text: '과감한 피벗: 실패를 인정하고 남은 자금으로 새로운 아이템에 도전한다.' },
      { id: 'B', text: '기존 아이템 고수: 마케팅을 강화하여 초기 가설을 끝까지 검증한다.' },
      { id: 'C', text: '사업 중단: 추가 손실을 막기 위해 팀을 해체하고 본업으로 복귀한다.' },
    ],
  },
  {
    id: 'I-002',
    type: 'Event',
    title: '사내 벤처: 핵심 인재 차출',
    situation: '성공 가능성이 보이는 사내 벤처 팀에서 본업 부서의 \'에이스\' 개발자를 보내달라고 요청했습니다. 보내주면 당장 우리 부서의 성과는 떨어질 수 있습니다.',
    learningPoint: '자원 배분과 조직 전체의 이익',
    choices: [
      { id: 'A', text: '대승적 지원: 미래를 위해 에이스를 파견 보낸다. (단기 성과 하락 감수)' },
      { id: 'B', text: '현업 우선: 지금 부서의 목표 달성이 더 중요하므로 거절한다.' },
      { id: 'C', text: '신규 채용 지원: 에이스 대신 외부 전문가 채용 비용을 지원한다.' },
    ],
  },
  {
    id: 'I-003',
    type: 'Event',
    title: '사내 벤처: 스핀오프(Spin-off) 제안',
    situation: '사내 벤처가 크게 성공하여 경쟁사로부터 높은 가격에 인수 제안을 받았습니다. 독립 법인으로 분사(Spin-off)시킬지, 매각하여 수익을 실현할지 결정해야 합니다.',
    learningPoint: '장기적 가치 창출 vs 단기 수익 실현',
    choices: [
      { id: 'A', text: '조기 매각: 불확실성을 제거하고 즉시 높은 수익을 확정한다.' },
      { id: 'B', text: '독립 분사: 모기업의 자회사로 키워 더 큰 미래 가치를 도모한다.' },
      { id: 'C', text: '기술 흡수: 벤처를 본사 핵심 사업부로 정식 편입시켜 내재화한다.' },
    ],
  },

  // --- CHANCE (EVENT) : Always Positive ---
  // 1. Budget Surplus
  {
    id: 'E-001',
    type: 'Event',
    title: '뜻밖의 특별 보너스',
    situation: '회사의 연말 실적이 예상보다 좋아 특별 예산이 팀에 배정되었습니다. 이 돈을 어떻게 사용하는 것이 가장 효과적일까요? (어떤 선택이든 자본/자원은 증가합니다)',
    learningPoint: '자원 활용의 최적화',
    choices: [
      { id: 'A', text: '팀원들에게 균등하게 현금성 복지로 분배한다. (팀 사기 진작)' },
      { id: 'B', text: '최신 업무 장비를 구매하여 업무 환경을 개선한다. (생산성 향상)' },
      { id: 'C', text: '유명 강사 초청 및 워크샵 비용으로 사용한다. (역량 강화)' },
    ],
  },
  // 2. Industry Award
  {
    id: 'E-002',
    type: 'Event',
    title: '업계 혁신 어워드 수상',
    situation: '우리 팀의 프로젝트가 업계 최고 권위의 혁신상을 수상했습니다! 상금과 함께 엄청난 명성을 얻었습니다. 이를 어떻게 기념할까요?',
    learningPoint: '성공 축하와 동기 부여',
    choices: [
      { id: 'A', text: '대대적인 마케팅 홍보에 투자하여 명성을 더욱 공고히 한다. (Reputation+++)' },
      { id: 'B', text: '그동안 고생한 팀원들과 해외 연수/휴가를 떠난다. (Energy/Trust+++)' },
      { id: 'C', text: '상금을 사회에 환원하여 기업 이미지를 제고한다. (Trust/Insight+++)' },
    ],
  },
  // 3. Healing Day
  {
    id: 'E-003',
    type: 'Event',
    title: '전사 힐링 데이',
    situation: '회사 창립기념일을 맞아 내일 하루 전사 휴무가 결정되었습니다. 갑자기 생긴 이 하루를 리더로서 팀에 어떻게 제안하시겠습니까?',
    learningPoint: '휴식과 재충전',
    choices: [
      { id: 'A', text: '완전한 휴식: 업무 연락 금지령을 내리고 각자 푹 쉰다.' },
      { id: 'B', text: '팀 빌딩: 평소 가보고 싶었던 맛집 투어와 가벼운 액티비티를 한다.' },
      { id: 'C', text: '인사이트 투어: 최신 트렌드를 볼 수 있는 팝업스토어나 전시회를 함께 간다.' },
    ],
  },
  // 4. CEO Lunch
  {
    id: 'E-004',
    type: 'Event',
    title: 'CEO와의 깜짝 오찬',
    situation: 'CEO가 우리 팀의 노고를 치하하며 점심 식사를 제안했습니다. 식사 자리에서 가장 어필하고 싶은 것은 무엇입니까?',
    learningPoint: '상향 영향력 (Managing Up)',
    choices: [
      { id: 'A', text: '팀의 성과와 기여도를 구체적 수치로 어필하여 예산을 더 확보한다.' },
      { id: 'B', text: '현재 팀이 겪고 있는 애로사항과 인력 부족 문제를 솔직히 털어놓는다.' },
      { id: 'C', text: '회사의 비전에 대한 우리 팀의 새로운 아이디어를 제안한다.' },
    ],
  },

  // --- BURNOUT : Always Negative (Damage Control) ---
  {
    id: 'B-001',
    type: 'Burnout',
    title: '프로젝트 조기 중단 위기',
    situation: '핵심 팀원들의 과로로 인해 프로젝트가 좌초될 위기입니다. 고객사는 불만을 제기하고 있으며, 팀원들은 쓰러지기 일보 직전입니다. 피해를 최소화해야 합니다.',
    learningPoint: '위기 관리와 우선순위',
    choices: [
      { id: 'A', text: '납기를 늦추더라도 팀원들에게 즉시 휴식을 부여한다. (신뢰 하락 감수)' },
      { id: 'B', text: '외부 프리랜서를 고용하여 급한 불을 끈다. (자본 대거 투입)' },
      { id: 'C', text: '기능을 대폭 축소하여 현재 인원으로 마무리는 짓는다. (품질 저하 감수)' },
    ],
  },

  // --- ETIQUETTE (WORKPLACE MANNERS) ---
  {
    id: 'M-001',
    type: 'Etiquette',
    title: '메신저 예절',
    situation: '급한 업무로 휴가 중인 상사에게 연락을 해야 할 상황입니다. 평소 상사는 휴가 중 연락을 싫어합니다. 어떻게 연락하는 것이 직장 매너에 맞을까요?',
    learningPoint: '비즈니스 커뮤니케이션 매너',
    choices: [
      { id: 'A', text: '가장 빠르고 확실한 전화로 용건만 간단히 말한다.' },
      { id: 'B', text: '"죄송합니다만"으로 시작하는 정중한 장문의 카톡/문자를 남긴다.' },
      { id: 'C', text: '이메일로 상세 내용을 남기고, 문자로는 "메일 확인 부탁드립니다"라고만 보낸다.' },
    ],
  },

  // --- TEAMSHIP ---
  {
    id: 'T-001',
    type: 'Team',
    title: '타 부서와의 갈등',
    situation: '영업팀에서 무리한 일정으로 개발 요청을 해왔습니다. 개발팀원들은 이미 번아웃 상태라 거절하길 원합니다. 하지만 회사의 매출 목표를 위해서는 이 기능이 꼭 필요하다고 합니다.',
    learningPoint: '조직 전체 최적화 vs 팀 보호',
    choices: [
      { id: 'A', text: '팀원 보호 우선: 일정 변경 없이는 불가능하다고 거절.' },
      { id: 'B', text: '목표 달성 우선: 야근 특근비(Capital)를 지급하고 강행한다. [Capital 감소]' },
      { id: 'C', text: '절충안: 필수 기능만 MVP로 출시하고, 보상 휴가를 약속한다.' },
    ],
  },

  // --- SELF LEADERSHIP ---
  {
    id: 'S-001',
    type: 'Self',
    title: '성장 vs 안정',
    situation: '현재 업무는 매우 익숙하고 편안합니다. 그런데 회사에서 성공 가능성은 낮지만 성공 시 커리어에 큰 도움이 되는 신규 TF 리더직을 제안했습니다. 실패 시 책임도 큽니다.',
    learningPoint: '도전 정신과 위험 감수',
    choices: [
      { id: 'A', text: '현재 업무의 전문성을 더 키우는 것이 중요하다며 정중히 거절한다.' },
      { id: 'B', text: '실패의 위험을 감수하고 과감하게 TF 리더직에 도전한다.' },
      { id: 'C', text: '기존 업무를 70% 유지하면서, TF에는 자문 역할로만 부분적으로 참여하겠다고 역제안한다.' },
    ],
  },
  
  // --- FOLLOWERSHIP ---
  {
    id: 'F-001',
    type: 'Follower',
    title: '리더의 잘못된 지시',
    situation: '존경하는 팀장님이 과거의 성공 방식에 집착하여, 이번 시장 트렌드와 맞지 않는 마케팅 전략을 강하게 지시했습니다. 데이터를 보면 실패할 확률이 높습니다.',
    learningPoint: '건설적인 반대(Courageous Followership)',
    choices: [
      { id: 'A', text: '리더의 경험과 직관을 믿고 지시하신 대로 100% 수행한다.' },
      { id: 'B', text: '공개 회의 석상에서 데이터를 제시하며 리더의 판단이 틀렸음을 증명한다.' },
      { id: 'C', text: '일단 리더의 의도에 동의를 표한 뒤, 별도 미팅에서 대안을 제시한다.' },
    ],
  }
];