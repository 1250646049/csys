<template>
  <div class="detail" v-if="bookData">
    <HeaderCom
      :header-title="bookData['bookTitle'] ? '正在阅读: ' + bookData['bookTitle'] : ''"
      :show-other="false"
      :fex-show-bg="true"
    />
    <div class="conter">
      <div class="left">
        <img :src="bookData['bookPic']" alt="" />
      </div>

      <div class="right">
        <div class="titles">
          <span v-if="bookData['bookTitle']">{{ bookData['bookTitle'] }}</span>
          <span v-if="bookData['bookAuthor']">{{ bookData['bookAuthor'] }}</span>
        </div>
        <div class="conten">
          {{ bookData['bookContent'] }}
        </div>
        <div class="bottom" v-if="bookData['bookTitle']">
          <!-- todo -->
          <a-button @click="onGoOnRead" type="primary">{{
            storeData ? '继续阅读' : '立即阅读'
          }}</a-button>
          <a-button @click="onAddReadList" type="danger">加入书架</a-button>
        </div>
      </div>
    </div>
    <div class="footer">
      <a-tabs animation>
        <a-tab-pane key="1">
          <template #title> <icon-calendar /> <span style="color: white">作品信息</span> </template>
          <div class="book_detail">
            <div v-if="bookData['bookAttribute1']" class="item">
              {{ bookData['bookAttribute1'] }}
            </div>
            <div v-if="bookData['bookAttribute2']" class="item">
              {{ bookData['bookAttribute2'] }}
            </div>
            <div v-if="bookData['bookAttribute3']" class="item">
              {{ bookData['bookAttribute3'] }}
            </div>

            <div
              @click="
                onStartReadBook({
                  url: storeData['curUrl']
                })
              "
              v-if="storeData"
              style="font-size: 12px; color: orangered; cursor: pointer"
            >
              <span style="margin-top: 4px">上次看到：</span> {{ storeData['readTitle'] }}
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2">
          <template #title>
            <icon-clock-circle />
            <span v-if="bookData['bookList']" style="color: white"
              >全部章节({{ bookData['bookList'].length }})</span
            ></template
          >

          <div class="zjie">
            <div class="zjie_title">正文</div>
            <div v-if="bookData['bookList'] && bookData['bookList'].length" class="zjie_content">
              <span
                @click="onStartReadBook(item)"
                v-for="(item, index) in bookData['bookList']"
                :key="index"
                >{{ item['txt'] }}</span
              >
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup>
const { ipcRenderer } = require('electron')
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderCom from '../components/HeaderCom.vue'
import useStore from '../store/history'
import { Message } from '@arco-design/web-vue'
import '@arco-design/web-vue/'
const route = useRoute()
const router = useRouter()
const hisotyrStore = useStore()
defineComponent({
  HeaderCom
})
function useBookDetail() {
  const bookData = ref({})
  const pageurl = ref(null)
  const readType = ref(null)
  const storeData = ref(null)
  // 操作类型 如果是历史点进来 执行跳转
  const showType = ref(null)
  const initData = function () {
    const { url, type, opType } = route.query
    pageurl.value = url
    readType.value = type
    showType.value = opType

    ipcRenderer.invoke('BookSpiderDetailEvent', { url: url, type: type })

    initMitt()
  }
  // 初始化事件监听
  const initMitt = function () {
    // 初始化监听器
    ipcRenderer.once('BookSpiderDetailListener', function (event, data) {
      if (data) {
        bookData.value = JSON.parse(data)
        let listResult = hisotyrStore.selectReadListById({
          author: bookData.value['bookAuthor'],
          readType: readType.value,
          bookTitle: bookData.value['bookTitle']
        })
        
        storeData.value = listResult.length
          ? listResult.find((item) => item['type'] == 'history')
          : null
     
        if (showType.value == 'history' && listResult.length) {
          // 如果是阅读历史的话 则直接跳转阅读继续看
          let result = listResult.find((item) => item['type'] == 'history')
       
          const { name } = router['form']
          if (result && name !== 'bookRead') {
            Message.info(`您将继续阅读: ${result['readTitle']} 的内容`)
            router.push({
              name: 'bookRead',
              query: {
                type: readType.value,
                url: result['curUrl'],
                bookPic: result['bookPic'],
                bookAuthor: result['author'],
                detailUrl: pageurl.value
              }
            })
            // router.go(0)
          }
        }
      }
    })
  }

  // 移除事件监听
  const removeMitt = () => {
    ipcRenderer.removeListener('BookSpiderDetailListener', () => {})
  }

  // onGoOnRead
  const onGoOnRead = function () {
    let url = ''
    let pic = ''
    let bookAuthor = ''
    if (storeData.value) {
      // 继续阅读
      url = storeData.value['curUrl']
      pic = storeData.value['bookPic']
      bookAuthor = storeData.value['author']
    } else {
      let lists = bookData.value['bookList']
      if (!lists || lists.length == 0) return
      const item = lists[0]
      url = item['url']
      pic = bookData.value['bookPic']
      bookAuthor = bookData.value['bookAuthor']
    }
    router.push({
      name: 'bookRead',
      query: {
        type: readType.value,
        url: url,
        bookPic: pic,
        bookAuthor: bookAuthor,
        detailUrl: pageurl.value
      }
    })
  }
  // 开始去阅读页面
  const onStartReadBook = function (item) {
    router.push({
      name: 'bookRead',
      query: {
        type: readType.value,
        url: item['url'],
        bookPic: bookData.value['bookPic'],
        bookAuthor: bookData.value['bookAuthor'],
        detailUrl: pageurl.value
      }
    })
  }
  // 加入阅读书架
  const onAddReadList = function () {
    let flag = hisotyrStore.addReadHistory({
      readType: readType.value,
      type: 'record',
      bookPic: bookData.value['bookPic'],
      bookTitle: bookData.value['bookTitle'],
      // 当前阅读的内容
      author: bookData.value['bookAuthor'],
      detailPageUrl: pageurl.value
    })
    if (flag) {
      Message.success(`《${bookData.value['bookTitle']}》 加入书架成功`)
    } else {
      Message.info(`《${bookData.value['bookTitle']}》 已经存在咯~`)
    }
  }
  return {
    initData,
    bookData,
    onStartReadBook,
    removeMitt,
    onAddReadList,
    storeData,
    onGoOnRead
  }
}
const { initData, bookData, onStartReadBook, removeMitt, onAddReadList, storeData, onGoOnRead } =
  useBookDetail()
