/**
 * tallbag-concat
 * --------------
 *
 * Tallbag factory that concatenates the data from multiple (2 or more)
 * tallbag sources. It starts each source at a time: waits for the previous
 * source to end before starting the next source. Works with both pullable
 * and listenable sources.
 *
 * `npm install tallbag-concat`
 *
 * Example:
 *
 *     const fromIter = require('callbag-from-iter');
 *     const iterate = require('callbag-iterate');
 *     const concat = require('tallbag-concat');
 *
 *     const source = concat(fromIter([10,20,30]), fromIter(['a','b']));
 *
 *     iterate(x => console.log(x))(source); // 10
 *                                           // 20
 *                                           // 30
 *                                           // a
 *                                           // b
 */

import makeShadow from 'shadow-callbag';
const UNIQUE = {};

const concat = (...sources) => (start, sink) => {
  if (start !== 0) return;
  const n = sources.length;
  if (n === 0) {
    sink(0, () => {}, makeShadow('concat'));
    sink(2);
    return;
  }
  let i = 0;
  let sourceTalkback;
  let lastPull = UNIQUE;
  const shadow = makeShadow('concat');
  const talkback = (t, d) => {
    if (t === 1) lastPull = d;
    sourceTalkback(t, d);
  };
  (function next() {
    if (i === n) {
      sink(2);
      return;
    }
    sources[i](0, (t, d, memberShadow) => {
      if (t === 0) {
        sourceTalkback = d;
        if (memberShadow) {
          memberShadow(0, (_t, _d) => {
            if (_t === 0) _d(1);
            if (_t === 1) shadow(1, _d);
          });
        }
        if (i === 0) sink(0, talkback);
        else if (lastPull !== UNIQUE) sourceTalkback(1, lastPull);
      } else if (t === 2 && d) {
        sink(2, d);
      } else if (t === 2) {
        i++;
        next();
      } else {
        sink(t, d);
      }
    });
  })();
};

export default concat;
