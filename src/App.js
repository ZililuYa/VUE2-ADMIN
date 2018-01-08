console.log('\n %c 欢迎您访问阿拉丁 %c http://ald.art1001.com/ \n\n', 'color: #fff; background: #8dc63f; padding:5px 0;', 'background: #d0d0d0; padding:5px 0;')
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/iview/dist/styles/iview.css'
import iView from 'iview'
import VueLazyload from 'vue-lazyload'
import loading from '@/assets/images/loading.gif'
import error from '@/assets/images/error.png'
import '@/assets/css/animate.min.css'
import store from './store'
import control from '@/assets/js/control.js'
import filters from '@/assets/js/filters.js'
import quill from 'vue-quill-editor'
import locale from 'iview/dist/locale/en-US'
import lang from './assets/language/language.js'
import dropDown from './components/global/dropdown.vue'

window._v = Vue
// use options
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: error,
  loading: loading,
  attempt: 1
})
Vue.component(dropDown.name, dropDown)
if (window.localStorage.getItem('LANG') === 'en') {
  Vue.use(iView, { locale })
} else {
  Vue.use(iView)
}
Vue.use(quill)
Vue.config.productionTip = false

window.String.prototype.format = function () {
  if (arguments.length === 0) return this
  for (var s = this, i = 0; i < arguments.length; i++) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), arguments[i])
  }
  return s
}

lang.use(Vue)
control.use(Vue)
filters.use(Vue)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {App}
})

import 'bootstrap'
