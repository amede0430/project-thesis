import { useEffect, useRef } from 'react';

interface SpectrogramChartProps {
  spectrogram: number[][];
  freqs: number[];
  times: number[];
  darkMode?: boolean;
}

export default function SpectrogramChart({
  spectrogram,
  freqs,
  times,
  darkMode = false,
}: SpectrogramChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || spectrogram.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Nettoyer le canvas
    ctx.fillStyle = darkMode ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Dimensions du spectrogramme
    const freqBins = spectrogram.length;
    const timeBins = spectrogram[0]?.length || 0;

    if (timeBins === 0) return;

    // Trouver min/max pour normalisation
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let i = 0; i < freqBins; i++) {
      for (let j = 0; j < timeBins; j++) {
        const val = spectrogram[i][j];
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      }
    }

    const range = maxVal - minVal;

    // Dessiner le spectrogramme avec interpolation
    const cellWidth = width / timeBins;
    const cellHeight = height / freqBins;

    // Utiliser une interpolation bilinéaire pour un rendu plus lisse
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Coordonnées dans le spectrogramme
        const freqIdx = (height - y - 1) / height * freqBins;
        const timeIdx = x / width * timeBins;

        // Interpolation bilinéaire
        const fi = Math.floor(freqIdx);
        const ti = Math.floor(timeIdx);
        const fi2 = Math.min(fi + 1, freqBins - 1);
        const ti2 = Math.min(ti + 1, timeBins - 1);

        const fx = freqIdx - fi;
        const tx = timeIdx - ti;

        // Valeurs aux 4 coins
        const v00 = spectrogram[fi]?.[ti] ?? minVal;
        const v01 = spectrogram[fi]?.[ti2] ?? minVal;
        const v10 = spectrogram[fi2]?.[ti] ?? minVal;
        const v11 = spectrogram[fi2]?.[ti2] ?? minVal;

        // Interpolation
        const value = 
          v00 * (1 - fx) * (1 - tx) +
          v01 * (1 - fx) * tx +
          v10 * fx * (1 - tx) +
          v11 * fx * tx;

        // Normaliser entre 0 et 1
        const normalized = range > 0 ? (value - minVal) / range : 0;

        // Colormap: jaune (fort) -> vert -> cyan -> bleu (faible)
        let r, g, b;
        if (normalized > 0.75) {
          const t = (normalized - 0.75) / 0.25;
          r = 255;
          g = 255;
          b = Math.floor(50 * (1 - t));
        } else if (normalized > 0.5) {
          const t = (normalized - 0.5) / 0.25;
          r = Math.floor(255 * (1 - t));
          g = 255;
          b = Math.floor(50 + 100 * t);
        } else if (normalized > 0.25) {
          const t = (normalized - 0.25) / 0.25;
          r = 0;
          g = Math.floor(200 + 55 * t);
          b = Math.floor(200 + 55 * (1 - t));
        } else {
          const t = normalized / 0.25;
          r = 0;
          g = Math.floor(100 * t);
          b = Math.floor(100 + 100 * t);
        }

        const pixelIndex = (y * width + x) * 4;
        data[pixelIndex] = r;
        data[pixelIndex + 1] = g;
        data[pixelIndex + 2] = b;
        data[pixelIndex + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Ajouter une grille légère
    ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;

    // Lignes horizontales (fréquences)
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Lignes verticales (temps)
    for (let i = 0; i <= 4; i++) {
      const x = (width / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }, [spectrogram, freqs, times, darkMode]);

  if (spectrogram.length === 0 || spectrogram[0]?.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className={darkMode ? 'text-white/55 text-center' : 'text-gray-500 text-center'}>
          <div>Calcul du spectrogramme en cours...</div>
          <div className="text-xs mt-2">Attendez quelques secondes pour l'actualisation</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className={`flex-1 ${darkMode ? 'bg-dark-quaternary rounded-sm p-2' : 'bg-white rounded p-2'}`}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            className="w-full rounded-sm"
            style={{ imageRendering: 'auto' }}
          />
        </div>
        
        {/* Échelle de couleur (colorbar) */}
        <div className="flex flex-col justify-between py-2">
          <div className={`text-xs ${darkMode ? 'text-white/55' : 'text-gray-500'} font-semibold mb-1 text-center`}>
            dB
          </div>
          <div className="flex flex-col-reverse h-full w-12 rounded overflow-hidden border" 
               style={{ borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>
            {/* Gradient de couleur */}
            {Array.from({ length: 20 }).map((_, i) => {
              const normalized = i / 19;
              let r, g, b;
              if (normalized > 0.75) {
                const t = (normalized - 0.75) / 0.25;
                r = 255;
                g = 255;
                b = Math.floor(50 * (1 - t));
              } else if (normalized > 0.5) {
                const t = (normalized - 0.5) / 0.25;
                r = Math.floor(255 * (1 - t));
                g = 255;
                b = Math.floor(50 + 100 * t);
              } else if (normalized > 0.25) {
                const t = (normalized - 0.25) / 0.25;
                r = 0;
                g = Math.floor(200 + 55 * t);
                b = Math.floor(200 + 55 * (1 - t));
              } else {
                const t = normalized / 0.25;
                r = 0;
                g = Math.floor(100 * t);
                b = Math.floor(100 + 100 * t);
              }
              return (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                />
              );
            })}
          </div>
          <div className={`flex flex-col justify-between text-[10px] mt-1 ${darkMode ? 'text-white/55' : 'text-gray-500'}`}>
            <div className="text-right">0</div>
            <div className="text-right">-40</div>
            <div className="text-right">-80</div>
          </div>
        </div>
      </div>
      
      {/* Labels des axes */}
      {freqs.length > 0 && (
        <div className={`text-xs ${darkMode ? 'text-white/55' : 'text-gray-500'}`}>
          <div className="flex justify-between items-center px-2">
            <div>
              <div>↑ {Math.round(freqs[freqs.length - 1])} Hz</div>
              <div className="mt-1">↓ {Math.round(freqs[0])} Hz</div>
            </div>
            <div className="text-center">
              <div className="font-semibold mb-1">Fréquence</div>
            </div>
            <div className="flex items-center gap-2">
              {/* Légende des couleurs */}
              <div className="flex flex-col gap-1 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background: 'rgb(255, 255, 50)' }}></div>
                  <span>Fort</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background: 'rgb(0, 255, 150)' }}></div>
                  <span>Moyen</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background: 'rgb(0, 100, 200)' }}></div>
                  <span>Faible</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-2 pt-2 font-semibold" style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            Temps →
          </div>
        </div>
      )}
    </div>
  );
}
