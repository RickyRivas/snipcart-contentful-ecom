const client = contentful.createClient({
  // Public consumption to view products => no need to hide. READ ONLY
  space: "",
  accessToken: "",
});
// Declare variables
const productsDOM = document.querySelector(".products-center");
const prodModalOverlay = document.querySelector("#prod-modal-overlay");
const purchaseBtn = document.querySelector(".purchase-btn");

class Products {
  async fetchFromCms() {
    try {
      let contentful = await client.getEntries({
        content_type: "product",
      });

      let products = contentful.items;
      products = products.map((item) => {
        const { title, price, description, id } = item.fields;
        const images = item.fields.image;
        // console.log(images)
        return {
          title,
          price,
          id,
          images,
          description,
        };
      });
      // add products to json for snipcart validation
      const response = await fetch("/scripts/products.json").then((res) =>
        res.json()
      );
      // products.forEach(prod => {
      //     response.push(prod)
      // })
      // return prods
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}
class Ui {
  displayProducts(products) {
    let result = "";
    const endpoint = "";
    const folder = "scripts";
    const fileName = "products.json";
    products.forEach((product) => {
      const prodFirstImg = "https://" + product.images[0].fields.file.url;
      result += `
            <article class='product'>
                <div class='img-container'>
                    <img src='${prodFirstImg}'>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
                <div class='btns'>
                 <button class='view-btn btn btn-light' data-item-id=${product.id}>View Item</button>
                <button 
                class='bag-btn snipcart-add-item' 
                data-item-id="${product.id}" 
                data-item-price="${product.price}"
                data-item-url="${endpoint}/${folder}/${fileName}"
                data-item-description="${product.description}"
                data-item-image="${product.image}"
                data-item-name='${product.title}'
                >Quick Add</button>
                </div>
            </article>
            `;
    });
    productsDOM.innerHTML = result;
  }
  viewProduct(products) {
    const lockBody = () => {
      document.querySelector("body").style.position = "fixed";
    };
    const unlockBody = () => {
      document.querySelector("body").style.position = "unset";
    };
    const allViewBtns = document.querySelectorAll(".view-btn");
    allViewBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        let btnId = btn.dataset.itemId;
        let convertBtnId = parseInt(btnId, 10);
        let prodFromArr = products.find(
          (prodObj) => prodObj.id === convertBtnId
        );
        console.log(prodFromArr);
        let prodImgsArr = [];
        // console.log(prodFromArr)
        function setImage(index) {
          return "https:" + prodFromArr.images[index].fields.file.url;
        }
        // enable modal
        prodModalOverlay.style.display = "flex";
        lockBody();
        // create div
        let prodModal = document.createElement("div");
        prodModal.classList.add("prod-modal");
        // qty input
        let attrQtyValue;
        // assing div values
        prodModal.innerHTML = `
                    <div class='close-modal'>Close</div>
                    <img id='mainImg' src=${setImage(0)}></img>
                    <div id='arr-imgs'>
                     <img class='arr-img' src=${setImage(0)}></img>
                     <img class='arr-img' src=${setImage(1)}></img>
                     <img class='arr-img' src=${setImage(2)}></img>
                    </div>
                    <h3>${prodFromArr.title}</h3>
                    <p class='price'>$${prodFromArr.price}</p>
                    <p class='desc'>${prodFromArr.description}</p>

                    <div class='item-qty'>

                    <button id='plus-qty' class='qty-btn'>+</button>
                    <input type="number" value='1' min='1' max='99' value='1' class="qty-input">
                    <button id='minus-qty' class='qty-btn'>-</button>

                    </div>

                    <button class='modal-btn btn btn-primary snipcart-add-item'
                    data-item-id=${convertBtnId}
                    data-item-price="${prodFromArr.price}"
                    data-item-description="${prodFromArr.description}"
                    data-item-image="${setImage(0)}"
                    data-item-name='${prodFromArr.title}'
                    data-item-quantity='1'
                    >Add to Cart</button>
                `;

        // set
        const setQtyAttr = () => {
          if (qtyInput.value <= 1 || qtyInput.value == NaN) {
            qtyInput.value = 1;
          }
          currentModalBtn.setAttribute("data-item-quantity", qtyInput.value);
        };
        // append
        prodModalOverlay.appendChild(prodModal);
        // Imgs Grid Logic
        const gridDomImgs = document.querySelectorAll("#arr-imgs img");
        gridDomImgs.forEach((img) => {
          img.addEventListener("click", () => {
            let imgSrc = img.src;
            document.querySelector("#mainImg").src = imgSrc;
          });
        });
        // Purchase
        let currentModalBtn = document.querySelector(".modal-btn");
        currentModalBtn.addEventListener("click", () => {
          prodModalOverlay.style.display = "none";
          prodModalOverlay.removeChild(prodModal);
          unlockBody();
        });
        // qty input logic
        let qtyInput = document.querySelector(".qty-input");
        qtyInput.addEventListener("change", () => {
          setQtyAttr();
        });
        let addQtyBtn = document.querySelector("#plus-qty");
        addQtyBtn.addEventListener("click", () => {
          qtyInput.value++;
          setQtyAttr();
        });
        let remQtyBtn = document.querySelector("#minus-qty");
        remQtyBtn.addEventListener("click", () => {
          qtyInput.value--;
          if (qtyInput.value <= 1) {
            qtyInput.value = 1;
          }
          setQtyAttr();
        });
        // close modal
        document.querySelector(".close-modal").addEventListener("click", () => {
          prodModalOverlay.style.display = "none";
          prodModalOverlay.removeChild(prodModal);
          unlockBody();
        });
      });
    });
  }
}

// Document onload
document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const ui = new Ui();
  // Get all products from class
  products.fetchFromCms().then((products) => {
    ui.displayProducts(products);
    ui.viewProduct(products);
  });
});
let userCart = [];
const saveCartLocally = (userCart) => {
  userCart = [];
  localStorage.setItem("userCart", JSON.stringify(userCart));
};
