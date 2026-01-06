<template>
    <div class="container py-4">
        <!-- Back navigation -->
        <div class="mb-3">
            <router-link
                :to="`/campaigns/${campaignId}`"
                class="btn text-muted text-decoration-none p-0 d-inline-flex align-items-center small"
            >
                <i class="bi bi-arrow-left me-2"></i> Back to campaign
            </router-link>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center py-5">
            <LoadingSplash title="Loading campaign" description="Please wait while we fetch the campaign details." />
        </div>

        <!-- Error/not found -->
        <div v-else-if="hasError" class="text-center py-5">
            <NotFound
                :title="errorTitle"
                :description="errorMessage"
                :link="`/campaigns/${campaignId}`"
                link-text="Back to campaign"
            />
        </div>

        <!-- Donation form -->
        <div v-else>
            <h2 class="text-primary fw-bold display-5 text-start text-md-center mb-4">
                Donate
            </h2>

            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="card">
                        <!-- Campaign image -->
                        <img v-lazy="campaign.image" class="card-img-top campaign-img-card" alt="Campaign image"  />
                        
                        <div class="card-body">   
                            <div v-if="qrUrl">
                                <!-- QR code display -->
                                <div class="text-center">
                                    <h4 class="mb-3">
                                        {{ waitingForConfirmation ? 'Scan to complete your donation' : 'Donation completed' }}
                                    </h4>
                                    <img v-if="waitingForConfirmation" v-lazy="qrUrl" alt="QR Code" class="img-fluid mb-3 qr-url" />
                                    <p v-if="waitingForConfirmation" class="text-muted">We accept payment from all Vietnamese banks. Use your mobile phone to scan the above QR code and transfer the money to FundMe's account.</p>

                                    <!-- Loading splash (waiting for confirmation)-->
                                    <LoadingSplash v-if="waitingForConfirmation" title="Waiting for confirmation..." description="It might take some time to confirm your transfer."/>
                                    
                                    <!-- Donation successfully -->
                                    <div class="text-center" v-else>
                                        <p class="text-success">💖 Thank you! Your support means the world to us and the communities we serve.</p>
                                        <router-link :to="`/campaigns/${campaignId}`" class="btn btn-primary w-100">Back to campaign</router-link>
                                    </div>
                                </div>
                            </div>
                            <!-- Donation form -->
                            <div v-else>
                                <h5 class="card-title">{{ campaign.title }}</h5>
                                <p class="text-muted small mb-3">by {{ campaign.orgName }}</p>

                                <Form @submit="onSubmit" :initial-values="{ isAnonymous: false }" :validation-schema="schema">
                                    <div class="mb-3 form-group">
                                        <label for="amount" class="form-label">Amount (VND) <span class="text-danger">*</span></label>
                                        <Field
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            class="form-control"
                                            :disabled="formDisabled"
                                            placeholder="Enter donation amount"
                                        />
                                        <ErrorMessage name="amount" class="text-danger small" />
                                    </div>

                                    <div class="mb-3 form-group">
                                        <label for="message" class="form-label">Message (optional)</label>
                                        <Field
                                            id="message"
                                            name="message"
                                            as="textarea"
                                            rows="3"
                                            class="form-control"
                                            :disabled="formDisabled"
                                            placeholder="Leave a message..."
                                        />
                                    </div>

                                    <div class="form-check mb-3">
                                        <Field
                                            name="isAnonymous"
                                            type="checkbox"
                                            as="input"
                                            :value="true"
                                            :unchecked-value="false"
                                            :disabled="formDisabled"
                                            class="form-check-input"
                                            id="isAnonymous"
                                        />
                                        <label class="form-check-label" for="isAnonymous">Donate anonymously</label>
                                    </div>

                                    <!-- Donate button -->
                                    <button :disabled="formDisabled" type="submit" class="btn btn-primary w-100">
                                        <span v-if="formDisabled" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        {{ formDisabled ? 'Processing...' : 'Proceed to bank transfer' }}
                                    </button>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .campaign-img-card {
        height: 200px;
        object-fit: cover;
    }

    .qr-url {
        max-width: 150px;
    }

    .text-danger {
        color: #dc3545 !important;
    }

    .text-primary {
        color: var(--primary-color) !important;
    }
