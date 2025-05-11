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

    <div v-for="(t, index) in travelers" :key="t.id" class="border border-gray-200 rounded-md mb-3">
      <div
        class="bg-gray-100 px-4 py-3 cursor-pointer flex justify-between items-center"
        @click="toggleAccordion(t.id)"
      >
        <h3 class="font-semibold">旅客 {{ index + 1 }}：{{ t.chineseName }}</h3>
        <span>{{ expandedTravelerId === t.id ? '▲' : '▼' }}</span>
      </div>

      <div v-show="expandedTravelerId === t.id" class="px-4 py-3">
        <p><strong>出生年月日：</strong>{{ t.birthDate }}</p>
        <!-- 可以依需求加上更多欄位 -->
        <div class="mt-3 flex gap-4">
          <button @click="viewTraveler(t)" class="text-gray-700 hover:underline">查看</button>
          <button @click="editTraveler(t)" class="text-blue-600 hover:underline">編輯</button>
          <button @click="deleteTraveler(t.id)" class="text-red-600 hover:underline">刪除</button>
        </div>
      </div>
    </div>

    <!-- 彈出 Modal 表單 -->
    <TravelerFormModal
      v-if="showForm"
      :traveler="selectedTraveler"
      :isEditing="isEditing"
      :isReadonly="isReadonly"
      @save="handleSave"
      @close="closeModal"
    />
  </div>

</template>

<script>
import TravelerFormModal from './TravelerFormModal.vue'

export default {
  components: { TravelerFormModal },
  data() {
    return {
      travelers: [],
      showForm: false,
      selectedTraveler: {},
      isEditing: false,
      isReadonly: false,
      expandedTravelerId: null // 控制展開的旅客
    }
  },
  methods: {
    // ✅ 關鍵補回的 toggleAccordion 方法
    toggleAccordion(id) {
      this.expandedTravelerId = this.expandedTravelerId === id ? null : id
    },
    handleAdd() {
      this.selectedTraveler = {}
      this.isEditing = false
      this.isReadonly = false
      this.showForm = true
    },
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
