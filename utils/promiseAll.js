let MyPromise = require('../promise.js');
/**
 * 测试 all()的工具类
 * 
 * Promise.all()接收一个包含多个Promise的数组，
 * 当所有Promise均为fulfilled状态时，
 * 返回一个结果数组，数组中结果的顺序和传入的Promise顺序一一对应。
 * 如果有一个Promise为rejected状态，则整个Promise.all为rejected。
 */
exports.p1 = new MyPromise((resolve, reject) => {
  resolve('resolve1');
});

exports.p2 = new MyPromise((resolve, reject) => {
  reject('reject');
});

exports.p3 = new MyPromise((resolve, reject) => {
  resolve('resolve2')
});

