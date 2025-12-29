import React, { useState } from 'react';
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

const ReportView: React.FC<ReportViewProps> = ({ teams, onClose }) => {
  // --- Poster Generation State ---
  const [photos, setPhotos] = useState<File[]>([]);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [isGeneratingOverallPDF, setIsGeneratingOverallPDF] = useState(false);

  // --- Calculations ---
  // Ranking Rule: Sum of Capital + Energy + Trust + Competency + Insight
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
      alert("Please upload at least 1 photo of the winning team.");
      return;
    }

    setIsGeneratingPoster(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Prepare image parts (using first 3 as reference to strictly follow guidelines if strictly limited, but standard usage allows parts)
      // Note: gemini-3-pro-image-preview creates images. We are passing images as context.
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

      // Parse response to get image
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
      alert("Failed to generate poster. Please check API Key or try fewer images.");
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const generateTeamReports = () => {
    const doc = new jsPDF();
    
    rankedTeams.forEach((team, index) => {
      if (index > 0) doc.addPage();
      
      doc.setFontSize(22);
      doc.text(`Team Report: ${team.name}`, 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Final Score: ${calculateTotal(team)} (Rank: ${index + 1})`, 14, 30);
      doc.text(`Resources: Capital(${team.resources.capital}) Energy(${team.resources.energy}) Trust(${team.resources.trust}) Skill(${team.resources.competency}) Insight(${team.resources.insight})`, 14, 38);

      const tableData = team.history.map(record => [
        `Turn ${record.turnNumber}`,
        record.cardTitle,
        `[${record.choiceId}] ${record.choiceText}`,
        record.reasoning,
        record.aiFeedback.substring(0, 100) + (record.aiFeedback.length > 100 ? '...' : '')
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Turn', 'Situation', 'Decision', 'Reasoning', 'AI Feedback']],
        body: tableData,
        styles: { fontSize: 8, cellWidth: 'wrap' },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 30 },
            2: { cellWidth: 35 },
            3: { cellWidth: 40 },
            4: { cellWidth: 'auto' }
        }
      });
    });

    doc.save("BL_Academy_Team_Reports.pdf");
  };

  const generateOverallReport = async () => {
    setIsGeneratingOverallPDF(true);
    try {
        const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        
        // Prepare context for AI
        const context = rankedTeams.map(t => 
            `Team ${t.name}: Total ${calculateTotal(t)}. Decisions: ${t.history.map(h => `${h.cardTitle}(${h.choiceId})`).join(', ')}`
        ).join('\n');

        const prompt = `
          Analyze the game results for a Leadership Training Game.
          Context:
          ${context}

          Please provide a comprehensive report structure in JSON format:
          {
            "summary": "Overall game summary...",
            "perspectives": {
               "self_leadership": "Analysis and advice...",
               "followership": "Analysis and advice...",
               "leadership": "Analysis and advice...",
               "teamship": "Analysis and advice..."
            },
            "common_mistakes": "Common pitfalls observed...",
            "conclusion": "Final inspiring words..."
          }
        `;

        const response = await genAI.models.generateContent({
           model: 'gemini-3-flash-preview',
           contents: prompt,
           config: { responseMimeType: "application/json" }
        });
        
        const aiAnalysis = JSON.parse(response.text || '{}');

        // Create PDF
        const doc = new jsPDF();
        
        doc.setFontSize(24);
        doc.text("BL Academy: Comprehensive Leadership Report", 14, 20);
        
        doc.setFontSize(14);
        doc.text("1. Overall Summary", 14, 35);
        doc.setFontSize(10);
        const splitSummary = doc.splitTextToSize(aiAnalysis.summary || "No summary", 180);
        doc.text(splitSummary, 14, 42);

        let yPos = 42 + (splitSummary.length * 5) + 10;

        doc.setFontSize(14);
        doc.text("2. Key Perspectives Analysis", 14, yPos);
        yPos += 8;

        const perspectives = aiAnalysis.perspectives || {};
        Object.keys(perspectives).forEach((key) => {
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 150);
            doc.text(key.toUpperCase().replace('_', ' '), 14, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 6;
            
            doc.setFontSize(10);
            const text = doc.splitTextToSize(perspectives[key] || "", 180);
            doc.text(text, 14, yPos);
            yPos += (text.length * 5) + 6;
            
            if (yPos > 270) { doc.addPage(); yPos = 20; }
        });

        doc.setFontSize(14);
        doc.text("3. Common Mistakes & Tips", 14, yPos);
        yPos += 8;
        doc.setFontSize(10);
        const mistakes = doc.splitTextToSize(aiAnalysis.common_mistakes || "", 180);
        doc.text(mistakes, 14, yPos);
        
        yPos += (mistakes.length * 5) + 10;
        
        // Conclusion
        doc.setFillColor(240, 240, 240);
        doc.rect(10, yPos, 190, 30, 'F');
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        const conclusion = doc.splitTextToSize(aiAnalysis.conclusion || "", 180);
        doc.text(conclusion, 14, yPos + 10);

        doc.save("BL_Academy_Overall_Report.pdf");

    } catch (e) {
        console.error(e);
        alert("AI Report Generation Failed.");
    } finally {
        setIsGeneratingOverallPDF(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-blue-900/90 z-[60] overflow-y-auto backdrop-blur-sm">
      <div className="container mx-auto p-4 md:p-8 min-h-screen">
        <div className="bg-white w-full border-4 border-black shadow-[10px_10px_0_0_#000] mb-8">
          <div className="flex justify-between items-center p-6 border-b-4 border-black bg-yellow-400 sticky top-0 z-10">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Mission Report</h1>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-black text-white font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all"
            >
              CLOSE X
            </button>
          </div>

          <div className="p-4 md:p-8 grid gap-8">
             
             {/* 1. Overall Standings (Ranked) */}
             <div className="grid lg:grid-cols-2 gap-8">
                {/* Score Table */}
                <div className="border-4 border-black p-4 bg-gray-50 shadow-hard">
                  <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-black pb-2 flex justify-between">
                     <span>🏆 Final Ranking</span>
                     <span className="text-sm font-normal text-gray-500 normal-case">Sum of 5 Key Metrics</span>
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-sm uppercase bg-black text-white">
                          <th className="p-2 border border-black">Rank</th>
                          <th className="p-2 border border-black">Team</th>
                          <th className="p-2 border border-black">Cap</th>
                          <th className="p-2 border border-black">Eng</th>
                          <th className="p-2 border border-black">Tru</th>
                          <th className="p-2 border border-black">Skl</th>
                          <th className="p-2 border border-black">Ins</th>
                          <th className="p-2 border border-black text-center bg-blue-900 text-yellow-400">TOTAL</th>
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
                  <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-black pb-2">Metrics Analysis</h2>
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
                   <h2 className="text-2xl font-black uppercase">Winner's Glory: AI Poster</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <p className="font-bold text-gray-700">1. Upload Team Photos (1-10)</p>
                      <label className="block p-4 border-4 border-dashed border-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors text-center">
                         <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                         <div className="flex flex-col items-center gap-2">
                            <Upload size={24} className="text-gray-400" />
                            <span className="font-bold text-gray-500">{photos.length > 0 ? `${photos.length} photos selected` : "Click to upload photos"}</span>
                         </div>
                      </label>

                      <button 
                        onClick={generatePoster}
                        disabled={photos.length === 0 || isGeneratingPoster}
                        className="w-full py-4 bg-black text-white font-black uppercase text-xl border-4 border-black shadow-hard hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                         {isGeneratingPoster ? <Loader className="animate-spin" /> : <ImageIcon />} 
                         {isGeneratingPoster ? "Generating AI Poster..." : "Generate Poster"}
                      </button>
                   </div>
                   
                   <div className="bg-gray-200 border-4 border-black min-h-[300px] flex items-center justify-center relative">
                      {posterUrl ? (
                        <div className="relative group w-full h-full">
                           <img src={posterUrl} alt="Generated Poster" className="w-full h-full object-contain p-2" />
                           <a 
                             href={posterUrl} 
                             download={`Team_${winningTeam.name}_Victory_Poster.png`}
                             className="absolute bottom-4 right-4 bg-white text-black p-2 border-2 border-black font-bold shadow-hard hover:bg-yellow-400 flex items-center gap-2"
                           >
                              <Download size={16} /> Download
                           </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-bold uppercase text-center p-4">
                           Poster Preview Area<br/>(AI Generated)
                        </span>
                      )}
                   </div>
                </div>
             </div>

             {/* 3. Report Downloads */}
             <div className="border-4 border-black p-6 bg-white shadow-hard">
                <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">Export Reports</h2>
                <div className="flex flex-col md:flex-row gap-4">
                   <button 
                     onClick={generateTeamReports}
                     className="flex-1 py-4 bg-blue-100 border-4 border-black font-bold uppercase hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                   >
                     <FileText size={24} /> Download Individual Team Reports (PDF)
                   </button>
                   
                   <button 
                     onClick={generateOverallReport}
                     disabled={isGeneratingOverallPDF}
                     className="flex-1 py-4 bg-purple-100 border-4 border-black font-bold uppercase hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                   >
                     {isGeneratingOverallPDF ? <Loader className="animate-spin" /> : <Sparkles size={24} />} 
                     {isGeneratingOverallPDF ? "Analyzing & Generating..." : "Download Comprehensive AI Report (PDF)"}
                   </button>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;