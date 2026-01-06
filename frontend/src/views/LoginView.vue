<template>
    <div class="container-fluid vh-100">
        <div class="row h-100">
            <!-- Login form -->
            <div class="col-12 col-lg-6 d-flex align-items-center justify-content-center">
                <div class="w-100" style="max-width: 400px;">
                    <!-- Back to home button -->
                    <div class="mb-5">
                        <router-link to="/" class="btn text-muted text-decoration-none p-0 d-inline-flex align-items-center small">
                            <i class="bi bi-arrow-left me-2"></i> Back to Home
                        </router-link>
                    </div>

                    <!-- Logo and title -->
                    <div class="mb-4 text-center">
                        <img src="@/assets/logo.png" alt="FundMe Logo" class="mb-3" style="max-width: 150px;" />
                        <h2 class="fw-bold">Welcome!</h2>
                        <p class="text-muted">Please sign in to continue</p>
                    </div>

                    <!-- Login form -->
                    <Form @submit="handleLogin" :validation-schema="loginSchema">
                        <div class="mb-3 form-group">
                            <label for="email" class="form-label">Email address <span class="text-danger">*</span></label>
                            <Field id="email" placeholder="Enter your email address..." name="email" type="email" class="form-control" :disabled="formDisabled" />
                            <ErrorMessage name="email" class="text-danger small" />
                        </div>

                        <div class="mb-3 form-group">
                            <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                            <Field id="password" placeholder="Enter your password..." name="password" type="password" class="form-control" :disabled="formDisabled" />
                            <ErrorMessage name="password" class="text-danger small" />
                        </div>

                        <button :disabled="formDisabled" class="btn btn-primary w-100 mb-3" type="submit">
                            <span v-if="formDisabled" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            {{ formDisabled ? 'Please wait...' : 'Sign in' }}
                        </button>

                        <p class="text-center small">
                            Don't have an account?
                            <router-link to="/register">Sign up</router-link>
                        </p>
                    </Form>
                </div>
            </div>

            <!-- Right-side image -->
            <div class="col-lg-6 auth-banner position-relative d-none d-lg-block"></div>
        </div>
    </div>
</template>

<script>
import * as yup from 'yup'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { get, ref as dbRef } from 'firebase/database'
import { auth, db } from '@/services/firebase'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/authStore'

const loginSchema = yup.object({
    email: yup.string().required('Email address is required.'),
    password: yup.string().required('Password is required.')
})

export default {
    name: 'LoginView',
    components: { Form, Field, ErrorMessage },
    data() {
        return {
            formDisabled: false,
            loginSchema,
            authStore: useAuthStore()
        }
    },
    methods: {
        async handleLogin(values) {
            this.formDisabled = true
            try {
                const { email, password } = values

                // firebase sign in
                const userCredential = await signInWithEmailAndPassword(auth, email, password)
                const user = userCredential.user

                // fetch user info from Realtime Database
                const snapshot = await get(dbRef(db, 'users/' + user.uid))

                if (!snapshot.exists()) {
                    toast.error('User not found. Please register first.')
                    return
                }

                const userData = snapshot.val()

                // save to auth store
                this.authStore.setUser({
                    uid: user.uid,
                    email: user.email,
                    name: userData.name || '',
                    role: userData.role
                })

                this.$router.push('/') // redirect to home
            } catch (error) {
                switch (error.code) {
                    case 'auth/invalid-email':
                        toast.error('Invalid email format.')
                        break
                    case 'auth/invalid-credential':
                        toast.error('Username or password is wrong. Please try again later.')
                        break
                    default:
                        toast.error('An unexpected error occurred. Please try again later.')
                }
            } finally {
                this.formDisabled = false
            }
        }
    }
}
</script>

<style scoped>
    .auth-banner {
        background-image: url('@/assets/auth-banner.jpg');
        background-size: cover;
        background-position: center;
    }
</style>