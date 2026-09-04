import type { DemoEvent, Scenario } from './events.js';
import { CUSTOMER, REQUEST } from './support.js';

type TimedEvent = { at: number; e: DemoEvent };

const P = 'toolu_rehearsal_produce';
const FI = 'toolu_rehearsal_fish';
const W = 'toolu_rehearsal_wine';
const S = 'toolu_rehearsal_planner';

const researchPrompt = [
  'Sourcing question: "What will next season\'s tasting menu cost to source, per course?"',
  '',
  'You are the head chef and the coordinator. Your job is to produce a truthful, coverage-annotated sourcing plan.',
  'The requested courses are produce, fish, and wine.',
  '',
  'First, spawn these three buyers in parallel in one response:',
  '- produce-buyer: sources/produce.md',
  '- fish-buyer: sources/fish.md',
  '- wine-buyer: sources/wine.md',
  'Pass each buyer its market file, the sourcing question, its exact output fields, and the rule that it must not read another market.',
  '',
  'When all three notes return, check coverage. Then spawn menu-planner with the full buyer notes, including any structured failure context.',
  'Keep all communication through you. Buyers never call one another.',
  'If a note is partial, keep the completed work and mark that course PARTIAL COVERAGE in the final plan.',
  'If two suppliers quote different prices, keep both with supplier name and quote date. Do not pick one.',
  'Do not invent a price, silently drop a missing market, or return raw packet dumps.',
].join('\n');

const plannerPrompt = [
  'Turn these buyer notes into a coverage-annotated sourcing plan.',
  'Return KEY FINDINGS first, then one section per course with supplier, price, quote date, and a coverage label.',
  'PRODUCE NOTE: status completed; source_id PRODUCE-2026-08; quotes: heirloom tomatoes Valley Farm $4.20/kg quoted 2026-08-28, heirloom tomatoes Rossi Brothers $3.60/kg quoted 2026-07-30 (conflict_detected: true, possible_explanation: quote dates differ by a month, summer glut), basil Valley Farm $18.00/kg quoted 2026-08-28, squash blossoms Valley Farm $0.90 each until 2026-09-20; limits: two tomato quotes, chef must decide.',
  'FISH NOTE: status partial_failure; failure_type source_timeout; attempted_query "autumn fish quotes for the tasting menu"; partial_results []; alternative_approaches ["ask the secondary fishmonger", "retry tomorrow morning"]; coverage_impact "the fish course is not sourced".',
  'WINE NOTE: status completed; source_id WINE-2026-09; quotes: Verdicchio 2024 Hillside Cellars $132.00/case quoted 2026-09-01, Nebbiolo 2021 Piedmont Imports $312.00/case quoted 2026-09-01 (minimum three cases); limits: quotes valid 14 days from 2026-09-01.',
  'Preserve partial failures. Never turn a timeout into an empty result or fill a gap from memory. Keep both tomato quotes with supplier and date.',
].join('\n');

const menuPlan = [
  'KEY FINDINGS',
  '- Produce is sourced. Tomatoes have two quotes: Valley Farm $4.20/kg (2026-08-28) and Rossi Brothers $3.60/kg (2026-07-30). The dates differ by a month; not a contradiction. Chef decides. [PRODUCE-2026-08]',
  '- Wine is sourced. Verdicchio $132/case and Nebbiolo $312/case, both quoted 2026-09-01 and valid 14 days. [WINE-2026-09]',
  '- Fish is NOT sourced. The price desk timed out. No fish price is supported by this run.',
  '',
  'PRODUCE · FULL COVERAGE',
  'Heirloom tomatoes: Valley Farm $4.20/kg, organic, quoted 2026-08-28 · Rossi Brothers $3.60/kg, conventional, quoted 2026-07-30 · conflict kept, both shown.',
  'Basil: Valley Farm $18.00/kg, quoted 2026-08-28. Squash blossoms: $0.90 each, available until 2026-09-20.',
  '',
  'FISH · PARTIAL COVERAGE',
  'Source timeout at the fish market price desk. Attempted: "autumn fish quotes for the tasting menu".',
  'Next step: ask the secondary fishmonger, or retry tomorrow morning.',
  '',
  'WINE · FULL COVERAGE',
  'Verdicchio 2024, Hillside Cellars, $132.00/case of 12, quoted 2026-09-01.',
  'Nebbiolo 2021, Piedmont Imports, $312.00/case of 12, quoted 2026-09-01, minimum three cases.',
  'Limit: both quotes expire 14 days after 2026-09-01.',
].join('\n');

