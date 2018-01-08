<template>
  <div class="charts_main" ref="chart" :id="id"></div>
</template>
<script>
  import echarts from 'echarts'
  import $ from 'jquery'
  export default {
    data () {
      return {
        id: 'chart' + parseInt(Math.random() * 99999),
        chart: ''
      }
    },
    props: {
      option: {
        type: Object,
        default: {}
      },
      h: {
        type: Number,
        default: 3
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      drawGraph (chart) {
        if (!this.option.title) return
        $(chart).height($(chart).width() * this.h / 4)
        this.chart = echarts.init(chart)
        this.chart.showLoading()
        this.chart.setOption(this.option, true)
        this.chart.hideLoading()
        window.addEventListener('resize', () => {
          $(chart).height($(chart).width() * this.h / 4)
          this.chart.resize()
        }, false)
      },
      init () {
        this.$nextTick(function () {
          this.drawGraph(document.getElementById(this.id))
        })
      },
      setOption (option) {
        if (!this.chart) {
          this.drawGraph(document.getElementById(this.id))
        }
        this.chart.setOption(option, true)
        this.chart.resize()
      }
    },
    watch: {
      option: function (op) {
        this.setOption(op)
      }
    }
  }
</script>
