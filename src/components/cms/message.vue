<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="addEvent">
          <Icon type="plus-round"></Icon>
          添加消息
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
      v-model="modal"
      title="详情" width="80%">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        内容：
        <div v-html="modalItem.content" class="news-html"></div>
      </div>
    </Modal>
    <Modal
      v-model="modal_edit" id="model"
      :title="$lang.currency.editContent" width="80%" @on-ok="saveModel" :loading="true" :mask-closable="false">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="12">
            <FormItem label="应用" prop="appId">
              <Select v-model="modalItem.appId" style="width:100%" @on-change="selectEvent">
                <Option v-for="item in appList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="分类" prop="classId">
              <Select v-model="modalItem.classId" style="width:100%">
                <Option v-for="item in typeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="接收人" prop="MessageCode">
              <Select v-model="modalItem.MessageCode" style="width:100%">
                <Option v-for="item in codeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="24" v-if="modalItem.code === 4">
            <FormItem label="手机号" prop="phone">
              <Input type="text" v-model="modalItem.phone" placeholder="多个手机号请用逗号,隔开"></Input>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="消息内容" prop="content">
              <Input type="textarea" v-model="modalItem.content" placeholder=""></Input>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'
  import editor from '../editor/Quilleditor.vue'

  const {ajax, api, dateTime, clearLoading, changePage, getData, changePageSize} = lib
  export default {
    components: {
      editor
    },
    data() {
      return {
        judge: {
          add: this.$judge('cms.message.add'),
          del: this.$judge('cms.message.del'),
          view: this.$judge('cms.message.view')
        },
        pro: 0,
        canCrop: false,
        codeList: [{
          id: 1,
          name: '系统消息'
        }, {
          id: 2,
          name: '设计师'
        }, {
          id: 3,
          name: '装饰公司组织成员'
        }, {
          id: 4,
          name: '输入用户手机号'
        }],
        uploadUrl: '/api/v1/upload/fileImage',
        content: '',
        showVideo: false,
        video_path: '',
        id: '',
        number: 0,
        modal_wp: false,
        parent: '',
        table_data: [],
        edit: false,
        wp: '',
        wp1: [],
        appList: [],
        typeList: [],
        data: [],
        ruleValidate: {
          appId: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          classId: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          MessageCode: [{required: true, message: this.$lang.currency.pEtc}],
          content: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          phone: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}]
        },
        total: 0,
        modal: false,
        modal_edit: false,
        modalItem: {
          title: '',
          author: '',
          url: '',
          classId: '',
          appId: '',
          MessageCode: 0
        },
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '发送人',
            key: 'sender'
          },
          {
            title: '接收人',
            key: 'receiver'
          },
          {
            title: '应用分类',
            key: 'messClass',
            ellipsis: true
          },
          {
            title: this.$lang.currency.uTime,
            key: '',
            width: 170,
            render: (h, params) => {
              return dateTime(params.row.updateTime || params.row.createTime || '')
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
          modelState: '1',
          pageIndex: 1,
          pageSize: 10,
          modelType: '',
          mobile: '',
          modelLabel: '',
          typeId: ''
        },
        api: api.messageList,
        method: 'GET'
      }
    },
    props: {},
    mounted() {
      this.getData()
      this.init()
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.mMan}, {title: this.$lang.currency.mMan}])
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      addEvent() {
        this.edit = false
        this.modal_edit = true
        this.modalItem = {
          content: '',
          MessageCode: 1
        }
      },
      selectEvent(appId) {
        let callback = (data) => {
          this.typeList = data.data
        }
        ajax(api.appGetClass, 'GET', {appId}, callback)
      },
      progress(e) {
        this.pro = parseInt(e.percent)
      },
      saveModel() {
        this.$refs['formValidate'].validate((valid) => {
          if (valid && this.modalItem.content) {
            this.$Modal.confirm({
              title: this.$lang.currency.prompt,
              content: this.$lang.currency.promptSave,
              onOk: () => {
                if (this.modalItem.code === 4) {
                  this.modalItem.MessageCode = this.modalItem.phone
                }
                let callback = (data) => {
                  this.$Message.success(this.$lang.currency.oSuccess)
                  this.modal_edit = false
                  this.getData()
                }
                ajax(this.edit ? api.newsUpdate : api.messageAdd, 'POST', this.modalItem, callback, this.clearLoading)
              },
              onCancel: () => {
                this.clearLoading()
              }
            })
          } else {
            this.$Message.error(this.$lang.currency.pFia)
            this.clearLoading()
          }
        })
      },
      clearLoading,
      getData,
      init() {
        let callback = (data) => {
          this.appList = data.data
        }
        ajax(api.appList, 'GET', {}, callback)
      },
      changePage,
      changePageSize,
      viewItem(item) {
        this.modalItem = item
        this.modal = true
      },
      editItem(item) {
        this.modalItem = {}
        for (let i in item) {
          this.modalItem[i] = item[i]
        }
        this.edit = true
        this.modal_edit = true
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
            ajax(api.messageDelete, 'GET', {id}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
<style>
  .ql-container .ql-editor {
    min-height: 200px;
  }

  .news-html img {
    max-width: 100%;
  }
</style>
