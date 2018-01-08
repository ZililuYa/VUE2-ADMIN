<template>
  <i-col :span="4" class="layout-menu-left header-main" id="header">
    <Menu :active-name="active" @on-open-change="changeMenu" :open-names="open" theme="dark" width="auto" @on-select="menuClick" accordion>
      <div class="layout-logo-left">
        <img src="../../assets/images/logo.png" width="30px" alt=""> {{$lang.currency.com}}
      </div>
      <template v-for="item in menu">
        <Menu-item :name="item.path" v-if="item.type === '3'" :key="item.id">
          <!--<Icon type="disc" :size="iconSize"></Icon>-->
          <Icon :type="item.icon"></Icon>
          <span class="layout-text">{{item.text}}</span>
        </Menu-item>
        <Submenu :name="item.path" v-if="item.type === '2'">
          <template slot="title">
            <!--<Icon type="navicon"></Icon>-->
            <Icon :type="item.icon"></Icon>
            {{item.text}}
          </template>
          <Menu-item :name="i.path" v-for=" i in item.children" :key="i.path">
            <Icon :type="i.icon ? i.icon : 'chevron-right'"></Icon>
            {{i.text}}
          </Menu-item>
        </Submenu>
      </template>
    </Menu>
  </i-col>
</template>

<script>
  import $ from 'jquery'
  import 'nicescroll'
  export default {
    data () {
      return {
        menu: [],
        active: '',
        open: []
      }
    },
    watch: {
      menu: function (evl) {
        this.init(evl)
      }
    },
    computed: {
      iconSize () {
        return this.spanLeft === 5 ? 14 : 24
      }
    },
    mounted () {
      // this.setNice()
    },
    methods: {
      changeMenu () {
        // this.setNice()
//        let size = $('.nicescroll-cursors').length
//        if (size > 0) {
        // $('#header').getNiceScroll().resize()
        // return
//        }
        setTimeout(() => {
          let size = $('.nicescroll-cursors').length
          if (size > 0) {
            $('#header').getNiceScroll().resize()
            return
          }
          let h = $('#header .ivu-menu').height()
          let w = $(window).height()
          if (h > w) this.setNice()
        }, 500)
      },
      setNice () {
        let Forver = {
          cursorcolor: '#aaaaaa',
          cursorwidth: '4px',
          cursorborder: '0px',
          cursorborderradius: '0px'
        }
        $('#header').niceScroll(Forver)
        $('#header').removeClass('header-nice')
      },
      init () {
        this.$nextTick(function () {
          if (this.$route.path === '/') {
            this.active = 'name'
            return
          }
          this.active = this.$route.path.replace('/', '').replace(/\//g, '.')
          this.open.push('sys')
        })
      },
      updateGutter () {
      },
      menuClick (name) {
        this.active = name
        this.$log(name)
        this.$router.push('/' + name.replace(/\./g, '/'))
      }
    }
  }
</script>
