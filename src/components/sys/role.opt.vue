<template>
  <div class="com sys-user">
    <div class="title">
      <h3>{{title}}</h3>
    </div>
    <div class="form">
      <Affix :offset-top="20">
        <Form ref="formCustom" :model="formItem" :label-width="80" :rules="ruleInline" label-position="left">
          <Form-item label="名称" prop="roleName">
            <Input :disabled="disabled" v-model="formItem.roleName" placeholder=""></Input>
          </Form-item>
          <Form-item label="备注" prop="remark">
            <Input :disabled="disabled" v-model="formItem.remark" placeholder=""></Input>
          </Form-item>
          <Form-item label="应用" prop="code">
            <Select v-model="formItem.code" :disabled="disabled">
              <Option :key="i.remark" :value="i.remark" v-for="i in appType">{{i.text}}</Option>
            </Select>
          </Form-item>
        </Form>
        <div class="btn-main">
          <Button type="success" @click="handleSubmit('formCustom')" v-if="!disabled">保存</Button>
          <Button @click="$router.push('/sys/role')">返回</Button>
        </div>
      </Affix>
    </div>
    <div class="form" v-if="baseData.length">
      <Tree :data="baseData" @on-check-change="checkChange" show-checkbox></Tree>
    </div>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  const {ajax, api, calc} = lib
  import { mapActions } from 'vuex'
  export default {
    data () {
      return {
        title: '添加角色',
        disabled: false,
        edit: false,
        rolelist: [],
        baseData: [],
        menuTree: [],
        appType: [],
        formItem: {
          roleName: '',
          remark: '',
          code: ''
        },
        ruleInline: {
          roleName: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          remark: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          code: [
            {required: true, message: this.$lang.currency.pSa, trigger: 'change'}
          ]
        }
      }
    },
    props: {},
    mounted () {
      let title = '添加角色'
      if (this.$route.path === '/sys/role/view') title = '查看角色'
      if (this.$route.path === '/sys/role/edit') title = '编辑角色'
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.sMan}, {title: '角色管理', path: '/sys/role'}, {title: title}])
      this.init(this.$route.path)
      this.getAppType()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      checkChange (arr) {
        this.menuTree = arr
      },
      init (path) {
        if (path === '/sys/role/view') {
          this.disabled = true
          this.title = '查看角色'
          this.getItem(this.$route.query.id)
        } else if (path === '/sys/role/edit') {
          this.edit = true
          this.title = '编辑角色'
          this.getItem(this.$route.query.id)
        }
      },
      getAppType () {
        let callback = (data) => {
          this.appType = data.data
        }
        ajax(api.getDictList, 'GET', {code: 'APPTYPE'}, callback)
      },
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.save()
          }
        })
      },
      getItem (id) {
        if (!id) this.$router.push('/sys/role')
        let callback = (data) => {
          this.formItem = data.result
        }
        ajax(api.roleOpt + '/' + id, 'GET', {}, callback)
        this.getTree(id)
      },
      getTree (id) {
        let callback = (data) => {
          this.baseData = calc(data.data, '#', this.disabled)
          for (let i in data.result) {
            if (data.result[i].state.selected) this.menuTree.push(data.result[i])
          }
        }
        ajax(api.menuTree + '?roleId=' + id, 'GET', {}, callback)
      },
      save () {
        let type = 'POST'
        if (this.edit) {
          this.formItem.menuTree = this.menuTree
          type = 'PUT'
        }
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.$router.push('/sys/role')
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptSave,
          onOk: () => {
            ajax(api.roleOpt, type, JSON.stringify(this.formItem), callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
