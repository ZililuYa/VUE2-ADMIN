<template>
  <div v-if="show" class="ButtonDropdown" ref="button" @mouseenter="enter" @mouseleave="leave">
    <button class="button_dro">
      {{$lang.currency.operation}}
    </button>
    <div class="Dropdown" ref="dro">
      <slot></slot>
    </div>
  </div>
</template>
<script>
  import $ from 'jquery'
  export default {
    name: 'ButtonDropdown',
    data () {
      return {
        show: true
      }
    },
    props: {
      title: {
        type: String,
        default: '操作'
      }
    },
    mounted () {
      if (!$(this.$refs.dro).html()) this.show = false
    },
    methods: {
      enter () {
        $(this.$refs.button).parent('.ivu-table-cell').css('overflow', 'inherit')
        $(this.$refs.button).find('.Dropdown').fadeIn(300)
      },
      leave () {
        $(this.$refs.button).find('.Dropdown').fadeOut(0)
      }
    }
  }
</script>
