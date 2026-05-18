import {
  defaultThreshold,
  maximumThreshold,
  minimumThreshold,
  normalizeAlpha,
  validateThreshold,
  type AlphaNormalizationResult,
  type ProcessingStatistics
} from '../engine';
import {
  backgroundColorPresets,
  normalizeBackgroundColorInput,
  transparentBackgroundValue
} from './backgroundColor';
import './SnaptiqWidget.css';

export interface SnaptiqWidgetOptions {
  initialThreshold?: number;
}

interface LoadedImage {
  fileName: string;
  original: ImageData;
  originalBitmap: ImageBitmap;
}

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

const acceptedPngTypes = new Set(['image/png']);
const minimumZoom = 0.25;
const maximumZoom = 8;
const zoomStep = 0.25;
const sampleImageUrl = '/samples/sampleimage.png';
const sampleImageFileName = 'sampleimage.png';

export class SnaptiqWidget {
  private readonly root: HTMLElement;
  private readonly thresholdInput: HTMLInputElement;
  private readonly thresholdValue: HTMLElement;
  private readonly statusMessage: HTMLElement;
  private readonly dropZone: HTMLElement;
  private readonly fileInput: HTMLInputElement;
  private readonly downloadLink: HTMLAnchorElement;
  private readonly originalCanvas: HTMLCanvasElement;
  private readonly processedCanvas: HTMLCanvasElement;
  private readonly originalContext: CanvasRenderingContext2D;
  private readonly processedContext: CanvasRenderingContext2D;
  private readonly totalPixelsValue: HTMLElement;
  private readonly semiTransparentValue: HTMLElement;
  private readonly modifiedValue: HTMLElement;
  private readonly thresholdUsedValue: HTMLElement;
  private readonly panes: HTMLElement[];
  private readonly backgroundSwatches: HTMLButtonElement[];
  private readonly backgroundInput: HTMLInputElement;
  private loadedImage: LoadedImage | null = null;
  private processedResult: AlphaNormalizationResult | null = null;
  private processingFrame: number | null = null;
  private dragStart: { x: number; y: number; panX: number; panY: number } | null = null;
  private viewState: ViewState = { zoom: 1, panX: 0, panY: 0 };
  private previewBackgroundColor = transparentBackgroundValue;

  public constructor(root: HTMLElement, options: SnaptiqWidgetOptions = {}) {
    this.root = root;
    const initialThreshold = options.initialThreshold ?? defaultThreshold;
    validateThreshold(initialThreshold);
    this.root.innerHTML = renderWidget(initialThreshold);

    this.thresholdInput = this.mustQuery<HTMLInputElement>('[data-snaptiq-threshold]');
    this.thresholdValue = this.mustQuery('[data-snaptiq-threshold-value]');
    this.statusMessage = this.mustQuery('[data-snaptiq-status]');
    this.dropZone = this.mustQuery('[data-snaptiq-drop-zone]');
    this.fileInput = this.mustQuery<HTMLInputElement>('[data-snaptiq-file]');
    this.downloadLink = this.mustQuery<HTMLAnchorElement>('[data-snaptiq-download]');
    this.originalCanvas = this.mustQuery<HTMLCanvasElement>('[data-snaptiq-original-canvas]');
    this.processedCanvas = this.mustQuery<HTMLCanvasElement>('[data-snaptiq-processed-canvas]');
    this.originalContext = getCanvasContext(this.originalCanvas);
    this.processedContext = getCanvasContext(this.processedCanvas);
    this.totalPixelsValue = this.mustQuery('[data-snaptiq-total-pixels]');
    this.semiTransparentValue = this.mustQuery('[data-snaptiq-semi-transparent]');
    this.modifiedValue = this.mustQuery('[data-snaptiq-modified]');
    this.thresholdUsedValue = this.mustQuery('[data-snaptiq-threshold-used]');
    this.panes = Array.from(this.root.querySelectorAll<HTMLElement>('[data-snaptiq-pane]'));
    this.backgroundSwatches = Array.from(this.root.querySelectorAll<HTMLButtonElement>('[data-snaptiq-background-swatch]'));
    this.backgroundInput = this.mustQuery<HTMLInputElement>('[data-snaptiq-background-input]');

    this.bindEvents();
    this.updateThresholdLabel();
    this.updateStats(emptyStatistics(Number(this.thresholdInput.value)));
    this.applyPreviewBackground();
    this.setStatus('Upload a PNG file to begin.');
  }

  public destroy(): void {
    if (this.processingFrame !== null) {
      cancelAnimationFrame(this.processingFrame);
    }

    if (this.downloadLink.href.startsWith('blob:')) {
      URL.revokeObjectURL(this.downloadLink.href);
    }

    this.loadedImage?.originalBitmap.close();
    this.root.innerHTML = '';
  }

