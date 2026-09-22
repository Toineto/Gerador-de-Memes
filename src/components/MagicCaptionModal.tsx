import React, { useState } from 'react';
import { CaptionSuggestion, HumorVibe } from '../types.ts';
import {
  Sparkles,
  X,
  RefreshCw,
  Check,
  Zap,
  Briefcase,
  Code2,
  Coffee,
  Flame,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MagicCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCaption: (topText: string, bottomText: string) => void;
  getImageBase64: () => string | null;
}

const HUMOR_VIBES: { id: HumorVibe; label: string; icon: React.ReactNode }[] = [
  { id: 'balanced', label: 'Equilibrado', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'relatable_everyday', label: 'Vida Real & Boletos', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'tech_coding', label: 'Dev & Tecnologia', icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: 'work_corporate', label: 'Trabalho & CLT', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'sarcastic_ironic', label: 'Sarcasmo & Deboche', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'absurdist_genz', label: 'Caos & Zoeira', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'wholesome', label: 'Fofo & Positivo', icon: <Heart className="w-3.5 h-3.5" /> },
];

export const MagicCaptionModal: React.FC<MagicCaptionModalProps> = ({
  isOpen,
  onClose,
  onApplyCaption,
  getImageBase64,
}) => {
  const [selectedVibe, setSelectedVibe] = useState<HumorVibe>('balanced');
  const [customTopic, setCustomTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captions, setCaptions] = useState<CaptionSuggestion[]>([]);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateCaptions = async (vibe = selectedVibe) => {
    const base64Data = getImageBase64();
    if (!base64Data) {
      setErrorMsg('Aguarde a imagem carregar completamente no canvas.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/magic-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          style: vibe,
          customContext: customTopic.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao gerar legendas com IA');
      }

      const data = await response.json();
      if (data.captions && Array.isArray(data.captions)) {
        setCaptions(data.captions);
      } else {
        throw new Error('Nenhuma legenda retornada pelo modelo Gemini');
      }
    } catch (err: any) {
      console.error('Erro na Legenda Mágica:', err);
      setErrorMsg(err.message || 'Erro ao se comunicar com o serviço de IA');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto trigger generation on first open if empty
  React.useEffect(() => {
    if (isOpen && captions.length === 0 && !isLoading) {
      handleGenerateCaptions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/50 via-purple-950/40 to-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">Legenda Mágica com IA</h3>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Português BR
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  A IA analisa a expressão e o contexto da foto para criar 5 piadas sob medida em português.
                </p>
              </div>
            </div>
            <button
              id="magic-caption-close-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vibe Selector Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                Estilo / Vibe do Humor
              </span>
              <span>Escolha o tom ou digite um assunto abaixo</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {HUMOR_VIBES.map((vibe) => {
                const isActive = selectedVibe === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    onClick={() => {
                      setSelectedVibe(vibe.id);
                      handleGenerateCaptions(vibe.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    {vibe.icon}
                    <span>{vibe.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom topic prompt input */}
            <div className="flex gap-2">
              <input
                type="text"
                id="magic-caption-topic-input"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateCaptions();
                }}
                placeholder="Exemplo de assunto: 'Segunda-feira de manhã', 'Boleto vencido', 'Home office', 'Faculdade'..."
                className="flex-1 px-3.5 py-1.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700/70 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                id="magic-caption-reroll-btn"
                onClick={() => handleGenerateCaptions()}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Gerar Novas</span>
              </button>
            </div>
          </div>

          {/* Body Content / Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs flex items-center justify-between">
                <span>{errorMsg}</span>
                <button
                  onClick={() => handleGenerateCaptions()}
                  className="underline font-semibold ml-2 hover:text-white"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="py-14 flex flex-col items-center justify-center gap-4 text-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-7 h-7 animate-spin" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md -z-10 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-200 text-sm">
                    Analisando a foto e criando legendas em português com IA...
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Identificando as reações faciais e preparando 5 opções com humor brasileiro de alta qualidade.
                  </p>
                </div>
              </div>
            ) : captions.length > 0 ? (
              captions.map((cap, index) => {
                const isApplied = appliedId === cap.id;
                return (
                  <motion.div
                    key={cap.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative p-3.5 rounded-xl border transition-all ${
                      isApplied
                        ? 'bg-indigo-950/40 border-indigo-500/70 ring-1 ring-indigo-500'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        {/* Tag */}
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
                            {cap.tag}
                          </span>
                          <span className="text-[11px] text-slate-400 italic">
                            {cap.explanation}
                          </span>
                        </div>

                        {/* Top & Bottom Text Display */}
                        <div className="space-y-1">
                          {cap.topText && (
                            <div className="flex items-baseline gap-2">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                                TOPO:
                              </span>
                              <p className="font-extrabold text-sm text-slate-100 uppercase tracking-wide">
                                "{cap.topText}"
                              </p>
                            </div>
                          )}
                          {cap.bottomText && (
                            <div className="flex items-baseline gap-2">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                                BASE:
                              </span>
                              <p className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
                                "{cap.bottomText}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Apply button */}
                      <button
                        id={`apply-caption-btn-${index}`}
                        onClick={() => {
                          onApplyCaption(cap.topText, cap.bottomText);
                          setAppliedId(cap.id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                          isApplied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Aplicado</span>
                          </>
                        ) : (
                          <>
                            <span>Usar Esta</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs">
                Nenhuma legenda gerada ainda. Clique em "Gerar Novas".
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Clique em "Usar Esta" para colocar o texto direto no meme
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
