<template>
<div class="max-w-7xl mx-auto p-4">
  <!-- 最外層容器 -->

  <div class="bg-white rounded-xl p-4 shadow mb-6">
    <!-- 行程資訊大矩形 -->

    <!-- 標題區塊 -->
    <div class="bg-yellow-100 rounded-lg p-4 text-center mb-4 text-gray-800 font-semibold text-lg">
      標題
    </div>

    <div class="flex gap-4">
      <!-- 三等分區塊 -->

      <div class="w-1/3 bg-green-100 rounded-lg p-4 text-center">
        資訊 01
      </div>

      <div class="w-1/3 bg-green-100 rounded-lg p-4 text-center">
        資訊 02
      </div>

      <div class="w-1/3 bg-green-100 rounded-lg p-4">
        <!-- 資訊 03：出團日期表格 -->
        <table class="w-full text-sm text-left border-separate border-spacing-y-2">
          <thead>
            <tr class="text-gray-600">
              <th class="border-b pb-1">出發日</th>
              <th class="border-b pb-1">價格</th>
              <th class="border-b pb-1">狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border-b py-1">2025/06/10</td>
              <td class="border-b py-1">$28,000</td>
              <td class="border-b py-1 text-green-600">可報名</td>
            </tr>
            <tr>
              <td class="border-b py-1">2025/07/05</td>
              <td class="border-b py-1">$29,500</td>
              <td class="border-b py-1 text-gray-500">候補中</td>
            </tr>
            <tr>
              <td class="border-b py-1">2025/08/01</td>
              <td class="border-b py-1">$30,000</td>
              <td class="border-b py-1 text-red-500">額滿</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <div class="bg-white rounded-xl p-4 shadow mb-6">
  行程描述
</div>

<!-- 行程手風琴區塊 -->
<div class="bg-white rounded-xl p-4 shadow mb-6">
  行程手風琴
  <el-collapse accordion>
  <el-collapse-item title="第 1 天：台北 → 東京" name="1">
    <div class="text-sm text-gray-700 leading-relaxed">
      搭乘早班機前往東京，抵達後前往淺草寺、晴空塔周邊自由活動，晚上入住新宿飯店。
    </div>
  </el-collapse-item>

  
</el-collapse>


</div>

</div>

</template>