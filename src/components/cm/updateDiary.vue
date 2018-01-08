<template>
  <div class="com sys-user">
    <div class="ani">
      <Select v-model="parameter.type" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option v-for="(x, i) in dataList" :value="x.appKey" :key="x.appKey">{{x.name}}</Option>
      </Select>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="addEvent">
          <Icon type="plus-round"></Icon>
          添加更新日志
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
      title="更新日志详情" width="80%">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <h3 style="text-align: center;padding: 20px 0">{{modalItem.title}}</h3>
        <div v-html="modalItem.content" class="notice-html"></div>
      </div>
    </Modal>
    <Modal
      v-model="modal_edit" id="model"
      :title="$lang.currency.editContent" width="80%" @on-ok="saveModel" :loading="true" :mask-closable="false">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="12">
            <FormItem label="标题" prop="title">
              <Input v-model="modalItem.title" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="应用分类" prop="type">
              <Select v-model="modalItem.type" style="width:100%" v-if="modal_edit">
                <Option v-for="(x, i) in dataList" :value="x.appKey" :key="x.appKey">{{x.name}}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="内容">
              <Progress :percent="pro" v-if="pro && pro!=100"></Progress>
              <editor ref="myTextEditor"
                      :fileName="'file'"
                      :canCrop="canCrop"
                      :uploadUrl="uploadUrl"
                      :onProgress="progress"
                      v-model="modalItem.content"></editor>
              <div v-html="content"></div>
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
          add: this.$judge('cm.updateDiary.add'),
          del: this.$judge('cm.updateDiary.del'),
          view: this.$judge('cm.updateDiary.view'),
          edit: this.$judge('cm.updateDiary.edit')
        },
        pro: 0,
        canCrop: false,
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
        typeList: [],
        dataList: [],
        data: [],
        ruleValidate: {
          title: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          type: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}]
        },
        total: 0,
        modal: false,
        modal_edit: false,
        modalItem: {
          title: '',
          type: '',
          content: ''
        },
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '标题',
            key: 'title',
            ellipsis: true
          },
          {
            title: this.$lang.currency.uTime,
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
              if (this.judge.edit) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.editItem(params.row, true)
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
          pagination: {
            start: 1,
            number: 10
          },
          search: {
            name: ''
          },
          sort: {},
          status: '1',
          type: '',
          modelState: '1',
          pageIndex: 1,
          pageSize: 10,
          modelType: '',
          mobile: '',
          modelLabel: '',
          typeId: ''
        },
        api: api.logList
      }
    },
    props: {},
    mounted() {
      this.getData()
      this.init()
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '更新日志管理'}])
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      addEvent() {
        this.modalItem = {
          title: '',
          content: '',
          type: ''
        }
        this.edit = false
        this.modal_edit = true
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
                let callback = (data) => {
                  this.$Message.success(this.$lang.currency.oSuccess)
                  this.modal_edit = false
                  this.getData()
                }
                delete this.modalItem.user
                ajax(this.edit ? api.logUpdate : api.logInsert, 'POST', this.modalItem, callback, this.clearLoading)
              },
              onCancel: () => {
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
          this.dataList = data.data
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
            ajax(api.logDel, 'POST', {id}, callback)
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

  .notice-html img {
    max-width: 100%;
  }
</style>
