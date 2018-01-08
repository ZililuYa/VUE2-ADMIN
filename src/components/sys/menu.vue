<template>
  <div class="com sys-menu">
    <div class="form">
      <Tree :data="baseData" @on-select-change="selectChange"></Tree>
    </div>
    <div class="form" ref="form">
      <Affix :offset-top="20">
        <div style="overflow: hidden;padding-bottom: 10px; ">
          <CheckboxGroup v-model="dataArr" style="float: left" @on-change="checkBox">
            <Checkbox :label="i.id" :key="i.id" v-for="i in data">{{i.text}}</Checkbox>
          </CheckboxGroup>
          <div class="fr"><Button type="info" @click="addGen">添加根目录</Button></div>
        </div>
        <Form :model="formItem" :label-width="80" label-position="left">
          <Form-item label="名称">
            <Input :disabled="disabled" v-model="formItem.text"></Input>
          </Form-item>
          <Form-item label="类型">
            <Select :disabled="disabled" v-model="formItem.type" filterable @on-change="typeChangeF">
              <Option :key="i.remark" :value="i.remark" v-if="i.remark !== 'laber'" v-for="i in menuType">{{i.text}}</Option>
            </Select>
          </Form-item>
          <Form-item label="图标">
            <Input :disabled="disabled" v-model="formItem.icon"></Input>
          </Form-item>
          <Form-item label="排序号">
            <Input-number :disabled="disabled" v-model="formItem.sort"></Input-number>
          </Form-item>
          <Form-item :label="pathTextF" v-if="formItem.type === '1' || formItem.type === '3' || formItem.type === '4'">
            <Input :disabled="disabled" v-model="formItem.path"></Input>
          </Form-item>
          <Form-item v-if="this.addItem.parentId && this.addItem.parentId !== '#'">
            <ButtonGroup>
              <Button @click="handleSubmit()">{{disabled ? $lang.currency.edit : '保存'}}</Button>
              <Button @click="disabled=true" v-show="!disabled">取消</Button>
              <Button @click="addSubMenu" v-show="disabled">添加子菜單</Button>
              <Button @click="perv=true" v-show="disabled">重新选择父级</Button>
              <Button type="error" @click="deleteItem" v-show="disabled">刪除</Button>
            </ButtonGroup>
          </Form-item>
        </Form>
      </Affix>
    </div>
    <Modal
      :mask-closable="false"
      v-model="model"
      :title="addItem.type === '1' ? '添加根目录': '添加菜单'"
      class="admin-model">
      <Form ref="addItem" :model="addItem" :rules="rules" :label-width="80">
        <FormItem label="名称" prop="text">
          <Input placeholder="请输入名称" v-model="addItem.text"></Input>
        </FormItem>
        <FormItem label="类型">
          <Select v-model="addItem.type" :disabled="addItem.type === '1'" filterable @on-change="typeChangeM">
            <Option :key="i.remark" v-if="i.remark !== 'laber'" :disabled="i.remark === '1' && isAddSubMenu" :value="i.remark" v-for="i in menuType">{{i.text}}</Option>
          </Select>
        </FormItem>
        <FormItem label="图标">
          <Input placeholder="请输入图标" v-model="addItem.icon"></Input>
        </FormItem>
        <FormItem label="排序号">
          <Input-number placeholder="排序号" v-model="addItem.sort" style="width: 100%"></Input-number>
        </FormItem>
        <FormItem :label="pathTextM" v-if="addItem.type === '1' || addItem.type === '3' || addItem.type === '4'">
          <Input :placeholder="'请输入' + pathTextM" v-model="addItem.path"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="info" @click="okSave('addItem')">保存</Button>
        <Button @click="model = !model">取消</Button>
      </div>
    </Modal>
    <Modal
      :mask-closable="false"
      v-model="perv" title="请选择"
      @on-ok="okPervSave" class="admin-model">
      <Cascader :data="data" v-model="pId" change-on-select></Cascader>
    </Modal>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  const {ajax, api, calc} = lib
  import { mapActions } from 'vuex'
  export default {
    data () {
      return {
        isAddSubMenu: false,
        model: false,
        perv: false,
        title: '菜单管理',
        pId: [],
        baseData: [],
        data: [],
        dataArr: [],
        disabled: true,
        menuType: [],
        pathTextM: '路由',
        pathTextF: '路由',
        addItem: {
          path: '',
          icon: '',
          text: '',
          sort: 0,
          type: '3',
          parentId: ''
        },
        formItem: {
          path: '',
          icon: '',
          text: '',
          sort: 0,
          type: '3'
        },
        rules: {
          text: [
            {required: true, message: '请输入名称', trigger: 'blur'}
          ]
        }
      }
    },
    props: {},
    mounted () {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.sMan}, {title: '菜单管理'}])
      this.init()
      this.getMenuType()
