import { defineStore } from 'pinia'

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
      storage.setItem("memberId", String(id || ''))
      console.log("✅ authStore 狀態已更新：", {
        isLoggedIn: this.isLoggedIn,
        memberName: this.memberName,
        memberId: this.memberId
      })
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
      console.log("✅ 已登出，清除所有狀態")
    },
    // ✅ 載入登入狀態時優先抓 sessionStorage，其次抓 localStorage
    loadFromStorage() {
       let name = sessionStorage.getItem("memberName") || localStorage.getItem("memberName")
      let id = sessionStorage.getItem("memberId") || localStorage.getItem("memberId")
      
      if (name && id) {
        this.isLoggedIn = true
        this.memberName = name
        this.memberId = id ? Number(id) : null
        console.log("✅ 從 storage 載入登入狀態：", { 
      name: this.memberName,      // 修改這行
      id: this.memberId,          // 修改這行
      isLoggedIn: this.isLoggedIn // 新增這行
    })
  } else {
    console.log("❌ storage 中沒有登入資訊") // 新增這行
  }
    },
    reset() {
    this.isLoggedIn = false
    this.memberName = ''
    this.memberId = null
    console.log("✅ authStore 狀態已重置") 
    },
     triggerLoginModal(show = true) {
      this.showLoginModal = show
    },
    closeLoginModal() {
      this.showLoginModal = false
    },
  //   loginByGoogle(name) {
  // console.log("Google 登入成功", name)
  // this.isLoggedIn = true
  // this.memberName = name
  // this.memberId = null // 若你有從後端取得 Google 使用者的 memberId 可一起存

  // Google 登入流程多半用 sessionStorage 儲存（不記住登入）
  // sessionStorage.setItem("memberName", name)
  // sessionStorage.setItem("memberId", "") // 或不設
}

  }
)
