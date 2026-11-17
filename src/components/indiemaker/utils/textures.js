import * as THREE from 'three';

export function createVinylMicroGrainTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = 128 + (Math.random() - 0.5) * 34;
    data[i] = grain;
    data[i + 1] = grain;
    data[i + 2] = grain;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

export function createProjectCardTexture({ code, title, tag, accent, metric, darkMode }) {
  const width = 512;
  const height = 340;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const bg = darkMode ? '#18181C' : '#FFFFFF';
  const border = darkMode ? 'rgba(244,243,238,0.18)' : 'rgba(20,20,19,0.16)';
  const primaryText = darkMode ? '#F4F3EE' : '#141413';
  const mutedText = darkMode ? 'rgba(244,243,238,0.58)' : 'rgba(20,20,19,0.55)';
  const pillBg = darkMode ? 'rgba(244,243,238,0.08)' : 'rgba(20,20,19,0.06)';

  const r = 36;
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.roundRect(8, 8, width - 16, height - 16, r);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = border;
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(36, 36, 128, 42, 21);
  ctx.fillStyle = accent;
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 20px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(code, 56, 64);

  ctx.fillStyle = mutedText;
  ctx.font = '600 19px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'right';
  ctx.fillText(metric, width - 40, 64);
  ctx.textAlign = 'left';

  ctx.fillStyle = primaryText;
  ctx.font = '800 44px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 36, 158);

  ctx.fillStyle = mutedText;
  ctx.font = '500 23px system-ui, -apple-system, sans-serif';
  ctx.fillText(tag, 36, 202);

  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(36, 244);
  ctx.lineTo(width - 36, 244);
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(36, 264, 156, 38, 19);
  ctx.fillStyle = pillBg;
  ctx.fill();
  ctx.fillStyle = primaryText;
  ctx.font = '600 17px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('SHIPPED ↗', 58, 289);

  ctx.fillStyle = accent;
  ctx.font = '700 18px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'right';
  ctx.fillText('● LIVE', width - 40, 289);
  ctx.textAlign = 'left';

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}