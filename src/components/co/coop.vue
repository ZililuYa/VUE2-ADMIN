<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.status" @on-change="getData()">
        <Option value="2">{{$lang.currency.pAudit}}</Option>
        <Option value="3">{{$lang.currency.auditP}}</Option>
        <Option value="8">{{$lang.currency.auditN}}</Option>
      </Select>
    </div>
    <div class="table">
      <Table :columns="columns" :data="data"></Table>
    </div>
    <div class="page">
      <Page @on-change="changePage" @on-page-size-change="changePageSize" :total="total" :current="parameter.pageIndex" :page-size="parameter.pageSize" show-sizer></Page>
    </div>

    <Modal
      :mask-closable="false"
      v-model="modal"
      title="项目协作详情">
      <div class="modal_def">
        <div class="img">
          <img v-if="modalItem.productImg" v-lazy="modalItem.productImg" alt="">
          <span v-if="!modalItem.productImg">没有预览图</span>
          <br>
        </div>
        <div class="li">
          <div class="div">ID：</div>
          <div class="div">{{modalItem.id}}</div>
        </div>
        <div class="li">
          <div class="div">名称：</div>
          <div class="div">{{modalItem.name}}</div>
        </div>
        <div class="li">
          <div class="div">类型：</div>
          <div class="div">{{modalItem.type}}</div>
        </div>
        <div class="li">
          <div class="div">结束时间：</div>
          <div class="div">{{modalItem.finishTime | formatDate}}</div>
        </div>
        <div class="li">
          <div class="div">描述：</div>
          <div class="div">{{modalItem.description}}</div>
        </div>
        <div class="li">
          <div class="div">产品链接：</div>
          <div class="div">{{modalItem.productUrl}}</div>
        </div>
        <div class="li">
          <div class="div">创建人名称：</div>
          <div class="div">{{modalItem.createMemberName}}</div>
        </div>
        <div class="li">
          <div class="div">创建人手机号：</div>
          <div class="div">{{modalItem.createMemberMobile}}</div>
        </div>
        <div class="li">
          <div class="div">评论状态：</div>
          <div class="div">{{modalItem.commentStatus}}</div>
        </div>
        <div class="li" v-if="modalItem.house">
          <div class="div">户型id：</div>
          <div class="div">{{modalItem.house.id}}</div>
        </div>
        <div class="li" v-if="modalItem.house">
          <div class="div">户型名称：</div>
          <div class="div">{{modalItem.house.name}}</div>
        </div>
      </div>
    </Modal>
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
          del: this.$judge('co.coop.del'),
          view: this.$judge('co.coop.view'),
          trial: this.$judge('co.coop.trial')
        },
        data: [],
        total: 0,
        modal: false,
        modalItem: {},
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
            title: '图片',
            key: '',
            render: (h, params) => {
              return h('img', {
                attrs: {
                  src: params.row.productImg
                },
                style: {
                  width: '55px',
                  height: '55px',
                  margin: '10px 0'
                }
              })
            }
          },
          {
            title: this.$lang.currency.uTime,
            width: 170,
            render: (h, params) => {
              return dateTime(params.row.finishTime)
            }
          },
          {
            title: this.$lang.currency.mobile,
            key: 'createMemberMobile'
          },
          {
            title: '类型',
            width: 60,
            key: '',
            render: (h, params) => {
              if (params.row.type === 1) {
                return '模型'
              } else if (params.row.type === 2) {
                return '量房'
              } else if (params.row.type === 3) {
                return '方案'
              }
            }
          },
          {
            key: '',
            width: 100,
            render: (h, params) => {
              let arr = []
              if (this.judge.view && (this.parameter.status === '2')) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.viewItem(params.row)
                    }
                  }
                }, this.$lang.currency.show))
              }
              if (this.judge.trial && (this.parameter.status === '2')) {
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
              if (this.judge.trial && (this.parameter.status === '2')) {
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
              if (this.judge.del && (this.parameter.status !== '2')) {
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
          status: '2',
          name: '',
          pageIndex: 1,
          pageSize: 10,
          modelType: '1'
        },
        value: '',
        api: api.coopList
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '项目协作管理'}])
      this.getData()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      deleteItem(id) {
        let callback = () => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.coopDelete, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
      getData,
      changePage,
      changePageSize,
      viewItem(item) {
        this.modalItem = item
        if (item.commentStatus === 1) {
          this.modalItem.commentStatus = '未评论'
        } else if (item.commentStatus === 2) {
          this.modalItem.commentStatus = '已评论'
        }
        if (item.type === 1) {
          this.modalItem.type = '模型'
        } else if (item.type === 2) {
          this.modalItem.type = '量房'
        } else if (item.type === 3) {
          this.modalItem.type = '方案'
        }
        this.modal = true
      },
      adoptItem(id) {
        this.auditItem(id, 3)
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
            this.auditItem(id, 8)
          }
        })
      },
      auditItem(id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.value = ''
          this.getData()
        }
        let info = num === 3 ? '' : '不'
        if (num !== 3) {
          ajax(api.coopAudit, 'POST', {id: id, status: num, reason: this.value}, callback)
          return
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定' + info + '通过吗？',
          onOk: () => {
            ajax(api.coopAudit, 'POST', {id: id, status: num}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
