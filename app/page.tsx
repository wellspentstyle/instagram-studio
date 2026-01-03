"use client";

import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Sun, Palette, ChevronRight, ChevronLeft, Upload, Wand2, RefreshCcw, Check, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  { id: 1, name: 'Pose' },
  { id: 2, name: 'Background' },
  { id: 3, name: 'Lighting' },
  { id: 4, name: 'Style' },
];

export default function EditorialStudio() {
  const [currentStage, setCurrentStage] = useState(1);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // States for AI inputs
  const [poseText, setPoseText] = useState("");
  const [lightText, setLightText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Editorial Vogue");

  const nextStage = () => setCurrentStage((prev) => Math.min(prev + 1, 4));
  const prevStage = () => setCurrentStage((prev) => Math.max(prev - 1, 1));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'source' | 'bg') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'source') setSourceImage(base64);
        else setBgImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- API CALLING LOGIC ---

  const runStage = async (endpoint: string, body: object) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.output) {
        setSourceImage(Array.isArray(data.output) ? data.output[0] : data.output);
        nextStage();
      }
    } catch (err) {
      console.error(err);
      alert("AI processing failed. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = () => {
    if (currentStage === 1) runStage('pose', { image: sourceImage, prompt: poseText });
    if (currentStage === 2) runStage('background', { image: sourceImage, bgImage: bgImage });
    if (currentStage === 3) runStage('lighting', { image: sourceImage, lightPrompt: lightText });
    if (currentStage === 4) runStage('style', { image: sourceImage, stylePrompt: selectedStyle });
  };

  const downloadImage = () => {
    if (!sourceImage) return;
    const link = document.createElement("a");
    link.href = sourceImage;
    link.download = "studio-ai-export.png";
    link.click();
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-[#0a0a0a] flex flex-col p-8">
        <h1 className="text-xl font-bold tracking-tighter mb-10 flex items-center gap-2 italic">
          <Wand2 className="text-purple-500" /> STUDIO.AI
        </h1>

        <div className="space-y-3">
          {STAGES.map((s) => (
            <div key={s.id} className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${currentStage === s.id ? 'bg-white/10 border border-white/10' : 'opacity-30'}`}>
              <span className="text-xs font-black">0{s.id}</span>
              <span className="text-sm font-semibold">{s.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-6 min-h-[300px]">
          {currentStage === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Describe Pose</label>
              <textarea value={poseText} onChange={(e) => setPoseText(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm h-32 focus:ring-1 focus:ring-purple-500 outline-none" placeholder="e.g. Walking towards camera..." />
            </div>
          )}

          {currentStage === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Upload Scenery</label>
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center relative hover:bg-white/5 cursor-pointer">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e, 'bg')} />
                {bgImage ? <img src={bgImage} className="h-20 w-full object-cover rounded-lg" /> : <p className="text-xs text-zinc-500">Click to upload backdrop</p>}
              </div>
            </div>
          )}

          {currentStage === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Atmosphere</label>
              <input value={lightText} onChange={(e) => setLightText(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-1 focus:ring-purple-500 outline-none" placeholder="e.g. Cinematic golden hour" />
            </div>
          )}

          {currentStage === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Final Vibe</label>
              <div className="grid grid-cols-1 gap-2">
                {['Editorial Vogue', '35mm Film', 'Moody Noir', 'Natural High-Key'].map(s => (
                  <button key={s} onClick={() => setSelectedStyle(s)} className={`p-3 text-left rounded-xl text-xs transition-all ${selectedStyle === s ? 'bg-white text-black font-bold' : 'bg-white/5 hover:bg-white/10'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-12">
        <div className="relative w-full max-w-md aspect-[4/5] bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
          {!sourceImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <input type="file" id="source" className="hidden" onChange={(e) => handleUpload(e, 'source')} />
              <label htmlFor="source" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4"><Upload /></div>
                <p className="text-sm font-medium">Upload Master Image</p>
              </label>
            </div>
          ) : (
            <div className="relative h-full w-full">
              <img src={sourceImage} className="w-full h-full object-cover" />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
                  <RefreshCcw className="w-8 h-8 animate-spin text-purple-500 mb-4" />
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase">Neural Engine Active</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="absolute bottom-10 flex items-center gap-6">
          <button onClick={prevStage} className={`p-5 rounded-full bg-white/5 hover:bg-white/10 transition-all ${currentStage === 1 ? 'opacity-0' : 'opacity-100'}`}><ChevronLeft /></button>

          {currentStage === 4 && !isProcessing ? (
             <button onClick={downloadImage} className="px-12 py-5 bg-green-500 text-white rounded-full font-black text-xs tracking-widest uppercase flex items-center gap-2 shadow-xl hover:bg-green-600 transition-all"><Download className="w-4 h-4" /> Download Result</button>
          ) : (
             <button disabled={!sourceImage || isProcessing} onClick={handleProcess} className="px-16 py-5 bg-white text-black rounded-full font-black text-xs tracking-widest uppercase hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
               {isProcessing ? 'Processing...' : `Confirm ${STAGES[currentStage-1].name}`}
             </button>
          )}
        </div>
      </main>
    </div>
  );
}