export const RESEARCH_REHEARSAL: TimedEvent[] = [
  { at: 0, e: { t: 'status', scenario: 'research', msg: 'rehearsal · no model call, replaying the back-office sourcing run' } },
  { at: 1, e: { t: 'phase', scenario: 'research', name: 'decompose', detail: 'the head chef splits the menu into three markets' } },
  { at: 2, e: { t: 'init', scenario: 'research', model: 'claude-sonnet-4-6', tools: ['Agent', 'Task', 'Read', 'Glob'] } },
  { at: 3, e: { t: 'coord_prompt', scenario: 'research', prompt: researchPrompt } },
  { at: 4, e: { t: 'coord_text', scenario: 'research', text: 'Three courses, three markets. The buyers are independent, so I will send all three at once.' } },
  { at: 5, e: { t: 'spawn', scenario: 'research', id: P, agent: 'produce-buyer', description: 'collect produce quotes', prompt: 'Read only sources/produce.md in the current market packet. Return a compact structured note with status, source_id, quote_date, quotes (supplier, item, price, date), and limits. If two suppliers quote different prices for the same item, keep both with supplier and date and set conflict_detected: true. Do not pick one. Do not read another buyer\'s packet. Do not return the full document.', tools: ['Read', 'Glob'] } },
  { at: 6, e: { t: 'spawn', scenario: 'research', id: FI, agent: 'fish-buyer', description: 'collect fish quotes', prompt: 'Read only sources/fish.md in the current market packet. If SOURCE_STATUS says unavailable, return status partial_failure, failure_type, attempted_query, partial_results, alternative_approaches, and coverage_impact. An unavailable market is not a successful empty result. Do not invent fish prices. Do not read another buyer\'s packet. Keep the note compact.', tools: ['Read', 'Glob'] } },
  { at: 7, e: { t: 'spawn', scenario: 'research', id: W, agent: 'wine-buyer', description: 'collect wine quotes', prompt: 'Read only sources/wine.md in the current market packet. Return a compact structured note with status, source_id, quote_date, quotes (supplier, item, price, date), and limits. Keep the quote validity limit and the minimum order in limits. Do not read another buyer\'s packet. Do not return the full document.', tools: ['Read', 'Glob'] } },
  { at: 8, e: { t: 'sub_tool', scenario: 'research', parentId: P, agent: 'produce-buyer', tool: 'Read', detail: 'sources/produce.md' } },
  { at: 9, e: { t: 'sub_tool', scenario: 'research', parentId: FI, agent: 'fish-buyer', tool: 'Read', detail: 'sources/fish.md' } },
  { at: 10, e: { t: 'sub_tool', scenario: 'research', parentId: W, agent: 'wine-buyer', tool: 'Read', detail: 'sources/wine.md' } },
  { at: 11, e: { t: 'sub_done', scenario: 'research', parentId: W, agent: 'wine-buyer', status: 'completed', tokens: 1180, result: '{ status: "completed", source_id: "WINE-2026-09", quote_date: "2026-09-01", quotes: [{ supplier: "Hillside Cellars", item: "Verdicchio 2024", price: "$132.00/case", date: "2026-09-01" }, { supplier: "Piedmont Imports", item: "Nebbiolo 2021", price: "$312.00/case", date: "2026-09-01" }], limits: ["quotes valid 14 days", "Nebbiolo minimum three cases"] }' } },
  { at: 12, e: { t: 'sub_done', scenario: 'research', parentId: P, agent: 'produce-buyer', status: 'completed', tokens: 1460, result: '{ status: "completed", source_id: "PRODUCE-2026-08", quote_date: "2026-08-28", quotes: [{ supplier: "Valley Farm", item: "heirloom tomatoes", price: "$4.20/kg", date: "2026-08-28" }, { supplier: "Rossi Brothers", item: "heirloom tomatoes", price: "$3.60/kg", date: "2026-07-30" }, { supplier: "Valley Farm", item: "basil", price: "$18.00/kg", date: "2026-08-28" }, { supplier: "Valley Farm", item: "squash blossoms", price: "$0.90 each", date: "2026-08-28" }], conflict_detected: true, possible_explanation: "quote dates differ by a month; July quote taken during the summer glut", limits: ["two tomato quotes kept; chef decides", "squash blossoms available until 2026-09-20"] }' } },
  { at: 13, e: { t: 'sub_done', scenario: 'research', parentId: FI, agent: 'fish-buyer', status: 'partial_failure', tokens: 690, result: '{ status: "partial_failure", failure_type: "source_timeout", attempted_query: "autumn fish quotes for the tasting menu", partial_results: [], alternative_approaches: ["ask the secondary fishmonger", "retry tomorrow morning"], coverage_impact: "the fish course is not sourced" }' } },
  { at: 14, e: { t: 'coord_text', scenario: 'research', text: 'Two markets are complete. Fish is a partial failure, not an empty success. I will pass all three notes, including that gap and both tomato quotes, to the menu planner.' } },
  { at: 15, e: { t: 'spawn', scenario: 'research', id: S, agent: 'menu-planner', description: 'write a coverage-annotated sourcing plan', prompt: plannerPrompt, tools: [] } },
  { at: 16, e: { t: 'sub_done', scenario: 'research', parentId: S, agent: 'menu-planner', status: 'completed', tokens: 1720, result: 'Drafted a sourcing plan with KEY FINDINGS first, dated supplier quotes, both tomato quotes kept, and PARTIAL COVERAGE for fish.' } },
  { at: 17, e: { t: 'final', scenario: 'research', coverage: 'partial', summary: 'The head chef kept every sourced quote and marked the missing fish market.', report: menuPlan } },
  { at: 18, e: { t: 'done', scenario: 'research', msg: 'sourcing rehearsal complete · partial coverage is visible' } },
];

