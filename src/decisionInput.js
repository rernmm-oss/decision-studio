/**
 * Pull explicit alternatives out of a decision written in natural language.
 *
 * This is intentionally a conservative, local parser.  It does not try to
 * invent choices from an ambiguous sentence: callers can keep the original
 * text in the composer and ask the person to make the alternatives explicit.
 *
 * @returns {{options: Array<{name: string, context: string}>, explicit: boolean, fallback: boolean}}
 */
export function extractDecisionOptions(input) {
  const text = normalize(input);
  if (!text) return result([]);

  // Bulleted/numbered alternatives are the least ambiguous form. Handle
  // both multiline notes and a compact "1. A 2. B" sentence.
  const listed = parseList(text);
  if (listed.length >= 2) return result(listed);

  // "between A and B" is common in English decision prompts. Restrict the
  // conjunction to this shape so that ordinary sentences containing "and"
  // are not split accidentally.
  const between = text.match(/\bbetween\s+(.+?)\s+and\s+(.+?)(?:[.!?。！？]|$)/i);
  if (between) {
    const options = makeOptions([...between[1].split(/,\s*/), between[2]]);
    return result(options.length >= 2 ? options : []);
  }

  // Chinese also has an explicit "choose between" construction.
  const chineseBetween = text.match(/在\s*(.+?)\s*(?:和|与)\s*(.+?)\s*之间/);
  if (chineseBetween) {
    const options = makeOptions([...chineseBetween[1].split('、'), chineseBetween[2]]);
    return result(options.length >= 2 ? options : []);
  }

  // Split only on explicit alternatives.  We deliberately do not split on
  // a bare Chinese "和" or English "and", both of which occur inside normal
  // option names and would produce noisy choices.
  const alternativeParts = splitAlternatives(text);
  if (alternativeParts.length >= 2) {
    const options = makeOptions(alternativeParts);
    return result(options.length >= 2 ? options : []);
  }

  // Finally recognise a yes/no question. This is still explicit: the
  // negative choice is a direct negation of the action supplied by the user.
  const yesNo = parseYesNo(text);
  if (yesNo.length === 2) return result(yesNo);

  return result([]);
}

function result(options) {
  return { options, explicit: options.length >= 2, fallback: false };
}

function normalize(value) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f]+/g, ' ')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

