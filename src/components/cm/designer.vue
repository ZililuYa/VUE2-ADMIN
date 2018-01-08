<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.auditStatus" @on-change="getData()">
        <Option value="0">{{$lang.currency.all}}</Option>
        <Option value="1">{{$lang.currency.pAudit}}</Option>
        <Option value="2">{{$lang.currency.auditP}}</Option>
        <Option value="3">{{$lang.currency.auditN}}</Option>
        <Option value="4">{{$lang.currency.disabled}}</Option>
      </Select>
      <Cascader :data="$cityList" @on-change="city1Change" placeholder="请选择城市"></Cascader>
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
      title="设计师详情">
      <div class="modal_def">
        <div class="img">
          <img v-if="modalItem.headImg" v-lazy="modalItem.headImg" alt="">
          <span v-if="!modalItem.headImg">没有LOGO</span>
          <br>
        </div>
        <div class="li">
          <div class="div">设计师名称：</div>
          <div class="div">{{modalItem.name}}</div>
        </div>
        <div class="li">
          <div class="div">电话：</div>
          <div class="div">{{modalItem.mobile}}</div>
        </div>
        <div class="li">
          <div class="div">签名：</div>
          <div class="div">{{modalItem.autograph}}</div>
        </div>
        <div class="li">
          <div class="div">生日：</div>
          <div class="div">{{modalItem.birthdayTime | formatDate}}</div>
        </div>
        <div class="li">
          <div class="div">类型：</div>
          <div class="div">{{modalItem.style | showClass(itemClass)}}</div>
        </div>
        <div class="li">
          <div class="div">工作时间：</div>
          <div class="div">{{modalItem.workTime | formatDate}}</div>
        </div>
        <div class="li">
          <div class="div">案例数量：</div>
          <div class="div">{{modalItem.caseNum}}</div>
        </div>
        <div class="li">
          <div class="div">身份证正面：</div>
          <div class="div">
            <img style="width: 100%" v-if="modalItem.cardFace" v-lazy="modalItem.cardFace" alt="">
          </div>
        </div>
        <div class="li">
          <div class="div">身份证背面：</div>
          <div class="div">
            <img style="width: 100%" v-if="modalItem.cardBack" v-lazy="modalItem.cardBack" alt="">
          </div>
        </div>
        <div class="li">
          <div class="div">证书图片：</div>
          <div class="div">
            <img style="width: 100%;margin-bottom: 4px" v-for="i in certificateImg" v-lazy="i" alt="">
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'

  const {ajax, api, dateTime, changePage, getData, changePageSize} = lib
  export default {
    data() {
      return {
        judge: {
          recommend: this.$judge('cm.designer.recommend'),
          del: this.$judge('cm.designer.del'),
          edit: this.$judge('cm.designer.edit'),
          view: this.$judge('cm.designer.view'),
          trial: this.$judge('cm.designer.trial'),
          enable: this.$judge('cm.designer.enable'),
          disable: this.$judge('cm.designer.disable')
        },
        data: [],
        total: 0,
        certificateImg: [],
        modal: false,
        modalItem: [],
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: this.$lang.currency.name,
            key: 'name'
          },
          {
            title: '头像',
            key: '',
            render: (h, params) => {
              return h('img', {
                attrs: {
                  src: params.row.headImg
                },
                style: {
                  width: '55px',
                  height: '55px',
                  margin: '10px 0'
                }
              })
            }
          },
          {
            title: this.$lang.currency.uTime,
            width: 170,
            render: (h, params) => {
              return dateTime(params.row.createTime)
            }
          },
          {
            title: this.$lang.currency.mobile,
            key: 'mobile'
          },
          {
            title: '城市',
            key: '',
            render: (h, params) => {
              for (let i in this.$city) {
                if (this.$city[i].id === params.row.cityId) return this.$city[i].name
              }
            }
          },
          {
            title: this.$lang.currency.state,
            key: 'createTime',
            render: (h, params) => {
              if (params.row.auditStatus === 1) {
                return this.$lang.currency.pAudit
              } else if (params.row.auditStatus === 2) {
                return this.$lang.currency.auditP
              } else if (params.row.auditStatus === 3) {
                return this.$lang.currency.auditN
              }
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
                      this.modalItem = params.row
                      this.certificateImg = []
                      if (params.row.certificateImg) this.certificateImg = params.row.certificateImg.split(',')
                      this.modal = true
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
                      this.editItemEvent(params.row.id)
                    }
                  }
                }, this.$lang.currency.edit))
              }
              if (this.judge.trial && (params.row.auditStatus === 1)) {
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
              if (this.judge.trial && (params.row.auditStatus === 1)) {
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
              if (this.judge.recommend && params.row.recommand === 1 && params.row.auditStatus === 2) {
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
              if (this.judge.recommend && params.row.recommand === 2 && params.row.auditStatus === 2) {
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
              if (this.judge.enable && params.row.auditStatus === 4) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.EDItem(params.row.id, 'enable')
                    }
                  }
                }, this.$lang.currency.enable))
              }
              if (this.judge.disable && params.row.auditStatus === 2) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.EDItem(params.row.id, 'disable')
                    }
                  }
                }, this.$lang.currency.disable))
              }
              if (this.judge.del && (params.row.auditStatus === 2 || params.row.auditStatus === 3)) {
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
          pagination: {
            start: 1,
            number: 10
          },
          search: {
            name: ''
          },
          sort: {},
          cityId: '',
          status: '1',
          name: '',
          auditStatus: '1',
          pageIndex: 1,
          pageSize: 10,
          modelType: '1'
        },
        value: '',
        api: api.designerPager,
        itemClass: []
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '设计师认证管理'}])
      this.getData()
      this.getClass()
    },
    filters: {
      showClass: function (text, itemClass) {
        for (let i of itemClass) {
          if (i.id === text) return i.text
        }
        return text
      }
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getClass() {
        let callback = (data) => {
          this.itemClass = data.data
        }
        ajax(api.getDict, 'POST', {dictClassId: '0b08dd13397f40f88b0e83d8c7003fe5', pageSize: 9999}, callback)
      },
      city1Change(v) {
        this.parameter.cityId = v[1]
        this.getData()
      },
      editItemEvent(id) {
        this.$router.push('/cm/designerPartner/edit?id=' + id)
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
            ajax(api.designerDelete, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
      getData,
      changePage,
      changePageSize,
      viewItem(item) {
        this.modal = true
        this.modalItem = item
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
      primaryItem(id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(api.designerRecomm, 'POST', {id: id, recommand: num}, callback)
      },
      auditItem(id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.value = ''
          this.getData()
        }
        let info = num === 2 ? '' : '不'
        if (num !== 2) {
          ajax(api.designerAudit, 'POST', {id: id, auditStatus: num, reason: this.value}, callback)
          return
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定' + info + '通过吗？',
          onOk: () => {
            ajax(api.designerAudit, 'POST', {id: id, auditStatus: num}, callback)
          },
          onCancel: () => {
          }
        })
      },
      EDItem(id, op) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptSome,
          onOk: () => {
            ajax(op === 'enable' ? api.designerEnable : api.designerDisabled, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
