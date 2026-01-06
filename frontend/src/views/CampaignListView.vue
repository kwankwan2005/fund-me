<template>
    <div class="container py-4">
        <h2 class="text-primary fw-bold display-5 text-center text-lg-start mb-4">
            Campaigns {{ this.campaigns.length > 0 ? `(${this.campaigns.length})` : '' }}
        </h2>
        <div class="row">
            <!-- Search & filter -->
            <div class="col-12 col-xl-3 mb-4 mb-xl-0">
                <div class="card shadow-sm p-3">
                    <h5 class="mb-3">Search</h5>

                    <SearchBar placeholder="Search for campaigns..." label="Search term" name="search_term" @search="searchKeyword=$event" />

                    <h5 class="mb-3">Filter</h5>
                    <CampaignFilter @tagChange="applyStatusFilters" title="Status" :initialItems="appliedFilters.status" :listItems="statusOptions" />
                    <CampaignFilter @tagChange="applyCategoriesFilters" title="Categories" :initialItems="appliedFilters.tags" :listItems="tags" />
                </div>
            </div>

            <!-- Campaign list -->
            <div class="col-12 col-xl-9">

                <!-- Loading -->
                <div v-if="isLoading">
                    <LoadingSplash title="Loading campaigns" description="Please wait a moment..." />
                </div>

                <!-- Not found -->
                <div v-else-if="filteredCampaigns.length === 0">
                    <NotFound title='No campaigns found' description='There are no campaigns available at the moment. Please check back later.' />
                </div>

                <!-- Campaign list -->
                <div v-else>
                    <CampaignList :related="false" :campaigns="paginatedCampaigns" />

                    <!-- Pagination -->
                    <div class="d-flex justify-content-center mt-4">
                        <paginate
                            v-model="currentPage"
                            :page-count="totalPages"
                            :prev-text="'Previous'"
                            :next-text="'Next'"
                            :container-class="'pagination'"
                            :page-class="'page-item'"
                            :active-class="'active'"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .text-primary {
        color: var(--primary-color) !important;
    }
</style>

<script>
import LoadingSplash from '@/components/common/LoadingSplash.vue'
import NotFound from '@/components/common/NotFound.vue'
import SearchBar from '@/components/campaign/SearchBar.vue'
import CampaignFilter from '@/components/campaign/CampaignFilter.vue'
import CampaignList from '@/components/campaign/CampaignList.vue'
import Paginate from 'vuejs-paginate-next'
import api from '@/utils/api'

export default {
    name: 'CampaignListView',
    components: {
        CampaignList,
        LoadingSplash,
        NotFound,
        Paginate,
        SearchBar,
        CampaignFilter
    },
    data() {
        return {
            campaigns: [],
            statusOptions: ['Active', 'Inactive'],
            tags: [
                'Children',
                'Elderly',
                'Medical assistance',
                'Education',
                'Environment',
                'Disaster relief',
                'Animal welfare',
                'Community development',
            ],
            appliedFilters: {
                status: [],
                tags: []
            },
            isLoading: true,
            searchKeyword: '',
            currentPage: 1,
            itemsPerPage: 6
        }
    },
    computed: {
        filteredCampaigns() { // filter campaigns based on search keyword and applied filters
            return this.campaigns.filter(campaign => {
                const matchesSearch = campaign.title.toLowerCase().includes(this.searchKeyword.toLowerCase())

                const matchesStatus =
                    this.appliedFilters.status.length === 0 ||
                    (campaign.isActive && this.appliedFilters.status.includes('Active')) ||
                    (!campaign.isActive && this.appliedFilters.status.includes('Inactive'))

                const matchesTags =
                    this.appliedFilters.tags.length === 0 ||
                    (campaign.tags && campaign.tags.some(tag => this.appliedFilters.tags.includes(tag)))

                return matchesSearch && matchesStatus && matchesTags
            })
        },
        paginatedCampaigns() {
            const start = (this.currentPage - 1) * this.itemsPerPage
            const end = start + this.itemsPerPage
            return this.filteredCampaigns.slice(start, end)
        },
        totalPages() {
            return Math.ceil(this.filteredCampaigns.length / this.itemsPerPage) || 1
        }
    },
    methods: {
        applyStatusFilters(status) { // apply status filters to campaigns
            this.appliedFilters.status = status
            this.currentPage = 1
        },
        applyCategoriesFilters(tags) { // apply category filters to campaigns
            this.appliedFilters.tags = tags
            this.currentPage = 1
        },
        async fetchCampaigns() { // fetch campaigns from API
            this.isLoading = true
            try {
                const response = await api.getAllCampaigns()
                this.campaigns = response.data.sort((a, b) => b.isActive - a.isActive);                
            } catch (error) {
                console.error('Failed to fetch campaigns:', error)
            } finally {
                this.isLoading = false
            }
        }
    },
    mounted() { // fetch campaigns when mounted
        this.fetchCampaigns()
    }
}
</script>