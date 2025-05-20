import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import DomesticView from "@/views/DomesticView.vue";
import ForeignView from "@/views/ForeignView.vue";
import FreeTravelView from "@/views/FreeTravelView.vue";
import CruiseView from "@/views/CruiseView.vue";
import PricingView from "@/views/PricingView.vue";
import ContactView from "@/views/ContactView.vue";
import Login from "@/components/SignUp/Login.vue";
import CustomtravelCreate from "@/components/customtravel/Create.vue";
import CustomtravelList from "@/components/customtravel/List.vue";
import CustomtravelContent from "@/components/customtravel/Content.vue";
import SearchResult from "@/views/SearchResult.vue";
import Trip from "@/views/Trip.vue";
import ShoppingCart from "@/views/ShoppingCart.vue";
import OrderForm from "@/views/OrderForm.vue";
import VisaPage from "@/views/VisaPage.vue";//富成,定義顯示是誰
import VisaOrderView from '@/views/VisaOrderView.vue';//富成,定義顯示是誰
import VisaDetailView from '@/views/VisaDetailView.vue';//富成,定義顯示是誰
// import VisaPaymentView from "@/views/VisaPaymentView.vue";//富成,定義顯示是誰
// import VisaCompleteOrderView from "@/views/VisaCompleteOrderView.vue";//富成,定義顯示是誰
import OrderComplete from "@/views/OrderComplete.vue";



const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/Domestic", name: "Domestic", component: DomesticView },
  { path: "/ForeignView", name: "ForeignView", component: ForeignView },
  {
    path: "/FreeTravelView",
    name: "FreeTravelView",
    component: FreeTravelView,
  },
  { path: "/CruiseView", name: "CruiseView", component: CruiseView },

  { path: "/ContactView", name: "ContactView", component: ContactView },
  { path: "/login", name: "Login", component: Login },
  {
    path: "/signup",
    name: "SignUp",
    component: () => import("@/components/SignUp/SignUp.vue"),
  },
  // 會員中心
  {
    path: "/member/:section?",
    name: "MemberCenter",
    component: () => import("@/views/MemberCenterView.vue"),
  },

  {
    path: "/ShoppingCart", // 購物車頁面的路徑
    name: "ShoppingCart",
    component: ShoppingCart, // 對應到 ShoppingCart 組件
  },
  {
    path: "/order-form", // 訂單表單頁面的路徑
    name: "OrderForm",
    component: OrderForm, // 對應到 OrderForm 組件
    meta: { simpleNavbar: true }
  },
  {
    path: "/order-complete", // 訂單完成的路徑
    name: "Ordercomplete",
    component: OrderComplete, // 對應到 Ordercomplete 組件
    meta: { simpleNavbar: true }
  },
  {
    path: "/CustomtravelCreate",
    name: "CustomtravelCreate",
    component: CustomtravelCreate,
  },
  {
    path: "/CustomtravelList",
    name: "CustomtravelList",
    component: CustomtravelList,
  },
  {
    path: "/CustomtravelContent/:id",
    name: "CustomtravelContent",
    component: CustomtravelContent,
  },
  { path: "/SearchResult", name: "SearchResult", component: SearchResult },

  { path: "/Trip", name: "Trip", component: Trip },


  { path: '/detail/:projectId/:detailId/:groupId',name: 'DetailPage',component: () => import('@/views/Trip.vue') },


  { 
    path: "/VisaPage", //頁面的路徑URL
    name: "VisaPage", // // 路由名稱
    component: VisaPage, //對應到Views組件
  }, //富成

  {
    path: '/visa/detail',//頁面的路徑URL
    name: 'VisaDetailView',// // 路由名稱
    component: VisaDetailView,//對應到Views組件
  },//富成

  {
    path: '/visa/order',//頁面的路徑URL
    name: 'VisaOrderView',// // 路由名稱
    component: VisaOrderView,//對應到Views組件
  },//富成

  // {
  //   path: '/visa/payment',//頁面的路徑URL
  //   name: 'VisaPaymentView',// // 路由名稱
  //   component: VisaPaymentView,//對應到Views組件
  // },//富成

  // {
  //   path: '/visa/complete',//頁面的路徑URL
  //   name: 'VisaCompleteOrderView',// // 路由名稱
  //   component: VisaCompleteOrderView,//對應到Views組件
  // }//富成

];


const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});


export default router;//將 router 實例導出。富成
