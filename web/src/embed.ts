import { mountSnaptiqWidget, type SnaptiqWidget, type SnaptiqWidgetOptions } from './widget';

type SnaptiqMountTarget = HTMLElement | string;

export interface SnaptiqWebApi {
  mount(target: SnaptiqMountTarget, options?: SnaptiqWidgetOptions): SnaptiqWidget;
  unmount(target: SnaptiqMountTarget): void;
}

const mountedWidgets = new WeakMap<HTMLElement, SnaptiqWidget>();

function resolveTarget(target: SnaptiqMountTarget): HTMLElement {
  const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!element) {
    throw new Error('Snaptiq widget mount element was not found.');
  }

  return element;
}

export const SnaptiqWeb: SnaptiqWebApi = {
  mount(target, options) {
    const element = resolveTarget(target);
    mountedWidgets.get(element)?.destroy();

    const widget = mountSnaptiqWidget(element, options);
    mountedWidgets.set(element, widget);
    return widget;
  },

  unmount(target) {
    const element = resolveTarget(target);
    const widget = mountedWidgets.get(element);
    if (!widget) {
      return;
    }

    widget.destroy();
    mountedWidgets.delete(element);
  }
};

declare global {
  interface Window {
    SnaptiqWeb: SnaptiqWebApi;
  }
}

window.SnaptiqWeb = SnaptiqWeb;
