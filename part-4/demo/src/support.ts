import type { DemoEvent } from './events.js';

type Emit = (event: DemoEvent) => void;

export type SupportState = {
  facts: Record<string, string>;
  verifiedCustomerId?: string;
  order?: { id: string; status: string; total: string; duplicateCharge: string; returnEligible: string };
  actions: string[];
  escalated: boolean;
};

const CUSTOMER = {
  id: 'CUST-2048',
  name: 'Mara Singh',
  email: 'mara@example.test',
};

const RAW_ORDER = {
  order_id: 'ORD-1042',
  status: 'delivered',
  total: '$72.00',
  items: '2 margherita pizzas, 1 lemon soda',
  return_eligible: 'duplicate charge review allowed',
  shipping_address: '18 Market Street',
  payment_method: 'card ending 4242',
  tax: '$6.00',
  tip: '$8.00',
  kitchen_ticket: 'K-771',
  courier_route: 'north-4',
  placed_at: '2026-08-28T18:05:00Z',
  delivered_at: '2026-08-28T18:49:00Z',
  internal_risk_score: 'low',
  customer_note: 'Leave at front desk',
  restaurant_station: 'pizza',
  menu_version: '2026-08',
  payment_attempts: '2',
  duplicate_charge: '$18.00',
};

const REQUEST =
  'Hi, I am Mara Singh. I was charged twice for order ORD-1042. Please refund the duplicate $18.00 charge. I also want a 30% competitor price match, and I want a manager to decide that part.';

function pause(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('stopped'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('stopped'));
    }, { once: true });
  });
}

/**
 * The code-level precondition behind the support example. A prompt can ask for
 * verification first. This function makes skipping it impossible.
 */
export function checkPrecondition(
  tool: string,
  state: SupportState,
  args: Record<string, unknown> = {},
): { allowed: boolean; reason: string } {
  if ((tool === 'lookup_order' || tool === 'process_refund') && !state.verifiedCustomerId) {
    return {
      allowed: false,
      reason: `${tool} is blocked until get_customer returns one verified customer_id`,
    };
  }
  if (tool === 'lookup_order') {
    if (args.customer_id !== state.verifiedCustomerId) {
      return { allowed: false, reason: 'lookup_order is blocked because customer_id does not match the verified guest' };
    }
    if (args.order_id !== state.facts.order_id) {
      return { allowed: false, reason: 'lookup_order is blocked because order_id does not match the current case' };
    }
  }
  if (tool === 'process_refund') {
    if (args.customer_id !== undefined && args.customer_id !== state.verifiedCustomerId) {
      return { allowed: false, reason: 'process_refund is blocked because customer_id does not match the verified guest' };
    }
    const order = state.order;
    if (!order || args.order_id !== order.id) {
      return { allowed: false, reason: 'process_refund is blocked until the requested order is verified' };
    }
    const expectedAmount = Number(order.duplicateCharge.replace('$', ''));
    if (args.amount !== expectedAmount) {
      return { allowed: false, reason: 'process_refund is blocked because amount does not match the verified duplicate charge' };
    }
    if (args.reason !== 'duplicate charge' || order.returnEligible !== 'duplicate charge review allowed') {
      return { allowed: false, reason: 'process_refund is blocked because the requested reason is not covered by the verified order policy' };
    }
  }
  return { allowed: true, reason: 'preconditions satisfied' };
}

/** Keep the five fields the current support decision needs, not every ledger field. */
export function trimOrderResult(order: Record<string, string>): Record<string, string> {
  return {
    order_id: order.order_id,
    status: order.status,
    total: order.total,
    items: order.items,
    return_eligible: order.return_eligible,
  };
}

export function buildHandoff(state: SupportState): Record<string, unknown> {
  return {
    customer_id: state.verifiedCustomerId ?? null,
    customer_name: CUSTOMER.name,
    issue_summary: 'Duplicate charge refund completed; competitor price match needs a policy decision.',
    order_id: state.order?.id ?? null,
    root_cause: 'The order ledger shows a second $18.00 payment attempt.',
    actions_taken: state.actions,
    refund_amount: '$18.00',
    recommended_action: 'Ask the manager whether competitor price matching is allowed.',
    escalation_reason: 'The policy covers price drops on Basil Bistro, but says nothing about competitor prices.',
  };
}

async function guardedTool(
  emit: Emit,
  signal: AbortSignal | undefined,
  state: SupportState,
  tool: string,
  args: Record<string, unknown>,
  execute: () => unknown,
  delayMs: number,
  fieldsTrimmed?: string[],
): Promise<boolean> {
  emit({ t: 'tool_attempt', scenario: 'support', tool, args });
  await pause(delayMs, signal);
  const guard = checkPrecondition(tool, state, args);
  emit({ t: 'guard', scenario: 'support', tool, allowed: guard.allowed, reason: guard.reason });
  if (!guard.allowed) {
    emit({
      t: 'tool_result',
      scenario: 'support',
      tool,
      ok: false,
      data: { status: 'blocked', error_type: 'precondition', message: guard.reason },
    });
    return false;
  }
  const data = execute();
  emit({ t: 'tool_result', scenario: 'support', tool, ok: true, data, fieldsTrimmed });
  return true;
}

