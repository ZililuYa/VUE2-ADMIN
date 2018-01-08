<template>
  <div class="com sys-user">
    <div class="title">
      <h3>{{title}}</h3>
    </div>
    <div class="form">
      <Form ref="formCustom" :model="formItem" :label-width="80" :rules="ruleInline" label-position="left">
        <Form-item label="用户名" prop="name" v-if="false">
          <Input :disabled="disabled" v-model="formItem.name" placeholder=""></Input>
        </Form-item>
        <Form-item label="手机号" prop="mobile">
          <Input :disabled="disabled" v-model="formItem.mobile" placeholder=""></Input>
        </Form-item>
        <Form-item v-if="!disabled && !edit" label="密码" prop="password">
          <Input v-model="formItem.password" placeholder=""></Input>
        </Form-item>
        <Form-item v-if="!disabled && !edit" label="确认密码" prop="ispasswd">
          <Input v-model="formItem.ispasswd" placeholder=""></Input>
        </Form-item>
        <Form-item label="邮箱">
          <Input :disabled="disabled" v-model="formItem.email" placeholder=""></Input>
        </Form-item>
        <Form-item label="余额" v-if="edit">
          <Input :disabled="disabled" v-model="formItem.balance" placeholder=""></Input>
        </Form-item>
        <Form-item label="阿拉币" v-if="edit">
          <Input :disabled="disabled" v-model="formItem.consumePoints" placeholder=""></Input>
        </Form-item>
        <Form-item label="状态">
          <Select :disabled="disabled" v-model="formItem.state" placeholder="请选择" filterable>
            <Option :value="1">启用</Option>
            <Option :value="0">停用</Option>
          </Select>
        </Form-item>
        <!-- <Form-item label="角色选择" v-if="disabled || edit">
          <Tooltip :key="i" :content="role.remark" placement="top" v-for="(role, i) in formItem.rolelist">
            <Checkbox v-model="formItem.rolelist[i].checked" :disabled="disabled">{{role.roleName}}</Checkbox>
          </Tooltip>
        </Form-item> -->
      </Form>
      <div class="btn-main">
        <Button type="success" @click="handleSubmit('formCustom')" v-if="!disabled">保存</Button>
        <Button @click="$router.push('/sys/user')">返回</Button>
      </div>
    </div>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  const {ajax, api} = lib
  import { mapActions } from 'vuex'
  export default {
    data () {
      const validatePassCheck = (rule, value, callback) => {
        if (value !== this.formItem.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
      const validateIphoneCheck = (rule, value, callback) => {
        if (!(/^1[3|4|5|8][0-9]\d{4,8}$/.test(value))) {
          callback(new Error('手机号格式不对'))
        } else {
          callback()
        }
      }
      return {
        title: '添加用户',
        disabled: false,
        edit: false,
        // rolelist: [],
        formItem: {
          name: '',
          password: '',
          ispasswd: '',
          email: '',
          state: 1,
          mobile: ''
        },
        ruleInline: {
          name: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'},
            {validator: validateIphoneCheck, trigger: 'blur'}
          ],
          password: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          ispasswd: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'},
            {validator: validatePassCheck, trigger: 'blur'}
          ],
          email: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'},
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'},
            {validator: validateIphoneCheck, trigger: 'blur'}
          ]
        }
      }
    },
    props: {},
    mounted () {
      let title = '添加用户'
      if (this.$route.path === '/sys/user/view') title = '查看用户'
      if (this.$route.path === '/sys/user/edit') title = '编辑用户'
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.sMan}, {title: '用户管理', path: '/sys/user'}, {title: title}])
      this.init(this.$route.path)
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      init (path) {
        if (path === '/sys/user/view') {
          this.disabled = true
          this.title = '查看用户'
          this.getItem(this.$route.query.id)
        } else if (path === '/sys/user/edit') {
          this.edit = true
          this.title = '编辑用户'
          this.getItem(this.$route.query.id)
        }
      },
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.save()
          }
        })
      },
      getItem (id) {
        if (!id) this.$router.push('/sys/user')
        let callback = (data) => {
          if (data) {
            this.title += data.data.name
            this.formItem = data.data
          }
        }
        ajax(api.userDetails, 'POST', {id}, callback)
      },
      save () {
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.$router.push('/sys/user')
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptSave,
          onOk: () => {
            ajax(this.edit ? api.userUpdate : api.userInsert, 'POST', this.edit ? {json: JSON.stringify(this.formItem)} : this.formItem, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
