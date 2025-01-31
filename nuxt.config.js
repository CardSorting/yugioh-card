export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Yu-Gi-Oh! Card Maker',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Create Yu-Gi-Oh! cards online' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/MatrixBoldSmallCaps.ttf', crossorigin: true },
      { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/zh.ttf', crossorigin: true },
      { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/cn.ttf', crossorigin: true },
      { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/jp.ttf', crossorigin: true },
      { rel: 'preload', as: 'font', type: 'font/otf', href: '/fonts/jp2.otf', crossorigin: true },
      { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/en.ttf', crossorigin: true },
      { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/en2.ttf', crossorigin: true },
      { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/en3.ttf', crossorigin: true },
      { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/link.ttf', crossorigin: true },
      { rel: 'preload', as: 'font', type: 'font/ttf', href: '/fonts/cardkey.ttf', crossorigin: true }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/static/fonts/font-face.css',
    'bootstrap/dist/css/bootstrap.css',
    'bootstrap-vue/dist/bootstrap-vue.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/bootstrap-vue',
    '~/plugins/modal',
    '~/plugins/font-awesome',
    '~/plugins/regenerator',
    '~/plugins/auth',
    '~/plugins/deck-services',
    '~/plugins/card-drawing',
    '~/plugins/card-image-service',
    '~/plugins/dalle'
  ],

  // Router middleware
  router: {
    middleware: ['auth', 'deck-auth']
  },

  build: {
    babel: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current',
            browsers: ['last 2 versions']
          },
          useBuiltIns: 'usage',
          corejs: 3,
          modules: 'commonjs'
        }]
      ],
      plugins: [
        '@babel/plugin-transform-optional-chaining',
        '@babel/plugin-transform-nullish-coalescing-operator',
        ['@babel/plugin-transform-private-property-in-object', { loose: true }],
        ['@babel/plugin-transform-private-methods', { loose: true }],
        ['@babel/plugin-transform-class-properties', { loose: true }],
        ['@babel/plugin-transform-runtime', {
          regenerator: true
        }],
        '@babel/plugin-transform-modules-commonjs'
      ]
    },
    transpile: ['date-fns'],
    extend(config, { isClient }) {
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      })
    },
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: 'all',
        automaticNameDelimiter: '.',
        name: true,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            name: 'node_vendors',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 1,
            maxSize: 244000
          },
          commons: {
            test: /[\\/]components[\\/]/,
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: -10,
            maxSize: 244000
          },
          styles: {
            name: 'styles',
            test: /\.(css|vue)$/,
            chunks: 'all',
            enforce: true,
            priority: 20,
            maxSize: 244000
          }
        }
      }
    },
    performance: {
      hints: process.env.NODE_ENV === 'development' ? false : 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/composition-api/module',
    '@nuxt/typescript-build'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    ['bootstrap-vue/nuxt', {
      components: [
        'BAccordion',
        'BAccordionItem',
        'BAlert',
        'BButton',
        'BButtonGroup',
        'BCol',
        'BContainer',
        'BDropdown',
        'BDropdownItem',
        'BDropdownDivider',
        'BForm',
        'BFormGroup',
        'BFormInput',
        'BFormSelect',
        'BFormCheckbox',
        'BFormFile',
        'BFormTextarea',
        'BModal',
        'BRow',
        'BSpinner',
        'BToast'
      ],
      directives: ['VBHover'],
      plugins: ['ToastPlugin', 'ModalPlugin']
    }],
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // Environment variables
    '@nuxtjs/dotenv'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/'
  },


  // Environment variables
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY
  },

  // Server middleware for API routes
  serverMiddleware: [
    { path: '/api/dalle', handler: '~/api/dalle/generate.js' }
  ]
}
