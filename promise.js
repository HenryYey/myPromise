// 保存字符串值，方便校验
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function MyPromise(executor) {
  let self = this
  // 状态机初始值
  self.state = PENDING
  // value为成功值，err为失败
  self.value = null
  self.err = null
  // 回调函数数组
  self.onFulfilledCallbacks = []
  self.onRejectedCallbacks = []

  function resolve(value) {
    if (self.state === PENDING) {
      self.state = FULFILLED
      self.value = value
      // 依次执行函数
      self.onFulfilledCallbacks.forEach( 
        fulfilledCallback => {
          fulfilledCallback()
        }
      )
    }
  }

  function reject(err) {
    if (self.state === PENDING) {
      self.state = REJECTED
      self.err = err

      self.onRejectedCallbacks.forEach(
        rejectedCallback => {
          rejectedCallback()
        }
      )
    }
  }

  executor(resolve, reject)

}

MyPromise.prototype.then = function(onFuifilled, onRejected) {
  // 检测默认传参
  // 如果参数是nonfunction,则返回原样的promise的最终结果
  onFuifilled = typeof onFuifilled === 'function' ? onFuifilled : value => {return value}
  onRejected = typeof onRejected === 'function' ? onRejected : err => {throw err}

  let self = this 
  let promise2 = null
  // then返回的是一个新的promise，保证是thenable的
  promise2 = new MyPromise((resolve, reject) => {
    if (self.state === PENDING) {
      self.onFulfilledCallbacks.push(() => {
        // 用宏任务setTiemout来代替实现异步
        setTimeout(() => {
          try {
            // x为成功的返回值
            let x = onFuifilled(self.value)
            self.resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        }, 0)
      })
      self.onRejectedCallbacks.push(() => {
        setTimeout(() => {
          try {
            let x = onRejected(self.err)
            self.resolvePromise(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        }, 0)
      })
    }
  
    if (self.state === FULFILLED) {
      setTimeout(() => {
        try {
          let x = onFuifilled(self.value)
          self.resolvePromise(promise2, x, resolve, reject)
        } catch (err) {
          reject(err)
        }
      }, 0)
    }
  
    if (self.state === REJECTED) {
      setTimeout(() => {
        try {
          let x = onRejected(self.err)
          self.resolvePromise(promise2, x, resolve, reject)
        } catch (err) {
          reject(err)
        }
      }, 0)
    }
  })
  return promise2
}


// 处理Promise，保证then()返回的是一个自己生成的新的promise
MyPromise.prototype.resolvePromise = function(promise2, x, resolve, reject) {

  let self = this
  let called = false   // called 防止多次调用

  if (promise2 === x) {
    return reject(new TypeError('循环引用'))
  }

  if (x !== null && (Object.prototype.toString.call(x) === '[object Object]' || Object.prototype.toString.call(x) === '[object Function]')) {
    // 回调函数的成功值x是对象或者函数
    try {
      let then = x.then
      if (typeof then === 'function') {

        then.call(x, (y) => {
          // 使用called防止多次调用then方法
          if (called) return 
          called = true
          // 成功值y有可能还是promise或者是具有then方法等，再次resolvePromise，直到成功值为基本类型或者非thenable
          self.resolvePromise(promise2, y, resolve, reject)
        }, (err) => {
          if (called) return 
          called = true
          reject(err)
        })
      } else {
        if (called) return 
        called = true
        resolve(x)
      }
    } catch (err) {
      if (called) return 
      called = true
      reject(err)
    }
  } else {
    // x是普通值，直接resolve
    resolve(x)
  }
}

// 当前面的then()发生错误时会进行冒泡最终被catch()捕获，实际上是一个特殊的then()
MyPromise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected)
}
//返回一个Promise，无论结果是成功或者是失败，在执行完所有then()和catch()后，都会执行finally指定的回调函数,
MyPromise.prototype.finally = function(fn) {
  return this.then((value) => {
    fn()
    return value
  }, (err) => {
    fn()
    throw err
  })
}
// done()方法相当于一个catch,放在Promise链最后，可用于捕获最后一个promise异常
MyPromise.prototype.done = function() {
  this.catch((err) => {
    console.log('done', err)
    throw err
  })
}
// 将多个 Promise 实例，包装成一个新的 Promise 实例
MyPromise.all = function(promiseArr) {
  return new MyPromise((resolve, reject) => {
    let result = []

    promiseArr.forEach((promise, index) => {
      promise.then((value) => {
        result[index] = value

        if (result.length === promiseArr.length) {
          resolve(result)
        }
      }, reject)
    })
  })
}
// race() 返回一个 Promise，谁执行的快，就返回谁的执行结果，不管是成功还是失败
MyPromise.race = function(promiseArr) {
  return new MyPromise((resolve, reject) => {
    promiseArr.forEach(promise => {
      promise.then((value) => {
        resolve(value)   
      }, reject)
    })
  })
}


// 这个Promise永远处于pending状态，所以永远也不会向下执行then或catch了。这样我们就停止了一个Promise链。
MyPromise.stop = function() {
  return new Promise(function() {})
}

module.exports = MyPromise
