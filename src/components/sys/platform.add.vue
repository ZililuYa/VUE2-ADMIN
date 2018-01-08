<template>
  <div class="com sys-user">
    <div class="title">
      <h3>{{title}}</h3>
    </div>
    <div class="form">
      <Form ref="formCustom" :model="formItem" :label-width="80" :rules="ruleInline" label-position="left">
        <Form-item label="手机号" prop="mobile">
          <Input :disabled="disabled" v-model="formItem.mobile" placeholder=""></Input>
        </Form-item>
        <Form-item label="状态">
          <Select v-model="formItem.role" filterable>
            <Option :value="2">管理员</Option>
            <Option :value="3">用户</Option>
          </Select>
        </Form-item>
      </Form>
      <div class="btn-main">
        <Button type="success" @click="handleSubmit('formCustom')" v-if="!disabled">保存</Button>
        <Button @click="$router.push('/sys/platform')">返回</Button>
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
      return {
        title: '添加平台用户',
        disabled: false,
        formItem: {
          mobile: '',
          role: 2
        },
        ruleInline: {
          mobile: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ]
        }
      }
    },
    props: {},
    mounted () {
      let title = '添加平台用户'
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.sMan}, {title: '平台组织', path: '/sys/platform'}, {title: title}])
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      checkChange (arr) {
        this.menuTree = arr
      },
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.save()
          }
        })
      },
      save () {
        let type = 'POST'
        let callback = (data) => {
          this.$Message.success(this.$lang.currency.oSuccess)
          this.$router.push('/sys/platform')
        }
        this.$Modal.confirm({
          title: this.$lang.currency.prompt,
          content: this.$lang.currency.promptSave,
          onOk: () => {
            ajax(api.organAddList, type, this.formItem, callback)
          },
          onCancel: () => {
          }
        })
      }
    }
  }
</script>
