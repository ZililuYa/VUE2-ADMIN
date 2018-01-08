<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.text" placeholder="名称" icon="search" @on-enter="getData"></Input>
      <Select v-model="parameter.dictClassId" @on-change="getData()" placeholder="分类筛选" filterable>
        <Option value="">{{$lang.currency.all}}</Option>
        <Option v-for="i in itemSe" :value="i.id" :key="i.id">{{ i.remark }}</Option>
      </Select>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="model_add=true">
          <Icon type="plus-round"></Icon>
          添加字典
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
      v-model="model_add"
      title="添加字典"
      @on-ok="okSave" class="admin-model">
      <Row>
        <Col span="12">
        <Select v-model="addItem.dictClassId" placeholder="请选择分类编号" filterable>
          <Option v-for="i in itemSe" :value="i.id" :key="i.id">{{ i.remark }} （{{i.code}}）</Option>
        </Select>
        </Col>
        <Col span="12">
        <Input placeholder="编号" v-model="addItem.code"></Input>
        </Col>
        <Col span="12">
        <Input placeholder="名称" v-model="addItem.text"></Input>
        </Col>
        <Col span="12">
        <Input placeholder="备注" v-model="addItem.remark"></Input>
        </Col>
      </Row>
    </Modal>
    <Modal
      :mask-closable="false"
      v-model="model_update"
      :title="$lang.currency.editContent"
      @on-ok="okSave(true)" class="admin-model">
      <Row>
        <Col span="12">
        <Select v-model="editItem.dictClassId" placeholder="请选择分类编号" filterable>
          <Option v-for="i in itemSe" :value="i.id" :key="i.id">{{ i.remark }}</Option>
        </Select>
        </Col>
        <Col span="12">
        <Input placeholder="编号" v-model="editItem.code"></Input>
        </Col>
        <Col span="12">
        <Input placeholder="名称" v-model="editItem.text"></Input>
        </Col>
        <Col span="12">
        <Input placeholder="备注" v-model="editItem.remark"></Input>
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
          add: this.$judge('dict.dict.add'),
          del: this.$judge('dict.dict.delete'),
          view: this.$judge('dict.dict.view'),
          edit: this.$judge('dict.dict.edit')
        },
        parent: '',
        data: [],
        total: 0,
        model_add: false,
        model_update: false,
        itemSe: [],
        addItem: {
          code: '',
          remark: '',
          dictClassId: '',
          text: ''
        },
        editItem: {},
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '分类编号',
            key: 'dictClassId',
            render: (h, params) => {
              for (let i in this.itemSe) {
                if (this.itemSe[i].id === params.row.dictClassId) return this.itemSe[i].code
              }
            }
          },
          {
            title: '编号',
            key: 'code'
          },
          {
            title: this.$lang.currency.name,
            key: 'text'
          },
          {
            title: '备注',
            key: 'remark'
          },
          {
            title: this.$lang.currency.uTime,
            width: 170,
            key: 'createTime',
            render: (h, params) => {
              return dateTime(params.row.createTime)
            }
          },
          {
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
                      this.editItem.code = params.row.code
                      this.editItem.remark = params.row.remark
                      this.editItem.text = params.row.text
                      this.editItem.dictClassId = params.row.dictClassId
                      this.editItem.id = params.row.id
                      this.model_update = true
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
          orgId: '10000',
          dictClassId: '',
          text: ''
        },
        api: api.getDict
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.dMan}, {title: this.$lang.currency.dMan}])
      this.parameter.orgId = this.$route.query.id
      this.getClass()
      this.getData()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      removeItem(id) {
        let callback = (data) => {
          this.getData()
          this.$Message.success(this.$lang.currency.dSuccess)
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.delDict, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
      okSave(put) {
        let type = 'POST'
        let item = this.addItem
        if (put) {
          type = 'PUT'
          item = this.editItem
        }
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.addItem.code = this.addItem.remark = this.addItem.dictClassId = this.addItem.text = ''
          this.getData()
        }
        ajax(type === 'POST' ? api.addDict : api.updDict, 'POST', item, callback)
      },
      getClass() {
        let callback = (data) => {
          this.itemSe = data.data
        }
        ajax(api.getDictclass, 'POST', {pageSize: 9999, sort: 'createTime2'}, callback)
      },
      getData,
      changePage,
      changePageSize
    }
  }
</script>
