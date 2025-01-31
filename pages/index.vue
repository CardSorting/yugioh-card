<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <b-container>
        <b-row class="align-items-center min-vh-100">
          <b-col md="6" class="text-center text-md-left">
            <h1 class="hero-title mb-4">
              遊戯王カードメーカー<br>
              Create Professional Yu-Gi-Oh! Cards in Minutes
            </h1>
            <p class="hero-subtitle mb-4">
              Join 10,000+ duelists crafting custom cards daily. Professional quality, instant creation, 
              zero design skills needed.
            </p>
            <div class="trust-badge mb-4">
              <font-awesome-icon :icon="['fas', 'star']" class="text-warning" />
              <span class="ml-2">4.8★ from 1000+ users</span>
            </div>
            <div class="d-flex flex-wrap justify-content-center justify-content-md-start gap-3">
              <b-button 
                v-if="isAuthenticated"
                to="/create"
                variant="primary" 
                size="lg" 
                class="create-btn"
              >
                Start Creating
              </b-button>
              <b-button 
                v-else
                @click="openAuthModal('signup')"
                variant="primary" 
                size="lg" 
                class="create-btn"
              >
                Sign Up - Free
              </b-button>
            </div>
          </b-col>
          <b-col md="6" class="text-center">
            <div class="card-showcase">
              <img src="/images/default.jpg" alt="Sample Card" class="hero-card-preview floating">
              <div class="card-glow"></div>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </section>

    <!-- Why Choose Us Section -->
    <section class="value-prop py-5">
      <b-container>
        <h2 class="section-title text-center mb-5">Why Choose YGO Card Maker?</h2>
        <b-row>
          <b-col lg="4" md="6" class="mb-4">
            <div class="value-card">
              <font-awesome-icon :icon="['fas', 'bolt']" size="2x" class="mb-3 text-primary" />
              <h3>Instant Creation</h3>
              <p>Design cards in minutes, not hours. Intuitive interface for quick results.</p>
            </div>
          </b-col>
          <b-col lg="4" md="6" class="mb-4">
            <div class="value-card">
              <font-awesome-icon :icon="['fas', 'star']" size="2x" class="mb-3 text-primary" />
              <h3>Professional Quality</h3>
              <p>Pixel-perfect card templates that match official designs.</p>
            </div>
          </b-col>
          <b-col lg="4" md="6" class="mb-4">
            <div class="value-card">
              <font-awesome-icon :icon="['fas', 'magic']" size="2x" class="mb-3 text-primary" />
              <h3>AI Art Generation</h3>
              <p>Create unique card art with our AI integration.</p>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </section>

    <!-- Features Section -->
    <section class="features py-5">
      <b-container>
        <h2 class="section-title text-center mb-5">Powerful Features</h2>
        <b-row>
          <b-col md="6" lg="3" class="mb-4">
            <div class="feature-card text-center p-4">
              <font-awesome-icon :icon="['fas', 'paint-brush']" size="2x" class="mb-3" />
              <h3>Card Designer</h3>
              <p>Drag-and-drop interface with real-time preview</p>
              <router-link to="/create" class="feature-link">Try Now →</router-link>
            </div>
          </b-col>
          <b-col md="6" lg="3" class="mb-4">
            <div class="feature-card text-center p-4">
              <font-awesome-icon :icon="['fas', 'language']" size="2x" class="mb-3" />
              <h3>Multi-Language</h3>
              <p>Create in English, Japanese, and Chinese</p>
              <router-link to="/create" class="feature-link">Learn More →</router-link>
            </div>
          </b-col>
          <b-col md="6" lg="3" class="mb-4">
            <div class="feature-card text-center p-4">
              <font-awesome-icon :icon="['fas', 'download']" size="2x" class="mb-3" />
              <h3>Easy Export</h3>
              <p>Download in various formats for any use</p>
              <router-link to="/create" class="feature-link">Export Options →</router-link>
            </div>
          </b-col>
          <b-col md="6" lg="3" class="mb-4">
            <div class="feature-card text-center p-4">
              <font-awesome-icon :icon="['fas', 'share-alt']" size="2x" class="mb-3" />
              <h3>Share & Collect</h3>
              <p>Build your collection and share with others</p>
              <router-link to="/gallery" class="feature-link">View Gallery →</router-link>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </section>

    <!-- CTA Section -->
    <section class="cta py-5">
      <b-container>
        <div class="text-center">
          <h2 class="section-title mb-4">Ready to Create Your Custom Cards?</h2>
          <p class="lead mb-4">Join 10,000+ duelists already creating amazing cards</p>
          <div class="d-flex justify-content-center gap-3 mb-4">
            <router-link to="/create" custom v-slot="{ navigate }">
              <b-button @click="navigate" variant="primary" size="lg" class="create-btn">
                Start Creating - Free
              </b-button>
            </router-link>
            <router-link to="/gallery" custom v-slot="{ navigate }">
              <b-button @click="navigate" variant="outline-primary" size="lg" class="gallery-btn">
                View Gallery
              </b-button>
            </router-link>
          </div>
          <p class="features-list">
            <span>No sign-up required</span>
            <span class="mx-3">•</span>
            <span>Instant downloads</span>
            <span class="mx-3">•</span>
            <span>Professional quality</span>
          </p>
        </div>
      </b-container>
    </section>

    <!-- Footer -->
    <footer class="footer py-4">
      <b-container>
        <b-row>
          <b-col md="6" class="text-center text-md-left mb-3 mb-md-0">
            <h5 class="mb-3">YGO Card Maker</h5>
            <p class="mb-0">Create professional Yu-Gi-Oh! cards instantly</p>
          </b-col>
          <b-col md="6" class="text-center text-md-right">
            <div class="footer-links mb-3">
              <router-link to="/create" class="mx-2">Create</router-link>
              <router-link to="/gallery" class="mx-2">Gallery</router-link>
              <a href="https://github.com/linziyou0601/yugioh-card-maker" 
                 target="_blank"
                 rel="noopener noreferrer"
                 class="mx-2">
                <font-awesome-icon :icon="['fab', 'github']" /> GitHub
              </a>
            </div>
            <p class="mb-0">
              Created by Linziyou
            </p>
          </b-col>
        </b-row>
      </b-container>
    </footer>
    <!-- Auth Modal -->
    <auth-modal v-model="showAuthModal" @auth-success="onAuthSuccess" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AuthModal from '~/components/auth/AuthModal.vue'
