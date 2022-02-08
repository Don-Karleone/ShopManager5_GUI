<template>
  <div v-show="hasAccess">
    <div>
      <Button
        @click="toggleAddInvoice"
        :text="showInvoiceForm ? 'Zamknij' : 'Nowa faktura'"
        :color="showInvoiceForm ? '#ffa600' : 'rgb(0, 73, 18)'"
      />
    </div>
    <div id="front">
      <form
        v-show="showInvoiceForm"
        id="addInvoice"
        @submit.prevent="handleSubmit"
      >
        <div id="subTables" v-show="showAddInvoice">
          <div id="product" class="tableContainer">
            <h3>Wybierz produkty:</h3>
            <Table
              @select-item="addToBasket"
              :items="products"
              :columnNames="productColumnNames"
              :columns="productColumns"
            />
          </div>
          <br />
          <div id="client" class="tableContainer">
            <h3>Wybierz klienta:</h3>
            <Table
              @select-item="setClient"
              :items="clients"
              :columnNames="clientColumnNames"
              :columns="clientColumns"
            />
          </div>
        </div>
        <div id="basket">
          <div v-show="showInvoiceForm" id="editedInvoice">
            <div class="invoiceInfo">
              <h3 v-show="showEditInvoice">
                {{ editedInvoice.id }} / {{ editedInvoice.date }} /
              </h3>
              <h3>
                {{ this.selectedClient.firstName }}
                {{ this.selectedClient.lastName }}
              </h3>
              <h3>(ID: {{ this.selectedClient.id }})</h3>
              <h3 v-show="showEditInvoice">
                / Wystawił:
                {{ editedInvoice.employee }}
              </h3>
            </div>
          </div>
          <h4>Koszyk produktów:</h4>
          <Table
            @select-item="removeFromBasket"
            :items="productsBasket"
            :columnNames="productColumnNames"
            :columns="productColumns"
          />
          <h4>W sumie do zapłaty: {{ totalPrice }}zł</h4>
        </div>
        <Button
          @click="addInvoice"
          v-show="showAddInvoice"
          text="Dodaj nową fakturę"
        />
        <br />
      </form>
    </div>
    <div id="front">
      <div class="tableContainer">
        <Table
          @delete-item="deleteInvoice"
          @select-item="openEditForm"
          :showDelete="true"
          :mainTable="true"
          :items="invoices"
          :columnNames="invoiceColumnNames"
          :columns="invoiceColumns"
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
const API_URL_INVOICE = "api/invoices/";
const API_URL_PRODUCT = "api/products/";
const API_URL_CLIENT = "api/clients/";
const API_URL_EMPLOYEE = "api/employees/";

