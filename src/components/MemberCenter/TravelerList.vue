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

    <table class="w-full table-auto border">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="px-4 py-2">中文姓名</th>
          <th class="px-4 py-2">出生年月日</th>
          <th class="px-4 py-2 text-center">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in travelers" :key="t.id">
          <td class="px-4 py-2">{{ t.chineseName }}</td>
          <td class="px-4 py-2">{{ t.birthDate }}</td>
          <td class="px-4 py-2 text-center">
            <button @click="viewTraveler(t)" class="text-gray-700 hover:underline mr-2">查看</button>
            <button @click="editTraveler(t)" class="text-blue-600 hover:underline mr-2">編輯</button>
            <button @click="deleteTraveler(t.id)" class="text-red-600 hover:underline">刪除</button>
          </td>
        </tr>
        <tr v-if="travelers.length === 0">
          <td colspan="3" class="text-center py-4 text-gray-500">尚無旅客資料</td>
        </tr>
      </tbody>
    </table>

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
      isReadonly: false
    }
  },
  methods: {
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
