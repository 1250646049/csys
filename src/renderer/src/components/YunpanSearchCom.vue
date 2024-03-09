<template>
  <div class="yunpan">
    <div class="top">
      <SearchListComVue />
    </div>
    <div class="bottom">
      <!--输入框  -->
      <div class="search_input">
        <div class="plugs">
          <a-popover>
            <a-button class="select_plugs"
              >请选择插件 <icon-plus-circle-fill class="plus_icon"
            /></a-button>

            <template #content>
              <a-list size="small" :bordered="false">
                <a-list-item v-for="item in plugins" :key="item.id">
                  <a-checkbox @click="onChangeCheckBoxSelect(item)" v-model="item['select']">{{
                    item.label
                  }}</a-checkbox></a-list-item
                >
              </a-list>
            </template>
          </a-popover>
        </div>
        <a-input
          @keydown.enter="onSearchValue"
          class="input"
          placeholder="输入内容"
          v-model="searchValue"
        />
        <div class="utils">
          <icon-send
            v-if="!isSearch"
            @click="onSearchValue"
            class="send"
            :class="searchValue ? 'active' : ''"
          />
          <a-spin v-if="isSearch" :size="32" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent, getCurrentInstance, onMounted, computed } from 'vue'
import SearchListComVue from './SearchListCom.vue'
import { IconSend, IconPlusCircleFill } from '@arco-design/web-vue/es/icon'
import useSearch from '../store/search'
const store = useSearch()
const { $mitt } = getCurrentInstance().appContext.config.globalProperties
defineComponent({
  SearchListComVue
})

function useYunpanSearch() {
  const isSearch = ref(false)
  // 搜索内容字段
  const searchValue = ref('')
  // 搜索插件
  const plugins = computed(() => store.$state.plugins)
  const onSearchValue = function () {
    if (!searchValue.value) return
    isSearch.value = true
    // 触发派发事件
    $mitt.emit('onSearchValueRet', searchValue.value)
    searchValue.value = ''
  }

  //   初始化事件监听
  const initMitt = function () {
    // 搜索完成
    $mitt.on('retSearchResult', (flag) => {
      isSearch.value = false
    })
  }
  const onChangeCheckBoxSelect = function (item) {
    item['select'] = !item['select']
  }
  return {
    searchValue,
    onSearchValue,
    isSearch,
    initMitt,
    plugins,
    onChangeCheckBoxSelect
  }
}

const { searchValue, onSearchValue, isSearch, initMitt, plugins, onChangeCheckBoxSelect } =
  useYunpanSearch()

onMounted(() => {
  initMitt()
})
</script>

<style lang="scss" scoped>
.yunpan {
  .bottom {
    box-sizing: border-box;
    padding: 8px 10px;
    .search_input {
      height: 60px;
      margin-top: 10px;
      border-radius: 10px;
      // overflow: hidden;
      box-shadow: 1px 2px 2px 1px #ccc;
      position: relative;
      .input {
        height: 100%;
        background: white;
        border: none;
      }
      .utils {
        position: absolute;
        z-index: 99;
        right: 4px;
        bottom: 1px;
        .send {
          font-size: 26px;
          cursor: pointer;
          &.active {
            color: #4c78ec;
            font-weight: 700;
          }
        }
      }
      .plugs {
        position: absolute;
        left: 0;
        top: -40px;
        .select_plugs {
          background: #ffffff;
          .plus_icon {
            margin-left: 5px;
            font-size: 18px;
            color: #4c78ec;
          }
        }
      }
    }
  }
}
</style>
