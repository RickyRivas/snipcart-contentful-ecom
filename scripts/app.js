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
            products.forEach(prod => {
                response.push(prod)
            })
            console.log(response)
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
                 <button class='view-btn btn btn-light' data-id=${product.id}>View Item</button>

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