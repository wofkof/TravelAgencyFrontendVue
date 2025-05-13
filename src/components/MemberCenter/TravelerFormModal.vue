<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">

      <!-- 關閉按鈕 -->
      <button @click="$emit('close')" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">
        ✕
      </button>

      <h2 class="text-xl font-semibold mb-4">
        {{ isReadonly ? '查看旅客' : (isEditing ? '編輯旅客' : '新增旅客') }}
      </h2>

      <form @submit.prevent="handleSubmit">
        <!-- 查看模式 -->
        <div v-if="isReadonly" class="grid md:grid-cols-2 gap-4">
          <div v-for="(label, key) in labels" :key="key">
            <label class="block text-sm text-gray-500">{{ label }}</label>
            <p class="mt-1 text-gray-800">{{ form[key] || '—' }}</p>
          </div>
        </div>

        <!-- 編輯或新增模式 -->
        <div v-else class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium">中文姓名 *</label>
            <input v-model="form.chineseName" class="mt-1 block w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium">出生年月日 *</label>
            <input v-model="form.birthDate" type="date" class="mt-1 block w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium">身分證字號</label>
            <input v-model="form.idNumber" class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">性別</label>
            <select v-model="form.gender" class="mt-1 block w-full border rounded px-3 py-2">
              <option>男性</option>
              <option>女性</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium">聯絡手機</label>
            <input v-model="form.phone" class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">聯絡信箱</label>
            <input v-model="form.email" type="email" class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">證件類型</label>
            <select v-model="form.passportType" class="mt-1 block w-full border rounded px-3 py-2">
              <option value="">請選擇</option>
              <option>護照</option>
              <option>居留證</option>
              <option>台胞證</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium">證件號碼</label>
            <input v-model="form.passportNumber" class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium">居住地址</label>
            <input v-model="form.address" class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
        </div>

        <!-- 按鈕區 -->
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100">
            {{ isReadonly ? '關閉' : '取消' }}
          </button>
          <button
            v-if="!isReadonly"
            type="submit"
            class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            儲存
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script>
export default {
  props: {
    traveler: Object,
    isEditing: Boolean,
    isReadonly: Boolean
  },
  emits: ['close', 'save'],
  data() {
    return {
      form: { ...this.traveler } || {},
      labels: {
        chineseName: '中文姓名',
        birthDate: '出生年月日',
        idNumber: '身分證字號',
        gender: '性別',
        phone: '聯絡手機',
        email: '聯絡信箱',
        passportType: '證件類型',
        passportNumber: '證件號碼',
        address: '居住地址'
      }
    }
  },
  methods: {
    handleSubmit() {
      const travelerData = {
        ...this.form,
        id: this.form.id || crypto.randomUUID()
      }
      this.$emit('save', travelerData)
    }
  }
}
</script>
