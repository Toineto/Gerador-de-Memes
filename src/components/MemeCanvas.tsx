import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TextLayer, MemeStyle } from '../types.ts';
import { RefreshCw, Move, Type } from 'lucide-react';

interface MemeCanvasProps {
  imageUrl: string;
  memeStyle: MemeStyle;
  topText: string;
  bottomText: string;
  extraLayers: TextLayer[];
  fontFamily: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  isUppercase: boolean;
  textAlign: 'left' | 'center' | 'right';
  hasShadow: boolean;
  filter: 'none' | 'contrast' | 'deep_fried' | 'grayscale' | 'vintage';
  watermark: string;
  onSelectLayer?: (layerId: string | null) => void;
  selectedLayerId?: string | null;
  onUpdateLayerPos?: (layerId: string, x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({
  imageUrl,
  memeStyle,
  topText,
  bottomText,
  extraLayers,
  fontFamily,
  fontSize,
  textColor,
  strokeColor,
  strokeWidth,
  isUppercase,
  textAlign,
  hasShadow,
  filter,
  watermark,
  canvasRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 600,
  });

  // Carrega a imagem sempre que a URL for alterada
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setImageObj(img);
      setNaturalDimensions({ width: img.naturalWidth || 600, height: img.naturalHeight || 600 });
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Falha ao carregar a imagem:', imageUrl);
      // Imagem reserva caso a URL principal falhe
      const fallbackImg = new Image();
      fallbackImg.src = 'https://api.memegen.link/images/drake.jpg';
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.onload = () => {
        setImageObj(fallbackImg);
        setNaturalDimensions({ width: fallbackImg.naturalWidth, height: fallbackImg.naturalHeight });
        setImageLoaded(true);
      };
    };
  }, [imageUrl]);

  /**
   * Rotina principal de renderização do Canvas do Meme
   */
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const origW = naturalDimensions.width;
    const origH = naturalDimensions.height;

    // Largura base de exportação para manter a tipografia nítida e com alta resolução
    const targetW = 800;
    const scale = targetW / origW;
    const targetH = Math.round(origH * scale);

    // Cálculo da altura do banner superior
    let bannerH = 0;
    if (memeStyle === 'modern_banner' && topText.trim()) {
      // Estima a altura do banner branco superior
      bannerH = Math.max(120, Math.round(fontSize * 2.6));
    }

    const totalCanvasW = targetW;
    const totalCanvasH = targetH + bannerH;

    canvas.width = totalCanvasW;
    canvas.height = totalCanvasH;

    // Limpa o canvas antes de desenhar
    ctx.clearRect(0, 0, totalCanvasW, totalCanvasH);

    // Desenha o fundo branco do Banner Moderno se ativado
    if (bannerH > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, totalCanvasW, bannerH);

      // Linha divisória sutil na parte inferior do banner
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, bannerH - 2, totalCanvasW, 2);
    }

    // Aplica os filtros visuais no canvas
    ctx.save();
    if (filter === 'contrast') {
      ctx.filter = 'contrast(150%) brightness(105%)';
    } else if (filter === 'grayscale') {
      ctx.filter = 'grayscale(100%) contrast(110%)';
    } else if (filter === 'vintage') {
      ctx.filter = 'sepia(60%) contrast(110%) brightness(95%)';
    } else if (filter === 'deep_fried') {
      ctx.filter = 'contrast(250%) saturate(300%) brightness(110%)';
    } else {
      ctx.filter = 'none';
    }

    // Desenha a imagem base logo abaixo do banner
    ctx.drawImage(imageObj, 0, bannerH, targetW, targetH);
    ctx.restore();

    // Função auxiliar para quebrar linhas e desenhar o texto com contorno
    const drawMemeText = (
      text: string,
      x: number,
      y: number,
      maxW: number,
      size: number,
      fFamily: string,
      fColor: string,
      sColor: string,
      sWidth: number,
      uppercase: boolean,
      align: 'left' | 'center' | 'right',
      isBanner = false,
    ) => {
      if (!text.trim()) return;

      const formatted = uppercase ? text.toUpperCase() : text;
      const weight = isBanner ? '600' : '900';
      ctx.font = `${weight} ${size}px ${fFamily}, Impact, sans-serif`;
      ctx.textAlign = align;
      ctx.textBaseline = isBanner ? 'middle' : 'middle';

      // Quebra automática de linha por palavras
      const words = formatted.split(' ');
      const lines: string[] = [];
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const lineHeight = size * 1.15;
      const startY = y - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, index) => {
        const lineY = startY + index * lineHeight;

        if (isBanner) {
          // Banner moderno: tipografia escura limpa sem contorno grosso
          ctx.fillStyle = '#0F172A';
          ctx.fillText(line, x, lineY);
        } else {
          // Estilo clássico de meme: contorno forte + preenchimento + sombra
          if (hasShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 3;
          } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          if (sWidth > 0) {
            ctx.strokeStyle = sColor;
            ctx.lineWidth = sWidth;
            ctx.lineJoin = 'miter';
            ctx.miterLimit = 2;
            ctx.strokeText(line, x, lineY);
          }

          ctx.fillStyle = fColor;
          ctx.fillText(line, x, lineY);
        }
      });
    };

    const textPadding = 30;
    const maxTextWidth = totalCanvasW - textPadding * 2;
    const effectiveFontSize = Math.round(fontSize * (totalCanvasW / 600));
    const effectiveStrokeWidth = Math.round(strokeWidth * (totalCanvasW / 600));

    // 1. Texto Superior
    if (topText.trim()) {
      if (memeStyle === 'modern_banner') {
        const bannerX =
          textAlign === 'center'
            ? totalCanvasW / 2
            : textAlign === 'left'
            ? textPadding
            : totalCanvasW - textPadding;
        const bannerY = bannerH / 2;
        const bannerFontSize = Math.round(effectiveFontSize * 0.75);

        drawMemeText(
          topText,
          bannerX,
          bannerY,
          maxTextWidth,
          bannerFontSize,
          'Inter, Arial, sans-serif',
          '#0F172A',
          'transparent',
          0,
          false,
          textAlign,
          true,
        );
      } else {
        // Sobreposição clássica no topo da imagem
        const topX =
          textAlign === 'center'
            ? totalCanvasW / 2
            : textAlign === 'left'
            ? textPadding
            : totalCanvasW - textPadding;
        const topY = textPadding + effectiveFontSize / 2;

        drawMemeText(
          topText,
          topX,
          topY,
          maxTextWidth,
          effectiveFontSize,
          fontFamily,
          textColor,
          strokeColor,
          effectiveStrokeWidth,
          isUppercase,
          textAlign,
        );
      }
    }

    // 2. Texto Inferior
    if (bottomText.trim()) {
      const botX =
        textAlign === 'center'
          ? totalCanvasW / 2
          : textAlign === 'left'
          ? textPadding
          : totalCanvasW - textPadding;
      const botY = totalCanvasH - textPadding - effectiveFontSize / 2;

      drawMemeText(
        bottomText,
        botX,
        botY,
        maxTextWidth,
        effectiveFontSize,
        fontFamily,
        textColor,
        strokeColor,
        effectiveStrokeWidth,
        isUppercase,
        textAlign,
      );
    }

    // 3. Camadas adicionais de texto
    extraLayers.forEach((layer) => {
      if (!layer.text.trim()) return;
      const layerX = layer.x * totalCanvasW;
      const layerY = bannerH + layer.y * targetH;
      const layerFontSize = Math.round(layer.fontSize * (totalCanvasW / 600));
      const layerStrokeWidth = Math.round(layer.strokeWidth * (totalCanvasW / 600));

      drawMemeText(
        layer.text,
        layerX,
        layerY,
        maxTextWidth,
        layerFontSize,
        layer.fontFamily,
        layer.color,
        layer.strokeColor,
        layerStrokeWidth,
        layer.isUppercase,
        layer.align,
      );
    });

    // 4. Marca d'água opcional
    if (watermark.trim()) {
      ctx.save();
      ctx.font = '600 14px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'right';
      ctx.fillText(watermark, totalCanvasW - 16, totalCanvasH - 14);
      ctx.restore();
    }
  }, [
    imageObj,
    imageLoaded,
    naturalDimensions,
    memeStyle,
    topText,
    bottomText,
    extraLayers,
    fontFamily,
    fontSize,
    textColor,
    strokeColor,
    strokeWidth,
    isUppercase,
    textAlign,
    hasShadow,
    filter,
    watermark,
    canvasRef,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div
      ref={containerRef}
      id="meme-canvas-wrapper"
      className="relative flex items-center justify-center w-full min-h-[380px] sm:min-h-[460px] bg-slate-900/90 rounded-2xl p-4 sm:p-6 overflow-hidden border border-slate-800 shadow-2xl backdrop-blur-sm select-none"
    >
      {!imageLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10 gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm font-medium text-slate-300">Carregando canvas do meme...</p>
        </div>
      )}

      {/* Canvas HTML5 Real */}
      <canvas
        ref={canvasRef}
        id="meme-canvas"
        className="max-w-full max-h-[68vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
      />
    </div>
  );
};
