<template>
  <div class="w-58 h-screen border-r bg-white overflow-y-auto">
    <div class="sticky top-0 bg-white">
      <div class="h-20 flex items-center px-4 border-b">
        <a href="javascript:void(0)" class="flex-none text-base font-medium text-gray-800">
          歡迎，{{ memberName }}
        </a>
      </div>
    </div>
    <div class="text-sm space-y-1 px-4 mt-4 text-gray-700">
      <ul>
        <li>
           <router-link to="/member/orders" class="flex items-center py-2 px-3 rounded hover:bg-gray-100">
            📦 歷史訂單查詢
          </router-link>
        </li>
         <li>
           <router-link to="/member/customtravel-status" class="flex items-center py-2 px-3 rounded hover:bg-gray-100">
            🗺️ 客製化行程
          </router-link>
        </li>
        <li>
           <router-link to="/member/favorite-travelers" class="flex items-center py-2 px-3 rounded hover:bg-gray-100">
            👥 常用旅客清單
          </router-link>
        </li>
        <li>
          <router-link to="/member/favorites" class="flex items-center py-2 px-3 rounded hover:bg-gray-100">
            ❤️ 我的收藏
          </router-link>
        </li>
        <li>
           <router-link to="/member/comments" class="flex items-center py-2 px-3 rounded hover:bg-gray-100">
            🗝 我的評論
          </router-link>
        </li>
        <li>
           <router-link to="/member/profile" class="flex items-center py-2 px-3 rounded hover:bg-gray-100">
            🔐 會員帳號管理
          </router-link>
        </li>
        <li>
          <router-link to="/" class="flex items-center py-2 px-3 rounded hover:bg-gray-100">
            🚪 回首頁
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const memberName = localStorage.getItem('memberName') || 'XXX'
</script>
