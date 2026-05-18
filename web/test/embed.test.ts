import { beforeEach, describe, expect, it, vi } from 'vitest';

const mountSnaptiqWidget = vi.fn();

vi.mock('../src/widget', () => ({
  mountSnaptiqWidget,
}));

describe('SnaptiqWeb.mount', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    (globalThis as { window?: object }).window = {};
  });

  it('passes sampleImageUrl through the browser mount API', async () => {
    const target = {};
    const widget = { destroy: vi.fn() };
    mountSnaptiqWidget.mockReturnValue(widget);

    const { SnaptiqWeb } = await import('../src/embed');
    const options = { initialThreshold: 128, sampleImageUrl: '/vendor/snaptiq-web/sampleimage.png' };

    const mountedWidget = SnaptiqWeb.mount(target as unknown as HTMLElement, options);

    expect(mountSnaptiqWidget).toHaveBeenCalledWith(target, options);
    expect(mountedWidget).toBe(widget);
  });
});
