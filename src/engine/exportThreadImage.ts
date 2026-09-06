import { TestResult, ThreadData } from '../types';

interface FileSystemWritable {
  write: (data: Blob) => Promise<void>;
  close: () => Promise<void>;
}

interface FileSystemFileHandleLike {
  createWritable: () => Promise<FileSystemWritable>;
}

interface FileSystemDirectoryHandleLike {
  getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemDirectoryHandleLike>;
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandleLike>;
}

interface WindowWithDirectoryPicker extends Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandleLike>;
}

function sanitizeFilePart(value: string): string {
  return value.trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'thread';
}

/**
 * Exports a high-resolution, beautiful physical-record style PNG image card
 * of the user's Living Thread locally in the browser.
 */
export function exportThreadAsImage(
  result: TestResult,
  thread: ThreadData,
  themeColors?: { bg?: string; text?: string; accent?: string; sub?: string; surface?: string }
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const scale = 2; // Retina 2x scale
      const width = 640;
      const height = 400;

      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      ctx.scale(scale, scale);

      // Extract current computed CSS color variables or fallback
      const computedStyle = window.getComputedStyle(document.documentElement);
      const bg = themeColors?.bg || computedStyle.getPropertyValue('--bg').trim() || '#131518';
      const text = themeColors?.text || computedStyle.getPropertyValue('--text').trim() || '#e6e9ee';
      const accent = themeColors?.accent || computedStyle.getPropertyValue('--accent').trim() || '#e29b52';
      const sub = themeColors?.sub || computedStyle.getPropertyValue('--sub').trim() || '#87919e';
      const surface = themeColors?.surface || computedStyle.getPropertyValue('--surface').trim() || '#1b1e23';

      // 1. Background Card
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Card border
      ctx.strokeStyle = sub;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, width - 32, height - 32);
      ctx.globalAlpha = 1;

      // 2. Header: Logo & Subtitle
      ctx.fillStyle = text;
      ctx.font = '600 16px monospace';
      ctx.fillText('TYPELOOM', 36, 48);

      ctx.fillStyle = sub;
      ctx.font = '400 11px sans-serif';
      ctx.fillText('Every run leaves a thread', 36, 64);

      // Date on right
      const dateStr = new Date(result.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      ctx.textAlign = 'right';
      ctx.fillText(dateStr, width - 36, 52);
      ctx.textAlign = 'left';

      // 3. Hero Net Speed & Metrics
      ctx.fillStyle = accent;
      ctx.font = 'bold 54px monospace';
      const wpmLabelX = 36 + ctx.measureText(`${result.wpm}`).width + 10;
      ctx.fillText(`${result.wpm}`, 36, 130);

      ctx.fillStyle = sub;
      ctx.font = '600 15px monospace';
      ctx.fillText('WPM', wpmLabelX, 130);

      // Metric pills
      ctx.font = '400 12px monospace';
      ctx.fillStyle = text;
      ctx.fillText(`${result.accuracy}% acc`, 36, 155);
      ctx.fillStyle = sub;
      ctx.fillText(`·`, 36 + ctx.measureText(`${result.accuracy}% acc `).width, 155);
      ctx.fillStyle = text;
      ctx.fillText(
        `${result.consistency}% consistency`,
        36 + ctx.measureText(`${result.accuracy}% acc · `).width,
        155
      );

      // 4. Living Thread Spline
      const threadAreaX = 36;
      const threadAreaY = 190;
      const threadAreaW = width - 72;
      const threadAreaH = 110;

      // Background subtle guide
      ctx.strokeStyle = sub;
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(threadAreaX, threadAreaY + threadAreaH / 2);
      ctx.lineTo(threadAreaX + threadAreaW, threadAreaY + threadAreaH / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw Catmull-Rom thread spline
      if (thread.points && thread.points.length > 1) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const coords = thread.points.map((p) => ({
          x: threadAreaX + p.x * threadAreaW,
          y: threadAreaY + p.y * threadAreaH,
        }));

        ctx.beginPath();
        ctx.moveTo(coords[0].x, coords[0].y);

        for (let i = 0; i < coords.length - 1; i++) {
          const p0 = coords[Math.max(0, i - 1)];
          const p1 = coords[i];
          const p2 = coords[i + 1];
          const p3 = coords[Math.min(coords.length - 1, i + 2)];

          const cp1x = p1.x + (p2.x - p0.x) / 6;
          const cp1y = p1.y + (p2.y - p0.y) / 6;
          const cp2x = p2.x - (p3.x - p1.x) / 6;
          const cp2y = p2.y - (p3.y - p1.y) / 6;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
        ctx.stroke();

        // Knots
        thread.points.forEach((p) => {
          if (p.knot) {
            const kx = threadAreaX + p.x * threadAreaW;
            const ky = threadAreaY + p.y * threadAreaH;
            ctx.fillStyle = surface;
            ctx.strokeStyle = '#e06c75';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(kx, ky, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        });
      }

      // 5. Footer Details
      ctx.fillStyle = sub;
      ctx.font = '400 11px monospace';
      const lengthLabel = result.length === result.mode ? '' : ` ${result.length}`;
      ctx.fillText(`Mode: ${result.mode}${lengthLabel}  ·  Duration: ${result.elapsedSeconds}s`, 36, height - 32);

      ctx.textAlign = 'right';
      ctx.fillText('typeloom.local', width - 36, height - 32);

      const blob = await new Promise<Blob>((blobResolve, blobReject) => {
        canvas.toBlob((value) => {
          if (value) blobResolve(value);
          else blobReject(new Error('Could not create the thread image.'));
        }, 'image/png');
      });
      const fileName = `typeloom-${sanitizeFilePart(result.customName || `thread-${result.wpm}wpm`)}-${Date.now().toString(36)}.png`;
      const picker = (window as WindowWithDirectoryPicker).showDirectoryPicker;

      if (picker) {
        try {
          const rootDirectory = await picker();
          const fileHandle = await rootDirectory.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          resolve();
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            resolve();
            return;
          }
        }
      }

      const downloadLink = document.createElement('a');
      downloadLink.download = fileName;
      downloadLink.href = URL.createObjectURL(blob);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(downloadLink.href);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
