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
      githubUrl: 'https://github.com/tariqul420/stackkit',
    },
    links: [
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'GitHub',
        url: 'https://github.com/tariqul420/stackkit',
        external: true,
      },
    ],
  };
}
