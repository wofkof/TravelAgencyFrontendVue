<template>
  <el-dialog v-model="dialogFormVisible" title="新增項目" width="500" :close-on-click-modal="false" @closed="onDialogClosed">
    <el-form :model="form" :rules="formRules" ref="formRef"  :validate-on-rule-change="false">
      <el-form-item label="分類項目" prop="category" :label-width="formLabelWidth">
        <el-select v-model="form.category" placeholder="請選擇分類">
          <el-option label="住宿" :value="0" />
          <el-option label="景點" :value="1" />
          <el-option label="餐廳" :value="2" />
          <el-option label="交通" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="縣市" prop="city" :label-width="formLabelWidth" v-if="form.category !== category_transport">
        <el-select v-model="form.city" placeholder="請選擇縣市">
          <el-option v-for="c in city" :key="c.cityId" :label="c.cityName" :value="c.cityId" />
        </el-select>
      </el-form-item>
      <el-form-item label="區" prop="district" :label-width="formLabelWidth" v-if="form.category !== category_transport">
        <el-select v-model="form.district" placeholder="請選擇區">
          <el-option v-for="d in filteredDistricts" :key="d.districtId" :label="d.districtName" :value="d.districtId" />
        </el-select>
      </el-form-item>
      <el-form-item label="項目內容" prop="item" :label-width="formLabelWidth">
        <el-select v-model="form.item" placeholder="請選擇內容">
          <el-option v-for="i in filteredItems" :key="getItemId(i)" :label="getItemName(i)" :value="getItemId(i)" />
        </el-select>
      </el-form-item>
      <el-form-item label="時間" prop="time" :label-width="formLabelWidth">
        <el-time-select v-model="form.time" start="00:30" step="00:15" end="23:30" placeholder="請選擇時間" />
      </el-form-item>
      <el-form-item label="備註" :label-width="formLabelWidth">
        <el-input v-model="form.desc" type="textarea" autosize placeholder="備註" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submit">儲存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import api from '@/utils/api'

const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const formRef = ref()
const formRules = ref({})
const mode = ref('create')
const editState = reactive({ dayIndex: null, itemIndex: null })
const dialogJustCanceled = ref(false)
const dialogJustSubmitted = ref(false)

const city = ref([])
const district = ref([])
const attraction = ref([])
const restaurant = ref([])
const accommodation = ref([])
const transport = ref([])
const category_transport = 3

const form = reactive({
  category: null,
  city: null,
  district: null,
  item: null,
  time: '',
  desc: ''
})

const props = defineProps({
  onAdd: Function,
  onEdit: Function
})

onMounted(async () => {
  const [cityRes, districtRes, attractionRes, restaurantRes, accommodationRes, transportRes] = await Promise.all([
    api.get('/City'),
    api.get('/District'),
    api.get('/Attraction'),
    api.get('/Restaurant'),
    api.get('/Accommodation'),
    api.get('/Transport')
  ])
  city.value = cityRes.data
  district.value = districtRes.data
  attraction.value = attractionRes.data
  restaurant.value = restaurantRes.data
  accommodation.value = accommodationRes.data
  transport.value = transportRes.data
})

const filteredDistricts = computed(() => district.value.filter(d => d.cityId === form.city))
const filteredItems = computed(() => {
  switch (form.category) {
    case 0: return accommodation.value.filter(a => a.districtId === form.district)
    case 1: return attraction.value.filter(a => a.districtId === form.district)
    case 2: return restaurant.value.filter(r => r.districtId === form.district)
    case 3: return transport.value
    default: return []
  }
})

function getItemId(i) {
  return i.accommodationId || i.attractionId || i.restaurantId || i.transportId
}

function getItemName(i) {
  return i.accommodationName || i.attractionName || i.restaurantName || i.transportMethod
}

function clearForm() {
  Object.assign(form, {
    category: null,
    city: null,
    district: null,
    item: null,
    time: '',
    desc: ''
  })
  formRules.value = {}
  formRef.value?.resetFields()
}

function openCreate() {
  mode.value = 'create'
  clearForm()
  dialogFormVisible.value = false
  nextTick(() => dialogFormVisible.value = true)
}

function openEdit({ data, dayIndex, itemIndex }) {
clearForm()
  Object.assign(form, {
    category: data.category,
    // item: Array.isArray(data.item) ? data.item[0] : data.item,
    // city: Array.isArray(data.city) ? data.city[0] : data.city,
    // district: Array.isArray(data.district) ? data.district[0] : data.district,
    // time: Array.isArray(data.time) ? data.time[0] : data.time,
    item: data.item,
    city: data.city,
    district: data.district,
    time: data.time,
    desc: data.desc || ''
  })
  editState.dayIndex = dayIndex
  editState.itemIndex = itemIndex
  mode.value = 'edit'
  dialogFormVisible.value = false
  nextTick(() => dialogFormVisible.value = true)
}

function cancel() {
  dialogJustCanceled.value = true
  dialogFormVisible.value = false
  // clearForm()
}

function onDialogClosed() {
  // clearForm()
  if (dialogJustSubmitted.value || dialogJustCanceled.value) {
    clearForm()
    dialogJustSubmitted.value = false
    dialogJustCanceled.value = false
  }
}

function submit() {
  formRules.value = {
    category: [{ required: true, message: '請選擇類別', trigger: 'change' }],
    item: [{ required: true, message: '請選擇項目', trigger: 'change' }],
    time: [{ required: true, message: '請選擇時間', trigger: 'change' }]
  }

  if (form.category !== category_transport) {
    formRules.value.city = [{ required: true, message: '請選擇城市', trigger: 'change' }]
    formRules.value.district = [{ required: true, message: '請選擇區域', trigger: 'change' }]
  }

  nextTick(() => {
  formRef.value.validate(valid => {
    if (!valid) return
    const contentData = { ...form }
    if (mode.value === 'create') {
      props.onAdd({ ...contentData })
    } else if (mode.value === 'edit') {
      props.onEdit({ ...contentData, ...editState })
    }
    dialogFormVisible.value = false
    clearForm()
  })
})
}

defineExpose({ openCreate, openEdit })
</script>


<style scoped>
  </style>