function cleanOption(value) {
  let option = String(value ?? '')
    .replace(/^[\s,，;；:：、|]+|[\s,，;；:：、|]+$/g, '')
    .replace(/^.*[，,]\s*(?=(?:我|我们)?(?:想|应该|该|考虑|在考虑)|(?:should\s+i|i(?:['’]m| am))\b)/i, '')
    .replace(/^(?:and|or|或者|还是|或是)\s+/i, '')
    .replace(/^(?:我(?:正在|在)?(?:考虑|纠结|犹豫)(?:于|的是)?|我想知道|我不知道|在考虑|考虑一下)\s*/i, '')
    .replace(/^(?:(?:i(?:['’]m| am)|we(?:['’]re| are))\s+)?(?:trying to decide|deciding|wondering|considering|torn|choosing|debating)(?:\s+(?:whether|if|between|about))?\s+/i, '')
    .replace(/^(?:whether\s+(?:i\s+)?|either\s+|to\s+)/i, '')
    .replace(/^(?:should|would|could|do)\s+i\s+/i, '')
    .replace(/^(?:我(?:们)?)?(?:应该|是否(?:要)?|要不要|该不该|想|该)\s*/, '')
    // Quotes and sentence punctuation may appear in either order, especially
    // in pasted option lists. Trim them together without touching apostrophes
    // or punctuation inside an option name.
    .replace(/^[\s"'“”‘’「」『』]+|[\s"'“”‘’「」『』.!?。！？]+$/g, '')
    .trim();

  // Strip a trailing question tag left after splitting (e.g. "or stay?").
  option = option.replace(/(?:呢|吗|嘛)$/i, '').trim();
  return option;
}

function makeOptions(values) {
  const seen = new Set();
  return values
    .map(value => String(value).split(/[，,]\s*(?=但|不过|因为|预算|截止|我更|我的|I\b|but\b|because\b|my\b|budget\b)/i)[0])
    .map(cleanOption)
    .filter(value => value.length >= 1)
    .filter(value => {
      const key = value.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(name => ({ name, context: '' }));
}

function parseList(text) {
  const labels = [...text.matchAll(/(?:(?:选项|方案)\s*[一二三四五六七八九十A-D\d]+|\boption\s+[A-D\d]+)\s*[:：、.)]?\s*/gi)];
  if (labels.length >= 2) {
    return makeOptions(labels.map((label, index) => text.slice(label.index + label[0].length, labels[index + 1]?.index ?? text.length)));
  }
  // Most pasted lists use newlines. The compact form catches "1. A 2. B"
  // without treating ordinary numbers in a sentence as options.
  const lines = text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);
  let values = lines
    .map(line => line.match(/^(?:[-*•]\s+|\d{1,2}[.)、:]\s*|[一二三四五六七八九十]+[、.]\s*)(.+)$/)?.[1])
    .filter(Boolean);
  if (values.length < 2) {
    const compact = [...text.matchAll(/(?:^|\s)(?:\d{1,2}[.)、:]|[一二三四五六七八九十]+[、.])\s*([^\n]+?)(?=(?:\s+\d{1,2}[.)、:]|\s+[一二三四五六七八九十]+[、.]|$))/g)];
    values = compact.map(match => match[1]);
  }
  return makeOptions(values);
}

function splitAlternatives(text) {
  // Require whitespace around English conjunctions to avoid matching words
  // such as "orchestra". Chinese conjunctions are naturally unspaced.
  // The dot in "vs." is part of the comparison marker, not a sentence end.
  const sentences = text.replace(/\bvs\.(?=\s)/gi, 'vs').split(/[。！？!?\n]+|\.(?:\s+|$)/);
  for (const sentence of sentences) {
    const pieces = sentence.split(/\s+(?:or|vs\.?|versus)\s+|还是|或者|或是|或(?!许|然)/gi);
    if (pieces.length >= 2) {
      const last = pieces[pieces.length - 1].trim();
      // Do not treat 'or not' as a named option; the yes/no parser handles it.
      if (/^(?:not|不|不做)$/i.test(last)) continue;
      return pieces.flatMap(piece => piece.split('、'));
    }
  }
  return [];
}

function parseYesNo(text) {
  const chinese = text.match(/(?:要不要|是否(?:要)?|该不该)(.+?)(?:[?？。.!！]|$)/);
  if (chinese) {
    const action = cleanOption(chinese[1].replace(/(?:还是|或者)?不$/, ''));
    if (action) return makeOptions([action, `不${action}`]);
  }

  // Colloquial questions often omit “要不要”, e.g. “换手机吗” or
  // “买不买相机”. Only infer a binary choice for an explicit action;
  // factual and open-ended questions still need alternatives from the user.
  const actionStart = /^(?:换|买|卖|去|留|搬|辞|跳槽|转|租|报名|报考|学|读|考|选|接受|拒绝|参加|继续|开始|放弃|结束|推迟|取消|尝试|联系|投资|存钱|旅行|出国|结婚|分手|做|吃|订|养|退)/;
  for (const sentence of text.split(/[，,。.!！?？\n]+/)) {
    let phrase = cleanOption(sentence.trim().replace(/^(?:请问|你觉得|你认为)\s*/, '').replace(/(?:吗|么|嘛)\s*$/, ''));
    if (/为什么|为何|怎么|如何|哪(?:个|一|里|儿)|什么|多少/.test(phrase)) continue;
    const suffixQuestion = /(?:吗|么|嘛)\s*$/.test(sentence.trim());
    const repeatedVerb = phrase.match(/^([\u3400-\u9fff]{1,3})不\1(.+)$/);
    if (!suffixQuestion && !repeatedVerb) continue;
    if (repeatedVerb) phrase = repeatedVerb[1] + repeatedVerb[2];
    phrase = phrase.replace(/^(?:我(?:们)?)?(?:应该|该|要|需要|可以|能)\s*/, '');
    const action = phrase.replace(/^不/, '').trim();
    if (actionStart.test(action) && !/(?:了|过)$/.test(action)) return makeOptions([action, `不${action}`]);
  }

  // "Should I ...?" / "Do I ...?". Keep the action as written and add a
  // plain negative counterpart so the person can edit it if needed.
  const english = text.match(/^(?:should|would|could|do)\s+i\s+(.+?)(?:[?!.]|$)/i);
  if (english) {
    const action = cleanOption(english[1].replace(/\s+or\s+not$/i, ''));
    if (action) return makeOptions([action, `Don't ${action}`]);
  }

  const whether = text.match(/\bwhether\s+to\s+(.+?)(?:[?!.]|$)/i);
  if (whether) {
    const action = cleanOption(whether[1].replace(/\s+or\s+not$/i, ''));
    if (action) return makeOptions([action, `Don't ${action}`]);
  }
  return [];
}

export default extractDecisionOptions;
