<template>
    <router-link :to="routerLink" class="card shadow-sm border-0 campaign-card">
        <img v-lazy="campaign.image" class="card-img-top campaign-card-img" alt="Campaign Image" />

        <div class="card-body">
            <!-- Tags -->
            <div class="mb-3 d-flex flex-wrap gap-2">
                <span v-for="(tag, index) in campaign.tags" :key="index" class="badge bg-secondary">
                    {{ tag }}
                </span>
            </div>

            <!-- Title -->
            <h6 class="fw-bold text-dark display-7 mb-3">{{ campaign.title }}</h6>

            <!-- Org info and days left -->
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center">
                    <span class="small text-muted">{{ campaign.orgName }}</span>
                </div>
                <span v-if="campaign.isActive" class="badge bg-warning text-dark">{{ calculateDaysLeft }} days left</span>
                <span v-else class="badge bg-danger">Inactive</span>
            </div>

            <!-- Progress -->
            <div class="mb-2 text-muted small">
                <span class="fw-bold">{{ formatCurrency(campaign.current) }}</span>
                / {{ formatCurrency(campaign.target) }}
            </div>
            <div class="progress mb-3" style="height: 6px;">
                <div
                    class="progress-bar bg-success"
                    role="progressbar"
                    :style="{ width: progressPercent + '%' }"
                    :aria-valuenow="progressPercent"
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>

            <!-- Action buttons -->
            <router-link v-if="page=='home'||page==''||!page" :to="'/campaigns/' + campaign.id" class="btn btn-primary w-100">View details</router-link>
            <button v-else-if="page=='favorites'" @click="removeFromFavorite" class="btn btn-danger w-100">
                Remove from favorites
            </button>
            
            <router-link v-else :to="routerLink" class="btn btn-primary w-100">
                {{ page == 'my-campaigns' ? 'Edit campaign' : 'Donate now' }}
            </router-link>
        </div>
    </router-link>
</template>

<script>
import helper from '@/utils/helper'

export default {
    name: 'CampaignCard',
    emits: ['action'],
    props: ['campaign', 'page'],
    methods: {
        removeFromFavorite() { // remove campaign from favorites
            this.$emit('handleAction', 'removeFavorite', this.campaign);
        },
    },
    computed: {
        routerLink() { // get redirected link based on current page
            if (this.page == 'my-campaigns') {
                return '/my-campaign/' + this.campaign.id;
            } 
            return '/campaigns/' + this.campaign.id;
        },
        calculateDaysLeft() { // calculate days left until campaign ends
            if(!this.campaign.endDate) return 0;
            
            const endDate = new Date(this.campaign.endDate);
            const today = new Date();
            const timeDiff = endDate - today;
            return Math.max(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)), 0);
        },
        formatCurrency() { // format currency using helper function
            return (amount) => helper.formatCurrency(amount);
        },
        progressPercent() { // calculate progress percentage
            if (!this.campaign.target) return 0;
            return Math.min(Math.round((this.campaign.current / this.campaign.target) * 100), 100);
        }
    }
}
</script>

<style scoped>
    .campaign-card {
        border-radius: 0.75rem;
        text-decoration: none;
    }

    .bg-secondary {
        background-color: var(--dark-primary-color) !important;
        border-radius: 3rem;
    }

    .badge {
        border-radius: 1rem;
    }

    .campaign-card-img {
        height: 150px;
        object-fit: cover;
    }
</style>