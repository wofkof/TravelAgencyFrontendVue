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

  { path: "/VisaPage", name: "VisaPage", component: VisaPage }, //富成

];
const router = createRouter({
  history: createWebHistory(),
  routes,
  // scrollBehavior(to, from, savedPosition) {
  //   return { top: 0 };
  // },
});

export default router;//富成
