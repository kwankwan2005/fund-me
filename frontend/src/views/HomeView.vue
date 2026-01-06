<template>
    <!-- Hero banner -->
    <section class="hero-banner text-center">
        <div class="hero-overlay d-flex flex-column justify-content-center align-items-center">
            <img class="logo-hero-banner img-fluid" src="@/assets/logo_white.png" alt="Logo Fundme Hero Banner">
            <h1 class="mt-5 display-3 fw-bold">Welcome to FundMe</h1>
            <p class="lead">Empowering change through your donations</p>
        </div>
        <div class="main-separator"></div>
    </section>

    <!-- Main content -->
    <div class="main-content">
        <div class="container">
            <!-- Introduction to the platform -->
            <section>
                <div class="row mb-5 d-flex align-items-center">
                    <div class="col-lg-6 left-col">
                        <h2 class="home-title fw-bold display-5 text-center text-lg-start text-xl-start">What is FundMe?</h2>
                        <p class="mt-4 text-center text-lg-start text-xl-start">
                            At FundMe, we connect generous hearts with meaningful causes. Our platform makes it easy to support campaigns that matter to you, ensuring your contributions make a real difference.
                            <br>
                            <br>
                            Join us to change our world.
                        </p>

                        <div class="button-row d-flex justify-content-center justify-content-lg-start justify-content-xl-start justify-content-lg-start">
                            <router-link to="/campaigns" class="btn btn-primary btn-lg mt-3">Browse campaigns</router-link>
                            <router-link to="/register" class="btn btn-outline-primary btn-lg mt-3">Join us</router-link>
                        </div>
                    </div>
                    <div class="col-lg-6 d-flex justify-content-center mt-5 mt-lg-0 mt-xl-0 justify-content-lg-end justify-content-xl-end">
                        <img src="@/assets/donate.jpg" alt="Donate picture" class="img-fluid rounded shadow-sm">
                    </div>
                </div>
            </section>

            <!-- What users can do in FundMe -->
            <section class="mt-3">
                <h2 class="home-title fw-bold display-5 text-center mb-3">In FundMe, you can...</h2>
                <div class="row mt-4">
                    <div class="col-lg-4" v-for="feature in features" :key="feature.title">
                        <div class="card mb-4 shadow-sm">
                            <div class="card-body">
                                <div class="row d-flex align-items-center">
                                    <div class="col-2 col-sm-2 col-md-2 col-lg-12 text-center">
                                        <i v-bind:class="feature.icon + ' display-6 mb-3 home-icon'"></i>
                                    </div>
                                    <div class="mt-lg-3 mt-md-3 col-10 col-sm-10 col-md-10 col-lg-12 text-start text-lg-center text-xl-center">
                                        <h5 class="card-title">{{ feature.title }}</h5>
                                        <p class="card-text">{{ feature.description }}</p>
                                    </div>
                                </div>           
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Our mission -->
            <section class="py-5">
                <h2 class="home-title fw-bold display-5 text-center mb-3">Our Mission</h2>

                <div class="row align-items-center p-5 bg-light rounded-3">
                    <!-- Logo image -->
                    <div class="col-md-5 d-flex justify-content-center text-center text-md-start mb-4 mb-md-0">
                        <img
                            src="@/assets/logo.png"
                            alt="Logo Portrait"
                            class="img-fluid rounded-3"
                            style="max-height: 500px;"
                        />
                    </div>

                    <!-- Quotation -->
                    <div class="col-md-7">
                        <blockquote class="blockquote">
                            <p class="fs-5 fst-italic">
                                "At FundMe, we believe in the power of small acts of kindness. Our mission is to build a
                                bridge between those who can give and those who need support the most. Every campaign
                                we launch is a step toward a more compassionate world."
                            </p>
                            <footer class="blockquote-footer mt-3">
                                Anh-Quan Nguyen, <cite title="Source Title">Founder & CEO of FundMe</cite>
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
    .left-col {
        text-align: left;
    }

    .main-content {
        background-color: white;
    }

    .main-separator {
        background: white;
        height: 60px;
        border-radius: 30px 30px 0px 0px;
        position: relative;
        margin-top: -60px;
    }

    .hero-banner {
        background: url('@/assets/hero-banner.jpg') no-repeat center center;
        background-size: cover;
        color: white;
        height: 650px;
    }

    .logo-hero-banner {
        max-width: 300px;
        min-width: 150px;
        width: 70vw;
    }

    .hero-overlay {
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .button-row {
        gap: 0.5rem;
    }

    .home-title, .home-icon {
        color: var(--primary-color);
    }
</style>

<script>
export default {
    name: 'HomeView',
    data() {
        return {
            loadingCampaigns: true,
            features: [
                {
                    title: 'Donate to campaigns',
                    description: 'Support causes you care about by donating to various campaigns.',
                    icon: 'bi bi-heart-fill'
                },
                {
                    title: 'Create your own campaign',
                    description: 'Start your own fundraising campaign and share it with the world.',
                    icon: 'bi bi-plus-circle-fill'
                },
                {
                    title: 'Track your donations',
                    description: 'Easily track your donations and see the impact you are making.',
                    icon: 'bi bi-bar-chart-fill'
                }
            ]
        };
    }
};
</script>