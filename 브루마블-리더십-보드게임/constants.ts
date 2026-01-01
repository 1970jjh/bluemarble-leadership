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
  capital: 100,   // Starts at 100
  energy: 100,    // Starts at 100 (변경됨)
  reputation: 5,  // Starts at 5, Goal 100
  trust: 5,       // Starts at 5, Goal 100
  competency: 5,  // Starts at 5, Goal 100
  insight: 5,     // Starts at 5, Goal 100
};

// 한 바퀴 완주 보너스
export const LAP_BONUS = {
  energy: 40,
  trust: 10,
  competency: 10,
  insight: 10,
};

// 더블 보너스 (주사위 2개 같은 숫자)
export const DOUBLE_BONUS = {
  energy: 5,
  trust: 5,
  competency: 5,
  insight: 5,
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
      { id: 'A', text: '분석 자료를 완벽히 준비하고, 발표는 발표를 잘하는 동료에게 부탁한다. 팀 성과가 중요하니까.' },
      { id: 'B', text: '스피치 교육에 등록해 직접 발표에 도전한다. 실패해도 성장 기회다.' },
      { id: 'C', text: '이번 발표는 동료와 함께 진행하면서 옆에서 배우고, 다음번에 단독으로 도전한다.' },
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
      { id: 'A', text: '"그건 선배님이 잘못 알려주신 거예요"라고 회의 중 바로 정정한다. 오해는 즉시 풀어야 한다.' },
      { id: 'B', text: '"확인해보겠습니다"라고 말한 후, 회의 후 선배에게 개인적으로 사실관계를 공유한다.' },
      { id: 'C', text: '일단 넘어가고 다음부터 선배 지시는 메일로 받아 기록을 남긴다. 같은 일 반복 방지가 중요하다.' },
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
      { id: 'A', text: '선배가 급하다고 했으니 C를 먼저 끝내고, 야근해서 A와 B를 마무리한다. 선후배 관계도 중요하다.' },
      { id: 'B', text: '마감순으로 A → B → C 순서로 처리하고, C가 늦어지면 선배에게 양해를 구한다.' },
      { id: 'C', text: '팀장님께 세 가지 업무 상황을 보고하고 우선순위 조정을 요청한다. 스스로 결정하기 어렵다.' },
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
      { id: 'A', text: '당분간 익숙한 업무에 집중하며 자신감을 회복한다. 무리하면 또 실패할 수 있다.' },
      { id: 'B', text: '무엇이 잘못됐는지 분석해서 실패 보고서를 작성하고 팀에 공유한다. 아프지만 성장 기회다.' },
      { id: 'C', text: '비슷한 경험이 있는 선배에게 조언을 구하고, 멘토링을 요청한다. 혼자 감당하기 어렵다.' },
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
      { id: 'A', text: '선배들처럼 기존 방식을 유지한다. 조직 분위기를 거스르면 튈 수 있다.' },
      { id: 'B', text: '동기들과 스터디 그룹을 만들어 함께 배우고 팀에 제안한다. 변화를 이끌어본다.' },
      { id: 'C', text: '혼자 조용히 익혀서 내 업무에만 적용한다. 티 내지 않고 실력을 쌓는다.' },
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
      { id: 'A', text: '"지금 맡은 업무의 전문가가 되고 싶습니다"라고 현실적으로 답한다. 안정적인 성장이 중요하다.' },
      { id: 'B', text: '"아직 탐색 중인데, 다양한 업무를 경험해보고 싶습니다"라고 솔직히 말한다.' },
      { id: 'C', text: '"회사의 방향에 맞춰 성장하고 싶습니다"라고 답한다. 너무 뚜렷한 목표는 부담스럽다.' },
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
      { id: 'A', text: '아마 형식이 문제일 것 같으니 폰트와 레이아웃을 다시 정리해본다.' },
      { id: 'B', text: '"어떤 부분을 보완하면 좋을지 구체적으로 여쭤봐도 될까요?"라고 다시 찾아간다.' },
      { id: 'C', text: '이 보고서를 잘 아는 선배에게 먼저 피드백을 구한 후 수정한다.' },
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
      { id: 'A', text: '내 일도 아닌데 나서면 오지랖일 수 있으니, 맡은 일에 집중한다.' },
      { id: 'B', text: '팀장님께 "제가 해볼까요?"라고 먼저 제안하고 승인을 받은 후 진행한다.' },
      { id: 'C', text: '일단 간단히 조사해서 팀 메신저에 공유한다. 부담없이 기여할 수 있다.' },
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
      { id: 'A', text: '선배 말대로 조직 문화니까 그냥 따른다. 신입이 나서면 건방져 보인다.' },
      { id: 'B', text: '보고서가 어떻게 사용되는지 조사하고, 개선안과 함께 팀장님께 건의한다.' },
      { id: 'C', text: '동기들과 의견을 모아서 함께 건의한다. 혼자보다 여럿이 말하면 설득력이 있다.' },
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
      { id: 'A', text: '"시간이 부족했어요" 등 상황을 설명한다. 오해가 있을 수 있으니 해명이 필요하다.' },
      { id: 'B', text: '"구체적으로 어떤 부분이 부족했는지 여쭤봐도 될까요?"라고 추가 질문한다.' },
      { id: 'C', text: '일단 "알겠습니다"라고 하고, 나중에 혼자 발표 영상을 다시 보며 스스로 분석한다.' },
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
      { id: 'A', text: '여행을 취소하고 주말에 일한다. 신입은 인정받아야 하고, 급한 일은 어쩔 수 없다.' },
      { id: 'B', text: '여행을 하루 줄이고, 일요일에 원격으로 작업해서 월요일 아침에 제출하겠다고 제안한다.' },
      { id: 'C', text: '솔직하게 여행 계획을 말하고 다른 팀원이 할 수 있는지 확인해달라고 요청한다.' },
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
      { id: 'A', text: '이전 회의 자료를 참고해서 비슷하게 만들어본다. 바쁜 팀장님을 방해하기 싫다.' },
      { id: 'B', text: '팀장님께 회의 목적, 참석자, 필요한 내용을 간단히 여쭤본다.' },
      { id: 'C', text: '먼저 선배에게 물어보고, 그래도 모르겠으면 팀장님께 확인한다.' },
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
      { id: 'A', text: '원래 직장 생활이 이런 거다. 참고 버티면서 월급을 생각한다.' },
      { id: 'B', text: '내 업무가 팀에 어떻게 기여하는지 파악하고, 작은 도전 과제를 스스로 설정해본다.' },
      { id: 'C', text: '다른 부서나 업무로 이동할 수 있는지 인사팀에 상담을 요청해본다.' },
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
      { id: 'A', text: '가능한 결정을 미루고, 팀장님 복귀 후 모든 것을 확인받는다. 실수하면 안 된다.' },
      { id: 'B', text: '미팅을 진행하되, 주요 결정 사항은 기록해서 팀장님께 사후 보고한다.' },
      { id: 'C', text: '중요한 결정이 필요하면 팀장님께 카톡이나 메일로 실시간 확인을 받는다.' },
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
      { id: 'A', text: 'A 방법으로 일단 마감을 맞추고, 이후 보완한다. 마감 준수가 최우선이다.' },
      { id: 'B', text: '팀장님께 두 방법의 장단점을 설명하고, 마감 연장 또는 방법 선택에 대해 조언을 구한다.' },
      { id: 'C', text: 'B 방법으로 진행하되, 마감이 늦어질 것 같으면 미리 팀장님께 보고한다. 품질이 중요하다.' },
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
      { id: 'A', text: '미안하지만 내 일도 바쁘다고 솔직히 말하고, 선배에게 물어보라고 권한다.' },
      { id: 'B', text: '점심시간이나 잠깐의 시간을 내서 내가 아는 범위에서 도와준다.' },
      { id: 'C', text: '내가 참고했던 자료나 링크를 공유해준다. 직접 가르치기보다 스스로 해결할 수 있게 돕는다.' },
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
      { id: 'A', text: '남들처럼 눈치껏 빠진다. 내 성장에 도움되는 일에 집중해야 한다.' },
      { id: 'B', text: '자발적으로 맡되, 이 과정에서 팀 전체 업무 흐름을 파악하는 기회로 삼는다.' },
      { id: 'C', text: '돌아가면서 하자고 제안한다. 특정인에게 몰리는 건 불공평하다.' },
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
      { id: 'A', text: '아무도 모르게 조용히 수정하고 넘어간다. 작은 실수까지 보고하면 무능해 보인다.' },
      { id: 'B', text: '팀장님께 실수를 보고하고, 수정 계획과 재발 방지책을 함께 제시한다.' },
      { id: 'C', text: '먼저 선배에게 상황을 공유하고, 어떻게 할지 조언을 구한다.' },
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
      { id: 'A', text: '시간이 지나면 괜찮아지겠지. 일단 거리를 두고 각자 할 일 한다.' },
      { id: 'B', text: '점심이나 커피를 제안하며 "우리 얘기 좀 할까?"라고 먼저 다가간다.' },
      { id: 'C', text: '친한 선배에게 상황을 이야기하고 중재를 부탁한다. 당사자끼리는 감정적일 수 있다.' },
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
      { id: 'A', text: '효율성을 위해 메신저로 보고한다. 시니어도 새 방식에 적응해야 한다.' },
      { id: 'B', text: '시니어에게는 대면 보고를 하면서, 그분의 경험에서 배울 점을 찾아본다.' },
      { id: 'C', text: '간단한 건 메신저, 중요한 건 대면으로 보고하는 규칙을 시니어와 함께 정한다.' },
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
      { id: 'A', text: '불만이지만 팀을 위해 그 사람 몫까지 내가 한다. 프로젝트 성공이 중요하다.' },
      { id: 'B', text: '먼저 그 동료에게 "도움이 필요하면 말해줘"라며 상황을 확인한다.' },
      { id: 'C', text: '팀장님께 상황을 보고한다. 팀 전체 문제는 리더가 알아야 한다.' },
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
      { id: 'A', text: '원래 이런 거라고 생각하고, 매번 찾아다닌다. 시스템을 바꾸긴 어렵다.' },
      { id: 'B', text: '내가 맡은 업무에 대해서는 정보를 한 곳에 정리하고, 동료들에게 공유한다.' },
      { id: 'C', text: '팀 차원의 정보 정리 규칙을 만들자고 팀장님께 제안한다.' },
    ],
  },

  // ============================================================
  // FOLLOWER MODE (팔로워십) - 중급사원(3~5년차) 시점
  // 22개 역량 × Follower 모드 = 22개 카드
  // ============================================================

  // FWER-SA-001: 자기 인식 (Self-Awareness) - 중급사원 시점
  {
    id: 'FWER-SA-001',
    type: 'Follower',
    competency: 'self-awareness',
    title: '승진과 자기 객관화',
    situation: '4년차가 되어 승진 심사를 앞두고 있습니다. 자기평가서를 작성해야 하는데, 솔직히 나의 성과가 동기들에 비해 뛰어난지 잘 모르겠습니다. 과대평가하면 오만해 보이고, 과소평가하면 손해입니다.',
    learningPoint: '경력 중반에 자신의 역량과 성과를 객관적으로 평가하는 능력',
    choices: [
      { id: 'A', text: '확실한 성과만 적고, 나머지는 "노력하겠다"로 마무리한다. 겸손이 미덕이다.' },
      { id: 'B', text: '프로젝트 기여도, 수치화된 성과, 동료 피드백을 정리해 객관적 근거를 만든다.' },
      { id: 'C', text: '팀장님께 미리 피드백을 구하고, 그 내용을 반영해서 작성한다.' },
    ],
  },

  // FWER-EC-001: 감정 조절 (Emotional Control) - 중급사원 시점
  {
    id: 'FWER-EC-001',
    type: 'Follower',
    competency: 'emotional-control',
    title: '후배 앞에서의 감정',
    situation: '팀장님께 업무 지시를 받는 도중 부당하다고 느껴지는 질책을 받았습니다. 그런데 바로 옆에 당신이 멘토링하는 신입사원이 있습니다. 화가 나지만 후배 앞에서 체면도 생각됩니다.',
    learningPoint: '중간 연차로서 감정을 관리하며 롤모델이 되는 방법',
    choices: [
      { id: 'A', text: '"알겠습니다" 하고 일단 받아들인 후, 나중에 개인적으로 팀장님께 말씀드린다.' },
      { id: 'B', text: '차분하게 "제 생각은 조금 다른데, 잠시 후에 말씀드려도 될까요?"라고 한다.' },
      { id: 'C', text: '후배에게 상황을 설명해준다. "저런 일도 있어. 이럴 때는 이렇게 대처하면 돼"라고.' },
    ],
  },

  // FWER-TM-001: 시간 관리 (Time Management) - 중급사원 시점
  {
    id: 'FWER-TM-001',
    type: 'Follower',
    competency: 'time-management',
    title: '본업과 신규 프로젝트',
    situation: '기존 업무도 바쁜데 팀장님이 새로운 TF 프로젝트에 참여해달라고 합니다. 승진에 도움이 될 것 같지만, 둘 다 잘하기는 물리적으로 어려워 보입니다.',
    learningPoint: '다중 업무 상황에서 전략적 시간 배분',
    choices: [
      { id: 'A', text: '둘 다 열심히 하되, 야근과 주말 근무로 해결한다. 기회를 놓치면 안 된다.' },
      { id: 'B', text: '기존 업무 일부를 동료에게 위임하거나 우선순위 조정을 팀장님께 제안한다.' },
      { id: 'C', text: '솔직하게 현재 업무량을 설명하고, TF 참여가 어렵다고 정중히 거절한다.' },
    ],
  },

  // FWER-RS-001: 회복 탄력성 (Resilience) - 중급사원 시점
  {
    id: 'FWER-RS-001',
    type: 'Follower',
    competency: 'resilience',
    title: '승진 탈락 후',
    situation: '기대했던 승진에서 탈락했습니다. 같이 입사한 동기는 승진했는데, 당신은 "아직 경험이 부족하다"는 피드백을 받았습니다. 회사에 대한 의욕이 급격히 떨어집니다.',
    learningPoint: '커리어 좌절에서 회복하고 동기를 재정립하는 방법',
    choices: [
      { id: 'A', text: '당분간 최소한의 업무만 하며 마음을 정리한다. 무리하면 번아웃 온다.' },
      { id: 'B', text: '인사팀이나 팀장님께 구체적인 부족한 점을 확인하고, 개선 계획을 세운다.' },
      { id: 'C', text: '이직 시장을 탐색해본다. 다른 곳에서 더 인정받을 수 있을지 확인한다.' },
    ],
  },

  // FWER-LA-001: 지속 학습 (Learning Agility) - 중급사원 시점
  {
    id: 'FWER-LA-001',
    type: 'Follower',
    competency: 'learning-agility',
    title: '전문성의 한계',
    situation: '4년간 같은 업무를 해왔는데, 최근 업계 트렌드가 바뀌어 새로운 기술/방법론이 필요해졌습니다. 신입들은 관련 교육을 받고 들어왔지만, 당신은 처음부터 배워야 합니다.',
    learningPoint: '경력자로서 새로운 것을 배우는 자세',
    choices: [
      { id: 'A', text: '경험으로 버틸 수 있는 한 버티고, 새 기술은 필요할 때 배운다.' },
      { id: 'B', text: '업무 외 시간에 스터디나 온라인 강의로 먼저 익히고, 팀에 적용을 제안한다.' },
      { id: 'C', text: '신입에게 새 기술을 배우고, 대신 경험과 노하우를 공유한다. 서로 윈윈이다.' },
    ],
  },

  // FWER-PV-001: 자기 비전 (Personal Vision) - 중급사원 시점
  {
    id: 'FWER-PV-001',
    type: 'Follower',
    competency: 'personal-vision',
    title: '매니저 트랙 vs 전문가 트랙',
    situation: '5년차가 되어 커리어 방향을 결정해야 합니다. 회사에서는 매니저 트랙(팀 관리)과 전문가 트랙(기술 심화)을 제시합니다. 두 가지 모두 장단점이 있어 고민됩니다.',
    learningPoint: '중장기 커리어 비전을 설정하는 방법',
    choices: [
      { id: 'A', text: '매니저 트랙: 사람을 이끄는 리더가 되어 더 큰 영향력을 갖고 싶다.' },
      { id: 'B', text: '전문가 트랙: 기술/지식에서 최고가 되어 대체 불가능한 전문가가 되고 싶다.' },
      { id: 'C', text: '결정을 1년 미룬다. 두 영역 모두 경험해보고 적성을 확인한 후 결정한다.' },
    ],
  },

  // FWER-AL-001: 적극적 경청 (Active Listening) - 중급사원 시점
  {
    id: 'FWER-AL-001',
    type: 'Follower',
    competency: 'active-listening',
    title: '팀장의 숨은 메시지',
    situation: '팀장님이 회의 후 "요즘 일 좀 많지?"라고 물었습니다. 표면적으로는 걱정하는 것 같지만, 최근 당신의 업무 속도가 늦어진 것에 대한 불만일 수도 있습니다.',
    learningPoint: '상사의 진짜 의도를 파악하고 대응하는 경청 능력',
    choices: [
      { id: 'A', text: '"괜찮습니다, 할 만해요"라고 대답하고 넘어간다. 괜히 약한 모습 보이기 싫다.' },
      { id: 'B', text: '"혹시 제 업무 진행 상황에 대해 피드백 주실 게 있으신가요?"라고 확인한다.' },
      { id: 'C', text: '솔직하게 "네, 좀 많긴 해요. 우선순위 조정이 필요할 것 같아요"라고 말한다.' },
    ],
  },

  // FWER-PR-001: 능동적 수행 (Proactivity) - 중급사원 시점
  {
    id: 'FWER-PR-001',
    type: 'Follower',
    competency: 'proactivity',
    title: '팀 문제의 발견',
    situation: '팀의 업무 프로세스에서 비효율적인 부분을 발견했습니다. 개선하면 전체 팀 효율이 20% 이상 오를 것 같지만, 이를 제안하고 실행하려면 상당한 시간과 노력이 필요합니다.',
    learningPoint: '조직 개선을 위해 주도적으로 나서는 자세',
    choices: [
      { id: 'A', text: '내 일도 바쁜데, 굳이 나서서 일을 만들 필요가 있나 싶다. 현상 유지한다.' },
      { id: 'B', text: '분석 자료와 개선안을 만들어 팀장님께 제안하고, 주도적으로 실행한다.' },
      { id: 'C', text: '팀장님께 문제점만 공유하고, 실행은 팀 차원에서 결정하게 한다.' },
    ],
  },

  // FWER-CT-001: 비판적 사고 (Critical Thinking) - 중급사원 시점
  {
    id: 'FWER-CT-001',
    type: 'Follower',
    competency: 'critical-thinking',
    title: '팀장의 결정에 의문',
    situation: '팀장님이 새로운 프로젝트 방향을 결정했는데, 경험상 그 방향은 실패할 가능성이 높아 보입니다. 하지만 팀장님은 이미 결정을 내렸고, 팀원들도 따르는 분위기입니다.',
    learningPoint: '상사의 결정에 건설적으로 이의를 제기하는 방법',
    choices: [
      { id: 'A', text: '팀장님이 결정했으니 일단 따르고, 문제가 생기면 그때 말한다.' },
      { id: 'B', text: '1:1로 팀장님께 우려 사항과 대안을 데이터와 함께 제시한다.' },
      { id: 'C', text: '같은 우려를 가진 동료들과 함께 의견을 모아 팀장님께 전달한다.' },
    ],
  },

  // FWER-FR-001: 피드백 수용 (Feedback Reception) - 중급사원 시점
  {
    id: 'FWER-FR-001',
    type: 'Follower',
    competency: 'feedback-reception',
    title: '기대 이하 평가',
    situation: '연말 성과 평가에서 예상보다 낮은 점수를 받았습니다. "업무 능력은 좋으나 협업과 소통에서 개선이 필요하다"는 피드백입니다. 억울하지만 여러 사람의 평가 결과입니다.',
    learningPoint: '다면 피드백을 수용하고 개선으로 연결하는 자세',
    choices: [
      { id: 'A', text: '구체적인 사례를 들어 평가가 잘못됐음을 항변한다. 오해는 풀어야 한다.' },
      { id: 'B', text: '협업/소통 부분에서 구체적으로 무엇을 바꿀지 계획을 세워 공유한다.' },
      { id: 'C', text: '평가자들에게 개별적으로 구체적인 피드백을 요청해 정확한 문제를 파악한다.' },
    ],
  },

  // FWER-CM-001: 조직 몰입 (Commitment) - 중급사원 시점
  {
    id: 'FWER-CM-001',
    type: 'Follower',
    competency: 'commitment',
    title: '이직 제안과 충성',
    situation: '헤드헌터에게서 연봉 30% 인상 조건의 이직 제안을 받았습니다. 현재 회사에 대한 애정도 있고, 진행 중인 프로젝트 책임도 있지만, 커리어와 연봉 면에서 매력적입니다.',
    learningPoint: '조직에 대한 몰입과 개인 커리어 사이의 균형',
    choices: [
      { id: 'A', text: '현재 팀과 프로젝트에 대한 책임을 다하고, 이직은 나중에 고려한다.' },
      { id: 'B', text: '현재 회사에 상황을 공유하고 처우 개선을 협상해본다.' },
      { id: 'C', text: '제안 회사를 더 알아보고, 진지하게 이직을 검토한다. 기회는 자주 오지 않는다.' },
    ],
  },

  // FWER-CD-001: 명확한 지시 (Clear Direction) - 중급사원 시점
  {
    id: 'FWER-CD-001',
    type: 'Follower',
    competency: 'clear-direction',
    title: '후배에게 업무 지시',
    situation: '신입사원에게 업무를 넘겨줘야 합니다. 바빠서 대충 설명하고 "알아서 해봐"라고 하고 싶지만, 결과물의 책임은 결국 당신에게 있습니다.',
    learningPoint: '후배에게 명확하게 업무를 지시하는 방법',
    choices: [
      { id: 'A', text: '핵심만 말하고 모르면 물어보라고 한다. 스스로 해봐야 배운다.' },
      { id: 'B', text: '목적, 방법, 기대 결과, 마감을 명확히 설명하고, 중간 점검 일정을 잡는다.' },
      { id: 'C', text: '처음에는 함께 작업하면서 보여주고, 이후 단계를 혼자 해보게 한다.' },
    ],
  },

  // FWER-MO-001: 동기 부여 (Motivation) - 중급사원 시점
  {
    id: 'FWER-MO-001',
    type: 'Follower',
    competency: 'motivation',
    title: '슬럼프의 터널',
    situation: '최근 6개월간 성과도 없고, 일에 대한 의욕도 사라졌습니다. 예전엔 재미있었던 업무가 이제는 그저 해야 할 일처럼 느껴집니다. 이직을 고민하지만 확신이 없습니다.',
    learningPoint: '경력 중반 슬럼프에서 동기를 재발견하는 방법',
    choices: [
      { id: 'A', text: '이직이나 부서 이동을 통해 새로운 자극을 찾는다. 환경을 바꿔야 한다.' },
      { id: 'B', text: '업무 외 활동이나 사이드 프로젝트를 통해 새로운 관심사를 찾아본다.' },
      { id: 'C', text: '팀장님께 현재 상태를 솔직히 말하고 새로운 도전 과제를 요청한다.' },
    ],
  },

  // FWER-EM-001: 임파워먼트 (Empowerment) - 중급사원 시점
  {
    id: 'FWER-EM-001',
    type: 'Follower',
    competency: 'empowerment',
    title: '프로젝트 리더 역할',
    situation: '팀장님이 중요한 프로젝트의 실무 리더를 맡아달라고 합니다. 권한은 주지만 공식 직급은 아니라 팀원들이 잘 따를지 걱정됩니다. 실패하면 책임은 당신에게 돌아올 것 같습니다.',
    learningPoint: '공식 권한 없이 위임받은 역할을 수행하는 방법',
    choices: [
      { id: 'A', text: '아직 준비가 안 됐다며 다음 기회를 기다린다. 무리하면 안 된다.' },
      { id: 'B', text: '역할을 수락하되, 팀장님께 지원과 권한의 범위를 명확히 합의한다.' },
      { id: 'C', text: '조건부 수락: 시니어와 공동 리더로 진행하자고 제안한다.' },
    ],
  },

  // FWER-DM-001: 의사결정 (Decision Making) - 중급사원 시점
  {
    id: 'FWER-DM-001',
    type: 'Follower',
    competency: 'decision-making',
    title: '팀장 부재 시 긴급 결정',
    situation: '팀장님이 휴가 중인데 긴급한 고객 요청이 왔습니다. 고객은 오늘 중 답변을 원하고, 팀장님은 연락이 안 됩니다. 결정에 따라 비용이나 일정에 영향이 있을 수 있습니다.',
    learningPoint: '상사 부재 시 적절한 수준의 의사결정',
    choices: [
      { id: 'A', text: '팀장님 연락이 올 때까지 기다리고, 고객에게는 내일 답변하겠다고 한다.' },
      { id: 'B', text: '가능한 범위에서 결정을 내리고, 팀장님께 결과와 근거를 상세히 보고한다.' },
      { id: 'C', text: '다른 팀의 시니어나 임원에게 조언을 구한 후 결정한다.' },
    ],
  },

  // FWER-CO-001: 코칭 (Coaching) - 중급사원 시점
  {
    id: 'FWER-CO-001',
    type: 'Follower',
    competency: 'coaching',
    title: '후배의 반복 실수',
    situation: '당신이 멘토링하는 2년차 후배가 같은 실수를 반복합니다. 여러 번 알려줬는데도 개선이 없고, 팀장님도 그 후배에 대해 불만을 표시하기 시작했습니다.',
    learningPoint: '효과적인 후배 코칭과 피드백 방법',
    choices: [
      { id: 'A', text: '이번에는 강하게 지적하고, 개선되지 않으면 멘토 역할을 그만두겠다고 말한다.' },
      { id: 'B', text: '왜 반복되는지 대화로 파악하고, 함께 체크리스트나 프로세스를 만든다.' },
      { id: 'C', text: '팀장님께 상황을 공유하고, 더 효과적인 멘토링 방법에 대해 조언을 구한다.' },
    ],
  },

  // FWER-SL-001: 서번트 리더십 (Servant Leadership) - 중급사원 시점
  {
    id: 'FWER-SL-001',
    type: 'Follower',
    competency: 'servant-leadership',
    title: '후배를 위한 방어막',
    situation: '당신이 지도하는 후배가 실수를 했고, 팀장님이 크게 질책하려 합니다. 사실 그 실수는 당신의 지시가 불명확했던 탓도 있습니다. 후배는 위축되어 있습니다.',
    learningPoint: '후배를 보호하면서도 책임을 다하는 방법',
    choices: [
      { id: 'A', text: '후배의 실수이니 후배가 책임지게 하고, 교훈으로 삼게 한다.' },
      { id: 'B', text: '"제 지시가 불명확했습니다"라며 책임을 나누고, 후배와 재발 방지책을 세운다.' },
      { id: 'C', text: '팀장님께 먼저 상황을 설명하고, 후배에 대한 질책을 완화해달라고 요청한다.' },
    ],
  },

  // FWER-PS-001: 심리적 안전감 (Psychological Safety) - 중급사원 시점
  {
    id: 'FWER-PS-001',
    type: 'Follower',
    competency: 'psychological-safety',
    title: '회의에서 다른 의견',
    situation: '팀 회의에서 팀장님과 선배들이 합의한 방향이 있는데, 당신은 다른 의견이 있습니다. 말하면 분위기를 깰 것 같고, 안 하자니 나중에 문제가 될 것 같습니다.',
    learningPoint: '안전하게 다른 의견을 표현하는 방법',
    choices: [
      { id: 'A', text: '분위기상 말하기 어려우니 일단 따르고, 문제가 생기면 그때 말한다.' },
      { id: 'B', text: '"다른 관점에서 한 가지 우려가 있는데요"라며 조심스럽게 의견을 낸다.' },
      { id: 'C', text: '회의 후 팀장님께 1:1로 다른 의견을 전달한다. 공개석상보다 낫다.' },
    ],
  },

  // FWER-CF-001: 갈등 관리 (Conflict Management) - 중급사원 시점
  {
    id: 'FWER-CF-001',
    type: 'Follower',
    competency: 'conflict-management',
    title: '선배와의 업무 갈등',
    situation: '7년차 선배와 프로젝트 방향에 대해 의견이 계속 충돌합니다. 선배는 경험을 강조하고, 당신은 새로운 방식을 주장합니다. 회의 때마다 분위기가 험악해집니다.',
    learningPoint: '선배와의 갈등을 전문적으로 해결하는 방법',
    choices: [
      { id: 'A', text: '선배 경험을 존중해서 일단 선배 방식으로 따른다.' },
      { id: 'B', text: '팀장님께 상황을 공유하고, 객관적인 판단을 요청한다.' },
      { id: 'C', text: '선배와 1:1로 커피를 마시며 서로의 관점을 이해하려고 노력한다.' },
    ],
  },

  // FWER-DI-001: 다양성 포용 (Diversity & Inclusion) - 중급사원 시점
  {
    id: 'FWER-DI-001',
    type: 'Follower',
    competency: 'diversity-inclusion',
    title: '외국인 동료와의 협업',
    situation: '최근 팀에 외국인 동료가 합류했습니다. 언어와 문화 차이로 소통이 어렵고, 일부 팀원들은 "일이 더 느려진다"며 불만을 표시합니다. 당신은 어떻게 해야 할까요?',
    learningPoint: '다양한 배경의 동료와 효과적으로 협업하는 방법',
    choices: [
      { id: 'A', text: '내 업무만 잘하고, 외국인 동료와의 협업은 최소화한다.' },
      { id: 'B', text: '적극적으로 소통을 돕고, 문화 차이를 팀이 이해하도록 중재한다.' },
      { id: 'C', text: '팀장님께 공식적인 온보딩 프로그램이나 버디 제도를 제안한다.' },
    ],
  },

  // FWER-MA-001: 상호 책임 (Mutual Accountability) - 중급사원 시점
  {
    id: 'FWER-MA-001',
    type: 'Follower',
    competency: 'mutual-accountability',
    title: '동료의 저성과',
    situation: '같은 연차의 동료가 계속 업무를 제때 마치지 못해 당신에게 피해가 옵니다. 팀장님은 모르는 것 같고, 직접 말하자니 관계가 불편해질 것 같습니다.',
    learningPoint: '동료 간 상호 책임을 다하고 요구하는 방법',
    choices: [
      { id: 'A', text: '상황을 팀장님께 알려서 공식적으로 해결되게 한다.' },
      { id: 'B', text: '동료에게 먼저 상황을 이야기하고, 함께 해결책을 찾아본다.' },
      { id: 'C', text: '내 업무 범위를 명확히 하고, 동료 업무 지연의 영향을 받지 않도록 독립시킨다.' },
    ],
  },

  // FWER-CL-001: 협업 툴 활용 (Collaboration Tools) - 중급사원 시점
  {
    id: 'FWER-CL-001',
    type: 'Follower',
    competency: 'collaboration-tools',
    title: '업무 시스템 개선 제안',
    situation: '팀에서 사용하는 업무 관리 시스템이 비효율적입니다. 더 좋은 도구가 있지만, 도입하려면 팀원들을 설득하고 마이그레이션도 해야 합니다. 귀찮지만 장기적으로는 도움이 될 것 같습니다.',
    learningPoint: '팀의 협업 도구를 개선하기 위해 주도하는 방법',
    choices: [
      { id: 'A', text: '기존 시스템에 적응한 팀원들도 많으니 굳이 바꿀 필요 없다.' },
      { id: 'B', text: '새 도구의 장점을 정리해 제안하고, 파일럿 운영을 자원한다.' },
      { id: 'C', text: '먼저 관심있는 동료들과 비공식적으로 테스트해보고, 성공 사례를 만든 후 제안한다.' },
    ],
  },

  // ============================================================
  // LEADER MODE (리더십) - 매니저/관리자(팀장급) 시점
  // 22개 역량 × Leader 모드 = 22개 카드
  // ============================================================

  // LEAD-SA-001: 자기 인식 (Self-Awareness) - 리더 시점
  {
    id: 'LEAD-SA-001',
    type: 'Leader',
    competency: 'self-awareness',
    title: '리더로서의 나',
    situation: '팀장이 된 지 1년, 익명 리더십 피드백에서 "일은 잘하지만 팀원들과 거리감이 있다"는 평가가 나왔습니다. 본인은 공정하게 대했다고 생각했는데 의외의 결과입니다.',
    learningPoint: '리더로서 자신의 스타일과 영향력을 객관적으로 인식하는 능력',
    choices: [
      { id: 'A', text: '피드백을 수용하고 팀원들과 1:1 면담을 통해 구체적으로 어떤 점이 그런지 파악한다.' },
      { id: 'B', text: '업무 성과가 좋으면 된다고 생각하고, 리더십 스타일을 크게 바꾸지 않는다.' },
      { id: 'C', text: '외부 리더십 코칭을 받아 제3자 관점에서 나의 리더십을 점검한다.' },
    ],
  },

  // LEAD-EC-001: 감정 조절 (Emotional Control) - 리더 시점
  {
    id: 'LEAD-EC-001',
    type: 'Leader',
    competency: 'emotional-control',
    title: '임원 앞에서의 질책',
    situation: '임원 회의에서 당신의 팀 성과가 부진하다며 공개적으로 질책을 받았습니다. 일부는 억울한 부분도 있습니다. 팀원들도 이 소식을 곧 알게 될 것입니다.',
    learningPoint: '리더로서 압박 상황에서 감정을 관리하고 팀에 영향을 최소화하는 방법',
    choices: [
      { id: 'A', text: '팀원들에게 상황을 솔직히 공유하고, 함께 개선 방안을 논의한다.' },
      { id: 'B', text: '임원에게 1:1로 찾아가 억울한 부분에 대해 데이터로 해명한다.' },
      { id: 'C', text: '팀원들에게는 "잘 해결했다"고 말하고, 내부적으로 성과 개선에 집중한다.' },
    ],
  },

  // LEAD-TM-001: 시간 관리 (Time Management) - 리더 시점
  {
    id: 'LEAD-TM-001',
    type: 'Leader',
    competency: 'time-management',
    title: '회의의 늪',
    situation: '팀장이 되니 하루 일과의 70%가 회의입니다. 정작 팀 전략 수립이나 팀원 코칭 시간이 부족합니다. 회의를 줄이자니 정보에서 소외될까 걱정됩니다.',
    learningPoint: '리더로서 시간을 전략적으로 배분하고 우선순위를 관리하는 방법',
    choices: [
      { id: 'A', text: '모든 회의에 참석하되, 멀티태스킹으로 다른 일도 병행한다.' },
      { id: 'B', text: '필수 회의만 선별 참석하고, 나머지는 팀원에게 위임하거나 회의록으로 대체한다.' },
      { id: 'C', text: '회의 자체를 줄이자고 조직에 제안하고, 비동기 소통 문화를 만든다.' },
    ],
  },

  // LEAD-RS-001: 회복 탄력성 (Resilience) - 리더 시점
  {
    id: 'LEAD-RS-001',
    type: 'Leader',
    competency: 'resilience',
    title: '프로젝트 실패의 책임',
    situation: '당신이 주도한 대형 프로젝트가 실패하여 회사에 큰 손실이 발생했습니다. 경영진과 다른 팀의 시선이 차갑고, 팀원들도 동요하고 있습니다.',
    learningPoint: '리더로서 큰 실패를 딛고 팀과 함께 회복하는 방법',
    choices: [
      { id: 'A', text: '팀원들에게 "내 책임이다"라고 선언하고, 혼자 경영진 대응을 맡는다.' },
      { id: 'B', text: '팀과 함께 실패 원인을 분석하고, 교훈과 재발 방지책을 경영진에 보고한다.' },
      { id: 'C', text: '당분간 낮은 자세로 있으면서 다음 기회를 기다린다.' },
    ],
  },

  // LEAD-LA-001: 지속 학습 (Learning Agility) - 리더 시점
  {
    id: 'LEAD-LA-001',
    type: 'Leader',
    competency: 'learning-agility',
    title: '세대 차이와 새로운 트렌드',
    situation: 'MZ세대 팀원들이 새로운 업무 방식(애자일, 노코드 툴 등)을 도입하자고 합니다. 솔직히 잘 모르는 분야인데, 리더가 모른다고 하기도 어렵습니다.',
    learningPoint: '리더로서 새로운 것을 배우고 변화를 수용하는 자세',
    choices: [
      { id: 'A', text: '"좋은 아이디어네, 자세히 설명해줄래?"라며 팀원에게 배우는 자세를 보인다.' },
      { id: 'B', text: '먼저 혼자 공부한 후에 의견을 제시한다. 리더가 무지해 보이면 안 된다.' },
      { id: 'C', text: '검증된 방식을 유지하자고 한다. 새것이 항상 좋은 건 아니다.' },
    ],
  },

  // LEAD-PV-001: 자기 비전 (Personal Vision) - 리더 시점
  {
    id: 'LEAD-PV-001',
    type: 'Leader',
    competency: 'personal-vision',
    title: '임원 승진 vs 현재 역할',
    situation: '임원 승진 기회가 있지만, 승진하면 현장과 멀어지고 정치에 시간을 써야 합니다. 현재 팀장 역할이 적성에 맞고 팀원들과의 관계도 좋습니다.',
    learningPoint: '리더로서 자신의 커리어 비전을 명확히 하는 방법',
    choices: [
      { id: 'A', text: '임원 승진에 도전한다. 더 큰 영향력을 가지려면 올라가야 한다.' },
      { id: 'B', text: '현재 역할에 충실한다. 좋아하는 일을 하는 게 더 중요하다.' },
      { id: 'C', text: '임원들에게 임원 역할의 실제 모습을 물어보고 신중히 결정한다.' },
    ],
  },

  // LEAD-AL-001: 적극적 경청 (Active Listening) - 리더 시점
  {
    id: 'LEAD-AL-001',
    type: 'Leader',
    competency: 'active-listening',
    title: '팀원의 숨은 메시지',
    situation: '평소 활발하던 팀원이 요즘 회의에서 말이 없습니다. 업무 성과는 유지되고 있지만 뭔가 달라진 느낌입니다. "괜찮아요"라고만 합니다.',
    learningPoint: '리더로서 팀원의 언어화되지 않은 신호를 파악하는 경청 능력',
    choices: [
      { id: 'A', text: '성과가 유지되고 있으니 지켜본다. 사생활을 캐묻는 것 같을 수 있다.' },
      { id: 'B', text: '편안한 자리에서 1:1 면담을 요청하고, 열린 질문으로 이야기를 들어본다.' },
      { id: 'C', text: '가까운 동료에게 상황을 파악해달라고 부탁한다.' },
    ],
  },

  // LEAD-PR-001: 능동적 수행 (Proactivity) - 리더 시점
  {
    id: 'LEAD-PR-001',
    type: 'Leader',
    competency: 'proactivity',
    title: '조직 변화의 선제 대응',
    situation: '회사에 구조조정 소문이 돌고 있습니다. 공식 발표는 없지만 팀원들이 불안해하고 있습니다. 당신도 정확한 정보는 없습니다.',
    learningPoint: '리더로서 불확실한 상황에서 선제적으로 대응하는 자세',
    choices: [
      { id: 'A', text: '공식 발표가 있을 때까지 기다린다. 섣부른 발언은 오히려 불안을 키운다.' },
      { id: 'B', text: '팀 미팅에서 "나도 정확히 모르지만, 알게 되면 바로 공유하겠다"고 솔직히 말한다.' },
      { id: 'C', text: '경영진에게 직접 상황을 확인하고, 팀에 전달할 수 있는 범위를 협의한다.' },
    ],
  },

  // LEAD-CT-001: 비판적 사고 (Critical Thinking) - 리더 시점
  {
    id: 'LEAD-CT-001',
    type: 'Leader',
    competency: 'critical-thinking',
    title: '임원의 지시에 의문',
    situation: '임원이 새로운 정책을 지시했는데, 현장에서 실행하기 어렵고 부작용이 예상됩니다. 다른 팀장들은 다들 "네, 알겠습니다"라고만 합니다.',
    learningPoint: '리더로서 상위 의사결정에 건설적으로 이의를 제기하는 방법',
    choices: [
      { id: 'A', text: '일단 실행하고 문제가 생기면 그때 보고한다. 윗선 결정에 토를 달면 안 된다.' },
      { id: 'B', text: '회의에서 "현장 관점에서 우려되는 점이 있다"며 데이터와 함께 의견을 제시한다.' },
      { id: 'C', text: '임원에게 1:1로 찾아가 조심스럽게 우려를 전달한다.' },
    ],
  },

  // LEAD-FR-001: 피드백 수용 (Feedback Reception) - 리더 시점
  {
    id: 'LEAD-FR-001',
    type: 'Leader',
    competency: 'feedback-reception',
    title: '팀원의 돌직구 피드백',
    situation: '팀원이 "팀장님은 회의 때 말을 끊어서 의견 내기가 힘들어요"라고 피드백했습니다. 본인은 효율적으로 진행하려 한 것인데, 듣고 보니 일리가 있습니다.',
    learningPoint: '리더로서 팀원의 피드백을 열린 마음으로 수용하는 자세',
    choices: [
      { id: 'A', text: '"솔직히 말해줘서 고마워, 앞으로 주의할게"라고 수용하고 실제로 개선한다.' },
      { id: 'B', text: '왜 그렇게 느꼈는지 구체적인 상황을 더 물어보고 이해를 깊게 한다.' },
      { id: 'C', text: '"회의 효율을 위해서였어"라고 설명하고, 다른 방식으로 의견을 받겠다고 제안한다.' },
    ],
  },

  // LEAD-CM-001: 조직 몰입 (Commitment) - 리더 시점
  {
    id: 'LEAD-CM-001',
    type: 'Leader',
    competency: 'commitment',
    title: '회사 방침 vs 팀 이익',
    situation: '회사가 비용 절감을 위해 팀 인원 감축을 요구합니다. 현재 인원도 빠듯한데, 감축하면 팀원들의 업무 부담이 크게 늘어날 것입니다.',
    learningPoint: '리더로서 조직 방침과 팀 이익 사이에서 균형을 찾는 방법',
    choices: [
      { id: 'A', text: '회사 방침을 따른다. 조직 전체 상황을 봐야 한다.' },
      { id: 'B', text: '경영진에게 감축의 영향을 데이터로 보여주고, 대안을 제시하며 협상한다.' },
      { id: 'C', text: '감축은 수용하되, 업무 범위 축소나 우선순위 조정을 함께 요청한다.' },
    ],
  },

  // LEAD-CD-001: 명확한 지시 (Clear Direction) - 리더 시점
  {
    id: 'LEAD-CD-001',
    type: 'Leader',
    competency: 'clear-direction',
    title: '모호한 상위 지시의 전달',
    situation: '임원이 "다음 달까지 매출 늘려봐"라는 모호한 지시를 내렸습니다. 구체적인 수치도, 예산도, 방법도 없습니다. 팀원들에게 어떻게 전달해야 할지 고민됩니다.',
    learningPoint: '모호한 상위 지시를 명확한 팀 목표로 전환하는 능력',
    choices: [
      { id: 'A', text: '그대로 전달하고 각자 알아서 방법을 찾게 한다.' },
      { id: 'B', text: '직접 목표를 구체화(예: 10% 증가)하고, 담당별 액션을 정해서 지시한다.' },
      { id: 'C', text: '임원에게 구체적인 목표와 우선순위를 확인한 후 팀에 전달한다.' },
    ],
  },

  // LEAD-MO-001: 동기 부여 (Motivation) - 리더 시점
  {
    id: 'LEAD-MO-001',
    type: 'Leader',
    competency: 'motivation',
    title: '매너리즘에 빠진 팀원',
    situation: '한때 열정적이었던 5년차 팀원이 요즘 의욕 없이 최소한의 일만 합니다. 면담에서 "더 이상 성장이 없는 것 같다"고 털어놓았습니다.',
    learningPoint: '팀원의 내재적 동기를 파악하고 자극하는 방법',
    choices: [
      { id: 'A', text: '명확한 목표와 인센티브를 제시하고, 달성 시 보상을 약속한다.' },
      { id: 'B', text: '새로운 프로젝트 리더 역할이나 교육 기회를 제안한다.' },
      { id: 'C', text: '무엇을 할 때 가장 보람을 느끼는지 깊이 대화하고, 업무를 재조정한다.' },
    ],
  },

  // LEAD-EM-001: 임파워먼트 (Empowerment) - 리더 시점
  {
    id: 'LEAD-EM-001',
    type: 'Leader',
    competency: 'empowerment',
    title: '권한 위임의 경계',
    situation: '중요한 고객사 미팅을 유능한 차석에게 맡기려 합니다. 그런데 이 고객은 까다롭기로 유명하고, 미팅이 잘못되면 계약을 잃을 수 있습니다.',
    learningPoint: '적절한 권한 위임과 리스크 관리의 균형',
    choices: [
      { id: 'A', text: '리스크가 크니 내가 직접 미팅을 주도하고, 차석은 보조 역할만 맡긴다.' },
      { id: 'B', text: '차석을 믿고 전권을 맡기되, 결과에 대한 책임은 내가 진다고 선언한다.' },
      { id: 'C', text: '미팅 준비와 리허설을 함께하고, 미팅에는 배석하되 차석이 리드하게 한다.' },
    ],
  },

  // LEAD-DM-001: 의사결정 (Decision Making) - 리더 시점
  {
    id: 'LEAD-DM-001',
    type: 'Leader',
    competency: 'decision-making',
    title: '데이터 vs 직관',
    situation: '신제품 출시 여부를 결정해야 합니다. 시장 조사 데이터는 "리스크가 높다"고 나왔지만, 영업팀의 직관은 "충분히 승산이 있다"입니다. 결정 마감이 오늘입니다.',
    learningPoint: '불확실한 상황에서 합리적 의사결정을 내리는 방법',
    choices: [
      { id: 'A', text: '데이터를 신뢰하고 출시를 보류한다.' },
      { id: 'B', text: '현장 직관을 믿고 출시를 강행한다.' },
      { id: 'C', text: '특정 지역에서 파일럿 테스트 후 전면 출시 여부를 결정한다.' },
    ],
  },

  // LEAD-CO-001: 코칭 (Coaching) - 리더 시점
  {
    id: 'LEAD-CO-001',
    type: 'Leader',
    competency: 'coaching',
    title: '실수를 반복하는 팀원',
    situation: '같은 유형의 실수를 세 번째 반복하는 팀원이 있습니다. 매번 지적하면 미안하다고 하지만 개선이 없고, 이번에도 고객 클레임으로 이어졌습니다.',
    learningPoint: '효과적인 피드백과 행동 변화를 이끄는 코칭 스킬',
    choices: [
      { id: 'A', text: '이번이 마지막 기회임을 명확히 하고, 재발 시 인사조치가 있음을 통보한다.' },
      { id: 'B', text: '왜 같은 실수가 반복되는지 함께 분석하고, 체크리스트나 프로세스를 만든다.' },
      { id: 'C', text: '이 업무가 적성에 안 맞는 것 같으니 다른 역할로 재배치한다.' },
    ],
  },

  // LEAD-SL-001: 서번트 리더십 (Servant Leadership) - 리더 시점
  {
    id: 'LEAD-SL-001',
    type: 'Leader',
    competency: 'servant-leadership',
    title: '팀의 성공 vs 나의 공로',
    situation: '팀 프로젝트가 대성공하여 임원진 앞에서 발표할 기회가 왔습니다. 대부분의 아이디어는 막내 팀원에게서 나왔습니다. 당신이 발표하면 승진에 유리합니다.',
    learningPoint: '팀원의 성장과 인정 기회를 우선시하는 서번트 리더십',
    choices: [
      { id: 'A', text: '팀장으로서 결과에 책임졌으니 내가 발표하고, 팀원들 이름은 슬라이드에 넣는다.' },
      { id: 'B', text: '막내에게 발표 기회를 주고, 나는 옆에서 서포트한다.' },
      { id: 'C', text: '막내와 함께 발표하며, 아이디어의 출처가 막내임을 명확히 밝힌다.' },
    ],
  },

  // LEAD-PS-001: 심리적 안전감 (Psychological Safety) - 리더 시점
  {
    id: 'LEAD-PS-001',
    type: 'Leader',
    competency: 'psychological-safety',
    title: '실수를 숨기는 팀 문화',
    situation: '팀원이 실수를 하루가 지나서야 보고했습니다. "말하면 혼날까봐 무서웠다"고 합니다. 즉시 보고했으면 손실이 적었을 텐데, 팀 분위기를 어떻게 바꿔야 할까요?',
    learningPoint: '실수를 숨기지 않고 공유할 수 있는 심리적 안전감 조성',
    choices: [
      { id: 'A', text: '늦은 보고에 대해 경고를 주어, 다음부터 즉시 보고하게 한다.' },
      { id: 'B', text: '팀 미팅에서 "실수는 빨리 공유하자"는 원칙을 세우고, 내 실수 사례를 먼저 공유한다.' },
      { id: 'C', text: '실수 보고 채널을 익명으로 만들어 부담을 줄인다.' },
    ],
  },

  // LEAD-CF-001: 갈등 관리 (Conflict Management) - 리더 시점
  {
    id: 'LEAD-CF-001',
    type: 'Leader',
    competency: 'conflict-management',
    title: '팀원 간 갈등 중재',
    situation: '두 핵심 팀원이 프로젝트 방향에 대해 정면 대립하고 있습니다. A는 기존 방식, B는 새 방식을 주장합니다. 회의가 점점 감정적으로 변하고 있습니다.',
    learningPoint: '리더로서 팀 내 갈등을 생산적으로 해결하는 방법',
    choices: [
      { id: 'A', text: '논쟁을 중단시키고 내가 A 또는 B 중 하나를 최종 결정한다.' },
      { id: 'B', text: '각자의 안을 객관적 기준으로 평가하는 프레임워크를 함께 만들어 결정한다.' },
      { id: 'C', text: '두 접근법의 장점을 결합한 제3의 대안을 함께 찾아본다.' },
    ],
  },

  // LEAD-DI-001: 다양성 포용 (Diversity & Inclusion) - 리더 시점
  {
    id: 'LEAD-DI-001',
    type: 'Leader',
    competency: 'diversity-inclusion',
    title: '소수 의견의 가치',
    situation: '팀 회의에서 대부분 비슷한 의견으로 빠르게 합의가 이루어지고 있습니다. 한 명만 계속 다른 의견을 냅니다. 회의 시간이 길어지고 있습니다.',
    learningPoint: '소수 의견의 가치를 인정하고 다양성을 존중하는 팀 문화',
    choices: [
      { id: 'A', text: '"충분히 들었으니 다수 의견으로 가자"며 진행한다.' },
      { id: 'B', text: '"구체적으로 어떤 문제가 예상되나요?"라고 더 깊이 물어본다.' },
      { id: 'C', text: '"이 분의 우려가 맞다면?"이라고 가정하고 팀 전체가 반대 논리를 검토한다.' },
    ],
  },

  // LEAD-MA-001: 상호 책임 (Mutual Accountability) - 리더 시점
  {
    id: 'LEAD-MA-001',
    type: 'Leader',
    competency: 'mutual-accountability',
    title: '무임승차자 문제',
    situation: '팀 프로젝트에서 한 명이 맡은 파트를 계속 늦게 제출하고 품질도 낮습니다. 다른 팀원들이 커버하느라 지쳐가고 불만이 쌓이고 있습니다.',
    learningPoint: '리더로서 팀원 간 상호 책임 문화를 형성하는 방법',
    choices: [
      { id: 'A', text: '해당 팀원과 1:1 면담으로 원인을 파악하고 개선 계획을 함께 세운다.' },
      { id: 'B', text: '팀 미팅에서 업무 진행 상황을 투명하게 공유하는 시스템을 도입한다.' },
      { id: 'C', text: '명확한 성과 기준을 제시하고, 미달 시 불이익이 있음을 공지한다.' },
    ],
  },

  // LEAD-CL-001: 협업 툴 활용 (Collaboration Tools) - 리더 시점
  {
    id: 'LEAD-CL-001',
    type: 'Leader',
    competency: 'collaboration-tools',
    title: '협업 도구의 혼란',
    situation: '팀에서 이메일, 메신저, 프로젝트 관리 툴을 모두 사용합니다. 중요한 정보가 여기저기 흩어져 "그거 어디서 공유했더라?" 하는 상황이 자주 발생합니다.',
    learningPoint: '리더로서 효율적인 협업 환경을 구축하는 방법',
    choices: [
      { id: 'A', text: '한 가지 도구로 통일하자고 하고 나머지는 사용을 중단한다.' },
      { id: 'B', text: '각 도구의 용도를 명확히 정의한 "소통 가이드라인"을 만들어 공유한다.' },
      { id: 'C', text: '각자 편한 도구를 쓰되, 중요한 건 여러 곳에 중복 공유하게 한다.' },
    ],
  },

  // ============================================================
  // TEAMSHIP (팀십) - 팀 전체 대상 (22개 역량)
  // ============================================================

  // TEAM-SA-001: 자기 인식 (Self-Awareness) - 팀 시점
  {
    id: 'TEAM-SA-001',
    type: 'Team',
    competency: 'self-awareness',
    title: '팀의 자화상',
    situation: '분기 회고에서 "우리 팀은 어떤 팀인가?"라는 질문이 나왔습니다. 각자 생각이 다릅니다. 누구는 "실행력이 강하다", 누구는 "창의적이다", 누구는 "보수적이다"라고 합니다. 팀의 정체성을 어떻게 정리해야 할까요?',
    learningPoint: '팀이 스스로를 객관적으로 인식하고 정체성을 확립하는 과정',
    choices: [
      { id: 'A', text: '외부 평가를 기준으로 한다 - 타 팀이나 고객이 우리를 어떻게 보는지 조사한다.' },
      { id: 'B', text: '팀원 각자의 인식을 모두 존중하고, 통합된 팀 비전을 새로 만든다.' },
      { id: 'C', text: '실제 성과 데이터를 기반으로 우리 팀의 강점과 약점을 객관적으로 분석한다.' },
    ],
  },

  // TEAM-EC-001: 감정 조절 (Emotional Control) - 팀 시점
  {
    id: 'TEAM-EC-001',
    type: 'Team',
    competency: 'emotional-control',
    title: '지친 팀의 분위기',
    situation: '몇 달간 강도 높은 프로젝트가 계속되면서 팀 전체가 지쳐있습니다. 회의 분위기가 무겁고, 사소한 일에도 예민하게 반응하며, 농담도 사라졌습니다. 팀의 감정 상태를 어떻게 관리해야 할까요?',
    learningPoint: '팀 전체의 감정 상태를 인식하고 함께 관리하는 방법',
    choices: [
      { id: 'A', text: '업무를 줄이기 어렵다면, 짧은 팀 휴식 시간이라도 의무화한다.' },
      { id: 'B', text: '팀 미팅에서 "요즘 어떠세요?"라고 감정 상태를 공유하는 시간을 만든다.' },
      { id: 'C', text: '목표를 조정하거나 일정을 재협상하여 근본적인 부담을 줄인다.' },
    ],
  },

  // TEAM-TM-001: 시간 관리 (Time Management) - 팀 시점
  {
    id: 'TEAM-TM-001',
    type: 'Team',
    competency: 'time-management',
    title: '회의가 너무 많아',
    situation: '팀원들이 "회의가 너무 많아서 정작 일할 시간이 없다"고 호소합니다. 실제로 하루에 3-4개 회의가 있어 집중 시간이 부족합니다. 그러나 회의마다 나름 목적이 있어 쉽게 없앨 수 없습니다.',
    learningPoint: '팀 단위의 시간 관리와 회의 효율화',
    choices: [
      { id: 'A', text: '모든 회의를 검토하여 필수 아닌 것은 과감히 없앤다.' },
      { id: 'B', text: '회의 없는 날(No Meeting Day)을 주 1-2회 지정한다.' },
      { id: 'C', text: '회의 시간을 30분 이내로 제한하고, 정보 공유는 비동기로 전환한다.' },
    ],
  },

  // TEAM-RS-001: 회복탄력성 (Resilience) - 팀 시점
  {
    id: 'TEAM-RS-001',
    type: 'Team',
    competency: 'resilience',
    title: '프로젝트 실패 후',
    situation: '6개월간 준비한 핵심 프로젝트가 중단되었습니다. 팀원들 사이에 실망감과 허탈함이 퍼져있고, "우리가 뭘 잘못했나", "다음에도 똑같지 않을까" 하는 분위기입니다. 팀이 어떻게 다시 일어서야 할까요?',
    learningPoint: '팀이 실패를 경험하고 다시 일어서는 회복력',
    choices: [
      { id: 'A', text: '빠르게 다음 프로젝트에 집중하며 앞으로 나아간다. 실패에 집착하지 않는다.' },
      { id: 'B', text: '충분히 아쉬워하는 시간을 갖고, 이후 공식적인 회고를 통해 교훈을 정리한다.' },
      { id: 'C', text: '팀원 각자가 이 경험에서 배운 것을 공유하고 개인 성장의 기회로 삼는다.' },
    ],
  },

  // TEAM-LA-001: 학습 민첩성 (Learning Agility) - 팀 시점
  {
    id: 'TEAM-LA-001',
    type: 'Team',
    competency: 'learning-agility',
    title: '새로운 기술 도입',
    situation: '업계 표준이 바뀌어 팀 전체가 새로운 기술 스택을 배워야 합니다. 일부는 적극적이지만, 일부는 "왜 잘 되는 걸 바꾸나"며 저항합니다. 학습 속도 차이로 팀 내 격차가 벌어질 우려도 있습니다.',
    learningPoint: '팀 전체가 함께 새로운 것을 학습하는 민첩성',
    choices: [
      { id: 'A', text: '빠른 학습자가 먼저 익히고, 내부 강의로 나머지 팀원들을 교육한다.' },
      { id: 'B', text: '외부 교육 예산을 확보하여 전원이 동시에 공식 교육을 받는다.' },
      { id: 'C', text: '페어 프로그래밍 등으로 익숙한 사람과 낯선 사람이 함께 학습한다.' },
    ],
  },

  // TEAM-PV-001: 선제적 비전 (Proactive Vision) - 팀 시점
  {
    id: 'TEAM-PV-001',
    type: 'Team',
    competency: 'proactive-vision',
    title: '우리 팀의 미래',
    situation: '안정적으로 운영되던 팀이지만, 회사의 전략 변화로 1년 후 팀의 역할이 불확실해졌습니다. 팀장은 "일단 눈앞의 일에 집중하자"고 하지만, 팀원들 사이에서 불안감이 생기고 있습니다.',
    learningPoint: '팀이 함께 미래를 준비하고 방향을 설정하는 능력',
    choices: [
      { id: 'A', text: '팀장의 지시대로 현재 업무에 집중하며 상황을 지켜본다.' },
      { id: 'B', text: '팀 차원에서 미래 시나리오를 논의하고, 대비 계획을 세운다.' },
      { id: 'C', text: '각자 개인적으로 역량을 키워 어떤 변화에도 대응할 수 있게 준비한다.' },
    ],
  },

  // TEAM-AL-001: 적극적 경청 (Active Listening) - 팀 시점
  {
    id: 'TEAM-AL-001',
    type: 'Team',
    competency: 'active-listening',
    title: '말이 통하지 않는 회의',
    situation: '팀 회의에서 모두 자기 의견만 말하고, 다른 사람 말은 제대로 안 듣는 것 같습니다. 같은 이야기가 반복되고, 결론 없이 끝나는 회의가 많아졌습니다.',
    learningPoint: '팀원들이 서로의 말을 진정으로 경청하는 문화 만들기',
    choices: [
      { id: 'A', text: '발언 전 앞 사람 의견을 요약해서 말하는 규칙을 도입한다.' },
      { id: 'B', text: '회의 진행자를 두어 발언 순서와 시간을 관리한다.' },
      { id: 'C', text: '회의 후 "오늘 가장 인상 깊었던 다른 분의 의견"을 각자 공유한다.' },
    ],
  },

  // TEAM-PR-001: 프레젠테이션 (Presentation) - 팀 시점
  {
    id: 'TEAM-PR-001',
    type: 'Team',
    competency: 'presentation',
    title: '팀 발표 준비',
    situation: '전사 미팅에서 우리 팀 성과를 발표해야 합니다. 누가 발표할지, 어떤 내용을 담을지 의견이 분분합니다. 각자 자기 파트만 강조하고 싶어하고, 전체 메시지가 명확하지 않습니다.',
    learningPoint: '팀의 성과를 효과적으로 전달하는 공동 프레젠테이션 능력',
    choices: [
      { id: 'A', text: '발표 경험이 많은 한 명이 대표로 모든 내용을 전달한다.' },
      { id: 'B', text: '각 파트 담당자가 릴레이로 발표하여 전문성을 보여준다.' },
      { id: 'C', text: '핵심 메시지 하나를 정하고, 그에 맞춰 전체 스토리를 재구성한다.' },
    ],
  },

  // TEAM-CT-001: 비판적 사고 (Critical Thinking) - 팀 시점
  {
    id: 'TEAM-CT-001',
    type: 'Team',
    competency: 'critical-thinking',
    title: '집단 사고의 위험',
    situation: '최근 팀 회의에서 결정들이 너무 쉽게 합의됩니다. "이거 좋은 것 같아요"라고 하면 다들 동의하고 넘어갑니다. 나중에 문제가 발견되어 다시 수정하는 일이 늘고 있습니다.',
    learningPoint: '팀이 집단 사고에 빠지지 않고 비판적으로 검토하는 능력',
    choices: [
      { id: 'A', text: '매 의사결정마다 공식적인 반대 역할(Devil\'s Advocate)을 지정한다.' },
      { id: 'B', text: '결정 전 "이 방안의 문제점 3가지"를 반드시 나열하는 절차를 만든다.' },
      { id: 'C', text: '결정 후 일정 시간 "숙려 기간"을 두고 재검토 기회를 갖는다.' },
    ],
  },

  // TEAM-FR-001: 피드백 수용 (Feedback Reception) - 팀 시점
  {
    id: 'TEAM-FR-001',
    type: 'Team',
    competency: 'feedback-reception',
    title: '타 팀의 불만',
    situation: '협업 부서로부터 "당신들 팀은 소통이 안 된다", "요청에 응답이 느리다"는 피드백이 왔습니다. 팀원들은 억울해합니다. "우리도 바쁘다", "그쪽이 무리한 요구를 한다"며 방어적입니다.',
    learningPoint: '팀이 외부 피드백을 수용하고 개선하는 자세',
    choices: [
      { id: 'A', text: '우선 팀 내에서 우리 입장을 정리하고, 상대 팀에 설명한다.' },
      { id: 'B', text: '피드백을 겸허히 받아들이고, 구체적으로 뭘 개선하면 되는지 상대 팀에 물어본다.' },
      { id: 'C', text: '양 팀이 함께 모여 서로의 상황을 이해하고 협업 방식을 재정립한다.' },
    ],
  },

  // TEAM-CM-001: 갈등 관리 (Conflict Management) - 팀 시점
  {
    id: 'TEAM-CM-001',
    type: 'Team',
    competency: 'conflict-management',
    title: '두 파벌의 대립',
    situation: '팀 내에 업무 스타일이 다른 두 그룹이 형성되어 있습니다. 한 쪽은 체계적이고 문서화를 중시하고, 다른 쪽은 빠른 실행과 유연함을 선호합니다. 점점 서로를 비난하는 분위기입니다.',
    learningPoint: '팀 내 갈등을 건설적으로 해결하는 방법',
    choices: [
      { id: 'A', text: '팀장이 명확한 기준을 제시하여 한 가지 방식으로 통일한다.' },
      { id: 'B', text: '각 그룹 대표가 모여 서로의 장점을 인정하고 절충안을 찾는다.' },
      { id: 'C', text: '프로젝트 성격에 따라 두 방식을 상황적으로 선택하는 기준을 만든다.' },
    ],
  },

  // TEAM-CD-001: 창의적 설계 (Creative Design) - 팀 시점
  {
    id: 'TEAM-CD-001',
    type: 'Team',
    competency: 'creative-design',
    title: '아이디어 고갈',
    situation: '신규 서비스 기획 회의에서 아이디어가 나오지 않습니다. "예전에 해봤는데 안 됐어", "그건 현실적으로 어려워"라는 말만 나옵니다. 팀의 창의성이 막혀있는 것 같습니다.',
    learningPoint: '팀이 함께 창의적 아이디어를 도출하는 방법',
    choices: [
      { id: 'A', text: '제약 조건을 잠시 잊고 "만약 예산이 무한하다면?"같은 질문으로 브레인스토밍한다.' },
      { id: 'B', text: '다른 산업이나 경쟁사 사례를 분석하여 영감을 얻는다.' },
      { id: 'C', text: '팀 외부 사람(다른 부서, 고객)을 초대하여 새로운 관점을 얻는다.' },
    ],
  },

  // TEAM-MO-001: 동기 부여 (Motivation) - 팀 시점
  {
    id: 'TEAM-MO-001',
    type: 'Team',
    competency: 'motivation',
    title: '사기 저하',
    situation: '팀의 열정이 예전 같지 않습니다. 출근해서 시키는 일만 하고, 자발적인 제안이나 추가 노력은 사라졌습니다. 회식도 참여율이 낮고, "왜 열심히 해야 하지?"라는 분위기입니다.',
    learningPoint: '팀 전체의 동기와 에너지를 높이는 방법',
    choices: [
      { id: 'A', text: '팀의 목표와 그 의미를 다시 공유하고, 우리 일의 영향력을 상기시킨다.' },
      { id: 'B', text: '작은 성과라도 인정하고 축하하는 문화를 만든다.' },
      { id: 'C', text: '팀원들에게 더 많은 자율성과 결정권을 부여한다.' },
    ],
  },

  // TEAM-EM-001: 공감 능력 (Empathy) - 팀 시점
  {
    id: 'TEAM-EM-001',
    type: 'Team',
    competency: 'empathy',
    title: '팀원의 어려움',
    situation: '한 팀원이 최근 개인 사정으로 힘들어하고 있습니다. 업무 퍼포먼스가 떨어지고 있지만, 본인은 티 내지 않으려 애씁니다. 팀 전체가 이 상황을 어떻게 대해야 할까요?',
    learningPoint: '팀원의 어려움에 팀이 함께 공감하고 지지하는 방법',
    choices: [
      { id: 'A', text: '업무를 조용히 분담하되, 본인이 원하지 않으면 굳이 언급하지 않는다.' },
      { id: 'B', text: '팀장이 대표로 개인적으로 대화하고, 팀 차원의 지원을 제안한다.' },
      { id: 'C', text: '팀 모두가 모인 자리에서 "우리가 어떻게 도울 수 있을지" 함께 이야기한다.' },
    ],
  },

  // TEAM-DM-001: 의사 결정 (Decision Making) - 팀 시점
  {
    id: 'TEAM-DM-001',
    type: 'Team',
    competency: 'decision-making',
    title: '합의가 안 될 때',
    situation: '중요한 의사결정에서 팀원들 의견이 팽팽하게 나뉘어 있습니다. 다수결로 하자니 소수 의견이 무시되고, 합의를 보자니 시간만 갑니다. 결정 지연으로 프로젝트가 늦어지고 있습니다.',
    learningPoint: '팀이 효과적으로 의사결정을 내리는 방법',
    choices: [
      { id: 'A', text: '충분한 논의 후 팀장이 최종 결정하고, 팀원은 그 결정을 따른다.' },
      { id: 'B', text: '각 의견의 장단점을 정량적으로 분석하여 객관적 기준으로 결정한다.' },
      { id: 'C', text: '작은 규모로 두 방안을 모두 테스트한 후 결과를 보고 결정한다.' },
    ],
  },

  // TEAM-CO-001: 코칭 (Coaching) - 팀 시점
  {
    id: 'TEAM-CO-001',
    type: 'Team',
    competency: 'coaching',
    title: '서로 가르치기',
    situation: '팀원들마다 각기 다른 전문성이 있지만, 서로 배우는 기회가 없습니다. A는 데이터 분석을 잘하고, B는 고객 응대가 뛰어나지만, 각자 자기 일만 합니다. 팀 전체 역량이 정체되어 있습니다.',
    learningPoint: '팀원 간 지식과 기술을 공유하는 상호 코칭 문화',
    choices: [
      { id: 'A', text: '정기적인 "스킬 공유 세션"을 만들어 돌아가며 서로 가르친다.' },
      { id: 'B', text: '업무를 로테이션하여 자연스럽게 다양한 역량을 익힌다.' },
      { id: 'C', text: '멘토-멘티 짝을 지어 1:1로 특정 역량을 전수한다.' },
    ],
  },

  // TEAM-SL-001: 서번트 리더십 (Servant Leadership) - 팀 시점
  {
    id: 'TEAM-SL-001',
    type: 'Team',
    competency: 'servant-leadership',
    title: '서로 돕는 문화',
    situation: '팀에서 "각자 맡은 일은 각자"라는 분위기가 강합니다. 누군가 힘들어해도 "네 일이니까"라며 관여하지 않습니다. 팀워크라기보다 개인들의 합 같은 느낌입니다.',
    learningPoint: '팀원들이 서로 돕고 봉사하는 문화 만들기',
    choices: [
      { id: 'A', text: '"도움 요청"을 공식화하여 부담 없이 도움을 주고받는 채널을 만든다.' },
      { id: 'B', text: '팀장이 솔선수범하여 팀원의 업무를 직접 도와주는 모습을 보인다.' },
      { id: 'C', text: '팀 목표 달성 시 전원에게 동일한 보상을 주어 공동 책임 의식을 높인다.' },
    ],
  },

  // TEAM-PS-001: 심리적 안전감 (Psychological Safety) - 팀 시점
  {
    id: 'TEAM-PS-001',
    type: 'Team',
    competency: 'psychological-safety',
    title: '실수를 말할 수 있는 팀',
    situation: '팀원이 고객 데이터를 실수로 삭제했습니다. 복구는 가능하지만 시간이 걸립니다. 이 팀원은 "말하면 혼날까봐 무서웠다"며 하루가 지나서야 보고했습니다. 팀 분위기를 어떻게 바꿔야 할까요?',
    learningPoint: '실수를 숨기지 않고 공유할 수 있는 심리적 안전감 조성',
    choices: [
      { id: 'A', text: '처벌보다 빠른 보고를 강조하고, "실수는 빨리 공유해야 한다"는 원칙을 세운다.' },
      { id: 'B', text: '팀장이 먼저 자신의 실수 사례를 공유하여 솔직한 분위기를 만든다.' },
      { id: 'C', text: '실수 보고 채널을 별도로 만들어 심리적 부담을 줄인다.' },
    ],
  },

  // TEAM-CF-001: 갈등 촉진 (Conflict Facilitation) - 팀 시점
  {
    id: 'TEAM-CF-001',
    type: 'Team',
    competency: 'conflict-facilitation',
    title: '표면적 평화',
    situation: '우리 팀은 갈등이 없어 보이지만, 사실 서로 불만을 말 못하고 있는 것 같습니다. 회의에서는 조용히 동의하다가 뒤에서 불평합니다. 건강한 토론이 없어 아이디어 발전도 느립니다.',
    learningPoint: '건설적인 갈등을 통해 팀이 성장하는 방법',
    choices: [
      { id: 'A', text: '"반대 의견 환영"을 공식화하고, 다른 생각을 말하면 보상한다.' },
      { id: 'B', text: '익명으로 의견을 제출할 수 있는 시스템을 도입한다.' },
      { id: 'C', text: '정기적으로 "이번 결정의 문제점 찾기" 세션을 운영한다.' },
    ],
  },

  // TEAM-DI-001: 다양성 포용 (Diversity & Inclusion) - 팀 시점
  {
    id: 'TEAM-DI-001',
    type: 'Team',
    competency: 'diversity-inclusion',
    title: '다른 의견의 가치',
    situation: '팀 회의에서 대부분 비슷한 의견으로 빠르게 합의가 이루어지고 있습니다. 그런데 한 명만 계속 "그래도 문제가 있을 것 같은데..."라며 다른 의견을 냅니다. 회의 시간이 길어지고 있습니다.',
    learningPoint: '소수 의견의 가치를 인정하고 다양성을 존중하는 팀 문화',
    choices: [
      { id: 'A', text: '"충분히 들었으니 다수 의견으로 가자"며 진행한다.' },
      { id: 'B', text: '그 사람에게 "구체적으로 어떤 문제가 예상되나요?"라고 더 깊이 물어본다.' },
      { id: 'C', text: '"만약 이 분의 우려가 맞다면?"이라고 가정하고 팀 전체가 반대 논리를 검토한다.' },
    ],
  },

  // TEAM-MA-001: 상호 책임 (Mutual Accountability) - 팀 시점
  {
    id: 'TEAM-MA-001',
    type: 'Team',
    competency: 'mutual-accountability',
    title: '무임승차자 문제',
    situation: '팀 프로젝트에서 한 명이 맡은 파트를 계속 늦게 제출하고, 품질도 낮습니다. 다른 팀원들이 그 사람 몫까지 커버하느라 지쳐가고 있습니다. 팀장에게 말하자니 고자질 같고, 직접 말하자니 분위기가 나빠질 것 같습니다.',
    learningPoint: '팀원 간 상호 책임을 지는 문화 형성',
    choices: [
      { id: 'A', text: '당사자에게 개인적으로 "요즘 힘든 일 있어? 같이 해결해보자"라고 먼저 다가간다.' },
      { id: 'B', text: '개인을 지목하지 않고 "업무 분담과 일정 준수"를 팀 미팅 안건으로 올린다.' },
      { id: 'C', text: '상황을 팀장에게 보고하고 해결을 요청한다.' },
    ],
  },

  // TEAM-CL-001: 협업 툴 활용 (Collaboration Tools) - 팀 시점
  {
    id: 'TEAM-CL-001',
    type: 'Team',
    competency: 'collaboration-tools',
    title: '협업 도구의 혼란',
    situation: '팀에서 업무 소통에 이메일, 메신저, 프로젝트 관리 툴을 모두 사용하고 있습니다. 중요한 정보가 여기저기 흩어져 있어서 "그거 어디서 공유했더라?" 하는 상황이 자주 발생합니다.',
    learningPoint: '효율적인 협업을 위한 도구와 규칙 정립',
    choices: [
      { id: 'A', text: '한 가지 도구로 통일하자고 제안하고 나머지는 사용을 중단한다.' },
      { id: 'B', text: '각 도구의 용도를 명확히 정의한 "소통 가이드라인"을 만들어 팀에 공유한다.' },
      { id: 'C', text: '각자 편한 도구를 쓰되, 중요한 건 여러 곳에 중복 공유한다.' },
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
