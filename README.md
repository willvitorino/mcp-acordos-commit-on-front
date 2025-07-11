# MCP Acordos Commit Generator

Este é um servidor MCP (Model Context Protocol) que gera mensagens de commit seguindo as regras específicas do projeto Softplan, usando Gitmoji e seguindo convenções brasileiras.

## Instalação

1. **Instalar dependências:**
```bash
npm install
# ou
yarn install
```

2. **Compilar o projeto:**
```bash
npm run build
# ou
yarn build
```

## Configuração no Claude Desktop

Para usar este MCP com o Claude Desktop, você precisa configurar o arquivo de configuração:

### Linux/Mac
Edite o arquivo `~/.config/claude-desktop/config.json`:

```json
{
  "mcpServers": {
    "mcp-acordos-commit-generator": {
      "command": "node",
      "args": ["/caminho/absoluto/para/mcp-acordos-commit-on-front/dist/index.js"]
    }
  }
}
```

### Windows
Edite o arquivo `%APPDATA%\Claude\claude-desktop\config.json`:

```json
{
  "mcpServers": {
    "mcp-acordos-commit-generator": {
      "command": "node",
      "args": ["C:\\caminho\\absoluto\\para\\mcp-acordos-commit-on-front\\dist\\index.js"]
    }
  }
}
```

**Importante:** Substitua `/caminho/absoluto/para/mcp-acordos-commit-on-front` pelo caminho real onde você clonou este projeto.

## Como Usar

Depois de configurar o MCP, você pode usar a função `gerar_commit` no Claude Desktop:

### Exemplo de uso:

```
Use a função gerar_commit para criar uma mensagem de commit com:
- alteracoes: "Adicionou validação de CPF no formulário"
- arquivos: ["src/components/Form.vue", "src/utils/validators.ts"]
- id_task: "TASK-123"
- tipo_alteracao: "feat"
```

### Parâmetros disponíveis:

- **alteracoes** (obrigatório): Descrição das alterações realizadas
- **arquivos** (obrigatório): Lista de arquivos alterados
- **id_task** (opcional): ID da Task
- **tipo_alteracao** (opcional): Tipo da alteração para escolher o Gitmoji

### Tipos de alteração disponíveis:

| Tipo | Emoji | Descrição |
|------|-------|-----------|
| `feat` | ✨ | Nova funcionalidade |
| `fix` | 🐛 | Correção de bug |
| `docs` | 📝 | Documentação |
| `style` | 💄 | Estilo/formatação |
| `refactor` | ♻️ | Refatoração |
| `test` | ✅ | Testes |
| `chore` | 🔧 | Tarefas de manutenção |
| `perf` | ⚡️ | Performance |
| `build` | 👷 | Build/CI |
| `ci` | 💚 | CI/CD |
| `revert` | ⏪️ | Reverter |
| `remove` | 🔥 | Remover código |
| `add` | ➕ | Adicionar dependência |
| `update` | ⬆️ | Atualizar |
| `config` | 🔧 | Configuração |
| `init` | 🎉 | Inicial |
| `security` | 🔒️ | Segurança |
| `ui` | 💄 | Interface |
| `database` | 🗃️ | Database |
| `api` | 👽️ | API/Mudanças externas |
| `merge` | 🔀 | Merge |
| `hotfix` | 🚑️ | Hotfix |
| `wip` | 🚧 | Work in progress |
| `cleanup` | 🔥 | Limpeza/Remoção |

E muitos outros tipos específicos baseados na referência oficial do Gitmoji.

## Regras do Commit

O MCP segue estas regras automaticamente:

1. **Nome da branch**: Aparece apenas se começar com "SAAS-"
2. **ID da Task**: Sempre aparece quando informado
3. **Gitmoji**: Baseado no tipo de alteração
4. **Formato**: Título sucinto + descrição detalhada por arquivo
5. **Idioma**: Português do Brasil

### Exemplo de saída:

```
SAAS-123 TASK-456 ✨ Adicionou validação de CPF no formulário

**Arquivos alterados:**
- `src/components/Form.vue`: Adicionou validação de CPF no formulário
- `src/utils/validators.ts`: Adicionou validação de CPF no formulário
```

## Desenvolvimento

Para desenvolver/modificar este MCP:

```bash
# Modo de desenvolvimento
npm run dev
# ou
yarn dev

# Build para produção
npm run build
# ou
yarn build
```

## Troubleshooting

1. **Erro "Cannot find module"**: Certifique-se de que executou `npm run build` após fazer alterações
2. **MCP não aparece no Claude**: Verifique se o caminho no arquivo de configuração está correto
3. **Erro de permissão**: Certifique-se de que o arquivo `dist/index.js` tem permissões de execução

## Contribuição

Este MCP foi criado especificamente para os projetos da Softplan seguindo as convenções estabelecidas. 