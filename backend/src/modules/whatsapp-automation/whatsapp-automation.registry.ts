import {
  AutomationCategoryOverview,
  AutomationConfigField,
  AutomationProductDefinition,
  AutomationRequirement,
} from './whatsapp-automation.contracts';

export const AUTOMATION_PLUGIN_CATEGORY = 'WHATSAPP_AUTOMATION';
export const AUTOMATION_SLUG_PREFIX = 'wa-automation-';

const field = (
  key: string,
  label: string,
  type: AutomationConfigField['type'],
  description: string,
  options: Partial<AutomationConfigField> = {},
): AutomationConfigField => ({ key, label, type, required: true, description, ...options });
const keyword = field(
  'keyword',
  'Inbound keyword',
  'string',
  'Case-insensitive keyword that starts this workflow.',
  { maxLength: 100 },
);
const account = field(
  'accountId',
  'WhatsApp account',
  'uuid',
  'A connected Meta account owned by this workspace.',
);
const message = field(
  'message',
  'Reply message',
  'message',
  'Text reply inside the inbound customer service window.',
  { maxLength: 4096 },
);
const template = field(
  'templateId',
  'Approved template',
  'template',
  'An approved basic body-only Meta template owned by this workspace.',
);
const recipient = field(
  'recipient',
  'Recipient variable',
  'string',
  'Workflow variable path, such as contact.phone or deal.contact.phone.',
  { maxLength: 100 },
);
const parameters = field(
  'templateParameters',
  'Template body parameters',
  'string',
  'Values for each template body variable, in placeholder order. Use available workflow variables for personalization.',
  { required: false, maxLength: 16000 },
);
const meta: AutomationRequirement = {
  key: 'meta_whatsapp',
  label: 'Meta WhatsApp account',
  implemented: true,
  description:
    'Connect and validate a tenant-owned Meta phone/WABA. Provider message charges are separate.',
};
const consent: AutomationRequirement = {
  key: 'recipient_consent',
  label: 'Recipient eligibility',
  implemented: true,
  description:
    'Every send requires eligibility at runtime; business-initiated messages require recorded purpose-specific opt-in.',
};
const approved: AutomationRequirement = {
  key: 'approved_template',
  label: 'Approved Meta template',
  implemented: true,
  description:
    'Select a provider-approved basic body template; submitting a template is not approval.',
};

function pack(
  slug: string,
  name: string,
  category: AutomationProductDefinition['category'],
  description: string,
  fields: AutomationConfigField[],
  actions: AutomationProductDefinition['actions'],
  steps: string[],
  options: Partial<AutomationProductDefinition> = {},
): AutomationProductDefinition {
  return {
    slug: `${AUTOMATION_SLUG_PREFIX}${slug}`,
    name,
    category,
    description,
    version: '1.0.0',
    availability: 'IMPLEMENTED',
    requiredFeatures: ['whatsapp', 'workflow'],
    externalRequirements: [meta, consent],
    configSchema: { fields: [account, ...fields], additionalProperties: false },
    trigger: 'WHATSAPP_KEYWORD',
    keyword: true,
    actions,
    steps,
    ...options,
  };
}
const reply = {
  type: 'SEND_MESSAGE',
  config: { message: '$message', toNumber: '{{phone}}', accountId: '$accountId' },
};
const sendTemplate = {
  type: 'SEND_TEMPLATE',
  config: {
    templateId: '$templateId',
    toNumber: '$recipient',
    accountId: '$accountId',
    bodyParameters: '$templateParameters',
  },
};
const assignee = field(
  'assigneeId',
  'Responsible teammate',
  'uuid',
  'An active user in this workspace.',
);
const followUpFields = [
  template,
  recipient,
  parameters,
  field(
    'followUpHours',
    'Hours between follow-ups',
    'integer',
    'Delay between three sends of the same approved template; each delay is at most 30 days.',
    { minimum: 1, maximum: 720 },
  ),
  field(
    'businessTimezone',
    'Business timezone',
    'string',
    'IANA timezone, such as Asia/Kolkata. Sends run Monday through Friday in these business hours.',
    { maxLength: 100 },
  ),
  field('businessStartHour', 'Opening hour', 'integer', 'Local hour, from 0 to 23.', {
    minimum: 0,
    maximum: 23,
  }),
  field(
    'businessEndHour',
    'Closing hour',
    'integer',
    'Local hour, from 1 to 24; must be later than opening.',
    { minimum: 1, maximum: 24 },
  ),
];
const followUpActions: AutomationProductDefinition['actions'] = [
  sendTemplate,
  { type: 'DELAY', config: { delayHours: '$followUpHours' } },
  sendTemplate,
  { type: 'DELAY', config: { delayHours: '$followUpHours' } },
  sendTemplate,
];
const followUpPolicy: AutomationProductDefinition['sequence'] = {
  stopOnReply: true,
  stopOnConversion: true,
  businessHours: {
    timezone: '$businessTimezone',
    startHour: '$businessStartHour',
    endHour: '$businessEndHour',
    days: [1, 2, 3, 4, 5],
  },
};
const sequenceRecipient: AutomationRequirement = {
  key: 'sequence_recipient',
  label: 'CRM recipient and reply tracking',
  implemented: true,
  description:
    'Supply contactId or dealId and a matching phone in the trigger payload. Replies on the selected account, opt-out, CUSTOMER contact status or WON deal status stop follow-ups. A raw recipient variable alone does not establish CRM conversion tracking.',
};

