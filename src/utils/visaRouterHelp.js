// src/utils/visaRouterHelp.js
import { useRouter } from 'vue-router';
//「嘿！Vue.js 的地圖管理員（vue-router），請給我你的特別小工具 useRouter，這樣我就可以在我的程式碼裡，告訴網站要帶我們去哪個頁面啦！」

export default function useVisaRouter() {
    // 這定義了一個可重複使用的函數 useVisaRouter，並將其預設匯出。
    // 任何 Vue.js 的 Component 都可以引入並呼叫這個函數，以獲得其中定義的路由導航功能。
    const router = useRouter();
    //在 useVisaRouter 函數內部，這行程式碼呼叫了 useRouter() Hook，並將返回的 router 實例賦值給 router 這個常數。
    //router 物件包含了 Vue Router 提供的各種方法，例如 push (導航到新的 URL)、replace (替換當前 URL) 等。
    
    //Views的橋墩

    //程式碼中定義了多個常數，每個常數都指向一個箭頭函數。每個函數的目的都是導航到一個特定的命名路由。 
    const VisaDetailView = () => {
        router.push({ name: 'VisaDetailView' });
    };//這個函數被命名為 VisaDetailView。當你呼叫 VisaDetailView() 時，它會使用 router.push() 方法。router.push({ name: 'VisaDetailView' }) 的作用是導航到路由配置中 name 屬性為 'VisaDetailView' 的那個路由。其他的函數 (VisaOrderView, VisaBreadcrumb 等) 的工作原理與 VisaDetailView 類似，只是它們導航到的路由名稱不同。

    const VisaOrderView = () => {
        router.push({ name: 'VisaOrderView' });
    };

    const VisaPaymentView = () => {
        router.push({ name: 'VisaPaymentView' });
    }

    const VisaCompleteOrderView = () => {
        router.push({ name: 'VisaCompleteOrderView' });
    }


    ////////////////////////////////
    
    //components的橋墩
    const VisaBreadcrumb = () => {
        router.push({ name: 'VisaBreadcrumb' });
    }
    
    const VisaCarousel = () => {
        router.push({ name: 'VisaCarousel' });
    };

    const VisainDetail = () => {
        router.push({ name: 'VisainDetail' });
    };

    const VisaOrderInformation = () => {
        router.push({ name: 'VisaOrderInformation' });
    };

    const VisaQuantityDeparture = () => {
        router.push({ name: 'VisaQuantityDeparture' });
    };

    const VisaBackToTop = () => {
        router.push({ name: 'VisaBackToTop' });
    };

    const VisaPassengerInformation = () => {
        router.push({ name: 'VisaPassengerInformation' });
    };

    const VisaTotalAmount = () => {
        router.push({ name: 'VisaTotalAmount' });
    };

    const VisaOrderContact = () => {
        router.push({ name: 'VisaOrderContact' });
    };

    const VisaPickupMethod = () => {
        router.push({ name: 'VisaPickupMethod' });
    };

    const VisaReceiptInformation = () => {
        router.push({ name: 'VisaReceiptInformation' });
    };

    const VisaCreditCard = () => {
        router.push({ name: 'VisaCreditCard' });
    };

    const VisaThankOrder = () => {
        router.push({ name: 'VisaThankOrder' });
    };

    const VisaSelectVisaPay = () => {
        router.push({ name: 'VisaSelectVisaPay' });
    }

  
    // 你可以在這裡添加更多與簽證相關的路由導航函數


    //導航方向
    return {
        VisaOrderView,
        VisaDetailView,
        VisaPaymentView,
        VisaCompleteOrderView,
        //待做付款
        //待做完成訂單

        // 其他導航函數
    };
}