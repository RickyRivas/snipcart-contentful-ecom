const client = contentful.createClient({
    // Public consumption to view products => no need to hide. READ ONLY
    space: 'jt4gea9e7d3j',
    accessToken: 'MbIRbPfv5jqe4OXc8WRbTUzYDNhNzMHss9oYLGx-Rt0'
})
// Declare variables
const productsDOM = document.querySelector('.products-center');
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
                    description
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = 'https:' + item.fields.image[0].fields.file.url;

                return {
                    title,
                    price,
                    id,
                    image,
                    description
                }
            })
            return products
        } catch (err) {
            console.log(err)
        }
    }
}
class Ui {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
                <!-- Single Product -->
            <article class='product'>
                <div class='img-container'>
                    <img src='${product.image}'>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
                <div class='btns'>
                 <button class='view-btn btn btn-light' data-id=${product.id}>View Item</button>
                <button class='bag-btn' data-id=${product.id}>Quick Add</button>
                </div>
            </article>
            <!-- Single Product-->
            `;
        });
        productsDOM.innerHTML = result;
    }
}
// Document onload
document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();
    const ui = new Ui();
    // Get all products from class
    products.fetchFromCms().then(products => {
        ui.displayProducts(products);
    })
});