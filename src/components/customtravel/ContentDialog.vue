<template>
    <el-button plain @click="dialogFormVisible = true">
    Create Content
  </el-button>
  
  <el-dialog v-model="dialogFormVisible" title="Content" width="500">
    <el-form :model="form">
      <el-form-item label="category" :label-width="formLabelWidth">
        <el-select v-model="form.category" placeholder="Please select">
          <el-option label="景點" value="Attraction" />
        </el-select>
      </el-form-item>
      <el-form-item label="city" :label-width="formLabelWidth">
        <el-select v-model="form.city" placeholder="Please select a zone">
          <el-option label="Zone No.1" value="shanghai" />
        </el-select>
      </el-form-item>
      <el-form-item label="district" :label-width="formLabelWidth">
        <el-select v-model="form.district" placeholder="Please select a zone">
          <el-option label="Zone No.1" value="shanghai" />
        </el-select>
      </el-form-item>
      <el-form-item label="title" :label-width="formLabelWidth">
        <el-select v-model="form.title" placeholder="Please select a zone">
          <el-option label="Zone No.1" value="shanghai" />
        </el-select>
      </el-form-item>
      <el-form-item label="time" :label-width="formLabelWidth">
        <el-time-select v-model="form.time" start="00:30"  step="00:15"  end="23:30"  placeholder="Select time"/>
      </el-form-item> 
      <el-form-item label="desc" :label-width="formLabelWidth">
        <el-input  v-model="form.desc" autosize  type="textarea"    placeholder="Please input" />
      </el-form-item>      
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="create">
          Create
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
    
<script setup>
import { reactive, ref } from 'vue'

const dialogFormVisible = ref(false)
const formLabelWidth = '140px'

const form = reactive({
  category: '',
  city: '',
  district: '',
  title: '',
  time: '',
  desc: '',
})

const props = defineProps({
  onAdd: Function
})

const create = () => {
  props.onAdd({ 
    category: form.category,
    city: form.city,
    district: form.district,
    title: form.title,
    time: form.time,
    desc: form.desc
  })
  dialogFormVisible.value = false

  // 清空表單
  form.category = ''
  form.city = ''
  form.district = ''
  form.title = ''
  form.time = ''
  form.desc = ''
}


</script>
    
<style>
    
</style>