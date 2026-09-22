import React, { useState, useRef } from 'react';
import { MemeTemplate } from '../types.ts';
import { POPULAR_TEMPLATES } from '../templates.ts';
import {
  Search,
  Upload,
  Sparkles,
  Flame,
  LayoutGrid,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Wand2,
  Sliders,
} from 'lucide-react';
import { motion } from 'motion/react';

interface TemplateSelectorProps {
  currentTemplateId: string;
  onSelectTemplate: (template: MemeTemplate) => void;
  onUploadImage: (dataUrl: string, name?: string) => void;
  onAiGeneratedImage: (dataUrl: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplateId,
  onSelectTemplate,
  onUploadImage,
  onAiGeneratedImage,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'upload' | 'ai_generate'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do gerador de imagens por IA
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAspectRatio, setAiAspectRatio] = useState<'1:1' | '4:3' | '16:9'>('1:1');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos os Modelos' },
    { id: 'trending', label: 'Em Alta' },
    { id: 'classic', label: 'Clássicos' },
    { id: 'work_tech', label: 'Trabalho & Tech' },
    { id: 'reactions', label: 'Reações' },
    { id: 'animals', label: 'Animais' },
  ];

  const filteredTemplates = POPULAR_TEMPLATES.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUploadImage(dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUploadImage(dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) return;

    setIsAiGenerating(true);
    setAiError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          aspectRatio: aiAspectRatio,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao gerar imagem com IA');
      }

      const data = await response.json();
      if (data.imageUrl) {
        onAiGeneratedImage(data.imageUrl);
        setAiPrompt('');
      } else {
        throw new Error('Nenhuma imagem retornada pelo Gemini');
      }
    } catch (err: any) {
      console.error('Erro ao gerar imagem:', err);
      setAiError(err.message || 'Erro ao gerar imagem');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const AI_SAMPLE_PROMPTS = [
    'Gato com óculos de grau olhando desesperado para a tela do computador com erro',
    'Cachorro vira-lata caramelo de terno apresentando slides no projetor',
    'Robô tentando tomar café quente pela primeira vez com cara de espanto',
    'Pessoa sorrindo serenamente enquanto tudo ao redor está pegando fogo',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Abas superiores de navegação */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Modelos ({POPULAR_TEMPLATES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Enviar Foto Própria</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_generate')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ai_generate'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gerar Imagem com IA</span>
          </button>
        </div>
      </div>

      {/* Aba 1: Galeria de Modelos Famosos */}
      {activeTab === 'templates' && (
        <div className="space-y-3">
          {/* Barra de busca e filtros de categoria */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar modelo (ex: Drake, Namorado, Doge, Panik)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grade de templates */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredTemplates.map((template) => {
              const isSelected = currentTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`group relative flex flex-col items-center bg-slate-950/60 rounded-xl overflow-hidden border transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-[0.98]'
                      : 'border-slate-800 hover:border-slate-600 hover:scale-[1.02]'
                  }`}
                >
                  <div className="relative w-full aspect-square bg-slate-900 overflow-hidden">
                    <img
                      src={template.url}
                      alt={template.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 p-1 rounded-full bg-indigo-600 text-white shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="w-full p-1.5 bg-slate-900/90 border-t border-slate-800/80">
                    <p className="text-[11px] font-medium text-slate-300 truncate group-hover:text-white">
                      {template.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Aba 2: Upload de Foto Própria */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-950/70 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition duration-200">
            <Upload className="w-7 h-7" />
          </div>
          <h4 className="mt-3 font-semibold text-sm text-slate-200">
            Arraste e solte uma imagem aqui ou clique para selecionar
          </h4>
          <p className="mt-1 text-xs text-slate-400 max-w-xs">
            Suporta PNG, JPEG, WEBP ou GIF. Envie qualquer foto para analisar e criar memes com IA!
          </p>
        </div>
      )}

      {/* Aba 3: Geração de Imagem com Gemini */}
      {activeTab === 'ai_generate' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>Gerar Imagem de Meme Inédita com IA</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Proporção:</span>
              {(['1:1', '4:3', '16:9'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAiAspectRatio(ratio)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    aiAspectRatio === ratio
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Descreva a cena cômica da imagem (ex: 'Um gato astronauta olhando para um prato de comida vazio em Marte')..."
              rows={2}
              className="w-full p-3 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Sugestões rápidas de prompt */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-slate-400 self-center">Sugestões:</span>
            {AI_SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setAiPrompt(prompt)}
                className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-[10px] text-slate-300 transition text-left"
              >
                "{prompt.slice(0, 36)}..."
              </button>
            ))}
          </div>

          {aiError && (
            <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-800/60">
              {aiError}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleGenerateAiImage}
              disabled={isAiGenerating || !aiPrompt.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isAiGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando imagem com Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gerar Imagem de Meme</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
