import { JsonLd } from '@/components/marketing/JsonLd';
import TestimonialsPageContent from '@/components/marketing/pages/TestimonialsPageContent';
import { testimonialsJsonLd } from '@/lib/marketing/seo';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'VP of Revenue',
    company: 'ScaleFlow Inc.',
    quote:
      'AutopilotMonster replaced our CRM, dialer, and WhatsApp tools. Our SDR team books 3x more meetings with AI voice agents handling first touch.',
  },
  {
    name: 'Marcus Webb',
    role: 'Head of Sales Operations',
    company: 'Northwind Logistics',
    quote:
      'Pipeline forecasting finally matches reality. The AI scoring and workflow automation cut our lead response time from hours to seconds.',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Founder & CEO',
    company: 'BrightCart Commerce',
    quote:
      'WhatsApp broadcast campaigns drove 340% ROI in the first quarter. The visual flow builder let us launch automations without engineering.',
  },
  {
    name: 'James Okonkwo',
    role: 'Customer Success Director',
    company: 'Vertex SaaS',
    quote:
      'Multi-tenant isolation and RBAC were non-negotiable for our enterprise clients. AutopilotMonster passed security review in week one.',
  },
  {
    name: 'Priya Sharma',
    role: 'GTM Lead',
    company: 'Aurora FinTech',
    quote:
      'We unified inbound, outbound, and support in one inbox. Agents resolve tickets faster with AI-suggested replies and full contact context.',
  },
  {
    name: 'Tom Becker',
    role: 'Director of Automation',
    company: 'Meridian Health',
    quote:
      'The workflow engine connects voice outcomes to CRM updates automatically. We eliminated manual data entry across the entire sales cycle.',
  },
];

export default function TestimonialsPage() {
  return (
    <>
      <JsonLd data={testimonialsJsonLd(testimonials)} />
      <TestimonialsPageContent testimonials={testimonials} />
    </>
  );
}