const initialFacts = {
  customer_name: CUSTOMER.name,
  order_id: 'ORD-1042',
  issue_1: 'duplicate $18.00 charge',
  issue_2: '30% competitor price match',
  requested_action: 'refund duplicate charge and ask a manager about price matching',
};
const verifiedFacts = { ...initialFacts, customer_id: CUSTOMER.id };
const orderFacts = { ...verifiedFacts, order_status: 'delivered', duplicate_charge: '$18.00 confirmed' };
const trimmedOrder = { order_id: 'ORD-1042', status: 'delivered', total: '$72.00', items: '2 margherita pizzas, 1 lemon soda', return_eligible: 'duplicate charge review allowed' };
const handoff = {
  customer_id: CUSTOMER.id,
  customer_name: CUSTOMER.name,
  issue_summary: 'Duplicate charge refund completed; competitor price match needs a policy decision.',
  order_id: 'ORD-1042',
  root_cause: 'The order ledger shows a second $18.00 payment attempt.',
  actions_taken: [
    'Verified the guest with get_customer and received CUST-2048.',
    'Confirmed ORD-1042 and kept five decision fields from the ledger.',
    'Refunded the duplicate $18.00 charge.',
    'Sent the policy question to a manager with a self-contained handoff.',
  ],
  refund_amount: '$18.00',
  recommended_action: 'Ask the manager whether competitor price matching is allowed.',
  escalation_reason: 'The policy covers price drops on Basil Bistro, but says nothing about competitor prices.',
};

