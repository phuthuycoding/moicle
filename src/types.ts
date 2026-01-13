export type Scope = 'global' | 'project';

export type ItemType = 'agents' | 'commands' | 'skills';

export type EditorTarget = 'claude' | 'cursor' | 'windsurf' | 'antigravity';

export interface EditorConfig {
  name: string;
  globalDir: string;
  agentsDir: string;
  commandsDir: string;
  skillsDir: string;
  rulesFile?: string;
  supportsAgents: boolean;
  supportsCommands: boolean;
  supportsSkills: boolean;
}

export interface FileResult {
  status: 'created' | 'updated' | 'exists' | 'skipped' | 'removed' | 'not_found' | 'error';
  name: string;
  reason?: string;
}

export interface ListItem {
  name: string;
  path: string;
  isSymlink: boolean;
  target: string | null;
}

export interface MoicleConfig {
  targets: EditorTarget[];
  disabled: {
    agents: string[];
    commands: string[];
    skills: string[];
  };
}

export interface SelectableItem {
  type: ItemType;
  name: string;
  display: string;
  disabled?: boolean;
}

export interface CommandOptions {
  global?: boolean;
  project?: boolean;
  all?: boolean;
  symlink?: boolean;
  target?: EditorTarget;
}
