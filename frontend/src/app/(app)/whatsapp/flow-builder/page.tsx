'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type NodeProps,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';
import {
  workflowService,
  type Workflow,
  type WorkflowPreview,
  type WorkflowSequencePolicy,
} from '@/services/workflow.service';
import { whatsappAccountService } from '@/services/whatsapp-account.service';
import {
  whatsappTemplateService,
  type WhatsappTemplate,
} from '@/services/whatsapp-template.service';
import { userService, type User } from '@/services/user.service';
import { useResource } from '@/components/whatsapp/use-resource';
import {
  PageHeading,
  Notice,
  Loading,
  Field,
  inputClass,
  buttonClass,
  secondaryClass,
  panelClass,
  errorMessage,
} from '@/components/whatsapp/ui';

type StepData = {
  label: string;
  nodeType: string;
  config: Record<string, unknown>;
  isTrigger?: boolean;
};
type PaletteEntry = { type: string; label: string; configSchema: Record<string, string> };
type ConditionRow = { field: string; operator: string; value?: unknown };
const supportedEvents = new Set([
  'CONTACT_CREATED',
  'CONTACT_UPDATED',
  'LEAD_CREATED',
  'DEAL_CREATED',
  'DEAL_STAGE_CHANGED',
  'DEAL_WON',
  'DEAL_LOST',
  'CALL_COMPLETED',
  'CALL_DISPOSITIONED',
  'WHATSAPP_MESSAGE_RECEIVED',
  'WHATSAPP_MESSAGE_DELIVERED',
  'WHATSAPP_MESSAGE_READ',
  'WHATSAPP_MESSAGE_FAILED',
]);
const conditionOperators = [
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'is_empty',
  'is_not_empty',
  'gt',
  'lt',
  'in',
  'not_in',
];
type EditorSnapshot = {
  nodes: Node<StepData>[];
  edges: Edge[];
  name: string;
  phoneNumberId: string;
  triggerEvent: string;
  sequence: WorkflowSequencePolicy;
  goalText: string;
  goalType: 'text' | 'json';
};
function BranchNode({ data }: NodeProps<StepData>) {
  return (
    <div className="min-w-40 rounded-lg border border-primary bg-card p-3 text-center text-sm">
      <Handle type="target" position={Position.Top} />
      {data.label}
      <div className="mt-3 flex justify-between gap-8 text-xs text-muted-foreground">
        <span>True</span>
        <span>False</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} />
    </div>
  );
}
function WaitNode({ data }: NodeProps<StepData>) {
  return (
    <div className="min-w-40 rounded-lg border border-primary bg-card p-3 text-center text-sm">
      <Handle type="target" position={Position.Top} />
      {data.label}
      <div className="mt-3 flex justify-between gap-8 text-xs text-muted-foreground">
        <span>Received / met</span>
        <span>Timeout</span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ left: '25%' }} />
      <Handle type="source" position={Position.Bottom} id="fallback" style={{ left: '75%' }} />
    </div>
  );
}
function conditionRows(config: Record<string, unknown>): ConditionRow[] {
  if (Array.isArray(config.conditions)) return config.conditions as ConditionRow[];
  return [
    {
      field: String(config.field ?? ''),
      operator: String(config.operator ?? 'equals'),
      value: config.value,
    },
  ];
}
const nodeTypes = { branch: BranchNode, wait: WaitNode };
const initialNodes: Node<StepData>[] = [
  {
    id: 'trigger',
    type: 'input',
    deletable: false,
    position: { x: 200, y: 40 },
    data: {
      label: 'Incoming keyword',
      nodeType: 'TRIGGER_KEYWORD',
      isTrigger: true,
      config: { keyword: '' },
    },
  },
];

