# devsecops-fiap-atividade-semgrep

**Aluna:** JULIA AZEVEDO LINS
**RM:** 98690
**Turma:** 4ESPY

Laboratório da Aula 17 de DevSecOps (FIAP): *Shift Left na prática – Semgrep, Gitleaks e o pipeline que barra vulnerabilidade*.

## O que tem aqui

- `.github/workflows/security.yml`: pipeline **Security Scan** com dois guardas:
  - **Gitleaks** (secret scanning): procura segredos no histórico do Git.
  - **Semgrep** (SAST): análise estática do código em busca de vulnerabilidades.
- `config.js`: chave AWS **falsa**, colocada de propósito para o Gitleaks barrar o pipeline.
- `app.js`: código **propositalmente vulnerável** (Command Injection e `eval`), para o Semgrep detectar.

> ⚠️ Conteúdo exclusivamente educacional. Nenhuma credencial deste repositório é real.
