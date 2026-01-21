import readline from 'readline';
import * as admin from 'firebase-admin';
import { generatePlan, synthesizeFinalMessage } from '../src/alfred/openaiClient';
import { executeTool, sanitizeToolResult } from '../src/alfred/toolRouter';
import { requiresConfirmation } from '../src/alfred/policy';

admin.initializeApp();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q: string) {
  return new Promise<string>((resolve) => rl.question(q, resolve));
}

async function main() {
  const message = await ask('User: ');
  const { plan } = await generatePlan({ userMessage: message });
  console.log('\nPlan:', JSON.stringify(plan, null, 2));

  if (plan.proposed_action?.confirmationRequired || plan.recommended_next_tool_calls.length === 0) {
    console.log('\nPending confirmation or no tools to run.');
    rl.close();
    return;
  }

  const toolCalls = plan.recommended_next_tool_calls.slice(0, 3);
  const outputs = [] as any[];
  for (const call of toolCalls) {
    if (requiresConfirmation(call.tool)) continue;
    const output = await executeTool(call, { correlationId: 'cli', userId: undefined, sessionId: 'cli', confirmed: true } as any);
    outputs.push({ tool: call.tool, output: sanitizeToolResult(output) });
  }

  console.log('\nTool outputs:', JSON.stringify(outputs, null, 2));
  const finalMsg = await synthesizeFinalMessage({ userMessage: message, plan, toolCalls, toolResults: outputs });
  console.log('\nAssistant:', finalMsg);
  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  rl.close();
});
