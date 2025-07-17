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

interface GitChanges {
  files: string[];
  changeType: string;
  description: string;
  isClean: boolean;
}

interface GitAnalysis {
  changes: GitChanges;
  branch: string;
  logs: string[];
}

class CommitGeneratorServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-acordos-commit-generator',
        version: '2.0.0',
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
            description: 'Gera mensagem de commit automaticamente analisando as alterações no repositório Git',
            inputSchema: {
              type: 'object',
              properties: {
                working_directory: {
                  type: 'string',
                  description: 'Diretório de trabalho do projeto (OBRIGATÓRIO - deve ser um repositório Git válido)'
                },
                id_task: {
                  type: 'string',
                  description: 'ID da Task (opcional - será incluído no commit se fornecido)'
                },
                // Parâmetros opcionais para compatibilidade com API anterior
                alteracoes: {
                  type: 'string',
                  description: 'Descrição manual das alterações (opcional - se não fornecido, será detectado automaticamente)'
                },
                arquivos: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Lista manual de arquivos alterados (opcional - se não fornecido, será detectado automaticamente)'
                },
                tipo_alteracao: {
                  type: 'string',
                  enum: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'build', 'ci', 'revert', 'remove', 'add', 'update', 'config', 'init', 'security', 'ui', 'database', 'api', 'merge', 'hotfix', 'wip', 'cleanup', 'art', 'rocket', 'bookmark', 'rotating_light', 'package', 'boom', 'memo', 'truck', 'wrench', 'hammer', 'lock', 'arrow_up', 'arrow_down', 'pushpin', 'construction_worker', 'chart_with_upwards_trend', 'recycle', 'heavy_plus_sign', 'heavy_minus_sign', 'globe_with_meridians', 'pencil2', 'rewind', 'twisted_rightwards_arrows', 'alien', 'page_facing_up', 'bento', 'wheelchair', 'bulb', 'speech_balloon', 'card_file_box', 'loud_sound', 'mute', 'busts_in_silhouette', 'children_crossing', 'building_construction', 'iphone', 'clown_face', 'egg', 'see_no_evil', 'camera_flash', 'alembic', 'mag', 'label', 'seedling', 'triangular_flag_on_post', 'goal_net', 'dizzy', 'wastebasket', 'passport_control', 'adhesive_bandage', 'monocle_face', 'coffin', 'test_tube', 'necktie', 'stethoscope', 'bricks', 'technologist', 'money_with_wings', 'thread', 'safety_vest', 'airplane'],
                  description: 'Tipo manual da alteração (opcional - se não fornecido, será inferido automaticamente)'
                }
              },
              required: ['working_directory']
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
      const { working_directory, id_task, alteracoes, arquivos, tipo_alteracao } = args;
      
      // Validar parâmetro obrigatório
      if (!working_directory || typeof working_directory !== 'string' || working_directory.trim().length === 0) {
        throw new Error('Parâmetro "working_directory" é obrigatório e deve ser um caminho válido');
      }
      
      // Analisar mudanças no Git automaticamente
      const analysis = this.analyzeGitRepository(working_directory);
      
      // Usar parâmetros manuais se fornecidos, senão usar detecção automática
      const finalAlteracoes = alteracoes || analysis.changes.description;
      const finalArquivos = arquivos || analysis.changes.files;
      const finalTipoAlteracao = tipo_alteracao || analysis.changes.changeType;
      
      // Verificar se há mudanças para commitar
      if (analysis.changes.isClean && !alteracoes) {
        return {
          content: [
            {
              type: 'text',
              text: `⚡ **Repositório Limpo**\n\nNão há alterações para commitar no repositório.\n\n💡 **Dica**: Faça algumas alterações e adicione ao stage (git add) antes de gerar o commit.`
            }
          ]
        };
      }
      
      // Gerar mensagem de commit
      const commitMessage = this.generateCommitMessage(
        finalAlteracoes,
        finalArquivos,
        id_task,
        finalTipoAlteracao,
        analysis.branch
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
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Erro ao gerar commit**: ${errorMessage}`
          }
        ],
        isError: true
      };
    }
  }

  private analyzeGitRepository(workingDirectory: string): GitAnalysis {
    const logs: string[] = [];
    
    // Detectar branch atual
    const branchInfo = this.getCurrentBranchWithDebug(workingDirectory);
    logs.push(...branchInfo.logs);
    
    // Detectar mudanças
    const changes = this.detectGitChanges(workingDirectory, logs);
    
    return {
      changes,
      branch: branchInfo.branch,
      logs
    };
  }

  private detectGitChanges(workingDirectory: string, logs: string[]): GitChanges {
    try {
      // Primeiro, vamos verificar o diretório de trabalho
      logs.push(`Analisando mudanças no diretório: ${workingDirectory}`);
      
      const options: any = {
        encoding: 'utf8',
        timeout: 10000,
        stdio: ['ignore', 'pipe', 'ignore'],
        cwd: workingDirectory
      };

            // Detectar arquivos modificados usando múltiplos comandos
      let allFiles: string[] = [];
      
      try {
        // 1. Arquivos modificados (staged e unstaged)
        try {
          const modifiedFiles = execSync('git diff --name-only HEAD', options).trim();
          if (modifiedFiles) {
            allFiles.push(...modifiedFiles.split('\n').filter(f => f.trim()));
          }
          logs.push(`Arquivos modificados detectados: ${modifiedFiles ? modifiedFiles.split('\n').length : 0}`);
        } catch (error) {
          logs.push(`Erro ao detectar arquivos modificados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
        
        // 2. Arquivos staged
        try {
          const stagedFiles = execSync('git diff --cached --name-only', options).trim();
          if (stagedFiles) {
            const staged = stagedFiles.split('\n').filter(f => f.trim());
            // Adicionar apenas se não estiver já na lista
            staged.forEach(file => {
              if (!allFiles.includes(file)) {
                allFiles.push(file);
              }
            });
          }
          logs.push(`Arquivos staged detectados: ${stagedFiles ? stagedFiles.split('\n').length : 0}`);
        } catch (error) {
          logs.push(`Erro ao detectar arquivos staged: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
        
        // 3. Arquivos untracked (com tratamento especial para encoding)
        try {
          const untrackedOutput = execSync('git ls-files --others --exclude-standard', options).trim();
          if (untrackedOutput) {
            const untracked = untrackedOutput.split('\n').filter(f => f.trim());
            untracked.forEach(file => {
              if (!allFiles.includes(file)) {
                allFiles.push(file);
              }
            });
          }
          logs.push(`Arquivos untracked detectados: ${untrackedOutput ? untrackedOutput.split('\n').length : 0}`);
        } catch (error) {
          logs.push(`Erro ao detectar arquivos untracked: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
        
        logs.push(`Total de arquivos detectados: ${allFiles.length}`);
        
      } catch (error) {
        logs.push(`Erro geral ao detectar alterações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        return {
          files: [],
          changeType: 'default',
          description: 'Não foi possível detectar alterações',
          isClean: true
        };
      }

            if (allFiles.length === 0) {
        logs.push('Working directory clean - nenhuma alteração detectada');
        return {
          files: [],
          changeType: 'default',
          description: 'Working directory clean',
          isClean: true
        };
      }

      // Processar e decodificar nomes dos arquivos
      const files: string[] = [];
      
      for (const filename of allFiles) {
        if (filename) {
          // Aplicar limpeza diretamente
          const cleanedFilename = this.cleanFilename(filename.trim());
          
          if (cleanedFilename && !files.includes(cleanedFilename)) {
            files.push(cleanedFilename);
          }
        }
      }

      // Inferir tipo de alteração baseado nos arquivos
      const changeType = this.inferChangeType(files, logs);
      
      // Gerar descrição das alterações
      const description = this.generateChangeDescription(files, changeType, workingDirectory, logs);

      return {
        files,
        changeType,
        description,
        isClean: false
      };

    } catch (error) {
      logs.push(`Erro inesperado ao detectar mudanças: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return {
        files: [],
        changeType: 'default',
        description: 'Erro ao detectar alterações',
        isClean: true
      };
    }
  }

  private inferChangeType(files: string[], logs: string[]): string {
    if (files.length === 0) {
      return 'default';
    }

    const patterns = {
      // Documentação
      docs: files.some(f => /\.(md|txt|rst|pdf|doc)$/i.test(f) || f.includes('README') || f.includes('CHANGELOG')),
      
      // Testes
      test: files.some(f => /\.(test|spec)\./i.test(f) || f.includes('test') || f.includes('spec')),
      
      // Configuração
      config: files.some(f => /\.(json|yml|yaml|xml|ini|conf|config)$/i.test(f) || 
                            f.includes('package.json') || f.includes('tsconfig') || 
                            f.includes('.env') || f.includes('webpack') || f.includes('vite')),
      
      // Build/CI
      build: files.some(f => f.includes('Dockerfile') || f.includes('.github') || 
                          f.includes('package.json') || f.includes('yarn.lock') || 
                          f.includes('package-lock.json') || f.includes('pnpm-lock')),
      
      // Estilos/UI
      style: files.some(f => /\.(css|scss|sass|less|styl)$/i.test(f)),
      ui: files.some(f => /\.vue$/i.test(f) || f.includes('component') || f.includes('page')),
      
      // Performance
      perf: files.some(f => f.includes('performance') || f.includes('optimize') || f.includes('cache')),
      
      // Segurança
      security: files.some(f => f.includes('auth') || f.includes('security') || f.includes('permission')),
      
      // Database
      database: files.some(f => /\.(sql|migration)$/i.test(f) || f.includes('database') || f.includes('db')),
      
      // Refatoração (múltiplos arquivos de código)
      refactor: files.length > 3 && files.some(f => /\.(ts|js|vue|py|java|cs)$/i.test(f))
    };

    // Prioridade na verificação
    if (patterns.docs) {
      logs.push('Tipo inferido: docs (arquivos de documentação detectados)');
      return 'docs';
    }
    if (patterns.test) {
      logs.push('Tipo inferido: test (arquivos de teste detectados)');
      return 'test';
    }
    if (patterns.config && !patterns.refactor) {
      logs.push('Tipo inferido: config (arquivos de configuração detectados)');
      return 'config';
    }
    if (patterns.build) {
      logs.push('Tipo inferido: build (arquivos de build/dependências detectados)');
      return 'build';
    }
    if (patterns.security) {
      logs.push('Tipo inferido: security (arquivos relacionados à segurança detectados)');
      return 'security';
    }
    if (patterns.database) {
      logs.push('Tipo inferido: database (arquivos de banco de dados detectados)');
      return 'database';
    }
    if (patterns.perf) {
      logs.push('Tipo inferido: perf (arquivos relacionados à performance detectados)');
      return 'perf';
    }
    if (patterns.style && !patterns.ui) {
      logs.push('Tipo inferido: style (apenas arquivos de estilo detectados)');
      return 'style';
    }
    if (patterns.refactor) {
      logs.push('Tipo inferido: refactor (múltiplos arquivos de código detectados)');
      return 'refactor';
    }
    if (patterns.ui) {
      logs.push('Tipo inferido: ui (componentes/páginas Vue detectados)');
      return 'ui';
    }

    // Padrão para poucos arquivos de código
    if (files.length <= 3 && files.some(f => /\.(ts|js|vue|py|java|cs)$/i.test(f))) {
      logs.push('Tipo inferido: feat (poucos arquivos de código - assumindo nova funcionalidade)');
      return 'feat';
    }

    logs.push('Tipo inferido: default (não foi possível determinar tipo específico)');
    return 'default';
  }

  private generateChangeDescription(files: string[], changeType: string, workingDirectory: string, logs: string[]): string {
    const fileCount = files.length;
    
    // Tentar obter mais detalhes do diff
    let diffSummary = '';
    try {
      const options: any = {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['ignore', 'pipe', 'ignore'],
        cwd: workingDirectory
      };
      
      // Pegar estatísticas do diff
      const diffStats = execSync('git diff --stat', options).trim();
      const diffStatsCached = execSync('git diff --cached --stat', options).trim();
      
      const allDiffStats = [diffStats, diffStatsCached].filter(Boolean).join('\n');
      
      if (allDiffStats) {
        // Extrair informações básicas do diff stats
        const lines = allDiffStats.split('\n');
        const summaryLine = lines[lines.length - 1];
        
        if (summaryLine.includes('changed')) {
          diffSummary = summaryLine;
          logs.push(`Estatísticas do diff obtidas: ${summaryLine}`);
        }
      }
    } catch (error) {
      logs.push(`Não foi possível obter diff stats: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    // Gerar descrição baseada no tipo e arquivos
    const descriptions: Record<string, string> = {
      feat: `Implementação de nova funcionalidade em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      fix: `Correção de bug${fileCount > 1 ? 's' : ''} em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      docs: `Atualização da documentação em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      style: `Ajustes de estilo e formatação em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      refactor: `Refatoração de código em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      test: `Atualização de testes em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      chore: `Tarefas de manutenção em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      perf: `Otimização de performance em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      build: `Alterações no sistema de build em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      ci: `Configuração de CI/CD em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      config: `Configuração do projeto em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      security: `Melhorias de segurança em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      ui: `Atualização da interface em ${fileCount} componente${fileCount > 1 ? 's' : ''}`,
      database: `Alterações no banco de dados em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`,
      default: `Alterações em ${fileCount} arquivo${fileCount > 1 ? 's' : ''}`
    };

    let description = descriptions[changeType] || descriptions.default;
    
    // Adicionar contexto dos arquivos mais relevantes
    if (fileCount <= 3) {
      const mainFiles = files.slice(0, 3).map(f => {
        const filename = f.split('/').pop() || f;
        return this.cleanFilename(filename);
      }).join(', ');
      description += ` (${mainFiles})`;
    } else if (fileCount <= 10) {
      description += ` incluindo componentes principais`;
    } else {
      description += ` em refatoração ampla`;
    }

    logs.push(`Descrição gerada: ${description}`);
    return description;
  }

  private getCurrentBranchWithDebug(workingDirectory?: string): { branch: string, logs: string[] } {
    const logs: string[] = [];
    
    try {
      // Tentar o comando moderno primeiro (Git ≥ 2.22)
      let branch = '';
      
      logs.push(`Tentando detectar branch no diretório: ${workingDirectory || 'atual'}`);
      
      try {
        const options: any = {
          encoding: 'utf8',
          timeout: 5000,
          stdio: ['ignore', 'pipe', 'ignore']
        };
        if (workingDirectory) {
          options.cwd = workingDirectory;
        }
        branch = execSync('git branch --show-current', options).trim();
        logs.push(`Branch detectada (comando moderno): '${branch}'`);
      } catch (modernError) {
        logs.push(`Comando moderno falhou: ${modernError instanceof Error ? modernError.message : 'Erro desconhecido'}`);
        // Fallback para comando compatível com versões antigas
        try {
          const options: any = {
            encoding: 'utf8',
            timeout: 5000,
            stdio: ['ignore', 'pipe', 'ignore']
          };
          if (workingDirectory) {
            options.cwd = workingDirectory;
          }
          const output = execSync('git rev-parse --abbrev-ref HEAD', options).trim();
          logs.push(`Branch detectada (comando fallback): '${output}'`);
          
          // Verificar se não está em detached HEAD
          if (output !== 'HEAD') {
            branch = output;
          }
        } catch (fallbackError) {
          logs.push(`Comando fallback falhou: ${fallbackError instanceof Error ? fallbackError.message : 'Erro desconhecido'}`);
          // Último recurso: verificar se estamos em um repositório git
          try {
            const options: any = {
              timeout: 2000,
              stdio: ['ignore', 'pipe', 'ignore']
            };
            if (workingDirectory) {
              options.cwd = workingDirectory;
            }
            execSync('git rev-parse --git-dir', options);
            logs.push('Git detectado, mas não foi possível obter branch atual');
          } catch {
            const dirInfo = workingDirectory ? ` no diretório ${workingDirectory}` : '';
            logs.push(`Não foi possível obter branch: não é um repositório git válido${dirInfo}`);
          }
        }
      }

      logs.push(`Branch antes da sanitização: '${branch}'`);

      // Validar e sanitizar o nome da branch
      if (branch) {
        const originalBranch = branch;
        branch = branch.replace(/[^\w\-./]/g, '').substring(0, 50);
        logs.push(`Branch após sanitização: '${branch}' (era: '${originalBranch}')`);
        
        // Verificar se ainda é uma branch válida após sanitização
        if (branch.length === 0) {
          logs.push('Nome da branch contém caracteres inválidos');
          return { branch: '', logs };
        }
      }

      logs.push(`Branch final retornada: '${branch}'`);
      return { branch, logs };
    } catch (error) {
      const dirInfo = workingDirectory ? ` no diretório ${workingDirectory}` : '';
      logs.push(`Erro inesperado ao obter branch atual${dirInfo}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { branch: '', logs };
    }
  }

  private generateFileSpecificDescription(arquivo: string, tipoAlteracao: string): string {
    const fileName = arquivo.split('/').pop()?.toLowerCase() || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Descrições específicas baseadas no tipo de arquivo e alteração
    if (fileName.includes('readme') || fileName.includes('changelog')) {
      return 'Atualização da documentação principal';
    }
    
    if (extension === 'md') {
      return 'Atualização da documentação';
    }
    
    if (extension === 'ts' || extension === 'js') {
      const descriptions: Record<string, string> = {
        feat: 'Implementação de nova funcionalidade',
        fix: 'Correção de bug',
        refactor: 'Refatoração do código',
        perf: 'Otimização de performance',
        style: 'Ajustes de formatação',
        test: 'Atualização de testes',
        chore: 'Manutenção do código',
        config: 'Configuração do projeto'
      };
      return descriptions[tipoAlteracao] || 'Alterações no código';
    }
    
    if (extension === 'vue') {
      return tipoAlteracao === 'ui' ? 'Melhoria na interface' : 'Atualização do componente';
    }
    
    if (extension === 'json' || extension === 'yml' || extension === 'yaml') {
      return 'Atualização de configuração';
    }
    
    if (extension === 'css' || extension === 'scss' || extension === 'sass') {
      return 'Ajustes de estilo';
    }
    
    // Descrição padrão
    return 'Alterações no arquivo';
  }

  private decodeGitFilename(filename: string, logs: string[]): string {
    try {
      logs.push(`Decodificando arquivo: "${filename}"`);
      
      // Se não há caracteres de escape, retornar como está
      if (!filename.includes('\\')) {
        logs.push(`Arquivo não contém escapes: "${filename}"`);
        return filename;
      }
      
      // Usar uma abordagem mais simples para decodificar
      let result = filename;
      
      // Substituir sequências octais comuns para caracteres UTF-8
      // \303\207 = Ç, \303\225 = Õ
             const octalMap: Record<string, string> = {
         '\\303\\207': 'Ç',
         '\\303\\225': 'Õ',
         '\\303\\241': 'á',
         '\\303\\243': 'ã',
         '\\303\\240': 'à',
         '\\303\\242': 'â',
         '\\303\\251': 'é',
         '\\303\\252': 'ê',
         '\\303\\255': 'í',
         '\\303\\263': 'ó',
         '\\303\\265': 'õ',
         '\\303\\244': 'ä',
         '\\303\\247': 'ç',
         '\\303\\261': 'ñ',
         '\\303\\274': 'ü'
       };
      
      // Aplicar mapeamento conhecido
      for (const [octal, char] of Object.entries(octalMap)) {
        result = result.replace(new RegExp(octal, 'g'), char);
      }
      
      // Fallback: tentar decodificação geral para sequências não mapeadas
      result = result.replace(/\\([0-7]{3})/g, (match, octal) => {
        try {
          const byte = parseInt(octal, 8);
          // Se é um byte válido UTF-8, tentar convertê-lo
          if (byte >= 32 && byte <= 126) {
            return String.fromCharCode(byte);
          }
          return match; // Manter original se não conseguir converter
        } catch {
          return match;
        }
      });
      
      logs.push(`Arquivo decodificado de "${filename}" para "${result}"`);
      return result;
      
    } catch (error) {
      logs.push(`Erro ao decodificar "${filename}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return filename; // Retorna o original em caso de erro
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
      // Validação adicional do formato da branch SAAS
      if (currentBranch.match(/^SAAS-\d+/)) {
        titulo += `${currentBranch} `;
      }
    }
    
    // 2. Adicionar ID da Task se fornecido (sempre, independente da branch)
    if (idTask) {
      // Validar formato do ID da task
      const sanitizedTaskId = idTask.trim().replace(/[^\w-]/g, '');
      if (sanitizedTaskId.length > 0) {
        titulo += `${sanitizedTaskId} `;
      }
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
        // Decodificar nome do arquivo se necessário
        let arquivoLimpo = this.cleanFilename(arquivo);
        
        // Gerar descrição específica baseada no tipo de arquivo
        const descricaoArquivo = this.generateFileSpecificDescription(arquivoLimpo, tipoAlteracao);
        descricao += `- \`${arquivoLimpo}\`: ${descricaoArquivo}\n`;
      });
    }
    
    // Retornar mensagem em formato markdown
    return `\`\`\`
${titulo}${descricao}
\`\`\``;
  }

  private cleanFilename(filename: string): string {
    try {
      let cleaned = filename;
      
      // Remover aspas se presentes
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
          (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
      }
      
      // Se contém sequências octais, converter para UTF-8
      if (cleaned.includes('\\3')) {
        // Converter \303\207 etc para bytes e depois para UTF-8
        cleaned = cleaned.replace(/\\([0-7]{3})/g, (_, octal) => {
          const byte = parseInt(octal, 8);
          return String.fromCharCode(byte);
        });
        
        // Tentar interpretar como UTF-8 usando Buffer
        try {
          const bytes = [];
          for (let i = 0; i < cleaned.length; i++) {
            bytes.push(cleaned.charCodeAt(i));
          }
          const buffer = Buffer.from(bytes);
          cleaned = buffer.toString('utf8');
        } catch {
          // Se falhar, aplicar mapeamento manual
          cleaned = filename
            .replace(/\\303\\207/g, 'Ç')
            .replace(/\\303\\225/g, 'Õ')
            .replace(/["']/g, '');
        }
      }
      
      // Remover caracteres problemáticos para formatação
      cleaned = cleaned.replace(/[`'"]/g, '');
      
      return cleaned;
    } catch {
      // Em caso de erro, retornar uma versão simplificada
      return filename
        .replace(/\\303\\207/g, 'Ç')
        .replace(/\\303\\225/g, 'Õ')
        .replace(/["'`\\]/g, '');
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Acordos Commit Generator iniciado');
  }
}

const server = new CommitGeneratorServer();
server.run().catch(console.error); // Teste de funcionalidade automática
