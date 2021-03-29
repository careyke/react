/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Fiber} from './ReactInternalTypes';

export type StackCursor<T> = {|current: T|};

const valueStack: Array<any> = [];

let fiberStack: Array<Fiber | null>;

if (__DEV__) {
  fiberStack = [];
}

let index = -1;

function createCursor<T>(defaultValue: T): StackCursor<T> {
  return {
    current: defaultValue,
  };
}

function isEmpty(): boolean {
  return index === -1;
}

function pop<T>(cursor: StackCursor<T>, fiber: Fiber): void {
  if (index < 0) {
    if (__DEV__) {
      console.error('Unexpected pop.');
    }
    return;
  }

  if (__DEV__) {
    if (fiber !== fiberStack[index]) {
      console.error('Unexpected Fiber popped.');
    }
  }

  cursor.current = valueStack[index];

  valueStack[index] = null;

  if (__DEV__) {
    fiberStack[index] = null;
  }

  index--;
}

/**
 * 这个文件的功能就是提供一个 栈结构 来保存一些调用数据
 * 其中cursor.current保存的是当前的值，不在栈中
 * index表示栈顶元素的索引
 * 
 * 有一个疑问 这里index是当前模块作用域中的 不同的cursor用的都是同一个index，不会导致数据不一致吗？
 * 除非能够入栈和出栈的顺序能够一一对应上
 * @param {*} cursor 
 * @param {*} value 
 * @param {*} fiber 
 */
function push<T>(cursor: StackCursor<T>, value: T, fiber: Fiber): void {
  index++;

  valueStack[index] = cursor.current;

  if (__DEV__) {
    fiberStack[index] = fiber;
  }

  cursor.current = value;
}

function checkThatStackIsEmpty() {
  if (__DEV__) {
    if (index !== -1) {
      console.error(
        'Expected an empty stack. Something was not reset properly.',
      );
    }
  }
}

function resetStackAfterFatalErrorInDev() {
  if (__DEV__) {
    index = -1;
    valueStack.length = 0;
    fiberStack.length = 0;
  }
}

export {
  createCursor,
  isEmpty,
  pop,
  push,
  // DEV only:
  checkThatStackIsEmpty,
  resetStackAfterFatalErrorInDev,
};
