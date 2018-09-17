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

    constructor(page) {
        this.page = page; 
    }
}

module.exports = CustomPage;