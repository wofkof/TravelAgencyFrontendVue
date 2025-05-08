<template>
    <router-link to="/Trip">
        <div class="bg-blue-100 rounded-lg p-4 mb-4 grid grid-cols-3 gap-4 h-auto">
            <div class="bg-blue-200 w-full h-52">
                img
            </div>
            <div class="col-span-2 bg-slate-300 w-full relative p-4">
                <div class="text-start">標題</div>
                <div class="absolute bottom-4 right-7 w-20 bg-white">價格</div>
            </div>
        </div>
    </router-link>
</template>