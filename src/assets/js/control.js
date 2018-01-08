import lib from './lib'
const {ajax, api, gets} = lib
const app = {
  cityCalc (data, id) {
    let arr = []
    for (let i in data) {
      if (data[i].parentId === id) {
        let obj = {
          value: data[i].id,
          label: data[i].name
        }
        obj.children = this.cityCalc(data, data[i].id)
        arr.push(obj)
      }
    }
    return arr
  },
  use: (vue) => {
    let loginInfo = gets('LOGININFO')
    if (loginInfo && loginInfo.result) {
      console.log('🍭初始化 : 用户权限设置成功')
      app.init(vue)
    }

    vue.directive('judge', (el, binding) => {
      let judge = !loginInfo || loginInfo.result.perms.indexOf(binding.value) === -1
      vue.prototype.$log('权限验证 [' + binding.value + '] ' + !judge)
      if (judge) {
        el.remove()
      }
    })

    vue.prototype.$judge = function (ju) {
      let judge = !loginInfo || loginInfo.result.perms.indexOf(ju) === -1
      vue.prototype.$log('权限验证 [' + ju + '] ' + !judge)
      if (judge) return false
      return true
    }
  },
  init (vue) {
    vue.prototype.$log = (text, color = '#495a80') => {
      let date = new Date()
      date = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
      console.log('%c[ ' + date + ' ]', 'color: #9966cc; padding:5px 0;', text)
    }
    console.log('👻初始化 : 控制台全局化成功')

    let callback = (data) => {
      // 设置全局省市联动
      vue.prototype.$cityList = app.cityCalc(data.data, '0')
      // 设置全局省市数据
      vue.prototype.$city = data.data
      // 设置全局省数据
      vue.prototype.$prov = []
      for (let p of vue.prototype.$city) {
        if (p.parentId === '0') vue.prototype.$prov.push(p)
      }
      // 设置全局获取省市数组方法
      vue.prototype.$getCityArr = function (id) {
        for (let i of vue.prototype.$city) {
          if (i.id === id) {
            return [i.parentId, i.id]
          }
        }
        return []
      }
      console.log('🎃初始化 : 城市数据全局化成功')
    }
    ajax(api.cityList, 'GET', {}, callback, () => {
    }, 'json', false)
  }
}
export default app
