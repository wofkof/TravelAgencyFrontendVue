import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    memberName: '',
    memberId: null,
    showLoginModal: false
  }),
  actions: {
    login(name, id, rememberMe = false) {
      console.log("login 被呼叫了", name, id, "記住我？", rememberMe)
      this.isLoggedIn = true
      this.memberName = name
      this.memberId = id

      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem("memberName", name)
      storage.setItem("memberId", String(id))
    },

    // ✅ 登出時同時清掉 localStorage + sessionStorage
    logout() {
      this.isLoggedIn = false
      this.memberName = ""
      this.memberId = null
      localStorage.removeItem("memberName")
      localStorage.removeItem("memberId")
      sessionStorage.removeItem("memberName")
      sessionStorage.removeItem("memberId")
    },

    // ✅ 載入登入狀態時優先抓 sessionStorage，其次抓 localStorage
    loadFromStorage() {
      let name = sessionStorage.getItem("memberName")
      let id = sessionStorage.getItem("memberId")

      if (!name || !id) {
        name = localStorage.getItem("memberName")
        id = localStorage.getItem("memberId")
      }
      if (name && id) {
        this.isLoggedIn = true
        this.memberName = name
        this.memberId = Number(id)
      }
    },
    reset() {
    this.isLoggedIn = false
    this.memberName = ''
    this.memberId = null
    },
     triggerLoginModal() {
      this.showLoginModal = true
    },
    closeLoginModal() {
      this.showLoginModal = false
    }
  }
})
