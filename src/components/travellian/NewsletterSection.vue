 <template> <!--原id跟登入頁面的id重複，故修改為newsletter-email -->
  <form class="newsletter">
    <h2 class="newsletter__hdl">獲得最新通知</h2>
    <div class="l-newsletter-wrapper">
      <div class="newsletter__group">
        <label class="newsletter__lbl" for="newsletter-email">Email</label>
        <input
          class="newsletter__email"
          type="email"
          id="newsletter-email"
          name="email"
          placeholder="Enter your email"
          v-model="email"
        />
      </div>
      <input
        type="button"
        value="訂閱"
        class="newsletter__btn"
        @click="subscribe"
      />
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");

function subscribe() {
  if (email.value) {
    alert(`Subscribed with ${email.value}`);
    email.value = "";
  } else {
    alert("Please enter a valid email.");
  }
}
</script>