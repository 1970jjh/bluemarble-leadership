import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Image as ImageIcon, Sparkles, Loader, FileText, Upload } from 'lucide-react';

interface ReportViewProps {
  teams: Team[];
  onClose: () => void;
}

// 한글 폰트 Base64 캐시
let koreanFontLoaded = false;
let koreanFontBase64: string | null = null;

// 한글 폰트 로딩 함수 (Noto Sans KR)
const loadKoreanFont = async (): Promise<string> => {
  if (koreanFontBase64) return koreanFontBase64;

  try {
    // Noto Sans KR Regular 폰트 로드 (Google Fonts)
    const fontUrl = 'https://cdn.jsdelivr.net/gh/nicenewbie/font-noto-sans-kr-base64@main/NotoSansKR-Regular.ttf';
    const response = await fetch(fontUrl);
    const arrayBuffer = await response.arrayBuffer();

    // ArrayBuffer to Base64
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    koreanFontBase64 = btoa(binary);

    return koreanFontBase64;
  } catch (error) {
    console.error('Korean font loading failed:', error);
    throw error;
  }
};

// jsPDF에 한글 폰트 등록
const registerKoreanFont = async (doc: jsPDF): Promise<void> => {
  if (!koreanFontLoaded) {
    try {
      const fontData = await loadKoreanFont();
      doc.addFileToVFS('NotoSansKR-Regular.ttf', fontData);
      doc.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal');
      koreanFontLoaded = true;
    } catch (error) {
      console.warn('Font registration failed, using default font:', error);
    }
  } else if (koreanFontBase64) {
    doc.addFileToVFS('NotoSansKR-Regular.ttf', koreanFontBase64);
    doc.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal');
  }

  doc.setFont('NotoSansKR');
};

