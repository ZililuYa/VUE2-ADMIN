<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Input v-model="parameter.telnum" :placeholder="$lang.currency.pEI" icon="search" @on-enter="getData"></Input>
      <Cascader :data="cityList" v-model="parameter._cityId" @on-change="cityChange"></Cascader>
      <Select v-model="parameter.auditStatus" placeholder="请选择审核状态" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="1">{{$lang.currency.pAudit}}</Option>
        <Option value="2">{{$lang.currency.auditP}}</Option>
        <Option value="3">{{$lang.currency.auditN}}</Option>
        <Option value="4">{{$lang.currency.disabled}}</Option>
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

  const {ajax, api, changePage, getData, changePageSize} = lib
  export default {
    data() {
      return {
        judge: {
          audit: this.$judge('sys.operator.audit'),
          del: this.$judge('sys.operator.del'),
          enable: this.$judge('sys.operator.enable'),
          disable: this.$judge('sys.operator.disable')
        },
        data: [],
        total: 0,
        cityList: [],
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: this.$lang.currency.name,
            key: 'name',
            ellipsis: true
          },
          {
            title: this.$lang.currency.mobile,
            key: 'telnum'
          },
          {
            title: '城市',
            key: 'cityName'
          },
          {
            title: '用户',
            key: 'userName',
            render: (h, params) => {
              if (params.row.userName) {
                return true
              } else {
                return false
              }
            }
          },
          {
            title: '城市缩写',
            key: 'pinyin'
          },
          {
            title: '访问域名',
            key: 'domain'
          },
          {
            title: this.$lang.currency.state,
            key: '',
            render: (h, params) => {
              if (params.row.auditStatus === 1) {
                return this.$lang.currency.pAudit
              } else if (params.row.auditStatus === 2) {
                return '通过'
              } else if (params.row.auditStatus === 3) {
                return '未通过'
              }
            }
          },
          {
            key: '',
            width: 100,
            render: (h, params) => {
              let arr = []
              if (this.judge.audit && params.row.auditStatus === 1) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.adoptItem(params.row.id)
                    }
                  }
                }, '通过'))
              }
              if (this.judge.audit && params.row.auditStatus === 1) {
                arr.push(h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.noItem(params.row.id)
                    }
                  }
                }, '不通过'))
              }
              if (this.judge.enable && this.parameter.auditStatus === '4') {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.EDItem(params.row.id, 'enable')
                    }
                  }
                }, this.$lang.currency.enable))
              }
              if (this.judge.disable && this.parameter.auditStatus === '2') {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.EDItem(params.row.id, 'disable')
                    }
                  }
                }, this.$lang.currency.disable))
              }
              if (this.judge.del) {
                arr.push(h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.removeItem(params.row.id)
                    }
                  }
                }, this.$lang.currency.del))
              }
              return h('ButtonDropdown', arr)
            }
          }
        ],
        parameter: {
          pageIndex: 1,
          pageSize: 10,
          name: '',
          _cityId: [],
          cityId: '',
          telnum: '',
          auditStatus: '1'
        },
        api: api.operatorList
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '运营商管理'}])
      this.getData()
      this.init()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      init() {
        this.cityList = this.$cityList
      },
      cityChange(v) {
        this.parameter.cityId = v[1]
        this.getData()
      },
      getData,
      changePage,
      changePageSize,
      adoptItem(id) {
        this.auditItem(id, 2)
      },
      noItem(id) {
        this.$Modal.confirm({
          render: (h) => {
            return h('Input', {
              props: {
                value: this.value,
                autofocus: true,
                placeholder: this.$lang.currency.pEN
              },
              on: {
                input: (val) => {
                  this.value = val
                }
              }
            })
          },
          onOk: () => {
            if (!this.value) {
              this.$Message.error(this.$lang.currency.pEtc)
              return
            }
            this.auditItem(id, 3)
          }
        })
      },
      auditItem(id, num) {
        console.log(1)
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
//        let info = num === 2 ? '' : '不'
//        this.$Modal.confirm({
//          title: this.$lang.currency.prompt,
//          content: '确定' + info + '通过吗？',
//          onOk: () => {
        ajax(api.operatorAudit, 'POST', {id: id, auditStatus: num, reason: num === 3 ? this.value : ''}, callback)
//          },
//          onCancel: () => {
//          }
//        })
      },
      EDItem(id, op) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptSome,
          onOk: () => {
            ajax(op === 'enable' ? api.operatorEnable : api.operatorDisable, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
      removeItem(id) {
        let callback = (data) => {
          this.getData()
          this.$Message.success(this.$lang.currency.dSuccess)
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.operatorDel, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
