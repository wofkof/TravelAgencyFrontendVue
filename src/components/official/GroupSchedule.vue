<template>
    <div class="mb-2 p-2 border border-solid rounded-md border-gray-400">
        <p class="mb-4">選擇行程</p>
        <div class="grid grid-cols-5 gap-x-2">
            <button type="button" class="border border-solid rounded-md border-blue-300 bg-blue-200">全部</button>
            <button type="button" class="border border-solid rounded-md border-blue-300 bg-blue-200">行程1</button>
        </div>
    </div>
    <div class="mb-2 border border-solid rounded-md border-gray-400">
        <table class="w-full text-sm text-center border-separate border-spacing-y-2">
            <!-- 未消除thead邊線 -->
            <thead>
                <tr>
                    <th class="border-b pb-1">出發日期</th>
                    <th class="border-b pb-1">行程</th>
                    <th class="border-b pb-1">可賣</th>
                    <th class="border-b pb-1">席次</th>
                    <th class="border-b pb-1">成行狀態</th>
                    <th class="border-b pb-1">價格</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>2</td>
                    <td>3</td>
                    <td>4</td>
                    <td>5</td>
                    <td>6</td>
                </tr>
            </tbody>
          
        </table>
    </div>
</template>