export interface MenuItem {
  label: string;
  href?: string;
  type?: 'category' | 'expander' | 'navigation';
  children?: MenuItem[];
  icon?: string;
  onClick?: () => void;
  selected?: boolean;
}

export interface Tree {
  name: string;
  path?: string;
  onClick?: () => void;
  icon?: string;
  type: 'category' | 'expander' | 'navigation';
  pages?: Tree[];
  selected: boolean;
}
