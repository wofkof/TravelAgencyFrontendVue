import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import DomesticView from "@/views/DomesticView.vue";
import ForeignView from "@/views/ForeignView.vue";
import FreeTravelView from "@/views/FreeTravelView.vue";
import CruiseView from "@/views/CruiseView.vue";
import PricingView from "@/views/PricingView.vue";
import VisaView from "@/views/VisaView.vue";
import ContactView from "@/views/ContactView.vue";
import SearchResult from "@/views/SearchResult.vue";
import Trip from "@/views/Trip.vue";


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
  { path: "/SearchResult", name: "SearchResult", component: SearchResult },
  { path: "/Trip", name: "Trip", component: Trip },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
