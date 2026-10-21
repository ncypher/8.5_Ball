/* ORACLE v0.5 — crisp holographic answer display layered over the rotating die. */
(() => {
  const canvas = document.getElementById('orbCanvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');

  function roundedRectPath(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
  }

  function wrapLines(text, maxWidth) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || context.measureText(candidate).width <= maxWidth) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }

    if (line) lines.push(line);
    return lines;
  }

  // This deliberately replaces the renderer's original high-bloom text pass.
  window.drawText = function drawText(text, centerX, centerY, width, height, radius) {
    const now = performance.now();
    const panelWidth = width * 1.3;
    const panelHeight = height * 1.3;
    const panelX = centerX - panelWidth / 2;
    const panelY = centerY - panelHeight / 2;
    const pulse = 0.5 + Math.sin(now * 0.003) * 0.1;

    context.save();
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    const glass = context.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    glass.addColorStop(0, 'rgba(3, 25, 47, 0.88)');
    glass.addColorStop(0.48, 'rgba(1, 14, 32, 0.94)');
    glass.addColorStop(1, 'rgba(0, 7, 21, 0.97)');

    context.shadowColor = 'rgba(0, 0, 0, 0.92)';
    context.shadowBlur = radius * 0.034;
    roundedRectPath(context, panelX, panelY, panelWidth, panelHeight, radius * 0.024);
    context.fillStyle = glass;
    context.fill();

    context.shadowBlur = 0;
    context.lineWidth = Math.max(1, radius * 0.006);
    context.strokeStyle = `rgba(113, 234, 255, ${pulse})`;
    context.stroke();

    const inset = radius * 0.018;
    roundedRectPath(
      context,
      panelX + inset,
      panelY + inset,
      panelWidth - inset * 2,
      panelHeight - inset * 2,
      radius * 0.017
    );
    context.lineWidth = Math.max(0.7, radius * 0.0035);
    context.strokeStyle = 'rgba(69, 178, 218, 0.2)';
    context.stroke();

    const bracket = radius * 0.027;
    const left = panelX - radius * 0.018;
    const right = panelX + panelWidth + radius * 0.018;
    const top = panelY - radius * 0.008;
    const bottom = panelY + panelHeight + radius * 0.008;

    context.beginPath();
    context.moveTo(left + bracket, top);
    context.lineTo(left, top);
    context.lineTo(left, top + bracket);
    context.moveTo(right - bracket, top);
    context.lineTo(right, top);
    context.lineTo(right, top + bracket);
    context.moveTo(left, bottom - bracket);
    context.lineTo(left, bottom);
    context.lineTo(left + bracket, bottom);
    context.moveTo(right, bottom - bracket);
    context.lineTo(right, bottom);
    context.lineTo(right - bracket, bottom);
    context.strokeStyle = 'rgba(132, 241, 255, 0.72)';
    context.lineWidth = Math.max(1, radius * 0.0065);
    context.stroke();

    const scanY = panelY + ((now * 0.00016) % 1) * panelHeight;
    const scan = context.createLinearGradient(0, scanY - radius * 0.025, 0, scanY + radius * 0.025);
    scan.addColorStop(0, 'rgba(86, 229, 255, 0)');
    scan.addColorStop(0.5, 'rgba(86, 229, 255, 0.1)');
    scan.addColorStop(1, 'rgba(86, 229, 255, 0)');
    context.fillStyle = scan;
    context.fillRect(
      panelX + radius * 0.018,
      scanY - radius * 0.03,
      panelWidth - radius * 0.036,
      radius * 0.06
    );

    const textWidth = panelWidth * 0.87;
    const textHeight = panelHeight * 0.78;
    let fontSize = radius * 0.074;
    const minimumSize = Math.max(9, radius * 0.05);
    let lineHeight = fontSize * 1.18;
    let lines = [];

    for (; fontSize >= minimumSize; fontSize -= 0.35) {
      context.font = `900 ${fontSize}px Inter, "Segoe UI", system-ui, sans-serif`;
      lineHeight = fontSize * 1.18;
      lines = wrapLines(text, textWidth);
      const widest = Math.max(...lines.map((line) => context.measureText(line).width), 0);

      if (lines.length <= 4 && lines.length * lineHeight <= textHeight && widest <= textWidth) {
        break;
      }
    }

    if (lines.length > 4) {
      fontSize = minimumSize;
      lineHeight = fontSize * 1.12;
      context.font = `900 ${fontSize}px Inter, "Segoe UI", system-ui, sans-serif`;
      lines = wrapLines(text, textWidth);
    }

    const firstLineY = centerY - ((lines.length - 1) * lineHeight) / 2;
    context.font = `900 ${fontSize}px Inter, "Segoe UI", system-ui, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineJoin = 'round';
    context.miterLimit = 2;
    context.strokeStyle = 'rgba(0, 6, 17, 0.99)';
    context.lineWidth = Math.max(2, radius * 0.0125);
    context.shadowColor = 'rgba(0, 0, 0, 0.92)';
    context.shadowBlur = Math.max(1, radius * 0.007);
    context.shadowOffsetY = Math.max(1, radius * 0.005);

    for (const [index, line] of lines.entries()) {
      context.strokeText(line, centerX, firstLineY + index * lineHeight, textWidth);
    }

    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.fillStyle = '#caf6ff';

    for (const [index, line] of lines.entries()) {
      context.fillText(line, centerX, firstLineY + index * lineHeight, textWidth);
    }

    context.restore();
  };
})();
