<template>
  <div v-show="hasAccess">
    <div>
      <Button
        @click="toggleAddClient"
        :text="showClientForm ? 'Zamknij' : 'Nowy klient'"
        :color="showClientForm ? '#ffa600' : 'rgb(0, 73, 18)'"
      />
    </div>
    <div id="front">
      <form
        v-show="showClientForm"
        id="addClient"
        @submit.prevent="handleSubmit"
      >
        <div v-show="showEditClient" id="editedClient">
          <h3>ID: {{ editedClientId }}</h3>
        </div>
        <div class="input">
          Imię:<input type="text" v-model="firstName" /> Nazwisko:<input
            type="text"
            v-model="lastName"
          />
          Email:<input type="email" v-model="email" /> Miasto:<input
            type="text"
            v-model="city"
          />
          Ulica:<input type="text" v-model="street" /> <br />
          NIP:<input type="text" v-model="nip" /> Numer budynku:<input
            type="text"
            v-model="buildingNumber"
          />
          Nazwa firmy:<input type="text" v-model="companyName" /> Numer
          telefonu:<input type="text" v-model="phone" /> Data urodzenia:<input
            type="date"
            v-model="dateOfBirth"
          />
        </div>
        <Button
          @click="addClient"
          v-show="showAddClient"
          text="Dodaj nowego klienta"
        />
        <br />
        <Button
          @click="editClient"
          v-show="showEditClient"
          text="Prześlij modyfikacje"
        />
      </form>
    </div>
    <div id="front">
      <div class="tableContainer">
        <Table
          @delete-item="deleteClient"
          @select-item="openEditForm"
          :showDelete="true"
          :mainTable="true"
          :items="clients"
          :columnNames="columnNames"
          :columns="columns"
        />
      </div>
    </div>
  </div>
</template>

<script>
import VueJwtDecode from "vue-jwt-decode";
import Button from "../components/Button.vue";
import Table from "../components/Table.vue";
import authHeader from "../services/auth-header";
import axios from "axios";
const API_URL = "api/clients/";

