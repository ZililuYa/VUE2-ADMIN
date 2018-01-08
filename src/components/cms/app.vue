<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="addEvent">
          <Icon type="plus-round"></Icon>
          添加应用
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
      :title="$lang.currency.editContent" @on-ok="saveModel" :loading="true" :mask-closable="false">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="24">
            <FormItem label="名称" prop="name">
              <Input v-model="modalItem.name" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="Key" prop="appKey">
              <Input v-model="modalItem.appKey" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="标识" prop="type">
              <Input v-model="modalItem.type" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="应用分类">
              <Select v-model="appId" multiple style="width:100%">
                <Option v-for="item in appList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
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
          add: this.$judge('cms.app.add'),
          del: this.$judge('cms.app.del'),
          edit: this.$judge('cms.app.edit')
        },
        appId: [],
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
        appList: [],
        typeList: [],
        data: [],
        ruleValidate: {
          name: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          appKey: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          type: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          appId: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}]
        },
        total: 0,
        modal: false,
        modal_edit: false,
        modalItem: {
          title: '',
          author: '',
          url: '',
          classId: '',
          appId: []
        },
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: 'Key',
            key: 'appKey'
          },
          {
            title: this.$lang.currency.name,
            key: 'name'
          },
          {
            title: '标识',
            key: 'type'
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
              if (this.judge.edit) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.editItem(params.row)
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
          name: '',
          modelState: '1',
          pageIndex: 1,
          pageSize: 10,
          modelType: '',
          mobile: '',
          modelLabel: '',
          typeId: ''
        },
        api: api.appListPager
      }
    },
    props: {},
    mounted() {
      this.getData()
      this.init()
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.mMan}, {title: '应用管理'}])
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      addEvent() {
        this.edit = false
        this.modal_edit = true
        this.modalItem = {
          content: ''
        }
      },
      saveModel() {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            this.$Modal.confirm({
              title: this.$lang.currency.prompt,
              content: this.$lang.currency.promptSave,
              onOk: () => {
                if (this.appId.length) this.modalItem.classId = this.appId.join(',')
                let callback = (data) => {
                  this.$Message.success(this.$lang.currency.oSuccess)
                  this.modal_edit = false
                  this.getData()
                }
                ajax(this.edit ? api.appUpdate : api.appInsert, 'POST', this.modalItem, callback, this.clearLoading)
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
        ajax(api.typeListAll, 'GET', {}, callback)
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
        item.classId ? this.appId = item.classId.split(',') : this.appId = []
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
            ajax(api.appDelete, 'POST', {id}, callback)
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
