<template>
    <div class="app">
        <WebHeader v-if="!$route.meta.hideNav" />
        <main>
            <router-view />
        </main>
        <WebFooter v-if="!$route.meta.hideNav" />
    </div>
</template>

<script setup>
    import WebHeader from './components/common/WebHeader.vue';
    import WebFooter from './components/common/WebFooter.vue';
</script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
    
    :root {
        --primary-color: #70310F;
        --dark-primary-color: #4f2209;
        --secondary-color: #CF5C1F;
    }

    body {
        font-family: 'Inter', sans-serif !important;
        overflow-x: hidden;
    }

    .btn-primary {
        background-color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
        color: white !important;
        font-weight: 500;
        transition: 0.2s ease;
    }

    .btn-primary:hover,
    .btn-primary:focus {
        background-color: var(--dark-primary-color) !important;
        border-color: var(--dark-primary-color) !important;
        color: white !important;
    }

    .btn-outline-primary {
        color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
    }

    .btn-outline-primary:hover {
        background-color: var(--primary-color) !important;
        color: white !important;
    }

    .text-primary {
        color: var(--primary-color) !important;
    }

    .pagination .page-item.active .page-link,
    .pagination .page-link.active {
        background-color: var(--dark-primary-color) !important;
        border-color: var(--dark-primary-color) !important;
        color: #fff !important;
    }

    .page-link {
        color: var(--primary-color) !important;
    }

    .pagination .page-item.disabled .page-link, .pagination .page-link.disabled {
        color: #6c757d !important;
        pointer-events: none;
    }
</style>
