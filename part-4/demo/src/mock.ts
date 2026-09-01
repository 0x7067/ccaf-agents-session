import type { DemoEvent, Scenario } from './events.js';
import { CUSTOMER, REQUEST } from './support.js';

type TimedEvent = { at: number; e: DemoEvent };

const V = 'toolu_rehearsal_visual';
const M = 'toolu_rehearsal_music';
const L = 'toolu_rehearsal_litfilm';
const S = 'toolu_rehearsal_synthesis';

const researchPrompt = [
  'Research question: "How is AI changing creative industries?"',
  '',
  'You are the coordinator. Your job is to make a truthful, coverage-annotated brief.',
  'The requested coverage is visual art, music, literature, and film.',
  '',
  'First, spawn these three reporters in parallel in one response:',
  '- visual-art-researcher: sources/visual-art.md',
  '- music-researcher: sources/music.md',
  '- literature-film-researcher: sources/literature-film.md',
  'Pass each reporter its source path, research question, its exact output fields, and the rule that it must not read another packet.',
  '',
  'When all three reports return, check coverage. Then spawn synthesis-editor with the full reporter reports, including any structured failure context.',
  'Keep all communication through you. Reporters never call one another.',
  'If a report is partial, keep the completed work and mark the affected section PARTIAL COVERAGE in the final brief.',
  'Do not invent a claim, silently drop a missing source, or return raw source dumps.',
].join('\n');

const synthesisPrompt = [
  'Synthesize these reporter packets into a coverage-annotated brief.',
  'Return key_findings first, then one section per requested area with source IDs, dates, and a coverage label.',
  'VISUAL ART REPORT: status completed; source_id ART-2025-01; source_date 2025-02-14; key_findings: studios use generative tools for concept sketches and variations; limits: does not show replacement of human approval.',
  'MUSIC REPORT: status partial_failure; failure_type source_timeout; attempted_query "AI impact on music industry 2024"; partial_results []; alternative_approaches ["retry another source"]; coverage_impact "music production is not covered".',
  'LITERATURE + FILM REPORT: status completed; source_id CULTURE-2025-03; source_date 2025-03-08; key_findings: brainstorming, storyboards, translation drafts, previsualization; limits: generated drafts still need human editing.',
  'Preserve partial failures. Never turn a timeout into an empty result or fill a gap from memory.',
].join('\n');

