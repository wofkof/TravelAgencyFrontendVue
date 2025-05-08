<template>
  <el-dialog v-model="dialogFormVisible" title="Content" width="500" :close-on-click-modal="false" @closed="onDialogClosed">
    <el-form :model="form" :rules="computedRules" ref="formRef">
      <el-form-item label="category" prop="category" :label-width="formLabelWidth">
        <el-select v-model="form.category" placeholder="Please select">
          <el-option label="景點" :value="0" />
          <el-option label="餐廳" :value="1" />
          <el-option label="住宿" :value="2" />
          <el-option label="交通" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="city" prop="city" :label-width="formLabelWidth" v-if="form.category !== category_transport">
        <el-select v-model="form.city" placeholder="Select city">
          <el-option v-for="c in city" :key="c.cityId" :label="c.cityName" :value="c.cityId" />
        </el-select>
      </el-form-item>
      <el-form-item label="district" prop="district" :label-width="formLabelWidth" v-if="form.category !== category_transport">
        <el-select v-model="form.district" placeholder="Select district">
          <el-option v-for="d in filteredDistricts" :key="d.districtId" :label="d.districtName" :value="d.districtId" />
        </el-select>
      </el-form-item>
      <el-form-item label="item" prop="item" :label-width="formLabelWidth">
        <el-select v-model="form.item" placeholder="Select item">
          <el-option v-for="i in filteredItems" :key="getItemId(i)" :label="getItemName(i)" :value="getItemId(i)" />
        </el-select>
      </el-form-item>
      <el-form-item label="time" prop="time" :label-width="formLabelWidth">
        <el-time-select v-model="form.time" start="00:30" step="00:15" end="23:30" placeholder="Select time" />
      </el-form-item>
      <el-form-item label="desc" :label-width="formLabelWidth">
        <el-input v-model="form.desc" type="textarea" autosize placeholder="Please input" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">Cancel</el-button>
        <el-button type="primary" @click="submit">儲存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'

const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const formRef = ref()
const mode = ref('create')
const editState = reactive({ dayIndex: null, itemIndex: null })
const suppressWatch = ref(false)

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
    axios.get('https://localhost:7265/api/City'),
    axios.get('https://localhost:7265/api/District'),
    axios.get('https://localhost:7265/api/Attraction'),
    axios.get('https://localhost:7265/api/Restaurant'),
    axios.get('https://localhost:7265/api/Accommodation'),
    axios.get('https://localhost:7265/api/Transport')
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
    case 0: return attraction.value.filter(a => a.districtId === form.district)
    case 1: return restaurant.value.filter(r => r.districtId === form.district)
    case 2: return accommodation.value.filter(a => a.districtId === form.district)
    case 3: return transport.value
    default: return []
  }
})

function getItemId(i) {
  return i.attractionId || i.restaurantId || i.accommodationId || i.transportId
}

function getItemName(i) {
  return i.attractionName || i.restaurantName || i.accommodationName || i.transportMethod
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
  formRef.value?.resetFields()
}

function openCreate() {
  mode.value = 'create'
  clearForm()
  dialogFormVisible.value = false
  nextTick(() => dialogFormVisible.value = true)
}

function openEdit({ data, dayIndex, itemIndex }) {
  suppressWatch.value = true
  clearForm()
  const parsedData = {
    category: data.category,
    item: Array.isArray(data.item) ? data.item[0] : data.item,
    city: Array.isArray(data.city) ? data.city[0] : data.city,
    district: Array.isArray(data.district) ? data.district[0] : data.district,
    time: Array.isArray(data.time) ? data.time[0] : data.time,
    desc: data.desc || ''
  }
  Object.assign(form, parsedData)
  editState.dayIndex = dayIndex
  editState.itemIndex = itemIndex
  mode.value = 'edit'
  dialogFormVisible.value = false
  nextTick(() => dialogFormVisible.value = true)
  suppressWatch.value = false
}

function cancel() {
  dialogFormVisible.value = false
  clearForm()
}

function onDialogClosed() {
  clearForm()
}

const computedRules = computed(() => {
  const rules = {
    category: [{ required: true, message: '請選擇類別', trigger: 'change' }],
    item: [{ required: true, message: '請選擇項目', trigger: 'change' }],
    time: [{ required: true, message: '請選擇時間', trigger: 'change' }]
  }
  if (form.category !== 3) {
    rules.city = [{ required: true, message: '請選擇城市', trigger: 'change' }]
    rules.district = [{ required: true, message: '請選擇區域', trigger: 'change' }]
  }
  return rules
})

function submit() {
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
}

defineExpose({ openCreate, openEdit })
</script>


<style>
    
  </style>