// src/stores/orderForm.js
import { defineStore } from 'pinia';

export const useOrderFormStore = defineStore('orderForm', {
  state: () => ({
    // 完整的 OrderFormDto 結構，包含所有子組件需要填寫的欄位
    data: {
      MemberId: null,
      DocumentMenuId: null,
      DepartureDate: null, // YYYY-MM-DD 字串
      ProcessingQuantity: 1,

      ChineseSurname: '',
      ChineseName: '',
      EnglishSurname: '',
      EnglishName: '',
      Gender: '', // 'male' 或 'female'
      BirthDate: null, // YYYY-MM-DD 字串

      ContactPersonName: '',
      ContactPersonEmail: '',
      ContactPersonPhoneNumber: '',

      PickupMethodOption: '',
      MailingCity: '',
      MailingDetailAddress: '',
      StoreDetailAddress: '',

      TaxIdOption: '',
      CompanyName: '',
      TaxIdNumber: '',
    },
    // 你也可以在這裡添加驗證狀態或步驟狀態
    // validationErrors: {},
    // currentStep: 1,
  }),
  actions: {
    // 通用的更新 action，允許更新 data 物件中的任何屬性
    updateField(field, value) {
      this.data[field] = value;
    },
    // 更新旅客資訊的 action (如果有多個旅客，會更複雜)
    updatePassengerInfo(info) {
        this.data.ChineseSurname = info.chineseSurname;
        this.data.ChineseName = info.chineseName;
        this.data.EnglishSurname = info.englishSurname;
        this.data.EnglishName = info.englishName;
        this.data.Gender = info.gender;
        if (info.birthYear && info.birthMonth && info.birthDay) {
            this.data.BirthDate = `${info.birthYear}-${String(info.birthMonth).padStart(2, '0')}-${String(info.birthDay).padStart(2, '0')}`;
        } else {
            this.data.BirthDate = null;
        }
    },
    // 其他組件的更新 action (例如 updateContactInfo, updatePickupInfo 等)
    // ...

    resetForm() {
      // 重置為初始狀態
      this.$reset();
    }
  },
  getters: {
    // 你可以定義一些 getter 來獲取組合後的資料或驗證狀態
  }
});