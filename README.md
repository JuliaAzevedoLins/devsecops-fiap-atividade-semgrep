# devsecops-fiap-atividade-semgrep

- **Aluna:** JULIA AZEVEDO LINS
- **RM:** 98690
- **Turma:** 4ESPY

Laboratório da Aula 17 de DevSecOps (FIAP): *Shift Left na prática – Semgrep, Gitleaks e o pipeline que barra vulnerabilidade*.

## O que tem aqui

- `.github/workflows/security.yml`: pipeline **Security Scan** com dois guardas:
  - **Gitleaks** (secret scanning): procura segredos no histórico do Git.
  - **Semgrep** (SAST): análise estática do código em busca de vulnerabilidades.
- `config.js`: chave AWS **falsa**, colocada de propósito para o Gitleaks barrar o pipeline.
- `app.js`: código **propositalmente vulnerável** (Command Injection e `eval`), para o Semgrep detectar.

> ⚠️ Conteúdo exclusivamente educacional. Nenhuma credencial deste repositório é real.

## Evidências (aba Actions)

| Commit | Gitleaks | Semgrep | Execução |
|---|---|---|---|
| `ci: adiciona gitleaks` | ✅ passou | – | [run](https://github.com/JuliaAzevedoLins/devsecops-fiap-atividade-semgrep/actions/runs/37071671876) |
| `feat: adiciona config` (chave falsa) | ❌ barrou: regra `aws-access-token` em `config.js:1` | – | [run](https://github.com/JuliaAzevedoLins/devsecops-fiap-atividade-semgrep/actions/runs/37071708988) |
| `ci: adiciona semgrep` | ✅ passou | ❌ barrou: chave AWS + actions sem SHA fixo | [run](https://github.com/JuliaAzevedoLins/devsecops-fiap-atividade-semgrep/actions/runs/37071892441) |
| `feat: adiciona app vulneravel` | ✅ passou | ❌ barrou: Command Injection, `eval`, XSS, CSRF | [run](https://github.com/JuliaAzevedoLins/devsecops-fiap-atividade-semgrep/actions/runs/37071991673) |

Observação: no evento de push, o Gitleaks analisa só os commits novos. Por isso ele voltou a passar depois do commit da chave, mesmo com ela ainda no histórico. Apagar o arquivo não resolve: com uma chave real, o certo é **revogar e rotacionar a credencial**.

## Conclusão: adaptando para a minha rotina (dados e Power BI em um banco)

Trabalho em um banco, na área de dados com Power BI. Nesse contexto, o maior risco não está em aplicações web, e sim em **credenciais e dados sensíveis espalhados pelos artefatos de dados**: strings de conexão com senha em scripts Python/SQL e em parâmetros do Power Query, tokens de Databricks e chaves de Azure Storage em notebooks, segredos de service principal em arquivos de configuração e até CSVs de amostra com CPF e número de conta. Num banco, um vazamento desses é incidente de segurança e também de **LGPD** e de conformidade com a **Resolução CMN 4.893** (política de segurança cibernética).

**Pré-requisito: versionar tudo no Git.** O `.pbix` é binário e nenhuma das duas ferramentas consegue analisá-lo. Por isso, a adaptação começa salvando os relatórios no formato **PBIP (Power BI Project)**, que grava o modelo semântico (TMDL) e as consultas Power Query em arquivos de texto, junto com os scripts de ETL e os notebooks, no mesmo repositório.

**Gitleaks (secret scanning)**
- **Na máquina do analista:** hook de pre-commit (`gitleaks protect --staged`) que impede o commit de sair com segredo. É o *shift left* de verdade, porque o erro é pego antes de chegar ao servidor.
- **No pipeline:** o mesmo job deste lab rodando em todo pull request para a `main`, configurado como *required check* na proteção de branch. Se falhar, o merge fica bloqueado.
- **Regras próprias** no `.gitleaks.toml`: padrões de string de conexão do SQL Server (`Password=`/`Pwd=`) e uma regra de **CPF**, para barrar dados reais de cliente em arquivos de exemplo.
- **Varredura agendada do histórico completo:** como aprendi no lab, o scan de push olha só os commits novos.
- **Processo:** credenciais ficam no **Azure Key Vault** e no gateway/Power BI Service, nunca no arquivo. Se algo vazar, a resposta é revogar e rotacionar a credencial, não só apagar o arquivo.

**Semgrep (SAST)**
- Analisa os **scripts Python de ETL**: SQL montado com f-string ou concatenação (risco de SQL Injection, a correção é usar query parametrizada), `requests` com `verify=False`, uso de `eval`/`pickle` e credenciais fixas no código.
- **Regras customizadas** em YAML para padrões internos, por exemplo bloquear strings de conexão com `Encrypt=False`.
- **Adoção gradual:** começar só reportando e passar a bloquear depois de calibrar os falsos positivos. No próprio lab ele apontou as tags mutáveis das actions, um achado válido, mas que precisa de triagem para não virar ruído.

**Fluxo proposto no dia a dia**
1. Alterei um relatório ou script → o pre-commit do Gitleaks verifica localmente.
2. Abro um pull request → Gitleaks e Semgrep rodam no pipeline; se algum falhar, o merge é bloqueado.
3. Revisão por um colega do time.
4. Só o que passou segue para publicação via *deployment pipelines* do Power BI (dev → teste → produção).
5. Toda semana, uma varredura completa do histórico.

O ganho é encontrar o problema **no commit, em minutos**, em vez de descobri-lo numa auditoria ou num incidente, quando a credencial já pode ter sido usada por alguém de fora.
