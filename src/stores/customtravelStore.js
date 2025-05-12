import { defineStore } from 'pinia'

export const useTravelStore = defineStore('travel', {
  state: () => ({
    travelForm: {
      title:'',
      daterange: [],
      days: '',
      budget: '',
      people: 1,
    },
    dailyActivities: []
  }),

  actions: {
    setTravelForm(data) {
      this.travelForm = { ...this.travelForm, ...data }
      localStorage.setItem('travelForm', JSON.stringify(this.travelForm)) // ✨ 同步存到 localStorage
    },
    setDailyActivities(list) {
      this.dailyActivities = list
      localStorage.setItem('dailyActivities', JSON.stringify(list)) // ✨ 同步存到 localStorage
    },
    loadFromLocal() {
      const form = localStorage.getItem('travelForm')
      const activities = localStorage.getItem('dailyActivities')

      if (form) {
        this.travelForm = JSON.parse(form)
      }
      if (activities) {
        this.dailyActivities = JSON.parse(activities)
      }
    },
    clearAll() {
      this.travelForm = {
        title:'',
        daterange: [],
        days: '',
        budget: '',
        people: 1,
      }
      this.dailyActivities = []
      localStorage.removeItem('travelForm')
      localStorage.removeItem('dailyActivities')
      console.log('清除成功', this.travelForm, this.dailyActivities)
    }
  }
})
