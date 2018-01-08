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
        <Form-item label="手机号" prop="mobile">
          <Input :disabled="disabled" v-model="formItem.mobile" placeholder=""></Input>
        </Form-item>
        <Form-item label="生日">
          <DatePicker type="date" v-model="formItem.birthdayTime" placeholder="选择日期" style="width: 100%"></DatePicker>
        </Form-item>
        <Form-item label="工作时间">
          <DatePicker type="date" v-model="formItem.workTime" placeholder="选择日期" style="width: 100%"></DatePicker>
        </Form-item>
        <!-- <Form-item label="案例数量" style="width: 100%">
          <InputNumber :min="0" v-model="formItem.caseNum"></InputNumber>
        </Form-item> -->
        <Form-item label="城市">
          <Cascader :disabled="disabled" :data="$cityList" v-model="formItem._cityId"></Cascader>
        </Form-item>
        <Form-item label="类型" prop="style">
          <!--<Input :disabled="disabled" v-model="formItem.style" placeholder=""></Input>-->
          <Select :disabled="disabled" v-model="formItem.style" placeholder="请选择类型">
            <Option v-for="item in itemClass" :value="item.id" :key="item.id">{{ item.text }}</Option>
          </Select>
        </Form-item>
        <Form-item label="签名" prop="autograph">
          <Input type="textarea" :disabled="disabled" v-model="formItem.autograph" placeholder=""></Input>
        </Form-item>
        <Form-item label="头像">
          <Upload
            :format="['jpg','jpeg','png']"
            action="/api/v1/upload/fileImage"
            :on-format-error="handleFormatError"
            :on-error="handleError"
            :on-success="imgUpload1"
            :show-upload-list="false"
            :on-progress="progress">
            <Button type="ghost" :disabled="disabled" icon="ios-cloud-upload-outline">上传图片</Button>
          </Upload>
          <Progress :percent="number" v-if="number && number!=100"></Progress>
          <Button v-if="!!formItem.headImg" @click="handleView(formItem.headImg)" icon="android-send">查看</Button>
        </Form-item>
        <Form-item label="身份证正面">
          <Upload
            :format="['jpg','jpeg','png']"
            action="/api/v1/upload/fileImage"
            :on-format-error="handleFormatError"
            :on-error="handleError"
            :on-success="imgUpload2"
            :show-upload-list="false"
            :on-progress="progress">
            <Button type="ghost" :disabled="disabled" icon="ios-cloud-upload-outline">上传图片</Button>
          </Upload>
          <Progress :percent="number" v-if="number && number!=100"></Progress>
          <Button v-if="!!formItem.cardFace" @click="handleView(formItem.cardFace)" icon="android-send">查看</Button>
        </Form-item>
        <Form-item label="身份证反面">
          <Upload
            :format="['jpg','jpeg','png']"
            action="/api/v1/upload/fileImage"
            :on-format-error="handleFormatError"
            :on-error="handleError"
            :on-success="imgUpload3"
            :show-upload-list="false"
            :on-progress="progress">
            <Button type="ghost" :disabled="disabled" icon="ios-cloud-upload-outline">上传图片</Button>
          </Upload>
          <Progress :percent="number" v-if="number && number!=100"></Progress>
          <Button v-if="!!formItem.cardBack" @click="handleView(formItem.cardBack)" icon="android-send">查看</Button>
        </Form-item>
        <Form-item label="证书图片">
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
      </Form>
      <div class="btn-main">
        <Button type="success" @click="handleSubmit('formCustom')" v-if="!disabled">保存</Button>
        <Button @click="$router.back()">返回</Button>
      </div>
    </div>
    <Modal title="查看图片" width="80%" v-model="visible" :mask-closable="false">
      <div class="" style="text-align: center">
        <img v-lazy="imgName" v-if="visible" style="max-width: 100%">
      </div>
    </Modal>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  const {ajax, api} = lib
  import { mapActions } from 'vuex'
  export default {
    data () {
      return {
        title: '编辑设计师',
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
          name: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          mobile: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          birthdayTime: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          workTime: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          // caseNum: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          style: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          autograph: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}]
        },
        itemClass: []
      }
    },
    props: {},
    mounted () {
      this.getClass()
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '设计师管理'}, {title: this.title}])
      if (this.$refs.upload.fileList) {
        this.uploadList = this.$refs.upload.fileList
      }
      this.edit = true
      this.title = '编辑设计师'
      this.getItem(this.$route.query.id)
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getClass () {
        let callback = (data) => {
          this.itemClass = data.data
        }
        ajax(api.getDict, 'POST', {dictClassId: '0b08dd13397f40f88b0e83d8c7003fe5', pageSize: 9999}, callback)
      },
      toolingChange (value) {
        if (!value) {
          this.formItem.area = ''
          this.formItem.price = ''
        }
      },
      imgUpload1 (req) {
        this.$Message.info(this.$lang.currency.uSuccess)
        this.formItem.headImg = req
      },
      imgUpload2 (req) {
        this.$Message.info(this.$lang.currency.uSuccess)
        this.formItem.cardFace = req
      },
      imgUpload3 (req) {
        this.$Message.info(this.$lang.currency.uSuccess)
        this.formItem.cardBack = req
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
      },
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid && this.formItem.cardFace && this.formItem.cardBack && this.formItem.headImg && this.formItem._cityId.length) {
            this.save()
          } else {
            this.$Message.error(this.$lang.currency.pFia)
          }
        })
      },
      getItem (id) {
        if (!id) this.$router.back()
        let vm = this
        let callback = (data) => {
          vm.formItem = data.data
          vm.formItem._cityId = this.$getCityArr(vm.formItem.cityId)
          if (vm.formItem.certificateImg) {
            for (let v of vm.formItem.certificateImg.split(',')) {
              vm.uploadList.push({
                url: v,
                name: v,
                status: 'finished'
              })
            }
          }
          vm.formItem.workTime = new Date(vm.formItem.workTime)
          vm.formItem.birthdayTime = new Date(vm.formItem.birthdayTime)
          vm.init()
        }
        ajax(api.designerDetail, 'GET', {id}, callback)
      },
      save () {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.$router.back()
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptSave,
          onOk: () => {
            this.formItem.cityId = this.formItem._cityId[1]
            this.formItem.birthdayTime = this.formItem.birthdayTime.getTime()
            this.formItem.workTime = this.formItem.workTime.getTime()
            let arr = []
            for (let i in this.uploadList) {
              arr.push(this.uploadList[i].url)
            }
            this.formItem.certificateImg = arr.join(',')
            ajax(api.designerUpdate, 'POST', this.formItem, callback)
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
