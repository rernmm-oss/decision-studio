import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDecisionOptions } from './decisionInput.js';

const names = input => extractDecisionOptions(input).options.map(option => option.name);

test('extracts the Chinese and English starter dilemmas', () => {
  assert.deepEqual(names('我在考虑把积蓄用于旅行，还是买一台新相机。'), ['把积蓄用于旅行', '买一台新相机']);
  assert.deepEqual(names("I'm deciding whether to change jobs or stay where I am."), ['change jobs', 'stay where I am']);
  assert.deepEqual(names('I’m deciding whether to spend my savings on a trip or buy a new camera.'), ['spend my savings on a trip', 'buy a new camera']);
});

test('keeps a follow-up concern out of the option label', () => {
  assert.deepEqual(names('我想换工作还是留在现在的公司？我更在意稳定。'), ['换工作', '留在现在的公司']);
  assert.deepEqual(names('我有一笔积蓄，我想旅行还是买相机，预算 5000 元。'), ['旅行', '买相机']);
});

test('recognises explicit between constructions without splitting ordinary conjunctions', () => {
  assert.deepEqual(names('I am choosing between renting and buying.'), ['renting', 'buying']);
  assert.deepEqual(names('我在北京和上海之间犹豫。'), ['北京', '上海']);
  assert.deepEqual(names('Study art and design or study engineering?'), ['Study art and design', 'study engineering']);
  assert.deepEqual(names('I am thinking about my budget and timing.'), []);
});

test('preserves more than two alternatives', () => {
  assert.deepEqual(names('我想旅行、买相机还是存钱？'), ['旅行', '买相机', '存钱']);
  assert.deepEqual(names('Save or travel or buy a camera?'), ['Save', 'travel', 'buy a camera']);
});

test('accepts vs. comparisons without treating the abbreviation as a sentence end', () => {
  assert.deepEqual(names('Buy a camera vs. take a trip'), ['Buy a camera', 'take a trip']);
  assert.deepEqual(names('Buy a camera VS. take a trip. My budget is limited.'), ['Buy a camera', 'take a trip']);
  assert.deepEqual(names('Buy a camera versus take a trip.'), ['Buy a camera', 'take a trip']);
});

test('recognises pasted lists and explicit option labels', () => {
  assert.deepEqual(names('1. Save\n2) Invest'), ['Save', 'Invest']);
  assert.deepEqual(names('1. Save 2. Invest'), ['Save', 'Invest']);
  assert.deepEqual(names('- Save\n- Invest'), ['Save', 'Invest']);
  assert.deepEqual(names('选项一：旅行\n选项二：买相机'), ['旅行', '买相机']);
  assert.deepEqual(names('Option A: Save; Option B: Invest'), ['Save', 'Invest']);
});

test('removes surrounding quotation marks and trailing punctuation in either order', () => {
  assert.deepEqual(names('Option A: "Save". Option B: "Invest".'), ['Save', 'Invest']);
  assert.deepEqual(names('Option A: "Save." Option B: "Invest."'), ['Save', 'Invest']);
  assert.deepEqual(names('选项一：“旅行”。\n选项二：「买相机」。'), ['旅行', '买相机']);
  assert.deepEqual(names('"Buy a camera" or "take a trip"?'), ['Buy a camera', 'take a trip']);
  assert.deepEqual(names('Option A: "Start a master\'s degree." Option B: "Continue work."'), ["Start a master's degree", 'Continue work']);
});

test('turns an explicit yes/no question into an action and its negation', () => {
  assert.deepEqual(names('我在考虑是否辞职。'), ['辞职', '不辞职']);
  assert.deepEqual(names('要不要买相机？'), ['买相机', '不买相机']);
  assert.deepEqual(names('Should I accept the offer?'), ['accept the offer', "Don't accept the offer"]);
  assert.deepEqual(names('I am deciding whether to move abroad.'), ['move abroad', "Don't move abroad"]);
});

test('recognises short spoken Chinese decisions without asking for another form', () => {
  assert.deepEqual(names('换手机吗'), ['换手机', '不换手机']);
  assert.deepEqual(names('换手机么？'), ['换手机', '不换手机']);
  assert.deepEqual(names('我该换手机吗？'), ['换手机', '不换手机']);
  assert.deepEqual(names('我最近有点纠结，换手机吗？'), ['换手机', '不换手机']);
  assert.deepEqual(names('换手机吗？预算有点紧。'), ['换手机', '不换手机']);
  assert.deepEqual(names('换不换手机'), ['换手机', '不换手机']);
  assert.deepEqual(names('买不买相机？'), ['买相机', '不买相机']);
  assert.deepEqual(names('不换手机吗？'), ['换手机', '不换手机']);
});

test('does not turn factual or open-ended Chinese questions into made-up decisions', () => {
  for (const input of ['手机坏了吗？', '换手机了吗？', '这手机贵吗？', '他换手机了吗？', '手机怎么选？', '你知道怎么买手机吗？', '买什么手机好呢？']) {
    assert.deepEqual(names(input), []);
  }
});

test('returns an empty result for ambiguous, incomplete, or duplicate alternatives', () => {
  for (const input of ['', '我在考虑如何使用一笔重要的资金。', '买相机还是？', '旅行还是旅行', 'Save or save', 'Should I save or save?', 'I am deciding whether to save or save.', 'Should I choose between saving and saving?']) {
    assert.deepEqual(extractDecisionOptions(input), { options: [], explicit: false, fallback: false });
  }
});
