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
  const DocumentMenuView = () => {
    router.push({ name: "DocumentMenuView" });
  };
  //這個函數被命名為 DocumentMenuView。當你呼叫 DocumentMenuView() 時，它會使用 router.push() 方法。router.push({ name: 'DocumentMenuView' }) 的作用是導航到路由配置中 name 屬性為 'DocumentMenuView' 的那個路由。其他的函數 (OrderFormView, VisaBreadcrumb 等) 的工作原理與 DocumentMenuView 類似，只是它們導航到的路由名稱不同。

    const OrderFormView = () => {
        router.push({ name: 'OrderFormView' });
    };

    const PaymentView = () => {
        router.push({ name: 'PaymentView' });
    }

    const CompletedOrderDetailView = () => {
        router.push({ name: 'CompletedOrderDetailView' });
    }


    ////////////////////////////////
    
    //components的橋墩
  const ArabEmirates = () => {
    router.push({ name: "ArabEmirates" });
  }; 

  const Brazil = () => {
    router.push({ name: "Brazil" });
  }; 

  const Brunei = () => {
    router.push({ name: "Brunei" });
  }; 

  const Canada = () => {
    router.push({ name: "Canada" });
  }; 

  const China = () => {
    router.push({ name: "China" });
  }; 

  const Domesticlostdown = () => {
    router.push({ name: "Domesticlostdown" });
  }; 

  const Domesticlostup = () => {
    router.push({ name: "Domesticlostup" });
  }; 

  const Foreignlostdown = () => {
    router.push({ name: "Foreignlostdown" });
  }; 

  const Foreignlostup = () => {
    router.push({ name: "Foreignlostup" });
  }; 

   const Hongkong = () => {
    router.push({ name: "Hongkong" });
  }; 

     const India = () => {
    router.push({ name: "India" });
  }; 

     const Mongolia = () => {
    router.push({ name: "Mongolia" });
  }; 

const NewChangedown = () => {
    router.push({ name: "NewChangedown" });
  }; 

const NewChangeup = () => {
    router.push({ name: "NewChangeup" });
  }; 

const Philippines = () => {
    router.push({ name: "Philippines" });
  }; 

  const Thailand = () => {
    router.push({ name: "Thailand" });
  }; 

   const Turkiye = () => {
    router.push({ name: "Turkiye" });
  }; 

    const USA = () => {
    router.push({ name: "USA" });
  }; 

  const Vietnam = () => {
    router.push({ name: "Vietnam" });
  }; 

   const VisaBackTop = () => {
    router.push({ name: "VisaBackTop" });
  }; 

  const VisaBreadcrumb = () => {
    router.push({ name: "VisaBreadcrumb" });
  }; 

  const VisaCarousel = () => {
    router.push({ name: "VisaCarousel" });
  }; 

  const VisaChoosePayment = () => {
    router.push({ name: "VisaChoosePayment" });
  }; 

  const VisaCreditCard = () => {
    router.push({ name: "VisaCreditCard" });
  }; 

  const VisaDetail = () => {
    router.push({ name: "VisaDetail" });
  }; 
  
  const VisainDetail = () => {
    router.push({ name: "VisainDetail" });
  }; 

  const VisaOrder = () => {
    router.push({ name: "VisaOrder" });
  }; 

  const VisaOrderContact = () => {
    router.push({ name: "VisaOrderContact" });
  }; 

  const VisaOrderInformation = () => {
    router.push({ name: "VisaOrderInformation" });
  }; 

  const VisaPassengerInformation = () => {
    router.push({ name: "VisaPassengerInformation" });
  }; 

  const VisaPickupMethod = () => {
    router.push({ name: "VisaPickupMethod" });
  }; 


  const VisaQuantityDeparture = () => {
    router.push({ name: "VisaQuantityDeparture" });
  }; 

  const VisaReceiptInformation = () => {
    router.push({ name: "VisaReceiptInformation" });
  }; 

  const VisaSelectVisaPay = () => {
    router.push({ name: "VisaSelectVisaPay" });
  }; 

  const VisaThankOrder = () => {
    router.push({ name: "VisaThankOrder" });
  }; 

   const VisaTotalAmount = () => {
        router.push({ name: 'VisaTotalAmount' });
    };

     const VueWorldMap = () => {
        router.push({ name: 'VueWorldMap' });
    };


  // 你可以在這裡添加更多與簽證相關的路由導航函數
  //導航方向
  return {
    DocumentMenuView,
    OrderFormView,
    PaymentView,
    CompletedOrderDetailView,
    //待做付款
    //待做完成訂單

    // 其他導航函數
  };
}
