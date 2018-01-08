<template>
  <div class="ald-login">
    <div class="top-content ">
      <div class="inner-bg">
        <div class="container">
          <div class="row">
            <div class="col-sm-8 col-sm-offset-2 text">
              <h1><strong>阿拉丁BIM云平台 - 管理后台</strong></h1>
              <div class="description">
                <p>
                  Aladdin, BIM cloud platform - after managing Aladdin BIM cloud platform - after managing Aladdin BIM cloud platform - managed
                </p>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6 col-sm-offset-3 form-box">
              <div class="form-top">
                <div class="form-top-left">
                  <h3>登录</h3>
                  <p>Enter your username and password to log on:</p>
                </div>
                <div class="form-top-right">
                  <i class="fa fa-key"></i>
                </div>
              </div>
              <div class="form-bottom">
                <form role="form" action="" method="post" class="login-form">
                  <div class="form-group">
                    <label class="sr-only" for="form-username">Username</label>
                    <input type="text" v-model="formInline.username" name="form-username" placeholder="Username..." class="form-username form-control" id="form-username">
                  </div>
                  <div class="form-group">
                    <label class="sr-only" for="form-password">Password</label>
                    <input type="password" @keyup.enter="login" v-model="formInline.password" name="form-password" placeholder="Password..." class="form-password form-control" id="form-password">
                  </div>
                  <button type="button" @click="login" class="btn">Sign in!</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="backstretch">
        <img src="../../assets/images/4.jpg">
      </div>
    </div>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'
  const {ajax, api} = lib
  export default {
    name: 'login',
    data () {
      return {
        formInline: {
          username: '',
          password: ''
        },
        ruleInline: {
          username: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'}
          ],
          password: [
            {required: true, message: this.$lang.currency.pEtc, trigger: 'blur'},
            {type: 'string', min: 3, message: '密码长度不能小于3位', trigger: 'blur'}
          ]
        }
      }
    },
    props: {},
    mounted () {
    },
    methods: {
      ...mapActions(['SYSTEM_SETLOGININFO']),
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.login()
          } else {
            this.$Message.error('验证失败!')
          }
        })
      },
      login () {
        let callback = (data) => {
          this.SYSTEM_SETLOGININFO(data)
          this.$router.push('/')
          window.history.go(0)
        }
        ajax(api.login, 'POST', this.formInline, callback)
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "../../assets/font-awesome/css/font-awesome.min.css";
  @import "../../assets/css/style.less";

  .backstretch {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -999;
    width: 100%;
    height: 100%;
  }

  .backstretch img {
    position: absolute;
    top: 50%;
    left: 0;
    z-index: -999;
    width: 100%;
    transform: translateY(-50%)
  }
</style>
