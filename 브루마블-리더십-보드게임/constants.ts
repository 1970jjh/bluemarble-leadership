import { BoardSquare, GameCard, SquareType, Team, TeamColor, CompetencyType } from './types';

export const BOARD_SIZE = 32;

// Layout for a 9x9 grid (counting corners)
export const BOARD_SQUARES: BoardSquare[] = [
  // Bottom Row (Right to Left)
  { index: 0, type: SquareType.Start, name: '오리엔테이션 (Start)' },
  { index: 1, type: SquareType.City, name: '자기 인식 (Self-Awareness)', module: 'Self', competency: 'self-awareness' },
  { index: 2, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 3, type: SquareType.City, name: '적극적 경청 (Active Listening)', module: 'Follower', competency: 'active-listening' },
  { index: 4, type: SquareType.City, name: '심리적 안전감 (Psy. Safety)', module: 'Team', competency: 'psychological-safety' },
  { index: 5, type: SquareType.City, name: '명확한 지시 (Directing)', module: 'Leader', competency: 'clear-direction' },
  { index: 6, type: SquareType.City, name: '감정 조절 (Emotional Control)', module: 'Self', competency: 'emotional-control' },
  { index: 7, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 8, type: SquareType.Island, name: '번아웃 (Burnout)' },

  // Left Column (Bottom to Top)
  { index: 9, type: SquareType.City, name: '능동적 수행 (Proactivity)', module: 'Follower', competency: 'proactivity' },
  { index: 10, type: SquareType.City, name: '갈등 관리 (Conflict Mgmt)', module: 'Team', competency: 'conflict-management' },
  { index: 11, type: SquareType.City, name: '동기 부여 (Motivation)', module: 'Leader', competency: 'motivation' },
  { index: 12, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 13, type: SquareType.City, name: '시간 관리 (Time Mgmt)', module: 'Self', competency: 'time-management' },
  { index: 14, type: SquareType.City, name: '비판적 사고 (Critical Thinking)', module: 'Follower', competency: 'critical-thinking' },
  { index: 15, type: SquareType.City, name: '다양성 포용 (Diversity)', module: 'Team', competency: 'diversity-inclusion' },

  // Top Row (Left to Right)
  { index: 16, type: SquareType.WorldTour, name: '핵심 가치 (Core Values)' },
  { index: 17, type: SquareType.City, name: '임파워먼트 (Empowerment)', module: 'Leader', competency: 'empowerment' },
  { index: 18, type: SquareType.City, name: '회복 탄력성 (Resilience)', module: 'Self', competency: 'resilience' },
  { index: 19, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 20, type: SquareType.City, name: '피드백 수용 (Feedback)', module: 'Follower', competency: 'feedback-reception' },
  { index: 21, type: SquareType.City, name: '상호 책임 (Accountability)', module: 'Team', competency: 'mutual-accountability' },
  { index: 22, type: SquareType.City, name: '의사결정 (Decision Making)', module: 'Leader', competency: 'decision-making' },
  { index: 23, type: SquareType.City, name: '지속 학습 (Learning Agility)', module: 'Self', competency: 'learning-agility' },

  // Right Column (Top to Bottom)
  { index: 24, type: SquareType.Space, name: '혁신 프로젝트 (Challenge)' },
  { index: 25, type: SquareType.City, name: '조직 몰입 (Commitment)', module: 'Follower', competency: 'commitment' },
  { index: 26, type: SquareType.City, name: '협업 툴 활용 (Collaboration)', module: 'Team', competency: 'collaboration-tools' },
  { index: 27, type: SquareType.Fund, name: '사내 벤처 (Innovation)' },
  { index: 28, type: SquareType.City, name: '코칭 (Coaching)', module: 'Leader', competency: 'coaching' },
  { index: 29, type: SquareType.City, name: '자기 비전 (Personal Vision)', module: 'Self', competency: 'personal-vision' },
  { index: 30, type: SquareType.City, name: '서번트 리더십 (Servant)', module: 'Leader', competency: 'servant-leadership' },
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

// ============================================================
// SAMPLE CARDS - 각 모드별 대상에 맞는 딜레마 상황
// ============================================================
// 셀프리더십 (Self): 초급사원 대상 (신입~2년차) - 개인의 성장과 자기관리
// 팔로워십 (Follower): 중급사원 대상 (3~5년차) - 상사/조직과의 관계
// 리더십 (Leader): 매니저 대상 (팀장/관리자) - 팀 운영과 의사결정
// 팀십 (Team): 팀 전체 대상 - 협업과 팀 역학
// ============================================================

export const SAMPLE_CARDS: GameCard[] = [

  // ============================================================
  // SELF MODE (셀프리더십) - 초급사원(신입~2년차) 시점
  // 22개 역량 × Self 모드 = 22개 카드
  // ============================================================

  // SELF-SA-001: 자기 인식 (Self-Awareness)
  {
    id: 'SELF-SA-001',
    type: 'Self',
    competency: 'self-awareness',
    title: '나의 강점 vs 약점',
    situation: '입사 6개월차, 첫 업무 성과 평가에서 "분석력은 뛰어나지만 프레젠테이션 능력이 부족하다"는 피드백을 받았습니다. 다음 분기에 중요한 고객 프레젠테이션 기회가 있는데, 당신이라면 어떻게 하시겠습니까?',
    learningPoint: '자신의 강점과 약점을 객관적으로 인식하고 성장 전략을 수립하는 능력',
    choices: [
      { id: 'A', text: '강점에 집중: 분석 자료를 완벽히 준비하고, 발표는 발표를 잘하는 동료에게 부탁한다.' },
      { id: 'B', text: '약점 극복: 프레젠테이션 스킬 향상을 위해 사내 스피치 교육에 등록하고 직접 발표에 도전한다.' },
    ],
  },

  // SELF-EC-001: 감정 조절 (Emotional Control)
  {
    id: 'SELF-EC-001',
    type: 'Self',
    competency: 'emotional-control',
    title: '억울한 지적 앞에서',
    situation: '오늘 팀 회의에서 선배가 당신의 보고서 실수를 모두 앞에서 크게 지적했습니다. 하지만 그 실수는 선배가 잘못 전달한 정보 때문이었습니다. 얼굴이 화끈거리고 억울한 감정이 밀려옵니다.',
    learningPoint: '직장에서 부정적 감정을 건설적으로 관리하는 방법',
    choices: [
      { id: 'A', text: '즉시 반박: "그건 선배님이 잘못 알려주신 거예요"라고 회의 중 바로 정정한다.' },
      { id: 'B', text: '전략적 대응: "확인해보겠습니다"라고 말한 후, 회의 후 선배에게 개인적으로 사실관계를 정리해서 공유한다.' },
    ],
  },

  // SELF-TM-001: 시간 관리 (Time Management)
  {
    id: 'SELF-TM-001',
    type: 'Self',
    competency: 'time-management',
    title: '마감의 늪',
    situation: '신입사원인 당신에게 세 가지 업무가 동시에 주어졌습니다. A. 오늘 오후 6시까지 팀장님께 보고할 주간 리포트, B. 내일 오전 회의 자료 준비, C. 선배가 "급하다"며 부탁한 데이터 정리. 현재 시간은 오후 2시입니다.',
    learningPoint: '업무 우선순위 설정과 시간 관리의 기본',
    choices: [
      { id: 'A', text: '선배 업무 먼저: 선배가 급하다고 했으니 C를 먼저 끝내고, 야근해서 A와 B를 마무리한다.' },
      { id: 'B', text: '마감순 처리: A(오늘) → B(내일) → C(마감 미정) 순으로 처리하고, C가 늦어지면 선배에게 양해를 구한다.' },
    ],
  },

  // SELF-RS-001: 회복 탄력성 (Resilience)
  {
    id: 'SELF-RS-001',
    type: 'Self',
    competency: 'resilience',
    title: '첫 실패 경험',
    situation: '당신이 처음으로 단독 진행한 소규모 프로젝트가 실패했습니다. 예산도 초과되었고, 결과물도 기대에 미치지 못했습니다. 팀장님은 "다음에 잘하면 된다"고 했지만, 자신감이 바닥으로 떨어졌습니다.',
    learningPoint: '실패에서 배우고 다시 일어서는 회복 탄력성',
    choices: [
      { id: 'A', text: '자기 보호: 당분간 위험한 업무는 피하고, 익숙한 업무에서 자신감을 회복한다.' },
      { id: 'B', text: '원인 분석: 무엇이 잘못되었는지 냉정하게 분석하고, 실패 보고서를 작성하여 팀과 공유한다.' },
    ],
  },

  // SELF-LA-001: 지속 학습 (Learning Agility)
  {
    id: 'SELF-LA-001',
    type: 'Self',
    competency: 'learning-agility',
    title: '새로운 기술의 등장',
    situation: '회사에서 당신이 전혀 모르는 새로운 업무 도구(예: AI 분석 툴)를 도입했습니다. 기존 방식에 익숙한 선배들은 "그냥 예전 방식이 편해"라고 합니다. 하지만 이 도구를 잘 쓰면 업무 효율이 크게 오를 것 같습니다.',
    learningPoint: '새로운 것을 빠르게 배우고 적용하는 학습 민첩성',
    choices: [
      { id: 'A', text: '선배 따라가기: 선배들처럼 기존 방식을 유지하며 조직 분위기에 맞춘다.' },
      { id: 'B', text: '함께 학습: 관심 있는 동기들과 스터디 그룹을 만들어 함께 배우고 팀에 제안한다.' },
    ],
  },

  // SELF-PV-001: 자기 비전 (Personal Vision)
  {
    id: 'SELF-PV-001',
    type: 'Self',
    competency: 'personal-vision',
    title: '3년 후의 나',
    situation: '인사팀에서 신입사원 대상 경력개발 면담을 진행합니다. "3년 후 어떤 모습이 되고 싶은가요?"라는 질문에, 솔직히 아직 잘 모르겠습니다. 현재 업무도 재미있지만, 다른 부서 업무도 궁금합니다.',
    learningPoint: '자신의 커리어 비전을 탐색하고 설정하는 방법',
    choices: [
      { id: 'A', text: '현재에 충실: "지금 맡은 업무의 전문가가 되고 싶습니다"라고 현실적으로 답한다.' },
      { id: 'B', text: '솔직한 탐색: "아직 탐색 중인데, 다양한 업무를 경험해보고 싶습니다"라고 솔직히 말한다.' },
    ],
  },

  // SELF-AL-001: 적극적 경청 (Active Listening)
  {
    id: 'SELF-AL-001',
    type: 'Self',
    competency: 'active-listening',
    title: '팀장님의 진짜 의도',
    situation: '팀장님이 "이 보고서 좀 다시 봐봐"라고 말씀하셨습니다. 하지만 무엇이 문제인지 구체적으로 말씀하지 않았습니다. 보고서를 다시 봐도 뭘 고쳐야 할지 모르겠습니다.',
    learningPoint: '상사의 말 속에 숨겨진 의도를 파악하는 적극적 경청',
    choices: [
      { id: 'A', text: '추측 수정: 아마 형식이 문제일 것 같으니 폰트와 레이아웃을 다시 정리한다.' },
      { id: 'B', text: '직접 질문: "어떤 부분을 보완하면 좋을지 구체적으로 여쭤봐도 될까요?"라고 다시 찾아간다.' },
    ],
  },

  // SELF-PR-001: 능동적 수행 (Proactivity)
  {
    id: 'SELF-PR-001',
    type: 'Self',
    competency: 'proactivity',
    title: '지시받지 않은 일',
    situation: '팀 회의 중 경쟁사 동향 분석이 필요하다는 이야기가 나왔지만, 아무에게도 배정되지 않았습니다. 당신은 이 분야에 관심이 있고 할 수 있을 것 같은데, 본업도 바쁜 상황입니다.',
    learningPoint: '지시 없이도 조직에 기여하는 능동적 자세',
    choices: [
      { id: 'A', text: '본업 집중: 내 일도 아닌데 나서면 오지랖일 수 있으니, 맡은 일에 집중한다.' },
      { id: 'B', text: '제안 후 승인: 팀장님께 "제가 해볼까요?"라고 먼저 제안하고 승인을 받은 후 진행한다.' },
    ],
  },

  // SELF-CT-001: 비판적 사고 (Critical Thinking)
  {
    id: 'SELF-CT-001',
    type: 'Self',
    competency: 'critical-thinking',
    title: '관행에 대한 의문',
    situation: '팀에서 매주 작성하는 업무 보고서가 있습니다. 하지만 이 보고서를 실제로 활용하는 사람이 없어 보입니다. 선배들은 "원래 하던 거니까 그냥 해"라고 합니다. 시간 낭비 같습니다.',
    learningPoint: '조직의 관행에 건설적으로 의문을 제기하는 비판적 사고',
    choices: [
      { id: 'A', text: '순응: 선배 말대로 조직 문화니까 그냥 따른다. 신입이 나서면 건방져 보인다.' },
      { id: 'B', text: '데이터 수집: 먼저 이 보고서가 실제로 어떻게 사용되는지 조사하고, 개선안과 함께 팀장님께 건의한다.' },
    ],
  },

  // SELF-FR-001: 피드백 수용 (Feedback Reception)
  {
    id: 'SELF-FR-001',
    type: 'Self',
    competency: 'feedback-reception',
    title: '날카로운 피드백',
    situation: '발표 후 팀장님이 "전달력이 약하고, 핵심이 안 보인다"고 직접적으로 피드백했습니다. 나름 열심히 준비했는데 기분이 상합니다. 동료들 앞에서 쪽팔리기도 합니다.',
    learningPoint: '부정적 피드백을 성장의 기회로 전환하는 태도',
    choices: [
      { id: 'A', text: '방어: "시간이 부족했어요" 등 상황을 설명하며 변명한다.' },
      { id: 'B', text: '심화 질문: "구체적으로 어떤 부분에서 핵심이 안 보였는지 여쭤봐도 될까요?"라고 추가 질문한다.' },
    ],
  },

  // SELF-CM-001: 조직 몰입 (Commitment)
  {
    id: 'SELF-CM-001',
    type: 'Self',
    competency: 'commitment',
    title: '회사 vs 개인 시간',
    situation: '금요일 오후, 팀장님이 "다음 주 월요일까지 급한 자료가 필요한데, 이번 주말에 가능할까?"라고 물었습니다. 이번 주말은 오랜만에 친구들과 여행 계획이 있습니다.',
    learningPoint: '조직에 대한 몰입과 개인 생활의 균형',
    choices: [
      { id: 'A', text: '회사 우선: 여행을 취소하고 주말에 일한다. 신입은 인정받아야 한다.' },
      { id: 'B', text: '대안 제시: 여행을 하루 줄이고, 일요일에 원격으로 작업해서 월요일 아침에 제출하겠다고 제안한다.' },
    ],
  },

  // SELF-CD-001: 명확한 지시 (Clear Direction) - 초급사원 시점
  {
    id: 'SELF-CD-001',
    type: 'Self',
    competency: 'clear-direction',
    title: '애매한 업무 지시',
    situation: '팀장님이 "다음 주 회의 자료 준비해줘"라고만 말씀하셨습니다. 어떤 회의인지, 어떤 내용을 담아야 하는지, 분량은 어느 정도인지 전혀 모르겠습니다. 팀장님은 바빠 보입니다.',
    learningPoint: '모호한 지시를 받았을 때 명확하게 확인하는 방법',
    choices: [
      { id: 'A', text: '알아서 준비: 이전 회의 자료를 참고해서 비슷하게 만들어본다.' },
      { id: 'B', text: '구체적 질문: 팀장님께 회의 목적, 참석자, 필요한 내용을 간단히 여쭤본다.' },
    ],
  },

  // SELF-MO-001: 동기 부여 (Motivation) - 초급사원 시점
  {
    id: 'SELF-MO-001',
    type: 'Self',
    competency: 'motivation',
    title: '반복되는 일상',
    situation: '입사 1년차, 매일 비슷한 업무가 반복됩니다. 처음의 열정은 사라지고 "이게 내가 원하던 일인가?" 하는 생각이 듭니다. 월요일 아침 출근이 점점 힘들어집니다.',
    learningPoint: '스스로 동기를 찾고 유지하는 방법',
    choices: [
      { id: 'A', text: '버티기: 원래 직장 생활이 이런 거다. 참고 버티면서 월급을 생각한다.' },
      { id: 'B', text: '의미 찾기: 내 업무가 팀과 회사에 어떻게 기여하는지 파악하고, 작은 도전 과제를 스스로 설정해본다.' },
    ],
  },

  // SELF-EM-001: 임파워먼트 (Empowerment) - 초급사원 시점
  {
    id: 'SELF-EM-001',
    type: 'Self',
    competency: 'empowerment',
    title: '갑자기 주어진 권한',
    situation: '팀장님이 출장 중이라 "이번 주 미팅은 네가 알아서 진행해봐"라고 하셨습니다. 처음으로 주어진 권한인데, 결정을 잘못 내리면 어쩌나 걱정됩니다.',
    learningPoint: '위임받은 권한을 효과적으로 활용하는 방법',
    choices: [
      { id: 'A', text: '최소 결정: 가능한 결정을 미루고, 팀장님 복귀 후 모든 것을 확인받는다.' },
      { id: 'B', text: '책임감 있게 진행: 미팅을 진행하되, 주요 결정 사항은 기록해서 팀장님께 사후 보고한다.' },
    ],
  },

  // SELF-DM-001: 의사결정 (Decision Making) - 초급사원 시점
  {
    id: 'SELF-DM-001',
    type: 'Self',
    competency: 'decision-making',
    title: '두 가지 방법 사이에서',
    situation: '업무를 처리하는 두 가지 방법이 있습니다. A 방법은 빠르지만 품질이 떨어질 수 있고, B 방법은 시간이 오래 걸리지만 확실합니다. 마감이 촉박한데, 어떤 방법을 선택해야 할지 모르겠습니다.',
    learningPoint: '제한된 정보 속에서 합리적인 결정을 내리는 방법',
    choices: [
      { id: 'A', text: '빠른 처리: A 방법으로 일단 마감을 맞추고, 이후 보완한다.' },
      { id: 'B', text: '상황 공유: 팀장님께 두 방법의 장단점을 설명하고, 마감 연장 또는 방법 선택에 대해 조언을 구한다.' },
    ],
  },

  // SELF-CO-001: 코칭 (Coaching) - 초급사원 시점
  {
    id: 'SELF-CO-001',
    type: 'Self',
    competency: 'coaching',
    title: '도움을 요청한 동기',
    situation: '같이 입사한 동기가 업무에 어려움을 겪고 있어 몰래 도움을 요청했습니다. 알려주고 싶지만, 내 일도 바쁘고 잘못 알려주면 오히려 해가 될까 걱정됩니다.',
    learningPoint: '동료를 돕는 것과 자신의 업무 사이의 균형',
    choices: [
      { id: 'A', text: '거절: 미안하지만 내 일도 바쁘다고 솔직히 말하고, 선배에게 물어보라고 권한다.' },
      { id: 'B', text: '시간 확보: 점심시간이나 잠깐의 시간을 내서 내가 아는 범위에서 도와준다.' },
    ],
  },

  // SELF-SL-001: 서번트 리더십 (Servant Leadership) - 초급사원 시점
  {
    id: 'SELF-SL-001',
    type: 'Self',
    competency: 'servant-leadership',
    title: '팀을 위한 허드렛일',
    situation: '팀 회의 준비, 회의록 작성, 자료 정리 등 누군가는 해야 하는 일인데 아무도 하려고 하지 않습니다. 신입이니까 내가 해야 할 것 같기도 하고, 이런 일만 하면 성장에 도움이 안 될 것 같기도 합니다.',
    learningPoint: '팀에 기여하면서도 자신의 성장을 도모하는 방법',
    choices: [
      { id: 'A', text: '회피: 남들처럼 눈치껏 빠진다. 내 성장에 도움되는 일에 집중한다.' },
      { id: 'B', text: '전략적 기여: 자발적으로 맡되, 이 과정에서 팀 전체 업무 흐름을 파악하는 기회로 삼는다.' },
    ],
  },

  // SELF-PS-001: 심리적 안전감 (Psychological Safety) - 초급사원 시점
  {
    id: 'SELF-PS-001',
    type: 'Self',
    competency: 'psychological-safety',
    title: '실수를 보고해야 할 때',
    situation: '업무 중 작은 실수를 발견했습니다. 지금 말하면 고칠 수 있지만, 팀장님께 혼날 것 같습니다. 나중에 발견되면 더 큰 문제가 될 수도 있습니다.',
    learningPoint: '실수를 솔직하게 인정하고 보고하는 용기',
    choices: [
      { id: 'A', text: '숨기기: 아무도 모르게 조용히 수정하고 넘어간다.' },
      { id: 'B', text: '즉시 보고: 팀장님께 실수를 보고하고, 수정 계획과 재발 방지책을 함께 제시한다.' },
    ],
  },

  // SELF-CF-001: 갈등 관리 (Conflict Management) - 초급사원 시점
  {
    id: 'SELF-CF-001',
    type: 'Self',
    competency: 'conflict-management',
    title: '동기와의 마찰',
    situation: '같은 팀 동기와 업무 방식 때문에 의견 충돌이 생겼습니다. 서로 기분이 상해 말을 안 하고 있습니다. 팀 분위기가 어색해지고 있습니다.',
    learningPoint: '동료와의 갈등을 건설적으로 해결하는 방법',
    choices: [
      { id: 'A', text: '시간이 해결: 시간이 지나면 괜찮아지겠지. 일단 거리를 두고 각자 할 일 한다.' },
      { id: 'B', text: '먼저 대화: 점심이나 커피를 제안하며 "우리 얘기 좀 할까?"라고 먼저 다가간다.' },
    ],
  },

  // SELF-DI-001: 다양성 포용 (Diversity & Inclusion) - 초급사원 시점
  {
    id: 'SELF-DI-001',
    type: 'Self',
    competency: 'diversity-inclusion',
    title: '다른 세대와의 협업',
    situation: '20년 경력의 시니어와 함께 일하게 되었습니다. 일하는 방식이 너무 다릅니다. 시니어는 대면 보고를 선호하고, 당신은 메신저가 효율적이라고 생각합니다.',
    learningPoint: '다른 배경과 스타일을 가진 사람과 효과적으로 협업하는 방법',
    choices: [
      { id: 'A', text: '내 방식 고수: 효율성을 위해 메신저로 보고하고, 시니어도 적응해야 한다고 생각한다.' },
      { id: 'B', text: '맞춤 소통: 시니어에게는 대면 보고를 하면서, 그분의 경험에서 배울 점을 찾아본다.' },
    ],
  },

  // SELF-MA-001: 상호 책임 (Mutual Accountability) - 초급사원 시점
  {
    id: 'SELF-MA-001',
    type: 'Self',
    competency: 'mutual-accountability',
    title: '팀 과제에서 무임승차',
    situation: '팀 프로젝트에서 한 동료가 맡은 부분을 계속 미루고 있습니다. 덕분에 다른 팀원들 일이 늘어나고 있습니다. 팀장님은 모르는 것 같습니다.',
    learningPoint: '팀원으로서 상호 책임을 다하고 요구하는 방법',
    choices: [
      { id: 'A', text: '대신 처리: 불만이지만 팀을 위해 그 사람 몫까지 내가 한다.' },
      { id: 'B', text: '직접 대화: 먼저 그 동료에게 "도움이 필요하면 말해줘"라며 상황을 확인한다.' },
    ],
  },

  // SELF-CL-001: 협업 툴 활용 (Collaboration Tools) - 초급사원 시점
  {
    id: 'SELF-CL-001',
    type: 'Self',
    competency: 'collaboration-tools',
    title: '정보의 미로',
    situation: '팀에서 이메일, 메신저, 사내 시스템을 모두 사용합니다. 중요한 정보가 어디 있는지 찾기 어렵고, 같은 질문을 여러 번 받습니다. 혼란스럽습니다.',
    learningPoint: '협업 도구를 효과적으로 활용하는 방법',
    choices: [
      { id: 'A', text: '적응: 원래 이런 거라고 생각하고, 매번 찾아다닌다.' },
      { id: 'B', text: '정리 시도: 내가 맡은 업무에 대해서는 정보를 한 곳에 정리하고, 동료들에게 공유한다.' },
    ],
  },

  // ============================================================
  // FOLLOWERSHIP (팔로워십) - 초급~중급사원 대상
  // ============================================================

  // F-001: 적극적 경청 (Active Listening)
  {
    id: 'F-001',
    type: 'Follower',
    title: '팀장님의 진짜 의도',
    situation: '팀장님이 "이 보고서 좀 다시 봐봐"라고 말씀하셨습니다. 하지만 무엇이 문제인지 구체적으로 말씀하지 않았습니다. 보고서를 다시 봐도 뭘 고쳐야 할지 모르겠습니다.',
    learningPoint: '상사의 말 속에 숨겨진 의도를 파악하는 적극적 경청',
    choices: [
      { id: 'A', text: '추측 수정: 아마 형식이 문제일 것 같으니 폰트와 레이아웃을 다시 정리한다.' },
      { id: 'B', text: '직접 질문: "어떤 부분을 보완하면 좋을지 구체적으로 여쭤봐도 될까요?"라고 다시 찾아간다.' },
      { id: 'C', text: '동료 상담: 옆자리 선배에게 보고서를 보여주며 뭐가 문제인지 물어본다.' },
    ],
  },

  // F-002: 능동적 수행 (Proactivity)
  {
    id: 'F-002',
    type: 'Follower',
    title: '지시받지 않은 일',
    situation: '팀 회의 중 경쟁사 동향 분석이 필요하다는 이야기가 나왔지만, 아무에게도 배정되지 않았습니다. 당신은 이 분야에 관심이 있고 할 수 있을 것 같은데, 본업도 바쁜 상황입니다.',
    learningPoint: '지시 없이도 조직에 기여하는 능동적 자세',
    choices: [
      { id: 'A', text: '본업 집중: 내 일도 아닌데 나서면 오지랖일 수 있으니, 맡은 일에 집중한다.' },
      { id: 'B', text: '자발적 착수: 퇴근 후 시간을 내서 경쟁사 분석 자료를 만들어 팀장님께 공유한다.' },
      { id: 'C', text: '제안 후 승인: 팀장님께 "제가 해볼까요?"라고 먼저 제안하고 승인을 받은 후 진행한다.' },
    ],
  },

  // F-003: 비판적 사고 (Critical Thinking)
  {
    id: 'F-003',
    type: 'Follower',
    title: '관행에 대한 의문',
    situation: '팀에서 매주 작성하는 업무 보고서가 있습니다. 하지만 이 보고서를 실제로 활용하는 사람이 없어 보입니다. 선배들은 "원래 하던 거니까 그냥 해"라고 합니다. 시간 낭비 같습니다.',
    learningPoint: '조직의 관행에 건설적으로 의문을 제기하는 비판적 사고',
    choices: [
      { id: 'A', text: '순응: 선배 말대로 조직 문화니까 그냥 따른다. 신입이 나서면 건방져 보인다.' },
      { id: 'B', text: '직접 제안: 팀 회의에서 "이 보고서의 목적과 활용도를 재검토하면 어떨까요?"라고 제안한다.' },
      { id: 'C', text: '데이터 수집: 먼저 이 보고서가 실제로 어떻게 사용되는지 조사하고, 개선안과 함께 팀장님께 건의한다.' },
    ],
  },

  // F-004: 피드백 수용 (Feedback Reception)
  {
    id: 'F-004',
    type: 'Follower',
    title: '날카로운 피드백',
    situation: '발표 후 팀장님이 "전달력이 약하고, 핵심이 안 보인다"고 직접적으로 피드백했습니다. 나름 열심히 준비했는데 기분이 상합니다. 동료들 앞에서 쪽팔리기도 합니다.',
    learningPoint: '부정적 피드백을 성장의 기회로 전환하는 태도',
    choices: [
      { id: 'A', text: '방어: "시간이 부족했어요" 등 상황을 설명하며 변명한다.' },
      { id: 'B', text: '수용: "네, 보완하겠습니다"라고 일단 수긍하고, 속으로 삭힌다.' },
      { id: 'C', text: '심화 질문: "구체적으로 어떤 부분에서 핵심이 안 보였는지 여쭤봐도 될까요?"라고 추가 질문한다.' },
    ],
  },

  // F-005: 조직 몰입 (Organizational Commitment)
  {
    id: 'F-005',
    type: 'Follower',
    title: '회사 vs 개인 시간',
    situation: '금요일 오후, 팀장님이 "다음 주 월요일까지 급한 자료가 필요한데, 이번 주말에 가능할까?"라고 물었습니다. 이번 주말은 오랜만에 친구들과 여행 계획이 있습니다.',
    learningPoint: '조직에 대한 몰입과 개인 생활의 균형',
    choices: [
      { id: 'A', text: '회사 우선: 여행을 취소하고 주말에 일한다. 신입은 인정받아야 한다.' },
      { id: 'B', text: '개인 우선: "죄송하지만 주말에 선약이 있어서 월요일 일찍 출근해서 하겠습니다"라고 한다.' },
      { id: 'C', text: '대안 제시: 여행을 하루 줄이고, 일요일에 원격으로 작업해서 월요일 아침에 제출하겠다고 제안한다.' },
    ],
  },

  // ============================================================
  // LEADERSHIP (리더십) - 매니저~관리자 대상
  // ============================================================

  // L-001: 명확한 지시 (Clear Direction)
  {
    id: 'L-001',
    type: 'Leader',
    title: '모호한 목표의 딜레마',
    situation: '임원이 "다음 달까지 매출 늘려봐"라는 모호한 지시를 내렸습니다. 구체적인 수치 목표도, 예산도, 방법론도 없습니다. 팀원들에게 어떻게 업무를 할당해야 할지 고민됩니다.',
    learningPoint: '모호한 상위 지시를 구체적인 팀 목표로 전환하는 능력',
    choices: [
      { id: 'A', text: '그대로 전달: 팀원들에게 "매출 올리자"고 하고 각자 알아서 방법을 찾게 한다.' },
      { id: 'B', text: '구체화 후 전달: 직접 목표를 10% 증가로 설정하고, 담당별 구체적 액션을 정해서 지시한다.' },
      { id: 'C', text: '상위 확인: 임원에게 "구체적인 목표치와 우선순위를 확인해도 될까요?"라고 역질문한다.' },
    ],
  },

  // L-002: 동기 부여 (Motivation)
  {
    id: 'L-002',
    type: 'Leader',
    title: '매너리즘에 빠진 팀원',
    situation: '한때 열정적이었던 5년차 팀원이 요즘 의욕 없이 최소한의 일만 합니다. 성과도 떨어지고 있습니다. 개인 면담에서 "이 일에 더 이상 성장이 없는 것 같다"고 털어놓았습니다.',
    learningPoint: '팀원의 내재적 동기를 파악하고 자극하는 방법',
    choices: [
      { id: 'A', text: '성과 압박: 명확한 목표를 제시하고 달성하지 못하면 인사 불이익이 있음을 경고한다.' },
      { id: 'B', text: '성장 기회 제공: 새로운 프로젝트 리더 역할이나 교육 기회를 제안하여 도전 과제를 부여한다.' },
      { id: 'C', text: '경청과 공감: 어떤 일을 할 때 가장 보람을 느끼는지 깊이 대화하고, 업무 재조정을 검토한다.' },
    ],
  },

  // L-003: 임파워먼트 (Empowerment)
  {
    id: 'L-003',
    type: 'Leader',
    title: '권한 위임의 경계',
    situation: '중요한 고객사 미팅을 유능한 차석에게 맡기려 합니다. 그런데 이 고객은 까다롭기로 유명하고, 만약 미팅이 잘못되면 계약을 잃을 수도 있습니다.',
    learningPoint: '적절한 권한 위임과 리스크 관리의 균형',
    choices: [
      { id: 'A', text: '직접 수행: 리스크가 크니 내가 직접 미팅을 주도하고, 차석은 보조 역할만 맡긴다.' },
      { id: 'B', text: '전면 위임: 차석을 믿고 전권을 맡기되, 결과에 대한 책임은 내가 진다고 선언한다.' },
      { id: 'C', text: '단계적 위임: 미팅 준비와 리허설을 함께하고, 미팅에는 배석하되 차석이 리드하게 한다.' },
    ],
  },

  // L-004: 의사결정 (Decision Making)
  {
    id: 'L-004',
    type: 'Leader',
    title: '데이터 vs 직관',
    situation: '신제품 출시 여부를 결정해야 합니다. 시장 조사 데이터는 "리스크가 높다"고 나왔지만, 현장 영업팀의 직관은 "충분히 승산이 있다"입니다. 결정 마감이 오늘입니다.',
    learningPoint: '불확실한 상황에서 합리적 의사결정을 내리는 방법',
    choices: [
      { id: 'A', text: '데이터 우선: 조사 결과를 신뢰하고 출시를 보류한다.' },
      { id: 'B', text: '현장 직관 우선: 영업팀을 믿고 출시를 강행한다.' },
      { id: 'C', text: '소규모 테스트: 특정 지역에서 파일럿 테스트 후 결과를 보고 전면 출시 여부를 결정한다.' },
    ],
  },

  // L-005: 코칭 (Coaching)
  {
    id: 'L-005',
    type: 'Leader',
    title: '실수를 반복하는 팀원',
    situation: '같은 유형의 실수를 세 번째 반복하는 팀원이 있습니다. 매번 지적하면 미안하다고 하지만 개선이 없습니다. 이번에도 고객 클레임으로 이어졌습니다.',
    learningPoint: '효과적인 피드백과 행동 변화를 이끄는 코칭 스킬',
    choices: [
      { id: 'A', text: '경고 조치: 이번이 마지막 기회임을 명확히 하고, 재발 시 인사조치가 있음을 통보한다.' },
      { id: 'B', text: '원인 분석: 왜 같은 실수가 반복되는지 함께 분석하고, 업무 프로세스나 체크리스트를 함께 만든다.' },
      { id: 'C', text: '업무 재배치: 이 업무가 적성에 안 맞는 것 같으니 다른 역할로 재배치한다.' },
    ],
  },

  // L-006: 서번트 리더십 (Servant Leadership)
  {
    id: 'L-006',
    type: 'Leader',
    title: '팀의 성공 vs 나의 공로',
    situation: '팀 프로젝트가 대성공하여 임원진 앞에서 발표할 기회가 왔습니다. 사실 대부분의 아이디어는 막내 팀원에게서 나왔습니다. 당신이 발표를 하면 승진에 유리할 것입니다.',
    learningPoint: '팀원의 성장과 인정 기회를 우선시하는 서번트 리더십',
    choices: [
      { id: 'A', text: '내가 발표: 팀장으로서 결과에 책임졌으니 내가 발표하고, 팀원들 이름은 슬라이드에 넣는다.' },
      { id: 'B', text: '막내 발표: 막내에게 발표 기회를 주고, 나는 옆에서 서포트한다.' },
      { id: 'C', text: '공동 발표: 막내와 함께 발표하며, 아이디어의 출처가 막내임을 임원진 앞에서 명확히 밝힌다.' },
    ],
  },

  // ============================================================
  // TEAMSHIP (팀십) - 팀 전체 대상
  // ============================================================

  // T-001: 심리적 안전감 (Psychological Safety)
  {
    id: 'T-001',
    type: 'Team',
    title: '실수를 말할 수 있는 팀',
    situation: '팀원이 고객 데이터를 실수로 삭제했습니다. 복구는 가능하지만 시간이 걸립니다. 이 팀원은 "말하면 혼날까봐 무서웠다"며 하루가 지나서야 보고했습니다. 팀 분위기를 어떻게 바꿔야 할까요?',
    learningPoint: '실수를 숨기지 않고 공유할 수 있는 심리적 안전감 조성',
    choices: [
      { id: 'A', text: '처벌 강화: 늦은 보고에 대해 공식 경고를 주어, 다음부터 즉시 보고하게 한다.' },
      { id: 'B', text: '문화 개선: 팀 미팅에서 "실수는 빨리 공유해야 한다"는 원칙을 세우고, 리더인 내 실수 사례를 먼저 공유한다.' },
      { id: 'C', text: '시스템 개선: 실수 보고 채널을 익명으로 만들어 부담을 줄인다.' },
    ],
  },

  // T-002: 갈등 관리 (Conflict Management)
  {
    id: 'T-002',
    type: 'Team',
    title: '아이디어 충돌',
    situation: '중요한 프로젝트 방향성에 대해 두 팀원이 정면으로 대립하고 있습니다. A는 "안정적인 기존 방식"을, B는 "혁신적인 새 방식"을 주장합니다. 회의는 점점 감정적으로 변하고 있습니다.',
    learningPoint: '업무적 갈등을 생산적으로 해결하는 방법',
    choices: [
      { id: 'A', text: '리더 결정: 논쟁을 중단시키고 내가 A 또는 B 방식 중 하나를 최종 결정한다.' },
      { id: 'B', text: '투표: 팀 전체 투표로 결정하여 민주적 정당성을 확보한다.' },
      { id: 'C', text: '통합 모색: 두 접근법의 장점을 결합한 제3의 대안을 함께 찾아본다.' },
    ],
  },

  // T-003: 다양성 포용 (Diversity & Inclusion)
  {
    id: 'T-003',
    type: 'Team',
    title: '다른 의견의 가치',
    situation: '팀 회의에서 대부분 비슷한 의견으로 빠르게 합의가 이루어지고 있습니다. 그런데 한 명만 계속 "그래도 문제가 있을 것 같은데..."라며 다른 의견을 냅니다. 회의 시간이 길어지고 있습니다.',
    learningPoint: '소수 의견의 가치를 인정하고 다양성을 존중하는 팀 문화',
    choices: [
      { id: 'A', text: '다수결 진행: "충분히 들었으니 다수 의견으로 가자"며 진행한다.' },
      { id: 'B', text: '심층 탐구: 그 사람에게 "구체적으로 어떤 문제가 예상되나요?"라고 더 깊이 물어본다.' },
      { id: 'C', text: '악마의 옹호자: "만약 이 분의 우려가 맞다면?"이라고 가정하고 팀 전체가 반대 논리를 검토한다.' },
    ],
  },

  // T-004: 상호 책임 (Mutual Accountability)
  {
    id: 'T-004',
    type: 'Team',
    title: '무임승차자 문제',
    situation: '팀 프로젝트에서 한 명이 맡은 파트를 계속 늦게 제출하고, 품질도 낮습니다. 다른 팀원들이 그 사람 몫까지 커버하느라 지쳐가고 있습니다. 팀장에게 말하자니 고자질 같고, 직접 말하자니 분위기가 나빠질 것 같습니다.',
    learningPoint: '팀원 간 상호 책임을 지는 문화 형성',
    choices: [
      { id: 'A', text: '직접 대화: 당사자에게 개인적으로 "요즘 힘든 일 있어? 같이 해결해보자"라고 먼저 다가간다.' },
      { id: 'B', text: '팀 미팅 의제화: 개인을 지목하지 않고 "업무 분담과 일정 준수"를 팀 미팅 안건으로 올린다.' },
      { id: 'C', text: '팀장 보고: 상황을 팀장에게 보고하고 해결을 요청한다.' },
    ],
  },

  // T-005: 협업 툴 활용 (Collaboration Tools)
  {
    id: 'T-005',
    type: 'Team',
    title: '협업 도구의 혼란',
    situation: '팀에서 업무 소통에 이메일, 메신저, 프로젝트 관리 툴을 모두 사용하고 있습니다. 중요한 정보가 여기저기 흩어져 있어서 "그거 어디서 공유했더라?" 하는 상황이 자주 발생합니다.',
    learningPoint: '효율적인 협업을 위한 도구와 규칙 정립',
    choices: [
      { id: 'A', text: '단일화: 한 가지 도구로 통일하자고 제안하고 나머지는 사용을 중단한다.' },
      { id: 'B', text: '용도 구분: 각 도구의 용도를 명확히 정의한 "소통 가이드라인"을 만들어 팀에 공유한다.' },
      { id: 'C', text: '자유 유지: 각자 편한 도구를 쓰되, 중요한 건 여러 곳에 중복 공유한다.' },
    ],
  },

  // ============================================================
  // CORE VALUE (핵심 가치) - 가치 딜레마
  // ============================================================

  {
    id: 'V-001',
    type: 'CoreValue',
    title: '정직 vs 충성',
    situation: '거래처와의 미팅에서 우리 제품의 단점을 질문받았습니다. 솔직히 대답하면 계약이 어려울 수 있고, 애매하게 넘기면 거래처에 불이익이 갈 수 있습니다.',
    learningPoint: '정직과 조직 이익 사이의 가치 갈등',
    choices: [
      { id: 'A', text: '[정직] 단점을 솔직히 인정하되, 해결 방안과 함께 제시한다.' },
      { id: 'B', text: '[충성] 회사 이익을 위해 단점은 최소화하고 장점을 부각한다.' },
      { id: 'C', text: '[신뢰] "추가 확인 후 정확히 안내드리겠다"며 시간을 번다.' },
    ],
  },

  {
    id: 'V-002',
    type: 'CoreValue',
    title: '공정 vs 배려',
    situation: '팀 내 성과 평가 시즌입니다. A는 성과가 높지만 태도가 좋지 않고, B는 성과는 평범하지만 힘든 가정사를 겪으면서도 성실하게 근무했습니다. 우수 평가를 한 명에게만 줄 수 있습니다.',
    learningPoint: '공정성과 인간적 배려 사이의 가치 균형',
    choices: [
      { id: 'A', text: '[공정] 성과 기준으로 A에게 우수 평가를 준다. 기준은 명확해야 한다.' },
      { id: 'B', text: '[배려] B의 상황을 고려하여 우수 평가를 준다. 과정도 중요하다.' },
      { id: 'C', text: '[투명] 두 사람에게 상황을 설명하고, 다른 보상 방법을 함께 찾는다.' },
    ],
  },

  {
    id: 'V-003',
    type: 'CoreValue',
    title: '혁신 vs 안정',
    situation: '회사의 핵심 제품을 완전히 새로운 버전으로 바꿀지 논의 중입니다. 새 버전은 혁신적이지만 기존 고객 이탈 위험이 있습니다. 현행 유지는 안정적이지만 시장 트렌드에 뒤처질 수 있습니다.',
    learningPoint: '혁신과 안정 사이의 전략적 가치 선택',
    choices: [
      { id: 'A', text: '[혁신] 과감하게 새 버전으로 전환한다. 변화하지 않으면 도태된다.' },
      { id: 'B', text: '[안정] 기존 제품을 유지하면서 점진적으로 개선한다.' },
      { id: 'C', text: '[균형] 새 버전은 신규 라인으로 출시하고, 기존 제품도 병행 유지한다.' },
    ],
  },

  // ============================================================
  // CHALLENGE (혁신 도전) - 주관식
  // ============================================================

  {
    id: 'C-001',
    type: 'Challenge',
    title: '업무 혁신 아이디어',
    situation: '당신이 현재 맡고 있는 업무 중에서 가장 비효율적이라고 생각하는 것은 무엇이며, 이를 어떻게 개선하시겠습니까? 구체적인 아이디어를 제시해 주세요.',
    learningPoint: '현장의 문제를 발견하고 해결책을 제안하는 능력',
    choices: [],
  },

  {
    id: 'C-002',
    type: 'Challenge',
    title: '고객 경험 혁신',
    situation: '우리 회사의 제품이나 서비스를 이용하는 고객의 입장이 되어봤을 때, 가장 불편하거나 아쉬운 점은 무엇일까요? 그리고 어떻게 개선할 수 있을까요?',
    learningPoint: '고객 관점에서 사고하고 혁신을 제안하는 능력',
    choices: [],
  },

  {
    id: 'C-003',
    type: 'Challenge',
    title: '미래 성장 동력',
    situation: '5년 후 우리 회사가 새롭게 진출해야 할 사업 영역은 무엇이라고 생각하십니까? 그 이유와 구체적인 진출 방안을 제안해 주세요.',
    learningPoint: '전략적 사고와 미래 비전 수립 능력',
    choices: [],
  },

  // ============================================================
  // EVENT (우연한 기회) - 항상 긍정적 이벤트
  // ============================================================

  {
    id: 'E-001',
    type: 'Event',
    title: '뜻밖의 특별 보너스',
    situation: '회사의 연말 실적이 예상보다 좋아 특별 예산이 팀에 배정되었습니다. 이 예산을 어떻게 사용하는 것이 팀에 가장 도움이 될까요?',
    learningPoint: '제한된 자원의 효과적 배분',
    choices: [
      { id: 'A', text: '팀원들에게 공평하게 현금 보너스로 분배한다. (사기 진작)' },
      { id: 'B', text: '최신 업무 장비를 구매하여 업무 효율을 높인다. (생산성 향상)' },
      { id: 'C', text: '팀 교육비와 워크샵 비용으로 사용한다. (역량 강화)' },
    ],
  },

  {
    id: 'E-002',
    type: 'Event',
    title: '업계 어워드 수상',
    situation: '우리 팀의 프로젝트가 업계 혁신 어워드를 수상했습니다! 상금과 함께 언론 주목을 받게 되었습니다. 이 기회를 어떻게 활용하시겠습니까?',
    learningPoint: '성공의 순간을 팀과 조직에 유익하게 활용',
    choices: [
      { id: 'A', text: '대대적인 언론 홍보로 회사 브랜드 이미지를 높인다.' },
      { id: 'B', text: '팀원들과 특별한 축하 행사를 열어 노고를 치하한다.' },
      { id: 'C', text: '상금을 사회에 기부하여 기업 사회적 책임을 실천한다.' },
    ],
  },

  {
    id: 'E-003',
    type: 'Event',
    title: '힐링 데이',
    situation: '회사 창립기념일로 전사 휴무가 갑자기 결정되었습니다. 팀에게 이 휴일을 어떻게 보내자고 제안하시겠습니까?',
    learningPoint: '휴식과 재충전의 가치',
    choices: [
      { id: 'A', text: '완전한 휴식을 권장하고, 업무 연락을 자제한다.' },
      { id: 'B', text: '가벼운 팀 모임을 제안하여 친목을 도모한다.' },
      { id: 'C', text: '최신 트렌드 탐방(전시회, 팝업스토어 등)을 함께 간다.' },
    ],
  },

  {
    id: 'E-004',
    type: 'Event',
    title: 'CEO와의 오찬',
    situation: 'CEO가 우리 팀의 성과를 치하하며 점심 식사를 제안했습니다. 이 귀한 자리에서 무엇을 어필하시겠습니까?',
    learningPoint: '상향 영향력과 커뮤니케이션',
    choices: [
      { id: 'A', text: '팀의 성과와 기여도를 구체적으로 어필하여 자원을 확보한다.' },
      { id: 'B', text: '현장의 애로사항을 솔직히 공유하여 지원을 요청한다.' },
      { id: 'C', text: '회사의 미래에 대한 팀의 새로운 아이디어를 제안한다.' },
    ],
  },

  // ============================================================
  // BURNOUT (번아웃) - 항상 부정적 이벤트 (피해 최소화)
  // ============================================================

  {
    id: 'B-001',
    type: 'Burnout',
    title: '핵심 인력 퇴사 위기',
    situation: '팀의 핵심 인재가 갑자기 사직서를 제출했습니다. 이유를 물으니 "번아웃"이라고 합니다. 이 사람이 빠지면 진행 중인 프로젝트에 차질이 생깁니다.',
    learningPoint: '위기 상황에서의 피해 최소화 결정',
    choices: [
      { id: 'A', text: '잔류 설득: 연봉 인상과 휴가를 제안하며 잔류를 설득한다.' },
      { id: 'B', text: '인수인계 집중: 퇴사를 수용하되, 1개월간 인수인계 기간을 협의한다.' },
      { id: 'C', text: '업무 재분배: 즉시 다른 팀원들에게 업무를 분배하고 채용 절차를 시작한다.' },
    ],
  },

  {
    id: 'B-002',
    type: 'Burnout',
    title: '프로젝트 일정 지연',
    situation: '핵심 팀원들의 과로로 프로젝트가 지연되고 있습니다. 고객은 불만이고, 팀원들은 탈진 상태입니다. 현재 인력으로는 원래 일정을 맞출 수 없습니다.',
    learningPoint: '프로젝트 위기 관리와 이해관계자 조정',
    choices: [
      { id: 'A', text: '일정 연장: 고객에게 솔직히 사과하고 일정 연장을 협의한다.' },
      { id: 'B', text: '외부 투입: 외주 인력을 긴급 투입하여 일정을 맞춘다. [자본 대량 투입]' },
      { id: 'C', text: '범위 축소: 기능을 최소화하여 핵심만 일정에 맞춰 출시한다.' },
    ],
  },

  {
    id: 'B-003',
    type: 'Burnout',
    title: '팀 분위기 악화',
    situation: '최근 야근이 계속되면서 팀 분위기가 극도로 나빠졌습니다. 팀원들 사이에 언쟁이 잦아지고, 소통이 단절되고 있습니다. 이대로 가면 팀이 와해될 것 같습니다.',
    learningPoint: '팀 갈등 상황에서의 긴급 조치',
    choices: [
      { id: 'A', text: '강제 휴식: 1주일간 야근 금지령을 내리고 팀원들에게 휴식을 강제한다.' },
      { id: 'B', text: '중재 대화: 갈등 당사자들과 개별 면담 후, 중재 미팅을 주선한다.' },
      { id: 'C', text: '팀 셔플: 갈등이 심한 사람들의 업무 배치를 임시로 변경한다.' },
    ],
  },

  // ============================================================
  // INTERNAL VENTURE (사내 벤처) - Fund Square용
  // ============================================================

  {
    id: 'I-001',
    type: 'Event',
    title: '사내 벤처: 피벗의 기로',
    situation: '시작한 사내 벤처 아이템이 시장에서 반응이 없습니다. 팀은 완전히 새로운 방향으로 피벗(Pivot)을 원하지만, 그동안의 투자금을 포기해야 합니다.',
    learningPoint: '매몰 비용과 민첩한 의사결정',
    choices: [
      { id: 'A', text: '피벗: 기존 아이템을 포기하고 남은 자금으로 새로운 방향에 도전한다.' },
      { id: 'B', text: '고수: 마케팅을 강화하여 초기 가설을 끝까지 검증해본다.' },
      { id: 'C', text: '중단: 추가 손실을 막기 위해 사업을 중단하고 본업으로 복귀한다.' },
    ],
  },

  {
    id: 'I-002',
    type: 'Event',
    title: '사내 벤처: 핵심 인재 요청',
    situation: '성장 가능성이 높은 사내 벤처에서 우리 팀의 핵심 인재를 파견해달라고 요청했습니다. 보내주면 당장 우리 팀의 업무에 차질이 생깁니다.',
    learningPoint: '자원 배분과 조직 전체 이익',
    choices: [
      { id: 'A', text: '파견: 회사의 미래를 위해 핵심 인재를 벤처팀에 보낸다.' },
      { id: 'B', text: '거절: 현업 목표 달성이 더 중요하므로 정중히 거절한다.' },
      { id: 'C', text: '대안 제시: 핵심 인재 대신 신규 채용을 지원하겠다고 제안한다.' },
    ],
  },

  {
    id: 'I-003',
    type: 'Event',
    title: '사내 벤처: 스핀오프 결정',
    situation: '사내 벤처가 성공하여 경쟁사로부터 높은 가격에 인수 제안을 받았습니다. 매각하면 즉시 수익이 나고, 분사(Spin-off)시키면 장기적으로 더 클 수 있습니다.',
    learningPoint: '단기 수익 vs 장기 가치 창출',
    choices: [
      { id: 'A', text: '매각: 불확실성을 줄이고 즉시 높은 수익을 확정한다.' },
      { id: 'B', text: '분사: 자회사로 키워 더 큰 미래 가치를 도모한다.' },
      { id: 'C', text: '내재화: 벤처를 본사 핵심 사업부로 편입시켜 시너지를 낸다.' },
    ],
  },
];