</style>

<script>
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import LoadingSplash from '@/components/common/LoadingSplash.vue'
import NotFound from '@/components/common/NotFound.vue'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/authStore'
import { db } from '@/services/firebase'
import { ref, onValue, off } from 'firebase/database'
import { toast } from 'vue3-toastify'

export default {
    name: 'DonationView',
    components: {
        Form,
        Field,
        ErrorMessage,
        LoadingSplash,
        NotFound
    },
    data() {
        return {
            authStore: useAuthStore(),
            isLoading: true,
            hasError: false,
            formDisabled: false,
            errorTitle: '',
            errorMessage: '',
            qrUrl: null,
            campaignId: this.$route.params.id,
            campaign: null,
            schema: yup.object({
                amount: yup
                    .number()
                    .required('Amount is required')
                    .min(2000, 'Minimum amount is 2,000 VND')
                    .typeError('Please enter a valid amount'),
                message: yup.string().nullable(),
                isAnonymous: yup.boolean()
            }),
            pendingTransactionId: null,
            waitingForConfirmation: true
        }
    },
    async mounted() { // load campaign details
        await this.loadCampaign()
    },
    watch: { // watch for campaign ID changes
        '$route.params.id': 'loadCampaign'
    },
    methods: {
        async loadCampaign() { // load campaign details
            try {
                this.isLoading = true
                this.hasError = false

                const response = await api.getCampaignById(this.$route.params.id)
                if (!response.data) { // campaign not found
                    this.hasError = true
                    this.errorTitle = 'Campaign not found'
                    this.errorMessage = 'The campaign you are looking for does not exist or has been removed.'
                    return
                }
                this.campaign = response.data

                if (!this.campaign.isActive) { // campaign is inactive
                    this.hasError = true
                    this.errorTitle = 'This campaign is inactive'
                    this.errorMessage = 'Currently, this campaign is not accepting donations. Please check back later.'
                    return
                }

                if (this.campaign.current >= this.campaign.target) { // campaign fully funded
                    this.hasError = true
                    this.errorTitle = 'Campaign fully funded'
                    this.errorMessage = 'This campaign has already reached its funding goal. Please check back later for updates.'
                    return
                }

                if (!this.campaign.endDate || new Date(this.campaign.endDate) < new Date()) { // campaign ended
                    this.hasError = true
                    this.errorTitle = 'Campaign ended'
                    this.errorMessage = 'This campaign has ended and is no longer accepting donations.'
                    return
                }

            } catch (error) {
                this.hasError = true
                this.errorTitle = 'Error loading campaign'
                this.errorMessage = 'Unable to load campaign details. Please try again later.'
            } finally {
                this.isLoading = false
            }
        },
        async onSubmit(values) {
            try {
                this.formDisabled = true

                const idToken = await this.authStore.getIdToken()
                const response = await api.postDonation(this.campaignId, values, idToken)

                this.qrUrl = response.data.qrUrl
                this.pendingTransactionId = response.data.id
                this.updateDonationStatus() // subscribe for realtime donation status updates
            } catch (error) {
                console.error('Error processing donation:', error)
                toast.error('Something went wrong. Please try again.')
            } finally {
                this.formDisabled = false
            }
        },
        updateDonationStatus() { // subscribe for realtime donation status updates
            const path = `donations/${this.campaignId}/${this.pendingTransactionId}`
            const dbRef = ref(db, path)

            onValue(dbRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    this.waitingForConfirmation = false
                    off(dbRef); // unsubscribe from updates
                }
            });

        }
    }
}
</script>