/** Only actions already implemented by the workflow executor are sold as installable packs. */
export const WHATSAPP_AUTOMATION_PRODUCTS: readonly AutomationProductDefinition[] = [
  pack(
    'welcome-reply',
    'Keyword welcome reply',
    'CUSTOMER_SERVICE',
    'Reply to an inbound greeting with your team’s welcome message.',
    [keyword, message],
    [reply],
    ['Match inbound keyword', 'Send a service-window text reply'],
  ),
  pack(
    'opening-hours',
    'Opening hours and location',
    'CUSTOMER_SERVICE',
    'Answer an inbound hours or location request with maintained business information.',
    [keyword, message],
    [reply],
    ['Match inbound keyword', 'Reply with hours or location'],
  ),
  pack(
    'lead-capture',
    'Inbound lead capture',
    'LEAD_CAPTURE',
    'Create a scored CRM lead record from an inbound WhatsApp request, even when the customer has no email, and acknowledge it.',
    [
      keyword,
      field(
        'firstName',
        'Lead first name',
        'string',
        'Literal or workflow variable such as {{phone}}.',
        { maxLength: 100 },
      ),
      field(
        'email',
        'Lead email (optional)',
        'string',
        'Optional literal or workflow variable; the WhatsApp sender number is captured automatically.',
        { required: false, maxLength: 255 },
      ),
      message,
    ],
    [
      {
        type: 'CREATE_LEAD',
        config: {
          firstName: '$firstName',
          email: '$email',
          phone: '{{phone}}',
          source: 'WhatsApp',
        },
      },
      reply,
    ],
    ['Match inbound keyword', 'Create scored CRM lead', 'Send acknowledgment'],
    { requiredFeatures: ['whatsapp', 'workflow', 'crm'], version: '1.1.0' },
  ),
  pack(
    'sales-handoff',
    'Sales team handoff',
    'SALES',
    'Assign an inbound conversation to a workspace teammate and send an acknowledgment.',
    [
      keyword,
      field('assigneeId', 'Assignee', 'uuid', 'An active user in this workspace.'),
      message,
    ],
    [{ type: 'ASSIGN_AGENT', config: { assigneeId: '$assigneeId', phone: '{{phone}}' } }, reply],
    ['Match inbound keyword', 'Assign conversation', 'Send acknowledgment'],
  ),
  pack(
    'appointment-request',
    'Appointment request intake',
    'APPOINTMENTS',
    'Create a CRM follow-up task when a customer asks for an appointment. Does not book a calendar slot.',
    [
      keyword,
      field('taskTitle', 'Task title', 'string', 'Title for the appointment follow-up task.', {
        maxLength: 255,
      }),
      field('assigneeId', 'Task assignee', 'uuid', 'An active user in this workspace.'),
      message,
    ],
    [
      {
        type: 'CREATE_TASK',
        config: { title: '$taskTitle', assigneeId: '$assigneeId', dueInHours: 24 },
      },
      reply,
    ],
    ['Match appointment keyword', 'Create follow-up task', 'Acknowledge request'],
    { requiredFeatures: ['whatsapp', 'workflow', 'crm'] },
  ),
  pack(
    'support-escalation',
    'Support escalation',
    'SUPPORT',
    'Assign the conversation, notify the assignee, and acknowledge the support request.',
    [
      keyword,
      field('assigneeId', 'Support assignee', 'uuid', 'An active user in this workspace.'),
      message,
    ],
    [
      { type: 'ASSIGN_AGENT', config: { assigneeId: '$assigneeId', phone: '{{phone}}' } },
      {
        type: 'NOTIFY_TEAM',
        config: { userId: '$assigneeId', title: 'WhatsApp support request', message: '{{body}}' },
      },
      reply,
    ],
    ['Match support keyword', 'Assign conversation', 'Notify teammate', 'Acknowledge customer'],
  ),
  pack(
    'resolve-conversation',
    'Conversation resolution',
    'SUPPORT',
    'Acknowledge an inbound resolution keyword and mark the conversation resolved.',
    [keyword, message],
    [reply, { type: 'RESOLVE', config: { phone: '{{phone}}' } }],
    ['Match resolution keyword', 'Send acknowledgment', 'Resolve conversation'],
  ),
  pack(
    'deal-stage-update',
    'Deal stage notification',
    'SALES',
    'Send an approved utility template when an existing CRM deal changes stage.',
    [template, recipient, parameters],
    [sendTemplate],
    ['Receive CRM stage change', 'Check recipient consent', 'Send approved utility template'],
    {
      keyword: false,
      trigger: 'DEAL_STAGE_CHANGED',
      templatePurpose: 'UTILITY',
      requiredFeatures: ['whatsapp', 'workflow', 'crm'],
      externalRequirements: [meta, consent, approved],
    },
  ),
  pack(
    'payment-instructions',
    'Payment instructions reply',
    'PAYMENTS',
    'Reply to an inbound request with payment instructions or an existing payment link. Does not create or verify payments.',
    [keyword, message],
    [reply],
    ['Match payment keyword', 'Send maintained payment instructions'],
  ),
  pack(
    'customer-follow-up',
    'Manual customer follow-up',
    'RETENTION',
    'Send an approved marketing template to a supplied CRM recipient on manual execution.',
    [template, recipient, parameters],
    [sendTemplate],
    [
      'Manual trigger with CRM payload',
      'Check marketing consent',
      'Send approved marketing template',
    ],
    {
      keyword: false,
      trigger: 'MANUAL',
      templatePurpose: 'MARKETING',
      externalRequirements: [meta, consent, approved],
    },
  ),
  pack(
    'team-alert',
    'Inbound team alert',
    'OPERATIONS',
    'Notify a workspace teammate when an inbound keyword needs attention.',
    [
      keyword,
      field('assigneeId', 'Notification recipient', 'uuid', 'An active user in this workspace.'),
    ],
    [
      {
        type: 'NOTIFY_TEAM',
        config: { userId: '$assigneeId', title: 'WhatsApp keyword alert', message: '{{body}}' },
      },
    ],
    ['Match inbound keyword', 'Store internal notification'],
  ),
  pack(
    'shopify-recovery',
    'Shopify cart recovery',
    'ECOMMERCE',
    'Shopify connection and supported cart/order event intake are available, but abandoned-checkout recovery is not implemented. Not installable.',
    [],
    [],
    [],
    {
      availability: 'EXTERNAL_REQUIRED',
      externalRequirements: [
        meta,
        consent,
        approved,
        {
          key: 'shopify',
          label: 'Shopify adapter',
          implemented: false,
          description:
            'Shopify OAuth and supported cart/order event intake exist; checkout recovery actions and live store verification remain unavailable.',
        },
      ],
    },
  ),
  pack(
    'ai-knowledge-reply',
    'AI knowledge assistant',
    'AI',
    'Answer inbound text from your knowledge base using an existing AI agent. Uncertain or unavailable answers route to a teammate.',
    [
      keyword,
      field(
        'agentId',
        'AI agent',
        'uuid',
        'An active workspace agent. Configure its instructions and tone in AI settings.',
      ),
      field(
        'knowledgeBaseId',
        'Knowledge base',
        'uuid',
        'A workspace knowledge base with indexed business information.',
      ),
      field(
        'assigneeId',
        'Handoff teammate',
        'uuid',
        'An active workspace user for unanswered requests.',
      ),
      field(
        'fallbackMessage',
        'Handoff message',
        'message',
        'Customer acknowledgment when AI cannot answer.',
        { maxLength: 2000 },
      ),
    ],
    [
      {
        id: 'ai',
        type: 'AI_CHAT',
        config: {
          agentId: '$agentId',
          knowledgeBaseIds: ['$knowledgeBaseId'],
          tools: ['retrieve_kb'],
          fallbackMessage: '$fallbackMessage',
        },
        nextStepId: 'answer',
        fallbackStepId: 'handoff',
      },
      {
        id: 'answer',
        type: 'SEND_MESSAGE',
        config: { message: '{{steps.ai.text}}', toNumber: '{{phone}}', accountId: '$accountId' },
        nextStepId: 'done',
      },
      {
        id: 'handoff',
        type: 'ASSIGN_AGENT',
        config: { assigneeId: '$assigneeId', phone: '{{phone}}' },
        nextStepId: 'acknowledge',
      },
      {
        id: 'acknowledge',
        type: 'SEND_MESSAGE',
        config: { message: '$fallbackMessage', toNumber: '{{phone}}', accountId: '$accountId' },
        nextStepId: 'done',
      },
      { id: 'done', type: 'END', config: {} },
    ],
    [
      'Match inbound keyword',
      'Retrieve workspace knowledge and generate a text answer',
      'Reply or hand off to a teammate',
    ],
    {
      requiredFeatures: ['whatsapp', 'workflow', 'ai'],
      externalRequirements: [
        meta,
        consent,
        {
          key: 'ai_provider',
          label: 'AI provider and indexed knowledge',
          implemented: true,
          description:
            'Requires configured AI credentials and indexed workspace knowledge. Usage is metered; unavailable AI hands off to a teammate.',
        },
      ],
    },
  ),
];