onMounted(() => {
  initData()
})

onBeforeUnmount(() => {
  removeMitt()
})
</script>

<style lang="scss" scoped>
.detail {
  box-sizing: border-box;
  background: #2f2f37;
  overflow: hidden;
  height: 100%;
  .conter {
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    margin-top: 50px;
    .left {
      margin-right: 20px;
      img {
        width: 100px;
        height: 140px;

        &:hover {
          transform: scale(1.2);
        }
      }
    }
    .right {
      margin-left: 10px;
      .titles {
        span {
          &:first-child {
            color: white;
            font-size: 16px;
          }
          &:last-child {
            margin-left: 20px;
            font-size: 12px;
            color: white;
          }
        }
      }
      .conten {
        margin-top: 10px;
        margin-bottom: 10px;
        color: white;
        font-size: 12px;
        line-height: 23px;
        text-indent: 2rem;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bottom {
        .arco-btn {
          margin-right: 10px;
        }
      }
    }
  }
  .footer {
    margin-top: 10px;
    .book_detail {
      padding: 10px;
      color: white;

      div {
        margin: 10px 0;
        font-size: 13px;
      }
    }
    .zjie {
      padding: 10px;
      .zjie_title {
        color: #2974ab;
        font-size: 14px;
        font-weight: 600;
      }
      .zjie_content {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        overflow-y: scroll;
        max-height: 400px;
        span {
          margin-right: 20px;
          cursor: pointer;
          color: white;
          flex: 16%;
          margin-bottom: 10px;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
