<template>
  <el-dialog
    title="通話紀錄"
    style="font-family: 'Noto Sans TC', sans-serif"
    width="50%"
    top="5vh"
    centered
    :model-value="visible"
    @close="emit('update:visible', false)"
    :close-on-press-escape="true"
    :destroy-on-close="true"
    align="center"
  >
    <el-scrollbar max-height="500px">
      <el-table
        v-if="!loading"
        :data="callLogs"
        border
        style="width: 100%"
        empty-text="暫無紀錄"
        :fit="false"
      >
        <el-table-column label="發起者" min-width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.callerType === 'Employee' ? 'primary' : 'success'"
              size="small"
            >
              {{ formatUserType(row.callerType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="接收者" min-width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.receiverType === 'Employee' ? 'primary' : 'success'"
              size="small"
            >
              {{ formatUserType(row.receiverType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="通話類型" min-width="90" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.callType === 'video' ? 'primary' : 'info'"
              size="small"
            >
              {{ formatCallType(row.callType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="狀態" min-width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="
                {
                  completed: 'success',
                  missed: 'danger',
                  rejected: 'warning',
                }[row.status] || ''
              "
              size="small"
            >
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="開始時間"
          :formatter="
            (row) => formatDateTime(row.startTime, { showSeconds: false })
          "
          prop="startTime"
          min-width="200"
          align="center"
        >
          <template #default="{ row }">{{
            formatDateTime(row.startTime)
          }}</template>
        </el-table-column>

        <el-table-column
          label="結束時間"
          :formatter="
            (row) =>
              row.endTime
                ? formatDateTime(row.endTime, { showSeconds: false })
                : '-'
          "
          prop="endTime"
          min-width="200"
          align="center"
        >
          <template #default="{ row }">
            {{ row.endTime ? formatDateTime(row.endTime) : "-" }}
          </template>
        </el-table-column>

        <el-table-column
          label="通話秒數"
          prop="durationInSeconds"
          min-width="160"
          align="center"
        >
          <template #default="{ row }">
            {{
              row.durationInSeconds != null
                ? row.durationInSeconds + " 秒"
                : "-"
            }}
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="text-center text-secondary p-3">載入中...</div>
    </el-scrollbar>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { getCallLogsByChatRoom } from "@/apis/callLogApi.ts";
import { formatDateTime } from "@/utils/formatDateTime";
import {
  getCallTypeText,
  getCallStatusText,
  getSenderTypeText,
} from "@/utils/enumHelper";

const props = defineProps({
  visible: Boolean,
  chatRoomId: Number,
});
const emit = defineEmits(["update:visible"]);

const callLogs = ref([]);
const loading = ref(false);

const loadLogs = async () => {
  loading.value = true;
  try {
    callLogs.value = await getCallLogsByChatRoom(props.chatRoomId);
  } finally {
    loading.value = false;
  }
};

watch(() => props.chatRoomId, loadLogs);
watch(
  () => props.visible,
  (val) => {
    if (val) loadLogs();
  }
);

onMounted(loadLogs);

const formatUserType = getSenderTypeText;
const formatCallType = getCallTypeText;
const formatStatus = getCallStatusText;
</script>
