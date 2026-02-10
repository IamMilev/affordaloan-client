# i18n Check

Audit translation files for missing or untranslated keys.

**Allowed tools:** Read, Bash, Write, Edit.

## Steps

1. Read `messages/bg.json` and `messages/en.json`.
2. Compare the two files and report:
   - **Missing from bg.json**: keys present in en.json but not in bg.json.
   - **Missing from en.json**: keys present in bg.json but not in en.json.
   - **Possibly untranslated**: keys where bg.json and en.json have identical values.
3. When reporting identical values, **exclude** these legitimate cases:
   - Currency symbols and codes (e.g. "BGN", "EUR", "€", "лв.")
   - Email address placeholders (e.g. "email@example.com")
   - Brand names (e.g. "AffordaLoan")
   - Numbers or numeric formats
   - URLs
   - Single-character values
4. Present findings as a clear summary with key paths.
5. **Ask the user** before making any fixes. Do not auto-fix.
   - If the user approves, add missing keys with a TODO placeholder value (e.g. `"TODO: translate"`) or fix untranslated values as directed.
