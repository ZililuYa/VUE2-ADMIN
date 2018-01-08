<template>
  <div class="com sys-user">
    <div class="ani">
      <Select v-model="parameter.type" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option v-for="item in typeList" :value="item.value" :key="item.text">{{ item.text }}</Option>
      </Select>
      <Cascader :data="cityList1" v-model="parameter._cityId" @on-change="city1Change"></Cascader>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="addEvent">
          <Icon type="plus-round"></Icon>
          添加Banner
        </Button>
      </div>
    </div>
    <div class="table">
      <Table :columns="columns" :data="data"></Table>
    </div>
    <div class="page">
      <Page @on-change="changePage" @on-page-size-change="changePageSize" :total="total" :current="parameter.pageIndex" :page-size="parameter.pageSize" show-sizer></Page>
    </div>
    <Modal :closable="false" :mask-closable="false" v-model="modal_edit" id="model" :title="$lang.currency.editContent" width="70%" @on-ok="saveModel" @on-cancel="cancelModel" :loading="true">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="12">
            <FormItem label="链接" prop="tourl">
              <Input v-model="modalItem.tourl" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="分类" prop="type">
              <Select v-model="modalItem.type" style="width:100%">
                <Option v-for="item in typeList" :value="item.value" :key="item.text">{{ item.text }}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="说明" prop="remarks">
              <Input v-model="modalItem.remarks" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="排序" prop="sort">
              <InputNumber style="width: 100%" :max="1000" :min="0" v-model="modalItem.sort"></InputNumber>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="选择省">
              <Select v-model="modalItem.provId" v-if="modal_edit" @on-change="cityChange">
                <Option :key="item.id" :value="item.id" v-if="item.parentId === '0'" v-for="item in cityList">{{item.name}}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="选择市">
              <Select v-model="modalItem.cityId" multiple @on-change="city2Change">
                <Option :key="item.id" :value="item.id" v-if="parentId && item.parentId === parentId" v-for="item in cityList">{{item.name}}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="已选择" v-if="city.length && choice">
              <div class='text-left'>
                <div v-for="item in city">
                  <Tag v-for="i in item" :key="i" closable @on-close="handleTagClose(i,item)">
                    {{i | showCityText(cityList)}}
                  </Tag>
                </div>
              </div>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="Banner图">
              <Upload :format="['jpg','jpeg','png']" action="/api/v1/upload/fileImage" :on-format-error="handleFormatError" :on-error="handleError" :on-success="imgUpload" :show-upload-list="false"
                      :on-progress="progress">
                <Button type="ghost" :disabled="disabled" icon="ios-cloud-upload-outline">上传图片</Button>
              </Upload>
              <Progress :percent="number" v-if="number && number!=100"></Progress>
              <Button v-if="!!modalItem.imgurl" @click="handleView(modalItem.imgurl)" icon="android-send">查看</Button>
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

  const {ajax, api, dateTime, getData, changePage, clearLoading, changePageSize} = lib
  import editor from '../editor/Quilleditor.vue'

  export default {
    components: {
      editor
    },
    data() {
      let list = [{
        value: 1,
        text: '首页轮播'
      }, {
        value: 2,
        text: '公告'
      }, {
        value: 3,
        text: '装饰公司广告'
      }, {
        value: 4,
        text: '设计师广告'
      }, {
        value: 5,
        text: '品牌广告'
      }, {
        value: 6,
        text: '产品广告'
      }, {
        value: 7,
        text: '新闻广告'
      }, {
        value: 8,
        text: '店铺广告'
      }, {
        value: 9,
        text: 'APP首页广告'
      }, {
        value: 10,
        text: 'APP视频广告'
      }, {
        value: 11,
        text: 'APP新闻广告'
      }, {
        value: 12,
        text: '新闻详情Banner'
      }, {
        value: 13,
        text: '模型首页'
      }, {
        value: 14,
        text: 'APP首页图片'
      }]
      return {
        judge: {
          add: this.$judge('cm.banner.add'),
          del: this.$judge('cm.banner.del'),
          edit: this.$judge('cm.banner.edit')
        },
        parentId: '',
        choice: true,
        city: [],
        visible: false,
        imgName: '',
        id: '',
        number: 0,
        edit: false,
        typeList: list,
        data: [],
        disabled: false,
        ruleValidate: {
          tourl: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}, {type: 'url', message: '地址格式错误', trigger: 'blur'}],
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
          title: '链接',
          key: 'tourl',
          ellipsis: true
        }, {
          title: '图片',
          key: '',
          width: 70,
          render: (h, params) => {
            return h('a', {
              on: {
                click: () => {
                  this.handleView(params.row.imgurl)
                }
              }
            }, this.$lang.currency.show)
          }
        }, {
          title: '类型',
          width: 90,
          key: '',
          render: (h, params) => {
            for (let i in list) {
              if (list[i].value === params.row.type) {
                return list[i].text
              }
            }
            return ''
          }
        }, {
          title: '城市',
          key: '',
          render: (h, params) => {
            let va = ''
            if (!params.row.cityId) {
              return ''
            }
            let arr = params.row.cityId.split(',')
            for (let i in this.cityList) {
              if (arr.indexOf(this.cityList[i].id) !== -1) {
                va += (this.cityList[i].name.replace('市', '') + '，')
              }
            }
            return va ? va.substring(0, va.length - 1) : va
          }
        }, {
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
        api: api.bannerList,
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
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: 'Banner管理'}])
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
        this.modalItem.imgurl = req
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
          imgurl: '',
          cityId: [],
          sort: 1
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
          if (valid && this.modalItem.imgurl) {
            this.$Modal.confirm({
              title: this.$lang.currency.prompt,
              content: this.$lang.currency.promptSave,
              onOk: () => {
                let callback = (data) => {
                  this.$Message.success(this.$lang.currency.oSuccess)
                  this.modal_edit = false
                  // this.$Modal.remove()
                  this.city = []
                  this.getData()
                }
                let cityId = ''
                for (let i in this.city) {
                  if (this.city[i] && this.city[i].length) cityId += (this.city[i].join(',') + ',')
                }
                cityId = cityId.substring(0, cityId.length - 1)
                this.modalItem.cityId = cityId
                ajax(this.edit ? api.bannerUpdate : api.bannerAdd, 'POST', this.modalItem, callback, this.clearLoading)
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
        this.cityList1 = this.$cityList
        this.cityList = this.$city
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
        let arr_ = []
        if (item.cityId) {
          let provArr = item.cityId.split(',')
          for (let i in provArr) {
            arr_[i] = provArr[i].substr(0, 2)
          }
          arr_ = this.unique(arr_)
          for (let i in arr_) {
            this.city[arr_[i]] = []
            for (let j in provArr) {
              if (provArr[j].substr(0, 2) === arr_[i]) {
                this.city[arr_[i]].push(provArr[j])
              }
            }
          }
        }
        this.modalItem.cityId = []
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
            ajax(api.bannerDelete, 'GET', {id}, callback)
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
