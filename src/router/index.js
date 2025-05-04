import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import DomesticView from "@/views/DomesticView.vue";
import ForeignView from "@/views/ForeignView.vue";
import FreeTravelView from "@/views/FreeTravelView.vue";
import CruiseView from "@/views/CruiseView.vue";
import PricingView from "@/views/PricingView.vue";
import VisaView from "@/views/VisaView.vue";
import ContactView from "@/views/ContactView.vue";
import SignUp from "@/components/SignUp/SignUp.vue";
import Login from "@/components/SignUp/Login.vue";

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
  { path: "/signup", name: "SignUp", component: () => import("@/components/SignUp/SignUp.vue") },
  // 會員中心測試
  {
    path: "/member-center",
    name: "MemberCenter",
    component: () => import("@/views/MemberCenterView.vue")
  }
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
