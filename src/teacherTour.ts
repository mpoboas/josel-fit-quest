import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TEACHER_TOUR_LAYOUT, TOUR_STORAGE_KEY, type TeacherTourStepLayout } from "./data/teacherTour";
import {
  TOUR_STEP_COPY,
  getTourUi,
  setStoredTourLang,
  type TourLang
} from "./data/teacherTourCopy";

export type { TourLang } from "./data/teacherTourCopy";
export {
  detectDefaultTourLang,
  getStoredTourLang,
  getTourUi,
  parseTourLangParam,
  setStoredTourLang
} from "./data/teacherTourCopy";

type TabChanger = (tab: TeacherTourStepLayout["tab"]) => void;

export interface TeacherTourStepConfig extends TeacherTourStepLayout {
  title: string;
  description: string;
}

function buildStepConfigs(lang: TourLang): TeacherTourStepConfig[] {
  const copy = TOUR_STEP_COPY[lang];
  return TEACHER_TOUR_LAYOUT.map((layout) => ({
    ...layout,
    title: copy[layout.id].title,
    description: copy[layout.id].description
  }));
}

let scrollCleanup: (() => void) | null = null;
let activeSteps: TeacherTourStepConfig[] = [];
let onTourCompleteCallback: (() => void) | null = null;

function completeTour(drv: Driver) {
  markTeacherTourDone();
  onTourCompleteCallback?.();
  onTourCompleteCallback = null;
  drv.destroy();
}

function waitForElement(selector: string, timeoutMs = 3500): Promise<Element | null> {
  return new Promise((resolve) => {
    const tryFind = () => document.querySelector(selector);
    const existing = tryFind();
    if (existing) {
      resolve(existing);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const el = tryFind();
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        resolve(null);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function waitFrames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
}

function findScrollParent(el: Element): HTMLElement | null {
  let parent = el.parentElement;
  while (parent && parent !== document.body) {
    const { overflowY } = getComputedStyle(parent);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function scrollTargetIntoView(el: Element) {
  const navReserve = 76;
  const topReserve = 12;
  const padding = 16;

  const scrollParent = findScrollParent(el);

  if (scrollParent) {
    const elRect = el.getBoundingClientRect();
    const parentRect = scrollParent.getBoundingClientRect();
    const offset =
      elRect.top -
      parentRect.top -
      (parentRect.height - elRect.height) / 2 +
      padding;
    scrollParent.scrollTop += offset;
  }

  el.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });

  const rect = el.getBoundingClientRect();
  const maxBottom = window.innerHeight - navReserve;
  if (rect.bottom > maxBottom) {
    const delta = rect.bottom - maxBottom + padding;
    if (scrollParent) scrollParent.scrollTop += delta;
    else window.scrollBy(0, delta);
  }
  if (rect.top < topReserve) {
    const delta = rect.top - topReserve - padding;
    if (scrollParent) scrollParent.scrollTop += delta;
    else window.scrollBy(0, delta);
  }
}

async function prepareStep(cfg: TeacherTourStepConfig, setTab: TabChanger): Promise<Element | null> {
  setTab(cfg.tab);
  const el = await waitForElement(cfg.element);
  if (el && cfg.side !== "over") {
    scrollTargetIntoView(el);
    await waitFrames(3);
    await new Promise((r) => setTimeout(r, 80));
  }
  return el;
}

function attachScrollRefresh(d: Driver) {
  let raf = 0;
  const refresh = () => {
    if (!d.isActive()) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => d.refresh());
  };

  window.addEventListener("scroll", refresh, { passive: true, capture: true });
  window.addEventListener("resize", refresh, { passive: true });

  const containers = document.querySelectorAll(".scroll-container");
  containers.forEach((node) => node.addEventListener("scroll", refresh, { passive: true }));

  const ro = new ResizeObserver(refresh);
  document.querySelectorAll("[data-tour]").forEach((node) => ro.observe(node));

  scrollCleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", refresh, { capture: true });
    window.removeEventListener("resize", refresh);
    containers.forEach((node) => node.removeEventListener("scroll", refresh));
    ro.disconnect();
    scrollCleanup = null;
  };
}

function buildSteps(): DriveStep[] {
  return activeSteps.map((cfg) => ({
    element: () => document.querySelector(cfg.element) ?? undefined,
    popover: {
      title: cfg.title,
      description: cfg.description,
      side: cfg.side ?? "bottom",
      align: cfg.align ?? "center",
      showButtons: ["next", "previous", "close"],
      showProgress: true
    }
  }));
}

async function goToStep(d: Driver, index: number, setTab: TabChanger) {
  const cfg = activeSteps[index];
  if (!cfg) return;
  await prepareStep(cfg, setTab);
  d.drive(index);
  await waitFrames(2);
  d.refresh();
}

export function isTeacherTourDone(): boolean {
  return localStorage.getItem(TOUR_STORAGE_KEY) === "1";
}

export function markTeacherTourDone(): void {
  localStorage.setItem(TOUR_STORAGE_KEY, "1");
}

export function shouldAutoStartTour(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("tour") === "1") return true;
  return localStorage.getItem("fq_auto_tour_v1") === "1";
}

