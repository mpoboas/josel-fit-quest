export type TourLang = "en" | "pt";

export const TOUR_LANG_KEY = "fq_tour_lang_v1";

export type TourStepId =
  | "welcome"
  | "xp"
  | "streak"
  | "social"
  | "nav-log"
  | "workout"
  | "finish"
  | "nav-goals"
  | "boss"
  | "quests"
  | "nav-rank"
  | "leaderboard"
  | "nav-profile"
  | "motivation"
  | "badges"
  | "analytics"
  | "done";

export interface TourStepText {
  title: string;
  description: string;
}

export interface TourUiText {
  cardTitle: string;
  cardBody: string;
  startButton: string;
  settingsRestart: string;
  next: string;
  back: string;
  finish: string;
  langEn: string;
  langPt: string;
}

export const TOUR_UI: Record<TourLang, TourUiText> = {
  en: {
    cardTitle: "Guided tour",
    cardBody: "Walk through the main features of FitQuest.",
    startButton: "Start guided tour",
    settingsRestart: "Start guided tour",
    next: "Next",
    back: "Back",
    finish: "Finish",
    langEn: "English",
    langPt: "Português"
  },
  pt: {
    cardTitle: "Visita guiada",
    cardBody: "Conheça as principais funcionalidades do FitQuest.",
    startButton: "Iniciar visita guiada",
    settingsRestart: "Iniciar visita guiada",
    next: "Seguinte",
    back: "Voltar",
    finish: "Concluir",
    langEn: "English",
    langPt: "Português"
  }
};

export const TOUR_STEP_COPY: Record<TourLang, Record<TourStepId, TourStepText>> = {
  en: {
    welcome: {
      title: "Guided tour",
      description: "A quick look at XP, streaks, goals, rankings, and your profile."
    },
    xp: {
      title: "Experience points (XP)",
      description: "Earn XP from workouts, personal records, and streaks. XP fills your level bar."
    },
    streak: {
      title: "Streaks & streak shields",
      description:
        "Train on consecutive days to build a streak. Shields cover one missed day. You get a free shield at day 7."
    },
    social: {
      title: "Friend activity",
      description: "Recent workouts from friends appear here. Tap High five to show support."
    },
    "nav-log": {
      title: "Log a workout",
      description: "Open the logger to record exercises, sets, reps, weight, and PRs."
    },
    workout: {
      title: "Exercise logging",
      description: "Track sets in kg and reps. Mark a set as PR for bonus XP. Add exercises or sets anytime."
    },
    finish: {
      title: "Finish workout",
      description: "Saving a workout grants XP, updates your streak and quests, and posts to the friend feed."
    },
    "nav-goals": {
      title: "Goals & challenges",
      description: "Daily and weekly quests and the monthly Boss challenge live here."
    },
    boss: {
      title: "Monthly Boss challenge",
      description: "Limited-time goals that mix workouts and PRs. Rewards include XP, shields, and badges."
    },
    quests: {
      title: "Quests",
      description: "Progress updates automatically from your logged workouts."
    },
    "nav-rank": {
      title: "Leaderboards",
      description: "See how you rank among friends and globally. Weekly sprint and category tabs are inside."
    },
    leaderboard: {
      title: "Rankings",
      description: "Friends, global, weekly sprint, and category leaders. Weekly sprint resets on Monday."
    },
    "nav-profile": {
      title: "Profile",
      description: "Your rank, badges, motivation profile, and training charts."
    },
    motivation: {
      title: "Motivation profile",
      description: "Your dominant drives from the motivation quiz. Retake it periodically to refresh quest order."
    },
    badges: {
      title: "Badges",
      description: "Unlock badges for streaks, PRs, social actions, and boss wins."
    },
    analytics: {
      title: "Analytics",
      description: "Weekly volume, strength trends, and how you split your training."
    },
    done: {
      title: "Done",
      description: "You can explore on your own. Start the tour again anytime from Home or Settings."
    }
  },
  pt: {
    welcome: {
      title: "Visita guiada",
      description: "Um resumo de XP, sequências, metas, rankings e perfil."
    },
    xp: {
      title: "Pontos de experiência (XP)",
      description: "Ganhe XP com treinos, recordes pessoais e sequências. O XP enche a barra de nível."
    },
    streak: {
      title: "Sequências e escudos",
      description:
        "Treine em dias seguidos para manter a sequência. Os escudos cobrem um dia falhado. Um escudo grátis no dia 7."
    },
    social: {
      title: "Atividade dos amigos",
      description: "Os treinos recentes dos amigos aparecem aqui. Toque em High five para apoiar."
    },
    "nav-log": {
      title: "Registar treino",
      description: "Abra o registo para exercícios, séries, repetições, peso e PRs."
    },
    workout: {
      title: "Registo de exercícios",
      description: "Acompanhe séries em kg e repetições. Marque PR para XP extra. Adicione exercícios ou séries quando quiser."
    },
    finish: {
      title: "Concluir treino",
      description: "Ao guardar, recebe XP, atualiza a sequência e as missões e publica no feed de amigos."
    },
    "nav-goals": {
      title: "Metas e desafios",
      description: "Missões diárias e semanais e o desafio Boss mensal estão aqui."
    },
    boss: {
      title: "Desafio Boss mensal",
      description: "Metas por tempo que misturam treinos e PRs. Recompensas: XP, escudos e medalhas."
    },
    quests: {
      title: "Missões",
      description: "O progresso atualiza automaticamente com os treinos que regista."
    },
    "nav-rank": {
      title: "Classificações",
      description: "Compare-se com amigos e globalmente. Sprint semanal e categorias dentro do separador."
    },
    leaderboard: {
      title: "Rankings",
      description: "Amigos, global, sprint semanal e líderes por categoria. O sprint semanal reinicia à segunda-feira."
    },
    "nav-profile": {
      title: "Perfil",
      description: "A sua patente, medalhas, perfil de motivação e gráficos de treino."
    },
    motivation: {
      title: "Perfil de motivação",
      description: "Os seus impulsos dominantes do questionário. Refaça-o de vez em quando para atualizar as missões."
    },
    badges: {
      title: "Medalhas",
      description: "Desbloqueie medalhas por sequências, PRs, ações sociais e vitórias no Boss."
    },
    analytics: {
      title: "Análise",
      description: "Volume semanal, evolução de força e distribuição dos treinos."
    },
    done: {
      title: "Concluído",
      description: "Pode explorar à vontade. Inicie a visita guiada outra vez em Início ou Definições."
    }
  }
};

export function getTourUi(lang: TourLang): TourUiText {
  return TOUR_UI[lang];
}

export function detectDefaultTourLang(): TourLang {
  if (typeof navigator !== "undefined") {
    const code = navigator.language.toLowerCase();
    if (code.startsWith("pt")) return "pt";
  }
  return "en";
}

export function parseTourLangParam(value: string | null): TourLang | null {
  if (value === "en" || value === "pt") return value;
  return null;
}

export function getStoredTourLang(): TourLang {
  const stored = localStorage.getItem(TOUR_LANG_KEY);
  if (stored === "en" || stored === "pt") return stored;
  return detectDefaultTourLang();
}

export function setStoredTourLang(lang: TourLang): void {
  localStorage.setItem(TOUR_LANG_KEY, lang);
}