//      let form = this.$refs.form
//      let num = $(form).offset().top
//      window.onscroll = () => {
//        if ($(document).scrollTop() > num - 20) {
//          $(form).css('padding-top', $(document).scrollTop() - num + 20 + 'px')
//        } else {
//          $(form).css('padding-top', '0px')
//        }
//      }
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      okPervSave () {
        if (this.pId.length) {
          this.save({id: this.formItem.id, parentId: this.pId[this.pId.length - 1]}, 'PUT')
        }
      },
      addItemClear () {
        this.addItem.path = ''
        this.addItem.icon = ''
        this.addItem.text = ''
        this.addItem.sort = 0
      },
      addGen () {
        this.addItemClear()
        this.addItem.parentId = '#'
        this.addItem.type = '1'
        this.isAddSubMenu = false
        this.model = true
      },
      addSubMenu () {
        this.addItemClear()
        this.addItem.type = '3'
        this.isAddSubMenu = true
        this.model = true
      },
      checkBox () {
        this.fineData()
      },
      getMenuType () {
        let callback = (data) => {
          this.menuType = data.data
        }
        ajax(api.getDictList, 'GET', {code: 'MENUTYPE'}, callback)
      },
      typeChangeF (v) {
        // 1-根目錄 2-目錄 3-菜單 4-按鈕
        if (v === '1' || v === '3') {
          this.pathTextF = '路由'
        } else if (v === '4') {
          this.pathTextF = '权限标识'
        }
      },
      typeChangeM (v) {
        // 1-根目錄 2-目錄 3-菜單 4-按鈕
        if (v === '1' || v === '3') {
          this.pathTextM = '路由'
        } else if (v === '4') {
          this.pathTextM = '权限标识'
        }
      },
      formItemClear () {
        this.formItem = {
          path: '',
          icon: '',
          text: '',
          sort: 0,
          type: 3
        }
      },
      handleSubmit () {
        if (this.disabled) {
          this.disabled = false
        } else {
          this.save(this.formItem, 'PUT')
        }
      },
      deleteItem () {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.dSuccess)
          this.getTree()
          this.addItem.parentId = ''
          this.formItemClear()
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptDelete,
          onOk: () => {
            ajax(api.menuOpt + '/' + this.addItem.parentId, 'DELETE', {}, callback)
          }
        })
      },
      okSave (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.$Modal.confirm({
              title: this.$lang.currency.prompt,
              content: '确定添加吗？',
              onOk: () => {
                this.save(this.addItem, 'POST')
              }
            })
          }
        })
      },
      save (item, type) {
        let callback = (data) => {
          this.disabled = true
          this.$Message.success(this.$lang.currency.oSuccess)
          if (this.model) {
            this.model = false
          }
          this.getTree()
        }
        ajax(api.menuOpt, type, JSON.stringify(item), callback)
      },
      selectChange (sc) {
        if (sc.length) {
          this.addItem.parentId = sc[0].id
          this.addItem.type = ''
          this.disabled = true
          this.getMenu()
        }
      },
      getMenu () {
        let callback = (data) => {
          if (data) {
            this.formItem = data.data
          }
        }
        ajax(api.menuOpt + '/' + this.addItem.parentId, 'GET', {}, callback)
      },
      init () {
        this.getTree()
      },
      getTree () {
        let callback = (data) => {
          this.baseData = calc(data.data, '#')
          this.data = this.baseData
          this.fineData()
        }
        ajax(api.menuTree + '?roleId=', 'GET', {}, callback)
      },
      fineData () {
        if (!this.dataArr.length) {
          this.baseData = this.data
          return
        }
        this.baseData = []
        for (let i of this.data) {
          for (let s of this.dataArr) {
            if (i.id === s) this.baseData.push(i)
          }
        }
      }
    }
  }
</script>
