<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">常用旅客清單</h2>
      <button
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
        @click="handleAdd"
        :disabled="travelers.length >= 20"
      >
        新增旅客
      </button>
    </div>

    <div v-if="travelers.length === 0" class="text-center text-gray-500 py-4">
      尚無旅客資料
    </div>

     <div
        v-for="(t, index) in travelers"
        :key="t.id"
        class="border border-gray-200 rounded-md mb-3"
      >
      <div
        class="bg-gray-100 px-4 py-3 cursor-pointer flex justify-between items-center"
        @click="toggleAccordion(t.id)"
      >
    <h3 class="font-semibold">旅客 {{ index + 1 }}：{{ t.chineseName }}</h3>
    <p><strong>生日：</strong>{{ formatDate(t.birthDate) }}</p>
    <span>{{ expandedTravelerId === t.id ? '關閉▲' : '編輯▼' }}</span>
  </div>

  <div v-show="expandedTravelerId === t.id" class="px-4 py-3 space-y-3">
    <div class="flex gap-6">
      <div class="col">
      <label>姓名</label><br />
      <el-input v-model="t.chineseName" style="width: 240px" placeholder="請輸入姓名" />
    </div>

    <div class="col">
      <label>生日</label><br />
       <el-date-picker
      v-model="t.birthDate"
      type="date"
      placeholder="請選擇出生日期"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      style="width: 240px"
    />
    </div>
  
    </div>
    <div class="flex gap-6">
      <div class="col">
      <label>身分證字號(旅遊保險辦理使用)</label><br />
      <el-input v-model="t.idNumber" style="width: 240px" placeholder="請輸入身分證字號" />
    </div>

    <div class="col">
      <label>性別</label><br />
      <el-select v-model="t.gender" placeholder="請選取性別" style="width: 240px">
        <el-option label="男性" value="男" />
        <el-option label="女性" value="女" />
        <el-option label="其他" value="其他" />
      </el-select>
    </div>
    </div>
    <div class="flex gap-6">
       <div class="col">
      <label>聯絡手機(行程相關資訊聯繫)</label><br />
      <el-input v-model="t.phone" style="width: 240px" placeholder="請輸入手機號碼" />
      </div>
      <div class="col">
      <label>信箱</label><br />
      <el-input v-model="t.email" style="width: 240px" placeholder="請輸入聯絡信箱" />
      </div>
    </div>
     <div class="flex gap-6">
        <div class="col">
      <label>證件類別</label><br />
      <el-select v-model="t.documentType" placeholder="請選取證件" style="width: 240px">
        <el-option label="護照" value="護照" />
        <el-option label="居留證" value="居留證" />
        <el-option label="台胞證" value="台胞證" />
      </el-select>
      </div>

      <div class="col">
      <label>證件號碼</label><br />
      <el-input v-model="t.documentNumber" style="width: 240px" placeholder="請輸入證件號碼" />
      </div>
      </div>
      <div class="flex gap-4">
        <div class="col">
      <label>護照英文姓(Surname)</label><br />
      <el-input v-model="t.passportSurname" style="width: 240px" placeholder="例:CHEN" />
      </div>

      <div class="col">
      <label>護照英文名(Givenname)</label><br />
      <el-input v-model="t.passportGivenname" style="width: 240px" placeholder="例:HUATING" />
      </div>
      <div class="col">
      <label>護照到期日</label><br />
       <el-date-picker
      v-model="t.passportExpireDate"
      type="date"
      placeholder="請選擇護照到期日"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      style="width: 240px"
    />
      </div>
      </div>
      
    <div class="mt-3 flex justify-end">
      <el-button @click="saveTraveler(t)" type="primary">儲存</el-button>
       <el-button  @click="deleteTraveler(t.id)" type="danger" plain>刪除</el-button>
    </div>
  </div>
</div>
  </div>

