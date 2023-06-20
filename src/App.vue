<template>
  <div>
    {{title}}
  </div>
</template>

<script>
import { reactive, toRefs, onBeforeMount, onMounted } from 'vue'
export default {
  name: 'app',
  setup() {
    console.log('1-开始创建组件-setup')
    const data = reactive({
      title: 'hello Vite'
    })
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
