<template>
  <div class="com sys-user">
    <div class="title">
      <h3>{{title}}</h3>
    </div>
    <div class="form">
      <Form ref="formCustom" :model="formItem" :label-width="80" :rules="ruleInline" label-position="left">
        <Form-item label="名称" prop="name">
          <Input :disabled="disabled" v-model="formItem.name" placeholder="请填写任务名称"></Input>
        </Form-item>
        <Form-item label="类型" prop="type">
          <Select :disabled="disabled" v-model="formItem.type" placeholder="请选择任务类型">
            <Option value="1">签到</Option>
            <Option value="2">模型上传</Option>
            <Option value="3">户型上传</Option>
          </Select>
        </Form-item>
        <Form-item label="分类" prop="taskClass">
          <Select :disabled="disabled" v-model="formItem.taskClass" placeholder="请选择任务分类">
            <Option value="1">每日任务</Option>
            <Option value="3">成长任务</Option>
            <Option value="2">成就任务</Option>
          </Select>
        </Form-item>
        <Form-item label="完成数量" prop="finishNum">
          <Input :disabled="disabled" v-model="formItem.finishNum" placeholder="请填写完成数量"></Input>
        </Form-item>
        <Form-item label="完成类型" prop="finishType">
          <Select :disabled="disabled" v-model="formItem.finishType" placeholder="请选择完成类型">
            <Option value="1">每天</Option>
            <Option value="2">连续</Option>
            <Option value="3">累计</Option>
          </Select>
        </Form-item>
        <Form-item label="奖励数量" prop="rewardNum">
          <Input :disabled="disabled" v-model="formItem.rewardNum" placeholder="请填写奖励数量"></Input>
        </Form-item>
        <Form-item label="奖励类型" prop="rewardType">
          <Select :disabled="disabled" v-model="formItem.rewardType" placeholder="请选择奖励类型">
            <Option value="1">自动发放</Option>
            <Option value="2">自己领取</Option>
          </Select>
        </Form-item>
        <Form-item label="任务地址">
          <Input :disabled="disabled" v-model="formItem.finishUrl" placeholder="请填写任务地址"></Input>
        </Form-item>
        <Form-item label="排序" prop="sort">
          <Input :disabled="disabled" v-model="formItem.sort" placeholder=""></Input>
        </Form-item>
        <Form-item label="是否显示">
          <RadioGroup v-model="formItem.displayStatus">
            <Radio :label="1">是</Radio>
            <Radio :label="2">否</Radio>
          </RadioGroup>
        </Form-item>
      </Form>
      <div class="btn-main">
        <Button type="success" @click="handleSubmit('formCustom')" v-if="!disabled">保存</Button>
        <Button @click="$router.push('/sys/task')">返回</Button>
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
        if (isNaN(value)) {
          callback(new Error(this.$lang.currency.iError))
        } else {
          callback()
        }
      }
      return {
        title: '添加任务',
        disabled: false,
        edit: false,
        formItem: {
          name: '',
          type: '',
          taskClass: '',
          finishNum: '',
          finishType: '',
          rewardNum: '',
          rewardType: '',
          finishUrl: '',
          sort: '',
          displayStatus: 1
        },
        ruleInline: {
          name: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          type: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'change'}
          ],
          taskClass: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'change'}
          ],
          finishNum: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'},
            {validator: validatePassCheck, trigger: 'blur'}
          ],
          finishType: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'change'}
          ],
          rewardNum: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'},
            {validator: validatePassCheck, trigger: 'blur'}
          ],
          rewardType: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'change'}
          ],
          finishUrl: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          sort: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'},
            {validator: validatePassCheck, trigger: 'blur'}
          ]
        }
      }
    },
    props: {},
    mounted () {
      if (this.$route.path === '/sys/task/view') this.title = '查看任务'
      if (this.$route.path === '/sys/task/edit') this.title = '编辑任务'
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.oMan}, {title: '任务管理', path: '/sys/task'}, {title: this.title}])
      this.init(this.$route.path)
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      init (path) {
        if (path === '/sys/task/view') {
          this.disabled = true
          this.title = '查看任务'
          this.getItem(this.$route.query.id)
        } else if (path === '/sys/task/edit') {
          this.edit = true
          this.title = '编辑任务'
          this.getItem(this.$route.query.id)
        }
      },
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            let callback = (data) => {
              this.$Message.success(this.$lang.currency.oSuccess)
              this.$router.push('/sys/task')
            }
            this.$Modal.confirm({
              title: this.$lang.currency.prompt,
              content: this.$lang.currency.promptSave,
              onOk: () => {
                ajax(this.edit ? api.taskEdit : api.taskAdd, 'POST', this.formItem, callback)
              },
              onCancel: () => {
              }
            })
          } else {
            this.$Message.error('验证失败')
          }
        })
      },
      getItem (id) {
        if (!id) this.$router.push('/sys/task')
        let callback = (data) => {
          if (data) {
            this.formItem = data.data
            this.formItem.type = String(this.formItem.type)
            this.formItem.taskClass = String(this.formItem.taskClass)
            this.formItem.finishType = String(this.formItem.finishType)
            this.formItem.rewardType = String(this.formItem.rewardType)
            this.formItem.finishNum = String(this.formItem.finishNum)
            this.formItem.rewardNum = String(this.formItem.rewardNum)
            this.formItem.sort = String(this.formItem.sort)
          }
        }
        ajax(api.taskDetail, 'POST', {id}, callback)
      }
    }
  }
</script>
