<template>
  <div class="com sys-user">
    <div class="ani">
      <Input style="width:128px;" v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Input style="width:128px;" v-model="parameter.mobile" :placeholder="$lang.currency.pEI" icon="search" @on-enter="getData"></Input>
      <Select style="width:128px;" v-model="parameter.orgLabel" @on-change="getData()" placeholder="请选择标签" filterable>
        <Option value="">{{$lang.currency.all}}</Option>
        <Option :value="item.text" :key="item.id" v-for="item in public_label_list">{{item.text}}</Option>
      </Select>
      <Select style="width:128px;" v-model="parameter.isProcess" @on-change="getData()" placeholder="工序筛选">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="2">没有工序</Option>
        <Option value="1">有工序</Option>
      </Select>
      <Select style="width:128px;" v-model="parameter.isLabel" @on-change="getData()" placeholder="标签筛选">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="2">没有公共标签</Option>
        <Option value="1">有公共标签</Option>
      </Select>
      <Select style="width:128px;" v-model="parameter.modelType" @on-change="getData()" placeholder="模型类型">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="1">软装模型</Option>
        <Option value="2">硬装模型</Option>
        <Option value="3">硬装贴图</Option>
      </Select>
      <Select style="width:128px;" v-model="parameter.modelClass" @on-change="getData()" placeholder="模型分类">
        <Option value="0">{{$lang.currency.all}}</Option>
        <Option value="1">素材模型</Option>
        <Option value="2">商品模型</Option>
      </Select>
      <Select style="width:128px;" v-model="parameter.modelState" @on-change="getData()">
        <Option value="1">{{$lang.currency.pAudit}}</Option>
        <Option value="2">{{$lang.currency.auditP}}</Option>
        <Option value="3">{{$lang.currency.auditN}}</Option>
      </Select>
    </div>
    <ul class="itemsPadding">
      <Row :gutter="16" class="al-items">
        <div class="" v-for="(item, i) in data">
          <i-col span="3">
            <li class="al-modle">
              <div class="al-mask">
                <div class="al-img"><img v-lazy="item.imgUrl" alt=""></div>
                <div class="operation">
                  <div class="enlarge">
                    <i v-if="judge.edit" class="ivu-icon ivu-icon-edit" @click="editItem(item)"></i>
                    <i class="ivu-icon ivu-icon-android-checkmark-circle"
                       v-if="parameter.modelState=='1'"
                       @click="showAudit=true;auditNow=item"></i>
                    <i class="ivu-icon ivu-icon-ios-trash"
                       v-if="parameter.modelState=='2' && judge.del"
                       @click="removeItem(item.id)"></i>
                    <a href="javascript:void(0)" title="下载模型" style="color: #fff" target="_blank" class="ivu-icon ivu-icon-android-download"
                      @click="downloadItem(item)"></a>
                    <!--<Icon type="android-download"></Icon>-->
                    <i class="ivu-icon ivu-icon-arrow-up-a" title="置顶"
                       v-if="item.topStatus==1"
                       @click="topItem(item.id, 2)"></i>
                    <i class="ivu-icon ivu-icon-arrow-down-a" title="取消置顶"
                       v-if="item.topStatus==2"
                       @click="topItem(item.id, 1)"></i>
                  </div>
                </div>
              </div>
              <div class="al-info">
                <p>
                  <nobr>
                    <div class="al-some al-name">{{item.name}}</div>
                  </nobr>
                  <nobr>
                    <div class="al-some">{{item.modelTypeStr}}</div>
                    <div class="al-some al-right">{{item.modelStateStr}}</div>
                  </nobr>
                  <nobr>
                    <div class="al-some al-name">阿拉币: <span>{{item.modelPrice}}</span></div>
                  </nobr>
                </p>
              </div>
            </li>
          </i-col>
        </div>
      </Row>
      <div class="" v-if="spinShow">
        <Spin size="large" v-show="spinShow" fix></Spin>
      </div>
      <li class="" v-if="!spinShow">
        <Spin class="al-empty" v-show="!spinShow && data.length==0">空空如也 ~ ~</Spin>
      </li>
      <a :href="fileUrl" target="_blank" ref="aldDown"></a>
    </ul>
    <!-- <div class="table">
      <Table :columns="columns" :data="data"></Table>
    </div> -->
    <div class="page al-page" v-if="total > 0">
      <Page :page-size-opts="[16, 32, 64, 128]" @on-change="changePage" @on-page-size-change="changePageSize" :total="total" :current="parameter.pageIndex" :page-size="parameter.pageSize"
            show-sizer></Page:>
    </div>
    <Modal
      :mask-closable="false"
      v-model="modal"
      title="模型详情">
      <div class="modal_def">
        <div class="img">
          <img v-if="modalItem.imgUrl" v-lazy="modalItem.imgUrl" alt="">
          <span v-if="!modalItem.imgUrl">没有预览图</span>
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
          <div class="div">{{modalItem.bewrite}}</div>
        </div>
      </div>
    </Modal>
    <Modal
      v-model="modal_edit"
      :mask-closable="false"
      :transfer="false"
      :closable="false"
      :title="$lang.currency.editContent" width="50%">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="24" class="al-edit-img">
            <div class="al-img-box">
              <div class="al-img"><img v-lazy="modalItem.imgUrl" alt=""></div>
            </div>
            </Col>
            <Col span="12">
            <FormItem label="姓名" prop="name">
              <Input v-model="modalItem.name" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="品牌" prop="brand">
              <Input v-model="modalItem.brand" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="价格" prop="price">
              <Input v-model="modalItem.price" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="材质" prop="material">
              <Input v-model="modalItem.material" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="规格型号" prop="specNumber">
              <Input v-model="modalItem.specNumber" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="单位" prop="unit">
              <Input v-model="modalItem.unit" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="个人标签">
              <span v-for="(item, index) in modalItem.modelLabelArr"><Tag color="green">{{item}}</Tag></span>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="公开标签">
              <div @click="changeLabelEdit">
                <Select style="width:100%" placeholder="请点击添加公开标签" multiple filterable disabled
                        v-if="modal_edit"
                        v-model="public_label">
                  <Option v-for="item in public_label_list" :value="item.text" :key="item.id">{{ item.text }}</Option>
                </Select>
              </div>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="模型文件">
              <Progress :percent="number" v-show="number && number!=100"></Progress>
              <Tooltip content="请将SKP文件压缩成ZIP文件后上传" placement="top">
                <Input v-model="modalItem.fileUrl" disabled="disabled">
                <Button slot="append" type="primary" @click="fileUpload">选择ZIP文件上传</Button>
                </Input>
              </Tooltip>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="选择工序"> {{wp2}}
              <Button type="primary" @click="openWp">打开选择</Button>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
      <div slot="footer">
        <Button size="small" @click="modal_edit=false">关 闭</Button>
        <Button size="small" type="primary" :loading="saveLoading" @click="saveModel(0)">提 交</Button>
        <Button size="small" type="success" :loading="saveAndLoading" @click="saveModel('2')">审核通过并提交</Button>
      </div>
    </Modal>
    <Modal
      :mask-closable="false"
      v-model="modal_wp"
      title="选择工序" width="50%">
      <Row>
        <Col span="12" style="padding: 10px">
        <Select v-model="wp" style="width:100%" @on-change="selectOne" filterable>
          <Option v-for="item in wp_data" :value="item.id" :key="item.id">{{ item.text }}</Option>
        </Select>
        </Col>
        <Col span="12" style="padding: 10px">
        <Cascader v-model="wp1" :data="wp_data1" style="width: 100%" @on-change="selectTwo"></Cascader>
        </Col>
        <Col span="24" style="padding: 10px">
        <Table :columns="columns_gx" :data="table_data"></Table>
        </Col>
      </Row>
      <div slot="footer">
        <Button size="small" @click="modal_wp=false">取消</Button>
        <Button size="small" type="primary" @click="ok">确定</Button>
      </div>
    </Modal>
    <Modal title="模型审核" class="al-audit"
           v-model="showAudit"
           ok-text="提交"
           :mask-closable="false"
           :closable="false">
      <Row>
        <i-col span="6">
          <RadioGroup v-model="state" vertical>
            <Radio label="2" class="al-radio">通过</Radio>
            <Radio label="3" class="al-radio">不通过</Radio>
          </RadioGroup>
        </i-col>
        <i-col span="18">
          <div class="" v-if="state=='3'">
            <Input v-model="reason" :rows="2" type="textarea" :placeholder="$lang.currency.pEN"></Input>
          </div>
        </i-col>
      </Row>
      <div slot="footer">
        <Button size="small" @click="doAuditNot">取消</Button>
        <Button size="small" :loading="audiLoading" type="primary" @click="doAuditYes">确定</Button>
      </div>
    </Modal>
    <Modal title="公开标签" class="al-label" :styles="styles"
           v-model="showLabelEdit"
           :mask-closable="false"
           :transfer="false"
           :closable="false">
      <Row class="al-label-had">
        <i-col span="3" class="al-left">已选标签</i-col>
        <i-col span="21">
          <span v-for="item in public_label"><Tag color="blue" @on-close="closeLabelHad(item)" closable>{{item}}</Tag></span>
        </i-col>
      </Row>
      <div v-for="(item, index) in public_label_had" class="al-label-not">
        <Row>
          <i-col span="3" class="al-left">{{item.remark}}</i-col>
          <i-col span="21">
            <span v-for="obj in item.dictList"><a href="javascript:void(0)" @click="addLabelHad(obj.text)"><Tag>{{obj.text}}</Tag></a></span>
          </i-col>
        </Row>
      </div>
      <div slot="footer">
        <Button size="small" @click="showLabelEdit=false">关 闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import { mapActions } from 'vuex'
  import lib from '@/assets/js/lib.js'

  const {ajax, api, $, dateTime, changePage, changePageSize} = lib
  export default {
    data() {
      return {
        fileUrl: '',               // 模型下载地址
        judge: {
          view: this.$judge('sys.model.view'),
          trial: this.$judge('sys.model.trial'),
          del: this.$judge('sys.model.del'),
          edit: this.$judge('sys.model.edit')
        },
        styles: {
          width: '900px',
          top: '3%'
        },
        id: '',
        modal_wp: false,
        parent: '',
        _org_label: [],
        _org_label_data: [],
        table_data: [],
        _title: '编辑模型',
        number: 0,
        columns_gx: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: this.$lang.currency.name,
            key: 'text'
          },
          {
            title: '类型',
            key: 'processType'
          },
          {
            title: '单位',
            key: 'unit'
          },
          {
            title: '单价',
            key: 'unitPrice'
          },
          {
            title: '公式',
            key: 'formula'
          }
        ],
        wp: '',
        wp1: [],
        wp2: '',
        wp_data: [],
        wp_data1: [],
        public_label: [],
        public_label_data: [],
        public_label_list: [],
        public_label_had: [],
        data: [],
        ruleValidate: {
          name: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          brand: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          price: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          material: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          specNumber: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          unit: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}]
        },
        total: 0,
        modal: false,
        modal_edit: false,
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
            title: this.$lang.currency.mobile,
            width: 140,
            key: 'mobile'
          },
          {
            title: this.$lang.currency.uTime,
            width: 170,
            render: (h, params) => {
              return params.row.updateTime ? dateTime(params.row.updateTime) : ''
            }
          },
          {
            title: '模型文件',
            key: '',
            width: 100,
            render: (h, params) => {
              if (params.row.fileUrl) {
                return h('a', {
                  attrs: {
                    href: params.row.fileUrl
                  }
                }, '下载模型')
              } else {
                return '空'
              }
            }
          },
          {
            title: '模型类型',
            key: '',
            width: 100,
            render: (h, params) => {
              if (params.row.modelType === '1') {
                return '软装'
              } else if (params.row.modelType === '2') {
                return '硬装'
              } else if (params.row.modelType === '3') {
                return '贴图'
              }
            }
          },
          {
            title: this.$lang.currency.state,
            key: '',
            width: 100,
            render: (h, params) => {
              if (params.row.modelState === '1') {
                return this.$lang.currency.pAudit
              } else if (params.row.modelState === '2') {
                return this.$lang.currency.auditP
              } else if (params.row.modelState === '3') {
                return this.$lang.currency.auditN
              }
            }
          },
          {
            key: '',
            width: 100,
            render: (h, params) => {
              let arr = []
              if (this.$judge('sys.model.view')) {
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
              if (this.$judge('sys.model.edit')) {
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
              if (this.$judge('sys.model.trial') && this.parameter.modelState === '1') {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.editItem(params.row, true)
                    }
                  }
                }, '编辑并通过'))
              }
              if (this.$judge('sys.model.trial') && this.parameter.modelState === '1') {
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
              if (this.$judge('sys.model.trial') && this.parameter.modelState === '1') {
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
              if (this.$judge('sys.model.del') && this.parameter.modelState === '2') {
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
          name: '',
          modelState: '1',
          pageIndex: 1,
          pageSize: 32,
          modelType: '',
          modelClass: '0',            // 模型分类
          mobile: '',
          orgLabel: ''
        },
        saveLoading: false,          // 编辑提交按钮
        saveAndLoading: false,       // 审核并提交按钮
        value: '',                    // 未通过原因
        showAudit: false,              // 审核弹窗
        audiLoading: false,            // 审核提交按钮loading
        state: '2',                    // 通过状态2 不通过3
        reason: '',                    // 未通过原因
        auditNow: {},                  // 当前审核对象
        showLabelEdit: false,          // 标签编辑弹窗
        spinShow: false                // loading显示
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '模型管理'}])
      this.getData()
      this.init()
      window.onresize = () => {
        this.setHeight()
      }
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      topItem(id, topStatus) {
        let callback = () => {
          this.$Message.info(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(api.modelTop, 'POST', {id, topStatus}, callback)
      },
      ok() {
        let vm = this
        if (!vm.table_data.length) {            // 判断二级工序
          vm.$Message.error('请选择具体工序')
          return
        }
        vm.wp2 = vm.wp1[1].split('|')[1]       // 设置显示名称
        vm.modalItem.processId = vm.id         // 设置显示id
        vm.modal_wp = false
      },
      fileUpload() {
        let input = document.createElement('input')
        input.type = 'file'
        input.name = this.fileName
        input.onchange = this.onFileChange
        input.click()
      },
      onFileChange(e) {
        let fileInput = e.target
        if (fileInput.files.length === 0) {
          return
        }
        if (fileInput.files[0].name.indexOf('.zip') === -1) {
          this.$Message.error('请选择ZIP压缩文件')
          return
        }
        let self = this
        let data = new FormData()
        data.append('file', fileInput.files[0], name)
        let xhr = new XMLHttpRequest()
        xhr.upload.onprogress = function (p) {
          self.number = parseInt(p.loaded / p.total * 100)
        }
        xhr.open('post', api.modelUpload)
        xhr.send(data)
        xhr.onerror = function (p) {
          self.number = 0
          self.$Message.error('上传失败')
        }
        xhr.onload = function () {
          if (xhr.status === 200) {
            self.$Message.info(self.$lang.currency.uSuccess)
            self.modalItem.fileUrl = xhr.response
            // self.editor.insertEmbed(self.editor.getSelection().index, 'image', xhr.response)
          }
        }
      },
      saveModel(state) {
        /**
         * 保存模型信息
         */
        let vm = this
        let param = {}
        Object.assign(param, vm.modalItem)
        param.orgLabel = vm.public_label.join('|')
        if (state) {
          vm.saveAndLoading = true
          param.state = state
        } else vm.saveLoading = true
        let callback = (data) => {
          vm.modal_edit = false
          vm.saveLoading = false
          vm.saveAndLoading = false
          if (data.code !== 200) {
            vm.$Message.error(data.message)
            return
          }
          vm.$Message.success(this.$lang.currency.oSuccess)
          vm.getData()
        }
        ajax(api.modelUpdate, 'POST', param, callback)
      },
      selectOne(id) {
        /**
         * 选择工序一级
         */
        let vm = this                         // 清空二级还有表格数据
        vm.wp1 = []
        vm.table_data = []
        let callback = (data) => {
          if (data.code !== 200) {
            vm.$Message.error(data.message)
            return
          }
          vm.wp_data1 = vm.recursion(data.data)
        }
        ajax(api.catalogList, 'GET', {editionId: id}, callback)
      },
      selectTwo(arr) {
        arr = arr[arr.length - 1].split('|')
        this.id = arr[0]
        let callback = (data) => {
          this.table_data = data.data
        }
        ajax(api.detailsList, 'GET', {catalogId: this.id}, callback)
      },
      recursion(arr) {
        let array = []
        for (let i in arr) {
          let len = arr[i].children.length
          let item = {
            value: arr[i].id + '|' + arr[i].text,
            label: arr[i].text
          }
          if (len) {
            item.children = this.recursion(arr[i].children)
          }
          array.push(item)
        }
        return array
      },
      init() {
        /**
         * 获取公共标签
         */
        let vm = this
        let callback = (data) => {
          if (data.code !== 200) {
            vm.$Message.error(data.message)
            return
          }
          data.data.default.forEach(function (item) {
            vm.public_label_data.push(item)
          })
          data.data.mine.forEach(function (item) {
            vm.public_label_data.push(item)
          })
        }
        ajax(api.labelList, 'GET', {code: 'LABEL_DEFAULT'}, callback)
        /**
         * 获取公共标签
         */
        let callback2 = (data) => {
          vm.public_label_list = data.data
        }
        ajax(api.getDictList, 'GET', {code: 'LABEL_DEFAULT'}, callback2)

        let _callback = (data) => {
          if (data.code !== 200) {
            vm.$Message.error(data.message)
            return
          }
          vm.wp_data = data.data
        }
        ajax(api.editionList, 'GET', {}, _callback)
      },
      getData(i) {
        /**
         * 模型列表
         * @param Object
         */
        let vm = this
        if (isNaN(i)) this.parameter.pageIndex = 1
        else this.parameter.pageIndex = i
        vm.data = []
        vm.spinShow = true
        let callback = (data) => {
          vm.spinShow = false
          if (data.code !== 200) {
            vm.$Message.error(data.message)
            return
          }
          vm.total = data.total
          vm.data = data.data.map(function (item) {
            let modelType = item.modelType
            if (modelType === '1') item.modelTypeStr = '软装'
            if (modelType === '2') item.modelTypeStr = '硬装'
            if (modelType === '3') item.modelTypeStr = '贴图'
            let modelState = item.modelState
            if (modelState === '1') item.modelStateStr = vm.$lang.currency.pAudit
            if (modelState === '2') item.modelStateStr = '已通过'
            if (modelState === '3') item.modelStateStr = '未通过'
            return item
          })
          vm.$nextTick(function () {
            vm.setHeight()
          })
        }
        ajax(api.modelList, 'GET', vm.parameter, callback)
      },
      changePage,
      changePageSize,
      viewItem(item) {
        this.modalItem = item
        this.modal = true
      },
      editItem(item) {
        /**
         * 模型编辑
         * @param Object
         */
        let vm = this
        vm.modalItem = {}
        Object.assign(vm.modalItem, item)
        let modelLabel = vm.modalItem.modelLabel                // 个人标签
        if (modelLabel) {
          vm.modalItem.modelLabelArr = modelLabel.split('|')
        }
        let orgLabel = vm.modalItem.orgLabel
        if (orgLabel) vm.public_label = orgLabel.split('|')    // 公开标签
        vm.wp2 = ''
        if (item.processId) {
          let _callback = (data) => {
            vm.wp2 = data.data.text
          }
          ajax(api.catlogDetail, 'GET', {catalogId: vm.modalItem.processId}, _callback)
        }
        vm.modal_edit = true
        vm.$nextTick(function () {
          vm.setHeight()
        })
      },
      openWp() {
        /**
         * 打开选择工序弹框
         */
        let vm = this
        vm.modal_wp = true
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
          ajax(api.modelAudit, 'POST', {id: id, state: num, reason: this.value}, callback)
          return
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定' + info + '通过吗？',
          onOk: () => {
            ajax(api.modelAudit, 'POST', {id: id, state: num}, callback)
          },
          onCancel: () => {
          }
        })
      },
      doAuditNot() {
        /**
         * 关闭审核弹窗
         */
        let vm = this
        vm.state = 2
        vm.reason = ''
        vm.showAudit = false
      },
      doAuditYes() {
        /**
         * 模型审核
         */
        let vm = this
        if (vm.state === '3' && !vm.reason) {
          vm.$Message.error(this.$lang.currency.pEN)
          return
        }
        vm.audiLoading = true
        let callback = (data) => {
          vm.audiLoading = false
          if (data.code !== 200) {
            vm.$Message.error(data.message)
            return
          }
          vm.doAuditNot()
          vm.getData()
        }
        ajax(api.modelAudit, 'POST', {id: vm.auditNow.id, state: vm.state, reason: vm.reason}, callback)
      },
      removeItem(id) {
        /**
         * 模型删除
         * @param String 模型id
         */
        let vm = this
        let callback = (data) => {
          if (data.code !== 200) {
            vm.$Message.error(data.message)
            return
          }
          vm.$Message.success(this.$lang.currency.dSuccess)
          vm.getData()
        }
        vm.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.modelDel, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
      downloadItem(item) {
        /**
         * 模型下载
         * @param String 模型id
         */
        console.log('模型下载发送信息：', item)
        let vm = this
        let callback = (data) => {
          if (data.code !== 200) {
            vm.$Message.error(data.message)
            return
          }
          vm.fileUrl = data.data.fileUrl
          setTimeout(function() {
            vm.$refs.aldDown.click()
          }, 10)
        }
        ajax(api.modelGet, 'POST', {id: item.id}, callback)
      },
      changeLabelEdit() {
        /**
         * 显示标签编辑弹出框
         * @param Object
         */
        this.setLabelHad()
        this.showLabelEdit = true
      },
      closeLabelHad(item) {
        /**
         * 删除已选标签
         * @param String
         */
        let vm = this
        vm.public_label.splice(vm.public_label.indexOf(item), 1)
        vm.setLabelHad()
      },
      addLabelHad(text) {
        /**
         * 添加已选标签
         * @param String
         */
        let vm = this
        vm.public_label.push(text)
        vm.setLabelHad()
      },
      setLabelHad() {
        /**
         * 设施未选标签数据
         */
        let vm = this
        vm.public_label_had = []
        vm.public_label_data.forEach(function (item) {
          let some = {}
          Object.assign(some, item)
          let Arr = []
          some.dictList.forEach(function (obj) {
            let num = 0
            vm.public_label.forEach(function (org) {
              if (obj.text === org) num++
            })
            if (!num) Arr.push(obj)
          })
          some.dictList = Arr
          vm.public_label_had.push(some)
        })
      },
      setHeight() {
        /**
         * 改变盒子得高
         */
        let ele = $('.al-mask')
        let wit = ele.width()
        ele.height(wit * 1)
        $('.al-img-box').each(function () {
          let wit = $(this).width()
          $(this).height(wit * 3 / 4)
        })
      }
    }
  }
