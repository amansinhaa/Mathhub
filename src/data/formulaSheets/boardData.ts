import { FormulaCategory } from '@/types/formula';

export type BoardId = 'gcse' | 'a-level' | 'edexcel' | 'aqa' | 'igcse' | 'class-10' | 'class-12';

export interface BoardMeta {
  id: BoardId;
  title: string;        // e.g. 'GCSE Maths Formula Sheet'
  h1: string;           // same as title
  description: string;  // under 160 chars for meta
  intro: string;        // 100-150 word intro paragraph
  categories: string[]; // FormulaCategory values to include
  relatedBoards: BoardId[]; // sibling pages to link to
}

export const boardData: Record<BoardId, BoardMeta> = {
  gcse: {
    id: 'gcse',
    title: 'GCSE Maths Formula Sheet (2026) — Printable + Interactive Solvers | EasyEquate',
    h1: 'GCSE Maths Formula Sheet (2026)',
    description: 'Complete GCSE Maths formula sheet (Higher & Foundation) for 2026 exams. Clean revision formulas for algebra, quadratics, trigonometry, geometry, and probability with interactive solver practice.',
    intro: 'Preparing for your GCSE Maths exams requires a solid grasp of key mathematical principles and the ability to apply them correctly. This comprehensive GCSE Maths formula sheet is designed to be your ultimate revision companion. We have carefully curated the most essential formulas you will need across the core topics, including algebra, geometry, trigonometry, probability, and mensuration. Whether you are revising for a mock exam or doing your final preparations, having these formulas at your fingertips will help you tackle complex problems with confidence. Review these formulas regularly, understand when and how to apply them, and you will be well on your way to achieving your target grade. Use this guide to quickly look up formulas during practice sessions or as a last-minute refresher before stepping into the exam hall.',
    categories: ['algebra', 'geometry', 'trigonometry', 'probability', 'mensuration'],
    relatedBoards: ['a-level', 'edexcel', 'aqa', 'igcse'],
  },
  'a-level': {
    id: 'a-level',
    title: 'A-Level Maths Formula Sheet (2026) — Printable + Interactive Solvers | EasyEquate',
    h1: 'A-Level Maths Formula Sheet (2026)',
    description: 'Essential A-Level Maths formulas for Pure, Mechanics & Statistics. Differentiation, integration, trigonometry, vectors, and logarithms with printable PDF and interactive step-by-step solvers.',
    intro: 'The A-Level Maths curriculum introduces advanced mathematical concepts that form the foundation for many STEM degrees and careers. To succeed, you need to be comfortable with a wide range of complex formulas. This A-Level Maths formula sheet brings together the critical equations and identities you must know, spanning across algebra, calculus, trigonometry, logarithms, vectors, and probability. From integration and differentiation rules to trigonometric identities and vector equations, this sheet serves as a quick reference guide to support your studies. While some formulas are provided in the exam booklet, knowing them by heart will save you valuable time and reduce errors. Use this resource to test your memory, reinforce your understanding during homework, and streamline your exam revision process for maximum efficiency and success.',
    categories: ['algebra', 'calculus', 'trigonometry', 'logarithms', 'vectors', 'probability'],
    relatedBoards: ['gcse', 'edexcel', 'aqa'],
  },
  edexcel: {
    id: 'edexcel',
    title: 'Edexcel GCSE Maths Formula Sheet (2026) — Printable + Interactive Solvers | EasyEquate',
    h1: 'Edexcel GCSE & A-Level Maths Formula Sheet (2026)',
    description: 'Official Edexcel Maths syllabus formula sheet for GCSE and A-Level (2026). Master quadratics, calculus, trigonometry identities, and coordinate geometry with exam-style practice in our solver.',
    intro: 'If you are studying under the Edexcel exam board, this tailored Maths formula sheet is specifically designed to align with your syllabus requirements. Edexcel exams are known for their rigorous problem-solving questions, making it crucial to have a firm command of all relevant formulas. We have compiled all the vital formulas for algebra, calculus, trigonometry, vectors, probability, and geometry into one convenient location. This targeted resource ensures you are focusing on exactly what you need for the Edexcel specifications without getting bogged down by irrelevant information. By incorporating this formula sheet into your regular study routine, you can build fluency in applying these mathematical tools. Whether you are tackling past papers or reviewing challenging topics, this guide will provide the quick answers you need to keep your momentum going.',
    categories: ['algebra', 'calculus', 'trigonometry', 'vectors', 'probability', 'geometry'],
    relatedBoards: ['gcse', 'a-level', 'aqa'],
  },
  aqa: {
    id: 'aqa',
    title: 'AQA GCSE Maths Formula Sheet (2026) — Printable + Interactive Solvers | EasyEquate',
    h1: 'AQA GCSE & A-Level Maths Formula Sheet (2026)',
    description: 'Comprehensive AQA Maths formula sheet (2026) covering algebra, quadratics, trigonometry, probability, and calculus. Download printable PDF revision guide or practice formulas directly in our solver.',
    intro: 'Achieving top marks in your AQA Maths exams demands a thorough understanding of mathematical concepts and the ability to recall key formulas instantly. This AQA-specific formula sheet is designed to support your revision by grouping together all the indispensable formulas from the AQA syllabus. Covering essential topics such as algebra, geometry, trigonometry, probability, and calculus, this guide is an invaluable asset for any AQA student. Knowing these formulas inside out will allow you to focus your mental energy on the logical steps of solving the problem, rather than struggling to remember the starting equation. Keep this sheet handy while working through practice exercises, use it to create flashcards, and refer to it whenever you encounter a mental block. Consistent review is the key to mastering these mathematical tools.',
    categories: ['algebra', 'geometry', 'trigonometry', 'probability', 'calculus'],
    relatedBoards: ['gcse', 'a-level', 'edexcel'],
  },
  igcse: {
    id: 'igcse',
    title: 'Cambridge IGCSE Maths Formula Sheet (2026) — Printable + Interactive Solvers | EasyEquate',
    h1: 'Cambridge IGCSE Maths Formula Sheet (2026)',
    description: 'Complete Cambridge IGCSE Maths (0580 / 0607 / 0980) formula sheet for Core and Extended 2026 syllabus. Algebra, mensuration, trigonometry, and probability with instant solver practice.',
    intro: 'The IGCSE Maths syllabus is broad and challenging, requiring students to master a wide array of mathematical techniques. To help you navigate this demanding course, we have created a comprehensive IGCSE Maths formula sheet. This carefully organised resource includes all the crucial formulas you need to know, covering algebra, geometry, trigonometry, probability, mensuration, and logarithms. The international nature of the IGCSE means the standards are high, and having these formulas memorised is a significant advantage. Whether you are studying the core or extended curriculum, this guide will serve as a reliable reference point throughout your studies. Use it to check your work, guide your revision, and ensure you are fully prepared to tackle any question the exam paper throws your way with complete confidence.',
    categories: ['algebra', 'geometry', 'trigonometry', 'probability', 'mensuration', 'logarithms'],
    relatedBoards: ['gcse', 'a-level', 'edexcel'],
  },
  'class-10': {
    id: 'class-10',
    title: 'Class 10 Maths Formula Sheet (2026) — Printable + Interactive Solvers | EasyEquate',
    h1: 'CBSE & ICSE Class 10 Maths Formula Sheet (2026)',
    description: 'All Class 10 Maths formulas for CBSE, ICSE, and State Boards (2026). Quadratic equations, arithmetic progressions, trigonometry, circles, surface areas, and statistics with printable PDF and solver steps.',
    intro: 'Class 10 is a pivotal year for students, with board exams setting the stage for future academic pursuits. Mathematics is a core subject where scoring highly can significantly boost your overall percentage. This Class 10 Maths formula sheet is meticulously designed to help you achieve exactly that. It covers all the fundamental formulas from the syllabus, including algebra, geometry, trigonometry, mensuration, probability, and number theory. Having a consolidated list of formulas makes revision much more efficient, allowing you to quickly review key concepts before an exam. Practice applying these formulas to various types of problems to ensure you not only remember them but also understand their practical application. This resource is perfect for daily review and is guaranteed to enhance your problem-solving speed and accuracy during the actual board exams.',
    categories: ['algebra', 'geometry', 'trigonometry', 'mensuration', 'probability', 'numberTheory'],
    relatedBoards: ['class-12', 'gcse', 'igcse'],
  },
  'class-12': {
    id: 'class-12',
    title: 'Class 12 Maths Formula Sheet (2026) — Printable + Interactive Solvers | EasyEquate',
    h1: 'CBSE & ISC Class 12 Maths Formula Sheet (2026)',
    description: 'Exhaustive Class 12 Maths formulas for CBSE, ISC, and JEE preparation (2026). Full calculus (derivatives & integrals), matrices, determinants, 3D geometry, and vectors with step-by-step interactive solving.',
    intro: 'The Class 12 Mathematics curriculum is intensive and demanding, serving as a gateway to higher education in engineering, sciences, and commerce. Success at this level requires absolute fluency in a vast number of complex formulas. To aid your preparation, we have compiled this exhaustive Class 12 Maths formula sheet. It encompasses all the critical equations across advanced topics like algebra, calculus, vectors, probability, trigonometry, and logarithms. From complex integrals to 3D geometry formulas, everything you need is organised here for quick reference. Mastering these formulas is non-negotiable if you want to excel in your board exams and competitive entrance tests. Make this sheet an integral part of your daily study routine, use it to verify your solutions, and ensure you are completely exam-ready.',
    categories: ['algebra', 'calculus', 'vectors', 'probability', 'trigonometry', 'logarithms'],
    relatedBoards: ['class-10', 'a-level'],
  },
};

export const boardIds = Object.keys(boardData) as BoardId[];