export const RESEARCH_REHEARSAL: TimedEvent[] = [
  { at: 0, e: { t: 'status', scenario: 'research', msg: 'rehearsal · no model call, replaying the newsroom trace' } },
  { at: 1, e: { t: 'phase', scenario: 'research', name: 'decompose', detail: 'the coordinator splits the broad question into four coverage areas' } },
  { at: 2, e: { t: 'init', scenario: 'research', model: 'claude-sonnet-4-6', tools: ['Agent', 'Task', 'Read', 'Glob'] } },
  { at: 3, e: { t: 'coord_prompt', scenario: 'research', prompt: researchPrompt } },
  { at: 4, e: { t: 'coord_text', scenario: 'research', text: 'I will cover visual art, music, literature, and film. The three independent assignments can run together.' } },
  { at: 5, e: { t: 'spawn', scenario: 'research', id: V, agent: 'visual-art-researcher', description: 'check visual-art evidence', prompt: 'Read only sources/visual-art.md in the current research packet. Return a compact structured report with status, source_id, source_date, key_findings, and limits. Keep the source date and do not claim that the packet proves more than it says. Do not read another beat reporter\'s packet. Do not return the full document.', tools: ['Read', 'Glob'] } },
  { at: 6, e: { t: 'spawn', scenario: 'research', id: M, agent: 'music-researcher', description: 'check music evidence', prompt: 'Read only sources/music.md in the current research packet. If SOURCE_STATUS says unavailable, return status partial_failure, failure_type, attempted_query, partial_results, and coverage_impact. An unavailable source is not a successful empty result. Do not invent music findings. Do not read another beat reporter\'s packet. Keep the report compact.', tools: ['Read', 'Glob'] } },
  { at: 7, e: { t: 'spawn', scenario: 'research', id: L, agent: 'literature-film-researcher', description: 'check literature and film evidence', prompt: 'Read only sources/literature-film.md in the current research packet. Return a compact structured report with status, source_id, source_date, key_findings, and limits. Name literature and film separately in coverage, and keep the source date. Do not read another beat reporter\'s packet. Do not return the full document.', tools: ['Read', 'Glob'] } },
  { at: 8, e: { t: 'sub_tool', scenario: 'research', parentId: V, agent: 'visual-art-researcher', tool: 'Read', detail: 'sources/visual-art.md' } },
  { at: 9, e: { t: 'sub_tool', scenario: 'research', parentId: M, agent: 'music-researcher', tool: 'Read', detail: 'sources/music.md' } },
  { at: 10, e: { t: 'sub_tool', scenario: 'research', parentId: L, agent: 'literature-film-researcher', tool: 'Read', detail: 'sources/literature-film.md' } },
  { at: 11, e: { t: 'sub_done', scenario: 'research', parentId: V, agent: 'visual-art-researcher', status: 'completed', tokens: 1280, result: '{ status: "completed", source_id: "ART-2025-01", source_date: "2025-02-14", key_findings: ["studios use generative tools for concept sketches and variations"], limits: ["does not show replacement of human approval"] }' } },
  { at: 12, e: { t: 'sub_done', scenario: 'research', parentId: L, agent: 'literature-film-researcher', status: 'completed', tokens: 1420, result: '{ status: "completed", source_id: "CULTURE-2025-03", source_date: "2025-03-08", key_findings: ["brainstorming, storyboards, translation drafts, previsualization"], limits: ["generated drafts still need human editing"] }' } },
  { at: 13, e: { t: 'sub_done', scenario: 'research', parentId: M, agent: 'music-researcher', status: 'partial_failure', tokens: 730, result: '{ status: "partial_failure", failure_type: "source_timeout", attempted_query: "AI impact on music industry 2024", partial_results: [], alternative_approaches: ["retry another source"], coverage_impact: "music production is not covered" }' } },
  { at: 14, e: { t: 'coord_text', scenario: 'research', text: 'Two packets are complete. Music is a partial failure, not an empty success. I will pass all three reports, including that gap, to the editor.' } },
  { at: 15, e: { t: 'spawn', scenario: 'research', id: S, agent: 'synthesis-editor', description: 'write a coverage-annotated brief', prompt: synthesisPrompt, tools: [] } },
  { at: 16, e: { t: 'sub_done', scenario: 'research', parentId: S, agent: 'synthesis-editor', status: 'completed', tokens: 1890, result: 'Drafted a brief with key findings first, dated source IDs, and PARTIAL COVERAGE for music.' } },
  { at: 17, e: { t: 'final', scenario: 'research', coverage: 'partial', summary: 'The coordinator kept useful results and marked the missing music evidence.', report: 'KEY FINDINGS\n- Visual-art studios use generative tools for concepts and variations. [ART-2025-01, 2025-02-14]\n- Authors and filmmakers use them for brainstorming, storyboards, translation drafts, and previsualization. [CULTURE-2025-03, 2025-03-08]\n\nVISUAL ART · FULL COVERAGE\nHuman approval remains part of the reported workflow.\n\nLITERATURE · FULL COVERAGE\nThe review describes assisted drafting, not publication without editing.\n\nFILM · FULL COVERAGE\nThe review describes previsualization, not a finished film.\n\nMUSIC · PARTIAL COVERAGE\nThe source request timed out. No music claim is supported by this run.\nNext step: retry with an alternative source.' } },
  { at: 18, e: { t: 'done', scenario: 'research', msg: 'research rehearsal complete · partial coverage is visible' } },
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
  { at: 6, e: { t: 'guard', scenario: 'support', tool: 'lookup_order', allowed: false, reason: 'lookup_order is blocked until get_customer returns one verified customer_id' } },
  { at: 7, e: { t: 'tool_result', scenario: 'support', tool: 'lookup_order', ok: false, data: { status: 'blocked', error_type: 'precondition', message: 'lookup_order is blocked until get_customer returns one verified customer_id' } } },
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