  private bindEvents(): void {
    this.thresholdInput.addEventListener('input', () => {
      this.updateThresholdLabel();
      this.scheduleProcessing();
    });

    this.fileInput.addEventListener('change', () => {
      const file = this.fileInput.files?.[0];
      if (file) {
        void this.loadFile(file);
      }
    });

    this.mustQuery<HTMLButtonElement>('[data-snaptiq-sample]').addEventListener('click', () => {
      void this.loadSampleImage();
    });

    this.dropZone.addEventListener('dragover', (event) => {
      event.preventDefault();
      this.dropZone.classList.add('is-dragging');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('is-dragging');
    });

    this.dropZone.addEventListener('drop', (event) => {
      event.preventDefault();
      this.dropZone.classList.remove('is-dragging');
      const file = event.dataTransfer?.files[0];
      if (file) {
        void this.loadFile(file);
      }
    });

    this.mustQuery<HTMLButtonElement>('[data-snaptiq-zoom-in]').addEventListener('click', () => this.setZoom(this.viewState.zoom + zoomStep));
    this.mustQuery<HTMLButtonElement>('[data-snaptiq-zoom-out]').addEventListener('click', () => this.setZoom(this.viewState.zoom - zoomStep));
    this.mustQuery<HTMLButtonElement>('[data-snaptiq-reset-zoom]').addEventListener('click', () => this.resetView());
    this.backgroundInput.addEventListener('input', () => this.updatePreviewBackgroundFromInput());

    for (const swatch of this.backgroundSwatches) {
      swatch.addEventListener('click', () => this.setPreviewBackground(swatch.dataset.snaptiqBackgroundValue ?? transparentBackgroundValue));
    }

    for (const pane of this.panes) {
      pane.addEventListener('pointerdown', (event) => this.startPan(event));
      pane.addEventListener('pointermove', (event) => this.updatePan(event));
      pane.addEventListener('pointerup', () => this.endPan());
      pane.addEventListener('pointercancel', () => this.endPan());
      pane.addEventListener('pointerleave', () => this.endPan());
    }
  }

  private async loadFile(file: File): Promise<void> {
    try {
      validatePngFile(file);
      this.setStatus('Reading PNG file...');

      const bitmap = await decodePngFile(file);
      const original = readImageData(bitmap);

      this.loadedImage?.originalBitmap.close();
      this.loadedImage = {
        fileName: file.name,
        original,
        originalBitmap: bitmap
      };

      this.resetView();
      this.drawOriginal();
      this.processNow();
      this.setStatus(`Loaded ${file.name}. Tune the threshold to compare the result.`);
    } catch (error) {
      this.setError(toDisplayMessage(error));
    } finally {
      this.fileInput.value = '';
    }
  }

  private async loadSampleImage(): Promise<void> {
    try {
      const response = await fetch(sampleImageUrl);
      if (!response.ok) {
        throw new Error('Image is corrupted or could not be read.');
      }

      const blob = await response.blob();
      const file = new File([blob], sampleImageFileName, { type: 'image/png' });
      await this.loadFile(file);
    } catch (error) {
      this.setError(toDisplayMessage(error));
    }
  }

  private scheduleProcessing(): void {
    if (!this.loadedImage) {
      this.updateStats(emptyStatistics(Number(this.thresholdInput.value)));
      return;
    }

    if (this.processingFrame !== null) {
      cancelAnimationFrame(this.processingFrame);
    }

    this.processingFrame = requestAnimationFrame(() => {
      this.processingFrame = null;
      this.processNow();
    });
  }

  private processNow(): void {
    if (!this.loadedImage) {
      return;
    }

    try {
      const threshold = Number(this.thresholdInput.value);
      this.processedResult = normalizeAlpha(this.loadedImage.original, threshold);
      this.drawProcessed();
      this.updateStats(this.processedResult.statistics);
      this.updateDownloadLink();
    } catch (error) {
      this.setError(toDisplayMessage(error));
    }
  }

  private drawOriginal(): void {
    if (!this.loadedImage) {
      return;
    }

    this.drawImageData(this.originalCanvas, this.originalContext, this.loadedImage.original);
  }

  private drawProcessed(): void {
    if (!this.processedResult) {
      return;
    }

    this.drawImageData(this.processedCanvas, this.processedContext, this.processedResult.imageData);
  }

  private drawImageData(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, imageData: ImageData): void {
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
    this.applyView();
  }

