import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Download, Image as ImageIcon, Sparkles, Loader, FileText, Upload, Printer } from 'lucide-react';

interface ReportViewProps {
  teams: Team[];
  onClose: () => void;
}

// 팀별 AI 피드백 타입
interface TeamAIFeedback {
  teamName: string;
  feedback: string;
}

// 종합 AI 분석 타입
interface OverallAnalysis {
  summary: string;
  perspectives: {
    self_leadership: PerspectiveAnalysis;
    followership: PerspectiveAnalysis;
    leadership: PerspectiveAnalysis;
    teamship: PerspectiveAnalysis;
  };
  common_mistakes: string;
  discussion_topics: string[];
  conclusion: string;
}

interface PerspectiveAnalysis {
  title: string;
  analysis: string;
  strengths: string;
  improvements: string;
  action_plan: string;
}

const ReportView: React.FC<ReportViewProps> = ({ teams, onClose }) => {
  // --- State ---
  const [photos, setPhotos] = useState<File[]>([]);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [isGeneratingOverall, setIsGeneratingOverall] = useState(false);
  const [isGeneratingTeam, setIsGeneratingTeam] = useState(false);

  // AI 생성 결과 저장
  const [teamFeedbacks, setTeamFeedbacks] = useState<TeamAIFeedback[]>([]);
  const [overallAnalysis, setOverallAnalysis] = useState<OverallAnalysis | null>(null);

  // 리포트 뷰 모드
  const [reportMode, setReportMode] = useState<'summary' | 'team' | 'overall' | null>(null);

  const teamReportRef = useRef<HTMLDivElement>(null);
  const overallReportRef = useRef<HTMLDivElement>(null);

  // --- Calculations ---
  const rankedTeams = [...teams].sort((a, b) => {
    const sumA = a.resources.capital + a.resources.energy + a.resources.trust + a.resources.competency + a.resources.insight;
    const sumB = b.resources.capital + b.resources.energy + b.resources.trust + b.resources.competency + b.resources.insight;
    return sumB - sumA;
  });

  const winningTeam = rankedTeams[0];

  const barData = teams.map(t => ({
    name: t.name,
    Capital: t.resources.capital,
    Energy: t.resources.energy,
    Trust: t.resources.trust,
    Skill: t.resources.competency,
    Insight: t.resources.insight
  }));

  // --- Helpers ---
  const calculateTotal = (t: Team) => {
    return t.resources.capital + t.resources.energy + t.resources.trust + t.resources.competency + t.resources.insight;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // --- Actions ---

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
      alert("포스터 생성에 실패했습니다. API Key를 확인하거나 이미지 수를 줄여보세요.");
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  // 팀별 AI 피드백 생성
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
          최종 점수: ${calculateTotal(team)}점
          리소스 현황: 자본 ${team.resources.capital}, 에너지 ${team.resources.energy}, 신뢰 ${team.resources.trust}, 역량 ${team.resources.competency}, 통찰 ${team.resources.insight}

          게임 기록:
          ${historyContext || '기록 없음'}

          다음 형식으로 한글 종합 피드백을 작성해주세요:
          1. 전반적 평가 (2-3문장)
          2. 강점 (2-3가지)
          3. 개선점 (2-3가지)
          4. 성장을 위한 조언 (2-3문장)

          300자 내외로 작성해주세요.
        `;

        try {
          const feedbackResponse = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: feedbackPrompt
          });

          feedbacks.push({
            teamName: team.name,
            feedback: feedbackResponse.text || '피드백 생성 실패'
          });
        } catch (err) {
          console.error(`Team ${team.name} feedback failed:`, err);
          feedbacks.push({
            teamName: team.name,
            feedback: '피드백 생성에 실패했습니다.'
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

  // 종합 AI 분석 생성
  const generateOverallAnalysis = async () => {
    setIsGeneratingOverall(true);
    setReportMode('overall');

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      const context = rankedTeams.map(t => {
        const historyStr = t.history.map(h =>
          `[${h.cardTitle}] 선택: ${h.choiceId}, 이유: ${h.reasoning.substring(0, 50)}`
        ).join('; ');
        return `팀 ${t.name}: 총점 ${calculateTotal(t)}. 의사결정: ${historyStr || '없음'}`;
      }).join('\n');

      const prompt = `
        당신은 리더십 교육 전문가입니다. 다음 리더십 시뮬레이션 게임 결과를 분석하여 종합 리포트를 한글로 작성해주세요.

        게임 결과:
        ${context}

        다음 JSON 형식으로 한글로 상세하게 작성해주세요:
        {
          "summary": "전체 게임에 대한 종합 요약 (3-4문장, 한글)",
          "perspectives": {
            "self_leadership": {
              "title": "셀프리더십 관점",
              "analysis": "자기인식, 감정조절, 시간관리, 회복탄력성 등 개인 역량 관점에서의 분석 (3-4문장)",
              "strengths": "잘한 점 (2-3가지)",
              "improvements": "개선점 (2-3가지)",
              "action_plan": "향후 성장을 위한 구체적 액션플랜 (2-3가지)"
            },
            "followership": {
              "title": "팔로워십 관점",
              "analysis": "적극적 경청, 능동적 수행, 비판적 사고, 피드백 수용 등 팔로워십 관점에서의 분석 (3-4문장)",
              "strengths": "잘한 점 (2-3가지)",
              "improvements": "개선점 (2-3가지)",
              "action_plan": "향후 성장을 위한 구체적 액션플랜 (2-3가지)"
            },
            "leadership": {
              "title": "리더십 관점",
              "analysis": "명확한 지시, 동기부여, 임파워먼트, 코칭 등 매니저/리더 관점에서의 분석 (3-4문장)",
              "strengths": "잘한 점 (2-3가지)",
              "improvements": "개선점 (2-3가지)",
              "action_plan": "향후 성장을 위한 구체적 액션플랜 (2-3가지)"
            },
            "teamship": {
              "title": "팀십 관점",
              "analysis": "심리적 안전감, 갈등관리, 다양성 포용, 상호책임 등 팀워크 관점에서의 분석 (3-4문장)",
              "strengths": "잘한 점 (2-3가지)",
              "improvements": "개선점 (2-3가지)",
              "action_plan": "향후 성장을 위한 구체적 액션플랜 (2-3가지)"
            }
          },
          "common_mistakes": "게임에서 관찰된 공통적인 실수와 개선 팁 (3-4문장)",
          "discussion_topics": [
            "토의주제 1: 구체적인 토의 질문",
            "토의주제 2: 구체적인 토의 질문",
            "토의주제 3: 구체적인 토의 질문",
            "토의주제 4: 구체적인 토의 질문",
            "토의주제 5: 구체적인 토의 질문",
            "토의주제 6: 구체적인 토의 질문",
            "토의주제 7: 구체적인 토의 질문"
          ],
          "conclusion": "마무리 격려 및 영감을 주는 메시지 (2-3문장)"
        }

        모든 내용은 반드시 한글로 작성해주세요. 토의주제는 학습자들이 서로 깊이 있는 대화를 나눌 수 있는 열린 질문으로 작성해주세요.
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

  // 프린트 함수
  const handlePrint = (reportType: 'team' | 'overall') => {
    const printContent = reportType === 'team' ? teamReportRef.current : overallReportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('팝업이 차단되었습니다. 팝업을 허용해주세요.');
      return;
    }

    const title = reportType === 'team' ? 'BL 아카데미 - 팀별 리포트' : 'BL 아카데미 - 종합 리포트';

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
          h3 { color: #374151; }
          .team-section { page-break-inside: avoid; margin-bottom: 40px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px; }
          .perspective-section { margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #3b82f6; }
          .topic-item { padding: 10px; margin: 8px 0; background: #f3f4f6; border-radius: 4px; }
          .score-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .score-table th, .score-table td { border: 1px solid #d1d5db; padding: 8px; text-align: center; }
          .score-table th { background: #1e3a8a; color: white; }
          .history-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
          .history-table th, .history-table td { border: 1px solid #d1d5db; padding: 6px; text-align: left; }
          .history-table th { background: #374151; color: white; }
          .ai-feedback { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; margin-top: 15px; }
          .conclusion-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin-top: 30px; }
          @media print {
            body { padding: 0; }
            .team-section { page-break-after: always; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };


  return (
    <div className="fixed inset-0 bg-blue-900/90 z-[60] overflow-y-auto backdrop-blur-sm">
      <div className="container mx-auto p-4 md:p-8 min-h-screen">
        <div className="bg-white w-full border-4 border-black shadow-[10px_10px_0_0_#000] mb-8">
          <div className="flex justify-between items-center p-6 border-b-4 border-black bg-yellow-400 sticky top-0 z-10">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">미션 리포트</h1>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-black text-white font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all"
            >
              닫기 X
            </button>
          </div>

          <div className="p-4 md:p-8 grid gap-8">

             {/* 1. Overall Standings (Ranked) */}
             <div className="grid lg:grid-cols-2 gap-8">
                {/* Score Table */}
                <div className="border-4 border-black p-4 bg-gray-50 shadow-hard">
                  <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-black pb-2 flex justify-between">
                     <span>최종 순위</span>
                     <span className="text-sm font-normal text-gray-500 normal-case">5개 핵심 지표 합계</span>
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-sm uppercase bg-black text-white">
                          <th className="p-2 border border-black">순위</th>
                          <th className="p-2 border border-black">팀</th>
                          <th className="p-2 border border-black">자본</th>
                          <th className="p-2 border border-black">에너지</th>
                          <th className="p-2 border border-black">신뢰</th>
                          <th className="p-2 border border-black">역량</th>
                          <th className="p-2 border border-black">통찰</th>
                          <th className="p-2 border border-black text-center bg-blue-900 text-yellow-400">합계</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-mono font-bold">
                        {rankedTeams.map((team, idx) => (
                          <tr key={team.id} className={idx === 0 ? "bg-yellow-100" : "hover:bg-gray-100"}>
                            <td className="p-2 border-2 border-black text-center">{idx + 1}</td>
                            <td className="p-2 border-2 border-black flex items-center gap-2">
                              <div className={`w-3 h-3 border border-black bg-${team.color.toLowerCase()}-600`}></div>
                              {team.name}
                              {idx === 0 && ' (1위)'}
                            </td>
                            <td className="p-2 border-2 border-black">{team.resources.capital}</td>
                            <td className="p-2 border-2 border-black">{team.resources.energy}</td>
                            <td className="p-2 border-2 border-black">{team.resources.trust}</td>
                            <td className="p-2 border-2 border-black">{team.resources.competency}</td>
                            <td className="p-2 border-2 border-black">{team.resources.insight}</td>
                            <td className="p-2 border-2 border-black text-center text-lg bg-white">
                              {calculateTotal(team)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resource Chart */}
                <div className="border-4 border-black p-4 bg-white shadow-hard flex flex-col">
                  <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-black pb-2">지표 분석</h2>
                  <div className="flex-1 min-h-[300px] border-2 border-black bg-gray-50 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                        <XAxis dataKey="name" tick={{fill: 'black', fontWeight: 'bold'}} />
                        <YAxis tick={{fill: 'black', fontWeight: 'bold'}} />
                        <Tooltip contentStyle={{ border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0 0 #000' }} />
                        <Legend />
                        <Bar dataKey="Capital" fill="#FACC15" stackId="a" stroke="#000" strokeWidth={1} />
                        <Bar dataKey="Energy" fill="#F97316" stackId="a" stroke="#000" strokeWidth={1} />
                        <Bar dataKey="Trust" fill="#3B82F6" stackId="a" stroke="#000" strokeWidth={1} />
                        <Bar dataKey="Skill" fill="#22C55E" stackId="a" stroke="#000" strokeWidth={1} />
                        <Bar dataKey="Insight" fill="#A855F7" stackId="a" stroke="#000" strokeWidth={1} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
             </div>

             {/* 2. Winner Poster Generation */}
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

                      <button
                        onClick={generatePoster}
                        disabled={photos.length === 0 || isGeneratingPoster}
                        className="w-full py-4 bg-black text-white font-black uppercase text-xl border-4 border-black shadow-hard hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                         {isGeneratingPoster ? <Loader className="animate-spin" /> : <ImageIcon />}
                         {isGeneratingPoster ? "AI 포스터 생성 중..." : "포스터 생성"}
                      </button>
                   </div>

                   <div className="bg-gray-200 border-4 border-black min-h-[300px] flex items-center justify-center relative">
                      {posterUrl ? (
                        <div className="relative group w-full h-full">
                           <img src={posterUrl} alt="Generated Poster" className="w-full h-full object-contain p-2" />
                           <a
                             href={posterUrl}
                             download={`팀_${winningTeam?.name}_우승_포스터.png`}
                             className="absolute bottom-4 right-4 bg-white text-black p-2 border-2 border-black font-bold shadow-hard hover:bg-yellow-400 flex items-center gap-2"
                           >
                              <Download size={16} /> 다운로드
                           </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-bold uppercase text-center p-4">
                           포스터 미리보기 영역<br/>(AI 생성)
                        </span>
                      )}
                   </div>
                </div>
             </div>

             {/* 3. Report Generation */}
             <div className="border-4 border-black p-6 bg-white shadow-hard">
                <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">AI 리포트 생성</h2>
                <div className="flex flex-col md:flex-row gap-4">
                   <button
                     onClick={generateTeamFeedbacks}
                     disabled={isGeneratingTeam}
                     className="flex-1 py-4 bg-blue-100 border-4 border-black font-bold uppercase hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {isGeneratingTeam ? <Loader className="animate-spin" /> : <FileText size={24} />}
                     {isGeneratingTeam ? "AI 분석 중..." : "팀별 리포트 생성"}
                   </button>

                   <button
                     onClick={generateOverallAnalysis}
                     disabled={isGeneratingOverall}
                     className="flex-1 py-4 bg-purple-100 border-4 border-black font-bold uppercase hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {isGeneratingOverall ? <Loader className="animate-spin" /> : <Sparkles size={24} />}
                     {isGeneratingOverall ? "AI 분석 중..." : "종합 리포트 생성"}
                   </button>
                </div>
                <p className="mt-4 text-sm text-gray-500 text-center">
                  * 종합 리포트에는 모드별(셀프리더십/팔로워십/리더십/팀십) AI 분석과 토의주제 7가지가 포함됩니다.
                </p>
             </div>

             {/* 4. Team Report Display */}
             {teamFeedbacks.length > 0 && (
               <div className="border-4 border-black p-6 bg-blue-50 shadow-hard">
                 <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
                   <h2 className="text-2xl font-black uppercase">팀별 AI 리포트</h2>
                   <button
                     onClick={() => handlePrint('team')}
                     className="px-4 py-2 bg-blue-500 text-white border-2 border-black font-bold flex items-center gap-2 hover:bg-blue-600"
                   >
                     <Printer size={18} /> PDF로 저장/인쇄
                   </button>
                 </div>

                 {/* 프린트용 숨겨진 콘텐츠 */}
                 <div ref={teamReportRef} className="space-y-6">
                   <h1 style={{ display: 'none' }}>BL 아카데미 - 팀별 리포트</h1>

                   {rankedTeams.map((team, idx) => {
                     const feedback = teamFeedbacks.find(f => f.teamName === team.name);
                     return (
                       <div key={team.id} className="team-section bg-white p-6 border-2 border-gray-300 rounded-lg">
                         <h3 className="text-xl font-black mb-4 text-blue-900">
                           {idx + 1}위 - {team.name} (총점: {calculateTotal(team)}점)
                         </h3>

                         <table className="score-table w-full mb-4 text-sm">
                           <thead>
                             <tr>
                               <th className="bg-gray-800 text-white p-2">자본</th>
                               <th className="bg-gray-800 text-white p-2">에너지</th>
                               <th className="bg-gray-800 text-white p-2">신뢰</th>
                               <th className="bg-gray-800 text-white p-2">역량</th>
                               <th className="bg-gray-800 text-white p-2">통찰</th>
                             </tr>
                           </thead>
                           <tbody>
                             <tr>
                               <td className="p-2 border">{team.resources.capital}</td>
                               <td className="p-2 border">{team.resources.energy}</td>
                               <td className="p-2 border">{team.resources.trust}</td>
                               <td className="p-2 border">{team.resources.competency}</td>
                               <td className="p-2 border">{team.resources.insight}</td>
                             </tr>
                           </tbody>
                         </table>

                         {team.history.length > 0 && (
                           <>
                             <h4 className="font-bold mb-2">턴별 기록</h4>
                             <table className="history-table w-full mb-4 text-xs">
                               <thead>
                                 <tr>
                                   <th className="bg-gray-700 text-white p-2">턴</th>
                                   <th className="bg-gray-700 text-white p-2">상황</th>
                                   <th className="bg-gray-700 text-white p-2">선택</th>
                                   <th className="bg-gray-700 text-white p-2">이유</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 {team.history.map((h, i) => (
                                   <tr key={i}>
                                     <td className="p-2 border">{h.turnNumber}</td>
                                     <td className="p-2 border">{h.cardTitle}</td>
                                     <td className="p-2 border">{h.choiceText.substring(0, 50)}...</td>
                                     <td className="p-2 border">{h.reasoning.substring(0, 50)}...</td>
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                           </>
                         )}

                         <div className="ai-feedback bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
                           <h4 className="font-bold mb-2 text-blue-800">AI 종합 피드백</h4>
                           <p className="text-sm whitespace-pre-wrap">{feedback?.feedback || '피드백 생성 중...'}</p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}

             {/* 5. Overall Report Display */}
             {overallAnalysis && (
               <div className="border-4 border-black p-6 bg-purple-50 shadow-hard">
                 <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
                   <h2 className="text-2xl font-black uppercase">종합 AI 리포트</h2>
                   <button
                     onClick={() => handlePrint('overall')}
                     className="px-4 py-2 bg-purple-500 text-white border-2 border-black font-bold flex items-center gap-2 hover:bg-purple-600"
                   >
                     <Printer size={18} /> PDF로 저장/인쇄
                   </button>
                 </div>

                 {/* 프린트용 콘텐츠 */}
                 <div ref={overallReportRef} className="space-y-6">
                   <h1 className="text-2xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2">BL 아카데미 - 리더십 종합 리포트</h1>

                   {/* 종합 요약 */}
                   <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                     <h2 className="text-xl font-bold mb-3 text-blue-900">1. 종합 요약</h2>
                     <p className="text-gray-700">{overallAnalysis.summary}</p>
                   </div>

                   {/* 모드별 분석 */}
                   <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                     <h2 className="text-xl font-bold mb-4 text-blue-900">2. 모드별 심층 분석</h2>

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
                             <div className="bg-white p-2 rounded border">
                               <strong className="text-green-700">잘한 점:</strong>
                               <p>{perspective.strengths}</p>
                             </div>
                             <div className="bg-white p-2 rounded border">
                               <strong className="text-orange-700">개선점:</strong>
                               <p>{perspective.improvements}</p>
                             </div>
                             <div className="bg-white p-2 rounded border">
                               <strong className="text-blue-700">액션플랜:</strong>
                               <p>{perspective.action_plan}</p>
                             </div>
                           </div>
                         </div>
                       );
                     })}
                   </div>

                   {/* 공통 실수 */}
                   <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                     <h2 className="text-xl font-bold mb-3 text-blue-900">3. 공통 실수 및 개선 팁</h2>
                     <p className="text-gray-700">{overallAnalysis.common_mistakes}</p>
                   </div>

                   {/* 토의주제 7가지 */}
                   <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                     <h2 className="text-xl font-bold mb-4 text-blue-900">4. 팀 토의 주제 (7가지)</h2>
                     <div className="space-y-2">
                       {overallAnalysis.discussion_topics.map((topic, idx) => (
                         <div key={idx} className="topic-item p-3 bg-gray-100 rounded-lg border-l-4 border-blue-500">
                           <span className="font-bold text-blue-800">{idx + 1}.</span> {topic}
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* 결론 */}
                   <div className="conclusion-box bg-yellow-100 p-4 rounded-lg border-2 border-yellow-500">
                     <h2 className="text-xl font-bold mb-3 text-yellow-800">마무리</h2>
                     <p className="text-gray-800 font-medium">{overallAnalysis.conclusion}</p>
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
