<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.name" placeholder="请输入编号" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.allocation" @on-change="getData()">
        <Option value="">全部</Option>
        <Option value="2">未分配</Option>
        <Option value="1">已经分配</Option>
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
      v-model="model_update"
      title="分配设计师"
      @on-ok="okSave" class="admin-model">
      <Row>
        <Col span="12">
        <Input placeholder="编号" v-model="editItem.name" disabled></Input>
        </Col>
        <Col span="12">
        <Select v-model="editItem.designerId" filterable>
          <Option v-for="item in designerList" :value="item.id" :key="item.id">{{ item.name }}</Option>
        </Select>
        </Col>
      </Row>
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
          distribution: this.$judge('sys.enroll.distribution'),
          del: this.$judge('sys.enroll.del')
        },
        parent: '',
        data: [],
        total: 0,
        model_add: false,
        model_update: false,
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
            key: 'name'
          },
          {
            title: this.$lang.currency.mobile,
            key: 'mobile'
          },
          {
            title: '地址',
            key: 'address'
          },
          {
            title: '区域',
            key: 'area'
          },
          {
            title: '建筑类型',
            key: 'buildingType'
          },
          {
            title: '城市',
            key: '',
            render: (h, params) => {
              for (let i in this.cityList) {
                if (params.row.cityId === this.cityList[i].id) {
                  return this.cityList[i].name
                }
              }
            }
          },
          {
            title: this.$lang.currency.uTime,
            key: 'createTime',
            width: 170,
            render: (h, params) => {
              return dateTime(params.row.createTime)
            }
          },
          {
            width: 100,
            render: (h, params) => {
              let arr = []
              if (this.judge.distribution && !params.row.designerId) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.showItem(params.row)
                    }
                  }
                }, '分配'))
              }
              if (this.judge.distribution && params.row.designerId) {
                arr.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.showItem(params.row)
                    }
                  }
                }, '重新分配'))
              }
              if (this.judge.del) {
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
          allocation: '2',
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
          pageSize: 10,
          orgId: '10000'
        },
        designerList: [],
        cityList: [],
        api: api.enrollList
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '报名管理'}])
      this.parameter.orgId = this.$route.query.id
      this.getData()
      this.init()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      deleteItem(id) {
        let callback = () => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.aoDel, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
      init() {
        let callback = (data) => {
          this.designerList = data.data
        }
        ajax(api.designerList, 'GET', {}, callback)
        this.cityList = this.$city
      },
      showItem(row) {
        this.editItem = row
        this.model_update = true
      },
      okSave() {
        let item = this.editItem
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.addItem.name = this.addItem.designerId = ''
          this.getData()
        }
        ajax(api.distri, 'POST', item, callback)
      },
      getData,
      changePage,
      changePageSize
    }
  }
</script>
