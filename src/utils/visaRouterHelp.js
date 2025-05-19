// src/utils/visaRouterHelp.js
import { useRouter } from 'vue-router';

export default function useVisaRouter() {
    const router = useRouter();

    const VisaDetailView = () => {
        router.push({ name: 'VisaDetailView' });
    };
    
    const VisaOrderView = () => {
        router.push({ name: 'VisaOrderView' });
    };
    // 你可以在這裡添加更多與簽證相關的路由導航函數

    return {
        VisaOrderView,
        VisaDetailView,
        // 其他導航函數
    };
}