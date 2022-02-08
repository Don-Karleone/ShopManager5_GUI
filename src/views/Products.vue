<template>
  <div v-show="hasAccess">
    <div>
      <Button
        @click="toggleAddProduct"
        :text="showProductForm ? 'Zamknij' : 'Nowy produkt'"
        :color="showProductForm ? '#ffa600' : 'rgb(0, 73, 18)'"
      />
    </div>
    <div id="front">
      <form
        v-show="showProductForm"
        id="addProduct"
        @submit.prevent="handleSubmit"
      >
        <div v-show="showEditProduct" id="editedProduct">
          <h3>ID: {{ editedProductId }}</h3>
        </div>
        <div class="input">
          Kategoria:<input
            list="categories"
            name="category"
            v-model="category"
          />
          <datalist id="categories">
            <option value="PC"></option>
            <option value="LCD"></option>
            <option value="Przewody"></option>
            <option value="Drukarki"></option>
            <option value="Akcesoria"></option>
          </datalist>
          Marka:<input type="text" v-model="brand" /> Model:<input
            type="text"
            v-model="model"
          />
        </div>
        <div class="input">
          Ilość:<input type="number" v-model="quantity" /> Cena:<input
            type="number"
            v-model="price"
            step="0.01"
          />
          <br />
        </div>
        Opis <br />
        <textarea
          id="description"
          cols="80"
          rows="5"
          v-model="description"
        ></textarea>
        <br />
        <Button
          @click="addProduct"
          v-show="showAddProduct"
          text="Dodaj nowy produkt"
        />
        <br />
        <Button
          @click="editProduct"
          v-show="showEditProduct"
          text="Prześlij modyfikacje"
        />
      </form>
    </div>
    <div id="front">
      <div>
        <input @change="switchZeros" type="checkbox" id="showZeros" checked />
        <label for="showZeros">Pokazuj produkty z zerowymi stanami</label>
      </div>
      <div class="tableContainer">
        <Table
          @delete-item="deleteProduct"
          :items="products"
          :columnNames="columnNames"
          :columns="columns"
          @select-item="openEditForm"
          :showDelete="true"
          :mainTable="true"
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
const API_URL = "api/products/";

export default {
  Name: "Products",
  components: {
    Table,
    Button,
  },
  data() {
    return {
      showProductForm: false,
      showEditProduct: false,
      editedProductId: "",
      showAddProduct: false,
      showZeros: true,
      hasAccess:false,
      token: "",
      claims: "",
      products: [],
      columnNames: [
        "ID",
        "Kategoria",
        "Marka",
        "Model",
        "Opis",
        "Ilość (szt.)",
        "Cena (zł)",
      ],
      columns: [
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
    this.products = await this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
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
    switchZeros() {
      this.showZeros = !this.showZeros;
      if (!this.showZeros) {
        for (var i = 0; i < this.products.length; i++) {
          if (this.products[i].quantity == 0) {
            this.products.splice(i, 1);
            i -= 1;
          }
        }
      } else {
        location.reload();
      }
    },
    async deleteProduct(id) {
      for (var i = 0; i < this.products.length; i++) {
        if (this.products[i].id == id) {
          if (
            confirm(
              "Czy na pewno usunąć produkt " +
                this.products[i].brand +
                " " +
                this.products[i].model +
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
              ? this.products.splice(i, 1)
              : alert("Błąd podczas usuwania produktu");
          }
        }
      }
    },
    openEditForm(product) {
      const id = product.id;
      for (var i = 0; i < this.products.length; i++) {
        if (this.products[i].id == id) {
          this.showProductForm = true;
          this.showEditProduct = true;
          this.showAddProduct = false;
          this.editedProductId = this.products[i].id;

          this.category = this.products[i].category;
          this.brand = this.products[i].brand;
          this.model = this.products[i].model;
          this.quantity = this.products[i].quantity;
          this.price = this.products[i].price;
          this.description = this.products[i].description;
        }
      }
    },
    async editProduct() {
      if (this.editedProductId) {
        for (var i = 0; i < this.products.length; i++) {
          if (this.products[i].id === this.editedProductId) {
            if (
              (this.category && this.brand && this.model && this.quantity) ||
              (this.quantity === 0 && this.price && this.description)
            ) {
              if (confirm("Czy jesteś pewien dokonanych zmian?")) {
                var editedProduct = {
                  category: this.category,
                  brand: this.brand,
                  model: this.model,
                  quantity: this.quantity,
                  price: this.price,
                  description: this.description,
                };

                const response = await axios
                  .put(API_URL + this.editedProductId, editedProduct, {
                    headers: authHeader(),
                  })
                  .catch((error) => {
                    if (!error.response) {
                      alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                      location.reload();
                    }
                    response.status === 200
                      ? this.products.splice(i, 1)
                      : alert("Błąd serwera. Spróbuj ponownie za chwilę.");
                  });

                this.products[i].category = this.category;
                this.products[i].brand = this.brand;
                this.products[i].model = this.model;
                this.products[i].quantity = this.quantity;
                this.products[i].price = this.price;
                this.products[i].description = this.description;

                this.showProductForm = !this.showProductForm;
              }
            } else {
              alert("Wypełnij wszystkie pola");
            }
          }
        }
      }
    },
    async addProduct() {
      if (
        this.category &&
        this.brand &&
        this.model &&
        this.quantity &&
        this.price &&
        this.description
      ) {
        if (confirm("Czy jesteś pewien wprwoadzonych danych?")) {
          var newProduct = {
            category: this.category,
            brand: this.brand,
            model: this.model,
            quantity: this.quantity,
            price: this.price,
            description: this.description,
          };

          const response = await axios
            .post(API_URL, newProduct, { headers: authHeader() })
            .catch((error) => {
              if (!error.response) {
                alert("Błąd sieci. Spróbuj ponownie za chwilę.");
                location.reload();
              }
              response.status === 200
                ? this.products.splice(i, 1)
                : alert("Błąd serwera. Spróbuj ponownie za chwilę.");
            });
          this.showProductForm = !this.showProductForm;

          newProduct.id = await response.data;
          this.products.push(newProduct);
        }
      } else {
        alert("Wypełnij wszystkie pola");
      }
    },
    toggleAddProduct() {
      this.showProductForm = !this.showProductForm;
      this.showEditProduct = false;
      this.showAddProduct = true;
      this.category = "";
      this.brand = "";
      this.model = "";
      this.quantity = "";
      this.price = "";
      this.description = "";
      this.editedProductId = "";
    },
    userHasAccess() {
      const user = sessionStorage.getItem("user");
      if (!user) {
        this.$router.push("/signin");
      } else {
        this.token = JSON.parse(user).token;
        this.claims = VueJwtDecode.decode(this.token);
        if (this.claims.Role != "Seller") {
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
#editedProduct {
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