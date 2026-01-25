import React, { useState, useRef } from 'react';
import { Team } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Download, Image as ImageIcon, Sparkles, Loader, FileText, Upload, Printer, Trophy, ChevronDown, ChevronUp, RefreshCw, Settings } from 'lucide-react';
import { DEFAULT_REPORT_GENERATION_GUIDELINES } from '../constants';

interface ReportViewProps {
  teams: Team[];
  onClose: () => void;
  reportGenerationGuidelines?: string;
}

// 팀별 AI 피드백 타입
interface TeamFeedbackData {
  overall: string;
  strengths: string[];
  improvements: string[];
  advice: string[];
  discussion_topics: string[];
}

interface TeamAIFeedback {
  teamName: string;
  feedback: TeamFeedbackData;
}

// 종합 AI 분석 타입
interface OverallAnalysis {
  summary: string[];
  perspectives: {
    self_leadership: PerspectiveAnalysis;
    followership: PerspectiveAnalysis;
    leadership: PerspectiveAnalysis;
    teamship: PerspectiveAnalysis;
  };
  common_mistakes: string[];
  discussion_topics: string[];
  conclusion: string;
  encouragement: string;
}

interface PerspectiveAnalysis {
  title: string;
  analysis: string;
  strengths: string;
  improvements: string;
  action_plan: string;
}

