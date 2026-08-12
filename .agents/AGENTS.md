# Rules

## Cross-Platform and Windows Compatibility
- **Always ensure compatibility with Windows OS.**
- Use cross-platform libraries/tools (e.g., `cross-env`, `rimraf`) in `package.json` scripts if environment variables or file operations are needed.
- Be mindful of file path separators (avoid hardcoding `/` when resolving paths programmatically, use `path.join`).
- Keep the overall workflow, scripts, and commands Windows-friendly.

## Language Preference
- **Always communicate with the user in Indonesian (Bahasa Indonesia).**
