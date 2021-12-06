const client = contentful.createClient({
    // Public consumption to view products => no need to hide. READ ONLY
    space: 'jt4gea9e7d3j',
    accessToken: 'MbIRbPfv5jqe4OXc8WRbTUzYDNhNzMHss9oYLGx-Rt0'
})
// Declare variables
const productsDOM = document.querySelector('.products-center');
const prodModalOverlay = document.querySelector('#prod-modal-overlay');
const purchaseBtn = document.querySelector('.purchase-btn');

class Products {
    async fetchFromCms() {
        try {
            let contentful = await client.getEntries({
                content_type: 'product'
            });

            let products = contentful.items;
            products = products.map(item => {
                const {
                    title,
                    price,
                    description,
                    id
                } = item.fields;
                const image = 'https:' + item.fields.image[0].fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image,
                    description
                }
            })
            // add products to json for snipcart validation
            const response = await fetch('/scripts/products.json')
                .then((res) => res.json());
            // products.forEach(prod => {
            //     response.push(prod)
            // })
            // return prods
            return products
        } catch (err) {
            console.log(err)
        }
    }
}
class Ui {
    displayProducts(products) {
        let result = '';
        const endpoint = 'https://rwde2.netlify.app'
        const folder = 'scripts'
        const fileName = 'products.json'
        products.forEach(product => {
            result += `
            <article class='product'>
                <div class='img-container'>
                    <img src='${product.image}'>
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
        let prodsRef = [];
        products.forEach(prod => {
            const prodObj = {
                title: prod.title,
                price: prod.price,
                id: prod.id,
                image: prod.image,
                desc: prod.description
            }
            prodsRef.push(prodObj)
        });
        //
        const allViewBtns = document.querySelectorAll('.view-btn');
        allViewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                let btnId = btn.dataset.itemId;
                let convertBtnId = parseInt(btnId, 10);
                let prodFromArr = prodsRef.find(prodObj => prodObj.id === convertBtnId);
                // enable modal
                prodModalOverlay.style.display = 'flex'
                // create div
                let prodModal = document.createElement('div');
                prodModal.classList.add('prod-modal')
                // assing div values
                prodModal.innerHTML = `
                    <div class='close-modal'>Close</div>
                    <img src=${prodFromArr.image}></img>
                    <h3>${prodFromArr.title}</h3>
                    <p class='price'>$${prodFromArr.price}</p>
                    <p class='desc'>${prodFromArr.desc}</p>

                    <div class='item-qty'>

                    <button id='plus-qty' class='qty-btn'>+</button>
                    <input type="number" min="1" value="1" class="qty-input">
                    <button id='minus-qty' class='qty-btn'>-</button>

                    </div>

                    <button class='modal-btn btn btn-primary snipcart-add-item'
                    data-item-id=${convertBtnId}
                    data-item-price="${prodFromArr.price}"
                    data-item-description="${prodFromArr.desc}"
                    data-item-image="${prodFromArr.image}"
                    data-item-name='${prodFromArr.title}'
                    data-item-quantity=''
                    >Add to Cart</button>
                `
                //append
                prodModalOverlay.appendChild(prodModal)
                // modal btn logic
                let currentModalBtn = document.querySelector('.modal-btn');
                // modal btn clicked logic
                currentModalBtn.addEventListener('click', (e) => {
                    prodModalOverlay.style.display = 'none';
                    prodModalOverlay.removeChild(prodModal);
                })
                // declare
                let itemQtyInput = document.querySelector('.qty-input');
                const setAttr = (value) => {
                    currentModalBtn.setAttribute('data-item-quantity', value)
                }
                // add / minus
                let addQTy = document.querySelector('#plus-qty').addEventListener('click', () => {
                    itemQtyInput.value++;
                    let finalQtyInput = itemQtyInput.value;
                    setAttr(finalQtyInput);
                })
                let minusQty = document.querySelector('#minus-qty').addEventListener('click', () => {
                    itemQtyInput.value--;
                    let finalQtyInput = itemQtyInput.value;
                    setAttr(finalQtyInput);
                })
                // close modal
                document.querySelector('.close-modal').addEventListener('click', () => {
                    prodModalOverlay.style.display = 'none';
                    prodModalOverlay.removeChild(prodModal);
                })
            })
        })
    }
}
class Storage {
    static saveProducts() {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
}
// Document onload
document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();
    const ui = new Ui();
    // Get all products from class
    products.fetchFromCms().then(products => {
        ui.displayProducts(products);
        ui.viewProduct(products);
    })
});
let userCart = [];
const saveCartLocally = (userCart) => {
    userCart = []
    localStorage.setItem("userCart", JSON.stringify(userCart))
}
// snipcart
document.addEventListener('snipcart.ready', () => {
    // added updated 
    Snipcart.events.on('item.updated', () => {
        // console.log(Snipcart.store.getState().cart.items)
        const snipCartItems = Snipcart.store.getState().cart.items.items;
        // only references the each main object not the count of total items
        snipCartItems.forEach(cartItem => {
            const newObj = {
                title: cartItem.name,
                id: cartItem.id,
                desc: cartItem.description,
                price: cartItem.price,
                image: cartItem.image,
                qty: cartItem.quantity
            }
            userCart.push(newObj)
        })
        saveCartLocally(userCart);
    });
});