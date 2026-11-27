import { redirect } from 'next/navigation';

const WESSALI_ADMIN_URL =
  process.env.NEXT_PUBLIC_WESSALI_ADMIN_URL ??
  'https://wessali-platform.anesteb8.workers.dev/admin';

export default function DashboardPage() {
  redirect(WESSALI_ADMIN_URL);
}
