import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import DomesticView from "@/views/DomesticView.vue";
import ForeignView from "@/views/ForeignView.vue";
import FreeTravelView from "@/views/FreeTravelView.vue";
import CruiseView from "@/views/CruiseView.vue";
import PricingView from "@/views/PricingView.vue";
import VisaView from "@/views/VisaView.vue";
import ContactView from "@/views/ContactView.vue";
import Login from "@/components/SignUp/Login.vue";
import CustomtravelCreate from "@/components/customtravel/Create.vue";
import CustomtravelList from "@/components/customtravel/List.vue";
import CustomtravelContent from "@/components/customtravel/Content.vue";
import SearchResult from "@/views/SearchResult.vue";
import Trip from "@/views/Trip.vue";
import ShoppingCart from "@/views/ShoppingCart.vue";
import OrderForm from "@/views/OrderForm.vue";


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
  { path: "/PricingView", name: "PricingView", component: PricingView },
  { path: "/VisaView", name: "VisaView", component: VisaView },
  { path: "/ContactView", name: "ContactView", component: ContactView },
  { path: "/login", name: "Login", component: Login },
  {
    path: "/signup",
    name: "SignUp",
    component: () => import("@/components/SignUp/SignUp.vue"),
  },
  // 會員中心測試
  {
    path: "/member-center",
    name: "MemberCenter",
    component: () => import("@/views/MemberCenterView.vue"),
  },
  {
    path: "/cart", // 購物車頁面的路徑
    name: "ShoppingCart",
    component: ShoppingCart, // 對應到 ShoppingCart 組件
  },
  {
    path: "/order-form", // 訂單表單頁面的路徑
    name: "OrderForm",
    component: OrderForm, // 對應到 OrderForm 組件
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
