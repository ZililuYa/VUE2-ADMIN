<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.typeId" placeholder="请选择类型" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option v-for="item in typeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
      </Select>
      <Select v-model="parameter.selected" placeholder="请选择推荐" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option :value="2">已经推荐</Option>
        <Option :value="1">没有推荐</Option>
      </Select>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="addEvent">
          <Icon type="plus-round"></Icon>
          添加视频
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
      v-model="modal_edit" id="model"
      :title="$lang.currency.editContent" width="50%" @on-ok="saveModel" :loading="true" :mask-closable="false">
      <div class="modal_def" style="border-bottom: 0;overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="12">
            <FormItem label="标题" prop="title">
              <Input v-model="modalItem.title" placeholder=""></Input>
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
            <FormItem label="类型" prop="classId">
              <Select v-model="modalItem.classId" placeholder="请选择类型" v-if="modal_edit">
                <Option v-for="item in typeList" :value="item.id" :key="item.id">{{ item.name }}</Option>
              </Select>
            </FormItem>
            </Col>
            <Col span="24">
            <FormItem label="视频上传">
              <Upload
                type="drag"
                :format="['mp4']"
                :show-upload-list="false"
                :on-progress="progress"
                :on-success="imgUpload"
                :on-error="handleError"
                :on-format-error="handleFormatError"
                action="/api/v1/upload/videoUpload">
                <div style="padding: 20px 0">
                  <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                  <p>点击或将文件拖拽到这里上传</p>
                </div>
              </Upload>
              <Progress :percent="number" v-show="number && number!=100"></Progress>
              <Button v-if="!!modalItem.url" @click="showVideoEvent(modalItem.url)">查看视频</Button>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
    <Modal v-model="showVideo" :mask-closable="false" width="60%" @on-cancel="$refs.video.pause()">
      <video :src="video_path" ref="video" style="width: 100%" controls="controls" autoplay="autoplay"></video>
    </Modal>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'

  const {ajax, api, dateTime, clearLoading, changePage, getData, changePageSize} = lib
  export default {
    data() {
      return {
        judge: {
          add: this.$judge('cm.video.add'),
          del: this.$judge('cm.video.del'),
          edit: this.$judge('cm.video.edit'),
          recommend: this.$judge('cm.video.recommend')
        },
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
        wp2: '',
        wp_data: [],
        wp_data1: [],
        public_label: [],
        public_label_data: [],
        data: [],
        ruleValidate: {
          title: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          author: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          classId: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          source: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}]
        },
        total: 0,
        modal: false,
        modal_edit: false,
        modalItem: {
          title: '',
          author: '',
          url: '',
          classId: ''
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
            title: '视频',
            key: '',
            width: 100,
            render: (h, params) => {
              if (params.row.url) {
                return h('a', {
                  on: {
                    click: () => {
                      this.showVideoEvent(params.row.url)
                    }
                  }
                }, '查看视频')
              } else {
                return '空'
              }
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
                      this.editItem(params.row, true)
                    }
                  }
                }, this.$lang.currency.edit))
              }
              if (this.judge.recommend && params.row.selected === 1) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.primaryItem(params.row.id, 2)
                    }
                  }
                }, this.$lang.currency.recomm))
              }
              if (this.judge.recommend && params.row.selected === 2) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.primaryItem(params.row.id, 1)
                    }
                  }
                }, this.$lang.currency.cancelRecomm))
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
        api: api.videoList,
        method: 'GET'
      }
    },
    props: {},
    mounted() {
      this.getData()
      this.init()
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '视频管理'}])
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      primaryItem(id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(api.videoSelected, 'POST', {id: id, recommand: num}, callback)
      },
      addEvent() {
        this.edit = false
        this.modal_edit = true
        this.modalItem = {
          url: '',
          classId: ''
        }
      },
      handleError() {
        this.$Message.error('上传失败')
        this.number = 0
      },
      showVideoEvent(url) {
        this.video_path = url
        this.showVideo = true
      },
      progress(pro) {
        this.number = parseInt(pro.percent)
      },
      imgUpload(req) {
        this.modalItem.url = req
      },
      handleFormatError(file) {
        this.$Notice.warning({
          title: '文件格式不正确',
          desc: '文件 ' + file.name + ' 格式不正确，请上传 mp4 格式的视频。'
        })
      },
      saveModel() {
        this.$refs['formValidate'].validate((valid) => {
          if (valid && this.modalItem.url) {
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
                ajax(this.edit ? api.videoUpdate : api.videoAdd, 'POST', this.modalItem, callback, this.clearLoading)
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
          this.typeList = data.data.children
        }
        ajax(api.videoType, 'GET', {}, callback)
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
            ajax(api.videoDel, 'GET', {id}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
