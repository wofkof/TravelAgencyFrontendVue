// src/utils/visaRouterHelp.js
// import VisaCompleteOrderView from '@/views/VisaCompleteOrderView.vue';
// import VisaPaymentView from '@/views/VisaPaymentView.vue';
import { useRouter } from "vue-router";

export default function useVisaRouter() {
  const router = useRouter();

  const VisaDetailView = () => {
    router.push({ name: "VisaDetailView" });
  }; //填寫要放的components是誰

  const VisaBreadcrumb = () => {
    router.push({ name: "VisaBreadcrumb" });
  }; //填寫要放的components是誰

  const VisaCarousel = () => {
    router.push({ name: "VisaCarousel" });
  }; //填寫要放的components是誰

  const VisainDetail = () => {
    router.push({ name: "VisainDetail" });
  }; //填寫要放的components是誰

  const VisaOrderInformation = () => {
    router.push({ name: "VisaOrderInformation" });
  }; //填寫要放的components是誰

  const VisaQuantityDeparture = () => {
    router.push({ name: "VisaQuantityDeparture" });
  }; //填寫要放的components是誰

  const VisaBackToTop = () => {
    router.push({ name: "VisaBackToTop" });
  }; //填寫要放的components是誰

  const VisaPassengerInformation = () => {
    router.push({ name: "VisaPassengerInformation" });
  }; //填寫要放的components是誰

  const VisaTotalAmount = () => {
    router.push({ name: "VisaTotalAmount" });
  }; //填寫要放的components是誰

  const VisaOrderContact = () => {
    router.push({ name: "VisaOrderContact" });
  }; //填寫要放的components是誰

  const VisaPickupMethod = () => {
    router.push({ name: "VisaPickupMethod" });
  }; //填寫要放的components是誰

  const VisaReceiptInformation = () => {
    router.push({ name: "VisaReceiptInformation" });
  }; //填寫要放的components是誰

  const VisaOrderView = () => {
    router.push({ name: "VisaOrderView" });
  }; //填寫要放的components是誰
  // 你可以在這裡添加更多與簽證相關的路由導航函數

  //導航方向
  return {
    VisaOrderView,
    VisaDetailView,
    // VisaPaymentView,
    // VisaCompleteOrderView,
    //待做付款
    //待做完成訂單

    // 其他導航函數
  };
}
