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
import OrderComplete from "@/views/OrderComplete.vue";
import DocumentMenuView from "@/views/DocumentMenuView.vue";//富成
// import VisainDetail from '@/components/Visa/VisainDetail.vue'; // 如果路徑不同請調整
import OrderFormView from "@/views/OrderFormView.vue"; // 富成
import PaymentView from "@/views/PaymentView.vue"; // 富成
import CompletedOrderDetailView from "@/views/CompletedOrderDetailView.vue"; // 富成
import OrderPayment from "@/views/OrderPayment.vue";
import OAuthCallback from '@/views/OAuthCallback.vue'


const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/Domestic", name: "Domestic", component: DomesticView, props: () => ({ category: 'Domestic' }) },
  { path: "/ForeignView", name: "ForeignView", component: ForeignView, props: () => ({ category: 'Foreign' }) },
  {
    path: "/FreeTravelView",
    name: "FreeTravelView",
    component: FreeTravelView,
  },
  { path: "/CruiseView", name: "CruiseView", component: CruiseView, props: () => ({ category: 'CruiseShip' }) },

  { path: "/ContactView", name: "ContactView", component: ContactView },
  { path: "/login", name: "Login", component: Login },
  {
    path: "/signup",
    name: "SignUp",
    component: () => import("@/components/SignUp/SignUp.vue"),
  },
  {
    path: "/member/:section?",
    name: "MemberCenter",
    component: () => import("@/views/MemberCenterView.vue"),
  },
  {
    path: "/ShoppingCart",
    name: "ShoppingCart",
    component: ShoppingCart, 
  },
  {
    path: "/order-form",
    name: "OrderForm",
    component: OrderForm,
    meta: { simpleNavbar: true }
  },
  {
    path: "/order-complete/:orderId",
    name: "Ordercomplete",
    component: OrderComplete,
    meta: { simpleNavbar: true },
    props: true
  },
  {
    path: "/order-payment",
    name: "OrderPayment",
    component: OrderPayment,
    props: route => ({
        orderId: route.query.orderId,
        mtn: route.query.mtn,
        exp: route.query.exp
    }),
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

  { path: '/detail/:projectId/:detailId/:groupId', name: 'DetailPage', component: () => import('@/views/Trip.vue') },
  { path: "/DocumentMenuView", // 瀏覽器網址中顯示的路徑
    name: "DocumentMenuView", 
    component: DocumentMenuView }, // 當這個 path 被匹配時，要載入並顯示哪個 Vue 元件,對應到 DocumentMenuView 組件
    // path: "/DocumentMenuView", : 訪問這個路徑時，會顯示 component: DocumentMenuView。
    //富成

  //   {
  //   path: '/visa/detail/:id', // 定義一個 ID 的動態參數
  //   name: 'VisainDetail',
  //   component: VisainDetail,
  //   props: true // 如果直接從 Store 獲取資料，這裡就不一定需要 props: true，但保留是個好習慣
  //   //富成
  // },

  { path: "/OrderFormView/:id",  // 為 OrderFormView 定義一個可選的 ID 參數
    name: "OrderFormView", 
    component: OrderFormView,
    props: true // 讓元件可以透過 props 接收 ID
  }, //富成

  { path: "/PaymentView", 
    name: "PaymentView", 
    component: PaymentView }, //富成

  { path: "/CompletedOrderDetailView", 
    name: "CompletedOrderDetailView", 
    component: CompletedOrderDetailView }, //富成
  { path: "/VisaPage", name: "VisaPage", component: VisaPage }, //富成
  { path: '/oauth2/callback', name: 'GoogleCallback', component: OAuthCallback }
];


const router = createRouter({
  history: createWebHistory(),
  routes,
  // scrollBehavior(to, from, savedPosition) {
  //   return { top: 0 };
  // },
});

export default router;//富成
