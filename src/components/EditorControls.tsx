import React, { useState } from 'react';
import { MemeStyle, TextLayer } from '../types.ts';
import {
  Sparkles,
  Download,
  Copy,
  Share2,
  RotateCcw,
  ArrowUpDown,
  Trash2,
  Plus,
  Type,
  Palette,
  Sliders,
  Maximize2,
  ScanEye,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface EditorControlsProps {
  topText: string;
  setTopText: (val: string) => void;
  bottomText: string;
  setBottomText: (val: string) => void;
  memeStyle: MemeStyle;
  setMemeStyle: (style: MemeStyle) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  isUppercase: boolean;
  setIsUppercase: (val: boolean) => void;
  textAlign: 'left' | 'center' | 'right';
  setTextAlign: (val: 'left' | 'center' | 'right') => void;
  hasShadow: boolean;
  setHasShadow: (val: boolean) => void;
  filter: 'none' | 'contrast' | 'deep_fried' | 'grayscale' | 'vintage';
  setFilter: (f: 'none' | 'contrast' | 'deep_fried' | 'grayscale' | 'vintage') => void;
  watermark: string;
  setWatermark: (val: string) => void;
  onOpenMagicCaption: () => void;
  onOpenImageAnalysis: () => void;
  onDownload: () => void;
  onCopyImage: () => void;
  onShare: () => void;
  onReset: () => void;
  copySuccess: boolean;
}

const FONTS = [
  { id: 'Impact', label: 'Impact (Clássico de Meme)' },
  { id: 'Anton', label: 'Anton (Negrito Moderno)' },
  { id: 'Bebas Neue', label: 'Bebas Neue' },
  { id: 'Montserrat', label: 'Montserrat' },
  { id: 'Arial Black', label: 'Arial Black' },
  { id: 'Comic Sans MS', label: 'Comic Sans (Irônico)' },
  { id: 'Inter', label: 'Inter (Clean)' },
];

const FILTERS = [
  { id: 'none', label: 'Normal' },
  { id: 'contrast', label: 'Alto Contraste' },
  { id: 'deep_fried', label: 'Frito 🔥' },
  { id: 'grayscale', label: 'P&B' },
  { id: 'vintage', label: 'Sépia Vintage' },
];

export const EditorControls: React.FC<EditorControlsProps> = ({
  topText,
  setTopText,
  bottomText,
  setBottomText,
  memeStyle,
  setMemeStyle,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textColor,
  setTextColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  isUppercase,
  setIsUppercase,
  textAlign,
  setTextAlign,
  hasShadow,
  setHasShadow,
  filter,
  setFilter,
  watermark,
  setWatermark,
  onOpenMagicCaption,
  onOpenImageAnalysis,
  onDownload,
  onCopyImage,
  onShare,
  onReset,
  copySuccess,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const swapTexts = () => {
    const temp = topText;
    setTopText(bottomText);
    setBottomText(temp);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 text-slate-200">
      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* MAGIC CAPTION BUTTON - The Main Star */}
        <button
          id="magic-caption-main-btn"
          onClick={onOpenMagicCaption}
          className="relative group flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:via-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
          <span className="tracking-wide">Legenda Mágica (IA)</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-black bg-white/20 text-white tracking-widest">
            5 Ideias
          </span>
        </button>

        {/* IMAGE ANALYSIS / MEME INTEL */}
        <button
          id="analyze-image-btn"
          onClick={onOpenImageAnalysis}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-slate-600 shadow-md transition active:scale-[0.98]"
        >
          <ScanEye className="w-4 h-4 text-emerald-400" />
          <span>Análise de Humor e Virilidade</span>
        </button>
      </div>

      {/* Meme Style Selector */}
      <div className="flex items-center justify-between p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
        <button
          onClick={() => setMemeStyle('classic')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            memeStyle === 'classic'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Clássico (Texto na Imagem)
        </button>
        <button
          onClick={() => setMemeStyle('modern_banner')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            memeStyle === 'modern_banner'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Banner Branco Moderno (Twitter)
        </button>
      </div>

      {/* Top & Bottom Text Fields */}
      <div className="space-y-3">
        {/* Top text */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label htmlFor="top-text-input" className="font-semibold uppercase text-[11px] text-slate-300">
              {memeStyle === 'modern_banner' ? 'Legenda do Banner' : 'Texto Superior'}
            </label>
            {topText && (
              <button
                onClick={() => setTopText('')}
                className="text-slate-500 hover:text-slate-300 text-[11px]"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="top-text-input"
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Digite o texto de cima..."
              className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1.5">
          <button
            onClick={swapTexts}
            title="Inverter texto superior e inferior"
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 shadow-sm transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom text */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label htmlFor="bottom-text-input" className="font-semibold uppercase text-[11px] text-slate-300">
              Texto Inferior (Desfecho)
            </label>
            {bottomText && (
              <button
                onClick={() => setBottomText('')}
                className="text-slate-500 hover:text-slate-300 text-[11px]"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="bottom-text-input"
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="Digite o desfecho engraçado..."
              className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Typography & Style Quick Toggles */}
      <div className="space-y-3 pt-1 border-t border-slate-800/80">
        <div className="grid grid-cols-2 gap-3">
          {/* Font selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Fonte</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Text Size */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>Tamanho do Texto</span>
              <span>{fontSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="72"
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />
          </div>
        </div>

        {/* Alignment and Formatting Toggles */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
            <button
              onClick={() => setTextAlign('left')}
              className={`p-1.5 rounded-lg text-xs transition ${
                textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Alinhar à Esquerda"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTextAlign('center')}
              className={`p-1.5 rounded-lg text-xs transition ${
                textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Centralizar"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTextAlign('right')}
              className={`p-1.5 rounded-lg text-xs transition ${
                textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Alinhar à Direita"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUppercase(!isUppercase)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                isUppercase
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              MAIÚSCULAS
            </button>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Menos opções' : 'Mais ajustes'}</span>
            </button>
          </div>
        </div>

        {/* Advanced Styling Drawer */}
        {showAdvanced && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-3.5 text-xs">
            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Cor do Texto</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[11px]">{textColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Cor da Borda</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[11px]">{strokeColor}</span>
                </div>
              </div>
            </div>

            {/* Stroke Width Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Espessura da Borda</span>
                <span>{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="1"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
              />
            </div>

            {/* Image Filters */}
            <div className="space-y-1">
              <span className="text-slate-400 font-medium block">Filtro da Imagem</span>
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      filter === f.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark Tag */}
            <div className="space-y-1">
              <label className="text-slate-400 font-medium block">Marca d'água personalizada (opcional)</label>
              <input
                type="text"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                placeholder="@meu_insta ou site.com.br"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Export & Action Controls */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <button
          id="download-meme-btn"
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition duration-150 active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Baixar Imagem do Meme (PNG)</span>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            id="copy-meme-btn"
            onClick={onCopyImage}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-[0.98]"
          >
            {copySuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            id="share-meme-btn"
            onClick={onShare}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-[0.98]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar</span>
          </button>

          <button
            id="reset-meme-btn"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
