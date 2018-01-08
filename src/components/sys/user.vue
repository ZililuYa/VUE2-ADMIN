<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.time" placeholder="请选择用户活跃度" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="ONEDAY">一天内活跃</Option>
        <Option value="TWODAR">两天内活跃</Option>
        <Option value="ONEWEEK">一周内活跃</Option>
        <Option value="ONEMONTH">一个月内活跃</Option>
      </Select>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="setPath('/sys/user/add')">
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
    <Modal
      :mask-closable="false"
      v-model="roleModal"
      title="编辑角色"
      @on-ok="okSave" class="admin-model">
      <Form ref="formCustom" :model="userRole" :label-width="100">
        <div v-for="(item, index) in roleData">
          <FormItem :label="item.text">
            <RadioGroup v-model="userRole._role[index]" @on-change="roleChange(index)">
              <span v-for="role in item.role">
                <Radio :label="role.roleName" :disabled="index === 'operator' || index === 'decorate'"></Radio>
              </span>
            </RadioGroup>
          </FormItem>
        </div>
      </Form>
    </Modal>
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
          add: this.$judge('sys.user.add'),
          edit: this.$judge('sys.user.edit'),
          view: this.$judge('sys.user.view'),
          delete: this.$judge('sys.user.delete'),
          role: this.$judge('sys.user.role')
        },
        curId: '',
        userRole: {
          _role: [],
          role: []
        },
        roleOldData: [],
        roleData: {},
        appType: [],
        roleModal: false,
        parent: '',
        data: [],
        total: 0,
        api: api.userList,
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '头像',
            key: '',
            render: (h, params) => {
              return h('img', {
                attrs: {
                  'src': params.row.avatar
                },
                style: {
                  width: '55px',
                  height: '55px',
                  margin: '10px'
                }
              })
            }
          },
          {
            title: '用户名',
            key: 'name'
          },
          {
            title: '邮箱',
            key: 'email',
            ellipsis: true
          },
          {
            title: '手机',
            key: 'mobile'
          },
          {
            title: '余额',
            key: 'balance'
          },
          {
            title: '阿拉币',
            key: 'consumePoints'
          },
          {
            title: this.$lang.currency.state,
            key: 'state',
            render: (h, params) => {
              if (params.row.state === 1) {
                return '启用中'
              } else {
                return '禁用'
              }
            },
            width: 80
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
              if (this.judge.role) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.roleItem(params.row.id)
                    }
                  }
                }, this.$lang.currency.role))
              }
//              if (this.judge.delete) {
//                arr.push(h('Button', {
//                  props: {
//                    type: 'error',
//                    size: 'small'
//                  },
//                  on: {
//                    click: () => {
//                      this.removeItem(params.row.id)
//                    }
//                  }
//                }, this.$lang.currency.del))
//              }
              return h('ButtonDropdown', arr)
            }
          }
        ],
        parameter: {
          pageIndex: 1,
          pageSize: 10,
          time: '',
          name: ''
        }
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.sMan}, {title: '用户管理'}])
      this.getData()
      this.getAppType()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData,
//      getData (i) {
//        if (!isNaN(i)) this.parameter.pageIndex = 1
//        let callback = (data) => {
//          this.total = data.total
//          this.data = data.data
//        }
//        ajax(api.userList, 'POST', this.parameter, callback)
//      },
      changePage,
      changePageSize,
      getAppType() {
        let callback = (data) => {
          this.appType = data.data
        }
        ajax(api.getDictList, 'GET', {code: 'APPTYPE'}, callback)
      },
      toFormat(role) {
        this.roleData = {}
        this.userRole.role = []
        this.userRole._role = []
        for (let v of role) {
          for (let i of this.appType) {
            if (v.code === i.remark) {
              if (this.roleData[i.remark]) {
                this.roleData[i.remark].role.push(v)
              } else {
                this.roleData[i.remark] = {
                  text: i.text,
                  role: [v]
                }
              }
              if (v.checked) {
                this.userRole._role[i.remark] = v.roleName
              } else if (!this.userRole._role[i.remark]) {
                this.userRole._role[i.remark] = ''
              }
            }
          }
        }
        for (let item in this.roleData) {
          this.roleData[item].role.push({roleName: '不分配', checked: false})
          let isNochecked = false
          for (let i in this.roleData[item].role) {
            if (this.roleData[item].role[i].checked) isNochecked = true
            if (parseInt(i) === (this.roleData[item].role.length - 1) && !isNochecked) {
              this.userRole._role[item] = '不分配'
            }
          }
        }
      },
      roleItem(id) {
        this.curId = id
        let callback = (data) => {
          this.roleOldData = data.data
          this.toFormat(data.data)
          this.roleModal = true
        }
        ajax(api.selectUserRole, 'POST', {id}, callback)
      },
      roleChange(index) {
        this.roleOldData.map(item => {
          if (item.code === index) {
            item.checked = false
          }
          if (item.roleName === this.userRole._role[item.code]) {
            item.checked = true
          }
        })
        this.toFormat(this.roleOldData)
      },
      okSave() {
        this.roleOldData.forEach(item => {
          if (this.userRole._role[item.code] && item.roleName === this.userRole._role[item.code]) {
            item.checked = true
            this.userRole.role.push(item)
          }
        })
        let callback = (data) => {
          this.getData()
          this.$Message.success(this.$lang.currency.oSuccess)
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptSave,
          onOk: () => {
            ajax(api.updateUserRole, 'POST', {
              userId: this.curId,
              roleList: JSON.stringify(this.userRole.role)
            }, callback)
          },
          onCancel: () => {
          }
        })
      },
      viewItem(id) {
        this.$router.push({path: '/sys/user/view', query: {id: id}})
      },
      editItem(id) {
        this.$router.push({path: '/sys/user/edit', query: {id: id}})
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
            ajax(api.userOpt + '/' + id, 'DELETE', {}, callback)
          },
          onCancel: () => {
          }
        })
      },
      setPath(pa) {
        this.$router.push(pa)
      }
    }
  }
</script>
