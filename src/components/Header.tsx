import React from 'react';
import { Sparkles, Laugh, ScanEye, Download } from 'lucide-react';

interface HeaderProps {
  onOpenMagicCaption: () => void;
  onOpenImageAnalysis: () => void;
  onDownload: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMagicCaption,
  onOpenImageAnalysis,
  onDownload,
}) => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Lado esquerdo: Marca e Título da Aplicação */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Laugh className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Gerador de Memes
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                IA Gemini
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Envie fotos, escolha modelos em alta e gere legendas inteligentes com IA
            </p>
          </div>
        </div>

        {/* Lado direito: Botões de ação rápida */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMagicCaption}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 transition active:scale-95"
            title="Gerar legendas com IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span className="hidden sm:inline">Legenda Mágica</span>
            <span className="sm:hidden">IA</span>
          </button>

          <button
            onClick={onOpenImageAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Análise de Imagem"
          >
            <ScanEye className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Análise de Humor</span>
          </button>

          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
            title="Baixar imagem do meme"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baixar Meme</span>
          </button>
        </div>
      </div>
    </header>
  );
};