export default {
  Name: "Clients",
  components: {
    Table,
    Button,
  },
  data() {
    return {
      hasAccess: false,
      showClientForm: false,
      showEditClient: false,
      editedClientId: "",
      showAddClient: false,
      showZeros: true,
      token: "",
      claims: "",
      clients: [],
      clientsDob: [],
      columnNames: [
        "ID",
        "Imię",
        "Nazwisko",
        "Data urodzenia",
        "Numer telefonu",
        "Email",
        "Miasto",
        "Ulica",
        "Numer budynku",
        "Nazwa firmy",
        "NIP",
      ],
      columns: [
        "id",
        "firstName",
        "lastName",
        "dateOfBirth",
        "phoneNumber",
        "email",
        "city",
        "street",
        "buildingNumber",
        "companyName",
        "nip",
      ],
    };
  },
  async created() {
    this.clients = await this.fetchClients();
    for (var i = 0; i < this.clients.length; i++) {
      this.clientsDob[i] = JSON.parse(
        JSON.stringify(this.clients[i].dateOfBirth.slice(0, 10))
      );
      var dob = new Date(this.clients[i].dateOfBirth.slice(0, 10));
      this.clients[i].dateOfBirth = dob.toLocaleDateString();
    }
  },
  methods: {
    async fetchClients() {
      const response = await axios
        .get(API_URL, { headers: authHeader() })
        .catch((error) => {
          if (!error.response) {
            alert("Błąd sieci. Spróbuj ponownie za chwilę.");
            location.reload();
          }
        });
      return response.data;
    },
    async deleteClient(id) {
      for (var i = 0; i < this.clients.length; i++) {
        if (this.clients[i].id == id) {
          if (
            confirm(
              "Czy na pewno usunąć klienta " +
                this.clients[i].firstName +
                " " +
                this.clients[i].lastName +
                "?"
            )
          ) {
            const response = await axios
              .delete(API_URL + id, { headers: authHeader() })
              .catch((error) => {
                if (!error.response) {
                  alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                  location.reload();
                }
              });
            response.status === 200
              ? this.clients.splice(i, 1)
              : alert("Błąd podczas usuwania klienta");
          }
        }
      }
    },
    openEditForm(client) {
      const id = client.id;
      for (var i = 0; i < this.clients.length; i++) {
        if (this.clients[i].id == id) {
          this.showClientForm = true;
          this.showEditClient = true;
          this.showAddClient = false;
          this.editedClientId = this.clients[i].id;

          this.firstName = this.clients[i].firstName;
          this.lastName = this.clients[i].lastName;
          this.email = this.clients[i].email;
          this.city = this.clients[i].city;
          this.street = this.clients[i].street;
          this.nip = this.clients[i].nip;
          this.buildingNumber = this.clients[i].buildingNumber;
          this.companyName = this.clients[i].companyName;
          this.phone = this.clients[i].phoneNumber;
          this.dateOfBirth = this.clientsDob[i];
        }
      }
    },
    async editClient() {
      if (this.editedClientId) {
        for (var i = 0; i < this.clients.length; i++) {
          if (this.clients[i].id === this.editedClientId) {
            if (
              this.firstName &&
              this.lastName &&
              this.email &&
              this.city &&
              this.street &&
              this.buildingNumber &&
              this.phone &&
              this.dateOfBirth
            ) {
              if (confirm("Czy jesteś pewien dokonanych zmian?")) {
                var editedClient = {
                  firstName: this.firstName,
                  lastName: this.lastName,
                  email: this.email,
                  city: this.city,
                  street: this.street,
                  nip: this.nip,
                  buildingNumber: this.buildingNumber,
                  companyName: this.companyName,
                  phoneNumber: this.phone,
                  dateOfBirth: this.dateOfBirth,
                };

                const response = await axios
                  .put(API_URL + this.editedClientId, editedClient, {
                    headers: authHeader(),
                  })
                  .catch((error) => {
                    if (!error.response) {
                      alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                      location.reload();
                    }
                    response.status === 200
                      ? this.clients.splice(i, 1)
                      : alert("Błąd serwera. Spróbuj ponownie za chwilę.");
                  });

                this.clients[i].firstName = this.firstName;
                this.clients[i].lastName = this.lastName;
                this.clients[i].email = this.email;
                this.clients[i].city = this.city;
                this.clients[i].street = this.street;
                this.clients[i].nip = this.nip;
                this.clients[i].buildingNumber = this.buildingNumber;
                this.clients[i].companyName = this.companyName;
                this.clients[i].phoneNumber = this.phone;
                this.clients[i].dateOfBirth = this.dateOfBirth;

                this.showClientForm = !this.showClientForm;
              }
            } else {
              alert("Wypełnij wszystkie pola");
            }
          }
        }
      }
    },
    async addClient() {
      if (
        this.firstName &&
        this.lastName &&
        this.email &&
        this.city &&
        this.street &&
        this.buildingNumber &&
        this.phone &&
        this.dateOfBirth
      ) {
        if (confirm("Czy jesteś pewien wprwoadzonych danych?")) {
          var newClient = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            city: this.city,
            street: this.street,
            nip: this.nip,
            buildingNumber: this.buildingNumber,
            companyName: this.companyName,
            phoneNumber: this.phone,
            dateOfBirth: this.dateOfBirth,
          };

          const response = await axios
            .post(API_URL, newClient, { headers: authHeader() })
            .catch((error) => {
              if (!error.response) {
                alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                location.reload();
              }
              response.status === 200
                ? this.clients.splice(i, 1)
                : alert("Błąd serwera. Spróbuj ponownie za chwilę.");
            });
          this.showClientForm = !this.showClientForm;

          newClient.id = await response.data;
          this.clients.push(newClient);
        }
      } else {
        alert("Wypełnij wszystkie pola");
      }
    },
    toggleAddClient() {
      this.showClientForm = !this.showClientForm;
      this.showEditClient = false;
      this.showAddClient = true;
      this.firstName = "";
      this.lastName = "";
      this.email = "";
      this.city = "";
      this.street = "";
      this.buildingNumber = "";
      this.companyName = "";
      this.nip = "";
      this.phone = "";
      this.dateOfBirth = "";
    },
    userHasAccess() {
      const user = sessionStorage.getItem("user");
      if (!user) {
        this.$router.push("/signin");
      } else {
        this.token = JSON.parse(user).token;
        this.claims = VueJwtDecode.decode(this.token);
        if (this.claims.Role != "Warehouse") {
          this.hasAccess = true;
          return true;
        }
        return false;
      }
    },
  },
  beforeMount() {
    this.userHasAccess();
  },
};
</script>

<style scoped>
#front {
  border-radius: 50px;
  box-shadow: 0px -24px 21px -28px rgba(66, 68, 90, 1);
}
Button {
  margin: 15px;
}
input {
  height: 25px;
  margin: 10px;
  border-radius: 25px;
  border-color: black;
  padding-left: 10px;
  padding-right: 10px;
}
textarea {
  border-radius: 50px;
  border-color: black;
  padding: 20px;
  resize: none;
}
#editedClient {
  display: inline-block;
}
h3 {
  margin: 0px;
  margin-top: 5px;
}
.input {
  margin: 10px;
  display: block;
}
.tableContainer {
  overflow-y: scroll;
  max-height: 600px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.tableContainer::-webkit-scrollbar {
  display: none;
}
</style>