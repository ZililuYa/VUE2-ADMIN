<template>
  <div class="com sys-user">
    <div class="title">
      <h3>{{title}}</h3>
    </div>
    <div class="form">
      <Form ref="formCustom" :model="formItem" :label-width="80" :rules="ruleInline" label-position="left">
        <Form-item label="名称" prop="name">
          <Input :disabled="disabled" v-model="formItem.name" placeholder=""></Input>
        </Form-item>
        <Form-item label="城市">
          <Cascader :disabled="disabled" :data="cityList" v-model="formItem._cityId"></Cascader>
        </Form-item>
        <Form-item label="类型">
          <Select :disabled="disabled" v-model="formItem.type" placeholder="请选择类型" @on-change="typeChange">
            <Option value="" :key="0">无</Option>
            <Option v-for="item in dictList" :value="item.remark" :key="item.id">{{ item.remark }}</Option>
          </Select>
        </Form-item>
        <Form-item label="标签" v-if="formItem.type && labelList.length">
          <Select :disabled="disabled" v-model="formItem._labels" placeholder="请选择标签" multiple>
            <Option v-for="item in labelList" :value="item.text" :key="item.id">{{ item.text }}</Option>
          </Select>
        </Form-item>
        <!-- <Form-item label="推荐">
          <Select :disabled="disabled" v-model="formItem.recommend" placeholder="请选择推荐">
            <Option :value="1">不推荐</Option>
            <Option :value="2">列表推荐</Option>
            <Option :value="3">首页推荐</Option>
          </Select>
        </Form-item> -->
        <Form-item label="工装">
          <Select :disabled="disabled" v-model="formItem.tooling" placeholder="请选择工装" @on-change="toolingChange">
            <Option value="">请选择工装</Option>
            <Option v-for="item in toolingList" :value="item.text" :key="item.id">{{ item.text }}</Option>
          </Select>
        </Form-item>
        <Form-item label="面积" prop="area" v-if="formItem.tooling">
          <Input :disabled="disabled" v-model="formItem.area" placeholder="">
          <span slot="append">平方米</span>
          </Input>
        </Form-item>
        <Form-item label="造价" prop="price" v-if="formItem.tooling">
          <Input :disabled="disabled" v-model="formItem.price" placeholder="">
          <span slot="append">万</span>
          </Input>
        </Form-item>
        <Form-item label="关键字" prop="keyWord">
          <Input :disabled="disabled" v-model="formItem.keyWord" placeholder=""></Input>
        </Form-item>
        <Form-item label="描述" prop="description">
          <Input type="textarea" :disabled="disabled" v-model="formItem.description" placeholder=""></Input>
        </Form-item>
        <Form-item label="封面图片">
          <Upload
            :format="['jpg','jpeg','png']"
            action="/api/v1/upload/fileImage"
            :on-format-error="handleFormatError"
            :on-error="handleError"
            :on-success="imgUpload"
            :show-upload-list="false"
            :on-progress="progress">
            <Button type="ghost" :disabled="disabled" icon="ios-cloud-upload-outline">上传图片</Button>
          </Upload>
          <Progress :percent="number" v-if="number && number!=100"></Progress>
          <Button v-if="!!formItem.pageUrl" @click="handleView(formItem.pageUrl)" icon="android-send">查看</Button>
        </Form-item>
        <Form-item label="图片类型" prop="caseType">
          <RadioGroup v-model="formItem.caseType">
            <Radio :label="1">效果图</Radio>
            <Radio :label="2">全景图</Radio>
          </RadioGroup>
        </Form-item>
        <Form-item label="案例图片" v-show="formItem.caseType === 1">
          <div class="demo-upload-list" v-for="item in uploadList">
            <template v-if="item.status === 'finished'">
              <img v-lazy="item.url">
              <div class="demo-upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                <Icon v-if="!disabled" type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
            ref="upload"
            :show-upload-list="false"
            :default-file-list="defaultList"
            :on-success="handleSuccess"
            :format="['jpg','jpeg','png']"
            :max-size="2048000"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            :on-error="handleError"
            multiple
            type="drag"
            action="/api/v1/upload/fileImage"
            style="display: inline-block;width:100px;"
            v-if="!disabled">
            <div style="width: 100px;height:100px;line-height: 100px;">
              <Icon type="camera" size="30" style="margin-top: 10px"></Icon>
            </div>
          </Upload>
        </Form-item>
        <Form-item label="案例图片" v-show="formItem.caseType === 2">
          <Upload
            :format="['jpg','jpeg','png']"
            action="/api/v1/upload/fileImage"
            :on-format-error="handleFormatError"
            :on-error="handleError"
            :on-success="casePanUpload"
            :show-upload-list="false"
            :on-progress="progress">
            <Button type="ghost" :disabled="disabled" icon="ios-cloud-upload-outline">上传图片</Button>
          </Upload>
          <Button v-if="showVrBtn" icon="android-send" @click="VrPanModal = !VrPanModal">查看</Button>
          <div class="demo-upload-list" v-for="item in uploadList2">
            <template>
              <img v-lazy="item.url">
              <div class="demo-upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
              </div>
            </template>
          </div>
        </Form-item>
      </Form>
      <div class="btn-main">
        <Button type="success" @click="handleSubmit('formCustom')" v-if="!disabled">保存</Button>
        <Button @click="$router.push('/sys/case')">返回</Button>
      </div>
    </div>
    <Modal title="查看图片" width="80%" v-model="visible" :mask-closable="false">
      <div class="" style="text-align: center">
        <img v-lazy="imgName" v-if="visible" style="max-width: 100%">
      </div>
    </Modal>
    <Modal width="80%" v-model="VrPanModal" :mask-closable="false">
      <iframe frameborder="0" width="100%" height="600"
              :src="formItem.imgUrl" v-if="formItem.imgUrl">
      </iframe>
    </Modal>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  const {ajax, api} = lib
  import { mapActions } from 'vuex'
  export default {
    data () {
      const validatePassCheck = (rule, value, callback) => {
        if (isNaN(value)) {
          callback(new Error(this.$lang.currency.iError))
        } else {
          callback()
        }
      }
      return {
        title: '添加案例',
        disabled: false,
        edit: false,
        visible: false,
        number: 0,
        defaultList: [],
        imgName: '',
        uploadList: [],
        uploadList2: [],
        rolelist: [],
        cityList: [],
        dictList: [],
        labelList: [],
        typeList: [],
        toolingList: [],
        showVrBtn: false,
        VrPanModal: false,
        formItem: {
          name: '',
          description: '',
          cityId: [],
          _cityId: [],
          _labels: [],
          labels: '',
          pageUrl: '',
          imgUrl: [],
          type: '',
          tooling: '',
          area: '',
          price: '',
          keyWord: '',
          // recommend: 1,
          caseType: 1,
          addType: 1
        },
        ruleInline: {
          name: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          description: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          keyWord: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          cityId: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          // recommend: [
          //   {required: true, message: '请选择推荐', trigger: 'blur'}
          // ],
          area: [
            {required: true, message: this.$lang.currency.pEtc},
            {validator: validatePassCheck}
          ],
          price: [
            {required: true, message: this.$lang.currency.pEtc},
            {validator: validatePassCheck}
          ]
        }
      }
    },
    props: {},
    mounted () {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '案例管理', path: '/sys/case'}, {title: this.title}])
      if (this.$refs.upload.fileList) {
        this.uploadList = this.$refs.upload.fileList
      }
      if (this.$route.path === '/sys/case/add') {
        this.init()
        this.title = '添加案例'
      } else if (this.$route.path === '/sys/case/view') {
        this.disabled = true
        this.title = '查看案例'
        this.getItem(this.$route.query.id)
      } else if (this.$route.path === '/sys/case/edit') {
        this.edit = true
        this.title = '编辑案例'
        this.getItem(this.$route.query.id)
      }
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      toolingChange (value) {
        if (!value) {
          this.formItem.area = ''
          this.formItem.price = ''
        }
      },
      imgUpload (req) {
        this.formItem.pageUrl = req
      },
      casePanUpload (req) {
        this.uploadList2 = [{url: req}]
      },
      typeChange (value) {
        this.labelList = []
        for (let i of this.dictList) {
          if (i.remark === value) {
            this.labelList = i.dictList
            return
          }
        }
      },
      progress (p) {
        this.number = parseInt(p.percent)
      },
      handleError () {
        this.$Message.error('上传失败')
      },
      handleView (name) {
        this.imgName = name
        this.visible = true
      },
      handleRemove (file) {
        // 从 upload 实例删除数据
        const fileList = this.$refs.upload.fileList
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      },
      handleSuccess (res, file) {
        // 因为上传过程为实例，这里模拟添加 url
        file.url = res
        file.name = res
      },
      handleFormatError (file) {
        this.$Notice.warning({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
        })
      },
      handleMaxSize (file) {
        this.$Notice.warning({
          title: '超出文件大小限制',
          desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
        })
      },
      handleBeforeUpload () {
        const check = this.uploadList.length < 999
        if (!check) {
          this.$Message.warning({
            title: '最多只能上传 5 张图片。'
          })
        }
        return check
      },
      init () {
        this.cityList = this.$cityList
        let callback1 = (data) => {
          this.dictList = data.data
          if (this.formItem.type) this.typeChange(this.formItem.type)
        }
        ajax(api.getCaseDict, 'GET', {}, callback1)
        let callback2 = (data) => {
          this.toolingList = data.data
        }
        ajax(api.toolList, 'GET', {}, callback2)
      },
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          this.formItem.imgUrl = []
          if (this.formItem.caseType === 1) {
            for (let i in this.uploadList) {
              this.formItem.imgUrl.push(this.uploadList[i].url)
            }
            this.formItem.imgUrl = this.formItem.imgUrl.join(',')
          } else if (this.formItem.caseType === 2) {
            this.formItem.imgUrl = this.uploadList2.length ? this.uploadList2[0].url : ''
          }
          if (valid && this.formItem.pageUrl && this.formItem.imgUrl && this.formItem._cityId.length) {
            this.save()
          } else {
            this.$Message.error(this.$lang.currency.pFia)
          }
        })
      },
      getItem (id) {
        if (!id) this.$router.push('/sys/case')
        let vm = this
        let callback = (data) => {
          if (data) {
            if (data.data.labels) {
              data.data._labels = data.data.labels.split('|')
            } else {
              data.data._labels = []
            }
            vm.formItem = data.data
            if (vm.formItem.cityId && vm.formItem.cityId.indexOf(',') !== -1) {
              vm.formItem._cityId = vm.formItem.cityId.split(',')
            } else {
              vm.formItem._cityId = [vm.formItem.cityId.substr(0, 2), vm.formItem.cityId]
            }
            // 案例图片处理
            if (vm.formItem.caseType === 1) {
              for (let v of vm.formItem.imgUrl.split(',')) {
                vm.uploadList.push({
                  url: v,
                  name: v,
                  status: 'finished'
                })
              }
            } else if (vm.formItem.caseType === 2 && vm.formItem.imgUrl) {
              // vm.uploadList2 = [{url: vm.formItem.imgUrl}]
              this.showVrBtn = true
            }
            vm.init()
          }
        }
        ajax(api.getCaseDetail, 'GET', {caseId: id}, callback)
      },
      save () {
        let type = 'POST'
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.$router.push('/sys/case')
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptSave,
          onOk: () => {
            this.formItem.cityId = this.formItem._cityId[1]
            this.formItem.labels = this.formItem._labels.join('|')
            ajax(this.edit ? api.caseUpdate : api.caseAdd, type, this.formItem, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>

<style>
  .demo-upload-list {
    display: inline-block;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .demo-upload-list img {
    width: 100%;
    height: 100%;
  }

  .demo-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .demo-upload-list:hover .demo-upload-list-cover {
    display: block;
  }

  .demo-upload-list-cover i {
    color: #fff;
    font-size: 35px;
    cursor: pointer;
    margin: 0 10px;
  }
</style>
