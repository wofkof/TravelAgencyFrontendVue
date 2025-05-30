<!-- src/components/FilterBar.vue -->
<template>

  <div class="text-left p-4 text-lg">
    <h1 class="text-xl font-semibold">類型</h1>
    <input type="checkbox" name="" id=""> 國內旅遊<br>
    <input type="checkbox" name="" id=""> 國外旅遊<br>
    <input type="checkbox" name="" id=""> 郵輪旅遊
    <hr class="my-2" />
    <h1 class="text-xl font-semibold">預算</h1>
    <div ref="slider" class="slider"></div>
    <div class="input-fields">
      <div>
        <label>最低</label>
        <input
          type="number"
          v-model.number="localRange[0]"
          @input="updateSliderFromInput"
        />
      </div>
      <span>-</span>
      <div>
        <label>最高</label>
        <input
          type="number"
          v-model.number="localRange[1]"
          @input="updateSliderFromInput"
        />
      </div>
    </div>
    <hr class="my-2"/>
    <h1 class="text-xl font-semibold">旅遊天數</h1>
    <input type="checkbox" name="" id=""> 1-4<br>
    <input type="checkbox" name="" id=""> 5-9<br>
    <input type="checkbox" name="" id=""> 10-14<br>
    <input type="checkbox" name="" id=""> 其他
    <hr class="my-2"/>
  </div>

</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import noUiSlider from 'nouislider';
import '@/../node_modules/nouislider/dist/nouislider.css';

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 800000
  },
  step: {
    type: Number,
    default: 1000
  }
})

const emit = defineEmits(['update:modelValue'])

const slider = ref(null)
const localRange = ref([...props.modelValue])

onMounted(() => {
  noUiSlider.create(slider.value, {
    start: localRange.value,
    connect: true,
    range: {
      min: props.min,
      max: 800000
    },
    step: props.step,
    format: {
      to: value => Math.round(value),
      from: value => Number(value)
    }
  })

  slider.value.noUiSlider.on('update', (values) => {
    localRange.value = values.map(Number)
  })

  slider.value.noUiSlider.on('change', (values) => {
    emit('update:modelValue', values.map(Number))
  })
})

watch(() => props.modelValue, (newVal) => {
  localRange.value = [...newVal]
  if (slider.value?.noUiSlider) {
    slider.value.noUiSlider.set(newVal)
  }
})

watch(() => props.max, (newMax) => {
  if (slider.value?.noUiSlider) {
    slider.value.noUiSlider.updateOptions({
      range: {
        min: props.min,
        max: newMax
      }
    }, false) // 更新但不重設滑桿位置
  }
})

const updateSliderFromInput = () => {
  slider.value.noUiSlider.set(localRange.value)
  emit('update:modelValue', [...localRange.value])
}
</script>

<style scoped>
.budget-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label {
  font-weight: bold;
  margin-bottom: 5px;
}

.slider {
  margin: 10px 0;
}

/* ⬇ 把手樣式 */
::v-deep(.noUi-handle) {
  border-radius: 50%;
  width: 21px;
  height: 21px;
  top: -1px;
  background-color: #fff;
  border: 2px solid #007BFF;
  box-shadow: 0 0 3px rgba(0,0,0,0.2);
  cursor: pointer;
}


::v-deep(.noUi-handle::before),
::v-deep(.noUi-handle::after),
::v-deep(.noUi-handle span) {
  display: none !important;
  background: none !important;
  box-shadow: none !important;
  border: none !important;
}

/* 輸入欄寬度與排版 */
.input-fields {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 280px;
}
.input-fields input {
  width: 100px;
  box-sizing: border-box;
  padding: 5px;
}
.input-fields label {
  font-size: 12px;
  color: #555;
}
</style>