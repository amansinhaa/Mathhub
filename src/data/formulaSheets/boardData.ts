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
    title: 'GCSE Maths Formula Sheet',
    h1: 'GCSE Maths Formula Sheet',
    description: 'Master your GCSE Maths exams with our comprehensive formula sheet. Covering algebra, geometry, trigonometry, probability, and mensuration.',
    intro: 'Preparing for your GCSE Maths exams requires a solid grasp of key mathematical principles and the ability to apply them correctly. This comprehensive GCSE Maths formula sheet is designed to be your ultimate revision companion. We have carefully curated the most essential formulas you will need across the core topics, including algebra, geometry, trigonometry, probability, and mensuration. Whether you are revising for a mock exam or doing your final preparations, having these formulas at your fingertips will help you tackle complex problems with confidence. Review these formulas regularly, understand when and how to apply them, and you will be well on your way to achieving your target grade. Use this guide to quickly look up formulas during practice sessions or as a last-minute refresher before stepping into the exam hall.',
    categories: ['algebra', 'geometry', 'trigonometry', 'probability', 'mensuration'],
    relatedBoards: ['a-level', 'edexcel', 'aqa', 'igcse'],
  },
  'a-level': {
    id: 'a-level',
    title: 'A-Level Maths Formula Sheet',
    h1: 'A-Level Maths Formula Sheet',
    description: 'Essential A-Level Maths formulas covering algebra, calculus, trigonometry, logarithms, vectors, and probability to help you ace your exams.',
    intro: 'The A-Level Maths curriculum introduces advanced mathematical concepts that form the foundation for many STEM degrees and careers. To succeed, you need to be comfortable with a wide range of complex formulas. This A-Level Maths formula sheet brings together the critical equations and identities you must know, spanning across algebra, calculus, trigonometry, logarithms, vectors, and probability. From integration and differentiation rules to trigonometric identities and vector equations, this sheet serves as a quick reference guide to support your studies. While some formulas are provided in the exam booklet, knowing them by heart will save you valuable time and reduce errors. Use this resource to test your memory, reinforce your understanding during homework, and streamline your exam revision process for maximum efficiency and success.',
    categories: ['algebra', 'calculus', 'trigonometry', 'logarithms', 'vectors', 'probability'],
    relatedBoards: ['gcse', 'edexcel', 'aqa'],
  },
  edexcel: {
    id: 'edexcel',
    title: 'Edexcel Maths Formula Sheet',
    h1: 'Edexcel Maths Formula Sheet',
    description: 'The ultimate Edexcel Maths formula sheet. Get all the necessary formulas for algebra, calculus, trigonometry, vectors, probability, and geometry.',
    intro: 'If you are studying under the Edexcel exam board, this tailored Maths formula sheet is specifically designed to align with your syllabus requirements. Edexcel exams are known for their rigorous problem-solving questions, making it crucial to have a firm command of all relevant formulas. We have compiled all the vital formulas for algebra, calculus, trigonometry, vectors, probability, and geometry into one convenient location. This targeted resource ensures you are focusing on exactly what you need for the Edexcel specifications without getting bogged down by irrelevant information. By incorporating this formula sheet into your regular study routine, you can build fluency in applying these mathematical tools. Whether you are tackling past papers or reviewing challenging topics, this guide will provide the quick answers you need to keep your momentum going.',
    categories: ['algebra', 'calculus', 'trigonometry', 'vectors', 'probability', 'geometry'],
    relatedBoards: ['gcse', 'a-level', 'aqa'],
  },
  aqa: {
    id: 'aqa',
    title: 'AQA Maths Formula Sheet',
    h1: 'AQA Maths Formula Sheet',
    description: 'Comprehensive AQA Maths formula sheet featuring essential equations for algebra, geometry, trigonometry, probability, and calculus.',
    intro: 'Achieving top marks in your AQA Maths exams demands a thorough understanding of mathematical concepts and the ability to recall key formulas instantly. This AQA-specific formula sheet is designed to support your revision by grouping together all the indispensable formulas from the AQA syllabus. Covering essential topics such as algebra, geometry, trigonometry, probability, and calculus, this guide is an invaluable asset for any AQA student. Knowing these formulas inside out will allow you to focus your mental energy on the logical steps of solving the problem, rather than struggling to remember the starting equation. Keep this sheet handy while working through practice exercises, use it to create flashcards, and refer to it whenever you encounter a mental block. Consistent review is the key to mastering these mathematical tools.',
    categories: ['algebra', 'geometry', 'trigonometry', 'probability', 'calculus'],
    relatedBoards: ['gcse', 'a-level', 'edexcel'],
  },
  igcse: {
    id: 'igcse',
    title: 'IGCSE Maths Formula Sheet',
    h1: 'IGCSE Maths Formula Sheet',
    description: 'Ace your IGCSE Maths with our complete formula sheet. Essential formulas for algebra, geometry, trigonometry, probability, mensuration, and logarithms.',
    intro: 'The IGCSE Maths syllabus is broad and challenging, requiring students to master a wide array of mathematical techniques. To help you navigate this demanding course, we have created a comprehensive IGCSE Maths formula sheet. This carefully organised resource includes all the crucial formulas you need to know, covering algebra, geometry, trigonometry, probability, mensuration, and logarithms. The international nature of the IGCSE means the standards are high, and having these formulas memorised is a significant advantage. Whether you are studying the core or extended curriculum, this guide will serve as a reliable reference point throughout your studies. Use it to check your work, guide your revision, and ensure you are fully prepared to tackle any question the exam paper throws your way with complete confidence.',
    categories: ['algebra', 'geometry', 'trigonometry', 'probability', 'mensuration', 'logarithms'],
    relatedBoards: ['gcse', 'a-level', 'edexcel'],
  },
  'class-10': {
    id: 'class-10',
    title: 'Class 10 Maths Formula Sheet',
    h1: 'Class 10 Maths Formula Sheet',
    description: 'Complete Class 10 Maths formula sheet. Master algebra, geometry, trigonometry, mensuration, probability, and number theory for your board exams.',
    intro: 'Class 10 is a pivotal year for students, with board exams setting the stage for future academic pursuits. Mathematics is a core subject where scoring highly can significantly boost your overall percentage. This Class 10 Maths formula sheet is meticulously designed to help you achieve exactly that. It covers all the fundamental formulas from the syllabus, including algebra, geometry, trigonometry, mensuration, probability, and number theory. Having a consolidated list of formulas makes revision much more efficient, allowing you to quickly review key concepts before an exam. Practice applying these formulas to various types of problems to ensure you not only remember them but also understand their practical application. This resource is perfect for daily review and is guaranteed to enhance your problem-solving speed and accuracy during the actual board exams.',
    categories: ['algebra', 'geometry', 'trigonometry', 'mensuration', 'probability', 'numberTheory'],
    relatedBoards: ['class-12', 'gcse', 'igcse'],
  },
  'class-12': {
    id: 'class-12',
    title: 'Class 12 Maths Formula Sheet',
    h1: 'Class 12 Maths Formula Sheet',
    description: 'Essential Class 12 Maths formulas. Comprehensive guide covering algebra, calculus, vectors, probability, trigonometry, and logarithms for board exams.',
    intro: 'The Class 12 Mathematics curriculum is intensive and demanding, serving as a gateway to higher education in engineering, sciences, and commerce. Success at this level requires absolute fluency in a vast number of complex formulas. To aid your preparation, we have compiled this exhaustive Class 12 Maths formula sheet. It encompasses all the critical equations across advanced topics like algebra, calculus, vectors, probability, trigonometry, and logarithms. From complex integrals to 3D geometry formulas, everything you need is organised here for quick reference. Mastering these formulas is non-negotiable if you want to excel in your board exams and competitive entrance tests. Make this sheet an integral part of your daily study routine, use it to verify your solutions, and ensure you are completely exam-ready.',
    categories: ['algebra', 'calculus', 'vectors', 'probability', 'trigonometry', 'logarithms'],
    relatedBoards: ['class-10', 'a-level'],
  },
};

export const boardIds = Object.keys(boardData) as BoardId[];