const PENDING_TOUR_START_KEY = "fq_pending_tour_start_v1";

export function markPendingTourStart(lang: TourLang): void {
  sessionStorage.setItem(PENDING_TOUR_START_KEY, lang);
}

export function getPendingTourLang(): TourLang | null {
  const lang = sessionStorage.getItem(PENDING_TOUR_START_KEY);
  return lang === "en" || lang === "pt" ? lang : null;
}

export function hasPendingTourStart(): boolean {
  return getPendingTourLang() != null;
}

export function consumePendingTourStart(): void {
  sessionStorage.removeItem(PENDING_TOUR_START_KEY);
}

export function createTeacherTour(setTab: TabChanger, lang: TourLang): Driver {
  activeSteps = buildStepConfigs(lang);
  const ui = getTourUi(lang);

  const d = driver({
    animate: true,
    smoothScroll: false,
    allowClose: true,
    overlayOpacity: 0.82,
    overlayColor: "#000",
    stagePadding: 10,
    stageRadius: 14,
    popoverOffset: 14,
    showProgress: true,
    progressText: "{{current}} / {{total}}",
    nextBtnText: ui.next,
    prevBtnText: ui.back,
    doneBtnText: ui.finish,
    popoverClass: "fitquest-driver-popover",
    steps: buildSteps(),
    onNextClick: (_el, _step, { driver: drv }) => {
      const idx = drv.getActiveIndex() ?? 0;
      const next = idx + 1;
      if (next >= activeSteps.length) {
        completeTour(drv);
        return;
      }
      void goToStep(drv, next, setTab);
    },
    onPrevClick: (_el, _step, { driver: drv }) => {
      const idx = drv.getActiveIndex() ?? 0;
      if (idx <= 0) return;
      void goToStep(drv, idx - 1, setTab);
    },
    onCloseClick: (_el, _step, { driver: drv }) => {
      onTourCompleteCallback = null;
      drv.destroy();
    },
    onDestroyed: () => {
      scrollCleanup?.();
      onTourCompleteCallback = null;
    }
  });

  return d;
}

export function startTeacherTour(
  setTab: TabChanger,
  lang: TourLang,
  options?: { onComplete?: () => void }
): Driver {
  setStoredTourLang(lang);
  onTourCompleteCallback = options?.onComplete ?? null;
  const d = createTeacherTour(setTab, lang);
  attachScrollRefresh(d);

  void (async () => {
    await prepareStep(activeSteps[0], setTab);
    d.drive(0);
    await waitFrames(2);
    d.refresh();
  })();

  return d;
}
