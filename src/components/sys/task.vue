<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.type" placeholder="请选择类型" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="1">签到</Option>
        <Option value="2">模型上传</Option>
        <Option value="3">户型上传</Option>
        <Option value="4">VIP登录</Option>
      </Select>
      <Select v-model="parameter.taskClass" placeholder="请选择分类" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="1">每日任务</Option>
        <Option value="3">成长任务</Option>
        <Option value="2">成就任务</Option>
      </Select>
      <Select v-model="parameter.finishType" placeholder="请选择完成类型" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="1">每天</Option>
        <Option value="2">连续</Option>
        <Option value="3">累计</Option>
      </Select>
      <Select v-model="parameter.rewardType" placeholder="请选择奖励类型" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="1">自动发放</Option>
        <Option value="2">自己领取</Option>
      </Select>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="setPath('/sys/task/add')">
          <Icon type="plus-round"></Icon>
          添加任务
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
  import { mapActions } from 'vuex'

  const {ajax, api, changePage, getData, changePageSize} = lib
  export default {
    data() {
      return {
        judge: {
          add: this.$judge('sys.task.add'),
          edit: this.$judge('sys.task.edit'),
          del: this.$judge('sys.task.del'),
          view: this.$judge('sys.task.view')
        },
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
            key: 'name',
            ellipsis: true
          },
          {
            title: '类型',
            key: '',
            render: (h, params) => {
              if (params.row.type === 1) {
                return '签到'
              } else if (params.row.type === 2) {
                return '模型上传'
              } else if (params.row.type === 3) {
                return '户型上传'
              } else if (params.row.type === 4) {
                return 'VIP登录'
              }
            }
          },
          {
            title: '分类',
            key: '',
            render: (h, params) => {
              if (params.row.taskClass === 1) {
                return '每日任务'
              } else if (params.row.taskClass === 3) {
                return '成长任务'
              } else if (params.row.taskClass === 2) {
                return '成就任务'
              }
            }
          },
          {
            title: '完成数量',
            key: 'finishNum'
          },
          {
            title: '完成类型',
            key: '',
            render: (h, params) => {
              if (params.row.finishType === 1) {
                return '每天'
              } else if (params.row.finishType === 2) {
                return '连续'
              } else if (params.row.finishType === 3) {
                return '累加'
              }
            }
          },
          {
            title: '奖励数量',
            key: 'rewardNum'
          },
          {
            title: '奖励类型',
            key: '',
            render: (h, params) => {
              if (params.row.rewardType === 1) {
                return '自动发放'
              } else if (params.row.rewardType === 2) {
                return '自己领取'
              }
            }
          },
          {
            title: '显示',
            key: '',
            render: (h, params) => {
              if (params.row.displayStatus === 1) {
                return '是'
              } else if (params.row.displayStatus === 2) {
                return '否'
              } else {
                return '否'
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
          type: '',
          taskClass: '',
          finishNum: '',
          finishType: '',
          rewardNum: '',
          rewardType: ''
        },
        api: api.taskList
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '任务管理'}])
      this.getData()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData,
      changePage,
      changePageSize,
      viewItem(id) {
        this.$router.push({path: '/sys/task/view', query: {id: id}})
      },
      editItem(id) {
        this.$router.push({path: '/sys/task/edit', query: {id: id}})
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
            ajax(api.taskDel, 'POST', {id}, callback)
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
