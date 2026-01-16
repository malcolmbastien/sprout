/**
 * Centralized Theme Configuration
 *
 * Edit colors in this file to change them throughout the entire application.
 * All stage-related colors (badges, progress bars, hover effects, headers)
 * are defined here for consistency and easy maintenance.
 *
 * Note: Glow effects are now applied inline based on card state (slate/emerald/amber)
 * rather than post stage, for better visual consistency.
 *
 * Usage:
 * - import { getStageColors, getStageGlows, getProgressColors } from '../lib/theme'
 * - Or access theme object directly: import { theme } from '../lib/theme'
 */
export const theme = {
  // Header coin colors
  header: {
    seed: "bg-emerald-100/40 dark:bg-emerald-800/40 border border-emerald-300 dark:border-emerald-900",
    sprout:
      "bg-emerald-200/40 dark:bg-emerald-700/40 border border-emerald-400 dark:border-emerald-700",
    evergreen: "bg-emerald-300/40 dark:bg-emerald-600/40 border border-emerald-500 dark:border-emerald-800",
  },

  stage: {
    seed: {
      // badge on post card and in post header
      badge:
        "bg-emerald-100/40 dark:bg-emerald-800/40 text-slate-600 dark:text-slate-400 border-emerald-300 dark:border-emerald-900",
      // glow on hover of post card (deprecated - now uses card-state-based glows)
      glow: "hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/50",
      // colour in progress bar under "garden stats"
      progress: "bg-emerald-100 dark:bg-emerald-800",
    },
    sprout: {
      badge:
        "bg-emerald-200/40 dark:bg-emerald-700/40 text-green-700 dark:text-green-400 border-emerald-400 dark:border-emerald-700",
      glow: "hover:shadow-emerald-200/50 dark:hover:shadow-emerald-800/50", // deprecated
      progress: "bg-emerald-200 dark:bg-emerald-700",
    },
    evergreen: {
      badge:
        "bg-emerald-300/40 dark:bg-emerald-600/40 text-emerald-800 dark:text-emerald-400 border-emerald-500 dark:border-emerald-800",
      glow: "hover:shadow-emerald-200/75 dark:hover:shadow-emerald-700/50", // deprecated
      progress: "bg-emerald-300 dark:bg-emerald-600",
    },
  },
};

// Helper functions to get theme values
export const getStageColors = () => ({
  seed: theme.stage.seed.badge,
  sprout: theme.stage.sprout.badge,
  evergreen: theme.stage.evergreen.badge,
});

export const getStageGlows = () => ({
  seed: theme.stage.seed.glow,
  sprout: theme.stage.sprout.glow,
  evergreen: theme.stage.evergreen.glow,
});

export const getProgressColors = () => ({
  seed: theme.stage.seed.progress,
  sprout: theme.stage.sprout.progress,
  evergreen: theme.stage.evergreen.progress,
});
