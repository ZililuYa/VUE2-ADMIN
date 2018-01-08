<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData" ></Input>
      <Select v-model="parameter.status" @on-change="getData()" >
        <Option value="1">{{$lang.currency.pAudit}}</Option>
        <Option value="2">{{$lang.currency.auditP}}</Option>
        <Option value="3">{{$lang.currency.auditN}}</Option>
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
  const {ajax, api, dateTime, getData} = lib
  export default {
    data () {
      return {
        judge: {
          user: this.$judge('sys.organize.user'),
          trial: this.$judge('sys.organize.trial')
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
            title: '组织名',
            key: 'name'
          },
          {
            title: '创建人',
            key: 'createPerson'
          },
          {
            title: this.$lang.currency.uTime,
            width: 170,
            key: 'createTime',
            render: (h, params) => {
              return dateTime(params.row.createTime)
            }
          },
          {
            title: this.$lang.currency.state,
            key: 'state',
            render: (h, params) => {
              if (params.row.status === 1) {
                return this.$lang.currency.pAudit
              } else if (params.row.status === 2) {
                return this.$lang.currency.auditP
              } else if (params.row.status === 3) {
                return this.$lang.currency.auditN
              }
            }
          },
          {
            key: '',
            width: 100,
            render: (h, params) => {
              let arr = []
              if (this.judge.trial && this.parameter.status === '1') {
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
              if (this.judge.user && this.parameter.status === '2') {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.viewItem(params.row.id)
                    }
                  }
                }, this.$lang.currency.show))
              }
              if (this.judge.trial && this.parameter.status === '1') {
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
          sort: {},
          status: '1',
          name: '',
          pageIndex: 1,
          pageSize: 10
        },
        value: '',
        api: api.organList
      }
    },
    props: {},
    mounted () {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.sMan}, {title: '组织管理'}])
      this.getData()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData,
      changePage (i) {
        this.parameter.pagination.start = i
        this.getData(i)
      },
      changePageSize (i) {
        this.parameter.pagination.number = i
        this.getData()
      },
      viewItem (id) {
        this.$router.push({path: '/sys/organize/user', query: {id: id}})
      },
      adoptItem (id) {
        this.auditItem(id, 2)
      },
      noItem (id) {
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
      auditItem (id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.value = ''
        }
        let info = num === 2 ? '' : '不'
        if (num !== 2) {
          ajax(api.organAudit, 'POST', {id: id, state: num, reason: this.value}, callback)
          return
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定' + info + '通过吗？',
          onOk: () => {
            ajax(api.organAudit, 'POST', {id: id, state: num}, callback)
          },
          onCancel: () => {
          }
        })
      },
      removeItem (id) {
        let callback = (data) => {
          this.getData()
          this.$Message.success(this.$lang.currency.dSuccess)
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.userOpt + '/' + id, 'DELETE', {}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
