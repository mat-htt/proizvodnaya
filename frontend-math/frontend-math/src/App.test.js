import { splitLectureTitle, plural, scoreTone } from './utils/format';

test('номер лекции отделяется от названия', () => {
  expect(splitLectureTitle('3.1 Геометрический смысл производной')).toEqual({ num: '3.1', title: 'Геометрический смысл производной' });
  expect(splitLectureTitle('1. Определение производной функции')).toEqual({ num: '1', title: 'Определение производной функции' });
  expect(splitLectureTitle('Без номера')).toEqual({ num: null, title: 'Без номера' });
});

test('склонение по числу', () => {
  expect(plural(1, 'вопрос', 'вопроса', 'вопросов')).toBe('вопрос');
  expect(plural(3, 'вопрос', 'вопроса', 'вопросов')).toBe('вопроса');
  expect(plural(11, 'вопрос', 'вопроса', 'вопросов')).toBe('вопросов');
});

test('цвет результата', () => {
  expect(scoreTone(90)).toBe('good');
  expect(scoreTone(65)).toBe('mid');
  expect(scoreTone(20)).toBe('bad');
});
