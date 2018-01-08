<template>
  <div class="com sys-user">
    <div class="ani">
      <Input v-model="parameter.code" placeholder="请输入编号" icon="search" @on-enter="getData"></Input>
      <div class="fr">
        <Button type="success" v-if="judge.add" @click="model_add=true">
          <Icon type="plus-round"></Icon>
          添加字典分类
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
      title="添加字典分类"
      @on-ok="okSave" class="admin-model">
      <Row>
        <Col span="12">
        <Input placeholder="编号" v-model="addItem.code"></Input>
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
        <Input placeholder="编号" v-model="editItem.code"></Input>
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
          add: this.$judge('dict.dictclass.add'),
          del: this.$judge('dict.dictclass.delete'),
          view: this.$judge('dict.dictclass.view'),
          edit: this.$judge('dict.dictclass.edit')
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
        editItem: {},
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '编号',
            key: 'code'
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
          orgId: '10000'
        },
        api: api.getDictclass
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.dMan}, {title: '字典分类'}])
      this.parameter.orgId = this.$route.query.id
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
            ajax(api.delDictclass, 'POST', {id: id}, callback)
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
          this.addItem.code = this.addItem.remark = ''
          this.getData()
        }
        ajax(type === 'POST' ? api.addDictclass : api.updDictclass, 'POST', item, callback)
      },
      getData,
      changePage,
      changePageSize
    }
  }
</script>
