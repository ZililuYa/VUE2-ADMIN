<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.search.roleName" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="setPath('/sys/role/add')">
          <Icon type="plus-round"></Icon>
          添加角色
        </Button>
      </div>
    </div>
    <div class="table">
      <Table :columns="columns" :data="data"></Table>
    </div>
    <div class="page">
      <Page @on-change="changePage" @on-page-size-change="changePageSize" :total="total" :current="parameter.pagination.start" :page-size="parameter.pagination.number" show-sizer></Page>
    </div>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'
  const {ajax, api, dateTime} = lib
  export default {
    data () {
      return {
        dateTime,
        judge: {
          add: this.$judge('sys.role.add'),
          edit: this.$judge('sys.role.edit'),
          delete: this.$judge('sys.role.delete'),
          view: this.$judge('sys.role.view')
        },
        parent: '',
        data: [],
        total: 0,
        appType: [],
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: this.$lang.currency.name,
            key: 'roleName'
          },
          {
            title: '应用',
            key: 'code',
            render: (h, params) => {
              for (let v of this.appType) {
                if (params.row.code === v.remark) {
                  return v.text
                }
              }
            }
          },
          {
            title: '备注',
            key: 'remark'
          },
          {
            title: this.$lang.currency.uTime,
            width: 170,
            key: 'updateTime',
            render: (h, params) => {
              if (params.row.updateTime) {
                return this.dateTime(params.row.updateTime)
              } else {
                return '--'
              }
            }
          },
          {
            key: '',
            width: 100,
            render: (h, params) => {
              let arr = []
              if (this.judge.view) {
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
              if (this.judge.edit) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.editItem(params.row.id)
                    }
                  }
                }, this.$lang.currency.edit))
              }
              if (this.judge.delete) {
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
          pagination: {
            start: 1,
            number: 10
          },
          search: {
            roleName: ''
          },
          sort: {}
        }
      }
    },
    props: {},
    mounted () {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.sMan}, {title: '角色管理'}])
      this.getData()
      this.getAppType()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData () {
        let callback = (data) => {
          this.total = data.result.total
          this.data = data.result.data
        }
        ajax(api.roleList, 'POST', JSON.stringify(this.parameter), callback)
      },
      getAppType () {
        let callback = (data) => {
          this.appType = data.data
        }
        ajax(api.getDictList, 'GET', {code: 'APPTYPE'}, callback)
      },
      changePage (i) {
        this.parameter.pagination.start = i
        this.getData()
      },
      changePageSize (i) {
        this.parameter.pagination.number = i
        this.getData()
      },
      viewItem (id) {
        this.$router.push({path: '/sys/role/view', query: {id: id}})
      },
      editItem (id) {
        this.$router.push({path: '/sys/role/edit', query: {id: id}})
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
            ajax(api.roleOpt + '/' + id, 'DELETE', {}, callback)
          },
          onCancel: () => {
          }
        })
      },
      setPath (pa) {
        this.$router.push(pa)
      }
    }
  }
</script>