import UserMenu from '~/components/auth/UserMenu.vue'

export default {
  name: 'LandingPage',

  components: {
    AuthModal,
    UserMenu
  },

  data() {
    return {
      showAuthModal: false,
      initialAuthMode: 'signup'
    }
  },

  created() {
    // No immediate auth modal popup
  },

  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
  },

  methods: {
    onAuthSuccess() {
      this.$router.push('/create')
    },

    openAuthModal(mode) {
      this.initialAuthMode = mode
      this.showAuthModal = true
    }
  }
}
</script>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

@keyframes glow {
  0% { box-shadow: 0 0 20px rgba(230, 92, 0, 0.5); }
  50% { box-shadow: 0 0 40px rgba(249, 212, 35, 0.6); }
  100% { box-shadow: 0 0 20px rgba(230, 92, 0, 0.5); }
}

.landing-page {
  min-height: 100vh;
  background: url("~static/Screentone.png") round;
  background-blend-mode: overlay;
  background-color: #f8f9fa;
  color: #2c3e50;
  scroll-behavior: smooth;
}

.hero {
  padding: 8rem 0 4rem;
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%);
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(230, 92, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(249, 212, 35, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-title {
  font-family: 'en', 'zh';
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #1a2a3a;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  background: linear-gradient(45deg, #1a2a3a, #2c3e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.4rem;
  line-height: 1.6;
  color: #2c3e50;
  max-width: 600px;
  margin: 0 auto;
  font-weight: 300;
}

.card-showcase {
  position: relative;
  perspective: 1000px;
}

.hero-card-preview {
  max-width: 300px;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  transition: all 0.5s ease;
  animation: float 6s ease-in-out infinite;
}

.hero-card-preview:hover {
  transform: scale(1.05) translateY(-10px) rotateY(10deg);
}

.card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 470px;
  border-radius: 15px;
  animation: glow 3s ease-in-out infinite;
  z-index: -1;
  opacity: 0.8;
}

.create-btn {
  background: linear-gradient(45deg, #e65c00, #f9d423);
  border: none;
  padding: 0.8rem 2rem;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(230, 92, 0, 0.3);
}

.trust-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-weight: 500;
}

.features {
  background: rgba(255,255,255,0.95);
  padding: 6rem 0;
  position: relative;
}

.features::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
}

