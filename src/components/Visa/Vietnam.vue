<template>
  <div class="visa-info-container">
    <h3><el-icon><Avatar /></el-icon>越南簽證｜申辦項目</h3>

    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">1個月單次觀光(不含保險)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：12個工作天</el-col>
              <el-col :span="12">效期：1個月</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 3,200</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">15天單次觀光(不含保險)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：12個工作天</el-col>
              <el-col :span="12">效期：15天</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,600</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">90天電子觀光簽證【不含接機人員不含快速通關】</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">單次：12個工作天</el-col>
              <el-col :span="12">效期：海關決定</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 1,650</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">多次：12個工作天</el-col>
              <el-col :span="12">效期：海關決定</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,750</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    
    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">1個月單次商務簽證</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：8個工作天</el-col>
              <el-col :span="12">效期：1個月</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 1,700</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">急件：6個工作天</el-col>
              <el-col :span="12">效期：1個月</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,200</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    
    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">1個月多次商務簽證</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：8個工作天</el-col>
              <el-col :span="12">效期：簽證官決定</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,700</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">急件：6個工作天</el-col>
              <el-col :span="12">效期：簽證官決定</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 3,200</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    
    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">3個月單次商務簽證</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：8個工作天</el-col>
              <el-col :span="12">效期：簽證官決定</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 1,800</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">急件：6個工作天</el-col>
              <el-col :span="12">效期：簽證官決定</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,500</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    
    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">3個月多次商務簽證</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：8個工作天</el-col>
              <el-col :span="12">效期：簽證官決定</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,700</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">急件：6個工作天</el-col>
              <el-col :span="12">效期：簽證官決定</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 3,600</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    
    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">五年多次簽證(越南籍配偶)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：16個工作天</el-col>
              <el-col :span="12">效期：5年</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 1,600</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">急件：10個工作天</el-col>
              <el-col :span="12">效期：5年</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,600</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    
    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">五年多次簽證(越南籍子女)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：16個工作天</el-col>
              <el-col :span="12">效期：5年</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 1,600</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">急件：10個工作天</el-col>
              <el-col :span="12">效期：5年</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,600</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col> 
      </el-row>
    </el-card>

    
    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">五年多次簽證(越南籍本人)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：16個工作天</el-col>
              <el-col :span="12">效期：5年</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 1,600</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">急件：10個工作天</el-col>
              <el-col :span="12">效期：5年</el-col>
              <el-col :span="12">停留時間 海關決定</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,600</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue';
</script>

<style scoped>
.visa-info-container {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 讓每個卡片之間有點間距 */
  padding: 30px; /* 讓內容不要太貼邊 */
  background-color: #f9f9f9; /* 幫 Footer 加個淺灰色背景 */
}

.visa-info-card {
  /* 可以調整卡片的樣式，例如陰影 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-title {
  font-weight: bold; /* 讓標題粗體一點 */
}

.item-info-card {
  /* 可以調整卡片的樣式，例如陰影 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width:450px;
}
</style>

