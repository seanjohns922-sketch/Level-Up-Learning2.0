import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { normalizeLearningScore } from '../../lib/learning-score.ts';
import { WEEKLY_QUIZ_QUESTION_COUNT } from '../../lib/weekly-quiz-contract.ts';
// Execute the actual UI reducers so the existing behaviour is the oracle.
const source = fs.readFileSync('components/teacher/LiveClassPanel.tsx', 'utf8');
const ast = ts.createSourceFile('LiveClassPanel.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const names = ['parseEventPayload', 'numberOrNull', 'positiveNumberOrNull', 'stringOrNull',
  'stringArrayOrNull', 'timestampMs', 'resolveCurrentActivityRow', 'getQuestionKey',
  'matchesCurrentLesson', 'isQuizActivity', 'buildCurrentLessonPerformance'];
const declarations = ast.statements.filter(node => ts.isFunctionDeclaration(node) && names.includes(node.name?.text));
assert.equal(declarations.length, names.length, 'Every required production reducer must be found');
const compiled = ts.transpileModule(declarations.map(node => node.getText(ast)).join('\n'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
export const api = new Function('normalizeLearningScore', 'WEEKLY_QUIZ_QUESTION_COUNT',
  compiled + '\nreturn { resolveCurrentActivityRow, buildCurrentLessonPerformance, matchesCurrentLesson, parseEventPayload, positiveNumberOrNull, stringOrNull, timestampMs };')
(normalizeLearningScore, WEEKLY_QUIZ_QUESTION_COUNT);

