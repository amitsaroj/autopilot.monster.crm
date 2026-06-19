import { DataSource } from 'typeorm';

import { Activity, ActivityType } from '../database/entities/activity.entity';
import { AnalyticsDashboard } from '../database/entities/analytics-dashboard.entity';
import { Company } from '../database/entities/company.entity';
import { Contact, ContactStatus } from '../database/entities/contact.entity';
import { Deal, DealStatus } from '../database/entities/deal.entity';
import { Lead } from '../database/entities/lead.entity';
import { Pipeline } from '../database/entities/pipeline.entity';
import { PipelineStage } from '../database/entities/pipeline-stage.entity';
import { Plan } from '../database/entities/plan.entity';
import { Subscription } from '../database/entities/subscription.entity';
import { Task, TaskPriority, TaskStatus } from '../database/entities/task.entity';
import type { UserEntity } from '../modules/auth/entities/user.entity';

const DEMO_PIPELINE_NAME = 'Sales Pipeline';

interface DemoUserMap {
  superadmin?: UserEntity;
  admin?: UserEntity;
  manager?: UserEntity;
  user?: UserEntity;
  agent?: UserEntity;
}

export async function seedDemoSubscription(
  dataSource: DataSource,
  tenantId: string,
): Promise<void> {
  const planRepo = dataSource.getRepository(Plan);
  const subscriptionRepo = dataSource.getRepository(Subscription);

  const enterprisePlan = await planRepo.findOneBy({ slug: 'ENTERPRISE' });
  if (!enterprisePlan) {
    console.warn('Enterprise plan not found — skipping demo subscription');
    return;
  }

  const existing = await subscriptionRepo.findOne({
    where: { tenantId, status: 'ACTIVE' },
  });
  if (existing) {
    console.log('Demo subscription already exists');
    return;
  }

  await subscriptionRepo.save(
    subscriptionRepo.create({
      tenantId,
      planId: enterprisePlan.id,
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
    }),
  );
  console.log('Created demo Enterprise subscription');
}

