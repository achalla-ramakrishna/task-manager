// PreToolUse guard for Write/Edit: blocks writing high-confidence secret
// patterns (private keys, cloud API keys) into any tracked file, catching
// an accidentally-pasted real credential before it ever hits disk.
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const input = data.tool_input || {};
const content = input.content || input.new_string || '';

const patterns = [
  /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /AIza[0-9A-Za-z\-_]{35}/,
];

const hit = patterns.find((r) => r.test(content));
if (hit) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        'Guardrail: this write contains a high-confidence secret pattern (private key or cloud API key). Remove the credential and use an environment variable instead.',
    },
  }));
}
process.exit(0);