export default function Page() {
  const resources = useResource(async () => {
    const [flows, palette, accounts, templates, users, triggers] = await Promise.all([
      workflowService.list(),
      api.get('/whatsapp/flow-builder/nodes'),
      whatsappAccountService.list(),
      whatsappTemplateService.list(),
      userService.getUsers(),
      workflowService.getTriggers(),
    ]);
    return {
      flows: flows.data.data.filter(
        (flow) => flow.type === 'whatsapp' && !flow.definition.automation,
      ),
      palette: parseApiData<PaletteEntry[]>(palette) ?? [],
      accounts,
      templates: parseApiData<WhatsappTemplate[]>(templates) ?? [],
      users: parseApiData<User[]>(users) ?? [],
      triggers: triggers.data.data.filter((entry) => supportedEvents.has(entry.key)),
    };
  });
  const [nodes, setNodes, onNodesChange] = useNodesState<StepData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flow, setFlow] = useState<Workflow | null>(null);
  const [name, setName] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [selected, setSelected] = useState('trigger');
  const [preview, setPreview] = useState<WorkflowPreview | null>(null);
  const [payload, setPayload] = useState('{"phone":"", "body":""}');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dirty, setDirty] = useState(true);
  const [sequence, setSequence] = useState<WorkflowSequencePolicy>({});
  const [triggerEvent, setTriggerEvent] = useState('WHATSAPP_KEYWORD');
  const [goalText, setGoalText] = useState('');
  const [goalType, setGoalType] = useState<'text' | 'json'>('text');
  const [past, setPast] = useState<EditorSnapshot[]>([]);
  const [future, setFuture] = useState<EditorSnapshot[]>([]);
  const dragging = useRef(false);
  const [issues, setIssues] = useState<{ nodeId?: string; message: string }[]>([]);
  const node = nodes.find((entry) => entry.id === selected);
  function snapshot(): EditorSnapshot {
    return { nodes, edges, name, phoneNumberId, triggerEvent, sequence, goalText, goalType };
  }
  function edited(record = true) {
    if (record) {
      const value = snapshot();
      setPast((current) =>
        Object.entries(value).every(
          ([key, entry]) => current[current.length - 1]?.[key as keyof EditorSnapshot] === entry,
        )
          ? current
          : [...current.slice(-49), value],
      );
      setFuture([]);
    }
    setDirty(true);
    setPreview(null);
    setNotice(null);
    setIssues([]);
    setError(null);
  }
  function restore(value: EditorSnapshot) {
    setNodes(value.nodes);
    setEdges(value.edges);
    setName(value.name);
    setPhoneNumberId(value.phoneNumberId);
    setTriggerEvent(value.triggerEvent);
    setSequence(value.sequence);
    setGoalText(value.goalText);
    setGoalType(value.goalType);
    setSelected('');
    edited(false);
  }
  function changeTrigger(value: string) {
    const label =
      value === 'WHATSAPP_KEYWORD'
        ? 'Incoming keyword'
        : (resources.data?.triggers.find((entry) => entry.key === value)?.label ?? value);
    setTriggerEvent(value);
    setNodes((current) =>
      current.map((entry) =>
        entry.data.isTrigger
          ? {
              ...entry,
              data: {
                label,
                isTrigger: true,
                nodeType: value === 'WHATSAPP_KEYWORD' ? 'TRIGGER_KEYWORD' : 'TRIGGER_EVENT',
                config: value === 'WHATSAPP_KEYWORD' ? { keyword: '' } : {},
              },
            }
          : entry,
      ),
    );
    edited();
  }
  function load(value: string) {
    if (!value) {
      setFlow(null);
      setName('');
      setPhoneNumberId('');
      setNodes(initialNodes);
      setEdges([]);
      setSelected('trigger');
      setSequence({});
      setGoalText('');
      setGoalType('text');
      setTriggerEvent('WHATSAPP_KEYWORD');
      edited(false);
      setPast([]);
      setFuture([]);
      return;
    }
    const found = resources.data?.flows.find((entry) => entry.id === value);
    if (!found) return;
    if (!Array.isArray(found.definition.nodes)) {
      setError('This workflow uses a step sequence. Edit it from its workflow detail page.');
      return;
    }
    setFlow(found);
    setName(found.name);
    setPhoneNumberId(String(found.definition.phoneNumberId ?? ''));
    const loadedSequence = (found.definition.sequence as WorkflowSequencePolicy | undefined) ?? {};
    setSequence(loadedSequence);
    const goalValue = loadedSequence.exitCondition?.value;
    setGoalText(typeof goalValue === 'string' ? goalValue : (JSON.stringify(goalValue) ?? ''));
    setGoalType(goalValue === undefined || typeof goalValue === 'string' ? 'text' : 'json');
    const loadedNodes = found.definition.nodes as Node<StepData>[];
    const loadedEdges = (
      Array.isArray(found.definition.edges) ? found.definition.edges : []
    ) as Edge[];
    setTriggerEvent(
      String(
        found.definition.triggerEvent ??
          (found.definition.trigger as { type?: string } | undefined)?.type ??
          'WHATSAPP_KEYWORD',
      ),
    );
    setNodes(
      loadedNodes.map((entry) => ({
        ...entry,
        deletable: !entry.data.isTrigger && entry.type !== 'input',
        type:
          entry.data.isTrigger || entry.type === 'input'
            ? 'input'
            : entry.data.nodeType === 'CONDITION'
              ? 'branch'
              : ['WAIT_FOR_REPLY', 'WAIT_UNTIL'].includes(entry.data.nodeType)
                ? 'wait'
                : entry.type,
        data: {
          ...entry.data,
          isTrigger: entry.data.isTrigger || entry.type === 'input',
          config: {
            ...entry.data.config,
            ...(entry.data.isTrigger || entry.type === 'input'
              ? {
                  keyword:
                    entry.data.config.keyword ??
                    found.definition.keyword ??
                    (found.definition.trigger as { keyword?: string } | undefined)?.keyword,
                }
              : {}),
          },
        },
      })),
    );
    setEdges(
      loadedEdges.map((edge) => ({
        ...edge,
        sourceHandle:
          (edge.sourceHandle ?? (edge as Edge & { port?: string }).port) === 'next'
            ? null
            : (edge.sourceHandle ?? (edge as Edge & { port?: string }).port),
      })),
    );
    setSelected('');
    setDirty(false);
    setPreview(null);
    setError(null);
    setIssues([]);
    setNotice(null);
    setPast([]);
    setFuture([]);
  }
  function add(entry: PaletteEntry) {
    const id = crypto.randomUUID();
    setNodes((current) => [
      ...current,
      {
        id,
        type:
          entry.type === 'CONDITION'
            ? 'branch'
            : ['WAIT_FOR_REPLY', 'WAIT_UNTIL'].includes(entry.type)
              ? 'wait'
              : 'default',
        position: { x: 200, y: current.length * 110 + 40 },
        data: {
          label: entry.label,
          nodeType: entry.type,
          config:
            entry.type === 'DELAY'
              ? { delayMinutes: 5 }
              : ['CONDITION', 'WAIT_UNTIL'].includes(entry.type)
                ? {
                    field: 'body',
                    operator: 'contains',
                    value: '',
                    ...(entry.type === 'WAIT_UNTIL' ? { timeoutMinutes: 1440 } : {}),
                  }
                : entry.type === 'WAIT_FOR_REPLY'
                  ? { timeoutMinutes: 1440 }
                  : {},
        },
      },
    ]);
    setSelected(id);
    edited();
  }
  function configure(key: string, value: unknown) {
    setNodes((current) =>
      current.map((entry) =>
        entry.id === selected
          ? {
              ...entry,
              data: {
                ...entry.data,
                config: Object.fromEntries(
                  Object.entries({ ...entry.data.config, [key]: value }).filter(
                    ([field, fieldValue]) => field !== 'phone' || fieldValue !== '',
                  ),
                ),
              },
            }
          : entry,
      ),
    );
    edited();
  }
  function configureConditionGroup(conditions: ConditionRow[], logicalOperator = 'AND') {
    setNodes((current) =>
      current.map((entry) =>
        entry.id === selected
          ? { ...entry, data: { ...entry.data, config: { logicalOperator, conditions } } }
          : entry,
      ),
    );
    edited();
  }
  function definition() {
    const keyword = nodes.find((entry) => entry.data.isTrigger)?.data.config.keyword;
    let goalValue: unknown = goalText;
    if (
      sequence.exitCondition &&
      goalType === 'json' &&
      !['is_empty', 'is_not_empty'].includes(sequence.exitCondition.operator ?? 'equals')
    ) {
      try {
        goalValue = JSON.parse(goalText) as unknown;
      } catch {
        throw new Error('Goal value must be valid JSON for the selected value type.');
      }
    }
    return {
      nodes: nodes.map((entry) => ({
        ...entry,
        data: {
          ...entry.data,
          ...(entry.data.isTrigger && triggerEvent !== 'WHATSAPP_KEYWORD'
            ? {
                label:
                  resources.data?.triggers.find((trigger) => trigger.key === triggerEvent)?.label ??
                  triggerEvent,
                nodeType: 'TRIGGER_EVENT',
                keyword: undefined,
              }
            : {}),
          config: {
            ...(entry.data.isTrigger && triggerEvent !== 'WHATSAPP_KEYWORD'
              ? {}
              : entry.data.config),
            ...(entry.data.isTrigger ? {} : { phoneNumberId, wabaId: phoneNumberId }),
          },
        },
      })),
      edges,
      keyword: triggerEvent === 'WHATSAPP_KEYWORD' ? keyword : undefined,
      triggerEvent,
      phoneNumberId,
      sequence: {
        ...sequence,
        ...(sequence.exitCondition
          ? {
              exitCondition: { ...sequence.exitCondition, value: goalValue },
            }
          : {}),
      },
    };
  }
  async function perform(work: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (cause) {
      setError(
        cause instanceof Error && !('response' in cause) ? cause.message : errorMessage(cause),
      );
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!name.trim() || !phoneNumberId)
      throw new Error('Enter a workflow name and choose a connected sending account.');
    const input = {
      name: name.trim(),
      type: 'whatsapp' as const,
      definition: definition(),
      isPublished: false,
    };
    const result = flow
      ? await workflowService.update(flow.id, input)
      : await workflowService.create(input);
    if (!result.data.data) throw new Error('The server did not return the workflow.');
    setFlow(result.data.data);
    setDirty(false);
    setNotice('Draft saved. Preview it before publishing.');
    await resources.reload();
  }
  async function test() {
    const data: unknown = JSON.parse(payload);
    if (!data || typeof data !== 'object' || Array.isArray(data))
      throw new Error('Preview data must be a JSON object.');
    if (!phoneNumberId) throw new Error('Choose a connected sending account before previewing.');
    const problems: typeof issues = [];
    const trigger = nodes.find((entry) => entry.data.isTrigger);
    if (!trigger) problems.push({ message: 'The graph needs a trigger.' });
    if (triggerEvent !== 'WHATSAPP_KEYWORD' && !supportedEvents.has(triggerEvent))
      problems.push({ nodeId: trigger?.id, message: 'Choose a supported automatic trigger.' });
    if (triggerEvent === 'WHATSAPP_KEYWORD' && !String(trigger?.data.config.keyword ?? '').trim())
      problems.push({ nodeId: trigger?.id, message: 'Enter an incoming keyword.' });
    if (!nodes.some((entry) => !entry.data.isTrigger))
      problems.push({
        nodeId: trigger?.id,
        message: 'Add at least one action and connect it to the trigger.',
      });
    for (const entry of nodes) {
      const outgoing = edges.filter((edge) => edge.source === entry.id);
      const ports = outgoing.map((edge) => edge.sourceHandle ?? 'next');
      if (new Set(ports).size !== ports.length)
        problems.push({
          nodeId: entry.id,
          message: 'Each output can connect to only one next node.',
        });
      if (entry.data.isTrigger && !outgoing.length)
        problems.push({ nodeId: entry.id, message: 'Connect the trigger to an action.' });
      if (
        entry.data.nodeType === 'CONDITION' &&
        (!ports.includes('true') || !ports.includes('false') || ports.includes('next'))
      )
        problems.push({
          nodeId: entry.id,
          message: 'Connect both True and False condition outputs.',
        });
      if (['WAIT_FOR_REPLY', 'WAIT_UNTIL'].includes(entry.data.nodeType)) {
        const timeout = Number(entry.data.config.timeoutMinutes ?? 1440);
        if (!Number.isFinite(timeout) || timeout <= 0 || timeout > 43200)
          problems.push({
            nodeId: entry.id,
            message: 'Wait timeout must be greater than zero and at most 43,200 minutes.',
          });
      }
    }
    const reached = new Set<string>();
    const visiting = new Set<string>();
    function visit(id: string) {
      if (visiting.has(id)) {
        problems.push({ nodeId: id, message: 'Remove this cycle; workflows cannot loop.' });
        return;
      }
      if (reached.has(id)) return;
      reached.add(id);
      visiting.add(id);
      for (const edge of edges.filter((entry) => entry.source === id)) visit(edge.target);
      visiting.delete(id);
    }
    if (trigger) visit(trigger.id);
    for (const entry of nodes.filter((entry) => !reached.has(entry.id)))
      problems.push({
        nodeId: entry.id,
        message: 'Connect this node to a reachable trigger path.',
      });
    if (sequence.exitCondition && !sequence.exitCondition.field.trim())
      problems.push({ message: 'Enter a goal condition field or disable the goal.' });
    setIssues(problems);
    if (problems.length) {
      setPreview(null);
      setSelected(problems.find((entry) => entry.nodeId)?.nodeId ?? selected);
      return;
    }
    const result = await workflowService.preview(definition(), data as Record<string, unknown>);
    setPreview(result);
    setIssues(
      (result?.errors ?? []).flatMap((message) => {
        const matches = nodes.filter(
          (entry) =>
            message.includes(entry.id) ||
            message.includes(entry.data.nodeType) ||
            (entry.data.nodeType === 'SEND_MESSAGE' && message.includes('SEND_WHATSAPP')),
        );
        return matches.map((entry) => ({ nodeId: entry.id, message }));
      }),
    );
  }
  const fields =
    node?.data.nodeType === 'CONDITION'
      ? {}
      : node?.data.isTrigger
        ? triggerEvent === 'WHATSAPP_KEYWORD'
          ? { keyword: 'string' }
          : {}
        : (resources.data?.palette.find((entry) => entry.type === node?.data.nodeType)
            ?.configSchema ?? {});
  const nodeFields = {
    ...fields,
    ...(node &&
    [
      'SEND_MESSAGE',
      'SEND_WHATSAPP',
      'SEND_TEMPLATE',
      'ASSIGN_AGENT',
      'RESOLVE',
      'WAIT_FOR_REPLY',
      'AI_CHAT',
    ].includes(node.data.nodeType)
      ? { phone: 'string' }
      : {}),
  };
  return (
    <fieldset disabled={busy} className="min-w-0 space-y-5">
      <PageHeading
        title="WhatsApp workflow builder"
        description="Connect and configure actions, preview with sample data, then publish a validated draft."
        action={
          flow && (
            <Link className={secondaryClass} href={`/workflows/${flow.id}/runs`}>
              Execution history
            </Link>
          )
        }
      />
      {resources.loading && <Loading />}
      {resources.error && (
        <Notice error>
          {resources.error}{' '}
          <button className="underline" onClick={() => void resources.reload()}>
            Retry
          </button>
        </Notice>
      )}
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      {issues.length > 0 && (
        <Notice error>
          <ul className="space-y-1">
            {issues.map((issue, index) => (
              <li key={`${issue.nodeId ?? 'workflow'}-${index}`}>
                {issue.nodeId ? (
                  <button
                    className="text-left underline"
                    onClick={() => setSelected(issue.nodeId!)}
                  >
                    {nodes.find((entry) => entry.id === issue.nodeId)?.data.label}: {issue.message}
                  </button>
                ) : (
                  issue.message
                )}
              </li>
            ))}
          </ul>
        </Notice>
      )}
      <div className={`${panelClass} grid gap-4 sm:grid-cols-3`}>
        <Field label="Workflow">
          <select
            className={inputClass}
            value={flow?.id ?? ''}
            disabled={busy}
            onChange={(event) => load(event.target.value)}
          >
            <option value="">Create a new workflow</option>
            {resources.data?.flows.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} · {entry.isPublished ? 'Published' : 'Draft'}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name">
          <input
            className={inputClass}
            value={name}
            disabled={busy}
            onChange={(event) => {
              setName(event.target.value);
              edited();
            }}
          />
        </Field>
        <Field label="Sending account">
          <select
            className={inputClass}
            value={phoneNumberId}
            disabled={busy}
            onChange={(event) => {
              setPhoneNumberId(event.target.value);
              edited();
            }}
          >
            <option value="">Select account</option>
            {resources.data?.accounts
              .filter((account) => account.status === 'CONNECTED')
              .map((account) => (
                <option key={account.id} value={account.phoneNumberId}>
                  {account.displayPhoneNumber || account.phoneNumberId}
                </option>
              ))}
          </select>
        </Field>
      </div>
      <Field
        label="Automatic trigger"
        hint="Only events dispatched by the existing workflow listener are available."
      >
        <select
          className={inputClass}
          value={triggerEvent}
          disabled={busy}
          onChange={(event) => changeTrigger(event.target.value)}
        >
          <option value="WHATSAPP_KEYWORD">Incoming WhatsApp keyword</option>
          {resources.data?.triggers.map((entry) => (
            <option key={entry.key} value={entry.key}>
              {entry.category} · {entry.label}
            </option>
          ))}
          {triggerEvent !== 'WHATSAPP_KEYWORD' &&
            !resources.data?.triggers.some((entry) => entry.key === triggerEvent) && (
              <option value={triggerEvent} disabled>
                {triggerEvent} · unavailable in this builder
              </option>
            )}
        </select>
      </Field>
      <p className="text-xs text-muted-foreground">
        {triggerEvent === 'WHATSAPP_KEYWORD'
          ? 'Matches incoming text containing the keyword, ignoring case.'
          : 'Use fields supplied by this event in action variables and preview data. CRM events provide contact or deal objects; call events provide call data. Supply a recipient phone through those fields when sending WhatsApp messages.'}
      </p>
      {flow?.isPublished && (
        <Notice>
          Saving changes pauses the workflow and creates a draft. Existing runs retain their
          published snapshot.
        </Notice>
      )}
      <section className={`${panelClass} space-y-3`}>
        <h2 className="font-semibold">Sequence eligibility and timing</h2>
        <div className="flex flex-wrap gap-4">
          {(['stopOnReply', 'stopOnConversion'] as const).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sequence[key] ?? false}
                onChange={(event) => {
                  setSequence((current) => ({ ...current, [key]: event.target.checked }));
                  edited();
                }}
              />
              {key === 'stopOnReply'
                ? 'Stop when the customer replies'
                : 'Stop when the contact becomes a customer or the deal is won'}
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!sequence.exitCondition}
            disabled={busy}
            onChange={(event) => {
              setSequence((current) => ({
                ...current,
                exitCondition: event.target.checked
                  ? { field: 'contact.status', operator: 'equals', value: 'customer' }
                  : undefined,
              }));
              setGoalText('customer');
              setGoalType('text');
              edited();
            }}
          />
          Stop when a goal condition is met
        </label>
        {sequence.exitCondition && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Goal field"
              hint="For example contact.status, deal.status or body; checked before each step using refreshed CRM data."
            >
              <input
                className={inputClass}
                value={sequence.exitCondition.field}
                onChange={(event) => {
                  setSequence((current) => ({
                    ...current,
                    exitCondition: { ...current.exitCondition!, field: event.target.value },
                  }));
                  edited();
                }}
              />
            </Field>
            <Field label="Goal operator">
              <select
                className={inputClass}
                value={sequence.exitCondition.operator ?? 'equals'}
                onChange={(event) => {
                  setSequence((current) => ({
                    ...current,
                    exitCondition: { ...current.exitCondition!, operator: event.target.value },
                  }));
                  edited();
                }}
              >
                {conditionOperators.map((operator) => (
                  <option key={operator}>{operator}</option>
                ))}
                {['greater_than', 'less_than'].includes(sequence.exitCondition.operator ?? '') && (
                  <option>{sequence.exitCondition.operator}</option>
                )}
              </select>
            </Field>
            {!['is_empty', 'is_not_empty'].includes(sequence.exitCondition.operator ?? '') && (
              <Field
                label="Goal value"
                hint="Equality compares types. JSON accepts numbers, booleans and lists."
              >
                <select
                  aria-label="Goal value type"
                  className={inputClass}
                  value={goalType}
                  onChange={(event) => {
                    setGoalType(event.target.value as 'text' | 'json');
                    edited();
                  }}
                >
                  <option value="text">Text</option>
                  <option value="json">JSON value</option>
                </select>
                <input
                  className={inputClass}
                  value={goalText}
                  onChange={(event) => {
                    setGoalText(event.target.value);
                    edited();
                  }}
                />
              </Field>
            )}
          </div>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!sequence.businessHours}
            onChange={(event) => {
              setSequence((current) => ({
                ...current,
                businessHours: event.target.checked
                  ? { timezone: 'UTC', startHour: 9, endHour: 17, days: [1, 2, 3, 4, 5] }
                  : undefined,
              }));
              edited();
            }}
          />
          Send messages only during business hours
        </label>
        {sequence.businessHours && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="IANA timezone">
              <input
                className={inputClass}
                value={sequence.businessHours.timezone}
                onChange={(event) => {
                  setSequence((current) => ({
                    ...current,
                    businessHours: { ...current.businessHours!, timezone: event.target.value },
                  }));
                  edited();
                }}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm sm:col-span-3">
              <input
                type="checkbox"
                checked={!!sequence.businessHours.useRecipientTimezone}
                onChange={(event) => {
                  setSequence((current) => ({
                    ...current,
                    businessHours: {
                      ...current.businessHours!,
                      useRecipientTimezone: event.target.checked,
                    },
                  }));
                  edited();
                }}
              />
              Use the contact’s saved WhatsApp timezone when available
            </label>
            {(['startHour', 'endHour'] as const).map((key) => (
              <Field
                key={key}
                label={key === 'startHour' ? 'Opening hour (0–23)' : 'Closing hour (1–24)'}
              >
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={24}
                  value={sequence.businessHours![key]}
                  onChange={(event) => {
                    setSequence((current) => ({
                      ...current,
                      businessHours: {
                        ...current.businessHours!,
                        [key]: Number(event.target.value),
                      },
                    }));
                    edited();
                  }}
                />
              </Field>
            ))}
            <div className="flex flex-wrap gap-3 sm:col-span-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <label key={day} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={sequence.businessHours!.days.includes(index)}
                    disabled={
                      sequence.businessHours!.days.length === 1 &&
                      sequence.businessHours!.days.includes(index)
                    }
                    onChange={(event) => {
                      setSequence((current) => ({
                        ...current,
                        businessHours: {
                          ...current.businessHours!,
                          days: event.target.checked
                            ? [...current.businessHours!.days, index]
                            : current.businessHours!.days.filter((value) => value !== index),
                        },
                      }));
                      edited();
                    }}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Opt-outs always stop pending WhatsApp work. Business-hour openings use the configured
          timezone, including daylight-saving changes, with up to 15 minutes of scheduling delay.
          If enabled, a contact’s saved timezone is used and the configured timezone is the fallback.
        </p>
      </section>
      <div className="flex gap-2" aria-label="Edit history">
        <button
          className={secondaryClass}
          disabled={busy || !past.length}
          onClick={() => {
            const previous = past[past.length - 1];
            if (!previous) return;
            setPast(past.slice(0, -1));
            setFuture((current) => [...current, snapshot()]);
            restore(previous);
          }}
        >
          Undo
        </button>
        <button
          className={secondaryClass}
          disabled={busy || !future.length}
          onClick={() => {
            const next = future[future.length - 1];
            if (!next) return;
            setFuture(future.slice(0, -1));
            setPast((current) => [...current, snapshot()]);
            restore(next);
          }}
        >
          Redo
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[180px_1fr_280px]">
        <aside className={`${panelClass} space-y-2`}>
          <h2 className="mb-3 font-semibold">Add action</h2>
          {resources.data?.palette
            .filter((entry) => !entry.type.startsWith('TRIGGER'))
            .map((entry) => (
              <button
                key={entry.type}
                disabled={busy}
                className={`${secondaryClass} w-full justify-start`}
                onClick={() => add(entry)}
              >
                {entry.label}
              </button>
            ))}
        </aside>
        <div className="h-[560px] min-w-0 rounded-xl border border-border bg-card">
          <ReactFlow
            nodes={nodes.map((entry) => ({
              ...entry,
              style: {
                ...entry.style,
                ...(issues.some((issue) => issue.nodeId === entry.id)
                  ? { outline: '2px solid hsl(var(--destructive))', outlineOffset: 3 }
                  : {}),
              },
            }))}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={!busy}
            nodesConnectable={!busy}
            deleteKeyCode={busy ? null : 'Backspace'}
            onNodeDragStart={() => {
              dragging.current = true;
              edited();
            }}
            onNodeDragStop={() => {
              dragging.current = false;
            }}
            onNodesChange={(changes) => {
              onNodesChange(changes);
              if (
                changes.some((change) => change.type !== 'select' && change.type !== 'dimensions')
              )
                edited(!dragging.current);
            }}
            onEdgesChange={(changes) => {
              onEdgesChange(changes);
              if (changes.some((change) => change.type !== 'select')) edited();
            }}
            onConnect={(connection: Connection) => {
              setEdges((current) => addEdge(connection, current));
              edited();
            }}
            onNodeClick={(_event, entry) => setSelected(entry.id)}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <aside className={`${panelClass} space-y-4`}>
          <h2 className="font-semibold">{node?.data.label ?? 'Select a node'}</h2>
          {node &&
            issues
              .filter((issue) => issue.nodeId === node.id)
              .map((issue, index) => (
                <Notice key={index} error>
                  {issue.message}
                </Notice>
              ))}
          {Object.entries(nodeFields).map(([key, type]) => (
            <Field
              key={key}
              label={key}
              hint={
                key === 'phone'
                  ? 'Optional for incoming messages. For CRM/call events use a supplied field, e.g. {{contact.phone}}, {{deal.contact.phone}} or {{call.to}}. Preview with the same event data.'
                  : key === 'text'
                    ? 'Use {{phone}}, {{body}} or an available trigger field.'
                    : undefined
              }
            >
              {key === 'templateId' ? (
                <select
                  className={inputClass}
                  value={String(node?.data.config[key] ?? '')}
                  onChange={(event) => configure(key, event.target.value)}
                >
                  <option value="">Approved template</option>
                  {resources.data?.templates
                    .filter((template) => template.status === 'APPROVED' && template.waTemplateId)
                    .map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                </select>
              ) : key === 'assigneeId' || key === 'userId' ? (
                <select
                  className={inputClass}
                  value={String(node?.data.config[key] ?? '')}
                  onChange={(event) => configure(key, event.target.value)}
                >
                  <option value="">Select teammate</option>
                  {resources.data?.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              ) : key === 'operator' ? (
                <select
                  className={inputClass}
                  value={String(node?.data.config[key] ?? 'equals')}
                  onChange={(event) => configure(key, event.target.value)}
                >
                  {conditionOperators.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              ) : (
                <input
                  className={inputClass}
                  type={type === 'number' ? 'number' : 'text'}
                  min={0}
                  value={String(node?.data.config[key] ?? '')}
                  onChange={(event) =>
                    configure(
                      key,
                      type === 'number' ? Number(event.target.value) : event.target.value,
                    )
                  }
                />
              )}
            </Field>
          ))}
          {node?.data.nodeType === 'CONDITION' &&
            (() => {
              const conditions = conditionRows(node.data.config);
              const grouped = Array.isArray(node.data.config.conditions);
              const setCondition = (index: number, key: keyof ConditionRow, value: string) => {
                const next = conditions.map((condition, row) =>
                  row === index ? { ...condition, [key]: value } : condition,
                );
                if (grouped)
                  configureConditionGroup(next, String(node.data.config.logicalOperator ?? 'AND'));
                else
                  setNodes((current) =>
                    current.map((entry) =>
                      entry.id === selected
                        ? {
                            ...entry,
                            data: { ...entry.data, config: { ...entry.data.config, ...next[0] } },
                          }
                        : entry,
                    ),
                  );
                if (!grouped) edited();
              };
              return (
                <section className="space-y-3" aria-label="Condition rules">
                  {grouped && (
                    <Field label="Match rules">
                      <select
                        className={inputClass}
                        value={String(node.data.config.logicalOperator)}
                        onChange={(event) =>
                          configureConditionGroup(conditions, event.target.value)
                        }
                      >
                        <option value="AND">All conditions (AND)</option>
                        <option value="OR">Any condition (OR)</option>
                      </select>
                    </Field>
                  )}
                  {conditions.map((condition, index) => (
                    <div key={index} className="space-y-2 rounded-lg border border-border p-3">
                      <Field label={`Condition ${index + 1} field`}>
                        <input
                          className={inputClass}
                          value={condition.field}
                          onChange={(event) => setCondition(index, 'field', event.target.value)}
                        />
                      </Field>
                      <Field label="Operator">
                        <select
                          className={inputClass}
                          value={condition.operator}
                          onChange={(event) => setCondition(index, 'operator', event.target.value)}
                        >
                          {[...conditionOperators, 'greater_than', 'less_than'].map((operator) => (
                            <option key={operator}>{operator}</option>
                          ))}
                        </select>
                      </Field>
                      {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                        <Field label="Value">
                          <input
                            className={inputClass}
                            value={String(condition.value ?? '')}
                            onChange={(event) => setCondition(index, 'value', event.target.value)}
                          />
                        </Field>
                      )}
                      {grouped && (
                        <button
                          className={secondaryClass}
                          disabled={conditions.length <= 1}
                          onClick={() =>
                            configureConditionGroup(
                              conditions.filter((_, row) => row !== index),
                              String(node.data.config.logicalOperator ?? 'AND'),
                            )
                          }
                        >
                          Remove condition
                        </button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    {grouped
                      ? `${conditions.length} conditions · ${String(node.data.config.logicalOperator)}`
                      : 'Single condition'}
                    ; connect both True and False outputs.
                  </p>
                  <button
                    className={secondaryClass}
                    disabled={conditions.length >= 10}
                    onClick={() =>
                      configureConditionGroup([
                        ...conditions,
                        { field: 'body', operator: 'contains', value: '' },
                      ])
                    }
                  >
                    Add condition
                  </button>
                </section>
              );
            })()}
          {node && ['WAIT_FOR_REPLY', 'WAIT_UNTIL'].includes(node.data.nodeType) && (
            <p className="text-xs text-muted-foreground">
              Received / met continues normally. Timeout follows the fallback connection; without
              one, the run stops on timeout.
            </p>
          )}
          {node && !node.data.isTrigger && (
            <button
              className={secondaryClass}
              onClick={() => {
                setNodes((current) => current.filter((entry) => entry.id !== selected));
                setEdges((current) =>
                  current.filter((edge) => edge.source !== selected && edge.target !== selected),
                );
                setSelected('');
                edited();
              }}
            >
              Remove node
            </button>
          )}
        </aside>
      </div>
      <section className={`${panelClass} space-y-4`}>
        <Field label="Preview trigger data" hint="No messages or CRM actions run during preview.">
          <textarea
            className={`${inputClass} font-mono`}
            rows={3}
            value={payload}
            onChange={(event) => {
              setPayload(event.target.value);
              setPreview(null);
            }}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <button className={secondaryClass} disabled={busy} onClick={() => void perform(save)}>
            Save draft
          </button>
          <button className={secondaryClass} disabled={busy} onClick={() => void perform(test)}>
            Validate and preview
          </button>
          <button
            className={buttonClass}
            disabled={busy || dirty || !flow || !preview?.valid || flow.isPublished}
            onClick={() =>
              void perform(async () => {
                if (!flow) return;
                await workflowService.activate(flow.id);
                setFlow({ ...flow, isPublished: true });
                setNotice('Workflow published.');
              })
            }
          >
            Publish
          </button>
          {flow?.isPublished && (
            <button
              className={secondaryClass}
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  await workflowService.deactivate(flow.id);
                  setFlow({ ...flow, isPublished: false });
                  setNotice('Workflow paused.');
                })
              }
            >
              Pause
            </button>
          )}
        </div>
        {preview && (
          <div className="space-y-2">
            {preview.errors.map((message) => (
              <Notice key={message} error>
                {message}
              </Notice>
            ))}
            {preview.warnings?.map((message) => (
              <Notice key={message}>{message}</Notice>
            ))}
            {preview.preview?.map((step) => (
              <details key={step.stepId} className="rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-sm">
                  {step.type}
                  {step.passed === undefined
                    ? ''
                    : step.passed
                      ? ' · True branch'
                      : ' · False branch'}
                </summary>
                <pre className="mt-2 overflow-auto text-xs">
                  {JSON.stringify(step.config, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        )}
      </section>
    </fieldset>
  );
}
