<template>
  <form class="newsletter">
    <h2 class="newsletter__hdl">獲得最新通知</h2>
    <div class="l-newsletter-wrapper">
      <div class="newsletter__group">
        <label class="newsletter__lbl" for="email">Email</label>
        <input
          class="newsletter__email"
          type="email"
          id="email"
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