export const SUPPORT_REHEARSAL: TimedEvent[] = [
  { at: 0, e: { t: 'status', scenario: 'support', msg: 'rehearsal · local Basil Bistro support trace' } },
  { at: 1, e: { t: 'phase', scenario: 'support', name: 'request', detail: 'one message contains two issues' } },
  { at: 2, e: { t: 'support_request', scenario: 'support', message: REQUEST } },
  { at: 3, e: { t: 'case_facts', scenario: 'support', facts: initialFacts, update: 'facts extracted from the first message' } },
  { at: 4, e: { t: 'decompose', scenario: 'support', issues: ['duplicate-charge refund', 'competitor price-match policy gap'] } },
  { at: 5, e: { t: 'tool_attempt', scenario: 'support', tool: 'lookup_order', args: { order_id: 'ORD-1042' } } },
  { at: 6, e: { t: 'guard', scenario: 'support', tool: 'lookup_order', allowed: false, reason: 'lookup_order blocked: no verified customer yet. Call get_customer first, then retry with the customer_id it returns.' } },
  { at: 7, e: { t: 'tool_result', scenario: 'support', tool: 'lookup_order', ok: false, data: { status: 'blocked', error_type: 'precondition', message: 'lookup_order blocked: no verified customer yet. Call get_customer first, then retry with the customer_id it returns.' } } },
  { at: 8, e: { t: 'tool_attempt', scenario: 'support', tool: 'get_customer', args: { name: CUSTOMER.name } } },
  { at: 9, e: { t: 'guard', scenario: 'support', tool: 'get_customer', allowed: true, reason: 'preconditions satisfied' } },
  { at: 10, e: { t: 'tool_result', scenario: 'support', tool: 'get_customer', ok: true, data: { status: 'success', match_count: 1, customer: CUSTOMER } } },
  { at: 11, e: { t: 'case_facts', scenario: 'support', facts: verifiedFacts, update: 'verified customer_id added' } },
  { at: 12, e: { t: 'tool_attempt', scenario: 'support', tool: 'lookup_order', args: { order_id: 'ORD-1042', customer_id: CUSTOMER.id } } },
  { at: 13, e: { t: 'guard', scenario: 'support', tool: 'lookup_order', allowed: true, reason: 'preconditions satisfied' } },
  { at: 14, e: { t: 'tool_result', scenario: 'support', tool: 'lookup_order', ok: true, data: trimmedOrder, fieldsTrimmed: ['shipping_address', 'payment_method', 'tax', 'tip', 'kitchen_ticket', 'courier_route', 'placed_at', 'delivered_at', 'internal_risk_score', 'customer_note', 'restaurant_station', 'menu_version', 'payment_attempts', 'duplicate_charge'] } },
  { at: 15, e: { t: 'case_facts', scenario: 'support', facts: orderFacts, update: 'order facts added; long ledger fields stayed out' } },
  { at: 16, e: { t: 'tool_attempt', scenario: 'support', tool: 'process_refund', args: { order_id: 'ORD-1042', amount: 18, reason: 'duplicate charge' } } },
  { at: 17, e: { t: 'guard', scenario: 'support', tool: 'process_refund', allowed: true, reason: 'preconditions satisfied' } },
  { at: 18, e: { t: 'tool_result', scenario: 'support', tool: 'process_refund', ok: true, data: { status: 'success', refund_id: 'REF-771', amount: '$18.00', eta: '3–5 business days' } } },
  { at: 19, e: { t: 'tool_attempt', scenario: 'support', tool: 'escalate_to_human', args: { reason: 'competitor price-match policy gap' } } },
  { at: 20, e: { t: 'guard', scenario: 'support', tool: 'escalate_to_human', allowed: true, reason: 'the customer requested a manager for a policy question' } },
  { at: 21, e: { t: 'tool_result', scenario: 'support', tool: 'escalate_to_human', ok: true, data: { status: 'queued', queue: 'Basil Bistro managers', priority: 'normal' } } },
  { at: 22, e: { t: 'handoff', scenario: 'support', handoff } },
  { at: 23, e: { t: 'final', scenario: 'support', summary: 'Refund completed for the duplicate charge. The unsupported competitor price match was escalated with the facts a manager needs.', outcome: { refund: 'REF-771 · $18.00 · 3–5 business days', escalation: 'manager queue · competitor price-match policy gap', verified_customer: CUSTOMER.id } } },
  { at: 24, e: { t: 'done', scenario: 'support', msg: 'support rehearsal complete · refund safe, policy gap escalated' } },
];

export async function runRehearsal(
  scenario: Scenario | 'all',
  emit: (event: DemoEvent) => void,
  signal?: AbortSignal,
  stepMs = 420,
): Promise<void> {
  const streams = scenario === 'all'
    ? [...RESEARCH_REHEARSAL, ...SUPPORT_REHEARSAL]
    : scenario === 'research' ? RESEARCH_REHEARSAL : SUPPORT_REHEARSAL;
  for (const item of streams) {
    await new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new Error('stopped'));
        return;
      }
      const timer = setTimeout(resolve, stepMs);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('stopped'));
      }, { once: true });
    });
    emit(item.e);
  }
}
