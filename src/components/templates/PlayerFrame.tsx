import type { ReactNode } from 'react';
import { BoomboxTemplate } from './BoomboxTemplate';
import { WalkmanTemplate } from './WalkmanTemplate';

interface PlayerFrameProps {
  template: 'boombox' | 'walkman' | 'minimal' | undefined;
  children: ReactNode;
}

export function PlayerFrame({ template, children }: PlayerFrameProps) {
  switch (template) {
    case 'boombox':
      return <BoomboxTemplate>{children}</BoomboxTemplate>;
    case 'walkman':
      return <WalkmanTemplate>{children}</WalkmanTemplate>;
    case 'minimal':
    default:
      // Minimal is just the cassette floating
      return <div className="p-4">{children}</div>;
  }
}
