# Contributing

Thanks for your interest in improving this project.

## How to contribute

1. Fork the repository.
2. Create a branch for your change.
3. Make your edits and add tests when behavior changes.
4. Run the test suite and relevant checks.
5. Open a pull request with a clear description of the change.

## Development expectations

- Keep changes focused and backward-compatible when possible.
- Add or update tests for public behavior changes.
- Update documentation when user-facing behavior changes.
- Follow the existing TypeScript and n8n community node conventions.

## Local checks

Before submitting, run:

- `npm test -- --runInBand`
- `npm run lint`
- `npm run build` when you change runtime code

## Reporting issues

If you find a bug, please include:

- the n8n version
- the Close CRM node version
- the affected operation/resource
- a minimal reproduction example
- the error message or API response

## Pull request tips

- Link the related issue if one exists.
- Describe the user-visible impact.
- Mention any manual verification you performed.
