<template>
    <!-- Loading -->
    <div class="container py-4" v-if="isLoading">
        <LoadingSplash title="Loading campaign details" description="Please wait a moment..." />
    </div>
    <!-- Campaign not found -->
    <div class="container py-4" v-if="!isLoading && !foundCampaign">
        <NotFound title="Campaign not found" description="The campaign you are looking for does not exist or has been removed." :link="`/campaigns`"
                link-text="Back to campaign list" />
    </div>
    <!-- Campaign area -->
    <div class="container py-4" v-if="!isLoading && foundCampaign">
        <!-- Navigation button -->
        <div class="mb-3">
            <router-link
                to="/campaigns"
                class="btn text-muted text-decoration-none p-0 d-inline-flex align-items-center small"
            >
                <i class="bi bi-arrow-left me-2"></i> Back to campaign list
            </router-link>
        </div>

        <!-- Title -->
        <div class="mb-3">
            <!-- Tags -->
            <div class="mb-3 d-flex flex-wrap gap-2">
                <span v-for="(tag, index) in campaign.tags" :key="index" class="badge bg-secondary">
                    {{ tag }}
                </span>
            </div>
            <h2 class="text-primary display-6 fw-bold">{{ campaign.title }}</h2>
            <small class="text-secondary">{{ formatDate(campaign.startDate) }} • {{ campaign.orgName }}</small>
        </div>

        <!-- Donation card -->
        <div class="row mb-0 mb-lg-3">
            <!-- Image -->
            <div class="col-md-8">
                <img v-lazy="campaign.image" class="full-width rounded mb-4 object-fit-cover" alt="Main campaign image" />
            </div>
            <!-- Donation info card -->
            <div class="col-md-4">
                <div class="card p-3 mb-4">
                    <!-- Progress -->
                    <p class="current-money-progress fw-bold mb-1">{{ formatCurrency(campaign.current) }} / {{ formatCurrency(campaign.target) }}</p>
                    <div class="progress mb-2">
                        <div class="progress-bar bg-success" :style="{ width: progressPercent + '%' }"></div>
                    </div>
                    <small class="text-muted">{{ progressPercent }}% completed • {{ daysLeft }} days remaining</small>
                    
                    <!-- Action buttons -->
                    <div v-if="authStore.user">
                        <router-link :to="'/campaigns/donate/' + campaign.id"  v-if="campaign.isActive && daysLeft > 0 && campaign.current < campaign.target" class="btn btn-primary w-100 mt-3">
                            Donate now
                        </router-link>
                        <button v-else-if="!isActive" class="btn btn-warning w-100 mt-3" disabled>
                            Campaign not active
                        </button>
                        <button v-else-if="campaign.current >= campaign.target" class="btn btn-success w-100 mt-3" disabled>
                            Campaign completed
                        </button>
                        <button v-else class="btn btn-secondary w-100 mt-3" disabled>
                            Campaign ended
                        </button>
                        <button v-if="!favorite" v-on:click="saveToFavorite" :disabled="disabledFavorite" class="btn btn-danger w-100 mt-2">Save to favorite list</button>
                        <button v-else class="btn btn-secondary w-100 mt-2" :disabled="disabledFavorite" v-on:click="removeFromFavorite">Remove from favorite list</button>
                    </div>

                    <!-- Noti for unauthenticated users -->
                    <div v-else class="alert alert-danger mt-3 mb-0" role="alert">
                        <span class="d-block mb-2">
                            <strong>Sign-in required</strong>
                        </span>
                        Please <router-link to="/login" class="text-decoration-none">sign in</router-link> to donate or save this campaign to your favorite collection.
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs section -->
        <div class="row">
            <!-- Tab content -->
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <!-- Tabs -->
                        <ul class="nav nav-tabs mb-3">
                            <li class="nav-item" v-for="tab in tabs" :key="tab.name">
                                <a
                                    class="nav-link"
                                    v-bind:class="{ active: activeTab === tab.name }"
                                    v-on:click="activeTab = tab.name"
                                    href="javascript:void(0)"
                                >
                                    {{ tab.label }}
                                </a>
                            </li>
                        </ul>

                        <!-- Story -->
                        <div v-if="activeTab === 'story'" class="mb-5">
                            <div v-html="campaign.description"></div>
                        </div>

                        <!-- Recent donations -->
                        <div v-if="activeTab === 'transactions'" class="mb-5">
                            <RecentDonations :transactions="transactions" :itemsPerPage="5" />
                        </div>

                        <!-- Donators list -->
                        <div v-if="activeTab === 'donators'" class="mb-5">
                            <DonatorList :donators="donators" :itemsPerPage="5" />
                        </div>

                        <!-- Comments -->
                        <div v-if="activeTab === 'comments'" class="mb-5">
                            <!-- Add comment -->
                            <div v-if="authStore.user">
                                <label for="newComment" class="form-label">Your comment</label>
                                <div class="input-group mb-3">
                                    <input id="newComment" v-model="newComment" type="text" class="form-control" :disabled="disabledComment" placeholder="Write a comment..." />
                                    <button class="btn btn-primary" @click="sendComment" :disabled="disabledComment || newComment.trim() === ''">Send</button>
                                </div>
                            </div>

                            <CommentSection :comments="comments" :itemsPerPage="5" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Related campaigns -->
            <div class="col-md-4 mt-4 mt-md-0">
                <h6 class="fw-bold mb-3">Other campaigns</h6>
                <CampaignList :related="true" :campaigns="relatedCampaigns"/>
            </div>
        </div>
    </div>