/** Exported separately so applied migration 18 retains its original catalog snapshot. */
export const WHATSAPP_AUTOMATION_PACKS: readonly AutomationProductDefinition[] = [
  pack(
    'follow-up-sequence',
    'Three-touch customer follow-up',
    'SEQUENCES',
    'Manually start three sends of the same approved marketing template, separated by configured delays and weekday business hours. Stops on reply, opt-out or CRM conversion.',
    followUpFields,
    followUpActions,
    [
      'Manual trigger with CRM recipient',
      'Send approved marketing template',
      'Delay and recheck eligibility',
      'Send second touch',
      'Delay and recheck eligibility',
      'Send final touch',
    ],
    {
      keyword: false,
      trigger: 'MANUAL',
      templatePurpose: 'MARKETING',
      sequence: followUpPolicy,
      requiredFeatures: ['whatsapp', 'workflow', 'crm'],
      externalRequirements: [meta, consent, approved, sequenceRecipient],
    },
  ),
  pack(
    'new-contact-nurture',
    'New CRM contact nurture',
    'RETENTION',
    'Start a three-touch marketing-template sequence when a CRM contact is created. Requires a reachable CRM phone and marketing opt-in before the first send; stops on reply or conversion.',
    followUpFields,
    followUpActions,
    [
      'Receive CRM contact-created event',
      'Check marketing consent',
      'Send approved template',
      'Delay and send second touch',
      'Delay and send final touch',
    ],
    {
      keyword: false,
      trigger: 'CONTACT_CREATED',
      templatePurpose: 'MARKETING',
      sequence: followUpPolicy,
      requiredFeatures: ['whatsapp', 'workflow', 'crm'],
      externalRequirements: [meta, consent, approved, sequenceRecipient],
    },
  ),
  pack(
    'reply-timeout-handoff',
    'Follow-up reply timeout alert',
    'NOTIFICATIONS',
    'Manually send one approved marketing template and wait for a reply. Notify a teammate only when the reply window expires. Does not send a second message.',
    [
      template,
      recipient,
      parameters,
      assignee,
      field(
        'replyTimeoutMinutes',
        'Reply timeout in minutes',
        'integer',
        'Positive reply wait, at most 30 days.',
        { minimum: 1, maximum: 43200 },
      ),
    ],
    [
      { id: 'send', ...sendTemplate },
      {
        id: 'wait',
        type: 'WAIT_FOR_REPLY',
        config: { phone: '$recipient', timeoutMinutes: '$replyTimeoutMinutes' },
        nextStepId: 'done',
        fallbackStepId: 'alert',
      },
      {
        id: 'alert',
        type: 'NOTIFY_TEAM',
        config: {
          userId: '$assigneeId',
          title: 'WhatsApp follow-up needs attention',
          message: 'No reply within the configured wait. Review follow-up execution history.',
        },
        nextStepId: 'done',
      },
      { id: 'done', type: 'END', config: {} },
    ],
    [
      'Manual trigger with CRM recipient',
      'Send approved marketing template',
      'Wait for reply',
      'On timeout notify teammate; otherwise finish',
    ],
    {
      keyword: false,
      trigger: 'MANUAL',
      templatePurpose: 'MARKETING',
      externalRequirements: [
        meta,
        consent,
        approved,
        {
          key: 'reply_recipient',
          label: 'Reply recipient',
          implemented: true,
          description:
            'Supply a workspace CRM contact with a reachable phone. Replies are matched to that phone on the selected WhatsApp account.',
        },
      ],
    },
  ),
  pack(
    'property-inquiry',
    'Real estate viewing inquiry intake',
    'INDUSTRIES',
    'Assign a property inquiry to a teammate, create a viewing follow-up task containing the inbound request, and acknowledge the customer. Does not access listings or book a viewing.',
    [
      keyword,
      assignee,
      field(
        'taskTitle',
        'Viewing follow-up title',
        'string',
        'Title for the teammate’s viewing follow-up task.',
        { maxLength: 255 },
      ),
      message,
    ],
    [
      { type: 'ASSIGN_AGENT', config: { assigneeId: '$assigneeId', phone: '{{phone}}' } },
      {
        type: 'CREATE_TASK',
        config: {
          title: '$taskTitle',
          description: '{{body}}',
          assigneeId: '$assigneeId',
          dueInHours: 24,
        },
      },
      reply,
    ],
    [
      'Match property inquiry keyword',
      'Assign conversation',
      'Create task with inquiry details',
      'Acknowledge request',
    ],
    { requiredFeatures: ['whatsapp', 'workflow', 'crm'] },
  ),
  pack(
    'education-inquiry',
    'Education course inquiry intake',
    'INDUSTRIES',
    'Store an inbound course inquiry as a CRM note, notify an admissions teammate and reply with maintained course information. Does not enroll students or query a student system.',
    [keyword, assignee, message],
    [
      {
        type: 'CREATE_NOTE',
        config: {
          title: 'WhatsApp course inquiry',
          content: '{{body}}',
          tags: ['whatsapp', 'admissions'],
        },
      },
      {
        type: 'NOTIFY_TEAM',
        config: { userId: '$assigneeId', title: 'Course inquiry', message: '{{body}}' },
      },
      reply,
    ],
    [
      'Match course inquiry keyword',
      'Store CRM inquiry note',
      'Notify admissions teammate',
      'Reply with course information',
    ],
    { requiredFeatures: ['whatsapp', 'workflow', 'crm'] },
  ),
  pack(
    'travel-hospitality-inquiry',
    'Travel and hospitality inquiry intake',
    'INDUSTRIES',
    'Route an inbound travel or stay inquiry to a teammate, create a follow-up task, and acknowledge the request. It does not read availability, quote prices, or confirm a reservation.',
    [
      keyword,
      assignee,
      field(
        'taskTitle',
        'Follow-up task title',
        'string',
        'Task title for the travel or stay inquiry.',
        { maxLength: 255 },
      ),
      message,
    ],
    [
      { type: 'ASSIGN_AGENT', config: { assigneeId: '$assigneeId', phone: '{{phone}}' } },
      {
        type: 'CREATE_TASK',
        config: {
          title: '$taskTitle',
          description: '{{body}}',
          assigneeId: '$assigneeId',
          dueInHours: 24,
        },
      },
      reply,
    ],
    [
      'Match inquiry keyword',
      'Assign a teammate',
      'Create inquiry follow-up task',
      'Acknowledge the request',
    ],
    { requiredFeatures: ['whatsapp', 'workflow', 'crm'] },
  ),
  pack(
    'retail-service-inquiry',
    'Retail and service request intake',
    'INDUSTRIES',
    'Capture an inbound retail or service question in a CRM note, notify a teammate, and acknowledge the customer. It does not check product inventory, orders, refunds, or service availability.',
    [keyword, assignee, message],
    [
      {
        type: 'CREATE_NOTE',
        config: {
          title: 'WhatsApp retail or service request',
          content: '{{body}}',
          tags: ['whatsapp', 'service-request'],
        },
      },
      {
        type: 'NOTIFY_TEAM',
        config: {
          userId: '$assigneeId',
          title: 'Retail or service request',
          message: '{{body}}',
        },
      },
      reply,
    ],
    [
      'Match inquiry keyword',
      'Record CRM request note',
      'Notify a teammate',
      'Acknowledge the customer',
    ],
    { requiredFeatures: ['whatsapp', 'workflow', 'crm'] },
  ),
];

