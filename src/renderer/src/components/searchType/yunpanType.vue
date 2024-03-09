<template>
  <div class="yunpan">
    <div class="yunpan_container" v-if="list.length">
      <div v-show="index > 2" class="item" v-for="(item, index) in list" :key="index">
        <!-- 标题 -->
        <div class="title">
          <span>
            <img src="../../assets/icon/filetype_folder.png" alt="" />
          </span>
          <span class="html" v-html="item['title']"></span>
        </div>
        <!-- 文件列表项目 -->
        <div class="content" v-show="item['showFile']">
          <div class="fold_list" v-if="item['content']">
            <div class="fold_item" v-for="(items, indexs) in item['content']" :key="indexs">
              <span>
                <img
                  v-if="items['geshi'] == 'doc'"
                  src="../../assets/icon/filetype_doc.png"
                  alt=""
                />
                <img
                  v-if="items['geshi'] == 'mp4'"
                  src="../../assets/icon/filetype_video.png"
                  alt=""
                />
                <img
                  v-if="items['geshi'] == 'folder'"
                  src="../../assets/icon/filetype_folder.png"
                  alt=""
                />
                <img
                  v-if="item['geshi'] == 'txt'"
                  src="../../assets/icon/filetype_txt.png"
                  alt=""
                /> </span
              >{{ items['title'] }}
            </div>
          </div>

          <div class="bottom">
            <div class="tag"><span>有效期：</span>永久</div>
            <div class="tag"><span>目录：</span>{{ item['path'] }}</div>
            <div class="tag"><span>收录时间:</span>{{ item['insert_time'] }}</div>
          </div>
        </div>
        <div class="footer">
          <a-link
            style="margin-right: 10px"
            @click.prevent="onShowFileList(item)"
            href="link"
            status="primary"
            >{{ item['showFile'] ? '隐藏文件目录' : '展开文件目录' }}

            <icon-caret-down style="margin-left: 1px" v-if="!item['showFile']" />
            <icon-caret-up style="margin-left: 1px" v-if="item['showFile']" />
          </a-link>
          <a-link @click.prevent="onGetDownUrl(item['page_url'])" href="link" status="danger"
            >跳转链接</a-link
          >
        </div>
      </div>
    </div>

    <!-- 差不到数据 -->
    <div class="no_empty" v-else>
      <a-empty />
    </div>
    <!-- 分页  -->
    <a-spin v-if="isChangePage" />
    <a-pagination
      v-else
      :current="curIndex"
      @change="onChangePage"
      :total="100"
      simple
    ></a-pagination>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, watch, ref } from 'vue'
import { IconCaretDown, IconCaretUp } from '@arco-design/web-vue/es/icon'
const emits = defineEmits(['changePageIndex'])
const props = defineProps({
  list: {
    type: Array,
    default: []
  },
  index: {
    type: Number,
    default: 1
  },
  // 搜索内容
  title: {
    type: String,
    default: ''
  },
  // 当前搜索索引位置
  curIndex: {
    type: Number,
    default: 1
  }
})

function useYunpan() {
  const isChangePage = ref(false)
  const onGetDownUrl = function (url) {
    if (!url) return
    window.opDefaultUrl(url)
  }

  //   分页改变时候
  const onChangePage = function (index) {
    // 改变分页
    if (isChangePage.value) {
      return
    }
    isChangePage.value = true
    emits('changePageIndex', {
      index: props.index,
      pageIndex: index,
      title: props.title
    })
  }
  // 展开文件目录
  const onShowFileList = function (item) {
    item['showFile'] = !item['showFile']
  }
  return {
    onGetDownUrl,
    onChangePage,
    isChangePage,
    onShowFileList
  }
}
const { onGetDownUrl, onChangePage, isChangePage, onShowFileList } = useYunpan()

watch(props, (nv, ov) => {
  if (isChangePage.value) {
    isChangePage.value = false
  }
})
</script>

<style lang="scss" scoped>
.yunpan {
  position: relative;

  .item {
    margin: 15px 0;
    .title {
      font-size: 16px;
      display: flex;

      .html {
        width: 90%;
        display: block;
        margin-top: 1px;
        display: -webkit-box;

        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #50a1ff;
        font-weight: 600;
      }
      span {
        width: 20px;
        height: 20px;

        display: inline-block;
        margin-right: 4px;
        vertical-align: inherit;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
    .content {
      margin: 10px 8px;
      box-sizing: border-box;
      padding: 0 25px;
      background: #f8f8f8;
      transition: all 0.3s;
      .fold_list {
        max-height: 200px;
        overflow-y: scroll;
        &::-webkit-scrollbar {
          width: 0;
        }
        .fold_item {
          margin: 4px 0;
          font-size: 12px;
          color: #333;
          position: relative;
          &::before {
            content: '';
            position: absolute;
            left: -18px;
            height: 15px;
            width: 1px;
            background: #c1c1c1;
            top: 2px;
          }

          span {
            width: 14px;
            height: 14px;
            display: inline-block;
            margin-right: 10px;
            vertical-align: top;
            position: relative;
            &::before {
              content: '';
              position: absolute;
              left: -12px;
              height: 8px;
              width: 1px;
              background: #c1c1c1;
              transform: rotate(90deg);
              top: 5.5px;
            }
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
      .bottom {
        margin-top: 20px;
        margin-bottom: 10px;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        .tag {
          margin: 4px 0;
          span {
            font-weight: bold;
            margin-right: 4px;
          }
        }
      }
    }
    .footer {
      text-align: right;
    }
  }
}
</style>
