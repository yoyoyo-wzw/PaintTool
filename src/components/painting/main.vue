<template>
	<div class="w-11/12 sm:w-3/4 h-[600px] flex justify-between flex-col border-8 border-gray-400 mx-auto">
		<PaintContainer />
		<PaintTool />
	</div>
</template>

<script lang="ts">
export default {
	name: 'Painting'
}
</script>

<script setup lang="ts">
import PaintContainer from './components/PaintContainer.vue'
import PaintTool from './components/PaintTool.vue'


</script>

<style lang="less" scoped>
</style>
