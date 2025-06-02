<!-- 訂單明細裡面 -->
<template>
  <el-card class="order-detail-card">
    <h2 class="title">訂單明細</h2>

    <el-card v-if="loading">
      <p>載入中...</p>
    </el-card>
    <el-card v-else-if="error">
      <p class="error-message">{{ error }}</p>
    </el-card>
    <el-descriptions key=2 :column="1" border="" v-else-if="selectedDocumentMenuItem">
      <el-descriptions-item label="商品名稱">
        <!-- 中華民國護照代辦-新辦/更換(14歲以上)-一般件 -->
          {{ selectedDocumentMenuItem.rocPassportOption }} - {{ selectedDocumentMenuItem.processingItem }} - {{ selectedDocumentMenuItem.caseType === 'general' ? '一般件' : '' }}
      </el-descriptions-item>

      <el-descriptions-item label="售價">
        <span class="price">
          <!-- TWD 1,700 -->
           {{ selectedDocumentMenuItem.fee }}
         </span>
      </el-descriptions-item>

      <el-descriptions-item label="辦理天數">
        <span class="highlight">
          <!-- 16個工作天 -->
            {{ selectedDocumentMenuItem.processingDays }}
        </span>
        （週六、週日及固定假日不算工作天）
      </el-descriptions-item>

      <el-descriptions-item label="證照效期">
        <!-- 10年 -->
         {{ selectedDocumentMenuItem.documentValidityPeriod }}
      </el-descriptions-item>

      <el-descriptions-item label="所需資料">
        <ol class="info-list">
          <li>身份證正本（1份）</li>
          <li>舊護照（1份）</li>
          <li>六個月內白底彩色照片（1份）</li>
          <li>未滿18歲需附上監護人文件</li>
          <li>委任書（1份）</li>
        </ol>
      </el-descriptions-item>

      <el-descriptions-item label="資料繳交方式">
        以掛號寄送至「104台北市中山區民生東路二段49號2樓」易遊網客服中心收。<br />
        <el-tag type="success">客服人員將於收件後一個工作日內確認</el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="備註">
        <ul class="note-list"> <li><a href="#">文件下載區</a></li>
        <li>申請人本人委任旅行社委任書⭐D式範例</li>
        </ul>
        <li>申請人委託代送件(受委任人)複委託委任書，另需檢附雙方關係證明(如下)⭐E式範例</li>
        <li>(註) 雙方關係證明需含有照片之相關證件(如同學代送提供雙方學生證影本)</li>
        <li>(註) 受委任人限親屬(三等親內)、配偶、同事、同學</li>
        <li>(註) 未滿18歲者若使用本人委任書，簽名欄位除本人簽名外，旁邊須簽上同所需提供資料第5點之監護人之簽名</li>
        <li>(註) 人在國外請務必用E式委任書</li>
        <li>已過期舊護照不用交</li>
        <li>護照申請需知</li>
        <li>照片規格說明</li>
        <li>照片補件，需兩張實體照片</li>
        <li>戶謄不退</li>

        <li><a href="#">首次申請</a></li>
        <li>1.須先至戶政事務所辦理人別確認後，始得委託代理人續向外交部代為申請</li>
        <li>2.未婚且未滿18歲申請人，首次申請須由父或母或監護人簽署護照同意書/委任陪同書</li>
        <li>3.經外交部查驗為首次申請但未做人別確認需撤件（照片及申請書不退還），需重新送件及工作天重新計算</li>

        <li><a href="#">其他注意事項</a></li>
        <li>年滿十四歲者應申請初領國民身分證</li>
        <li>未婚且未滿18歲之未成年人及受監護宣告申請護照，倘父母離婚或為受監護宣告人之監護人，父或母或監護人請提供有權行使、負擔權利義務之證明文件正本（如含詳細記事之戶口名簿或三個月內保留完整記事欄之戶籍謄本）及國民身分證正本</li>
        <li>更改姓氏或國民身分證號應申請換發新護照並提供三個月內所申請之詳細記事欄戶籍謄本正本</li>
        <li>更改中文姓名申請換發新護照，舊護照外文姓名必須列為新護照外文別名，已有外文別名者得以加簽方式辦理</li>
        <li>國軍人員出境應事先申請許可</li>
        <li>人在國外的役男無法辦理</li>
        <li>護照剩餘效期不足一年或所持護照非屬現行最新式樣者可申請換照</li>
        <li>護照污損或其他原因皆須附上聲明書正本，內容須載名更換原因並簽名</li>
        <li>刪除因改名被迫新增舊外文姓名至舊護照外文別名者，請A4填寫 (本人確認刪除外文別名，並了解以後取用別名須出示證明文件並簽名)</li>
        <li>舊護照外文名字音節中間無短橫，於護照申請書填寫外文姓名或別名欄位，格式請如右(姓氏, 名△字)並且於三角形下方簽名。</li>
        <li>新增外文別名，習用之外文別名（如Peter Lin、等）免附有關證件，但以後都不可修改和刪除。倘為特殊姓名者，須出示證明文件正本（國外護照或國外畢業證書或國外出生證明）</li>

        <li><a href="#">僑居身分移（加）簽須檢附</a></li>
        <li>(1) 原護照加簽僑居沿用需填寫僑居加簽申請書</li>
        <li>(2) 首次辦理加簽僑居者須提供，僑務委員會核准公函</li>
        <li>(3) 原已辦理僑居身分加簽之舊護照</li>
        <li>(4) 僑居國有效護照或永久居留證件</li>

        <li>辦事處有權依照申請個案之需要對申請人提出額外相關文件的要求</li>
        <li>辦事處依簽證主管判斷給予簽證，辦事處有權拒絕解釋拒給簽證之理由</li>
        <li>申請書上所填內容、檢附證件及照片請確實無訛，如有不實將產生法律責任</li>
        <li>已送件訂單不得改辦及撤件</li>
        <li>送件後需補件不補件或遭辦證處拒件者或一般件改急件(須詢問辦件人員)，收取手續費200元</li>
      </el-descriptions-item>
    </el-descriptions>
    <div v-else>
      <p>請先回選單頁選擇文件，或此文件不存在。</p>
    </div>
  </el-card>
</template>

<script setup>
import { onMounted } from 'vue';
import { useDocumentMenuStore } from '@/stores/documentMenuStore'; // 引入 Store
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router'; // 獲取路由參數

const documentMenuStore = useDocumentMenuStore();
const route = useRoute();
const { selectedDocumentMenuItem, loading, error } = storeToRefs(documentMenuStore);// 從 Store 中解構響應式狀態

onMounted(async () => {
  // 如果 Store 中沒有選定的文件，或者 Store 中的 ID 與路由 ID 不匹配
  // (這可能發生在直接透過 URL 存取或重新整理頁面時)
  if (!selectedDocumentMenuItem.value || selectedDocumentMenuItem.value.menuId !== parseInt(route.params.id)) {
    if (route.params.id) { // 確保路由參數中有 ID
      await documentMenuStore.ensureSelectedDocumentMenuItem(route.params.id);
    }
  }
});

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>

<style scoped>
.order-detail-card {
  /* 區塊的最大寬度 */
  max-width: 1400px;
  /* 頁面中水平置中 */
  margin: 0 auto;
  /* 這個區塊的內邊距 */
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.price {
  color: orange;
  font-weight: bold;
}

.highlight {
  color: orange;
}

.info-list, .note-list {
  padding-left: 20px;
}

.error-message {
  color: red;
  font-weight: bold;
}

.subtitle {
  font-size: 18px;
  margin-top: 30px;
}

</style>
