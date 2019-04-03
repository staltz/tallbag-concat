import {Source, UnwrapSource} from 'tallbag';
import {Metadata} from 'shadow-callbag';

export default function concat<T extends Source<any, Metadata>[]>(
  ...sources: T
): Source<UnwrapSource<T[number]>, Metadata>;
