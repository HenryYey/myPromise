( () => {
    const myPromise = require('./promise')
    console.log('[test] - myPromise is async')
    let promise1 = new myPromise(resolve => {
      console.log('[test] - then()')
      resolve('then()')
    }).then(val => {
      console.log('[success] -',val)
    })

    let promise2 = new myPromise((resolve,reject) => {
      console.log('[test] - catch()')
      reject('catch()')
    }).then(val=>{
      console.log('[fail] -',val)
    }).catch(err => {
      console.log('[success] -',err)
    })

    let promise3 = new myPromise((resolve,reject) => {
      console.log('[test] - finally()')
      resolve('finally()')
    }).then(val => {
      // do something
    }).catch(err => {
      // do something
    }).finally(() => {
      console.log('[success] - finally()')
    })
    // 每次then返回新的promise，调用上一个then的回调函数的最终返回值
    let promise4 = new myPromise((resolve,reject) => {
      console.log('[test] - then() return a new promise')
      resolve('then() return a new promise')
    }).then(val => {
      // 直接返回普通值
        return val
    }, err => {
        return err
    }).then(val => {     
      // 返回另外一个promise
      return new myPromise((resolve, reject) => {
          resolve('whatever');
        }).then((value) => {
          return new myPromise((resolve, reject) => {
            resolve(val);
          })
      }, err => {
        console.log('[fail] -',err)
      }).then((value) => {
        // 每个then调用上一个then的回调函数的返回值
        console.log('[success] -',value)
      })
    })
    const {p1, p2, p3} = require('./utils/promiseAll')

    Promise.all([p1, p2, p3]).then((value) => {
      console.log('[success] - all resolved', value);
    }, (err) => {
      console.log('[success] - all rejected', err);
    })
    console.log('------------------------------------------------------------')
    console.log('if [success]/[fail] is showed after this, myPromise is async')
    console.log('------------------------------------------------------------')
  }
)()