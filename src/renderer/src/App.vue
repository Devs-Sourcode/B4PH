<script setup>
import { ref, reactive, onMounted } from 'vue'
import Toggle from '@vueform/toggle'

const NFWRStat = ref(false)
const pgLabel = ref('initializing..')
function api() {
  return reactive(window.api)
}
async function toggleNFWR(tValue) {
  try {
    pgLabel.value = 'Processing...'
    if (tValue) {
      // 진행중입니다.
      await api().createOrActiveNFWR() // await
      // 활성화 되었습니다.
      pgLabel.value = 'Enabled'
    } else {
      // 비활성화 중입니다.
      await api().disableNFWR() // await
      // 비활성화 되었습니다.
      pgLabel.value = 'Disabled'
    }
  } catch (error) {
    pgLabel.value = 'Error'
  }
}
function showContextMenu(event) {
  event.preventDefault()
  api().contextMenu()
}
onMounted(async () => {
  try {
    let isActiveNFWR = await api().isActiveNFWR()
    NFWRStat.value = isActiveNFWR
    isActiveNFWR ? (pgLabel.value = 'Enabled') : (pgLabel.value = 'Disabled')
  } catch (error) {
    pgLabel.value = 'Error'
  }
})
</script>

<template>
  <h1>BF4 Ping Hider</h1>
  <Toggle v-model="NFWRStat" @change="(val) => toggleNFWR(val)" />
  <p id="label">{{ pgLabel }}</p>
  <div id="footer">
    <i id="cog-context" class="fa-solid fa-gear" @click="showContextMenu"></i>
  </div>
</template>

<style lang="scss">
h1,
p {
  cursor: default;
  user-select: none;
}
#label {
  margin: 0;
  margin-top: 1em;
}
</style>
<style src="@vueform/toggle/themes/default.css"></style>