</template>

<script>
import CampaignList from '@/components/campaign/CampaignList.vue'
import RecentDonations from '@/components/campaign-details/RecentDonations.vue'
import DonatorList from '@/components/campaign-details/DonatorList.vue'
import CommentSection from '@/components/campaign-details/CommentSection.vue'
import LoadingSplash from '@/components/common/LoadingSplash.vue'
import NotFound from '@/components/common/NotFound.vue'
import { useAuthStore } from '@/stores/authStore'
import api from '@/utils/api'
import { toast } from 'vue3-toastify'
import helper from '@/utils/helper'

export default {
    name: 'CampaignDetailView',
    components: {
        CampaignList, RecentDonations, DonatorList, CommentSection, LoadingSplash, NotFound
    },
    data() {
        return {
            isLoading: true,
            authStore: useAuthStore(),
            favorite: false,
            disabledFavorite: true,
            disabledComment: false,
            tabs: [
                {
                    name: 'story',
                    label: 'Story'
                },
                {
                    name: 'transactions',
                    label: 'Recent donations'
                },
                {
                    name: 'donators',
                    label: 'Top donators'
                },
                {
                    name: 'comments',
                    label: 'Comments'
                }
            ],
            activeTab: 'story',
            foundCampaign: false,
            campaign: {},
            relatedCampaigns: [],
            newComment: '',
            comments: [],
            donators: [],
            transactions: [],
            donatorPage: 1,
            transactionPage: 1,
            commentPage: 1,
            itemsPerPage: 5,
        }
    },
    computed: {
        progressPercent() {
            return Math.min(Math.round((this.campaign.current / this.campaign.target) * 100), 100)
        },
        daysLeft() {
            const end = new Date(this.campaign.endDate)
            const today = new Date()
            const diff = end - today
            return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0)
        },
        paginatedDonators() {
            const start = (this.donatorPage - 1) * this.itemsPerPage
            return this.donators.slice(start, start + this.itemsPerPage)
        },
        paginatedTransactions() {
            const start = (this.transactionPage - 1) * this.itemsPerPage
            return this.transactions.slice(start, start + this.itemsPerPage)
        },
        paginatedComments() {
            const start = (this.commentPage - 1) * this.itemsPerPage
            return this.commentsSorted.slice(start, start + this.itemsPerPage)
        },
        transactionTotalPages() {
            return Math.ceil(this.transactions.length / this.itemsPerPage)
        },
        donatorTotalPages() {
            return Math.ceil(this.donators.length / this.itemsPerPage)
        },
        commentTotalPages() {
            return Math.ceil(this.comments.length / this.itemsPerPage)
        }
    },
    watch: { // changing campaign id on URL will triggers to re-update new campaign data
        '$route.params.id': 'updateCampaignData'
    },
    methods: {
        updateCampaignData() { // update campaign data by fetching info from APIs
            this.campaign = {}
            this.foundCampaign = false
            this.getCampaignDetails()
            this.getDonations()
            this.getDonators()
            this.getComments()
            this.getOtherCampaigns()

            // authenticated user will get info of their favorite campaigns
            // for rendering action buttons
            if(this.authStore.user) {
                this.getFavoriteCampaigns()
            }
        },
        formatCurrency(amount) {
            return helper.formatCurrency(amount)
        },
        formatDate(dateStr) {
            return helper.formatDate(dateStr)
        },
        formatDateTime(dateStr) {
            return helper.formatDateTime(dateStr)
        },
        async saveToFavorite() { // save campaign to favorite
            const idToken = await this.authStore.getIdToken()
           
            try {
                this.disabledFavorite = true
                await api.saveToFavorite(this.campaign.id, idToken)
                toast.success('Campaign saved to your favorite list!')
            } catch (error) {
                toast.error('Failed to save campaign to favorites')
            } finally {
                this.disabledFavorite = false
                this.favorite = !this.favorite
            }
        },
        async removeFromFavorite() { // remove campaign from favorite
            const idToken = await this.authStore.getIdToken()
            
            try {
                this.disabledFavorite = true
                await api.removeFromFavorite(this.campaign.id, idToken)
                toast.success('Campaign removed from your favorite list!')
            } catch (error) {
                toast.error('Failed to remove campaign from favorites')
            } finally {
                this.disabledFavorite = false
                this.favorite = !this.favorite
            }
        },
        async sendComment() { // send comment to the campaign
            if (!this.newComment.trim()) return

            this.disabledComment = true
            try {
                const idToken = await this.authStore.getIdToken()
                const response = await api.postComments(this.campaign.id, this.newComment, idToken)
                this.comments.unshift(response.data.comment) // add the comment to the top (which is the latest one)
                this.newComment = ''
                toast.success('Comment sent successfully.')
            } catch (error) {
                toast.error('Failed to send comment. Please try again later.')
            } finally {
                this.disabledComment = false
            }
        },
        async getCampaignDetails() { // get campaign details
            this.isLoading = true
            try {
                const response = await api.getCampaignById(this.$route.params.id)
                this.campaign = response.data
                this.foundCampaign = true
            } catch (error) {
                console.error('Failed to fetch campaigns:', error)
            } finally {
                this.isLoading = false
            }
        },
        async getDonations() { // get recent donations
            try {
                const response = await api.getDonationsByCampaignId(this.$route.params.id)
                this.transactions = response.data || []
            } catch (error) {
                console.error('Failed to fetch donations:', error)
            }
        },
        async getDonators() { // get list of donators
            try {
                const response = await api.getDonatorsByCampaignId(this.$route.params.id)
                this.donators = response.data || []
            } catch (error) {
                console.error('Failed to fetch donators:', error)
            }
        },
        async getComments() { // get list comments
            try {
                const response = await api.getCommentsByCampaignId(this.$route.params.id)
                this.comments = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) || []
            } catch (error) {
                console.error('Failed to fetch comments:', error)
            }
        },
        async getOtherCampaigns() { // get other campaigns
            try {
                const response = await api.getOtherCampaignsByCampaignId(this.$route.params.id)
                this.relatedCampaigns = response.data || []
            } catch (error) {
                console.error('Failed to fetch related campaigns:', error)
            }
        },
        async getFavoriteCampaigns() { // get user favorite campaigns
            const idToken = await this.authStore.getIdToken()
            try {
                this.disabledFavorite = true
                const response = await api.getFavoriteCampaigns(idToken)
                if(response.data.includes(this.campaign.id)) {
                    this.favorite = true
                } else {
                    this.favorite = false
                }
            } catch (error) {
                console.error('Failed to fetch favorite campaigns:', error)
            } finally {
                this.disabledFavorite = false
            }
        }
    },
    mounted() { // update campaign data on mounted
        this.updateCampaignData()
    }
}
</script>

<style scoped>
    .text-primary {
        color: var(--primary-color) !important;
    }
    .full-width {
        width: 100%;
        height: auto;
        max-height: 450px;
    }
    .progress {
        height: 6px;
    }
    .current-money-progress {
        font-size: 1.5rem;
    }
    .bg-secondary {
        background-color: var(--dark-primary-color) !important;
        border-radius: 3rem;
    }
    .badge {
        border-radius: 1rem;
    }
</style>