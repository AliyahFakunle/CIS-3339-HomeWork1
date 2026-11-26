<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info'
  }
});
</script>

<template>
  <p
    v-if="message"
    :class="['status-message', type]"
    :role="type === 'error' ? 'alert' : 'status'"
  >
    {{ message }}
  </p>
</template>

<style scoped>
.status-message {
  padding: 12px;
  border-radius: 6px;
  margin: 12px 0;
}

.success {
  background: #dcfce7;
  color: #166534;
}

.error {
  background: #fee2e2;
  color: #991b1b;
}

.info {
  background: #dbeafe;
  color: #1e40af;
}
</style>