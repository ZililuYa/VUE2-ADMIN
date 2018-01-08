<template>
  <div class="com sys-user">
    <!--<div class="ani">-->
    <!--<Button @click="$router.push('/sys/organize')">返回组织管理</Button>-->
    <!--</div>-->
    <div class="table">
      <Table :columns="columns" :data="data"></Table>
    </div>
    <div class="page">
      <Page @on-change="changePage" @on-page-size-change="changePageSize" :total="total" :current="parameter.pageIndex" :page-size="parameter.pageSize" show-sizer></Page>
    </div>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  const {ajax, api, dateTime} = lib
  import { mapActions } from 'vuex'
  export default {
    data () {
      return {
        parent: '',
        data: [],
        total: 0,
        columns: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '名字',
            key: 'member["name"]',
            render: (h, params) => {
              return params.row.member.name
            }
          },
          {
            title: this.$lang.currency.mobile,
            key: 'member["mobile"]',
            render: (h, params) => {
              return params.row.member.mobile
            }
          },
          {
            title: this.$lang.currency.uTime,
            width: 170,
            key: 'createTime',
            render: (h, params) => {
              return dateTime(params.row.createTime)
            }
          }
        ],
        parameter: {
          pagination: {
            start: 1,
            number: 10
          },
          search: {
            name: ''
          },
          sort: {},
          status: '1',
          name: '',
          pageIndex: 1,
          pageSize: 10,
          orgId: '10000'
        }
      }
    },
    props: {},
    mounted () {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home, path: '/home'}, {title: this.$lang.currency.sMan}, {title: '组织管理', path: '/sys/organize'}, {title: '查看组织成员'}])
      this.parameter.orgId = this.$route.query.id
      this.getData()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      getData () {
        let callback = (data) => {
          this.total = data.total
          this.data = data.data
        }
        ajax(api.organUserList, 'POST', this.parameter, callback)
      },
      changePage (i) {
        this.parameter.pagination.start = i
        this.parameter.pageIndex = i
        this.getData()
      },
      changePageSize (i) {
        this.parameter.pagination.number = i
        this.parameter.pageSize = i
        this.getData()
      }
    }
  }
</script>
