<template>
    <div class="favorite-campaigns">
        <!-- Loading -->
        <LoadingSplash
            v-if="loading"
            title="Loading your favorite campaigns..."
            description="Please wait while we fetch your favorite campaigns."
        />

        <!-- Error -->
        <NotFound
            v-else-if="error"
            title="Error loading favorites"
            :description="errorMessage"
        />

        <!-- List of favorite campaigns -->
        <div v-else-if="favoriteCampaigns && favoriteCampaigns.length > 0">
            <div class="mb-4">
                <h3>Favorite campaigns ({{ favoriteCampaigns.length }})</h3>
            </div>

            <!-- Campaign list -->
            <CampaignList :campaigns="paginatedCampaigns" @handleAction="handleCampaignAction" :page="'favorites'" />
        
            <!-- Pagination -->
            <div class="d-flex justify-content-center mt-5">
                <paginate
                    v-model="page"
                    :page-count="totalPages"
                    :prev-text="'Previous'"
                    :next-text="'Next'"
                    :container-class="'pagination'"
                    :page-class="'page-item'"
                    :active-class="'active'"
                />
            </div>
        </div>

        <!-- No favorites -->
        <NotFound
            v-else
            title="No favorite campaigns yet"
            description="You haven't added any campaigns to your favorites."
            link="/campaigns"
            linkText="Browse campaigns"
        />
    </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import api from '@/utils/api'
import CampaignList from '@/components/campaign/CampaignList.vue'
import LoadingSplash from '@/components/common/LoadingSplash.vue'
import NotFound from '@/components/common/NotFound.vue'
import Paginate from 'vuejs-paginate-next'
import { toast } from 'vue3-toastify'

export default {
    name: 'FavoriteCampaigns',
    components: {
        CampaignList,
        LoadingSplash,
        NotFound,
        Paginate
    },
    data() {
        return {
            authStore: useAuthStore(),
            favoriteCampaigns: [],
            loading: false,
            error: false,
            errorMessage: '',
            page: 1,
            itemsPerPage: 6
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.favoriteCampaigns.length / this.itemsPerPage);
        },
        paginatedCampaigns() {
            const start = (this.page - 1) * this.itemsPerPage;
            return this.favoriteCampaigns.slice(start, start + this.itemsPerPage);
        }
    },
    methods: {
        async fetchFavoriteCampaigns() { // fetch favorite campaigns from API
            this.loading = true;
            this.error = false;
            this.errorMessage = '';

            try {
                const token = await this.authStore.getIdToken();
                const response = await api.getFavoriteCampaignsList(token);

                if (response.data) {
                    this.favoriteCampaigns = response.data || [];
                } else {
                    this.error = true;
                    this.errorMessage = 'Failed to load favorite campaigns. Please try again later.';
                }

            } catch (err) {
                this.error = true;
                this.errorMessage = 'Failed to load favorite campaigns. Please try again later.';
            } finally {
                this.loading = false;
            }
        },
        async handleCampaignAction(action, campaign) { // handle actions on each favorite campaign card
            const token = await this.authStore.getIdToken();

            if (action === 'removeFavorite') { // remove campaign from favorites
                try {
                    const response = await api.removeFromFavorite(campaign.id, token);
                    if (response.status === 200) {
                        this.favoriteCampaigns = this.favoriteCampaigns.filter(c => c.id !== campaign.id);
                        toast.success('Campaign removed from favorites successfully.');
                    } 
                } 
                catch (error) {
                    toast.error(`Unable to remove campaign from favorites list. Please try again later.`);
                }
            }
        }
    },
    mounted() { // fetch favorite campaigns when the component is launched
        this.fetchFavoriteCampaigns();
    },
};
</script>

<style scoped>
    .favorite-campaigns {
        padding: 1rem 0;
    }

    h3 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .text-muted {
        margin-bottom: 1.5rem;
    }
</style>