  private updateDownloadLink(): void {
    if (!this.processedResult || !this.loadedImage) {
      this.downloadLink.removeAttribute('href');
      this.downloadLink.setAttribute('aria-disabled', 'true');
      return;
    }

    if (this.downloadLink.href.startsWith('blob:')) {
      URL.revokeObjectURL(this.downloadLink.href);
    }

    this.processedCanvas.toBlob((blob) => {
      if (!blob || !this.loadedImage) {
        this.setError('Processed PNG could not be prepared for download.');
        return;
      }

      this.downloadLink.href = URL.createObjectURL(blob);
      this.downloadLink.download = toOutputFileName(this.loadedImage.fileName);
      this.downloadLink.removeAttribute('aria-disabled');
    }, 'image/png');
  }

  private setZoom(zoom: number): void {
    this.viewState.zoom = Math.min(maximumZoom, Math.max(minimumZoom, zoom));
    if (this.viewState.zoom <= 1) {
      this.viewState.panX = 0;
      this.viewState.panY = 0;
    }

    this.applyView();
  }

  private resetView(): void {
    this.viewState = { zoom: 1, panX: 0, panY: 0 };
    this.applyView();
  }

  private startPan(event: PointerEvent): void {
    if (this.viewState.zoom <= 1) {
      return;
    }

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
      panX: this.viewState.panX,
      panY: this.viewState.panY
    };
  }

  private updatePan(event: PointerEvent): void {
    if (!this.dragStart) {
      return;
    }

    this.viewState.panX = this.dragStart.panX + event.clientX - this.dragStart.x;
    this.viewState.panY = this.dragStart.panY + event.clientY - this.dragStart.y;
    this.applyView();
  }

  private endPan(): void {
    this.dragStart = null;
  }

  private applyView(): void {
    const transform = `translate(${this.viewState.panX}px, ${this.viewState.panY}px) scale(${this.viewState.zoom})`;
    this.originalCanvas.style.transform = transform;
    this.processedCanvas.style.transform = transform;

    for (const pane of this.panes) {
      pane.classList.toggle('is-pannable', this.viewState.zoom > 1);
    }
  }

  private updateThresholdLabel(): void {
    this.thresholdValue.textContent = this.thresholdInput.value;
  }

  private updateStats(statistics: ProcessingStatistics): void {
    this.thresholdUsedValue.textContent = statistics.thresholdUsed.toLocaleString();
    this.totalPixelsValue.textContent = statistics.totalPixels.toLocaleString();
    this.semiTransparentValue.textContent = statistics.semiTransparentPixelsFound.toLocaleString();
    this.modifiedValue.textContent = statistics.pixelsModified.toLocaleString();
  }

  private updatePreviewBackgroundFromInput(): void {
    const normalizedColor = normalizeBackgroundColorInput(this.backgroundInput.value);

    if (normalizedColor === null) {
      this.backgroundInput.classList.add('is-invalid');
      return;
    }

    this.setPreviewBackground(normalizedColor, { updateInput: normalizedColor === transparentBackgroundValue });
  }

  private setPreviewBackground(color: string, options: { updateInput?: boolean } = { updateInput: true }): void {
    this.previewBackgroundColor = color;

    if (options.updateInput !== false) {
      this.backgroundInput.value = color;
    }

    this.backgroundInput.classList.remove('is-invalid');
    this.applyPreviewBackground();
  }

  private applyPreviewBackground(): void {
    const isTransparent = this.previewBackgroundColor === transparentBackgroundValue;

    for (const pane of this.panes) {
      pane.classList.toggle('has-solid-background', !isTransparent);
      pane.style.backgroundColor = isTransparent ? '' : this.previewBackgroundColor;
    }

    for (const swatch of this.backgroundSwatches) {
      const swatchValue = swatch.dataset.snaptiqBackgroundValue ?? transparentBackgroundValue;
      swatch.setAttribute('aria-pressed', String(swatchValue === this.previewBackgroundColor));
    }
  }

  private setStatus(message: string): void {
    this.statusMessage.textContent = message;
    this.statusMessage.classList.remove('is-error');
  }

  private setError(message: string): void {
    this.statusMessage.textContent = message;
    this.statusMessage.classList.add('is-error');
    this.downloadLink.removeAttribute('href');
    this.downloadLink.setAttribute('aria-disabled', 'true');
  }

  private mustQuery<T extends Element = HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Snaptiq widget template is missing ${selector}.`);
    }

    return element;
  }
}

export function mountSnaptiqWidget(root: HTMLElement | string, options?: SnaptiqWidgetOptions): SnaptiqWidget {
  const element = typeof root === 'string' ? document.querySelector<HTMLElement>(root) : root;
  if (!element) {
    throw new Error('Snaptiq widget mount element was not found.');
  }

  return new SnaptiqWidget(element, options);
}

function renderWidget(initialThreshold: number): string {
  return `
    <section class="snaptiq-web" aria-label="Snaptiq PNG alpha fixer">
      <div class="snaptiq-upload" data-snaptiq-drop-zone>
        <div>
          <strong>Upload a PNG</strong>
          <span>Choose a file or drag and drop it here.</span>
        </div>
        <div class="snaptiq-upload-actions">
          <button class="snaptiq-button" data-snaptiq-sample type="button">Add Sample</button>
          <label class="snaptiq-button">
            Select PNG
            <input data-snaptiq-file type="file" accept="image/png" />
          </label>
        </div>
      </div>

      <p class="snaptiq-status" data-snaptiq-status role="status"></p>

      <div class="snaptiq-toolbar" aria-label="Processing controls">
        <label class="snaptiq-threshold">
          <span>Threshold: <strong data-snaptiq-threshold-value>${initialThreshold}</strong></span>
          <input data-snaptiq-threshold type="range" min="${minimumThreshold}" max="${maximumThreshold}" value="${initialThreshold}" />
        </label>
        <div class="snaptiq-zoom-controls" aria-label="Zoom controls">
          <button type="button" data-snaptiq-zoom-out>Zoom out</button>
          <button type="button" data-snaptiq-reset-zoom>Reset 100%</button>
          <button type="button" data-snaptiq-zoom-in>Zoom in</button>
        </div>
        <a class="snaptiq-download" data-snaptiq-download aria-disabled="true">Download PNG</a>
      </div>

      <div class="snaptiq-workspace">
        <figure>
          <figcaption>Original</figcaption>
          <div class="snaptiq-pane" data-snaptiq-pane>
            <canvas data-snaptiq-original-canvas></canvas>
          </div>
        </figure>
        <figure>
          <figcaption>Snaptiq</figcaption>
          <div class="snaptiq-pane" data-snaptiq-pane>
            <canvas data-snaptiq-processed-canvas></canvas>
          </div>
        </figure>
      </div>

      <div class="snaptiq-background-control" aria-label="Preview background controls">
        <span>Set background</span>
        <div class="snaptiq-background-options">
          ${renderBackgroundSwatches()}
          <input
            data-snaptiq-background-input
            type="text"
            inputmode="text"
            spellcheck="false"
            aria-label="Custom background hex color"
            placeholder="#RRGGBB"
            value=""
          />
        </div>
      </div>

      <dl class="snaptiq-stats">
        <div><dt>Threshold used</dt><dd data-snaptiq-threshold-used>0</dd></div>
        <div><dt>Total pixels</dt><dd data-snaptiq-total-pixels>0</dd></div>
        <div><dt>Semi-transparent pixels found</dt><dd data-snaptiq-semi-transparent>0</dd></div>
        <div><dt>Pixels modified</dt><dd data-snaptiq-modified>0</dd></div>
      </dl>
    </section>
  `;
}

function renderBackgroundSwatches(): string {
  return backgroundColorPresets
    .map((preset) => {
      const swatchStyle = preset.value === transparentBackgroundValue ? '' : ` style="--snaptiq-swatch-color: ${preset.value}"`;
      const transparentClass = preset.value === transparentBackgroundValue ? ' is-transparent' : '';

      return `
        <button
          class="snaptiq-background-swatch${transparentClass}"
          data-snaptiq-background-swatch
          data-snaptiq-background-value="${preset.value}"
          type="button"
          aria-label="${preset.label}"
          aria-pressed="${preset.value === transparentBackgroundValue}"
          title="${preset.label}"
          ${swatchStyle}
        ></button>
      `;
    })
    .join('');
}

function validatePngFile(file: File): void {
  const fileName = file.name.toLowerCase();
  const hasPngType = acceptedPngTypes.has(file.type);
  const hasUnknownType = file.type === '';

  if (!hasPngType && !(hasUnknownType && fileName.endsWith('.png'))) {
    throw new Error('Unsupported file format. Please upload a PNG file.');
  }
}

async function decodePngFile(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error('Image is corrupted or could not be read.');
  }
}

function readImageData(bitmap: ImageBitmap): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = getCanvasContext(canvas);
  context.drawImage(bitmap, 0, 0);
  return context.getImageData(0, 0, bitmap.width, bitmap.height);
}

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Canvas 2D rendering is not available in this browser.');
  }

  return context;
}

function toOutputFileName(fileName: string): string {
  const withoutPngExtension = fileName.replace(/\.png$/i, '');
  return `${withoutPngExtension}.snaptiq.png`;
}

function emptyStatistics(threshold: number): ProcessingStatistics {
  return {
    totalPixels: 0,
    semiTransparentPixelsFound: 0,
    pixelsModified: 0,
    thresholdUsed: threshold
  };
}

function toDisplayMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected image processing error occurred.';
}
