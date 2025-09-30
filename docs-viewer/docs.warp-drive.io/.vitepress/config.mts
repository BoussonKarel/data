import { withPwa } from '@vite-pwa/vitepress';
import { defineConfig, type Plugin } from 'vitepress';
import { getGuidesStructure, postProcessApiDocs } from '../../src/site-utils.ts';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';
import { footnote } from '@mdit/plugin-footnote';

const TypeDocSidebar = await postProcessApiDocs();

import llmstxt from 'vitepress-plugin-llms';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';

const GuidesStructure = await getGuidesStructure();
const plugin = groupIconVitePlugin({
  customIcon: {
    ember: 'vscode-icons:file-type-ember',
    emberjs: 'vscode-icons:file-type-ember',
    'ember.js': 'vscode-icons:file-type-ember',
    'Ember.js': 'vscode-icons:file-type-ember',
    glimmer: 'vscode-icons:file-type-glimmer',
    glimmerjs: 'vscode-icons:file-type-glimmer',
    'glimmer.js': 'vscode-icons:file-type-glimmer',
    'glimmer-ts': 'vscode-icons:file-type-glimmer',
    'glimmer-js': 'vscode-icons:file-type-glimmer',
    '.gts': 'vscode-icons:file-type-glimmer',
    '.gjs': 'vscode-icons:file-type-glimmer',
    '.hbs': 'vscode-icons:file-type-ember',
  },
}) as unknown as Plugin[];
// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    title: 'WarpDrive',
    description: 'Boldly go where no App has gone before',

    markdown: {
      config(md) {
        md.use(groupIconMdPlugin);
        md.use(tabsMarkdownPlugin);
        md.use(footnote);
      },
    },

    // @ts-expect-error
    pwa: {
      workbox: {
        // default is 2MB but the search index is much larger
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    },

    vite: {
      plugins: [
        llmstxt(),
        plugin,
        ViteImageOptimizer({
          // // Configure optimization options for different image formats
          // png: {
          //   quality: 80,
          // },
          // jpeg: {
          //   quality: 75,
          // },
          // webp: {
          //   quality: 80,
          // },
          // avif: {
          //   quality: 70,
          // },
          // svg: {
          //   plugins: [{ name: 'removeViewBox', active: false }, { name: 'sortAttrs' }],
          // },
        }) as unknown as Plugin[],
      ],
    },

    // just until we have the guides and docs in a better state
    ignoreDeadLinks: false,

    // this won't work properly until we don't need to sync the guides
    // from the repo root into the docs-viewer
    // lastUpdated: true,

    head: [
      ['link', { rel: 'manifest', href: '/site.webmanifest' }],
      ['link', { rel: 'icon', href: '/favicon.ico', sizes: '32x32' }],
      ['link', { rel: 'icon', href: '/logos/warp-drive/prefers-color-w.svg', type: 'image/svg+xml' }],
      ['link', { rel: 'apple-touch-icon', href: '/logos/favicon/logo-yellow-square-180x180.png', type: 'image/png' }],
      [
        'meta',
        {
          name: 'keywords',
          content:
            'data-framework fetch typescript typed REST data-loading apps GraphQL JSON:API jsonapi json reactivity signals cross-framework MPA SPA',
        },
      ],
      [
        'meta',
        {
          name: 'description',
          content:
            'WarpDrive is a lightweight data library for web apps — universal, typed, reactive, and ready to scale.',
        },
      ],
      [
        'meta',
        {
          name: 'apple-mobile-web-app-title',
          content: 'WarpDrive',
        },
      ],
      [
        'meta',
        {
          itemprop: 'description',
          content:
            'WarpDrive is a lightweight data library for web apps — universal, typed, reactive, and ready to scale.',
        },
      ],

      ['meta', { property: 'og:title', content: 'WarpDrive' }],
      ['meta', { property: 'og:site_name', content: 'warp-drive.io' }],
      ['meta', { property: 'og:type', content: 'website' }],
      [
        'meta',
        {
          property: 'og:description',
          content:
            'WarpDrive is a lightweight data library for web apps — universal, typed, reactive, and ready to scale.',
        },
      ],
      ['meta', { property: 'og:url', content: 'https://warp-drive.io' }],
      ['meta', { property: 'og:image', content: '/logos/warp-drive/github-header.png' }],
      // ['meta', { property: 'og:image', content: '/logos/social1.png' }],
      // ['meta', { property: 'og:image', content: '/logos/social2.png' }],
      // [
      //   'link',
      //   { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
      // ],
      // [
      //   'link',
      //   { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
      // ],
      // [
      //   'link',
      //   { href: 'https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&amp;display=swap', rel: 'stylesheet' }
      // ]
    ],

    // github pages supports cleanURLs
    cleanUrls: true,
    base: process.env.BASE || '/',

    // we want to use rewrites but can't https://github.com/vuejs/vitepress/issues/4364
    // rewrites: GuidesStructure.rewritten,

    sitemap: {
      hostname: process.env.HOSTNAME || 'https://canary.warp-drive.io',
    },

    themeConfig: {
      siteTitle: false,
      logo: {
        dark: '/logos/warp-drive/word-mark-white.svg',
        light: '/logos/warp-drive/warp-drive-logo-dark.svg',
        alt: 'WarpDrive',
      },

      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: 'Guides', link: '/guides' },
        { text: 'API Docs', link: '/api' },
        { text: 'Contributing', link: '/guides/contributing/become-a-contributor' },
      ],

      sidebar: [
        ...GuidesStructure.paths,
        {
          text: 'API Docs',
          collapsed: true,
          // link: '/api/',
          items: [
            { text: 'Universal' },
            ...TypeDocSidebar.corePackages.items,
            { text: 'Frameworks' },
            ...TypeDocSidebar.frameworkPackages.items,
          ],
        },
        {
          text: 'Legacy Packages',
          collapsed: true,
          // link: '/api/',
          items: TypeDocSidebar.oldPackages,
        },
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/warp-drive-data/warp-drive' },
        { icon: 'discord', link: 'https://discord.gg/PHBbnWJx5S' },
        { icon: 'bluesky', link: 'https://bsky.app/profile/warp-drive.io' },
      ],

      editLink: {
        pattern: 'https://github.com/warp-drive-data/warp-drive/edit/main/:path',
      },

      search: {
        provider: 'local',
      },

      outline: {
        level: 2,
      },

      footer: {
        message: 'Released under the MIT License.',
        copyright: `Copyright &copy; 2025 Ember.js and Contributors`,
      },
    },
  })
);
