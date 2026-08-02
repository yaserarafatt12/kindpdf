# Contributing to Kindpdf (Local PDF Suite)

Thank you for considering contributing to **Kindpdf**! This document provides guidelines and standards for contributing to this project.

---

## Strict Security & Privacy Mandates

As a privacy-first application, the following rules are **strictly enforced**:

> [!CAUTION]
> **Strictly Prohibited Items**:
> 1. NEVER commit API keys, service tokens, passwords, or secret credentials.
> 2. NEVER send document binary buffers or user files over network sockets or HTTP endpoints.
> 3. NEVER include third-party tracking scripts, analytics pixels, or document telemetry.
> 4. ALL PDF processing logic must execute 100% locally inside client browser RAM memory.

---

## Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/yaserarafatt12/kindpdf.git
cd kindpdf
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

### 3. Adding a New Tool
When adding a new PDF tool:
1. Define the tool interface in `src/lib/tools/manifest.ts` (Single Source of Truth).
2. Implement pure binary logic in `src/lib/pdf/yourTool.ts`.
3. Add corresponding Vitest unit tests in `tests/unit/yourTool.test.ts`.
4. Create the UI workspace component in `src/components/YourToolWorkspace.tsx`.
5. Mount the workspace view in `src/app/page.tsx`.

---

## Testing Requirements

All submissions must pass automated unit tests:

```bash
# Run unit tests
npm test

# Run build check
npm run build
```

---

## Commit Message Format

Follow Conventional Commits format:
- `feat(scope)`: New feature addition
- `fix(scope)`: Bug fix
- `style(scope)`: CSS or layout adjustment
- `docs(scope)`: Documentation updates
- `test(scope)`: Adding or updating unit tests

---

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
