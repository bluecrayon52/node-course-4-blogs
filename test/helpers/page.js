const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

const puppeteer = require('puppeteer'); 

//----------------Page Proxy-------------------------
class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: false
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);
        return new Proxy(customPage, {
            get: function(target, property) {
                // browser included to open and close via proxy 
                return customPage[property] || browser[property] || page[property]; 
            }
        });
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user); 

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('localhost:3000/blogs');             // refresh page
        await this.page.waitFor('a[href="/auth/logout"]');  // let the page finish rendering 
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML); 
    }

    post(path, data) {
        return this.page.evaluate(
            (_path, _data) => {
                return fetch(_path, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({title: _data.title , content: _data.content})
                }).then( res => res.json()); 
            }, path, data);
    }

    get(path) {
        return this.page.evaluate(
            (_path) => {
                return fetch(_path, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json()); 
            }, path);
    }

    execRequests(actions) {
        return Promise.all(
            actions.map(({method, path, data}) => {
                return this[method](path, data); 
            })
        );
    }


    constructor(page) {
        this.page = page; 
    }
}

module.exports = CustomPage;