<template>
  <div class="header">
    <Header />
    <Navbar :signin="userSigned ? ' Wyloguj się' : ' Zaloguj się'" :userSigned="userSigned"/>
  </div>
  <div class="view">
    <router-view @userSigned="changeSignText()" />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Navbar from "./components/Navbar.vue";

export default {
  name: "App",
  data() {
    return {
      userSigned: false,
    };
  },
  components: {
    Header,
    Navbar,
  },
  methods: {
    isUserLoggedIn: function () {
      if (!sessionStorage.getItem("user")) {
        this.$router.push("/signin");
      }else {
        this.userSigned = true;}
    },
  },
  beforeMount() {
    this.isUserLoggedIn();
  },
  watch: {
    $route(to, from) {
      if (from.path == "/signin" && to.path != "/about") {
        this.userSigned = true;
      }
    },
  },
};
</script>


<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins&display=swap");

body {
  font-family: "Poppins", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1 {
  font-size: 60px;
  margin-bottom: 0px;
}
h2 {
  font-size: 50px;
}
h3 {
  font-size: 30px;
}

.header {
  margin-bottom: 25px;
  padding-bottom: 1px;
  border-radius: 50px;
  box-shadow: 0px 24px 21px -28px rgba(66, 68, 90, 1);
}

#app {
  text-align: center;
  color: #333;
}
</style>
