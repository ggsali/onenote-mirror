import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

export async function pdfToImages(file: File): Promise<string[]> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const images: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.7));
  }
  return images;
}

export function getStoredDoc(): { name: string | null; images: string[] } {
  try {
    const name = localStorage.getItem("docName");
    const raw = localStorage.getItem("docImages");
    const images = raw ? (JSON.parse(raw) as string[]) : [];
    return { name, images };
  } catch {
    return { name: null, images: [] };
  }
}

export function clearStoredDoc() {
  localStorage.removeItem("docName");
  localStorage.removeItem("docImages");
}
