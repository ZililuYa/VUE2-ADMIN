<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.audit" @on-change="getData()">
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
    <Modal
      :mask-closable="false"
      v-model="modal"
      title="主题详情" width="80%">
      <div class="modal_def" v-if="item" style="padding-bottom: 20px;border-bottom: 0;">
        <h3 style="text-align: center;padding: 20px">{{item.name}}</h3>
        <div class="html" v-html="item.html"></div>
        <div class="reply" v-if="item.html_reply">
          <h4>采纳的评论：</h4>
          <div class="" style="padding: 20px" v-html="item.html_reply"></div>
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
          view: this.$judge('sys.community.view'),
          trial: this.$judge('sys.community.trial'),
          recommend: this.$judge('sys.community.recommend')
        },
        parent: '',
        data: [],
        total: 0,
        modal: false,
        item: '',
        modalItem: [],
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
            title: this.$lang.currency.uTime,
            width: 170,
            key: 'createTime',
            render: (h, params) => {
              return dateTime(params.row.createTime)
            }
          },
          {
            title: this.$lang.currency.state,
            key: 'createTime',
            width: 100,
            render: (h, params) => {
              if (params.row.audit === 1) {
                return this.$lang.currency.pAudit
              } else if (params.row.audit === 2) {
                return this.$lang.currency.auditP
              } else if (params.row.audit === 3) {
                return this.$lang.currency.auditN
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
                      this.viewItem(params.row)
                    }
                  }
                }, this.$lang.currency.show))
              }
              if (this.judge.recommend && params.row.selected === 1 && (this.parameter.audit === '2')) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.primaryItem(params.row.id, 2)
                    }
                  }
                }, this.$lang.currency.recomm))
              }
              if (this.judge.recommend && params.row.selected === 2 && (this.parameter.audit === '2')) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.primaryItem(params.row.id, 1)
                    }
                  }
                }, this.$lang.currency.cancelRecomm))
              }
              if (this.judge.trial && (this.parameter.audit === '1')) {
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
              if (this.judge.trial && (this.parameter.audit === '1')) {
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
          pubStatus: '',
          pageIndex: 1,
          audit: '1'
        },
        value: '',
        api: api.communityList
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '社区管理'}])
      this.getData()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData,
      changePage,
      primaryItem(id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(api.communitySelet, 'POST', {id: id, recommand: num}, callback)
      },
      changePageSize,
      viewItem(item) {
        this.item = item
        this.item.html = item.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
        let callback = (data) => {
          this.modal = true
          this.item.html_reply = data.data[0].commentText
        }
        ajax(api.commentList, 'POST', {contentId: item.id, status: 1}, callback)
      },
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
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.value = ''
          this.getData()
        }
        let info = num === 2 ? '' : '不'
        if (num !== 2) {
          ajax(api.communityAudit, 'POST', {id: id, auditStatus: num, reason: this.value}, callback)
          return
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定' + info + '通过吗？',
          onOk: () => {
            ajax(api.communityAudit, 'POST', {id: id, auditStatus: num}, callback)
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