export default {
  Name: "Invoices",
  components: {
    Table,
    Button,
  },
  data() {
    return {
      showInvoiceForm: false,
      showEditInvoice: false,
      editedInvoice: [],
      showAddInvoice: false,
      hasAccess: false,
      signedUser: [],
      totalPrice: 0,
      showZeros: true,
      selectedClient: [],
      token: "",
      claims: "",
      productsBasket: [],
      invoicesFull: [],
      clientsDob: [],
      invoices: [],
      invoiceColumnNames: [
        "ID",
        "Data",
        "Klient",
        "Wystawił",
        "Suma do zapłaty",
      ],
      invoiceColumns: ["id", "date", "client", "employee", "priceTotal"],
      clients: [],
      clientColumnNames: [
        "ID",
        "Imię",
        "Nazwisko",
        "Numer telefonu",
        "Email",
        "Miasto",
        "Ulica",
        "Numer budynku",
        "Nazwa firmy",
        "NIP",
      ],
      clientColumns: [
        "id",
        "firstName",
        "lastName",
        "phoneNumber",
        "email",
        "city",
        "street",
        "buildingNumber",
        "companyName",
        "NIP",
      ],
      products: [],
      productColumnNames: [
        "ID",
        "Kategoria",
        "Marka",
        "Model",
        "Opis",
        "Ilość (szt.)",
        "Cena (zł/szt)",
      ],
      productColumns: [
        "id",
        "category",
        "brand",
        "model",
        "description",
        "quantity",
        "price",
      ],
    };
  },
  async created() {
    this.invoicesFull = await this.fetchInvoices();
    this.invoices = JSON.parse(JSON.stringify(this.invoicesFull));
    for (var i = 0; i < this.invoices.length; i++) {
      this.invoices[i].client =
        this.invoices[i].client.firstName +
        " " +
        this.invoices[i].client.lastName;
      this.invoices[i].employee =
        this.invoices[i].employee.firstName +
        " " +
        this.invoices[i].employee.lastName +
        " (ID: " +
        this.invoices[i].employee.id +
        ")";
    }
  },
  methods: {
    removeFromBasket(product) {
      var removedProduct = JSON.parse(JSON.stringify(product));
      for (var i = 0; i < this.productsBasket.length; i++) {
        if (this.productsBasket[i].id == removedProduct.id) {
          this.productsBasket.splice(i, 1);
          i -= 1;

          for (var i = 0; i < this.products.length; i++) {
            if (this.products[i].id == removedProduct.id) {
              this.products[i].quantity += removedProduct.quantity;
              this.totalPrice -= removedProduct.price * removedProduct.quantity;
              return;
            }
          }
        }
      }
    },
    addToBasket(product) {
      var addedProduct = JSON.parse(JSON.stringify(product));
      if (product.quantity > 0) {
        product.quantity -= 1;
        for (var i = 0; i < this.productsBasket.length; i++) {
          if (this.productsBasket[i].id == product.id) {
            this.productsBasket[i].quantity += 1;
            this.totalPrice += this.productsBasket[i].price;
            return;
          }
        }
        addedProduct.quantity = 1;
        this.totalPrice += addedProduct.price;
        this.productsBasket.push(addedProduct);
      }
    },
    setClient(client) {
      this.selectedClient = client;
    },
    async fetchEmployee(id) {
      const response = await axios
        .get(API_URL_EMPLOYEE + id, { headers: authHeader() })
        .catch((error) => {
          if (!error.response) {
            alert("Błąd sieci. Spróbuj ponownie za chwilę.");
            location.reload();
          }
        });
      this.signedUser = response.data;
    },
    async fetchInvoices() {
      const response = await axios
        .get(API_URL_INVOICE, { headers: authHeader() })
        .catch((error) => {
          if (!error.response) {
            alert("Błąd sieci. Spróbuj ponownie za chwilę.");
            location.reload();
          }
        });
      return response.data;
    },
    async fetchProducts() {
      const response = await axios
        .get(API_URL_PRODUCT, { headers: authHeader() })
        .catch((error) => {
          if (!error.response) {
            alert("Błąd sieci. Spróbuj ponownie za chwilę.");
            location.reload();
          }
        });
      for (var i = 0; i < response.data.length; i++) {
        if (response.data[i].quantity < 1) {
          response.data.splice(i, 1);
          i -= 1;
        }
      }
      this.products = response.data;
    },
    async fetchClients() {
      const response = await axios
        .get(API_URL_CLIENT, { headers: authHeader() })
        .catch((error) => {
          if (!error.response) {
            alert("Błąd sieci. Spróbuj ponownie za chwilę.");
            location.reload();
          }
        });
      this.clients = response.data;
    },
    async deleteInvoice(id) {
      for (var i = 0; i < this.invoices.length; i++) {
        if (this.invoices[i].id == id) {
          if (
            confirm(
              "Czy na pewno usunąć fakturę nr " + this.invoices[i].id + "?"
            )
          ) {
            const response = await axios
              .delete(API_URL_INVOICE + id, { headers: authHeader() })
              .catch((error) => {
                if (!error.response) {
                  alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                  location.reload();
                }
              });
            response.status === 200
              ? this.invoices.splice(i, 1)
              : alert("Błąd podczas usuwania faktury");
          }
        }
      }
    },
    openEditForm(invoice) {
      const id = invoice.id;
      for (var i = 0; i < this.invoices.length; i++) {
        if (this.invoices[i].id == id) {
          this.showInvoiceForm = true;
          this.showEditInvoice = true;
          this.showAddInvoice = false;

          this.editedInvoice = this.invoices[i];
          this.selectedClient = JSON.parse(
            JSON.stringify(this.invoicesFull[i].client)
          );
          this.productsBasket = JSON.parse(
            JSON.stringify(this.invoicesFull[i].products)
          );
          this.totalPrice = this.invoicesFull[i].priceTotal;
        }
      }
    },
    async addInvoice() {
      if (this.selectedClient && this.productsBasket != [] && this.signedUser) {
        if (confirm("Czy jesteś pewien wprwoadzonych danych?")) {
          var newInvoice = {
            client: this.selectedClient,
            employee: this.signedUser,
            products: this.productsBasket,
            totalPrice: this.totalPrice
          };

          const response = await axios
            .post(API_URL_INVOICE, newInvoice, { headers: authHeader() })
            .catch((error) => {
              if (!error.response) {
                alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                location.reload();
              }
              response.status === 200
                ? this.invoices.splice(i, 1)
                : alert("Błąd serwera. Spróbuj ponownie za chwilę.");
            });
          this.showInvoiceForm = !this.showInvoiceForm;

          newInvoice.id = await response.data;
          this.invoices.push(newInvoice);
        }
      } else {
        alert("Wprowadź niezbędne dane");
      }
    },
    toggleAddInvoice() {
      this.showInvoiceForm = !this.showInvoiceForm;
      this.showEditInvoice = false;
      this.showAddInvoice = true;
      this.editedInvoice = "";
      this.selectedClient = "";
      this.productsBasket = [];
      this.totalPrice = 0;

      this.fetchProducts();
      this.fetchClients();
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
    this.fetchEmployee(this.claims.Id);
  },
};
</script>

<style scoped>
#front {
  border-radius: 50px;
  box-shadow: 0px -24px 21px -28px rgba(66, 68, 90, 1);
}
#subTables {
  display: flex;
  justify-content: center;
}
#product {
  display: inline-block;
  overflow-y: scroll;
  max-height: 500px;
}
#client {
  display: inline-block;
  overflow-y: scroll;
  max-height: 500px;
}
#basket {
  border-radius: 50px;
  box-shadow: 0px -24px 21px -28px rgba(66, 68, 90, 1);
}
.invoiceInfo {
  display: flex;
}
.tableContainer::-webkit-scrollbar {
  display: none;
}
.tableContainer {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
Button {
  margin: 15px;
}
#editedInvoice {
  display: flex;
  justify-content: left;
  margin: 25px;
  border-bottom: 2px dashed black;
}
h3 {
  margin: 0px;
  margin-top: 5px;
}
</style>