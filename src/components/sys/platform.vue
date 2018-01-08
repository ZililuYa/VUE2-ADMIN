<template>
  <div class="com sys-user">
    <div class="ani">
      <div class="fr">
        <Button type="success" v-if="role === '1' && judge.add" @click="$router.push('/sys/platform/add')">
          <Icon type="plus-round"></Icon>
          添加用户
        </Button>
      </div>
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

  const {ajax, api, dateTime, getData} = lib
  import { mapActions, mapState } from 'vuex'

  export default {
    data() {
      return {
        judge: {
          add: this.$judge('sys.platform.add'),
          transfer: this.$judge('sys.platform.transfer'),
          delete: this.$judge('sys.platform.delete'),
          admin: this.$judge('sys.platform.admin')
        },
        parent: '',
        api: api.organUserList,
        data: [],
        total: 0,
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '名字',
            key: 'member["name"]',
            render: (h, params) => {
              return params.row.member.name
            }
          },
          {
            title: this.$lang.currency.mobile,
            key: 'member["mobile"]',
            render: (h, params) => {
              return params.row.member.mobile
            }
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
            title: '角色',
            key: 'createTime',
            render: (h, params) => {
              if (params.row.role === '1') {
                return '创建者'
              } else if (params.row.role === '2') {
                return '管理员'
              } else if (params.row.role === '3') {
                return '用户'
              }
            }
          },
          {
            width: 100,
            render: (h, params) => {
              let arr = []
              if (this.judge.transfer && params.row.role === '2') {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.transferItem(params.row.id)
                    }
                  }
                }, '移交'))
              }
              if (this.judge.admin && params.row.role === '2') {
                arr.push(h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.userRoleItem(params.row.id, 3)
                    }
                  }
                }, '取消管理员'))
              }
              if (this.judge.admin && params.row.role === '3') {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.userRoleItem(params.row.id, 2)
                    }
                  }
                }, '设置管理员'))
              }
              if (this.judge.delete && params.row.role !== '1' && params.row.role !== '2') {
                arr.push(h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.deleteItem(params.row.id)
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
            name: ''
          },
          sort: {},
          status: '1',
          name: '',
          pageIndex: 1,
          pageSize: 10
        }
      }
    },
    props: {},
    computed: {
      ...mapState({
        role: state => state.system.login_info.result.org.role
      })
    },
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.sMan}, {title: '平台组织'}])
      this.parameter.orgId = this.$route.query.id
      this.getData()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData,
      changePage(i) {
        this.parameter.pagination.start = i
        this.getData()
      },
      changePageSize(i) {
        this.parameter.pagination.number = i
        this.getData()
      },
      deleteItem(id) {
        let callback = (data) => {
          this.getData()
          this.$Message.success(this.$lang.currency.dSuccess)
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.organDeleteList, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
      userRoleItem(id, role) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定此操作吗？',
          onOk: () => {
            ajax(api.userRole, 'POST', {id, role}, callback)
          },
          onCancel: () => {
          }
        })
      },
      transferItem(id) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.$router.push('/')
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定移交到这个用户吗？',
          onOk: () => {
            ajax(api.organTransfer, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
