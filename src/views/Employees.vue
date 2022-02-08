<template>
  <Button
    @click="toggleUserInfo"
    :text="
      showUserInfo
        ? 'Informacje o zalogowanym użytkowniku (zamknij)'
        : 'Informacje o zalogowanym użytkowniku'
    "
    :color="showUserInfo ? '#ffa600' : 'rgb(0, 73, 18)'"
  />
  <div id="front">
    <div id="currentUser">
      <div id="userInfo" v-show="showUserInfo">
        <h4>Identyfikator: {{ claims.Id }}</h4>
        <h4>Imię: {{ claims.FirstName }}</h4>
        <h4>Stanowisko: {{ claims.Role }}</h4>
        <h4>Email: {{ claims.Email }}</h4>
      </div>
    </div>
  </div>
  <div id="EmployeesInfo" v-show="hasAccess">
    <div>
      <Button
        @click="toggleAddEmployee"
        :text="showEmployeeForm ? 'Nowy pracownik (zamknij)' : 'Nowy pracownik'"
        :color="showEmployeeForm ? '#ffa600' : 'rgb(0, 73, 18)'"
      />
    </div>
    <div id="front">
      <form
        v-show="showEmployeeForm"
        id="addEmployee"
        @submit.prevent="handleSubmit"
      >
        <div v-show="showEditEmployee" id="editedEmployee">
          <h3>ID: {{ editedEmployeeId }}</h3>
        </div>
        <div class="input">
          Imię:<input type="text" v-model="firstName" /> Nazwisko:<input
            type="text"
            v-model="lastName"
          />
          Email:<input type="email" v-model="email" autocomplete="new-email" />
          Hasło:<input
            type="password"
            v-model="password"
            autocomplete="new-password"
          /><br />
          Numer telefonu: <input type="text" v-model="phone" />
          Stanowisko:
          <select id="roles" v-model="role">
            <option value="Kierownik">Kierownik</option>
            <option value="Sprzedawca">Sprzedawca</option>
            <option value="Magazynier">Magazynier</option>
          </select>
          Stan konta:
          <select id="status" v-model="status">
            <option value="Aktywny">Aktywny</option>
            <option value="Nieaktywny">Nieaktywny</option>
          </select>
          <br />
          <br />
        </div>
        <br />
        <Button
          @click="addEmployee"
          v-show="showAddEmployee"
          text="Dodaj nowe konto pracownika"
        />
        <br />
        <Button
          @click="editEmployee"
          v-show="showEditEmployee"
          text="Prześlij modyfikacje"
        />
      </form>
    </div>
    <div id="front">
      <div>
        <input @change="switchZeros" type="checkbox" id="showZeros" checked />
        <label for="showZeros">Pokazuj nieaktywne konta</label>
      </div>
      <Table
        @delete-item="deleteEmployee"
        @select-item="openEditForm"
        :showDelete="true"
        :mainTable="true"
        :items="employees"
        :columnNames="columnNames"
        :columns="columns"
      />
    </div>
  </div>
</template>

<script>
import VueJwtDecode from "vue-jwt-decode";
import Button from "../components/Button.vue";
import Table from "../components/Table.vue";
import authHeader from "../services/auth-header";
import axios from "axios";
const API_URL = "api/employees/";

