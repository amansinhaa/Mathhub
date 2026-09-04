'use client';

import dynamic from 'next/dynamic';

const GraphModule = dynamic(() => import('@/components/graph/GraphModule'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 rounded-2xl bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#2E2825] text-sm text-[#757575] dark:text-[#8D827A]">
      Loading graph…
    </div>
  ),
});

export default function GraphModuleClient() {
  return <GraphModule />;
}
