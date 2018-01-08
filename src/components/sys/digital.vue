<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.modelType" @on-change="getData()">
        <Option value="0">组合模型</Option>
        <Option value="1">空间模型</Option>
        <Option value="2">方案模型</Option>
        <Option value="3">场景模型</Option>
      </Select>
      <Select v-model="parameter.modelStatus" @on-change="getData()">
        <Option :value="1">{{$lang.currency.pAudit}}</Option>
        <Option :value="2">{{$lang.currency.auditP}}</Option>
        <Option :value="3">{{$lang.currency.auditN}}</Option>
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
      title="模型详情">
      <div class="modal_def">
        <div class="img">
          <img v-if="modalItem.modelPicUrl" v-lazy="modalItem.modelPicUrl" alt="">
          <span v-if="!modalItem.modelPicUrl">没有预览图</span>
          <br>
        </div>
        <div class="li">
          <div class="div">ID：</div>
          <div class="div">{{modalItem.id}}</div>
        </div>
        <div class="li">
          <div class="div">标题：</div>
          <div class="div">{{modalItem.name}}</div>
        </div>
        <div class="li">
          <div class="div">品牌：</div>
          <div class="div">{{modalItem.brand}}</div>
        </div>
        <div class="li">
          <div class="div">创建时间：</div>
          <div class="div">{{modalItem.createTime | formatDate}}</div>
        </div>
        <div class="li">
          <div class="div">描述：</div>
          <div class="div">{{modalItem.modelDigitizationContext}}</div>
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
          view: this.$judge('sys.digital.view'),
          trial: this.$judge('sys.digital.trial')
        },
        parent: '',
        data: [],
        total: 0,
        modal: false,
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
            title: '模型文件',
            key: 'mmp',
            render: (h, params) => {
              if (params.row.modelUrl) {
                return h('a', {
                  attrs: {
                    href: params.row.modelUrl
                  }
                }, '下载模型')
              } else {
                return '空'
              }
            }
          },
          {
            title: this.$lang.currency.state,
            key: 'createTime',
            render: (h, params) => {
              if (params.row.checkStatus === 0) {
                return '未审核'
              } else if (params.row.checkStatus === 1) {
                return this.$lang.currency.pAudit
              } else if (params.row.checkStatus === 2) {
                return this.$lang.currency.auditP
              } else if (params.row.checkStatus === 3) {
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
              if (this.judge.trial && (this.parameter.modelStatus === 1)) {
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
              if (this.judge.trial && (this.parameter.modelStatus === 1)) {
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
          modelStatus: 1,
          pageIndex: 1,
          pageSize: 10,
          modelType: '1'
        },
        value: '',
        api: api.digitalList
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '数字化模型管理'}])
      this.getData()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData,
      changePage,
      changePageSize,
      viewItem(item) {
        this.modal = true
        this.modalItem = item
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
          ajax(api.digitalAudit, 'POST', {id: id, checkStatus: num, reason: this.value}, callback)
          return
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定' + info + '通过吗？',
          onOk: () => {
            ajax(api.digitalAudit, 'POST', {id: id, checkStatus: num}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
