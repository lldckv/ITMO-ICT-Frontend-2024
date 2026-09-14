<template>
  <h1 class="text-center">История сообщений</h1>
  <div class="mt-4 list-group gap-2 border-0" style="max-height: 400px; overflow-y: auto;" ref="listEl">
    <p v-if="messages.length === 0">Нет сообщений по этому объекту.</p>
    <div
      v-for="(msg, i) in messages"
      :key="i"
      :class="['list-group-item', String(msg.sender) === String(auth.userId) ? 'message-sent' : 'message-received']"
    >
      <strong>{{ String(msg.sender) === String(auth.userId) ? 'Вы' : 'Владелец' }}:</strong>
      <p>{{ msg.content }}</p>
      <small class="text-muted">{{ msg.timestamp }}</small>
    </div>
  </div>

  <form class="mt-4" @submit.prevent="onSend">
    <div class="mb-3">
      <textarea v-model="messageText" class="form-control" rows="3" required></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Отправить сообщение</button>
    <button type="button" class="btn btn-secondary" @click="messageText = ''">Отменить</button>
  </form>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useMessages } from '@/composables/useMessages';
import { useAuthStore } from '@/stores';

const props = defineProps({ propertyId: String });
const auth = useAuthStore();
const { messages, load, send } = useMessages(props.propertyId);
const messageText = ref('');
const listEl = ref(null);

onMounted(async () => {
    await load();
    scrollToBottom();
});

async function onSend() {
    if (!messageText.value.trim()) return;
    await send(messageText.value.trim());
    messageText.value = '';
    await nextTick();
    scrollToBottom();
}

function scrollToBottom() {
    if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight;
}
</script>