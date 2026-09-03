export interface MaintainerConfig {
  appName: string;
  tagline: string;
  version: string;
  buildNumber: string;
  license: string;
  githubUsername: string;
  repositoryName: string;
  repositoryUrl: string;
  issuesUrl: string;
  authorName: string;
  authorBio: string;
}

export const MAINTAINER_CONFIG: MaintainerConfig = {
  appName: 'Clarity',
  tagline: 'Ephemeral Camera & Sandboxed Visual Scratchpad',
  version: '1.0.0',
  buildNumber: '100',
  license: 'MIT',
  githubUsername: 'Harsh-Sawale',
  repositoryName: 'Clarity',
  repositoryUrl: 'https://github.com/Harsh-Sawale/Clarity',
  issuesUrl: 'https://github.com/Harsh-Sawale/Clarity/issues',
  authorName: 'Harsh Sawale',
  authorBio: 'Open-source software engineered for privacy, minimalism, and digital decluttering.',
};

export const PRESET_DURATIONS = [
  { label: '30m', value: 30 * 60 * 1000 },
  { label: '2h', value: 2 * 60 * 60 * 1000 },
  { label: '6h', value: 6 * 60 * 60 * 1000 },
  { label: '24h', value: 24 * 60 * 60 * 1000 },
];

export const CATEGORY_DEFAULTS: Record<string, { label: string; defaultDurationMs: number }> = {
  parking: { label: 'Parking', defaultDurationMs: 3 * 60 * 60 * 1000 }, // 3 hours
  receipt: { label: 'Receipt', defaultDurationMs: 24 * 60 * 60 * 1000 }, // 24 hours
  pass: { label: 'Code / Pass', defaultDurationMs: 6 * 60 * 60 * 1000 }, // 6 hours
  note: { label: 'Quick Note', defaultDurationMs: 2 * 60 * 60 * 1000 }, // 2 hours
};