export async function seedDemoCrmData(
  dataSource: DataSource,
  tenantId: string,
  users: DemoUserMap,
): Promise<void> {
  const pipelineRepo = dataSource.getRepository(Pipeline);
  const existingPipeline = await pipelineRepo.findOne({
    where: { tenantId, name: DEMO_PIPELINE_NAME },
  });
  if (existingPipeline) {
    console.log('Demo CRM data already exists');
    return;
  }

  const companyRepo = dataSource.getRepository(Company);
  const contactRepo = dataSource.getRepository(Contact);
  const stageRepo = dataSource.getRepository(PipelineStage);
  const dealRepo = dataSource.getRepository(Deal);
  const activityRepo = dataSource.getRepository(Activity);
  const taskRepo = dataSource.getRepository(Task);
  const leadRepo = dataSource.getRepository(Lead);
  const dashboardRepo = dataSource.getRepository(AnalyticsDashboard);

  const ownerId = users.manager?.id ?? users.admin?.id ?? users.user?.id;
  const agentId = users.agent?.id ?? users.user?.id;

  const companies = await companyRepo.save([
    companyRepo.create({
      tenantId,
      name: 'Acme Robotics',
      domain: 'acmerobotics.com',
      website: 'https://acmerobotics.com',
      industry: 'Manufacturing',
      city: 'Austin',
      country: 'USA',
      sizeRange: '201-500',
      annualRevenueRange: '$10M-$50M',
      tags: ['enterprise', 'automation'],
    }),
    companyRepo.create({
      tenantId,
      name: 'NovaHealth Systems',
      domain: 'novahealth.io',
      website: 'https://novahealth.io',
      industry: 'Healthcare',
      city: 'Boston',
      country: 'USA',
      sizeRange: '501-1000',
      annualRevenueRange: '$50M-$100M',
      tags: ['healthcare', 'saas'],
    }),
    companyRepo.create({
      tenantId,
      name: 'CloudSync Technologies',
      domain: 'cloudsync.tech',
      website: 'https://cloudsync.tech',
      industry: 'Software',
      city: 'San Francisco',
      country: 'USA',
      sizeRange: '51-200',
      annualRevenueRange: '$5M-$10M',
      tags: ['saas', 'devtools'],
    }),
    companyRepo.create({
      tenantId,
      name: 'GreenRoute Logistics',
      domain: 'greenroute.co',
      website: 'https://greenroute.co',
      industry: 'Logistics',
      city: 'Chicago',
      country: 'USA',
      sizeRange: '201-500',
      annualRevenueRange: '$10M-$50M',
      tags: ['logistics', 'sustainability'],
    }),
  ]);

  const contacts = await contactRepo.save([
    contactRepo.create({
      tenantId,
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@acmerobotics.com',
      phone: '+1-512-555-0101',
      jobTitle: 'VP Operations',
      companyId: companies[0].id,
      ownerId,
      status: ContactStatus.PROSPECT,
      leadSource: 'Inbound Demo',
      tags: ['hot-lead'],
    }),
    contactRepo.create({
      tenantId,
      firstName: 'Marcus',
      lastName: 'Webb',
      email: 'marcus.webb@novahealth.io',
      phone: '+1-617-555-0102',
      jobTitle: 'Director of IT',
      companyId: companies[1].id,
      ownerId: users.admin?.id ?? ownerId,
      status: ContactStatus.CUSTOMER,
      leadSource: 'Referral',
      tags: ['expansion'],
    }),
    contactRepo.create({
      tenantId,
      firstName: 'Elena',
      lastName: 'Rodriguez',
      email: 'elena.rodriguez@cloudsync.tech',
      phone: '+1-415-555-0103',
      jobTitle: 'Head of Sales',
      companyId: companies[2].id,
      ownerId: users.user?.id ?? ownerId,
      status: ContactStatus.LEAD,
      leadSource: 'Conference',
      tags: ['demo-requested'],
    }),
    contactRepo.create({
      tenantId,
      firstName: 'James',
      lastName: 'Okonkwo',
      email: 'james.okonkwo@greenroute.co',
      phone: '+1-312-555-0104',
      jobTitle: 'COO',
      companyId: companies[3].id,
      ownerId,
      status: ContactStatus.PROSPECT,
      leadSource: 'Outbound',
      tags: ['mid-market'],
    }),
    contactRepo.create({
      tenantId,
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@acmerobotics.com',
      phone: '+1-512-555-0105',
      jobTitle: 'Procurement Manager',
      companyId: companies[0].id,
      ownerId: users.agent?.id ?? agentId,
      status: ContactStatus.LEAD,
      leadSource: 'Website',
    }),
    contactRepo.create({
      tenantId,
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@cloudsync.tech',
      phone: '+1-415-555-0106',
      jobTitle: 'Solutions Architect',
      companyId: companies[2].id,
      ownerId: users.user?.id ?? ownerId,
      status: ContactStatus.PROSPECT,
      leadSource: 'Partner',
    }),
    contactRepo.create({
      tenantId,
      firstName: 'Amelia',
      lastName: 'Foster',
      email: 'amelia.foster@novahealth.io',
      phone: '+1-617-555-0107',
      jobTitle: 'Clinical Operations Lead',
      companyId: companies[1].id,
      ownerId: users.agent?.id ?? agentId,
      status: ContactStatus.CUSTOMER,
      leadSource: 'Upsell',
    }),
    contactRepo.create({
      tenantId,
      firstName: 'Tom',
      lastName: 'Harris',
      email: 'tom.harris@greenroute.co',
      phone: '+1-312-555-0108',
      jobTitle: 'Fleet Director',
      companyId: companies[3].id,
      ownerId: users.manager?.id ?? ownerId,
      status: ContactStatus.LEAD,
      leadSource: 'Trade Show',
    }),
  ]);

  const pipeline = await pipelineRepo.save(
    pipelineRepo.create({
      tenantId,
      name: DEMO_PIPELINE_NAME,
      order: 0,
    }),
  );

  const stageDefinitions = [
    { name: 'Lead', order: 0, probability: 10 },
    { name: 'Qualified', order: 1, probability: 30 },
    { name: 'Proposal', order: 2, probability: 50 },
    { name: 'Negotiation', order: 3, probability: 75 },
    { name: 'Won', order: 4, probability: 100 },
  ];

  const stages = await stageRepo.save(
    stageDefinitions.map((stage) =>
      stageRepo.create({
        tenantId,
        pipelineId: pipeline.id,
        name: stage.name,
        order: stage.order,
        probability: stage.probability,
      }),
    ),
  );

  const [leadStage, qualifiedStage, proposalStage, negotiationStage, wonStage] = stages;

  const deals = await dealRepo.save([
    dealRepo.create({
      tenantId,
      name: 'Acme Robotics — Platform Rollout',
      value: 84000,
      currency: 'USD',
      pipelineId: pipeline.id,
      stageId: negotiationStage.id,
      contactId: contacts[0].id,
      companyId: companies[0].id,
      ownerId,
      status: DealStatus.OPEN,
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      tags: ['enterprise'],
    }),
    dealRepo.create({
      tenantId,
      name: 'NovaHealth — Annual Renewal',
      value: 120000,
      currency: 'USD',
      pipelineId: pipeline.id,
      stageId: wonStage.id,
      contactId: contacts[1].id,
      companyId: companies[1].id,
      ownerId: users.admin?.id ?? ownerId,
      status: DealStatus.WON,
      probability: 100,
      actualCloseDate: new Date(),
      tags: ['renewal'],
    }),
    dealRepo.create({
      tenantId,
      name: 'CloudSync — Starter Pilot',
      value: 18000,
      currency: 'USD',
      pipelineId: pipeline.id,
      stageId: proposalStage.id,
      contactId: contacts[2].id,
      companyId: companies[2].id,
      ownerId: users.user?.id ?? ownerId,
      status: DealStatus.OPEN,
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tags: ['pilot'],
    }),
    dealRepo.create({
      tenantId,
      name: 'GreenRoute — Fleet Integration',
      value: 56000,
      currency: 'USD',
      pipelineId: pipeline.id,
      stageId: qualifiedStage.id,
      contactId: contacts[3].id,
      companyId: companies[3].id,
      ownerId,
      status: DealStatus.OPEN,
      probability: 30,
      tags: ['integration'],
    }),
    dealRepo.create({
      tenantId,
      name: 'CloudSync — Enterprise Upgrade',
      value: 95000,
      currency: 'USD',
      pipelineId: pipeline.id,
      stageId: leadStage.id,
      contactId: contacts[5].id,
      companyId: companies[2].id,
      ownerId: users.user?.id ?? ownerId,
      status: DealStatus.OPEN,
      probability: 10,
      tags: ['upsell'],
    }),
    dealRepo.create({
      tenantId,
      name: 'NovaHealth — Support Add-on',
      value: 24000,
      currency: 'USD',
      pipelineId: pipeline.id,
      stageId: negotiationStage.id,
      contactId: contacts[6].id,
      companyId: companies[1].id,
      ownerId: users.agent?.id ?? agentId,
      status: DealStatus.OPEN,
      probability: 75,
      tags: ['support'],
    }),
  ]);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  await activityRepo.save([
    activityRepo.create({
      tenantId,
      type: ActivityType.CALL,
      subject: 'Discovery call with Sarah Chen',
      description: 'Reviewed automation requirements and integration timeline.',
      contactId: contacts[0].id,
      dealId: deals[0].id,
      companyId: companies[0].id,
      ownerId,
      occurredAt: new Date(now - 2 * day),
      durationMinutes: 45,
      outcome: 'Positive — requested proposal',
    }),
    activityRepo.create({
      tenantId,
      type: ActivityType.MEETING,
      subject: 'NovaHealth renewal review',
      description: 'Confirmed renewal terms and support SLA.',
      contactId: contacts[1].id,
      dealId: deals[1].id,
      companyId: companies[1].id,
      ownerId: users.admin?.id ?? ownerId,
      occurredAt: new Date(now - 5 * day),
      durationMinutes: 60,
      outcome: 'Closed won',
    }),
    activityRepo.create({
      tenantId,
      type: ActivityType.EMAIL,
      subject: 'Sent pilot pricing to CloudSync',
      description: 'Shared tiered pricing and onboarding checklist.',
      contactId: contacts[2].id,
      dealId: deals[2].id,
      companyId: companies[2].id,
      ownerId: users.user?.id ?? ownerId,
      occurredAt: new Date(now - 1 * day),
      outcome: 'Awaiting response',
    }),
    activityRepo.create({
      tenantId,
      type: ActivityType.WHATSAPP,
      subject: 'Follow-up with Priya Sharma',
      description: 'Confirmed procurement review meeting next week.',
      contactId: contacts[4].id,
      companyId: companies[0].id,
      ownerId: users.agent?.id ?? agentId,
      occurredAt: new Date(now - 3 * day),
      outcome: 'Meeting scheduled',
    }),
    activityRepo.create({
      tenantId,
      type: ActivityType.CALL,
      subject: 'Technical scoping — GreenRoute',
      description: 'Discussed API endpoints and fleet data sync.',
      contactId: contacts[3].id,
      dealId: deals[3].id,
      companyId: companies[3].id,
      ownerId,
      occurredAt: new Date(now - 4 * day),
      durationMinutes: 30,
      outcome: 'Needs security review',
    }),
    activityRepo.create({
      tenantId,
      type: ActivityType.NOTE,
      subject: 'Competitive intel — CloudSync deal',
      description: 'Evaluating against two other CRM vendors.',
      contactId: contacts[5].id,
      dealId: deals[4].id,
      companyId: companies[2].id,
      ownerId: users.user?.id ?? ownerId,
      occurredAt: new Date(now - 6 * day),
    }),
  ]);

  await taskRepo.save([
    taskRepo.create({
      tenantId,
      title: 'Send Acme Robotics proposal',
      description: 'Include implementation timeline and success metrics.',
      contactId: contacts[0].id,
      dealId: deals[0].id,
      assigneeId: ownerId,
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date(now + 2 * day),
    }),
    taskRepo.create({
      tenantId,
      title: 'Schedule NovaHealth QBR',
      description: 'Quarterly business review with Marcus Webb.',
      contactId: contacts[1].id,
      dealId: deals[1].id,
      assigneeId: users.admin?.id ?? ownerId,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.OPEN,
      dueDate: new Date(now + 7 * day),
    }),
    taskRepo.create({
      tenantId,
      title: 'Prepare CloudSync demo environment',
      contactId: contacts[2].id,
      dealId: deals[2].id,
      assigneeId: users.user?.id ?? ownerId,
      priority: TaskPriority.HIGH,
      status: TaskStatus.OPEN,
      dueDate: new Date(now + 1 * day),
    }),
    taskRepo.create({
      tenantId,
      title: 'Resolve support ticket #1042',
      description: 'WhatsApp channel routing issue for Amelia Foster.',
      contactId: contacts[6].id,
      assigneeId: users.agent?.id ?? agentId,
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date(now + day),
    }),
    taskRepo.create({
      tenantId,
      title: 'Update GreenRoute integration docs',
      contactId: contacts[3].id,
      dealId: deals[3].id,
      assigneeId: users.manager?.id ?? ownerId,
      priority: TaskPriority.LOW,
      status: TaskStatus.OPEN,
      dueDate: new Date(now + 10 * day),
    }),
  ]);

  await leadRepo.save([
    leadRepo.create({
      tenantId,
      firstName: 'Rachel',
      lastName: 'Nguyen',
      phone: '+1-206-555-0201',
      email: 'rachel.nguyen@example.com',
      status: 'NEW',
      score: 72,
      aiSummary: 'High intent — visited pricing page 3 times this week.',
    }),
    leadRepo.create({
      tenantId,
      firstName: 'Oliver',
      lastName: 'Grant',
      phone: '+1-303-555-0202',
      email: 'oliver.grant@example.com',
      status: 'NEW',
      score: 58,
      aiSummary: 'Downloaded whitepaper on AI voice agents.',
    }),
    leadRepo.create({
      tenantId,
      firstName: 'Sofia',
      lastName: 'Martinez',
      phone: '+1-305-555-0203',
      email: 'sofia.martinez@example.com',
      status: 'CONTACTED',
      score: 81,
      aiSummary: 'Requested live demo via website form.',
    }),
    leadRepo.create({
      tenantId,
      firstName: 'Liam',
      lastName: 'Patel',
      phone: '+1-404-555-0204',
      status: 'NEW',
      score: 45,
      aiSummary: 'Inbound call — interested in WhatsApp automation.',
    }),
  ]);

  await dashboardRepo.save(
    dashboardRepo.create({
      tenantId,
      name: 'Demo Sales Overview',
      description: 'Pre-built dashboard for the /demo sandbox environment.',
      isDefault: true,
      widgets: [
        { type: 'kpi', metric: 'pipeline_value', label: 'Pipeline Value' },
        { type: 'kpi', metric: 'deals_won', label: 'Deals Won' },
        { type: 'chart', metric: 'deals_by_stage', label: 'Deals by Stage' },
        { type: 'chart', metric: 'activities_timeline', label: 'Recent Activity' },
      ],
    }),
  );

  console.log(
    `Seeded demo CRM data: ${companies.length} companies, ${contacts.length} contacts, ${deals.length} deals`,
  );
}
