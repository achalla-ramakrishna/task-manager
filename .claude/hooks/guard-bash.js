// PreToolUse guard for Bash: forces a confirmation prompt for destructive
// command shapes, regardless of permission mode (default/auto/bypass).
// Static allow/deny rules can't express "this specific pattern is dangerous"
// without also blocking the many safe variants of the same command.
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const cmd = (data.tool_input && data.tool_input.command) || '';

const patterns = [
  /git\s+push[^\n]*--force/,
  /git\s+reset\s+--hard/,
  /git\s+clean\s+-[a-z]*f/,
  /rm\s+-rf\s+/,
  /\bDROP\s+(DATABASE|TABLE|SCHEMA)\b/i,
  /\bTRUNCATE\s+TABLE\b/i,
  /mvn[^\n]*\bdeploy\b/,
  /--dangerously-skip-permissions/,
];

const hit = patterns.find((r) => r.test(cmd));
if (hit) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        `Guardrail: command matches a destructive pattern (${hit}) and always requires explicit confirmation.`,
    },
  }));
}
process.exit(0);