</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      travelers: [],
      showForm: false,
      selectedTraveler: {},
      isEditing: false,
      isReadonly: false,
      expandedTravelerId: null
    }
  },
  mounted() {
    this.fetchTravelers() // ✅ 一進頁面就載入會員的常用旅客
  },
  methods: {
    toggleAccordion(id) {
      this.expandedTravelerId = this.expandedTravelerId === id ? null : id
    },
    async fetchTravelers() {
      const memberId = localStorage.getItem('memberId') 
      console.log('🔍 抓到登入者ID：', memberId)
      try {
        const res = await axios.get(`https://localhost:7265/api/FavoriteTraveler/${memberId}`)
        this.travelers = res.data.map(t => ({
          ...t,
          id: t.favoriteTravelerId, // ✅ 用於畫面顯示與編輯切換
          chineseName: t.name
        }))
      } catch (err) {
        console.error('載入旅客資料失敗', err)
      }
    },
    async saveTraveler(t) {
  console.log('✅ 儲存觸發了', t)
  const memberId = localStorage.getItem('memberId')
  if (!memberId) {
    alert('請先登入會員')
    return
  }

  // ⭐️ Enum 對應轉換（前端選擇是字串，後端要 enum）
  const genderMap = {
    男: 0,
    女: 1,
    其他: 2
  }

  const documentTypeMap = {
    護照: 0,
    居留證: 1,
    台胞證: 2
  }

  const payload = {
    favoriteTravelerId: t.favoriteTravelerId,
    memberId: Number(memberId),
    name: t.chineseName,
    phone: t.phone,
    idNumber: t.idNumber,
    birthDate: t.birthDate,
    gender: genderMap[t.gender] ?? null, // ✅ 後端是 enum，不能傳字串
    email: t.email,
    documentType: documentTypeMap[t.documentType] ?? null,
    documentNumber: t.documentNumber,
    passportSurname: t.passportSurname,
    passportGivenName: t.passportGivenname,
    passportExpireDate: t.passportExpireDate,
    nationality: '',
    note: ''
  }

  console.log('📦 要送出的資料:', payload)

  try {
    if (!t.favoriteTravelerId) {
      await axios.post(`https://localhost:7265/api/FavoriteTraveler`, payload)
    } else {
      await axios.put(`https://localhost:7265/api/FavoriteTraveler/${t.favoriteTravelerId}`, payload)
    }
    await this.fetchTravelers()
    this.expandedTravelerId = null
  } catch (err) {
    console.error('❌ 儲存失敗', err.response?.data || err)
  }
}
,
    handleAdd() {
      const isEditing = this.travelers.some(t => !t.favoriteTravelerId) // ✅ 防止新增多筆未儲存
      if (isEditing) {
        alert('請先完成目前旅客的儲存，再新增新旅客')
        return
      }

       const newTraveler = {
    id: Date.now(), // ✅ 前端暫存用的 id，不傳到後端
    favoriteTravelerId: null,
    chineseName: '',
    birthDate: '',
    idNumber: '',
    gender: '',
    phone: '',
    passportSurname: '',
    passportGivenname: '',
    documentType: '',
    documentNumber: '',
    //email: '',
    //passportExpireDate: '',
    //nationality: '',
    //note: ''
  }

  this.travelers.push(newTraveler)
  this.expandedTravelerId = newTraveler.id
    },
    async deleteTraveler(id) {
      const traveler = this.travelers.find(t => t.id === id)
      if (!traveler || !traveler.favoriteTravelerId) {
        this.travelers = this.travelers.filter(t => t.id !== id) // ✅ 尚未儲存者直接從前端刪除
        return
      }

      if (confirm('確定要刪除這位旅客嗎？')) {
        try {
          await axios.delete(`https://localhost:7265/api/FavoriteTraveler/${traveler.favoriteTravelerId}`)
          await this.fetchTravelers()
        } catch (err) {
          console.error('刪除失敗', err)
        }
      }
    },
    closeModal() {
      this.showForm = false
      this.isEditing = false
      this.isReadonly = false
    },
    formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.split('T')[0] // ✅ 僅取出日期部分
}

  }
}

</script>
