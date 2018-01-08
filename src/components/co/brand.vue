<template>
  <div class="com sys-user">
    <div class="ani">
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="addEvent">
          <Icon type="plus-round"></Icon>
          添加品牌
        </Button>
      </div>
    </div>
    <div class="table">
      <Table :columns="columns" :data="data"></Table>
    </div>
    <div class="page">
      <Page @on-change="changePage" @on-page-size-change="changePageSize" :total="total" :current="parameter.pageIndex" :page-size="parameter.pageSize" show-sizer></Page>
    </div>
    <Modal :closable="false" v-model="modal_edit" id="model" :title="$lang.currency.editContent" width="70%" @on-ok="saveModel" @on-cancel="cancelModel" :loading="true" :mask-closable="false">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="12">
            <FormItem label="名称" prop="name">
              <Input v-model="modalItem.name" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="分类" prop="type">
              <Select v-model="modalItem.type" style="width:100%" multiple>
                <Option v-for="item in typeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="品牌LOGO">
              <Upload :format="['jpg','jpeg','png']" action="/api/v1/upload/fileImage" :on-format-error="handleFormatError" :on-error="handleError" :on-success="imgUpload" :show-upload-list="false"
                      :on-progress="progress">
                <Button type="ghost" :disabled="disabled" icon="ios-cloud-upload-outline">上传图片</Button>
              </Upload>
              <Progress :percent="number" v-if="number && number!=100"></Progress>
              <Button v-if="!!modalItem.brandPic" @click="handleView(modalItem.brandPic)" icon="android-send">查看</Button>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>

    <Modal title="查看图片" width="80%" v-model="visible" :mask-closable="false">
      <div class="" style="text-align: center">
        <img v-lazy="imgName" v-if="visible" style="max-width: 100%">
      </div>
    </Modal>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'
  import editor from '../editor/Quilleditor.vue'

  const {ajax, api, dateTime, getData, changePage, clearLoading, changePageSize} = lib
  export default {
    components: {
      editor
    },
    data() {
      return {
        judge: {
          add: this.$judge('co.brand.add'),
          del: this.$judge('co.brand.del'),
          edit: this.$judge('co.brand.edit')
        },
        parentId: '',
        choice: true,
        city: [],
        visible: false,
        imgName: '',
        id: '',
        number: 0,
        edit: false,
        typeList: [],
        data: [],
        disabled: false,
        ruleValidate: {
          name: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          type: [{required: true, message: this.$lang.currency.pEtc}],
          remarks: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          sort: [{required: true, message: this.$lang.currency.pEtc}],
          content: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          provId: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          cityId: [{required: true, message: this.$lang.currency.pEtc}]
        },
        total: 0,
        modal: false,
        modal_edit: false,
        modalItem: {
          imgurl: '',
          type: '',
          tourl: '',
          provId: '',
          cityId: []
        },
        columns: [{
          type: 'index',
          width: 60,
          align: 'center'
        }, {
          title: '名称',
          key: 'name',
          ellipsis: true
        }, {
          title: 'LOGO',
          key: '',
          width: 80,
          render: (h, params) => {
            return h('a', {
              on: {
                click: () => {
                  this.handleView(params.row.brandPic)
                }
              }
            }, this.$lang.currency.show)
          }
        }, {
//          title: '分类',
//          width: 90,
//          key: '',
//          render: (h, params) => {
//            for (let i of this.typeList) {
//              if (i.id === params.row.type) {
//                return list[i].text
//              }
//            }
//            return ''
//          }
//        }, {
          title: this.$lang.currency.uTime,
          width: 170,
          render: (h, params) => {
            return dateTime(params.row.updateTime || params.row.createTime || '')
          }
        }, {
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
        }],
        api: api.brandList,
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
          type: '',
          modelState: '1',
          pageIndex: 1,
          pageSize: 10,
          modelType: '',
          mobile: '',
          modelLabel: '',
          typeId: ''
        },
        cityList: [],
        cityList1: [],
        selCityId: ''
      }
    },
    filters: {
      showCityText: function (value, list) {
        for (let i in list) {
          if (list[i].id === value) return list[i].name
        }
      }
    },
    props: {},
    mounted() {
      this.getData()
      this.init()
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '品牌管理'}])
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      cityChange() {
        this.parentId = this.modalItem.provId
        this.selCityId = this.modalItem.provId
        this.modalItem.cityId = this.city[this.parentId] || []
        this.choice = false
        this.choice = true
      },
      city1Change(v) {
        this.parameter.cityId = v[1]
        this.getData()
      },
      city2Change() {
        this.parentId = this.modalItem.provId
        this.city[this.parentId] = this.modalItem.cityId.length ? this.modalItem.cityId : undefined
        this.choice = false
        this.choice = true
      },
      imgUpload(req) {
        this.modalItem.brandPic = req
      },
      handleFormatError(file) {
        this.$Notice.warning({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
        })
      },
      handleReset(name) {
        this.$refs[name].resetFields()
      },
      addEvent() {
        this.handleReset('formValidate')
        this.edit = false
        this.modal_edit = true
        this.city = []
        this.modalItem = {
          brandPic: '',
          type: []
        }
      },
      removeByValue(arr, val) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] === val) {
            arr.splice(i, 1)
            break
          }
        }
        this.choice = false
        this.choice = true
      },
      handleTagClose(i, item) {
        // 删除数组对应元素
        let pid = i.substr(0, 2)
        this.removeByValue(this.city[pid], i)
      },
      handleView(name) {
        this.imgName = name
        this.visible = true
      },
      selectEvent(appId) {
        let callback = (data) => {
          this.typeList = data.data
        }
        ajax(api.appGetClass, 'GET', {appId}, callback)
      },
      progress(e) {
        this.number = parseInt(e.percent)
      },
      handleError() {
        this.$Message.error('上传失败')
      },
      saveModel() {
        this.$refs['formValidate'].validate((valid) => {
          if (valid && this.modalItem.brandPic) {
            this.$Modal.confirm({
              title: this.$lang.currency.prompt,
              content: this.$lang.currency.promptSave,
              onOk: () => {
                let callback = (data) => {
                  this.$Message.success(this.$lang.currency.oSuccess)
                  this.modal_edit = false
                  this.modalItem.type = []
                  this.getData()
                }
                this.modalItem.classText = this.modalItem.type.join(',')
                delete this.modalItem.classList
                ajax(this.edit ? api.brandUpdate : api.brandInsert, 'POST', this.modalItem, callback, this.clearLoading)
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
      cancelModel() {
        this.modal_edit = false
        // this.handleReset('formValidate')
      },
      clearLoading,
      getData,
      init() {
//        this.cityList1 = this.$cityList
//        this.cityList = this.$city
        let callback = (data) => {
          this.typeList = data.data
        }
        ajax(api.brandGetType, 'POST', {}, callback)
      },
      changePage,
      changePageSize,
      viewItem(item) {
        this.modalItem = item
        this.modal = true
      },
      editItem(item) {
        this.handleReset('formValidate')
        this.city = []
        this.modalItem = {}
        for (let i in item) {
          this.modalItem[i] = item[i]
        }
        this.modalItem.cityId = []
        if (this.modalItem.classText) this.modalItem.type = this.modalItem.classText.split(',')
        this.edit = true
        this.modal_edit = true
      },
      unique(array) {
        /**
         * 数组去重
         **/
        let r = []
        for (let i = 0, l = array.length; i < l; i++) {
          for (let j = i + 1; j < l; j++) {
            if (array[i] === array[j]) j = ++i
          }
          r.push(array[i])
        }
        return r
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
            ajax(api.brandDelete, 'POST', {id}, callback)
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
