<template>
    <div class="container py-4">
        <h1 class="text-primary fw-bold display-5 text-center text-lg-start mb-4">
            My profile
        </h1>
        <div class="row">
            <!-- Menu tabs -->
            <div class="col-lg-3 mb-4">
                <ul class="nav flex-column nav-pills shadow-sm bg-white rounded">
                    <li class="nav-item">
                        <button class="nav-link" :class="{active: currentTab === 'favorites'}" @click="currentTab='favorites'">
                            <i class="bi bi-heart-fill me-2"></i> Favorite campaigns
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{active: currentTab === 'history'}" @click="currentTab='history'">
                            <i class="bi bi-clock-history me-2"></i> Donation history
                        </button>
                    </li>
                    <li class="nav-item" v-if="userRole === 'organization'">
                        <button class="nav-link" :class="{active: currentTab === 'mycampaigns'}" @click="currentTab='mycampaigns'">
                            <i class="bi bi-megaphone-fill me-2"></i> My campaigns
                        </button>
                    </li>
                </ul>
            </div>

            <!-- Content -->
            <div class="col-lg-9">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <FavoriteCampaigns v-if="currentTab === 'favorites'" />
                        <DonationHistory v-else-if="currentTab === 'history'" />
                        <MyCampaigns v-else-if="currentTab === 'mycampaigns'" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import FavoriteCampaigns from '@/components/profile/FavoriteCampaigns.vue';
import DonationHistory from '@/components/profile/DonationHistory.vue';
import MyCampaigns from '@/components/profile/MyCampaigns.vue';
import { useAuthStore } from '@/stores/authStore';

export default {
    components: {
        FavoriteCampaigns,
        DonationHistory,
        MyCampaigns,
    },
    data() {
        return {
            authStore: useAuthStore(),
            currentTab: 'favorites',
            userRole: 'user',
        };
    },
    mounted() { // get user role
        this.userRole = this.authStore.user ? this.authStore.user.role : 'user';
    }
};
</script>

<style scoped>
    .nav-link {
        cursor: pointer;
        border-radius: 0;
        text-align: left;
        color: var(--primary-color) !important;
        width: 100%;
        padding: 15px;
    }

    .nav-link.active {
        background-color: var(--primary-color) !important;
        color: #fff !important;
    }

    .card {
        min-height: 300px;
    }

    .text-primary {
        color: var(--primary-color) !important;
    }
</style>