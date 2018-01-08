<template>
  <div class="layout-header">
    <span class="icon-left" @click="leftClick">
      <Icon :type="menu"></Icon>
      <!--<Icon type="navicon"></Icon>-->
    </span>
    <div class="fr">
      <Dropdown class="dropdown" style="margin-left: 20px" placement="bottom-end" trigger="click" @on-click="menuClick">
        <img class="avatar" v-lazy="login_info.result.user.avatar" v-if="login_info.result" alt="">
        <a href="javascript:void(0)" v-if="login_info.result">
          {{login_info.result.user.name}}
          <Icon type="arrow-down-b"></Icon>
        </a>
        <Dropdown-menu slot="list">
          <!--<Dropdown-item name="tx">修改头像</Dropdown-item>-->
          <!--<Dropdown-item name="info">用户信息</Dropdown-item>-->
          <!--<Dropdown-item name="pwd">修改密码</Dropdown-item>-->
          <Dropdown-item name="inter-en" v-if="inter === 'cn'">English</Dropdown-item>
          <Dropdown-item name="inter-cn" v-if="inter === 'en'">中文语言</Dropdown-item>
          <hr>
          <Dropdown-item name="zx">{{$lang.currency.lLogin}}</Dropdown-item>
        </Dropdown-menu>
      </Dropdown>
    </div>
  </div>
</template>
<script>
  //  import $ from 'jquery'
  import lib from '@/assets/js/lib.js'
  import { mapState } from 'vuex'

  const {$, ajax, api} = lib
  export default {
    data() {
      return {
        menu: 'drag'
      }
    },
    props: {
      inter: {
        type: String
      }
    },
    computed: {
      ...mapState({
        login_info: state => state.system.login_info
      })
    },
    mounted() {
    },
    methods: {
      leftClick() {
        let mc = $('#layout').hasClass('menuClose')
        if (mc) {
          $('#layout').removeClass('menuClose')
        } else {
          $('#layout').addClass('menuClose')
        }
      },
      menuClick(m) {
        if (m === 'zx') this.cancellation()
        if (m === 'inter-cn') window.localStorage.setItem('LANG', 'cn')
        if (m === 'inter-en') window.localStorage.setItem('LANG', 'en')
        if (m === 'inter-cn' || m === 'inter-en') location.reload()
      },
      cancellation() {
        /**
         * 注销用户
         * */
        let callback = () => {
          this.$Message.success('注销成功')
          this.$router.push('/login')
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定注销吗？',
          onOk: () => {
            ajax(api.signout, 'GET', {}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
