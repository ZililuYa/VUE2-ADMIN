<template>
  <div class='index'>
    <div class='statistics'>
      <div class='main'>
        <Card :bordered='false' dis-hover>
          <p slot='title'>{{$lang.home.DecorationCompanySettledInStatistics}}</p>
          <DatePicker
            type='datetimerange'
            :options='options'
            :placeholder='$lang.home.SelectDate'
            @on-clear='C_handleClear'
            @on-ok='C_handleOk'
            @on-change='C_handleChange'
            style='width: 300px'>
          </DatePicker>
          <p>
            <Icon type='pin'/>
            {{param.company.beginTime}} - {{param.company.endTime}} {{$lang.home.DecorationCompanySettledInStatistics || ''}}：<span class='num'>{{C_num}}</span></p>
        </Card>
      </div>
    </div>
    <div class='statistics '>
      <div class='main'>
        <Card :bordered='false' dis-hover>
          <p slot='title'>{{$lang.home.DesignerStatisticsSettled}}</p>
          <DatePicker
            type='datetimerange'
            :options='options'
            :placeholder='$lang.home.SelectDate'
            @on-clear='D_handleClear'
            @on-ok='D_handleOk'
            @on-change='D_handleChange'
            style='width: 300px'>
          </DatePicker>
          <p>
            <Icon type='pin'/>
            {{param.designer.beginTime}} - {{param.designer.endTime}} {{$lang.home.DesignerStatisticsSettled}}：<span class='num'>{{D_num}}</span></p>
        </Card>
      </div>
    </div>
    <div class='statistics max'>
      <div class='main'>
        <Card :bordered='false' dis-hover>
          <p slot='title'>{{$lang.home.StoreStatisticsSettled}}</p>
          <DatePicker
            type='datetimerange'
            :options='options'
            :placeholder='$lang.home.SelectDate'
            @on-clear='S_handleClear'
            @on-ok='S_handleOk'
            @on-change='S_handleChange'
            style='width: 300px'>
          </DatePicker>
          <p>
            <Icon type='pin'/>
            {{param.store.beginTime}} - {{param.store.endTime}} {{$lang.home.StoreStatisticsSettled}}：<span class='num'>{{S_num}}</span></p>
        </Card>
      </div>
    </div>
    <div class='charts max' v-show="charts_show1">
      <div class='main'>
        <Select v-model="day" @on-change="init" style="margin-bottom: 20px;width: 200px">
          <Option :value="7">{{$lang.home.LastDays.format([7])}}</Option>
          <Option :value="30">{{$lang.home.LastDays.format([30])}}</Option>
          <Option :value="90">{{$lang.home.LastDays.format([90])}}</Option>
          <Option :value="180">{{$lang.home.LastDays.format([180])}}</Option>
          <Option :value="365">{{$lang.home.LastDays.format([365])}}</Option>
        </Select>
        <vCharts :option='option' :h='2'></vCharts>
      </div>
    </div>
    <div v-show="charts_show2" class='charts'>
      <div class='main'>
        <vCharts :option='option1'></vCharts>
      </div>
    </div>
    <div v-show="charts_show3" class='charts'>
      <div class='main'>
        <vCharts :option='option2'></vCharts>
      </div>
    </div>
  </div>
