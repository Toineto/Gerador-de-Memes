import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { MemeCanvas } from './components/MemeCanvas.tsx';
import { EditorControls } from './components/EditorControls.tsx';
import { TemplateSelector } from './components/TemplateSelector.tsx';
import { MagicCaptionModal } from './components/MagicCaptionModal.tsx';
import { ImageAnalysisModal } from './components/ImageAnalysisModal.tsx';
import { POPULAR_TEMPLATES } from './templates.ts';
import { MemeTemplate, MemeStyle, TextLayer } from './types.ts';
import { Sparkles, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Template and Image state
  const [currentTemplate, setCurrentTemplate] = useState<MemeTemplate>(POPULAR_TEMPLATES[0]);
  const [imageUrl, setImageUrl] = useState<string>(POPULAR_TEMPLATES[0].url);

  // Text & Formatting states
  const [topText, setTopText] = useState<string>(POPULAR_TEMPLATES[0].defaultTopText || 'Ler a documentação de 50 páginas');
  const [bottomText, setBottomText] = useState<string>(POPULAR_TEMPLATES[0].defaultBottomText || 'Descobrir tudo na base da tentativa e erro');
  const [memeStyle, setMemeStyle] = useState<MemeStyle>('classic');
  const [fontFamily, setFontFamily] = useState<string>('Impact');
  const [fontSize, setFontSize] = useState<number>(44);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [isUppercase, setIsUppercase] = useState<boolean>(true);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [hasShadow, setHasShadow] = useState<boolean>(true);
  const [filter, setFilter] = useState<'none' | 'contrast' | 'deep_fried' | 'grayscale' | 'vintage'>('none');
  const [watermark, setWatermark] = useState<string>('');
  const [extraLayers, setExtraLayers] = useState<TextLayer[]>([]);

  // Modals
  const [isMagicCaptionOpen, setIsMagicCaptionOpen] = useState(false);
  const [isImageAnalysisOpen, setIsImageAnalysisOpen] = useState(false);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  /**
   * Extract high-res base64 image representation for AI analysis
   */
  const getImageBase64 = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    try {
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (err) {
      console.warn('Canvas toDataURL falhou, usando imageUrl bruta:', err);
      return imageUrl.startsWith('data:') ? imageUrl : null;
    }
  }, [imageUrl]);

  /**
   * Handle selecting a template
   */
  const handleSelectTemplate = (template: MemeTemplate) => {
    setCurrentTemplate(template);
    setImageUrl(template.url);
    if (template.defaultTopText) setTopText(template.defaultTopText);
    if (template.defaultBottomText) setBottomText(template.defaultBottomText);
    showToast(`Modelo "${template.name}" carregado!`);
  };

  /**
   * Handle uploading a custom image
   */
  const handleUploadImage = (dataUrl: string, name?: string) => {
    setImageUrl(dataUrl);
    setCurrentTemplate({
      id: `custom-${Date.now()}`,
      name: name || 'Foto Enviada',
      category: 'trending',
      url: dataUrl,
      width: 600,
      height: 600,
    });
    showToast('Foto carregada! Clique em "Legenda Mágica" para gerar ideias.');
  };

  /**
   * Handle AI generated image from text prompt
   */
  const handleAiGeneratedImage = (dataUrl: string) => {
    setImageUrl(dataUrl);
    setCurrentTemplate({
      id: `ai-gen-${Date.now()}`,
      name: 'Imagem Criada com IA',
      category: 'trending',
      url: dataUrl,
      width: 600,
      height: 600,
    });
    showToast('Imagem de meme gerada com sucesso! Pronto para legendar.');
  };

  /**
   * Apply a Magic Caption selection
   */
  const handleApplyCaption = (newTopText: string, newBottomText: string) => {
    setTopText(newTopText);
    setBottomText(newBottomText);
    showToast('Legenda de IA aplicada ao meme!');
  };

  /**
   * Download the meme as PNG
   */
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Meme baixado em formato PNG!');
    } catch (err) {
      console.error('Erro ao baixar:', err);
      showToast('Falha ao exportar a imagem.');
    }
  };

  /**
   * Copy image to clipboard
   */
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopySuccess(true);
          showToast('Meme copiado para a área de transferência!');
          setTimeout(() => setCopySuccess(false), 2500);
        } else {
          showToast('Cópia direta não suportada neste navegador. Use a opção Baixar.');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Erro ao copiar:', err);
      showToast('Não foi possível copiar para a área de transferência.');
    }
  };

  /**
   * Share via Web Share API
   */
  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'meme.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Gerador de Memes',
            text: `${topText} ${bottomText}`,
            files: [file],
          });
          showToast('Compartilhado com sucesso!');
        } else if (navigator.share) {
          await navigator.share({
            title: 'Gerador de Memes',
            text: `${topText} ${bottomText}`,
            url: window.location.href,
          });
        } else {
          handleCopyImage();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  /**
   * Reset canvas
   */
  const handleReset = () => {
    setTopText('');
    setBottomText('');
    setFilter('none');
    setWatermark('');
    setExtraLayers([]);
    showToast('Textos e efeitos limpos');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        onOpenMagicCaption={() => setIsMagicCaptionOpen(true)}
        onOpenImageAnalysis={() => setIsImageAnalysisOpen(true)}
        onDownload={handleDownload}
      />

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Magic Caption Prominent Notification Banner */}
        <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-indigo-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Motor de Legendas Mágicas com IA</span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Novo
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Clique em <span className="font-semibold text-amber-300">"Legenda Mágica"</span> para a IA analisar o contexto da imagem e sugerir 5 legendas engraçadas e inéditas em português.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMagicCaptionOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Gerar 5 Legendas com IA</span>
          </button>
        </div>

        {/* 2-Column Responsive Layout: Left Canvas | Right Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <MemeCanvas
              canvasRef={canvasRef}
              imageUrl={imageUrl}
              memeStyle={memeStyle}
              topText={topText}
              bottomText={bottomText}
              extraLayers={extraLayers}
              fontFamily={fontFamily}
              fontSize={fontSize}
              textColor={textColor}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              isUppercase={isUppercase}
              textAlign={textAlign}
              hasShadow={hasShadow}
              filter={filter}
              watermark={watermark}
            />

            {/* Quick action bar below canvas */}
            <div className="flex items-center justify-between w-full mt-3 px-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-300">{currentTemplate.name}</span>
                <span className="text-[11px] text-slate-500">
                  ({memeStyle === 'modern_banner' ? 'Banner Branco' : 'Texto Clássico'})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMagicCaptionOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Legenda Mágica</span>
                </button>
                <button
                  onClick={() => setIsImageAnalysisOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
                >
                  Analisar Imagem
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Editor Controls */}
          <div className="lg:col-span-5 space-y-4">
            <EditorControls
              topText={topText}
              setTopText={setTopText}
              bottomText={bottomText}
              setBottomText={setBottomText}
              memeStyle={memeStyle}
              setMemeStyle={setMemeStyle}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              fontSize={fontSize}
              setFontSize={setFontSize}
              textColor={textColor}
              setTextColor={setTextColor}
              strokeColor={strokeColor}
              setStrokeColor={setStrokeColor}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              isUppercase={isUppercase}
              setIsUppercase={setIsUppercase}
              textAlign={textAlign}
              setTextAlign={setTextAlign}
              hasShadow={hasShadow}
              setHasShadow={setHasShadow}
              filter={filter}
              setFilter={setFilter}
              watermark={watermark}
              setWatermark={setWatermark}
              onOpenMagicCaption={() => setIsMagicCaptionOpen(true)}
              onOpenImageAnalysis={() => setIsImageAnalysisOpen(true)}
              onDownload={handleDownload}
              onCopyImage={handleCopyImage}
              onShare={handleShare}
              onReset={handleReset}
              copySuccess={copySuccess}
            />
          </div>
        </div>

        {/* Bottom Section: Template Selector, Upload & AI Image Generation */}
        <div className="pt-4">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-200">
              Escolha um Modelo ou Envie sua Foto
            </h3>
            <p className="text-xs text-slate-400">
              Mais de 20 modelos virais da internet, suporte para fotos do seu computador ou geração de imagens inéditas com Gemini.
            </p>
          </div>
          <TemplateSelector
            currentTemplateId={currentTemplate.id}
            onSelectTemplate={handleSelectTemplate}
            onUploadImage={handleUploadImage}
            onAiGeneratedImage={handleAiGeneratedImage}
          />
        </div>
      </main>

      {/* Magic Caption Modal */}
      <MagicCaptionModal
        isOpen={isMagicCaptionOpen}
        onClose={() => setIsMagicCaptionOpen(false)}
        onApplyCaption={handleApplyCaption}
        getImageBase64={getImageBase64}
      />

      {/* Image Analysis Modal */}
      <ImageAnalysisModal
        isOpen={isImageAnalysisOpen}
        onClose={() => setIsImageAnalysisOpen(false)}
        getImageBase64={getImageBase64}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-2xl"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