</script>
<style lang="less" scoped>
  .al-empty {
    min-height: 430px;
    line-height: 430px;
    font-size: 16px;
  }

  .al-edit-img {
    padding: 10px 180px;
  }

  .al-radio {
    margin-left: 8px;
  }

  .al-label-had {
    min-height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #eee;
    .al-left {
      text-align: center;
    }
  }

  .al-label-not {
    min-height: 35px;
    line-height: 35px;
    .al-left {
      text-align: center;
    }
  }

  /*
   * 模型样式
   */
  .itemsPadding {
    min-height: 430px;
    padding: 15px 0;
    position: relative;
  }

  .al-items {
    width: 100%;
  }

  .al-img {
    display: inline-block;
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
    img {
      width: 100%;
      height: 100%;
    }
  }

  .al-modle {
    position: relative;
    margin-bottom: 10px;
    border-radius: 2px;
    background-color: #fff;
    box-shadow: 0 1px 5px rgba(85, 85, 85, 0.15);
    transition-duration: 0.3s;
    &:hover {
      box-shadow: 0 1px 5px rgba(85, 85, 85, 0.5);
    }
    .progress {
      height: 100%;
      position: absolute;
      background-color: $ info;
      opacity: 0.5;
      left: 0;
      top: 0;
      z-index: 100;
      display: none;
    }
    &.active {
      .progress {
        display: inline-block;
      }
    }
    .al-mask {
      width: 100%;
      position: relative;
      overflow: hidden;
      padding: 5px 10px;
      .operation {
        opacity: 0;
        transition-duration: 0.5s;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 99;
        background-color: rgba(0, 0, 0, 0.6);
        &:hover {
          opacity: 1;
        }
        .enlarge {
          display: inline-block;
          background-color: rgba(0, 0, 0, 0.6);
          line-height: 40px;
          padding: 0 6px;
          text-align: center;
          font-size: 15px;
          color: #fff;
          cursor: pointer;
          i, a {
            display: inline-block;
            margin: 6px 0;
            width: 23px !important;
          }
        }
        .delete {
          position: absolute;
          width: 100%;
          height: 30px;
          bottom: 0;
          left: 0;
          text-align: center;
          line-height: 30px;
          font-size: 16px;
          cursor: pointer;
          transition-duration: 0.4s;
          color: $ blue;
          background-color: rgba(0, 0, 0, 0.6);
          &:hover {
          }
        }
      }
    }
    .al-info {
      width: 100%;
      height: 67px;
      color: #5e6a76;
      padding: 5px 10px;
      line-height: 20px;
      background-color: #fff;
      p {
        line-height: 18px;
        font-size: 16px;
        overflow: hidden;
        width: 100%;
        text-overflow: ellipsis;
        font-size: 0;
        .al-some {
          display: inline-block;
          width: 50%;
          vertical-align: top;
          font-size: 12px;
          text-align: left;
          &.al-name {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          &.al-right {
            text-align: right;
          }
          span {
            color: #3399ff
          }
        }
      }
      .style {
        line-height: 20px;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 20px;
        a {
          cursor: pointer;
          float: right;
        }
      }
    }
  }
</style>
