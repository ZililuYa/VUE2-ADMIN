<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <!--<Select v-model="parameter.parentId" @on-change="getData()">-->
      <!--<Option value="">{{$lang.currency.all}}</Option>-->
      <!--<Option value="0">根</Option>-->
      <!--<Option v-for="i in dataList" :value="i.id" :key="i.id">{{ i.name }}</Option>-->
      <!--</Select>-->
      <Cascader :data="dataArr" :load-data="loadData" change-on-select @on-change="cascChange"></Cascader>
      <div class="fr">
        <Button type="success" @click="addEvent" v-if="judge.add">
          <Icon type="plus-round"></Icon>
          添加内容
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
      v-model="modal_edit"
      :title="$lang.currency.editContent" @on-ok="saveModel" :loading="true">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="12">
            <FormItem label="名称" prop="name">
              <Input v-model="modalItem.name" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="代码" prop="code">
              <Input v-model="modalItem.code" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="父级">
              <!--<Select v-model="modalItem.parentId" v-if="modal_edit">-->
              <!--<Option value="0">根</Option>-->
              <!--<Option v-for="i in dataList" :value="i.id" :key="i.id">{{ i.name }}</Option>-->
              <!--</Select>-->
              <Cascader :data="dataArr" v-model="parentId" :load-data="loadData" change-on-select></Cascader>
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

  const {ajax, api, dateTime, changePage, getData, clearLoading, changePageSize} = lib
  export default {
    data() {
      return {
        judge: {
          add: this.$judge('co.content.add'),
          del: this.$judge('co.content.del'),
          edit: this.$judge('co.content.edit')
        },
        data: [],
        total: 0,
        parentId: [],
        modal: false,
        modal_edit: false,
        modalItem: {
          name: '',
          code: '',
          parentId: '0'
        },
        ruleValidate: {
          name: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          code: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          parentId: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}]
        },
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
            title: this.$lang.currency.uTime,
            width: 170,
            render: (h, params) => {
              return params.row.updateTime ? dateTime(params.row.updateTime) : ''
            }
          },
          {
            title: '代码',
            key: 'code'
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
          name: '',
          parentId: '',
          pageIndex: 1,
          pageSize: 10
        },
        value: '',
        api: api.contentLists,
        dataList: [],
        dataArr: [],
        edit: false
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '内容管理'}])
      this.getData()
      this.init()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      loadData(item, callback) {
        if (!item.children) return
        item.loading = true
        let call = (data) => {
          item.loading = false
          if (!data.data.length) {
            item.ifs = false
            delete item.loading
            delete item.children
            return
          }
          for (let i in data.data) {
            item.children.push({
              value: data.data[i].id,
              label: data.data[i].name,
              loading: false,
              children: []
            })
          }
          callback()
        }
        ajax(this.api, 'POST', {parentId: item.value, pageIndex: 1, pageSize: 99999}, call)
      },
      cascChange(c) {
        let call = (data) => {
          this.data = data.data
        }
        ajax(this.api, 'POST', {parentId: c[c.length - 1], pageIndex: 1, pageSize: 99999}, call)
      },
      editItem(row) {
        this.modalItem = row
        this.edit = true
        this.modal_edit = true
      },
      saveModel() {
        this.$refs['formValidate'].validate((valid) => {
          if (valid && this.parentId.length) {
            this.$Modal.confirm({
              title: this.$lang.currency.prompt,
              content: this.$lang.currency.promptSave,
              onOk: () => {
                let callback = (data) => {
                  this.$Message.success(this.$lang.currency.oSuccess)
                  this.modal_edit = false
                  this.getData()
                  this.parentId = []
                }
                this.modalItem.parentId = this.parentId[this.parentId.length - 1]
                ajax(this.edit ? api.contentUpdate : api.contentInsert, 'POST', this.modalItem, callback, this.clearLoading)
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
      addEvent() {
        this.modalItem = {
          name: ''
        }
        this.edit = false
        this.modal_edit = true
      },
      init() {
        let callback = (data) => {
          this.dataList = data.data
          for (let i in this.dataList) {
            this.dataArr.push({
              value: this.dataList[i].id,
              label: this.dataList[i].name,
              loading: false,
              children: []
            })
          }
        }
        ajax(this.api, 'POST', {parentId: '0', pageIndex: 1, pageSize: 99999}, callback)
      },
      deleteItem(id) {
        let callback = () => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.contentDelete, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
      getData,
      changePage,
      changePageSize
    }
  }
</script>
