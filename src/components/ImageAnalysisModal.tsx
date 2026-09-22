import React, { useState } from 'react';
import { ImageAnalysisResult } from '../types.ts';
import {
  Sparkles,
  X,
  ScanEye,
  Flame,
  Share2,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  getImageBase64: () => string | null;
  onApplyIdea?: (angleText: string) => void;
}

export const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({
  isOpen,
  onClose,
  getImageBase64,
  onApplyIdea,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const base64Data = getImageBase64();
    if (!base64Data) {
      setErrorMsg('Aguarde a renderização da imagem no canvas.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao analisar imagem com IA');
      }

      const data = await response.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error('Nenhuma análise retornada pelo modelo');
      }
    } catch (err: any) {
      console.error('Erro na análise de imagem:', err);
      setErrorMsg(err.message || 'Erro ao comunicar com o serviço de IA');
    } finally {
      setIsLoading(false);
    }
  };

  // Dispara a análise na primeira abertura se ainda não houver dados
  React.useEffect(() => {
    if (isOpen && !analysis && !isLoading) {
      handleAnalyze();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Cabeçalho do Modal */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md">
                <ScanEye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">Análise de Humor e Virilidade</h3>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    IA Gemini
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Compreensão visual profunda da expressão, dinâmica cômica e potencial de engajamento.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Corpo do Modal */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs flex items-center justify-between">
                <span>{errorMsg}</span>
                <button
                  onClick={handleAnalyze}
                  className="underline font-semibold ml-2 hover:text-white"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <RefreshCw className="w-7 h-7 animate-spin" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-md -z-10 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-200 text-sm">
                    Escaneando elementos visuais e linguagem corporal...
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Calculando índice de memeabilidade, contraste cômico e sugerindo abordagens em português.
                  </p>
                </div>
              </div>
            ) : analysis ? (
              <div className="space-y-4 text-xs">
                {/* Cartão de Resumo e Potencial de Viralização */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Visão Geral do Contexto</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {analysis.visualSummary}
                    </p>
                  </div>

                  {/* Medidor do Potencial Viral */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      Potencial Viral
                    </span>
                    <div className="text-3xl font-black text-white flex items-baseline gap-1">
                      <span>{analysis.viralityScore}</span>
                      <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, analysis.viralityScore)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Análise de Expressão Facial e Postura */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                    <ScanEye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Personagens, Expressão Facial e Postura</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {analysis.charactersAndMood}
                  </p>
                </div>

                {/* Dinâmica cômica da imagem */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Por que esta imagem é engraçada? (Anatomia do Meme)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {analysis.humorBreakdown}
                  </p>
                </div>

                {/* Comunidades recomendadas e ideias alternativas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Comunidades */}
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Onde este meme bomba mais</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.targetCommunities.map((comm, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-mono text-emerald-300"
                        >
                          {comm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ideias e ângulos alternativos */}
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ideias de temas para este meme</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 text-[11px]">
                      {analysis.alternativeAngles.map((angle, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{angle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Rodapé com botão de reanálise */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/90 text-xs">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Reanalisar Imagem</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
            >
              Concluir
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
