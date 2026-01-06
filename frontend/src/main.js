import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import "vue3-toastify/dist/index.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import LazyLoading from './directives/LazyLoading';

const pinia = createPinia()
const app = createApp(App).use(router).use(pinia)
app.directive('lazy', LazyLoading)
app.mount('#app')
