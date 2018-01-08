<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" :placeholder="$lang.currency.pleaseIK" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.area" placeholder="请选择面积" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option v-for="item in area" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <Select v-model="parameter.price" placeholder="请选择造价" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option v-for="item in price" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <Select v-model="parameter.caseType" placeholder="请选择图片类型" @on-change="getData()">
        <Option value="">{{$lang.currency.all}}</Option>
        <Option value="1">{{$lang.case.ep}}</Option>
        <Option value="2">{{$lang.case.panorama}}</Option>
      </Select>
      <Cascader :data="cityList" v-model="parameter._cityId" @on-change="cityChange"></Cascader>
      <div class="fr">
        <Button type="success" v-if="judge.add && false" @click="$router.push('/sys/case/add')">
          <Icon type="plus-round"></Icon>
          添加案例
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
      v-model="model_update"
      title="转让案例"
      @on-ok="okSave" class="admin-model">
      <Row>
        <Col span="24">
        <Select v-model="value" filterable>
          <Option v-for="item in desList" :value="item.userId" :key="item.userId">{{ item.name }}</Option>
        </Select>
        </Col>
      </Row>
    </Modal>
    <Modal
      :mask-closable="false"
      v-model="model_recommend"
      :title="$lang.currency.recomm"
      width="360"
      @on-ok="recommendSave">
      <CheckboxGroup v-model="recommend">
        <Checkbox :label="2">地图案例列表</Checkbox>
        <Checkbox :label="3">地图首页</Checkbox>
        <Checkbox :label="4">官网</Checkbox>
      </CheckboxGroup>
    </Modal>
    <Modal
      :mask-closable="false"
      v-model="model_ttpo"
      title="转让案例"
      width="500"
      @on-ok="ttpoSave">
      <RadioGroup v-model="ttpo" class="caseTable">
        <table class="caseTable_main">
          <tr>
            <th width="80">名字</th>
            <th>手机号</th>
            <th>头像</th>
          </tr>
          <tr v-for="i in desList">
            <td>
              <Radio :label="i.userId">{{i.name}}</Radio>
            </td>
            <td>{{i.mobile}}</td>
            <td><img :src="i.headImg" width="50" height="50" alt=""></td>
          </tr>
        </table>
      </RadioGroup>
      <Page @on-change="changePageCase" :total="total_designer" show-total></Page>
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
          add: this.$judge('sys.case.add'),
          del: this.$judge('sys.case.del'),
          view: this.$judge('sys.case.view'),
          edit: this.$judge('sys.case.edit'),
          recommend: this.$judge('sys.case.recommend'),
          go: this.$judge('sys.case.go')
        },
        api: api.caseList,
        total_designer: 0,
        method: 'GET',
        model_ttpo: false,
        ttpo: '',
        desList: [],
        parent: '',
        area: [{
          value: '0-30',
          label: '0 至 30'
        }, {
          value: '30-60',
          label: '30 至 60'
        }, {
          value: '60-90',
          label: '60 至 90'
        }, {
          value: '90-120',
          label: '90 至 120'
        }, {
          value: '120-140',
          label: '120 至 140'
        }, {
          value: '140-200',
          label: '140 至 200'
        }, {
          value: '200',
          label: '200以上'
        }],
        price: [{
          value: '0-5',
          label: '0 至 5万'
        }, {
          value: '5-10',
          label: '5万 至 10万'
        }, {
          value: '10-15',
          label: '10万 至 15万'
        }, {
          value: '15-30',
          label: '15万 至 30万'
        }, {
          value: '30-50',
          label: '30万 至 50万'
        }, {
          value: '50-100',
          label: '50万 至 100万'
        }, {
          value: '100',
          label: '100万以上'
        }],
        data: [],
        total: 0,
        model_add: false,
        model_update: false,
        model_recommend: false,
        recommend_id: '',
        recommend: [],
        value: '',
        addItem: {
          code: '',
          remark: ''
        },
        editItem: {
          designerId: ''
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
            title: '图片类型',
            key: 'caseType',
            render: (h, params) => {
              let caseType = parseInt(params.row.caseType)
              if (caseType === 1) {
                return this.$lang.case.ep
              }
              if (caseType === 2) {
                return this.$lang.case.panorama
              } else {
                return this.$lang.case.ep
              }
            }
          },
          {
            title: '案例类型',
            key: 'type'
          },
          {
            title: '手机号',
            key: '',
            render: (h, params) => {
              if (params.row.designer) return params.row.designer.mobile
              if (params.row.decorate) return params.row.decorate.telnum
              return '无'
            }
          },
          {
            title: '上传者',
            key: '',
            render: (h, params) => {
              if (params.row.designer) return params.row.designer.name
              if (params.row.decorate) return params.row.decorate.name
              return '无'
            }
          },
          {
            title: this.$lang.currency.recomm,
            key: '',
            render: (h, params) => {
              let recommend = params.row.recommend ? params.row.recommend.split(',') : []
              if (recommend.length) {
                let recommendStr = ''
                for (let v of recommend) {
                  if (parseInt(v) === 1) {
                    recommendStr += '地图装饰公司' + ' '
                  } else if (parseInt(v) === 2) {
                    recommendStr += '地图案例列表' + ' '
                  } else if (parseInt(v) === 3) {
                    recommendStr += '地图首页' + ' '
                  } else if (parseInt(v) === 4) {
                    recommendStr += '官网' + ' '
                  } else {
                    recommendStr = '无'
                  }
                }
                return recommendStr
              } else {
                return '无'
              }
            }
          },
          {
            title: this.$lang.currency.uTime,
            key: 'createTime',
            width: 170,
            render: (h, params) => {
              return params.row.createTime ? dateTime(params.row.createTime) : ''
            }
          },
          {
            width: lib.$l === 'cn' ? 100 : 100,
            render: (h, params) => {
              let arr = []
              if (this.judge.go) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.transferItem(params.row.id)
                    }
                  }
                }, '转让'))
              }
              if (this.judge.recommend) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.recommendItemEvent(params.row)
                    }
                  }
                }, this.$lang.currency.recomm))
              }
              if (this.judge.view) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.viewItemEvent(params.row.id)
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
        cityList: [],
        parameter: {
          pagination: {
            start: 1,
            number: 10
          },
          search: {
            code: ''
          },
          sort: {},
          status: '1',
          name: '',
          pageIndex: 1,
          caseType: '',
          pageSize: 10,
          orgId: '10000',
          cityId: ''
        },
        designerList: [],
        id: ''
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '案例管理'}])
      this.parameter.orgId = this.$route.query.id
      this.getData()
      this.cityList = this.$cityList
      this.init()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      changePageCase(i) {
        this.init(i)
      },
      ttpoSave() {
        if (!this.ttpo) return
        let callback = () => {
          this.$Message.info(this.$lang.currency.oSuccess)
          this.id = ''
          this.ttpo = ''
          this.getData()
        }
        ajax(api.caseAttorn, 'POST', {id: this.id, userId: this.ttpo}, callback)
      },
      init(i) {
        this.ttpo = ''
        let callback = (data) => {
          this.desList = data.data
          this.total_designer = data.total
        }
        ajax(api.caseDes, 'POST', {patnerStatus: 2, pageIndex: i || 1}, callback)
      },
      transferItem(id) {
        this.id = id
//        this.model_update = true
        this.model_ttpo = true
      },
      cityChange(v) {
        this.parameter.cityId = v[1]
        this.getData()
      },
      showItem(row) {
        this.editItem = row
        this.model_update = true
      },
      recommendItemEvent(row) {
        this.model_recommend = true
        this.recommend_id = row.id
        this.recommend = row.recommend ? row.recommend.split(',') : []
        this.recommend = this.recommend.map(function (v) {
          return Number(v)
        })
      },
      recommendSave() {
        let type = 'POST'
        let param = {
          recommend: this.recommend.length ? this.recommend.join(',') : '',
          id: this.recommend_id
        }
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(api.caseUpdate, type, param, callback)
      },
      editItemEvent(id) {
        this.$router.push('/sys/case/edit?id=' + id)
      },
      viewItemEvent(id) {
        this.$router.push('/sys/case/view?id=' + id)
      },
      okSave() {
        let callback = () => {
          this.id = ''
          this.value = ''
          this.getData()
        }
        ajax(api.caseAttorn, 'POST', {id: this.id, userId: this.value}, callback)
      },
      getData,
      changePage,
      changePageSize,
      removeItem(id) {
        let callback = (data) => {
          this.getData()
          this.$Message.success(this.$lang.currency.dSuccess)
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.caseDelete, 'POST', {caseId: id}, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