.feature-card {
  background: #ffffff;
  border-radius: 15px;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  height: 100%;
  padding: 2.5rem !important;
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
  position: relative;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(45deg, #e65c00, #f9d423);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-link {
  color: #e65c00;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  margin-top: 1rem;
}

.feature-link:hover {
  color: #f9d423;
  text-decoration: none;
  transform: translateX(5px);
}

.feature-link::after {
  content: '→';
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.feature-link:hover::after {
  transform: translateX(3px);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin: 1rem 0;
  color: #2c3e50;
}

.value-prop {
  position: relative;
  padding: 6rem 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.95) 100%);
}

.value-prop::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #1a2a3a;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(45deg, #e65c00, #f9d423);
  border-radius: 2px;
}

.value-card {
  text-align: center;
  padding: 2.5rem;
  border-radius: 15px;
  background: white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}

.value-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(230, 92, 0, 0.05), rgba(249, 212, 35, 0.05));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.value-card:hover::before {
  opacity: 1;
}

.value-card h3 {
  margin: 1.5rem 0 1rem;
  color: #1a2a3a;
  font-size: 1.5rem;
  font-weight: 600;
  position: relative;
}

.value-card .text-primary {
  color: #e65c00 !important;
  transition: transform 0.3s ease;
}

.value-card:hover .text-primary {
  transform: scale(1.1);
}

.faq {
  background: linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.95) 100%);
  padding: 6rem 0;
  position: relative;
}

.faq::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
}

.accordion >>> .card {
  border: none;
  border-radius: 15px !important;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  overflow: hidden;
  transition: all 0.3s ease;
}

.accordion >>> .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.accordion >>> .card-header {
  background: white;
  border: none;
  padding: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative;
}

.accordion >>> .card-header:hover {
  background: rgba(249, 250, 251, 0.8);
}

.accordion >>> .card-header::after {
  content: '→';
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  transition: transform 0.3s ease;
  font-weight: bold;
  opacity: 0.5;
}

.accordion >>> .card.expanded .card-header::after {
  transform: translateY(-50%) rotate(-90deg);
}

.accordion >>> .card-body {
  padding: 1.5rem;
  background: rgba(249, 250, 251, 0.5);
  border-top: 1px solid rgba(0,0,0,0.05);
  line-height: 1.6;
  color: #2c3e50;
}

.cta {
  background: linear-gradient(45deg, rgba(230, 92, 0, 0.05), rgba(249, 212, 35, 0.05));
  position: relative;
  padding: 8rem 0;
  position: relative;
  overflow: hidden;
}

.cta::before,
.cta::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  opacity: 0.1;
  z-index: 0;
}

.cta::before {
  background: #e65c00;
  top: -100px;
  left: -100px;
}

.cta::after {
  background: #f9d423;
  bottom: -100px;
  right: -100px;
}

.features-list {
  color: #666;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.7);
  padding: 1rem 2rem;
  border-radius: 50px;
  display: inline-block;
  backdrop-filter: blur(5px);
}

.features-list span {
  position: relative;
  opacity: 0.8;
}

.features-list span:not(.mx-3):hover {
  opacity: 1;
}

.footer {
  background: #ffffff;
  border-top: 1px solid rgba(0,0,0,0.05);
  padding: 3rem 0;
  margin-top: 0;
}

.footer-links {
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
}

.footer a {
  color: #2c3e50;
  opacity: 0.8;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
}

.footer a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: #0056b3;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.footer a:hover {
  opacity: 1;
  color: #0056b3;
}

.footer a:hover::after {
  transform: scaleX(1);
}

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 6px;
  border: 3px solid #f5f5f5;
}

::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
