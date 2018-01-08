<template>
  <div class="app">
    <Back-top></Back-top>
    <router-view v-if="url.indexOf($route.path) != -1"></router-view>
    <div v-if="url.indexOf($route.path) === -1 && main" class="layout" id="layout">
      <Row type="flex" >
        <VHeader ref="menu"></VHeader>
        <i-col offset="4" :span="20" id="height">
          <LHeader :inter="inter"></LHeader>
          <div class="layout-breadcrumb" v-if="home">
            <Breadcrumb>
              <template v-for="i in breadcrumb">
                <Breadcrumb-item v-if="i.path" :href="i.path" :replace="true">{{i.title}}</Breadcrumb-item>
                <Breadcrumb-item v-if="!i.path">{{i.title}}</Breadcrumb-item>
              </template>
            </Breadcrumb>
          </div>
          <div class="layout-content">
            <div class="layout-content-main">
              <keep-alive>
                <router-view v-if="$route.meta.keepAlive"></router-view>
              </keep-alive>
              <router-view v-if="!$route.meta.keepAlive"></router-view>
            </div>
          </div>
          <div class="layout-copy">
            2017 &copy {{$lang.currency.ald}}
          </div>
        </i-col>
      </Row>
    </div>
    <div class="loading" v-if="loading && url.indexOf($route.path) === -1">
      <div class="lds-css ng-scope">
        <div style="width:100%;height:100%" class="lds-dual-ring">
          <div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import VHeader from '@/components/global/header.vue'
  import LHeader from '@/components/global/layoutHeader.vue'
  import lib from '@/assets/js/lib.js'
  import { mapActions, mapState } from 'vuex'

  const {ajax, api, $} = lib
  export default {
    components: {
      VHeader,
      LHeader
    },
    name: 'app',
    data() {
      return {
        inter: window.localStorage.getItem('LANG') || 'cn',
        home: false,
        main: true,
        loading: true,
        url: ['/login'],    // 全幅度展示的路径页
        show: true
      }
    },
    computed: {
      ...mapState({
        breadcrumb: state => state.system.user_position,
        login_info: state => state.system.login_info,
        user_menu: state => state.system.user_menu
      })
    },
    mounted() {
      $('#loading').remove()
      if (this.$route.path === '/login') return
      this.init()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION', 'SYSTEM_SETUSERMENU', 'SYSTEM_SETLOGININFO']),
      init() {
        /**
         * 初始化
         * */
        // 设置内容区域高度最小不能小于浏览器窗口高度
        $('#height').css('min-height', $(window).height())
        window.onresize = () => {
          $('#height').css('min-height', $(window).height())
        }

        // 獲取登錄信息
        this.getLoginInfo()

        // 監聽路徑跳轉
        this.$router.beforeEach((to, from, next) => {
          // 验证全幅度路径页
          if (to.path === '/home') {
            this.home = false
          } else {
            this.home = true
          }
          // 登录页
          if (this.url.indexOf(to.path) !== -1) {
            this.SYSTEM_SETUSERMENU([])
            this.SYSTEM_SETLOGININFO({})
            next()
            return
          }
          // 验证路径权限
          if (this.jurisdiction(to.path)) {
            next()
          }
        })
      },
      getLoginInfo() {
        /**
         * 登录者信息
         * */
        // 判断登录者是否存在
        if (this.login_info && this.login_info.result) {
          // 获取菜单
          if (!this.user_menu.length) {
            this.getMenu()
            return
          } else {
            // 设置左侧菜单
            this.$refs.menu.menu = this.user_menu
          }
          // 判断当前路径
          if (this.jurisdiction(this.$route.path)) this.loading = false
        } else {
          // 登录失败
          if (this.login_info.msg || this.login_info.message) this.$Message.error(this.login_info.msg || this.login_info.message)
          this.$router.push('/login')
          this.SYSTEM_SETUSERMENU([])
          this.SYSTEM_SETLOGININFO({})
        }
      },
      jurisdiction(path) {
        /**
         * 权限判断函数
         * */
        let url = path.replace('/', '')
        if (url === '') return true
        url = url.replace(/\//g, '.')
        if (this.login_info.result.perms.indexOf(url) !== -1) {
          if (this.$refs.menu.active) this.$refs.menu.active = url
          return true
        } else {
          let msg = '您访问了没有权限的页面'
          this.$Message.error(msg)
          this.loading = false
          this.$router.push('/home')
        }
      },
      getMenu() {
        let callback = (data) => {
          this.SYSTEM_SETUSERMENU(data.data)
          // 设置左侧菜单
          this.$refs.menu.menu = data.data
          // 判断当前路径
          if (this.jurisdiction(this.$route.path)) this.loading = false
        }
        ajax(api.userMenu, 'GET', {}, callback, false)
      }
    }
  }
</script>

<style lang="less">
  @import "./assets/css/app.less";
</style>
