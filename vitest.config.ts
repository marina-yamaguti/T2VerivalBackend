import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
  },
  test: {
    globals: true, // Habilita o uso de variáveis globais no contexto de teste
    environment: 'node', // Define o ambiente de execução dos testes como Node.js
    // Exclui diretórios que não devem ser processados pelo Vitest
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
    ],
    // Otimizações adicionais podem ser configuradas aqui
    deps: {
      inline: [/tslib/],
    },
  },
})
