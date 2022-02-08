<template>
  <header>
    <h1>Witaj!</h1>
  </header>
<div>
  <form name='form' @submit.prevent="handleSubmit">
      <input type="email" id="email" v-model="email" placeholder="Email" autofocus><br>
      <input type="password" id="password" v-model="password" placeholder="Hasło"><br>
      <hollow-dots-spinner v-show="spin" :animation-duration="1000" :dot-size="15" :dots-num="3" color="#ffa600"/><br>
      <Button text="Zaloguj"/>
  </form>
</div>
</template>

<script>
import Button from '../components/Button.vue'
import axios from 'axios'
import "isomorphic-fetch"
import { HollowDotsSpinner } from 'epic-spinners'

const API_URL = 'https://localhost:7112/api/auth/';

export default {
  name: 'Login',
  components:{
    Button,
    HollowDotsSpinner
    },
  data(){
    return{
      spin: false
      }
    },
  methods: {
    async handleSubmit(){
      if (this.email && this.password) {
        this.spin = true;
        const response = await axios.post(API_URL + 'login', {
          email: this.email,
          password: this.password
        }).catch((error) => {
          if (!error.response) {
            alert("Błąd sieci. Spróbuj ponownie za chwilę.");
            location.reload();
          }
          else if (error.response.status === 404) {
            alert('Nieprawidłowy email lub hasło');
            location.reload();
          }
          else if (error.response.status === 500) {
            alert('Błąd serwera. Spróbuj ponownie za chwilę.');
            location.reload();
          }
        })
        if (response.data.token){
          sessionStorage.setItem('user', JSON.stringify(response.data));
          this.$router.push('/');
        }
      }
      else {
        alert("Wprowadź poprawne dane logowania")
      }
    },
       isUserLoggedIn: function() {
         if(sessionStorage.getItem('user')){
           var confirmed = confirm("Wylogować?");
           if(confirmed){
              sessionStorage.removeItem('user');
              location.reload();
           }
           this.$router.push('/')
           }
        }
  },
  beforeMount(){
    this.isUserLoggedIn()
  }
}
</script>

<style scoped>
input{
  display: inline-block;
  margin: 10px 0 0;
  border-radius: 25px;
  border: 2px solid #ffa600;
  width: 250px;
  padding: 10px;
  font-size: 18px;
}
.hollow-dots-spinner{
  display: inline-block;
}
</style>