const ReportView: React.FC<ReportViewProps> = ({ teams, onClose, reportGenerationGuidelines: initialGuidelines }) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [isGeneratingOverall, setIsGeneratingOverall] = useState(false);
  const [isGeneratingTeam, setIsGeneratingTeam] = useState(false);
  const [teamFeedbacks, setTeamFeedbacks] = useState<TeamAIFeedback[]>([]);
  const [overallAnalysis, setOverallAnalysis] = useState<OverallAnalysis | null>(null);
  const [reportMode, setReportMode] = useState<'summary' | 'team' | 'overall' | null>(null);

  // 리포트 생성 지침 (수정 가능)
  const [reportGuidelines, setReportGuidelines] = useState(initialGuidelines || DEFAULT_REPORT_GENERATION_GUIDELINES);
  const [showReportGuidelines, setShowReportGuidelines] = useState(false);

  const teamReportRef = useRef<HTMLDivElement>(null);
  const overallReportRef = useRef<HTMLDivElement>(null);

  // 단일 점수 기반 순위
  const rankedTeams = [...teams].sort((a, b) => (b.score ?? 100) - (a.score ?? 100));
  const winningTeam = rankedTeams[0];

  // 차트 데이터 (단일 점수)
  const barData = teams.map(t => ({
    name: t.name,
    점수: t.score ?? 100
  }));

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 10);
      setPhotos(newFiles);
    }
  };

  const generatePoster = async () => {
    if (!winningTeam) return;
    if (photos.length === 0) {
      alert("우승팀 사진을 최소 1장 업로드해주세요.");
      return;
    }

    setIsGeneratingPoster(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      const imageParts = await Promise.all(
        photos.slice(0, 3).map(async (file) => {
            const base64 = await fileToBase64(file);
            const base64Data = base64.split(',')[1];
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                }
            };
        })
      );

      const prompt = `
        Create a high-quality, cinematic movie poster celebrating the victory of the team named "${winningTeam.name}".
        Theme: Professional, Leadership, Success, Future.
        The poster should feel inspiring and epic.
        Includes text: "${winningTeam.name}" and "CHAMPIONS".
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            ...imageParts,
            { text: prompt }
          ]
        }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
           if (part.inlineData) {
               setPosterUrl(`data:image/png;base64,${part.inlineData.data}`);
               break;
           }
        }
      }

    } catch (e) {
      console.error(e);
      alert("포스터 생성에 실패했습니다.");
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const generateTeamFeedbacks = async () => {
    setIsGeneratingTeam(true);
    setReportMode('team');

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const feedbacks: TeamAIFeedback[] = [];

      for (const team of rankedTeams) {
        const historyContext = team.history.map(h =>
          `[${h.cardTitle}] 선택: ${h.choiceText}, 이유: ${h.reasoning}, AI피드백: ${h.aiFeedback}`
        ).join('\n');

        const feedbackPrompt = `
          당신은 리더십 교육 전문가입니다. 다음 팀의 게임 플레이 기록을 분석하여 종합 피드백을 한글로 작성해주세요.

          팀명: ${team.name}
          최종 점수: ${team.score ?? 100}점

          게임 기록:
          ${historyContext || '기록 없음'}

          ## 리포트 작성 지침
          ${reportGuidelines}

          다음 JSON 형식으로 작성해주세요:
          {
            "overall": "전반적 평가 (2-3문장)",
            "strengths": ["강점 1", "강점 2", "강점 3"],
            "improvements": ["개선점 1", "개선점 2", "개선점 3"],
            "advice": ["액션플랜 1", "액션플랜 2", "액션플랜 3"],
            "discussion_topics": ["토의주제 1", "토의주제 2", "토의주제 3"]
          }
        `;

        try {
          const feedbackResponse = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: feedbackPrompt,
            config: { responseMimeType: "application/json" }
          });

          const parsed = JSON.parse(feedbackResponse.text || '{}');
          feedbacks.push({
            teamName: team.name,
            feedback: parsed
          });
        } catch (err) {
          console.error(`Team ${team.name} feedback failed:`, err);
          feedbacks.push({
            teamName: team.name,
            feedback: {
              overall: '피드백 생성에 실패했습니다.',
              strengths: [],
              improvements: [],
              advice: [],
              discussion_topics: []
            }
          });
        }
      }

      setTeamFeedbacks(feedbacks);

    } catch (error) {
      console.error('Team feedbacks generation failed:', error);
      alert('팀별 피드백 생성에 실패했습니다.');
    } finally {
      setIsGeneratingTeam(false);
    }
  };

  const generateOverallAnalysis = async () => {
    setIsGeneratingOverall(true);
    setReportMode('overall');

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      const context = rankedTeams.map(t => {
        const historyStr = t.history.map(h =>
          `[${h.cardTitle}] 선택: ${h.choiceId}, 이유: ${h.reasoning.substring(0, 50)}`
        ).join('; ');
        return `팀 ${t.name}: 점수 ${t.score ?? 100}. 의사결정: ${historyStr || '없음'}`;
      }).join('\n');

      const prompt = `
        당신은 리더십 교육 전문가입니다. 다음 게임 결과를 분석하여 종합 리포트를 한글로 작성해주세요.

        게임 결과:
        ${context}

        ## 리포트 작성 지침
        ${reportGuidelines}

        다음 JSON 형식으로 작성해주세요:
        {
          "summary": ["인사이트 1", "인사이트 2", "인사이트 3"],
          "perspectives": {
            "self_leadership": {"title": "셀프리더십", "analysis": "분석", "strengths": "강점", "improvements": "개선점", "action_plan": "액션플랜"},
            "followership": {"title": "팔로워십", "analysis": "분석", "strengths": "강점", "improvements": "개선점", "action_plan": "액션플랜"},
            "leadership": {"title": "리더십", "analysis": "분석", "strengths": "강점", "improvements": "개선점", "action_plan": "액션플랜"},
            "teamship": {"title": "팀십", "analysis": "분석", "strengths": "강점", "improvements": "개선점", "action_plan": "액션플랜"}
          },
          "common_mistakes": ["실수1", "실수2", "실수3"],
          "discussion_topics": ["주제1", "주제2", "주제3", "주제4", "주제5"],
          "conclusion": "결론",
          "encouragement": "응원 메시지"
        }
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const aiAnalysis = JSON.parse(response.text || '{}') as OverallAnalysis;
      setOverallAnalysis(aiAnalysis);

    } catch (e) {
      console.error(e);
      alert("AI 분석 생성에 실패했습니다.");
    } finally {
      setIsGeneratingOverall(false);
    }
  };

  const handlePrint = (reportType: 'team' | 'overall') => {
    const printContent = reportType === 'team' ? teamReportRef.current : overallReportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('팝업이 차단되었습니다.');
      return;
    }

    const title = reportType === 'team' ? 'Bluemable Gamification - 팀별 리포트' : 'Bluemable Gamification - 종합 리포트';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
          * { font-family: 'Noto Sans KR', sans-serif; box-sizing: border-box; }
          body { padding: 20px; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.6; }
          h1 { color: #1e3a8a; border-bottom: 3px solid #1e3a8a; padding-bottom: 10px; }
          h2 { color: #1e3a8a; margin-top: 30px; }
          .team-section { page-break-inside: avoid; margin-bottom: 40px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px; }
          .perspective-section { margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #3b82f6; }
          .topic-item { padding: 10px; margin: 8px 0; background: #f3f4f6; border-radius: 4px; }
          @media print { .team-section { page-break-after: always; } }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-blue-900/90 z-[60] overflow-y-auto backdrop-blur-sm">
      <div className="container mx-auto p-4 md:p-8 min-h-screen">
        <div className="bg-white w-full border-4 border-black shadow-[10px_10px_0_0_#000] mb-8">
          <div className="flex justify-between items-center p-6 border-b-4 border-black bg-yellow-400 sticky top-0 z-10">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">미션 리포트</h1>
            <button onClick={onClose} className="px-6 py-2 bg-black text-white font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all">
              닫기 X
            </button>
          </div>

          <div className="p-4 md:p-8 grid gap-8">
            {/* 최종 순위 */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="border-4 border-black p-4 bg-gray-50 shadow-hard">
                <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-black pb-2 flex justify-between">
                  <span>최종 순위</span>
                  <span className="text-sm font-normal text-gray-500 normal-case">게임 점수 기준</span>
                </h2>
                <div className="space-y-3">
                  {rankedTeams.map((team, idx) => (
                    <div key={team.id} className={`p-4 border-4 border-black flex items-center justify-between ${idx === 0 ? 'bg-yellow-100' : 'bg-white'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`text-3xl font-black ${
                          idx === 0 ? 'text-yellow-600' :
                          idx === 1 ? 'text-gray-500' :
                          idx === 2 ? 'text-orange-600' :
                          'text-gray-700'
                        }`}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </span>
                        <span className="text-xl font-black">{team.name}</span>
                      </div>
                      <span className="text-3xl font-black text-blue-800">{team.score ?? 100}점</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 점수 차트 */}
              <div className="border-4 border-black p-4 bg-white shadow-hard flex flex-col">
                <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-black pb-2">점수 분포</h2>
                <div className="flex-1 min-h-[300px] border-2 border-black bg-gray-50 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                      <XAxis dataKey="name" tick={{fill: 'black', fontWeight: 'bold'}} />
                      <YAxis tick={{fill: 'black', fontWeight: 'bold'}} />
                      <Tooltip contentStyle={{ border: '2px solid black', borderRadius: '0' }} />
                      <Bar dataKey="점수" fill="#3B82F6" stroke="#000" strokeWidth={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 우승팀 포스터 */}
            <div className="border-4 border-black p-6 bg-gradient-to-r from-yellow-50 to-white shadow-hard">
              <div className="flex items-center gap-3 mb-4 border-b-4 border-black pb-2">
                <Sparkles className="text-yellow-500" size={32} />
                <h2 className="text-2xl font-black uppercase">우승팀 기념 AI 포스터</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="font-bold text-gray-700">1. 팀 사진 업로드 (1-10장)</p>
                  <label className="block p-4 border-4 border-dashed border-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors text-center">
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={24} className="text-gray-400" />
                      <span className="font-bold text-gray-500">{photos.length > 0 ? `${photos.length}개 사진 선택됨` : "클릭하여 사진 업로드"}</span>
                    </div>
                  </label>

                  <button onClick={generatePoster} disabled={photos.length === 0 || isGeneratingPoster}
                    className="w-full py-4 bg-black text-white font-black uppercase text-xl border-4 border-black shadow-hard hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isGeneratingPoster ? <Loader className="animate-spin" /> : <ImageIcon />}
                    {isGeneratingPoster ? "AI 포스터 생성 중..." : "포스터 생성"}
                  </button>
                </div>

                <div className="bg-gray-200 border-4 border-black min-h-[300px] flex items-center justify-center relative">
                  {posterUrl ? (
                    <div className="relative group w-full h-full">
                      <img src={posterUrl} alt="Generated Poster" className="w-full h-full object-contain p-2" />
                      <a href={posterUrl} download={`팀_${winningTeam?.name}_우승_포스터.png`}
                        className="absolute bottom-4 right-4 bg-white text-black p-2 border-2 border-black font-bold shadow-hard hover:bg-yellow-400 flex items-center gap-2">
                        <Download size={16} /> 다운로드
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-400 font-bold uppercase text-center p-4">포스터 미리보기 영역</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI 리포트 생성 버튼 */}
            <div className="border-4 border-black p-6 bg-white shadow-hard">
              <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">AI 리포트 생성</h2>

              {/* 리포트 생성 지침 설정 */}
              <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border-2 border-amber-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-amber-700 flex items-center gap-2">
                    <Settings size={16} />
                    리포트 생성 지침 (수정 가능)
                  </label>
                  <button
                    onClick={() => setShowReportGuidelines(!showReportGuidelines)}
                    className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800"
                  >
                    {showReportGuidelines ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showReportGuidelines ? '접기' : '펼치기'}
                  </button>
                </div>

                {showReportGuidelines && (
                  <div className="space-y-2">
                    <textarea
                      value={reportGuidelines}
                      onChange={(e) => setReportGuidelines(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                      placeholder="리포트 생성 지침을 입력하세요..."
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-amber-600">
                        수정된 지침은 팀별/종합 리포트 생성 시 적용됩니다.
                      </p>
                      <button
                        onClick={() => setReportGuidelines(DEFAULT_REPORT_GENERATION_GUIDELINES)}
                        className="text-xs text-amber-600 hover:text-amber-800 underline flex items-center gap-1"
                      >
                        <RefreshCw size={12} />
                        기본값으로 초기화
                      </button>
                    </div>
                  </div>
                )}

                {!showReportGuidelines && (
                  <p className="text-xs text-amber-600">
                    {reportGuidelines === DEFAULT_REPORT_GENERATION_GUIDELINES
                      ? '현재 기본 리포트 생성 지침이 적용됩니다.'
                      : '✏️ 수정된 리포트 생성 지침이 적용됩니다.'}
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button onClick={generateTeamFeedbacks} disabled={isGeneratingTeam}
                  className="flex-1 py-4 bg-blue-100 border-4 border-black font-bold uppercase hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {isGeneratingTeam ? <Loader className="animate-spin" /> : <FileText size={24} />}
                  {isGeneratingTeam ? "AI 분석 중..." : "팀별 리포트 생성"}
                </button>

                <button onClick={generateOverallAnalysis} disabled={isGeneratingOverall}
                  className="flex-1 py-4 bg-purple-100 border-4 border-black font-bold uppercase hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {isGeneratingOverall ? <Loader className="animate-spin" /> : <Sparkles size={24} />}
                  {isGeneratingOverall ? "AI 분석 중..." : "종합 리포트 생성"}
                </button>
              </div>
            </div>

            {/* 팀별 리포트 */}
            {teamFeedbacks.length > 0 && (
              <div className="border-4 border-black p-6 bg-blue-50 shadow-hard">
                <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
                  <h2 className="text-2xl font-black uppercase">팀별 AI 리포트</h2>
                  <button onClick={() => handlePrint('team')} className="px-4 py-2 bg-blue-500 text-white border-2 border-black font-bold flex items-center gap-2 hover:bg-blue-600">
                    <Printer size={18} /> PDF로 저장/인쇄
                  </button>
                </div>

                <div ref={teamReportRef} className="space-y-6">
                  {rankedTeams.map((team, idx) => {
                    const feedback = teamFeedbacks.find(f => f.teamName === team.name);
                    return (
                      <div key={team.id} className="team-section bg-white p-6 border-2 border-gray-300 rounded-lg">
                        <h3 className="text-xl font-black mb-4 text-blue-900 flex items-center gap-3">
                          <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                          {team.name} ({team.score ?? 100}점)
                        </h3>

                        {feedback?.feedback && (
                          <div className="space-y-4 text-sm">
                            <p className="text-gray-800 leading-relaxed">{feedback.feedback.overall}</p>

                            {feedback.feedback.strengths?.length > 0 && (
                              <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                                <h5 className="font-bold text-green-800 mb-2">강점</h5>
                                <ul className="space-y-1">
                                  {feedback.feedback.strengths.map((s: string, i: number) => (
                                    <li key={i} className="text-gray-700">• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {feedback.feedback.improvements?.length > 0 && (
                              <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                                <h5 className="font-bold text-orange-800 mb-2">개선점</h5>
                                <ul className="space-y-1">
                                  {feedback.feedback.improvements.map((s: string, i: number) => (
                                    <li key={i} className="text-gray-700">• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {feedback.feedback.advice?.length > 0 && (
                              <div className="bg-blue-100 p-3 rounded border-l-4 border-blue-500">
                                <h5 className="font-bold text-blue-800 mb-2">액션플랜</h5>
                                <ol className="space-y-2">
                                  {feedback.feedback.advice.map((item: string, i: number) => (
                                    <li key={i} className="text-gray-700 bg-white p-2 rounded border">{item}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {feedback.feedback.discussion_topics?.length > 0 && (
                              <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
                                <h5 className="font-bold text-purple-800 mb-2">💬 토의 주제</h5>
                                <ol className="space-y-2">
                                  {feedback.feedback.discussion_topics.map((item: string, i: number) => (
                                    <li key={i} className="text-gray-700 bg-white p-2 rounded border flex items-start gap-2">
                                      <span className="bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 종합 리포트 */}
            {overallAnalysis && (
              <div className="border-4 border-black p-6 bg-purple-50 shadow-hard">
                <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
                  <h2 className="text-2xl font-black uppercase">종합 AI 리포트</h2>
                  <button onClick={() => handlePrint('overall')} className="px-4 py-2 bg-purple-500 text-white border-2 border-black font-bold flex items-center gap-2 hover:bg-purple-600">
                    <Printer size={18} /> PDF로 저장/인쇄
                  </button>
                </div>

                <div ref={overallReportRef} className="space-y-6">
                  <h1 className="text-2xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2">Bluemable Gamification - 종합 리포트</h1>

                  <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                    <h2 className="text-xl font-bold mb-3 text-blue-900">종합 요약</h2>
                    <ol className="space-y-3">
                      {overallAnalysis.summary.map((item, idx) => (
                        <li key={idx} className="text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">{item}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                    <h2 className="text-xl font-bold mb-4 text-blue-900">모드별 분석</h2>
                    {(['self_leadership', 'followership', 'leadership', 'teamship'] as const).map(key => {
                      const perspective = overallAnalysis.perspectives[key];
                      if (!perspective) return null;
                      const colors: Record<string, string> = {
                        self_leadership: 'border-red-500 bg-red-50',
                        followership: 'border-blue-500 bg-blue-50',
                        leadership: 'border-green-500 bg-green-50',
                        teamship: 'border-purple-500 bg-purple-50'
                      };
                      return (
                        <div key={key} className={`perspective-section p-4 mb-4 border-l-4 ${colors[key]} rounded-r-lg`}>
                          <h3 className="font-bold text-lg mb-2">{perspective.title}</h3>
                          <p className="text-sm mb-3">{perspective.analysis}</p>
                          <div className="grid md:grid-cols-3 gap-3 text-sm">
                            <div className="bg-white p-2 rounded border"><strong className="text-green-700">잘한 점:</strong><p>{perspective.strengths}</p></div>
                            <div className="bg-white p-2 rounded border"><strong className="text-orange-700">개선점:</strong><p>{perspective.improvements}</p></div>
                            <div className="bg-white p-2 rounded border"><strong className="text-blue-700">액션플랜:</strong><p>{perspective.action_plan}</p></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 공통 실수 사례 */}
                  {overallAnalysis.common_mistakes?.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                      <h2 className="text-xl font-bold mb-3 text-red-800">⚠️ 공통 개선 필요 사항</h2>
                      <ul className="space-y-2">
                        {overallAnalysis.common_mistakes.map((item, idx) => (
                          <li key={idx} className="text-gray-700 bg-white p-3 rounded-lg border border-red-200">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 토론 주제 */}
                  {overallAnalysis.discussion_topics?.length > 0 && (
                    <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-300">
                      <h2 className="text-xl font-bold mb-3 text-indigo-800">💬 팀 토의 주제</h2>
                      <ol className="space-y-3">
                        {overallAnalysis.discussion_topics.map((item, idx) => (
                          <li key={idx} className="topic-item text-gray-700 bg-white p-3 rounded-lg border border-indigo-200 flex items-start gap-3">
                            <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">{idx + 1}</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="conclusion-box bg-yellow-100 p-4 rounded-lg border-2 border-yellow-500">
                    <h2 className="text-xl font-bold mb-3 text-yellow-800">마무리</h2>
                    <p className="text-gray-800 font-medium mb-4">{overallAnalysis.conclusion}</p>
                    {overallAnalysis.encouragement && (
                      <div className="bg-gradient-to-r from-yellow-200 to-orange-200 p-4 rounded-lg border-2 border-yellow-400 mt-4">
                        <p className="text-center text-lg font-bold text-yellow-900 italic">💪 {overallAnalysis.encouragement}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
