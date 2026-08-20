import { redirect } from 'next/navigation';

/**
 * Root page — redirects to the Calculator module as the default landing page.
 */
export default function Home() {
  redirect('/calculator');
}