</template>
<script>
  import lib from '@/assets/js/lib.js'
  import { mapActions } from 'vuex'
  import vCharts from '@/components/global/charts.vue'
  const {ajax, api, dateTime} = lib
  export default {
    components: {
      vCharts
    },
    data () {
      return {
        charts_show1: false,
        charts_show2: false,
        charts_show3: false,
        C_num: 0,
        D_num: 0,
        S_num: 0,
        param: {
          company: {
            beginTime: '',
            endTime: ''
          },
          designer: {
            beginTime: '',
            endTime: ''
          },
          store: {
            beginTime: '',
            endTime: ''
          }
        },
        C_option: {
          title: {
            text: '装修公司',
            left: 'left',
            top: 'bottom'
          },
          color: ['#3398DB'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
              type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              axisTick: {
                alignWithLabel: true
              }
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '入驻数量',
              type: 'bar',
              barWidth: '60%',
              data: [50, 52, 200, 334, 390, 330, 220]
            }
          ]
        },
        options: {
          shortcuts: [
            {
              text: this.$lang.home.LastDays.format([7]),
              value () {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                return [start, end]
              }
            },
            {
              text: this.$lang.home.LastDays.format([30]),
              value () {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                return [start, end]
              }
            },
            {
              text: this.$lang.home.LastDays.format([90]),
              value () {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                return [start, end]
              }
            }
          ]
        },
        option: {},
        option1: {},
        option2: {},
        day: 90
      }
    },
    props: {},
    mounted () {
      this.SYSTEM_SETPOSITION([{title: this.$lang.currency.home}])
      this.init()
      this.param.company.beginTime = dateTime(this.defaultDate()[0])
      this.param.company.endTime = dateTime(this.defaultDate()[1])
      this.C_statistics()
      this.param.designer.beginTime = dateTime(this.defaultDate()[0])
      this.param.designer.endTime = dateTime(this.defaultDate()[1])
      this.D_statistics()
      this.param.store.beginTime = dateTime(this.defaultDate()[0])
      this.param.store.endTime = dateTime(this.defaultDate()[1])
      this.S_statistics()
    },
    methods: {
      ...mapActions(['SYSTEM_SETPOSITION']),
      init () {
        let callback = (data) => {
          this.charts_show2 = true
          this.charts_show3 = true
          let pv = data.data.pv
          let uv = data.data.uv
          let arr1 = []
          let arr2 = []
          for (let i in pv) {
            arr1.push(pv[i].time)
            arr2.push(pv[i].count)
          }
          this.option1 = {
            title: {
              text: 'Pv',
              subtext: 'ALDBIM'
            },
            color: ['#ff9900'],
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: ['Pv']
            },
            toolbox: {
              show: true,
              feature: {
                mark: {show: true},
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true}
              }
            },
            calculable: true,
            xAxis: [
              {
                type: 'category',
                boundaryGap: false,
                data: arr1
              }
            ],
            yAxis: [
              {
                type: 'value',
                axisLabel: {
                  formatter: '{value}'
                }
              }
            ],
            series: [
              {
                name: 'Pv',
                type: 'line',
                data: arr2
              }
            ]
          }
          arr1 = []
          arr2 = []
          for (let i in uv) {
            arr1.push(uv[i].time)
            arr2.push(uv[i].count)
          }
          this.option2 = {
            title: {
              text: 'Uv',
              subtext: 'ALDBIM'
            },
            color: ['#ed3f14'],
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: ['Uv']
            },
            toolbox: {
              show: true,
              feature: {
                mark: {show: true},
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true}
              }
            },
            calculable: true,
            xAxis: [
              {
                type: 'category',
                boundaryGap: false,
                data: arr1
              }
            ],
            yAxis: [
              {
                type: 'value',
                axisLabel: {
                  formatter: '{value}'
                }
              }
            ],
            series: [
              {
                name: 'Uv',
                type: 'line',
                data: arr2
              }
            ]
          }
        }
        let end = new Date().getTime()
        let begin = end - 1000 * 60 * 60 * 24 * this.day
        ajax(api.pvLog, 'POST', {beginTime: begin, endTime: end}, callback)
        let callback1 = (data) => {
          this.charts_show1 = true
          let arrData = data.data
          let arr1 = []
          let arr2 = []
          let num = 0
          for (let i in arrData) {
            arr1.push(arrData[i].time)
            arr2.push(arrData[i].count)
            num += arrData[i].count
          }
          this.option = {
            title: {
              text: this.$lang.home.Aladdin.format([this.day]) + num, // - 近30天  --  99850
              subtext: 'ALDBIM'
            },
            color: ['#19be6b'],
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: [this.$lang.home.RegisteredUser]
            },
            toolbox: {
              show: true,
              feature: {
                mark: {show: true},
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true}
              }
            },
            calculable: true,
            xAxis: [
              {
                type: 'category',
                boundaryGap: false,
                data: arr1
              }
            ],
            yAxis: [
              {
                type: 'value',
                axisLabel: {
                  formatter: '{value}'
                }
              }
            ],
            series: [
              {
                name: this.$lang.home.RegisteredUser,
                type: 'line',
                data: arr2
              }
            ]
          }
        }
        ajax(api.pvLogReg, 'POST', {beginTime: begin, endTime: end}, callback1)
      },
      defaultDate () {
        /**
         * 默认展示一个月的情况
         **/
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        return [start, end]
      },
      C_handleClear () {
        this.param.company.beginTime = dateTime(this.defaultDate()[0])
        this.param.company.endTime = dateTime(this.defaultDate()[1])
        this.C_statistics()
      },
      C_handleOk () {
        this.C_statistics()
      },
      C_handleChange (date) {
        this.param.company.beginTime = date[0]
        this.param.company.endTime = date[1]
      },
      C_statistics () {
        /**
         * 公司入驻统计
         **/
        let url = api.statisticsCompany
        let param = {
          ...this.param.company
        }
        let callback = (data) => {
          this.C_num = data.data.num
        }
        ajax(url, 'get', param, callback)
      },
      D_handleClear () {
        this.param.designer.beginTime = dateTime(this.defaultDate()[0])
        this.param.designer.endTime = dateTime(this.defaultDate()[1])
        this.D_statistics()
      },
      D_handleOk () {
        this.D_statistics()
      },
      D_handleChange (date) {
        this.param.designer.beginTime = date[0]
        this.param.designer.endTime = date[1]
      },
      D_statistics () {
        /**
         * 设计师入驻统计
         **/
        let url = api.statisticsDesigner
        let param = {
          ...this.param.designer
        }
        let callback = (data) => {
          this.D_num = data.data.num
        }
        ajax(url, 'get', param, callback)
      },
      S_handleClear () {
        this.param.store.beginTime = dateTime(this.defaultDate()[0])
        this.param.store.endTime = dateTime(this.defaultDate()[1])
        this.S_statistics()
      },
      S_handleOk () {
        this.S_statistics()
      },
      S_handleChange (date) {
        this.param.store.beginTime = date[0]
        this.param.store.endTime = date[1]
      },
      S_statistics () {
        /**
         * 店铺入驻统计
         **/
        let url = api.statisticsStore
        let param = {
          ...this.param.store
        }
        let callback = (data) => {
          this.S_num = data.data
        }
        ajax(url, 'get', param, callback)
      }
    }
  }
</script>
