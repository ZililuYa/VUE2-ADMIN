<template>
  <div class="com sys-user">
    <div class="tree">
      <div style="overflow: hidden; text-align: right">
        <Button type="success" @click="addEvent" v-if="judge.add" size="small">
          <Icon type="plus-round"></Icon>
          添加分类
        </Button>
      </div>
      <Tree :data="dataList" :render="renderContent"></Tree>
    </div>

    <Modal
      v-model="modal_edit"
      :title="$lang.currency.editContent" @on-ok="saveModel" :loading="true" :mask-closable="false">
      <div class="modal_def" style="border-bottom: 0; overflow: inherit">
        <Form ref="formValidate" :model="modalItem" :rules="ruleValidate" :label-width="80">
          <Row>
            <Col span="12">
            <FormItem label="名称" prop="name">
              <Input v-model="modalItem.name" placeholder=""></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="排序">
              <InputNumber :min="1" v-model="modalItem.sort"></InputNumber>
            </FormItem>
            </Col>
            <Col span="24" v-if="modalItem.parentId === '0'">
            <FormItem label="分类" prop="type">
              <Select v-model="modalItem.type">
                <Option :value="1">模型</Option>
                <Option :value="2">品牌</Option>
              </Select>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'

  const {ajax, api, dateTime, changePage, getData, clearLoading, changePageSize} = lib
  export default {
    data() {
      return {
        judge: {
          add: this.$judge('co.classification.add'),
          edit: this.$judge('co.classification.edit'),
          del: this.$judge('co.classification.del'),
          recommend: this.$judge('co.classification.recommend')
        },
        dataTree: [
          {
            title: 'parent 1',
            expand: true,
            children: [
              {
                title: 'child 1-1',
                expand: true,
                children: [
                  {
                    title: 'leaf 1-1-1',
                    expand: true
                  },
                  {
                    title: 'leaf 1-1-2',
                    expand: true
                  }
                ]
              },
              {
                title: 'child 1-2',
                expand: true,
                children: [
                  {
                    title: 'leaf 1-2-1',
                    expand: true
                  },
                  {
                    title: 'leaf 1-2-1',
                    expand: true
                  }
                ]
              }
            ]
          }
        ],
        data: [],
        total: 0,
        parentId: [],
        modal: false,
        modal_edit: false,
        modalItem: {
          name: '',
          sort: 1,
          type: 1,
          parentId: '0'
        },
        ruleValidate: {
          name: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}],
          type: [{required: true, message: this.$lang.currency.pEtc}],
          parentId: [{required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}]
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
            title: this.$lang.currency.uTime,
            width: 170,
            render: (h, params) => {
              return params.row.createTime ? dateTime(params.row.createTime) : ''
            }
          },
          {
            title: '排序',
            key: 'sort'
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
                      this.editItem(params.row)
                    }
                  }
                }, this.$lang.currency.edit))
              }
              if (this.judge.recommend && params.row.hierarchy === 3 && params.row.recommand === 1) {
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
              if (this.judge.recommend && params.row.hierarchy === 3 && params.row.recommand === 2) {
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
          pageIndex: 1,
          pageSize: 99999
        },
        value: '',
        api: api.classList,
        dataList: [],
        dataArr: [],
        edit: false,
        buttonProps: {
          type: 'ghost',
          size: 'small'
        },
        hierarchy: 1,
        callback: (data) => {
          this.dataList = this.calc(data.data, '0')
        }
      }
    },
    props: {},
    mounted() {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '分类管理'}])
      this.getData()
//      this.init()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      calc(result, par, disabled) {
        /**
         * 计算成树形结构DATA
         * */
        let arr = []
        for (let i in result) {
          if (result[i].parentId === par) {
            let opt = result[i]
            opt.expand = true
            opt.title = result[i].name
            opt.disabled = disabled || false
            if (this.childrenCalc(opt.id, result)) {
              opt.children = this.calc(result, opt.id, disabled)
            }
            arr.push(opt)
          }
        }
        return arr
      },
      childrenCalc(id, res) {
        /**
         * 计算子数据是否包含
         * */
        for (let i in res) {
          if (res[i].parentId === id) return true
        }
        return false
      },
      renderContent(h, {root, node, data}) {
        let icon = data.parentId === '0' ? 'folder' : 'ios-paper-outline'
        if (node.parent && root[node.parent].parent === undefined) icon = 'ios-paper'
        return h('span', {
          attrs: {
            class: 'treeSpan'
          },
          style: {
            display: 'inline-block',
            width: '100%'
          }
        }, [
          h('span', [
            h('Icon', {
              props: {
                type: icon
              },
              style: {
                marginRight: '5px'
              }
            }),
            h('span', data.title)
          ]),
          h('ButtonGroup', {
            style: {
              display: 'inline-block',
              float: 'right',
              marginRight: '15px'
            }
          }, [
            h('Button', {
              props: Object.assign({}, this.buttonProps),
              on: {
                click: () => {
                  this.editItem(data)
                }
              }
            }, this.$lang.currency.edit),
            h('Button', {
              props: Object.assign({}, this.buttonProps),
              on: {
                click: () => {
                  this.append(root, node, data)
                }
              }
            }, '添加子级'),
            h('Button', {
              props: Object.assign({}, this.buttonProps, {
                type: 'error'
              }),
              on: {
                click: () => {
                  this.remove(root, node, data)
                }
              }
            }, this.$lang.currency.del)
          ])
        ])
      },
      parent(root, key) {
        if (root[key].parent) {
          this.hierarchy++
          this.parent(root, root[key].parent)
        }
      },
      append(root, node, data) {
        this.hierarchy = 2
        if (node.parent) this.parent(root, node.parent)
        let i = data.children ? data.children.length : 0
        let callback = () => {
          this.getData()
        }
        ajax(api.classInsert, 'POST', {hierarchy: this.hierarchy, parentId: data.id, name: '子分类', sort: i}, callback)
      },
      remove(root, node, data) {
        this.deleteItem(data.id)
      },
      primaryItem(id, num) {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.getData()
        }
        ajax(api.classRecomm, 'POST', {id: id, recommand: num}, callback)
      },
      editItem(row) {
        this.modalItem = row
        this.edit = true
        this.modal_edit = true
      },
      saveModel() {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            this.$Modal.confirm({
              title: this.$lang.currency.prompt,
              content: this.$lang.currency.promptSave,
              onOk: () => {
                let callback = (data) => {
                  this.$Message.success(this.$lang.currency.oSuccess)
                  this.modal_edit = false
                  this.getData()
                  this.parentId = '0'
                }
                delete this.modalItem.modelList
                delete this.modalItem.childrenList
                delete this.modalItem.recommandClass
                ajax(this.edit ? api.classUpdate : api.classInsert, 'POST', this.modalItem, callback, this.clearLoading)
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
      addEvent() {
        this.modalItem = {
          name: '',
          sort: 1,
          type: 1,
          parentId: '0',
          hierarchy: 1
        }
        this.edit = false
        this.modal_edit = true
      },
      init() {
        let callback = (data) => {
          this.dataList = this.calc(data.data, '0')
        }
        ajax(this.api, 'POST', {pageIndex: 1, pageSize: 99999}, callback)
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
            ajax(api.classDelete, 'POST', {id}, callback)
          },
          onCancel: () => {
          }
        })
      },
      getData,
      changePage,
      changePageSize
    }
  }
</script>