export default {
  Name: "Employees",
  components: {
    Table,
    Button,
  },
  data() {
    return {
      showUserInfo: false,
      showEmployeeForm: false,
      showEditEmployee: false,
      editedEmployeeId: "",
      showAddEmployee: false,
      showZeros: true,
      addEmployeeButtonText: String,
      token: "",
      claims: "",
      employees: [],
      columnNames: [
        "ID",
        "Imię",
        "Nazwisko",
        "Email",
        "Telefon",
        "Status",
        "Stanowisko",
      ],
      columns: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "state",
        "role",
      ],
    };
  },
  async created() {
    if (this.userHasAccess()) {
      this.employees = await this.fetchEmployees();
      for (var i = 0; i < this.employees.length; i++) {
        if (this.employees[i].state === 0) {
          this.employees[i].state = "Aktywny";
        } else {
          this.employees[i].state = "Nieaktywny";
        }
        if (this.employees[i].role == "Administrator") {
          this.employees[i].role = "Kierownik";
        }
        if (this.employees[i].role == "Warehouse") {
          this.employees[i].role = "Magazynier";
        }
        if (this.employees[i].role == "Seller") {
          this.employees[i].role = "Sprzedawca";
        }
      }
    }
  },
  methods: {
    async fetchEmployees() {
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
    toggleUserInfo() {
      this.showUserInfo = !this.showUserInfo;
    },
    switchZeros() {
      this.showZeros = !this.showZeros;
      if (!this.showZeros) {
        for (var i = 0; i < this.employees.length; i++) {
          if (this.employees[i].state === "Nieaktywny") {
            this.employees.splice(i, 1);
          }
        }
      } else {
        location.reload();
      }
    },
    async deleteEmployee(id) {
      for (var i = 0; i < this.employees.length; i++) {
        if (this.employees[i].id === id) {
          if (
            confirm(
              "Czy na pewno usunąć pracownika " +
                this.employees[i].firstName +
                " " +
                this.employees[i].lastName +
                "?"
            )
          ) {
            await axios
              .delete(API_URL + id, { headers: authHeader() })
              .catch((error) => {
                if (!error.response) {
                  alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                  location.reload();
                } else if (error.response.status === 500) {
                  alert("Błąd serwera. Spróbuj ponownie za chwilę.");
                  location.reload();
                }
              });
            this.employees.splice(i, 1);
          }
        }
      }
    },
    openEditForm(employee) {
      const id = employee.id;
      for (var i = 0; i < this.employees.length; i++) {
        if (this.employees[i].id === id) {
          this.showEmployeeForm = true;
          this.showEditEmployee = true;
          this.showAddEmployee = false;
          this.editedEmployeeId = this.employees[i].id;

          this.firstName = this.employees[i].firstName;
          this.lastName = this.employees[i].lastName;
          this.email = this.employees[i].email;
          this.phone = this.employees[i].phoneNumber;
          this.role = this.employees[i].role;
          this.status = this.employees[i].state;
        }
      }
    },
    async editEmployee() {
      if (this.editedEmployeeId) {
        for (var i = 0; i < this.employees.length; i++) {
          if (this.employees[i].id === this.editedEmployeeId) {
            if (
              this.firstName &&
              this.lastName &&
              this.email &&
              this.phone &&
              this.role
            ) {
              if (confirm("Czy jesteś pewien dokonanych zmian?")) {
                var editedEmployee = {
                  firstName: this.firstName,
                  lastName: this.lastName,
                  email: this.email,
                  phoneNumber: this.phone,
                  role: String,
                  state: String,
                  password: String,
                };
                if (this.role == "Kierownik") {
                  editedEmployee.role = "Administrator";
                }
                if (this.role == "Sprzedawca") {
                  editedEmployee.role = "Seller";
                }
                if (this.role == "Magazynier") {
                  editedEmployee.role = "Warehouse";
                }
                if (this.status == "Aktywny") {
                  editedEmployee.state = 0;
                }
                if (this.status == "Nieaktywny") {
                  editedEmployee.state = 1;
                }
                if (this.password) {
                  editedEmployee.password = this.password;
                }

                await axios
                  .put(API_URL + this.editedEmployeeId, editedEmployee, {
                    headers: authHeader(),
                  })
                  .catch((error) => {
                    if (!error.response) {
                      alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                      location.reload();
                    } else if (error.response.status === 500) {
                      alert("Błąd serwera. Spróbuj ponownie za chwilę.");
                      location.reload();
                    }
                  });

                this.employees[i].firstName = this.firstName;
                this.employees[i].lastName = this.lastName;
                this.employees[i].email = this.email;
                this.employees[i].phoneNumber = this.phone;
                this.employees[i].role = this.role;
                this.employees[i].state = this.status;

                this.showEmployeeForm = false;
              }
            } else {
              alert("Wypełnij wszystkie pola");
            }
          }
        }
      }
    },
    async addEmployee() {
      if (
        this.firstName &&
        this.lastName &&
        this.email &&
        this.phone &&
        this.password &&
        this.role
      ) {
        if (confirm("Czy jesteś pewien wprwoadzonych danych?")) {
          var newEmployee = {
            Imię: String,
            Nazwisko: String,
            Email: String,
            Telefon: String,
            Hasło: String,
            Stanowisko: String,
            Status: String,
          };
          newEmployee.firstName = this.firstName;
          newEmployee.lastName = this.lastName;
          newEmployee.email = this.email;
          newEmployee.phoneNumber = this.phone;
          newEmployee.role = this.role;
          newEmployee.state = 0;
          newEmployee.password = this.password

          const response = await axios
            .post(API_URL, newEmployee, {
              headers: authHeader(),
            })
            .catch((error) => {
              if (!error.response) {
                alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                location.reload();
              } else if (error.response.status === 500) {
                alert("Błąd serwera. Spróbuj ponownie za chwilę.");
              }
            });
          newEmployee.id= await response.data
          this.employees.push(newEmployee);
          this.showEmployeeForm = false;
        }
      } else {
        alert("Wypełnij wszystkie pola");
      }
    },
    toggleAddEmployee() {
      this.showEmployeeForm = !this.showEmployeeForm;
      this.showEditEmployee = false;
      this.showAddEmployee = true;
      this.firstName = "";
      this.lastName = "";
      this.email = "";
      this.password = "";
      this.phone = "";
      this.role = "";
      this.status = "";
    },
    userHasAccess() {
      const user = sessionStorage.getItem("user");
      if (!user) {
        this.$router.push("/signin");
      } else {
        this.token = JSON.parse(user).token;
        this.claims = VueJwtDecode.decode(this.token);
        if (this.claims.Role === "Administrator") {
          this.claims.Role = "Kierownik";
          this.hasAccess = true;
          return true;
        }
        if (this.claims.Role == "Seller") {
          this.claims.Role = "Sprzedawca";
        }
        if (this.claims.Role == "Warehouse") {
          this.claims.Role = "Magazynier";
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
input {
  height: 25px;
  margin: 10px;
  border-radius: 25px;
  border-color: black;
  padding-left: 10px;
  padding-right: 10px;
}
Button {
  margin-bottom: 15px;
}
select {
  height: 25px;
  border-radius: 25px;
  padding: 2px;
  border: 2px solid black;
}
#editedEmployee {
  display: inline-block;
}
h3 {
  margin: 0px;
  margin-top: 5px;
}
h4 {
  text-align: left;
}
.input {
  margin: 10px;
  display: block;
}
#front {
  border-radius: 50px;
  box-shadow: 0px -24px 21px -28px rgba(66, 68, 90, 1);
}
#currentUser {
  width: 300px;
  display: inline-block;
  word-wrap: break-word;
  text-align: center;
}
#roles {
  min-height: 30px;
}
</style>