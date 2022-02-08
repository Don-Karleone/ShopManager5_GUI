<template>
  <div id="nav">
    <div id="signed" v-show="userSigned">
      <router-link to="/">Produkty</router-link> |
      <router-link to="/employees">Pracownicy</router-link> |
      <router-link to="/invoices">Faktury</router-link> |
      <router-link to="/clients">Klienci</router-link> |
    </div>
    <router-link to="/about"> O aplikacji</router-link> |
    <router-link to="/signin">{{ signin }}</router-link>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  props: {
    signin: String,
    userSigned: Boolean,
  },
};
</script>

<style scoped>
#nav {
  margin-bottom: 30px;
}

#nav a {
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

#nav a.router-link-exact-active {
  color: #ffa600;
}
#signed {
  display: inline-block;
}
</style>
