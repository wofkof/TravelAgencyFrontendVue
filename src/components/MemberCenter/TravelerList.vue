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
    <p><strong>生日：</strong>{{ t.birthDate }}</p>
    <span>{{ expandedTravelerId === t.id ? '關閉▲' : '編輯▼' }}</span>
  </div>

  <div v-show="expandedTravelerId === t.id" class="px-4 py-3 space-y-3">
    <div class="flex gap-6">
      <div class="col">
      <label>中文姓名</label><br />
      <el-input v-model="t.chineseName" style="width: 240px" placeholder="請輸入姓名" />
    </div>

    <div class="col">
      <label>出生年月日</label><br />
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
    <div class="flex gap-4">
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

      <div class="col">
      <label>聯絡手機(行程相關資訊聯繫)</label><br />
      <el-input v-model="t.phone" style="width: 240px" placeholder="請輸入手機號碼" />
      </div>
    </div>
    
      <div class="flex gap-6">
        <div class="col">
      <label>護照英文姓(Surname)</label><br />
      <el-input v-model="t.passportSurname" style="width: 240px" placeholder="例:CHEN" />
      </div>

      <div class="col">
      <label>護照英文名(Givenname)</label><br />
      <el-input v-model="t.passportGivenname" style="width: 240px" placeholder="例:HUATING" />
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
      
    <div class="mt-3 flex justify-end">
      <el-button @click="saveTraveler(t)" type="primary">儲存</el-button>
       <el-button  @click="deleteTraveler(t.id)" type="danger" plain>刪除</el-button>
    </div>
  </div>
</div>
  </div>

</template>

<script>
import {
  Check,
  Delete,
  Edit,
  Message,
  Search,
  Star,
} from '@element-plus/icons-vue'

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
  methods: {
    toggleAccordion(id) {
      this.expandedTravelerId = this.expandedTravelerId === id ? null : id
    },
    saveTraveler(t) {
  console.log('儲存資料:', t)
  this.expandedTravelerId = null
},
    handleAdd() {
  const newTraveler = {
    id: Date.now(),
    chineseName: '',
    birthDate: '',
    idNumber: '',
    gender: '',
    phone: '',
    passportSurname: '',
    passportGivenname: '',
    documentType: '',
    documentNumber: ''
  }

  this.travelers.push(newTraveler)
  this.expandedTravelerId = newTraveler.id
}
,
    editTraveler(traveler) {
      this.selectedTraveler = { ...traveler }
      this.isEditing = true
      this.isReadonly = false
      this.showForm = true
    },
    viewTraveler(traveler) {
      this.selectedTraveler = { ...traveler }
      this.isEditing = false
      this.isReadonly = true
      this.showForm = true
    },
    deleteTraveler(id) {
      if (confirm('確定要刪除這位旅客嗎？')) {
        this.travelers = this.travelers.filter(t => t.id !== id)
      }
    },
    
    handleSave(traveler) {
      const existing = this.travelers.findIndex(t => t.id === traveler.id)
      if (existing > -1) {
        this.travelers.splice(existing, 1, traveler)
      } else {
        this.travelers.push(traveler)
      }
      this.showForm = false
    },
    closeModal() {
      this.showForm = false
      this.isEditing = false
      this.isReadonly = false
    }
  }
}
</script>
