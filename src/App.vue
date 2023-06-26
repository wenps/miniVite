<template>
  <div>
    {{title}}
  </div>
</template>

<script>
import { reactive, toRefs, onBeforeMount, onMounted } from 'vue'
// import HelloWorld from './' //注意还是要引入, 只是子组件中不需要export
export default {
  name: 'app',
  setup() {
    console.log('1-开始创建组件-setup')
    const data = reactive({
      title: 'hello Vite'
    })
    window.data = data
    onBeforeMount(() => {
      console.log('2.组件挂载页面之前执行----onBeforeMount')
    })
    onMounted(() => {
      console.log('3.-组件挂载到页面之后执行-------onMounted')
    })
    return {
      ...toRefs(data),
    }
  },
}

</script>
