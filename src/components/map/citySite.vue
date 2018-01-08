<template>
  <div class="com sys-user">
    <div class="ani">
      <Select v-model="parameter.parentId" @on-change="getData()" clearable>
        <Option value="">{{$lang.currency.all}}</Option>
        <Option :key="item.id" :value="item.id" v-for="item in cityList">{{item.name}}</Option>
      </Select>
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.openStatus" @on-change="getData()">
        <Option :value="0">全部</Option>
        <Option :value="2">已开通</Option>
        <Option :value="1">未开通</Option>
      </Select>
    </div>
    <div class="table">
      <Table :columns="columns" :data="data"></Table>
    </div>
    <div class="page">
      <Page @on-change="changePage" @on-page-size-change="changePageSize" :total="total" :current="parameter.pageIndex" :page-size="parameter.pageSize" show-sizer></Page>
    </div>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'

  const {ajax, api, dateTime, changePage, getData, changePageSize} = lib
  export default {
    data() {
      return {
        judge: {
          open: this.$judge('map.citySite.open'),
          close: this.$judge('map.citySite.close')
        },
        parent: '',
        data: [],
        total: 0,
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: this.$lang.currency.name,
            key: 'name'
          },
          {
            title: '所属省市',
            key: 'province',
            render: (h, params) => {
              let arr_ = params.row.mergerName.split(',')
              return arr_[1] ? arr_[1] : arr_[0]
            }
          },
          {
            title: '拼音',
            key: 'pinyin'
          },
          {
            title: '区号',
            key: 'cityCode'
          },
          {
            title: this.$lang.currency.uTime,
            width: 170,
            key: 'updateTime',
            render: (h, params) => {
              return params.row.updateTime ? dateTime(params.row.updateTime) : ''
            }
          },
          {
            key: '',
            width: 100,
            render: (h, params) => {
              let arr = []
              if (this.judge.open && (params.row.openStatus === 1 || params.row.openStatus === null)) {
                this.openStatus = false
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.changeState(params.row.id)
                    }
                  }
                }, '开通'))
              }
              if (this.judge.close && params.row.openStatus === 2) {
                this.openStatus = true
                arr.push(h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.changeState(params.row.id)
                    }
                  }
                }, '关闭'))
              }
              return h('ButtonDropdown', arr)
            }
          }
        ],
        parameter: {
          pagination: {
            start: 1,
            number: 10
          },
          search: {
            name: ''
          },
          levelType: '2',
          name: '',
          id: '',
          parentId: '',
          openStatusStr: '2',
          openStatus: 2,
          pageIndex: 1,
          pageSize: 10
        },
        value: '',
        openStatus: true,
        btnText: '',
        cityList: [],
        api: api.cityPager
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '城市站管理'}])
      this.getData()
      this.init()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData,
      init() {
        this.cityList = this.$prov
      },
      changePage,
      changePageSize,
      changeState(id) {
        let openStatus = 1
        if (this.openStatus) {
          this.btnText = '确定关闭吗'
        } else {
          openStatus = 2
          this.btnText = '确定开通吗'
        }
        let callback = (data) => {
          this.getData()
          this.$Message.success(this.$lang.currency.oSuccess)
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.btnText,
          onOk: () => {
            ajax(api.cityUpdate, 'POST', {id, openStatus}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