export const ALL_WHATSAPP_AUTOMATION_PRODUCTS: readonly AutomationProductDefinition[] = [
  ...WHATSAPP_AUTOMATION_PRODUCTS,
  ...WHATSAPP_AUTOMATION_PACKS,
];

const gap = (key: string, label: string, description: string): AutomationRequirement => ({
  key,
  label,
  description,
  implemented: false,
});
const overview = (
  key: AutomationCategoryOverview['key'],
  name: string,
  slugs: string[],
  externalRequirements: AutomationRequirement[],
): AutomationCategoryOverview => ({
  key,
  name,
  support: slugs.length ? 'PACK_AVAILABLE' : 'EXTERNAL_INTEGRATION',
  productSlugs: slugs.map((slug) => `${AUTOMATION_SLUG_PREFIX}${slug}`),
  externalRequirements,
});

/** Master-scope coverage; a reusable pack covers only the behavior in its description. */
export const WHATSAPP_AUTOMATION_CATEGORY_OVERVIEW: readonly AutomationCategoryOverview[] = [
  overview(
    'A',
    'AI assistants',
    ['ai-knowledge-reply'],
    [
      gap(
        'ai_tools',
        'Specialized assistant tools',
        'Commerce, calendar and media-reasoning tools need adapters and authorization; the knowledge pack answers text only.',
      ),
    ],
  ),
  overview(
    'B',
    'Team inbox',
    ['sales-handoff', 'support-escalation', 'resolve-conversation'],
    [
      gap(
        'inbox_routing',
        'Advanced inbox routing',
        'Manual, tenant/team round-robin, Redis-backed short-lived inbox presence and explicit online-teammate assignment, SLA reporting/owner notification, export and CSAT request/reply are available. Skill/availability routing, conversation merging and agent-performance reporting remain unavailable.',
      ),
    ],
  ),
  overview(
    'C',
    'Campaigns',
    [],
    [
      gap(
        'campaign_controls',
        'Campaign lifecycle integration',
        'The broadcast product supports approved templates, scheduling/recurrence, recipient-local scheduling, frequency caps and approval. Budget enforcement, A/B testing and reliable conversion attribution remain unavailable; catalog packs do not launch broadcasts.',
      ),
    ],
  ),
  overview(
    'D',
    'Sequences',
    ['follow-up-sequence', 'reply-timeout-handoff'],
    [
      gap(
        'sequence_entry',
        'Advanced sequence criteria',
        'Follow-ups reuse one approved template for three touches and support business-hours scheduling, stop-on-reply and stop-on-conversion. Arbitrary entry/goal criteria, per-contact timezone and richer sequence UX remain unavailable.',
      ),
    ],
  ),
  overview(
    'E',
    'Visual builder',
    [],
    [
      gap(
        'builder_controls',
        'Advanced builder controls',
        'The shared graph editor supports draft/publish, dry-run, undo/redo, WhatsApp and CRM triggers, delays, branching and AND/OR condition groups. Typed variable validation, AI tool controls and additional integration-backed triggers remain incomplete.',
      ),
    ],
  ),
  overview(
    'F',
    'Commerce',
    [],
    [
      gap(
        'commerce_adapters',
        'Shopify / WooCommerce adapters',
        'Shopify OAuth, configured webhook events and an inbound WhatsApp order-status lookup with sender-phone authorization are implemented. Cart recovery, catalog/product actions, WooCommerce and live protected-data verification require further integration work.',
      ),
    ],
  ),
  overview(
    'G',
    'Lead and sales',
    ['lead-capture', 'sales-handoff', 'deal-stage-update'],
    [
      gap(
        'lead_qualification',
        'Qualification and attribution',
        'Phone-only CRM lead creation is available through the installable capture pack and shared workflow action, using the existing CRM score calculation and source field. Tenant-scoped normalized email/phone deduplication covers CRM creates, bulk imports and workflow events; ambiguous matches fail closed. Configurable qualification/scoring, attribution and sales round-robin remain unavailable.',
      ),
    ],
  ),
  overview(
    'H',
    'Bookings',
    ['appointment-request'],
    [
      gap(
        'calendar_adapter',
        'Booking calendar adapter',
        'Intake creates a task only. Availability, confirmed slots, timezone-safe reminders, cancellation and rescheduling need a verified calendar adapter.',
      ),
    ],
  ),
  overview(
    'I',
    'Payments',
    ['payment-instructions'],
    [
      gap(
        'customer_payments',
        'Customer payment / invoice adapter',
        'Maintained instructions do not create or verify payments. Customer payment events and invoice authorization require an adapter; platform Stripe billing buys automation access only.',
      ),
    ],
  ),
  overview(
    'J',
    'Retention',
    ['customer-follow-up', 'new-contact-nurture'],
    [
      gap(
        'retention_events',
        'Retention event integrations',
        'Manual follow-up and campaign preference/frequency controls are available. Event-driven repeat-purchase, renewal and inactivity signals need business integrations; outcome attribution remains unavailable.',
      ),
    ],
  ),
  overview(
    'K',
    'Industries',
    [
      'property-inquiry',
      'education-inquiry',
      'travel-hospitality-inquiry',
      'retail-service-inquiry',
    ],
    [
      gap(
        'industry_systems',
        'Industry systems and review',
        'These starter packs route inquiries and create CRM follow-ups only; property inventory/viewing booking, student enrollment, travel availability/reservations, and retail inventory/order/refund actions require verified adapters. Healthcare and financial-services automations are gated and unavailable until jurisdiction-specific compliance, security, and integration reviews are complete.',
      ),
    ],
  ),
  overview(
    'L',
    'Notifications',
    ['team-alert', 'reply-timeout-handoff', 'deal-stage-update'],
    [
      gap(
        'authentication_events',
        'Authentication / security events',
        'Internal notifications and CRM utility templates are supported. OTP/security notifications require trusted account events and authentication-template support.',
      ),
    ],
  ),
  overview(
    'M',
    'Messaging',
    ['welcome-reply', 'opening-hours'],
    [
      gap(
        'rich_messaging',
        'Additional messaging capabilities',
        'Text, approved basic templates, interactive messages, media upload and inbound media retrieval are supported where the connected account allows them. Catalog packs use text/basic templates; media reasoning, WhatsApp Flows and commerce messages remain unavailable.',
      ),
    ],
  ),
  overview(
    'N',
    'Contacts and consent',
    ['lead-capture', 'customer-follow-up'],
    [
      gap(
        'consent_preferences',
        'Preferences and consent import',
        'Runtime purpose-specific consent, opt-out enforcement, contact preferences, CSV consent import and paginated global opt-out review with evidence-backed re-consent are available. Contact-level do-not-contact review and paginated bulk suppression/restore are available for existing CRM contacts; restoring contact status does not clear an opted-out consent record.',
      ),
    ],
  ),
  overview(
    'O',
    'Templates',
    ['deal-stage-update', 'customer-follow-up'],
    [
      gap(
        'template_dependencies',
        'Expanded template support',
        'Template submission, status refresh/webhooks, media headers, supported buttons and change history are available; authentication templates are not supported by this editor. Installable packs still require approved BODY-only templates, and comprehensive periodic provider-state reconciliation remains incomplete.',
      ),
    ],
  ),
  overview(
    'P',
    'Integrations',
    [],
    [
      gap(
        'external_connections',
        'External integration lifecycle',
        'Meta, CRM, AI and platform billing are reused. Commerce, Calendar, Sheets, Zapier and Make require verified connections, scopes, health checks and revocation handling.',
      ),
    ],
  ),
  overview(
    'Q',
    'Developer API',
    [],
    [
      gap(
        'developer_auth',
        'Scoped service authentication / replay',
        'Authenticated WhatsApp/workflow APIs, API-key authentication, execution history, idempotent inbound webhook handling and outbound webhook delivery replay are available. Broader scoped-key coverage and live queue retry/recovery still require verification.',
      ),
    ],
  ),
];

export function getAutomationDefinition(slug: string): AutomationProductDefinition | undefined {
  return ALL_WHATSAPP_AUTOMATION_PRODUCTS.find((product) => product.slug === slug);
}
