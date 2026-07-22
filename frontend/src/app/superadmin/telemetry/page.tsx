import { redirect } from 'next/navigation';

export default function SuperAdminTelemetryRedirect() {
  redirect('/superadmin/metrics');
}
