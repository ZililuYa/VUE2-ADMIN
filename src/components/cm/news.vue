<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.classId" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option v-for="item in typeList" :value="item.value" :key="item.value">{{item.text}}</Option>
      </Select>
      <Select v-model="parameter.selected" placeholder="请选择推荐" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option :value="2">已经推荐</Option>
        <Option :value="1">没有推荐</Option>
      </Select>
      <Select v-model="parameter.orderby" placeholder="排序" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="create_time desc">创建时间</Option>
        <Option value="pv desc">浏览量</Option>
        <Option value="shareNum desc">分享数</Option>
        <Option value="update_time desc">修改时间</Option>
        <Option value="selected desc">是否推荐</Option>
      </Select>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="addEvent">
          <Icon type="plus-round"></Icon>
          添加新闻
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
      title="公共详情" width="80%">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <h3 style="text-align: center;padding: 20px 0">{{modalItem.title}}</h3>
        摘要：
        <div v-html="modalItem.digest" class="news-html"></div>
        内容：
        <div v-html="modalItem.content" class="news-html"></div>
      </div>
    </Modal>
    <Modal v-model="modal_edit" :title="$lang.currency.editContent" width="80%" @on-ok="saveModel" :loading="true" :mask-closable="false">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="12">
            <FormItem label="标题" prop="title">
              <Input @input="setAlt" v-model="modalItem.title" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="作者" prop="author">
              <Input v-model="modalItem.author" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="来源" prop="source">
              <Input v-model="modalItem.source" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="新闻分类" prop="classId">
              <Select v-model="modalItem.classId" placeholder="请选择类型" v-if="modal_edit">
                <Option v-for="i in typeList" :value="i.value" :key="i.value">{{ i.text }}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="摘要" prop="digest">
              <Input type="textarea" v-model="modalItem.digest" :maxlength="255" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="缩略图">
              <Upload
                :format="['jpg','jpeg','png']"
                action="/api/v1/upload/fileImage"
                :on-format-error="handleFormatError"
                :on-error="handleError"
                :on-success="imgUpload"
                :show-upload-list="false"
                :on-progress="progress_img">
                <Button type="ghost" :disabled="disabled" icon="ios-cloud-upload-outline">上传图片</Button>
              </Upload>
              <Progress :percent="number" v-if="number && number!=100"></Progress>
              <Button v-if="!!modalItem.thumb" @click="handleView(modalItem.thumb)" icon="android-send">查看</Button>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="标签">
              <Select v-model="modalItem._labels" multiple>
                <Option v-for="i in labels" :key="i.id" :value="i.text">{{i.text}}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="附件">
              <Progress :percent="num" v-show="num && num!=100"></Progress>
              <Tooltip content="请上传文章附件" placement="top">
                <Input v-model="modalItem.enclosure" disabled="disabled">
                <Button slot="append" type="primary" @click="fileUpload">请上传文章附件</Button>
                </Input>
              </Tooltip>
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
                      @onChange="setAlt"
                      v-model="modalItem.content"></editor>
              <!--<div v-html="content"></div>-->
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


    <Modal
      v-model="model_recommend"
      :title="$lang.currency.recomm"
      :mask-closable="false"
      width="360"
      @on-ok="recommendSave">
      <Checkbox v-model="recommend.selected">APP</Checkbox>
      <Checkbox v-model="recommend.pcSelected">官网</Checkbox>
    </Modal>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'
  import editor from '../editor/Quilleditor.vue'

  const {ajax, api, dateTime, $, changePage, getData, clearLoading, changePageSize} = lib

  export default {
    components: {
      editor
    },
    data() {
      return {
        judge: {
          add: this.$judge('cm.news.add'),
          del: this.$judge('cm.news.del'),
          view: this.$judge('cm.news.view'),
          edit: this.$judge('cm.news.edit'),
          top: this.$judge('cm.news.top'),
          recommend: this.$judge('cm.news.recommend')
        },
        classId: '',
        model_recommend: false,
        pro: 0,
        modal: false,
        canCrop: false,
        uploadUrl: '/api/v1/upload/fileImage',
        content: '',
        showVideo: false,
        disabled: false,
        video_path: '',
        visible: false,
        recommend: {
          id: '',
          selected: false,
          pcSelected: false
        },
        id: '',
        number: 0,
        modal_wp: false,
        parent: '',
        imgName: '',
        table_data: [],
        edit: false,
        wp: '',
        wp1: [],
        typeList: [],
        data: [],
        ruleValidate: {
          title: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          author: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          classId: [{required: true, message: this.$lang.currency.pEtc}],
          source: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          digest: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}]
        },
        total: 0,
        modal_edit: false,
        modalItem: {
          title: '',
          author: '',
          digest: '',
          source: '',
          classId: '',
          enclosure: '',
          _labels: []
        },
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: this.$lang.currency.name,
            key: 'title',
            ellipsis: true
          },
          {
            title: '作者',
            width: 140,
            key: 'author'
          },
          {
            title: '来源',
            key: 'source'
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
              if (this.judge.recommend) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.$log(params.row)
                      this.recommend.id = params.row.id
                      if (params.row.selected === 1) this.recommend.selected = false
                      if (params.row.pcSelected === 1) this.recommend.pcSelected = false
                      if (params.row.selected === 2) this.recommend.selected = true
                      if (params.row.pcSelected === 2) this.recommend.pcSelected = true
                      this.model_recommend = true
                    }
                  }
                }, this.$lang.currency.recomm))
              }
              if (this.judge.top) {
                if (params.row.topStatus === 2) {
                  arr.push(h('Button', {
                    props: {
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.topItem(params.row.id, api.cTopNews)
                      }
                    }
                  }, '取消置顶'))
                } else {
                  arr.push(h('Button', {
                    props: {
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.topItem(params.row.id, api.topNews)
                      }
                    }
                  }, '置顶'))
                }
              }
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
          selected: '',
          orderby: '',
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
          classId: ''
        },
        num: 0,
        api: api.newsList,
        labels: []
      }
    },
    props: {},
    mounted() {
      this.getData()
      this.init()
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '新闻管理'}])
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      recommendSave() {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        let recommand = 1
        let pcRecommand = 2
        let id = this.recommend.id
        if (this.recommend.selected) recommand = 2
        if (this.recommend.pcSelected) pcRecommand = 2
        ajax(api.newsSelected, 'POST', {id, recommand, pcRecommand}, callback)
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
        let arr = fileInput.files[0].name.split('.')
        let self = this
        let data = new FormData()
        data.append('file', fileInput.files[0], name)
        let xhr = new XMLHttpRequest()
        xhr.upload.onprogress = function (p) {
          self.num = parseInt(p.loaded / p.total * 100)
        }
        xhr.open('POST', api.fileUpload + '?type=' + arr[arr.length - 1])
        xhr.send(data)
        xhr.onerror = function (p) {
          self.number = 0
          self.$Message.error('上传失败')
        }
        xhr.onload = function () {
          if (xhr.status === 200) {
            self.$Message.info(self.$lang.currency.uSuccess)
            self.modalItem.enclosure = xhr.response
            // self.editor.insertEmbed(self.editor.getSelection().index, 'image', xhr.response)
          }
        }
      },
      topItem(id, i) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(i, 'POST', {id}, callback)
      },
      primaryItem(id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(api.newsSelected, 'POST', {id: id, recommand: num}, callback)
      },
      addEvent() {
        this.modalItem = {
          content: '',
          classId: '',
          thumb: '',
          enclosure: '',
          _labels: []
        }
        this.edit = false
        this.modal_edit = true
      },
      imgUpload(req) {
        this.modalItem.thumb = req
      },
      handleFormatError(file) {
        this.$Notice.warning({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
        })
      },
      handleView(name) {
        this.imgName = name
        this.visible = true
      },
      progress_img(e) {
        this.number = parseInt(e.percent)
      },
      handleError() {
        this.$Message.error('上传失败')
      },
      progress(e) {
        this.pro = parseInt(e.percent)
      },
      setAlt() {
        $('.ql-editor img').attr('alt', this.modalItem.title)
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
                this.$log(this.modalItem._labels)
                this.modalItem.labels = this.modalItem._labels.join(',')
                ajax(this.edit ? api.newsUpdate : api.newsAdd, 'POST', this.modalItem, callback, this.clearLoading)
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
          this.typeList = []
          for (let i in data.data.children) {
            this.typeList.push({
              value: data.data.children[i].id,
              text: data.data.children[i].name
            })
          }
        }
        ajax(api.newsType, 'POST', {}, callback)
        let callbackLabel = (data) => {
          this.labels = data.data
        }
        ajax(api.newsLabel, 'POST', {}, callbackLabel)
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
        this.modalItem._labels = []
        if (item.labels) this.modalItem._labels = item.labels.split(',')
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
            ajax(api.newsDel, 'GET', {id}, callback)
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
