<template>
  <div class="h-[50px] flex items-center justify-center border-t border-gray-400">
    <i 
      v-for="item in toolIcons"
      :title="item.name"
      :key="item.type"
      class="text-xl sm:text-[24px] px-[8px] cursor-pointer hover:bg-cyan-400 iconfont"
      :class="{[item.icon]: true, 'bg-cyan-400': item.type === toolType}"
      @click="changeTool(item)"
    ></i>
  </div>
</template>

<script lang='ts'>
export default {
  name: 'PaintTool'
}
</script>

<script setup lang='ts'>
import { readonly, ref } from 'vue'
import bus from '@/utils/eventbus'
import { TOOLTYPE, DEFAULTTOOL } from '@/utils/enum'

interface Icon {
	icon: string,
	name: string,
	type: string
}
const toolIcons = readonly([
	{ icon: 'icon-cursor', name: '选择', type: TOOLTYPE.CURSOR },
	{ icon: 'icon-huabi', name: '画笔', type: TOOLTYPE.HUABI },
	{ icon: 'icon-juxing', name: '矩形', type: TOOLTYPE.JUXING },
	{ icon: 'icon-yuanquan', name: '圆圈', type: TOOLTYPE.YUANQUAN },
	{ icon: 'icon-jiantou', name: '箭头', type: TOOLTYPE.JIANTOU },
	{ icon: 'icon-xuhao', name: '序号', type: TOOLTYPE.XUHAO },
	{ icon: 'icon-qingkong', name: '清空', type: TOOLTYPE.CLEAR },
])

const toolType = ref(DEFAULTTOOL)
const changeTool = (icon: Icon) => {
  if (icon.type !== TOOLTYPE.CLEAR) {
    toolType.value = icon.type
  }
  bus.$emit('toolType:update', icon.type)
}

</script>

<style lang='less' scoped>
</style>