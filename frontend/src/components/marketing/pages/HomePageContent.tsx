import Link from 'next/link';
import {
  ArrowRight,
  Users,
  Bot,
  Phone,
  MessageSquare,
  GitBranch,
  BarChart3,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

const capabilities = [
  {
    icon: Users,
    title: 'A connected customer workspace',
    description:
      'Keep contacts, companies, leads, deals, tasks, and communication history together.',
    href: '/product/crm',
  },
  {
    icon: Bot,
    title: 'AI configured around your work',
    description: 'Manage agents, prompts, conversations, and your knowledge base in one place.',
    href: '/product/ai',
  },
  {
    icon: GitBranch,
    title: 'Turn repeat work into a workflow',
    description: 'Connect triggers, conditions, and actions with a visual automation builder.',
    href: '/product/workflow',
  },
  {
    icon: MessageSquare,
    title: 'Keep the conversation connected',
    description:
      'Bring WhatsApp templates, broadcasts, and shared conversations into your customer workflow.',
    href: '/product/whatsapp',
  },
  {
    icon: Phone,
    title: 'Calling with context',
    description:
      'Manage voice campaigns, call history, and transcripts alongside customer records.',
    href: '/product/voice',
  },
  {
    icon: BarChart3,
    title: 'See the work moving forward',
    description: 'Explore your pipeline, revenue, and team activity with connected reporting.',
    href: '/product/analytics',
  },
];

export default function HomePageContent() {
  return (
    <>
      <section
        aria-labelledby="hero-heading"
        className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-background"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-20 items-center">
          <div>
            <p className="product-eyebrow mb-6">Customer relationships. On autopilot.</p>
            <h1
              id="hero-heading"
              className="text-[clamp(2.8rem,5vw,4.8rem)] leading-[1.04] font-semibold tracking-[-.055em] text-foreground"
            >
              Less busywork.
              <br />
              More <span className="text-primary">momentum.</span>
            </h1>
            <p className="mt-7 text-lg leading-relaxed text-muted-foreground max-w-lg">
              Your CRM, AI agents, conversations, and automations. One connected workspace to move
              customer relationships forward.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="product-button product-button-primary">
                Create your workspace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/demo" className="product-button product-button-secondary">
                Explore the product
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {['Connected CRM', 'Visual workflows', 'Multi-channel communication'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="product-map product-panel p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <BrandLogo />
              <span className="text-[10px] text-muted-foreground">Product overview</span>
            </div>
            <div className="pt-6 flex items-center justify-between">
              <h2 className="font-semibold">A connected customer journey</h2>
              <GitBranch className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From the first conversation to the next action.
            </p>
            <div className="mt-7 space-y-0">
              {[
                { icon: Users, title: 'Customer context', detail: 'Contacts · companies · deals' },
                {
                  icon: MessageSquare,
                  title: 'Conversations',
                  detail: 'WhatsApp · voice · shared inbox',
                },
                { icon: Bot, title: 'AI & automation', detail: 'Agents · knowledge · workflows' },
              ].map((step, index) => (
                <div key={step.title}>
                  {index > 0 && <div className="h-6 border-l-2 border-dashed border-border ml-6" />}
                  <div className="flex items-center gap-4 border border-border bg-background rounded-lg p-4">
                    <span className="w-10 h-10 shrink-0 rounded-lg bg-card flex items-center justify-center text-primary border border-border">
                      <step.icon className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{step.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>
                    </div>
                    <Check className="ml-auto w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/product"
              className="flex justify-between items-center mt-6 text-xs font-semibold text-primary"
            >
              Explore how the modules connect <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <p className="product-eyebrow mb-4">One workspace, connected capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Built for the work
              <br />
              between every interaction.
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed md:pt-8 max-w-lg">
            Customer work crosses teams and channels. Give your team a consistent place to manage
            relationships, configure automation, and follow the results.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-x-16">
          {capabilities.map((feature) => (
            <Link key={feature.href} href={feature.href} className="home-feature group">
              <span className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-primary">
                <feature.icon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-semibold mb-2 transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 mt-1 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-accent/50 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-[1fr_1.3fr] gap-12">
          <div>
            <p className="product-eyebrow mb-4">From setup to action</p>
            <h2 className="text-3xl font-semibold">
              Make the workspace
              <br />
              your own.
            </h2>
            <Link
              href="/integrations"
              className="mt-6 inline-flex gap-2 items-center text-primary text-sm font-semibold"
            >
              Explore integrations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ol className="space-y-8">
            {[
              [
                'Connect your customer work',
                'Bring contacts, deals, and team activity into a shared workspace.',
              ],
              [
                'Configure your automation',
                'Set up agents and workflows around the actions your team needs.',
              ],
              [
                'Follow the results',
                'Review conversations, workflow runs, and reporting as your work progresses.',
              ],
            ].map(([title, description], index) => (
              <li key={title} className="flex gap-5">
                <span className="text-primary text-xs font-mono mt-1">0{index + 1}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="product-panel p-8 sm:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div>
            <ShieldCheck className="w-6 h-6 text-primary mb-4" />
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Your team. Your workspace. Your controls.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
              Manage workspace access with roles and permissions. Explore plans and choose the
              capabilities your team needs.
            </p>
            <Link href="/security" className="inline-flex mt-4 text-sm text-primary font-semibold">
              Explore security and access controls
            </Link>
          </div>
          <Link href="/pricing" className="product-button product-button-primary shrink-0">
            Explore plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
