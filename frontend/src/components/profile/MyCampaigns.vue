<template>
    <div class="my-campaigns">
        <!-- Loading -->
        <LoadingSplash
            v-if="loading"
            title="Loading your campaigns..."
            description="Please wait while we fetch your created campaigns."
        />

        <!-- Error -->
        <NotFound
            v-else-if="error"
            title="Error loading campaigns"
            :description="errorMessage"
        />

        <!-- Campaign list -->
        <div v-else-if="myCampaigns && myCampaigns.length > 0">
            <div class="mb-4 d-flex justify-content-between align-items-center flex-wrap">
                <h3>My campaigns ({{ myCampaigns.length }})</h3>

                <!-- Create new campaign button -->
                <router-link to="/my-campaign/create" class="btn btn-primary">
                    <i class="bi bi-plus-lg"></i> Create new campaign
                </router-link>
            </div>
            
            <!-- Campaign list -->
            <CampaignList 
                :campaigns="paginatedCampaigns"
                :page="'my-campaigns'" 
            />

            <!-- Pagination -->
            <div class="d-flex justify-content-center mt-5">
                <paginate
                    v-model="page"
                    :page-count="totalPages"
                    prev-text="Previous"
                    next-text="Next"
                    container-class="pagination"
                    page-class="page-item"
                    active-class="active"
                />
            </div>
        </div>

        <!-- No campaigns noti -->
        <NotFound
            v-else
            title="No campaigns yet"
            description="You haven't created any campaigns."
            link="/my-campaign/create"
            linkText="Create your first campaign"
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

export default {
    name: 'MyCampaigns',
    components: {
        CampaignList,
        LoadingSplash,
        NotFound,
        Paginate
    },
    data() {
        return {
            authStore: useAuthStore(),
            myCampaigns: [],
            loading: false,
            error: false,
            errorMessage: '',
            page: 1,
            itemsPerPage: 6
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.myCampaigns.length / this.itemsPerPage)
        },
        paginatedCampaigns() {
            const start = (this.page - 1) * this.itemsPerPage
            return this.myCampaigns.slice(start, start + this.itemsPerPage)
        }
    },
    methods: {
        async fetchMyCampaigns() { // fetch user's created campaigns
            this.loading = true
            this.error = false
            this.errorMessage = ''

            try {
                const token = await this.authStore.getIdToken()
                const response = await api.getCreatedCampaigns(token, this.authStore.user.uid)

                if (response.data) {
                    this.myCampaigns = response.data || []
                } else {
                    this.error = true
                    this.errorMessage = 'Failed to load your campaigns. Please try again later.'
                }
            } catch (err) {
                this.error = true
                this.errorMessage = 'Failed to load your campaigns. Please try again later.'
            } finally {
                this.loading = false
            }
        },
    },
    mounted() { // fetch user's created campaigns on mount
        this.fetchMyCampaigns()
    }
}
</script>

<style scoped>
    .my-campaigns {
        padding: 1rem 0;
    }

    h3 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .btn-primary {
        display: inline-flex;
        align-items: center;
    }

    .btn-primary .bi {
        margin-right: 0.25rem;
    }
</style>
