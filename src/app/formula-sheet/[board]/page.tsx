import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { boardData, boardIds, BoardId } from '@/data/formulaSheets/boardData';
import { ALL_FORMULAS } from '@/data/formulas';
import FormulaCard from '@/components/formulas/FormulaCard';
import { FormulaCategory } from '@/types/formula';

export const revalidate = false;

interface Props {
  params: Promise<{ board: string }>;
}

export async function generateStaticParams() {
  return boardIds.map((board) => ({
    board,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board } = await params;
  const data = boardData[board as BoardId];
  if (!data) return {};

  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: `/formula-sheet/${board}`,
    },
  };
}

export default async function BoardFormulaSheet({ params }: Props) {
  const { board } = await params;
  const data = boardData[board as BoardId];

  if (!data) {
    notFound();
  }

  // Filter formulas for this board
  const boardFormulas = ALL_FORMULAS.filter((f) => data.categories.includes(f.category));

  // Group formulas by category
  const groupedFormulas = data.categories.reduce((acc, category) => {
    acc[category] = boardFormulas.filter((f) => f.category === category);
    return acc;
  }, {} as Record<string, typeof ALL_FORMULAS>);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": data.title,
    "description": data.description,
    "applicationCategory": "EducationalApplication",
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#131313] py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/formulas"
            className="text-[#5D4037] hover:text-[#3E2723] dark:text-[#D7CCC8] dark:hover:text-white text-sm font-medium transition-colors"
          >
            &larr; Back to All Formulas
          </Link>
        </div>

        {/* Header Section — Compact */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#131313] dark:text-white mb-2">
            {data.h1}
          </h1>
          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] leading-relaxed max-w-3xl">
            {data.intro}
          </p>
        </header>

        {/* Formulas Grid by Category */}
        <div className="space-y-16">
          {data.categories.map((categoryKey) => {
            const formulas = groupedFormulas[categoryKey];
            if (!formulas || formulas.length === 0) return null;
            
            return (
              <section key={categoryKey}>
                <h2 className="text-2xl font-bold text-[#5D4037] dark:text-[#D7CCC8] border-b border-[#E0E0E0] dark:border-[#2E2825] pb-2 mb-6 capitalize">
                  {categoryKey.replace(/([A-Z])/g, ' $1').trim()}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {formulas.map((formula) => (
                    <FormulaCard key={formula.id} formula={formula} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Related Boards */}
        <div className="mt-16 pt-8 border-t border-[#E0E0E0] dark:border-[#2E2825]">
          <h3 className="text-xl font-bold text-[#131313] dark:text-white mb-4">
            Related Formula Sheets
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.relatedBoards.map((relatedId) => {
              const relatedData = boardData[relatedId];
              if (!relatedData) return null;
              return (
                <Link
                  key={relatedId}
                  href={`/formula-sheet/${relatedId}`}
                  className="px-4 py-2 bg-[#EFEBE9] hover:bg-[#D7CCC8] dark:bg-[#2E2825] dark:hover:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] rounded-xl text-sm font-medium transition-colors border border-[#E0E0E0] dark:border-[#5D4037]/50"
                >
                  {relatedData.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
