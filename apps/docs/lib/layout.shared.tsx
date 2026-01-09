import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2.5">
          <span className="text-xl">⚡</span>
          <span className="font-bold">StackKit</span>
        </div>
      ),
    },
  };
}
