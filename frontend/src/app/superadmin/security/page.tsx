import { redirect } from 'next/navigation';

export default function SuperAdminSecurityRedirect() {
  redirect('/superadmin/settings/security');
}
