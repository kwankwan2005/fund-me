import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CampaignListView from '../views/CampaignListView.vue'
import CampaignDetailView from '../views/CampaignDetailView.vue'
import DonationView from '../views/DonationView.vue'
import ProfileView from '../views/ProfileView.vue'
import CampaignForm from '../views/CampaignForm.vue'
import { useAuthStore } from '@/stores/authStore'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/login',
        name: 'login',
        component: AuthView,
        meta: { hideNav: true, requiresAuth: "guest" } // hide navigation bar for auth page
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView,
        meta: { hideNav: true, requiresAuth: "guest" } // hide navigation bar for auth page
    },
    {
        path: '/campaigns',
        name: 'campaigns',
        component: CampaignListView
    },
    {
        path: '/campaigns/:id',
        name: 'campaignDetail',
        component: CampaignDetailView
    },
    {
        path: '/campaigns/donate/:id',
        name: 'donate',
        component: DonationView,
        meta: { requiresAuth: "all" }
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfileView,
        meta: { requiresAuth: "all" }
    },
    {
        path: '/my-campaign/:campaignId',
        name: 'myCampaign',
        component: CampaignForm,
        meta: { requiresAuth: "organization" }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// setup navigation guards
router.beforeEach((to) => {
    const authStore = useAuthStore()

    // guest routes: if user already logged in will be pushed back to homepage
    if (to.meta.requiresAuth == "guest" && authStore.user) {
        return { name: 'home' }
    }

    // "all" routes: unauthenticated users will be required to login first
    if (to.meta.requiresAuth == "all" && !authStore.user) {
        return { name: 'login' }
    }

    // specialized route for each role
    if (to.meta.requiresAuth == "organization" && (!authStore.user || authStore.user.role !== 'organization')) {
        if(authStore.user) {
            return { name: 'profile' } // redirect to profile if user is logged in but not an organization
        }
        return { name: 'login' } // redirect to login if not logged in
    }
})

export default router