/**
 * A real local support-tool trace. It deliberately does not call a model: the
 * lesson is the deterministic guard, result trimming, case facts, and handoff.
 */
export async function runSupport(emit: Emit, signal?: AbortSignal, delayMs = 550): Promise<void> {
  const state: SupportState = {
    facts: {
      customer_name: CUSTOMER.name,
      order_id: 'ORD-1042',
      issue_1: 'duplicate $18.00 charge',
      issue_2: '30% competitor price match',
      requested_action: 'refund duplicate charge and ask a manager about price matching',
    },
    actions: [],
    escalated: false,
  };

  emit({ t: 'status', scenario: 'support', msg: 'support trace ready · Basil Bistro front counter' });
  emit({ t: 'phase', scenario: 'support', name: 'request', detail: 'the counter agent receives one message with two separate issues' });
  emit({ t: 'support_request', scenario: 'support', message: REQUEST });
  emit({ t: 'case_facts', scenario: 'support', facts: { ...state.facts }, update: 'facts extracted from the first message' });
  await pause(delayMs, signal);
  emit({ t: 'decompose', scenario: 'support', issues: ['duplicate-charge refund', 'competitor price-match policy gap'] });

  // Deliberately attempt the unsafe order first so the room sees the guard fire.
  await guardedTool(emit, signal, state, 'lookup_order', { order_id: 'ORD-1042' }, () => null, delayMs);

  const customerOk = await guardedTool(
    emit,
    signal,
    state,
    'get_customer',
    { name: CUSTOMER.name },
    () => ({ status: 'success', match_count: 1, customer: CUSTOMER }),
    delayMs,
  );
  if (customerOk) {
    state.verifiedCustomerId = CUSTOMER.id;
    state.actions.push('Verified the guest with get_customer and received CUST-2048.');
    state.facts.customer_id = CUSTOMER.id;
    emit({ t: 'case_facts', scenario: 'support', facts: { ...state.facts }, update: 'verified customer_id added' });
  }

  const trimmedFields = Object.keys(RAW_ORDER).filter(field => !Object.prototype.hasOwnProperty.call(trimOrderResult(RAW_ORDER), field));
  const orderOk = await guardedTool(
    emit,
    signal,
    state,
    'lookup_order',
    { order_id: 'ORD-1042', customer_id: CUSTOMER.id },
    () => trimOrderResult(RAW_ORDER),
    delayMs,
    trimmedFields,
  );
  if (orderOk) {
    state.order = { id: 'ORD-1042', status: 'delivered', total: '$72.00', duplicateCharge: '$18.00', returnEligible: 'duplicate charge review allowed' };
    state.actions.push('Confirmed ORD-1042 and kept five decision fields from the ledger.');
    state.facts.order_status = 'delivered';
    state.facts.duplicate_charge = '$18.00 confirmed';
    emit({ t: 'case_facts', scenario: 'support', facts: { ...state.facts }, update: 'order facts added; long ledger fields stayed out' });
  }

  const refundOk = await guardedTool(
    emit,
    signal,
    state,
    'process_refund',
    { order_id: 'ORD-1042', amount: 18, reason: 'duplicate charge' },
    () => ({ status: 'success', refund_id: 'REF-771', amount: '$18.00', eta: '3–5 business days' }),
    delayMs,
  );
  if (refundOk) state.actions.push('Refunded the duplicate $18.00 charge.');

  await guardedTool(
    emit,
    signal,
    state,
    'escalate_to_human',
    { reason: 'competitor price-match policy gap' },
    () => ({ status: 'queued', queue: 'Basil Bistro managers', priority: 'normal' }),
    delayMs,
  );
  state.escalated = true;
  state.actions.push('Sent the policy question to a manager with a self-contained handoff.');
  const handoff = buildHandoff(state);
  emit({ t: 'handoff', scenario: 'support', handoff });
  emit({
    t: 'final',
    scenario: 'support',
    summary: 'Refund completed for the duplicate charge. The unsupported competitor price match was escalated with the facts a manager needs.',
    outcome: {
      refund: 'REF-771 · $18.00 · 3–5 business days',
      escalation: 'manager queue · competitor price-match policy gap',
      verified_customer: CUSTOMER.id,
    },
  });
  emit({ t: 'done', scenario: 'support', msg: 'support trace complete · refund safe, policy gap escalated' });
}

export { REQUEST, CUSTOMER, RAW_ORDER };
