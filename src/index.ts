#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  CallToolRequest 
} from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'node:child_process';

// Mapeamento de tipos de alteração para Gitmoji
const GITMOJI_MAP: Record<string, string> = {
  'feat': '✨', // Nova funcionalidade
  'fix': '🐛', // Correção de bug
  'docs': '📝', // Documentação
  'style': '💄', // Estilo/formatação
  'refactor': '♻️', // Refatoração
  'test': '✅', // Testes
  'chore': '🔧', // Tarefas de manutenção
  'perf': '⚡️', // Performance
  'build': '👷', // Build/CI
  'ci': '💚', // CI/CD
  'revert': '⏪️', // Reverter
  'remove': '🔥', // Remover código
  'add': '➕', // Adicionar dependência
  'update': '⬆️', // Atualizar
  'config': '🔧', // Configuração
  'init': '🎉', // Inicial
  'security': '🔒️', // Segurança
  'ui': '💄', // Interface
  'database': '🗃️', // Database
  'api': '👽️', // API/Mudanças externas
  'merge': '🔀', // Merge
  'hotfix': '🚑️', // Hotfix
  'wip': '🚧', // Work in progress
  'cleanup': '🔥', // Limpeza/Remoção
  'art': '🎨', // Melhorar estrutura/formato
  'rocket': '🚀', // Deploy
  'bookmark': '🔖', // Release/Tags
  'rotating_light': '🚨', // Corrigir warnings
  'package': '📦️', // Arquivos compilados
  'boom': '💥', // Breaking changes
  'memo': '📝', // Adicionar documentação
  'truck': '🚚', // Mover/renomear arquivos
  'wrench': '🔧', // Configuração
  'hammer': '🔨', // Scripts de desenvolvimento
  'lock': '🔒️', // Segurança
  'arrow_up': '⬆️', // Upgrade dependências
  'arrow_down': '⬇️', // Downgrade dependências
  'pushpin': '📌', // Pin dependências
  'construction_worker': '👷', // CI/Build
  'chart_with_upwards_trend': '📈', // Analytics
  'recycle': '♻️', // Refatoração
  'heavy_plus_sign': '➕', // Adicionar dependência
  'heavy_minus_sign': '➖', // Remover dependência
  'globe_with_meridians': '🌐', // Internacionalização
  'pencil2': '✏️', // Corrigir typos
  'rewind': '⏪️', // Reverter mudanças
  'twisted_rightwards_arrows': '🔀', // Merge branches
  'alien': '👽️', // Mudanças API externa
  'page_facing_up': '📄', // Licença
  'bento': '🍱', // Assets
  'wheelchair': '♿️', // Acessibilidade
  'bulb': '💡', // Comentários
  'speech_balloon': '💬', // Textos/literais
  'card_file_box': '🗃️', // Database
  'loud_sound': '🔊', // Logs
  'mute': '🔇', // Remover logs
  'busts_in_silhouette': '👥', // Colaboradores
  'children_crossing': '🚸', // UX/Usabilidade
  'building_construction': '🏗️', // Arquitetura
  'iphone': '📱', // Responsivo
  'clown_face': '🤡', // Mocks
  'egg': '🥚', // Easter eggs
  'see_no_evil': '🙈', // .gitignore
  'camera_flash': '📸', // Snapshots
  'alembic': '⚗️', // Experimentos
  'mag': '🔍️', // SEO
  'label': '🏷️', // Types
  'seedling': '🌱', // Seed files
  'triangular_flag_on_post': '🚩', // Feature flags
  'goal_net': '🥅', // Catch errors
  'dizzy': '💫', // Animações
  'wastebasket': '🗑️', // Deprecar código
  'passport_control': '🛂', // Autorização
  'adhesive_bandage': '🩹', // Fix simples
  'monocle_face': '🧐', // Exploração de dados
  'coffin': '⚰️', // Código morto
  'test_tube': '🧪', // Teste que falha
  'necktie': '👔', // Lógica de negócio
  'stethoscope': '🩺', // Healthcheck
  'bricks': '🧱', // Infraestrutura
  'technologist': '🧑‍💻', // Developer experience
  'money_with_wings': '💸', // Patrocínios
  'thread': '🧵', // Multithreading
  'safety_vest': '🦺', // Validação
  'airplane': '✈️', // Suporte offline
  'default': '✨' // Padrão
};

class CommitGeneratorServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-acordos-commit-generator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'gerar_commit',
            description: 'Gera mensagem de commit seguindo as regras específicas do projeto',
            inputSchema: {
              type: 'object',
              properties: {
                alteracoes: {
                  type: 'string',
                  description: 'Descrição das alterações realizadas'
                },
                arquivos: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Lista de arquivos alterados'
                },
                id_task: {
                  type: 'string',
                  description: 'ID da Task (opcional)'
                },
                tipo_alteracao: {
                  type: 'string',
                  enum: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'build', 'ci', 'revert', 'remove', 'add', 'update', 'config', 'init', 'security', 'ui', 'database', 'api', 'merge', 'hotfix', 'wip', 'cleanup', 'art', 'rocket', 'bookmark', 'rotating_light', 'package', 'boom', 'memo', 'truck', 'wrench', 'hammer', 'lock', 'arrow_up', 'arrow_down', 'pushpin', 'construction_worker', 'chart_with_upwards_trend', 'recycle', 'heavy_plus_sign', 'heavy_minus_sign', 'globe_with_meridians', 'pencil2', 'rewind', 'twisted_rightwards_arrows', 'alien', 'page_facing_up', 'bento', 'wheelchair', 'bulb', 'speech_balloon', 'card_file_box', 'loud_sound', 'mute', 'busts_in_silhouette', 'children_crossing', 'building_construction', 'iphone', 'clown_face', 'egg', 'see_no_evil', 'camera_flash', 'alembic', 'mag', 'label', 'seedling', 'triangular_flag_on_post', 'goal_net', 'dizzy', 'wastebasket', 'passport_control', 'adhesive_bandage', 'monocle_face', 'coffin', 'test_tube', 'necktie', 'stethoscope', 'bricks', 'technologist', 'money_with_wings', 'thread', 'safety_vest', 'airplane'],
                  description: 'Tipo da alteração para escolher o Gitmoji apropriado'
                }
              },
              required: ['alteracoes', 'arquivos']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      if (request.params.name === 'gerar_commit') {
        return this.handleGerarCommit(request.params.arguments);
      }
      
      throw new Error(`Função não encontrada: ${request.params.name}`);
    });
  }

  private async handleGerarCommit(args: any) {
    try {
      const { alteracoes, arquivos, id_task, tipo_alteracao = 'default' } = args;
      
      // Obter branch atual
      const currentBranch = this.getCurrentBranch();
      
      // Gerar mensagem de commit
      const commitMessage = this.generateCommitMessage(
        alteracoes,
        arquivos,
        id_task,
        tipo_alteracao,
        currentBranch
      );

      return {
        content: [
          {
            type: 'text',
            text: commitMessage
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Erro ao gerar commit: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }
        ],
        isError: true
      };
    }
  }

  private getCurrentBranch(): string {
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      return branch;
    } catch (error) {
      console.error('Erro ao obter branch atual:', error);
      return '';
    }
  }

  private generateCommitMessage(
    alteracoes: string,
    arquivos: string[],
    idTask?: string,
    tipoAlteracao: string = 'default',
    currentBranch: string = ''
  ): string {
    let titulo = '';
    
    // 1. Verificar se deve incluir nome da branch (somente se começar com "SAAS-")
    if (currentBranch && currentBranch.startsWith('SAAS-')) {
      titulo += `${currentBranch} `;
    }
    
    // 2. Adicionar ID da Task se fornecido (sempre, independente da branch)
    if (idTask) {
      titulo += `${idTask} `;
    }
    
    // 3. Adicionar Gitmoji baseado no tipo de alteração
    const gitmoji = GITMOJI_MAP[tipoAlteracao] || GITMOJI_MAP['default'];
    titulo += `${gitmoji} `;
    
    // 4. Adicionar descrição sucinta
    titulo += alteracoes;
    
    // 5. Gerar descrição detalhada por arquivo
    let descricao = '';
    if (arquivos && arquivos.length > 0) {
      descricao = '\n\n**Arquivos alterados:**\n';
      arquivos.forEach(arquivo => {
        descricao += `- \`${arquivo}\`: ${alteracoes}\n`;
      });
    }
    
    // Retornar mensagem em formato markdown
    return `\`\`\`
${titulo}${descricao}
\`\`\``;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Acordos Commit Generator iniciado');
  }
}

const server = new CommitGeneratorServer();
server.run().catch(console.error); 