const ReportView: React.FC<ReportViewProps> = ({ teams, onClose }) => {
  // --- Poster Generation State ---
  const [photos, setPhotos] = useState<File[]>([]);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [isGeneratingOverallPDF, setIsGeneratingOverallPDF] = useState(false);
  const [isGeneratingTeamPDF, setIsGeneratingTeamPDF] = useState(false);
  const [fontLoading, setFontLoading] = useState(false);

  // 폰트 미리 로딩
  useEffect(() => {
    setFontLoading(true);
    loadKoreanFont()
      .then(() => setFontLoading(false))
      .catch(() => setFontLoading(false));
  }, []);

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

  // 팀별 리포트 생성 (AI 종합 피드백 포함)
  const generateTeamReports = async () => {
    setIsGeneratingTeamPDF(true);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const doc = new jsPDF();

      // 한글 폰트 등록
      await registerKoreanFont(doc);

      for (let index = 0; index < rankedTeams.length; index++) {
        const team = rankedTeams[index];
        if (index > 0) doc.addPage();

        // 헤더
        doc.setFontSize(22);
        doc.setFont('NotoSansKR');
        doc.text(`팀 리포트: ${team.name}`, 14, 20);

        doc.setFontSize(12);
        doc.text(`최종 점수: ${calculateTotal(team)}점 (순위: ${index + 1}위)`, 14, 30);
        doc.text(`자본: ${team.resources.capital} | 에너지: ${team.resources.energy} | 신뢰: ${team.resources.trust} | 역량: ${team.resources.competency} | 통찰: ${team.resources.insight}`, 14, 38);

        // 턴별 기록 테이블
        if (team.history.length > 0) {
          const tableData = team.history.map(record => [
            `${record.turnNumber}턴`,
            record.cardTitle,
            record.choiceText.substring(0, 30) + (record.choiceText.length > 30 ? '...' : ''),
            record.reasoning.substring(0, 40) + (record.reasoning.length > 40 ? '...' : ''),
            record.aiFeedback.substring(0, 50) + (record.aiFeedback.length > 50 ? '...' : ''),
            `자:${record.scoreChanges.capital || 0} 에:${record.scoreChanges.energy || 0} 신:${record.scoreChanges.trust || 0}`
          ]);

          autoTable(doc, {
            startY: 45,
            head: [['턴', '상황', '선택', '이유', 'AI 피드백', '점수']],
            body: tableData,
            styles: {
              fontSize: 7,
              font: 'NotoSansKR',
              cellPadding: 2
            },
            headStyles: {
              fillColor: [30, 58, 138],
              font: 'NotoSansKR'
            },
            columnStyles: {
              0: { cellWidth: 12 },
              1: { cellWidth: 25 },
              2: { cellWidth: 30 },
              3: { cellWidth: 35 },
              4: { cellWidth: 50 },
              5: { cellWidth: 28 }
            }
          });
        }

        // AI 종합 피드백 생성
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

          200자 내외로 간결하게 작성해주세요.
        `;

        try {
          const feedbackResponse = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: feedbackPrompt
          });

          const aiFeedback = feedbackResponse.text || '피드백 생성 실패';

          // AI 피드백 섹션
          // @ts-ignore - autoTable adds finalY to doc
          const finalY = doc.lastAutoTable?.finalY || 140;
          let yPos = finalY + 10;

          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFillColor(240, 248, 255);
          doc.rect(10, yPos, 190, 50, 'F');
          doc.setDrawColor(30, 58, 138);
          doc.rect(10, yPos, 190, 50, 'S');

          doc.setFontSize(12);
          doc.setFont('NotoSansKR');
          doc.setTextColor(30, 58, 138);
          doc.text('🤖 AI 종합 피드백', 14, yPos + 8);

          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          const feedbackLines = doc.splitTextToSize(aiFeedback, 180);
          doc.text(feedbackLines.slice(0, 8), 14, yPos + 16);

        } catch (err) {
          console.error('AI feedback generation failed:', err);
        }
      }

      doc.save("BL_아카데미_팀별_리포트.pdf");

    } catch (error) {
      console.error('Team report generation failed:', error);
      alert('팀별 리포트 생성에 실패했습니다.');
    } finally {
      setIsGeneratingTeamPDF(false);
    }
  };

  // 종합 리포트 생성 (모드별 AI 분석 + 토의주제 7가지)
  const generateOverallReport = async () => {
    setIsGeneratingOverallPDF(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      // 전체 게임 컨텍스트 준비
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

      const aiAnalysis = JSON.parse(response.text || '{}');

      // PDF 생성
      const doc = new jsPDF();
      await registerKoreanFont(doc);

      // 제목
      doc.setFontSize(24);
      doc.setFont('NotoSansKR');
      doc.setTextColor(30, 58, 138);
      doc.text("BL 아카데미: 리더십 종합 리포트", 14, 20);

      // 1. 종합 요약
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("1. 종합 요약", 14, 35);
      doc.setFontSize(10);
      const splitSummary = doc.splitTextToSize(aiAnalysis.summary || "요약 없음", 180);
      doc.text(splitSummary, 14, 42);

      let yPos = 42 + (splitSummary.length * 5) + 10;

      // 2. 모드별 분석
      doc.setFontSize(14);
      doc.text("2. 모드별 심층 분석", 14, yPos);
      yPos += 8;

      const perspectives = aiAnalysis.perspectives || {};
      const perspectiveKeys = ['self_leadership', 'followership', 'leadership', 'teamship'];
      const perspectiveColors: {[key: string]: [number, number, number]} = {
        'self_leadership': [239, 68, 68],
        'followership': [59, 130, 246],
        'leadership': [16, 185, 129],
        'teamship': [139, 92, 246]
      };

      for (const key of perspectiveKeys) {
        const perspective = perspectives[key];
        if (!perspective) continue;

        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        // 섹션 헤더
        const color = perspectiveColors[key] || [0, 0, 0];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(14, yPos, 4, 8, 'F');

        doc.setFontSize(12);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(perspective.title || key.toUpperCase(), 22, yPos + 6);
        yPos += 12;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);

        // 분석
        const analysisText = doc.splitTextToSize(`분석: ${perspective.analysis || ''}`, 175);
        doc.text(analysisText, 18, yPos);
        yPos += analysisText.length * 4 + 4;

        // 잘한 점
        const strengthsText = doc.splitTextToSize(`✓ 잘한 점: ${perspective.strengths || ''}`, 175);
        doc.text(strengthsText, 18, yPos);
        yPos += strengthsText.length * 4 + 4;

        // 개선점
        const improvementsText = doc.splitTextToSize(`△ 개선점: ${perspective.improvements || ''}`, 175);
        doc.text(improvementsText, 18, yPos);
        yPos += improvementsText.length * 4 + 4;

        // 액션플랜
        const actionText = doc.splitTextToSize(`▶ 액션플랜: ${perspective.action_plan || ''}`, 175);
        doc.text(actionText, 18, yPos);
        yPos += actionText.length * 4 + 8;
      }

      // 3. 공통 실수 및 팁
      if (yPos > 220) { doc.addPage(); yPos = 20; }

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("3. 공통 실수 및 개선 팁", 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      const mistakes = doc.splitTextToSize(aiAnalysis.common_mistakes || "", 180);
      doc.text(mistakes, 14, yPos);
      yPos += mistakes.length * 5 + 10;

      // 4. 토의주제 7가지
      if (yPos > 200) { doc.addPage(); yPos = 20; }

      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("4. 팀 토의 주제 (7가지)", 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const discussionTopics = aiAnalysis.discussion_topics || [];
      discussionTopics.forEach((topic: string, idx: number) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }

        doc.setFillColor(245, 245, 245);
        const topicLines = doc.splitTextToSize(topic, 170);
        const boxHeight = topicLines.length * 4 + 6;
        doc.rect(14, yPos - 3, 182, boxHeight, 'F');

        doc.setFontSize(10);
        doc.text(`${idx + 1}.`, 18, yPos + 2);
        doc.text(topicLines, 26, yPos + 2);
        yPos += boxHeight + 4;
      });

      // 5. 마무리
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      yPos += 5;

      doc.setFillColor(254, 249, 195);
      doc.rect(10, yPos, 190, 25, 'F');
      doc.setDrawColor(234, 179, 8);
      doc.rect(10, yPos, 190, 25, 'S');

      doc.setFontSize(11);
      doc.setFont('NotoSansKR');
      doc.setTextColor(120, 53, 15);
      const conclusion = doc.splitTextToSize(`💡 ${aiAnalysis.conclusion || ''}`, 180);
      doc.text(conclusion, 14, yPos + 10);

      doc.save("BL_아카데미_종합_리포트.pdf");

    } catch (e) {
      console.error(e);
      alert("AI 리포트 생성에 실패했습니다.");
    } finally {
      setIsGeneratingOverallPDF(false);
    }
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
                     <span>🏆 최종 순위</span>
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
                              {idx === 0 && ' 👑'}
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
                             download={`팀_${winningTeam.name}_우승_포스터.png`}
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

             {/* 3. Report Downloads */}
             <div className="border-4 border-black p-6 bg-white shadow-hard">
                <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">리포트 내보내기</h2>
                {fontLoading && (
                  <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-300 text-blue-700 text-sm">
                    <Loader className="inline animate-spin mr-2" size={16} />
                    한글 폰트 로딩 중...
                  </div>
                )}
                <div className="flex flex-col md:flex-row gap-4">
                   <button
                     onClick={generateTeamReports}
                     disabled={isGeneratingTeamPDF || fontLoading}
                     className="flex-1 py-4 bg-blue-100 border-4 border-black font-bold uppercase hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {isGeneratingTeamPDF ? <Loader className="animate-spin" /> : <FileText size={24} />}
                     {isGeneratingTeamPDF ? "생성 중..." : "팀별 리포트 다운로드 (PDF)"}
                   </button>

                   <button
                     onClick={generateOverallReport}
                     disabled={isGeneratingOverallPDF || fontLoading}
                     className="flex-1 py-4 bg-purple-100 border-4 border-black font-bold uppercase hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {isGeneratingOverallPDF ? <Loader className="animate-spin" /> : <Sparkles size={24} />}
                     {isGeneratingOverallPDF ? "AI 분석 중..." : "종합 AI 리포트 다운로드 (PDF)"}
                   </button>
                </div>
                <p className="mt-4 text-sm text-gray-500 text-center">
                  * 종합 리포트에는 모드별(셀프리더십/팔로워십/리더십/팀십) AI 분석과 토의주제 7가지가 포함됩니다.
                </p>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
