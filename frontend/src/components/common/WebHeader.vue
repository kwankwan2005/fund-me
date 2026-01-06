<template>
    <!-- Header -->
    <header class="header shadow-sm">
        <nav class="navbar navbar-expand-lg">
            <div class="container">
                <!-- Logo -->
                <a class="fw-bold" href="#">
                    <img class="navbar-brand" src="@/assets/logo_white.png" alt="FundMe Logo" />
                </a>
                <!-- Navbar toggler -->
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <!-- Navbar links -->
                <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/" exact-active-class="active-tab">Home</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/campaigns" exact-active-class="active-tab">Campaigns</router-link>
                        </li>
                        <!-- Dropdown for authenticated users -->
                        <li v-if="user" class="nav-item dropdown">
                            <a
                                class="nav-link dropdown-toggle user-nav text-white fw-semibold"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                {{ user.email }}
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <router-link class="dropdown-item" to="/profile">My profile</router-link>
                                </li>
                                <li>
                                    <button class="dropdown-item text-danger" @click="logOut">Sign out</button>
                                </li>
                            </ul>
                        </li>
                        <li v-else class="nav-item">
                            <router-link class="nav-link" to="/login" exact-active-class="active-tab">Sign in</router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import { auth } from '@/services/firebase'
import { signOut } from 'firebase/auth'

export default {
    name: 'WebHeader', 
    data() {
        return {
            authStore: useAuthStore(), // access the auth store
        }
    },
    computed: {
        user() { // get the current user from the auth store
            return this.authStore.user
        }
    },
    methods: {
        async logOut() { // log out
            await signOut(auth)
            this.authStore.clearUser()
            this.$router.push('/login')
        }
    }
}
</script>

<style scoped>
    .header {
        background-color: var(--primary-color);
        color: white;
    }

    .navbar-toggler {
        border-color: white;
    }

    .navbar-toggler-icon { /* change the navbar toggler icon to white */
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 1)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
    }

    .navbar-nav .nav-link {
        color: white;
    }

    .navbar-brand {
        max-width: 150px;
        height: auto;
    }

    .active-tab, .nav-link:hover {
        font-weight: bold;
        color: white !important;
        border-bottom: 2px solid white;
        transition: all 0.15s ease-in-out;
    }

    .navbar-nav {
        gap: 1.5rem;
    }
</style>