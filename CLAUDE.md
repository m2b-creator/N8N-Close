# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack
To be determined based on project requirements

## Commands
```bash
# Development commands will be added as project develops
# npm run dev         # Start development server
# npm run build       # Build for production
# npm run test        # Run test suite
# npm run lint        # Run ESLint
# npm run typecheck   # TypeScript type checking
# npm run format      # Format code with Prettier
```

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Application pages/routes
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── services/      # API and external service integrations
└── styles/        # Global styles and themes
```

## Development Standards

### Code Quality
- **TypeScript**: Strict type checking enabled, no `any` types
- **ESLint**: Consistent code style and error prevention
- **Prettier**: Automated code formatting
- **Comments**: JSDoc for functions, inline comments for complex logic only

### Architecture Principles
- **SOLID**: Single responsibility, open/closed, dependency inversion
- **DRY**: Don't repeat yourself - extract reusable logic
- **KISS**: Keep it simple - avoid over-engineering
- **Component boundaries**: Clear separation of concerns

### Code Style
- **Naming**: Descriptive variable/function names (camelCase for JS/TS)
- **Functions**: Single responsibility, pure functions when possible
- **Components**: Functional components with hooks
- **Imports**: Absolute imports, grouped and sorted
- **Error handling**: Explicit error boundaries and try/catch blocks

### Development Workflow
- **Debugging**: Reproduce issues first, hypothesis-driven debugging
- **Git**: Conventional commits, feature branches, automatically add files to VCS
- **Code review**: All changes reviewed before merge

## File Organization
- Export components/utilities through index.ts files
- Co-locate related files (component + styles + tests)
- Separate business logic from UI components
- Keep configuration files in project root

## Notes
- Repository uses Apache 2.0 license
- Claude Code settings configured in `.claude/settings.local.json`
- Project name: "N8N-Close"