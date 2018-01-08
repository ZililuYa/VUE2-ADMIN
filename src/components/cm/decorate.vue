<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.auditStatus" @on-change="getData()">
        <Option value="1">{{$lang.currency.pAudit}}</Option>
        <Option value="2">{{$lang.currency.auditP}}</Option>
        <Option value="3">{{$lang.currency.auditN}}</Option>
        <Option value="4">{{$lang.currency.disabled}}</Option>
      </Select>
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
      title="装饰公司详情">
      <div class="modal_def">
        <div class="img">
          <img v-if="modalItem.icon" v-lazy="modalItem.icon" alt="">
          <span v-if="!modalItem.icon">没有LOGO</span>
          <br>
        </div>
        <div class="li">
          <div class="div">公司名称：</div>
          <div class="div">{{modalItem.name}}</div>
        </div>
        <div class="li">
          <div class="div">电&emsp;&emsp;话：</div>
          <div class="div">{{modalItem.telnum}}</div>
        </div>
        <div class="li">
          <div class="div">所在城市：</div>
          <div class="div">{{modalItem.city}}</div>
        </div>
        <div class="li">
          <div class="div">服务区域：</div>
          <div class="div">{{modalItem.region}}</div>
        </div>
        <div class="li">
          <div class="div">建筑类型：</div>
          <div class="div">{{modalItem.buildingType}}</div>
        </div>
        <div class="li">
          <div class="div">户&emsp;&emsp;型：</div>
          <div class="div">{{modalItem.houseStyle}}</div>
        </div>
        <div class="li">
          <div class="div">服务标签：</div>
          <div class="div">{{modalItem.serviceLabel}}</div>
        </div>
        <div class="li">
          <div class="div">简&emsp;&emsp;介：</div>
          <div class="div">{{modalItem.summary}}</div>
        </div>
        <div class="li">
          <div class="div">资&emsp;&emsp;质：</div>
          <div class="div">
            <img style="max-width: 100%" v-lazy="item" v-for="item in aptitude" alt="">
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
          view: this.$judge('cm.decorate.view'),
          recommend: this.$judge('cm.decorate.recommend'),
          trial: this.$judge('cm.decorate.trial'),
          enable: this.$judge('cm.decorate.enable'),
          disable: this.$judge('cm.decorate.disable'),
          del: this.$judge('cm.decorate.del')
        },
        data: [],
        total: 0,
        modal: false,
        modalItem: [],
        aptitude: [],
        cityList: [],
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
            title: 'LOGO',
            key: '',
            render: (h, params) => {
              return h('img', {
                attrs: {
                  src: params.row.icon
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
            title: '电话',
            key: 'telnum'
          },
          {
            title: '所在城市',
            key: 'cityId',
            render: (h, params) => {
              if (!params.row.cityId) {
                return '--'
              }
              for (let i in this.cityList) {
                if (params.row.cityId === this.cityList[i].id) {
                  return this.cityList[i].name
                }
              }
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
            title: this.$lang.currency.state,
            key: '',
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
                      if (this.modalItem.aptitude) this.aptitude = this.modalItem.aptitude.split(',')
                      for (let i in this.cityList) {
                        if (this.modalItem.cityId === this.cityList[i].id) {
                          this.modalItem.city = this.cityList[i].name
                        }
                      }
                      this.modal = true
                    }
                  }
                }, this.$lang.currency.show))
              }
              if (this.judge.recommend && params.row.recommand === 1 && this.parameter.auditStatus === '2') {
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
              if (this.judge.recommend && params.row.recommand === 2 && this.parameter.auditStatus === '2') {
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
              if (this.judge.enable && this.parameter.auditStatus === '4') {
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
              if (this.judge.disable && this.parameter.auditStatus === '2') {
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
              if (this.judge.trial && (this.parameter.auditStatus === '1')) {
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
              if (this.judge.trial && (this.parameter.auditStatus === '1')) {
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
              if (this.judge.del) {
                arr.push(h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.delItem(params.row.id)
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
          auditStatus: '1',
          pageIndex: 1,
          pageSize: 10,
          modelType: '1'
        },
        api: api.decoratePager,
        value: ''
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '装饰公司管理'}])
      this.getData()
      this.init()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData,
      changePage,
      init() {
        this.cityList = this.$city
      },
      primaryItem(id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(api.decorateRecomm, 'POST', {id: id, recommand: num}, callback)
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
            ajax(op === 'enable' ? api.decorateEnable : api.decorateDisabled, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
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
      auditItem(id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.value = ''
          this.getData()
        }
        let info = num === 2 ? '' : '不'
        if (num !== 2) {
          ajax(api.decorateAudit, 'POST', {id: id, auditStatus: num, reason: this.value}, callback)
          return
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: '确定' + info + '通过吗？',
          onOk: () => {
            ajax(api.decorateAudit, 'POST', {id: id, auditStatus: num}, callback)
          },
          onCancel: () => {
          }
        })
      },
      delItem(id) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(api.decorateDel, 'POST', {id}, callback)
      }
    }
  }
</script>
